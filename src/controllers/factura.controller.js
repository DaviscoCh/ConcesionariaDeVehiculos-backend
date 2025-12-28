const Factura = require('../models/factura.models');
const ordenModel = require('../models/ordenServicio.models'); // ✅ AQUÍ AL INICIO
const { enviarFacturaCita, enviarFacturaMantenimiento } = require('../services/email.service'); // ✅ IMPORTAR

// ========================================
//  OBTENER FACTURA POR ID (Para PDF)
// ========================================
exports.obtenerFacturaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const factura = await Factura.obtenerFacturaPorId(id);

        if (!factura) {
            return res.status(404).json({
                error: 'Factura no encontrada'
            });
        }

        res.json({
            message: 'Factura obtenida exitosamente',
            data: factura
        });
    } catch (error) {
        console.error('Error al obtener factura:', error);
        res.status(500).json({
            error: 'Error al obtener la factura'
        });
    }
};

// ========================================
//  OBTENER FACTURA POR ID DE CITA
// ========================================
exports.obtenerFacturaPorCita = async (req, res) => {
    try {
        const { id_cita } = req.params;
        const factura = await Factura.obtenerFacturaPorCita(id_cita);

        if (!factura) {
            return res.status(404).json({
                error: 'No existe factura para esta cita'
            });
        }

        res.json({
            message: 'Factura obtenida exitosamente',
            data: factura
        });
    } catch (error) {
        console.error('Error al obtener factura:', error);
        res.status(500).json({
            error: 'Error al obtener la factura'
        });
    }
};

// ========================================
//  OBTENER HISTORIAL DE FACTURAS DEL USUARIO
// ========================================
exports.obtenerHistorial = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;
        const historial = await Factura.obtenerFacturasPorUsuario(id_usuario);

        res.json({
            message: 'Historial obtenido exitosamente',
            data: historial
        });
    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({
            error: 'Error al obtener historial de facturas'
        });
    }
};

// Obtener facturas por usuario
exports.obtenerFacturasPorUsuario = async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const facturas = await Factura.obtenerFacturasPorUsuario(id_usuario);
        res.status(200).json({ facturas });
    } catch (error) {
        console.error('Error al obtener facturas:', error);
        res.status(500).json({ error: 'Error al obtener facturas' });
    }
};

// ========================================
//  OBTENER FACTURA POR ID DE ORDEN DE SERVICIO
// ========================================
exports.obtenerFacturaPorOrden = async (req, res) => {
    try {
        const { id_orden } = req.params;

        const factura = await Factura.obtenerFacturaPorOrden(id_orden);

        if (!factura) {
            return res.status(404).json({
                error: 'No existe factura para esta orden de servicio'
            });
        }

        // Obtener detalles de servicios y repuestos
        const detalles = await Factura.obtenerDetallesFacturaOrden(id_orden);

        res.json({
            message: 'Factura obtenida exitosamente',
            data: {
                ...factura,
                detalles
            }
        });
    } catch (error) {
        console.error('❌ Error al obtener factura por orden:', error);
        res.status(500).json({
            error: 'Error al obtener la factura',
            detalle: error.message
        });
    }
};

// ========================================
//  GENERAR FACTURA DESDE ORDEN
// ========================================
exports.generarFacturaDesdeOrden = async (req, res) => {
    try {
        const { id_orden } = req.body;

        console.log('📋 Generando factura para orden:', id_orden);

        // Obtener datos de la orden
        const orden = await ordenModel.getById(id_orden);

        if (!orden) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }

        if (orden.estado !== 'Completado') {
            return res.status(400).json({
                error: 'Solo se pueden generar facturas de órdenes completadas'
            });
        }

        if (orden.id_factura_mantenimiento) {
            return res.status(400).json({
                error: 'Esta orden ya tiene una factura generada'
            });
        }

        // Generar factura
        const factura = await Factura.generarFacturaDesdeOrden({
            id_orden: orden.id_orden,
            id_usuario: orden.id_usuario,
            id_vehiculo: orden.id_vehiculo,
            subtotal_mano_obra: orden.subtotal_mano_obra,
            subtotal_repuestos: orden.subtotal_repuestos,
            subtotal: orden.subtotal,
            iva: orden.iva,
            total: orden.total,
            metodo_pago: orden.metodo_pago,
            id_oficina: orden.id_oficina
        });

        console.log('✅ Factura generada:', factura.numero_factura);

        res.status(201).json({
            message: 'Factura generada exitosamente',
            data: factura
        });
    } catch (error) {
        console.error('❌ Error al generar factura:', error);
        res.status(500).json({
            error: 'Error al generar la factura',
            detalle: error.message
        });
    }
};

// ========================================
//  GENERAR FACTURA DESDE ORDEN - CON EMAIL
// ========================================
exports.generarFacturaDesdeOrden = async (req, res) => {
    try {
        const { id_orden } = req.body;

        console.log('📋 Generando factura para orden:', id_orden);

        // Obtener datos de la orden
        const orden = await ordenModel.getById(id_orden);

        if (!orden) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }

        if (orden.estado !== 'Completado') {
            return res.status(400).json({
                error: 'Solo se pueden generar facturas de órdenes completadas'
            });
        }

        if (orden.id_factura_mantenimiento) {
            return res.status(400).json({
                error: 'Esta orden ya tiene una factura generada'
            });
        }

        // Generar factura
        const factura = await Factura.generarFacturaDesdeOrden({
            id_orden: orden.id_orden,
            id_usuario: orden.id_usuario,
            id_vehiculo: orden.id_vehiculo,
            subtotal_mano_obra: orden.subtotal_mano_obra,
            subtotal_repuestos: orden.subtotal_repuestos,
            subtotal: orden.subtotal,
            iva: orden.iva,
            total: orden.total,
            metodo_pago: orden.metodo_pago,
            id_oficina: orden.id_oficina
        });

        console.log('✅ Factura generada:', factura.numero_factura);

        // ✅ ENVIAR EMAIL DE FACTURA
        try {
            // Obtener datos completos de la factura con JOIN
            const facturaCompleta = await Factura.obtenerFacturaPorOrden(id_orden);

            if (facturaCompleta) {
                // Obtener detalles de servicios y repuestos
                const detalles = await Factura.obtenerDetallesFacturaOrden(id_orden);

                await enviarFacturaMantenimiento(facturaCompleta, detalles);
                console.log('📧 Email de factura de mantenimiento enviado');
            }
        } catch (emailError) {
            console.error('⚠️ Error al enviar email (no crítico):', emailError.message);
            // No lanzamos error porque la factura ya se generó exitosamente
        }

        res.status(201).json({
            message: 'Factura generada exitosamente',
            data: factura
        });
    } catch (error) {
        console.error('❌ Error al generar factura:', error);
        res.status(500).json({
            error: 'Error al generar la factura',
            detalle: error.message
        });
    }
};