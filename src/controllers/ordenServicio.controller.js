const ordenModel = require('../models/ordenServicio.models');
const detalleModel = require('../models/ordenServicioDetalle.models');
const historialModel = require('../models/historialMantenimiento.models');
const servicioModel = require('../models/servicioMantenimiento.models');
const repuestoModel = require('../models/repuesto.models');
const tarjetaModel = require('../models/tarjeta.models');

// ========================================
// CREAR NUEVA ORDEN DE SERVICIO
// ========================================
exports.crearOrden = async (req, res) => {
    try {
        const {
            id_usuario,
            id_vehiculo,
            tipo_servicio,
            descripcion_problema,
            servicios, // Array de {id_servicio, cantidad}
            repuestos, // Array de {id_repuesto, cantidad}
            id_oficina,
            id_cita
        } = req.body;

        // Validaciones básicas
        if (!id_usuario || !id_vehiculo) {
            return res.status(400).json({ error: 'Usuario y vehículo son requeridos' });
        }

        // Verificar que el usuario haya comprado el vehículo
        const facturaVehiculo = await ordenModel.verificarPropiedadVehiculo(id_usuario, id_vehiculo);
        if (!facturaVehiculo) {
            return res.status(403).json({ error: 'No tienes permiso para solicitar servicio para este vehículo' });
        }

        // Calcular costos
        let subtotal_mano_obra = 0;
        let subtotal_repuestos = 0;
        const detalles = [];

        // Procesar servicios seleccionados
        if (servicios && servicios.length > 0) {
            for (const item of servicios) {
                const servicio = await servicioModel.getById(item.id_servicio);
                if (servicio) {
                    const subtotal = servicio.precio_mano_obra * (item.cantidad || 1);
                    subtotal_mano_obra += subtotal;

                    detalles.push({
                        tipo_item: 'Servicio',
                        id_servicio: item.id_servicio,
                        descripcion: servicio.nombre,
                        cantidad: item.cantidad || 1,
                        precio_unitario: servicio.precio_mano_obra,
                        subtotal: subtotal
                    });
                }
            }
        }

        // Procesar repuestos seleccionados
        if (repuestos && repuestos.length > 0) {
            for (const item of repuestos) {
                const repuesto = await repuestoModel.getById(item.id_repuesto);
                if (repuesto) {
                    // Verificar stock
                    if (repuesto.stock < item.cantidad) {
                        return res.status(400).json({
                            error: `Stock insuficiente para ${repuesto.nombre}. Disponible: ${repuesto.stock}`
                        });
                    }

                    const subtotal = repuesto.precio * item.cantidad;
                    subtotal_repuestos += subtotal;

                    detalles.push({
                        tipo_item: 'Repuesto',
                        id_repuesto: item.id_repuesto,
                        descripcion: repuesto.nombre,
                        cantidad: item.cantidad,
                        precio_unitario: repuesto.precio,
                        subtotal: subtotal
                    });
                }
            }
        }

        // Calcular totales
        const subtotal = subtotal_mano_obra + subtotal_repuestos;
        const iva = subtotal * 0.12; // 12% IVA
        const total = subtotal + iva;

        // Crear la orden
        const ordenData = {
            id_usuario,
            id_vehiculo,
            id_factura_vehiculo: facturaVehiculo.id_factura,
            id_oficina,
            id_cita,
            tipo_servicio: tipo_servicio || 'Predeterminado',
            descripcion_problema,
            subtotal_mano_obra,
            subtotal_repuestos,
            subtotal,
            iva,
            total,
            estado: 'Pendiente',
            estado_pago: 'Pendiente'
        };

        const nuevaOrden = await ordenModel.create(ordenData);

        // ✅ NUEVO: Calcular tiempo total estimado
        let tiempoTotalMinutos = 0;
        if (servicios && servicios.length > 0) {
            for (const item of servicios) {
                const servicio = await servicioModel.getById(item.id_servicio);
                if (servicio && servicio.tiempo_estimado) {
                    tiempoTotalMinutos += servicio.tiempo_estimado * (item.cantidad || 1);
                }
            }
        }

        // Guardar tiempo estimado en la orden
        if (tiempoTotalMinutos > 0) {
            await ordenModel.update(nuevaOrden.id_orden, {
                tiempo_estimado_minutos: tiempoTotalMinutos
            });
            nuevaOrden.tiempo_estimado_minutos = tiempoTotalMinutos; // Actualizar objeto
        }

        // Crear detalles
        if (detalles.length > 0) {
            const detallesConOrden = detalles.map(d => ({
                ...d,
                id_orden: nuevaOrden.id_orden
            }));
            await detalleModel.createMultiple(detallesConOrden);
        }

        res.status(201).json({
            mensaje: 'Orden de servicio creada exitosamente',
            orden: nuevaOrden
        });

    } catch (error) {
        console.error('Error al crear orden:', error);
        res.status(500).json({ error: 'Error al crear orden de servicio', detalle: error.message });
    }
};

// ========================================
// PROCESAR PAGO DE ORDEN
// ========================================
exports.procesarPago = async (req, res) => {
    try {
        const { id_orden } = req.params;
        const { id_tarjeta, metodo_pago } = req.body;

        // Obtener la orden
        const orden = await ordenModel.getById(id_orden);
        if (!orden) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }

        if (orden.estado_pago === 'Pagado') {
            return res.status(400).json({ error: 'Esta orden ya fue pagada' });
        }

        // Validar tarjeta si es pago con tarjeta
        if (metodo_pago === 'Tarjeta' && id_tarjeta) {
            const tarjeta = await tarjetaModel.getById(id_tarjeta);
            if (!tarjeta) {
                return res.status(404).json({ error: 'Tarjeta no encontrada' });
            }

            if (tarjeta.id_usuario !== orden.id_usuario) {
                return res.status(403).json({ error: 'Esta tarjeta no pertenece al usuario' });
            }

            if (tarjeta.saldo < orden.total) {
                return res.status(400).json({ error: 'Saldo insuficiente en la tarjeta' });
            }

            // Descontar saldo
            const nuevoSaldo = tarjeta.saldo - orden.total;
            await tarjetaModel.update(id_tarjeta, { saldo: nuevoSaldo });
        }

        // Actualizar orden
        const ordenActualizada = await ordenModel.updatePago(id_orden, {
            metodo_pago,
            id_tarjeta: metodo_pago === 'Tarjeta' ? id_tarjeta : null
        });

        // Cambiar estado a Aprobado si estaba Pendiente
        if (orden.estado === 'Pendiente') {
            await ordenModel.updateEstado(id_orden, 'Aprobado');
        }

        // Descontar stock de repuestos
        const detalles = await detalleModel.getByOrden(id_orden);
        for (const detalle of detalles) {
            if (detalle.tipo_item === 'Repuesto' && detalle.id_repuesto) {
                const repuesto = await repuestoModel.getById(detalle.id_repuesto);
                const nuevoStock = repuesto.stock - detalle.cantidad;
                await repuestoModel.update(detalle.id_repuesto, { stock: nuevoStock });
            }
        }

        res.status(200).json({
            mensaje: 'Pago procesado exitosamente',
            orden: ordenActualizada
        });

    } catch (error) {
        console.error('Error al procesar pago:', error);
        res.status(500).json({ error: 'Error al procesar pago', detalle: error.message });
    }
};

// ========================================
// OBTENER ÓRDENES DEL USUARIO
// ========================================
exports.getOrdenesByUsuario = async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const ordenes = await ordenModel.getAllByUsuario(id_usuario);
        res.status(200).json(ordenes);
    } catch (error) {
        console.error('Error al obtener órdenes:', error);
        res.status(500).json({ error: 'Error al obtener órdenes', detalle: error.message });
    }
};

// ========================================
// OBTENER ORDEN POR ID CON DETALLES
// ========================================
exports.getOrdenById = async (req, res) => {
    try {
        const { id } = req.params;
        const orden = await ordenModel.getById(id);

        if (!orden) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }

        const detalles = await detalleModel.getByOrden(id);

        res.status(200).json({
            ...orden,
            detalles
        });
    } catch (error) {
        console.error('Error al obtener orden:', error);
        res.status(500).json({ error: 'Error al obtener orden', detalle: error.message });
    }
};

// ========================================
// ACTUALIZAR ESTADO DE ORDEN (ADMIN)
// ========================================
exports.updateEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, diagnostico_tecnico } = req.body;

        const datosAdicionales = {};
        if (diagnostico_tecnico) {
            datosAdicionales.diagnostico_tecnico = diagnostico_tecnico;
        }

        const ordenActualizada = await ordenModel.updateEstado(id, estado, datosAdicionales);

        // Si se completa, crear registro en historial
        if (estado === 'Completado') {
            await historialModel.create({
                id_vehiculo: ordenActualizada.id_vehiculo,
                id_orden: ordenActualizada.id_orden,
                id_usuario: ordenActualizada.id_usuario,
                fecha_servicio: new Date().toISOString().split('T')[0],
                resumen: diagnostico_tecnico || 'Servicio completado'
            });

            // ✅ NUEVO: Generar factura automáticamente
            const facturaModel = require('../models/factura. models');

            // Verificar que no exista factura ya
            if (!ordenActualizada.id_factura_mantenimiento) {
                try {
                    await facturaModel.generarFacturaDesdeOrden({
                        id_orden: ordenActualizada.id_orden,
                        id_usuario: ordenActualizada.id_usuario,
                        id_vehiculo: ordenActualizada.id_vehiculo,
                        subtotal_mano_obra: ordenActualizada.subtotal_mano_obra,
                        subtotal_repuestos: ordenActualizada.subtotal_repuestos,
                        subtotal: ordenActualizada.subtotal,
                        iva: ordenActualizada.iva,
                        total: ordenActualizada.total,
                        metodo_pago: ordenActualizada.metodo_pago,
                        id_oficina: ordenActualizada.id_oficina
                    });
                    console.log(`✅ Factura generada para orden ${ordenActualizada.numero_orden}`);
                } catch (error) {
                    console.error('❌ Error al generar factura:', error);
                }
            }
        }

        res.status(200).json({
            mensaje: 'Estado actualizado exitosamente',
            orden: ordenActualizada
        });
    } catch (error) {
        console.error('Error al actualizar estado:', error);
        res.status(500).json({ error: 'Error al actualizar estado', detalle: error.message });
    }
};

// ========================================
// CANCELAR ORDEN
// ========================================
exports.cancelarOrden = async (req, res) => {
    try {
        const { id } = req.params;
        const { motivo } = req.body;

        const orden = await ordenModel.getById(id);
        if (!orden) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }

        if (orden.estado === 'Completado') {
            return res.status(400).json({ error: 'No se puede cancelar una orden completada' });
        }

        const ordenCancelada = await ordenModel.cancelar(id, motivo);

        res.status(200).json({
            mensaje: 'Orden cancelada exitosamente',
            orden: ordenCancelada
        });
    } catch (error) {
        console.error('Error al cancelar orden:', error);
        res.status(500).json({ error: 'Error al cancelar orden', detalle: error.message });
    }
};



// ========================================
// AGREGAR CALIFICACIÓN
// ========================================
exports.addCalificacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { calificacion, comentario } = req.body;

        if (!calificacion || calificacion < 1 || calificacion > 5) {
            return res.status(400).json({ error: 'La calificación debe estar entre 1 y 5' });
        }

        const orden = await ordenModel.getById(id);
        if (!orden) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }

        if (orden.estado !== 'Completado') {
            return res.status(400).json({ error: 'Solo se pueden calificar órdenes completadas' });
        }

        const ordenActualizada = await ordenModel.addCalificacion(id, calificacion, comentario);

        res.status(200).json({
            mensaje: 'Calificación agregada exitosamente',
            orden: ordenActualizada
        });
    } catch (error) {
        console.error('Error al agregar calificación:', error);
        res.status(500).json({ error: 'Error al agregar calificación', detalle: error.message });
    }
};

// ========================================
// OBTENER TODAS LAS ÓRDENES (ADMIN)
// ========================================
exports.getAllOrdenes = async (req, res) => {
    try {
        const { estado, fecha_desde, fecha_hasta } = req.query;

        const filtros = {};
        if (estado) filtros.estado = estado;
        if (fecha_desde) filtros.fecha_desde = fecha_desde;
        if (fecha_hasta) filtros.fecha_hasta = fecha_hasta;

        const ordenes = await ordenModel.getAll(filtros);
        res.status(200).json(ordenes);
    } catch (error) {
        console.error('Error al obtener órdenes:', error);
        res.status(500).json({ error: 'Error al obtener órdenes', detalle: error.message });
    }
};