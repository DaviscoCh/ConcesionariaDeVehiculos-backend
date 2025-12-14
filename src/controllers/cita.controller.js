const Cita = require('../models/cita.models');
const Horario = require('../models/horarios.models');
const Notificacion = require('../models/notificacion.models');
const Factura = require('../models/factura.models');
const pool = require("../config/db"); // ✅ Cambiar nombre a 'pool'

exports.getAll = async (req, res) => {
    try {
        const citas = await Cita.getAll();
        res.json(citas);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAllAdmin = async (req, res) => {
    try {
        const citas = await Cita.getAllAdmin();
        const ahora = new Date();

        for (const cita of citas) {
            const fechaHora = new Date(`${cita.fecha}T${cita.hora}`);

            if (cita.estado === 'Pendiente' && fechaHora < ahora) {
                await Cita.actualizarEstado(cita.id_cita, 'Cancelada');
                cita.estado = 'Cancelada';
            }
        }

        res.json(citas);
    } catch (error) {
        console.error("ERROR en getAllAdmin:", error);
        res.status(500).json({ message: 'Error al obtener las citas', error });
    }
};

exports.cambiarEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const estadosPermitidos = ['Pendiente', 'Confirmada', 'Atendida', 'Cancelada'];

        if (!estadosPermitidos.includes(estado)) {
            return res.status(400).json({ error: 'Estado inválido' });
        }

        // Actualizar estado de la cita
        const cita = await Cita.actualizarEstado(id, estado);

        // ========================================
        // 🆕 GENERAR FACTURA SI ES "ATENDIDA"
        // ========================================
        if (estado === 'Atendida') {
            try {
                // Verificar si ya existe una factura para esta cita
                const existeFactura = await Factura.existeFacturaParaCita(id);

                if (!existeFactura) {
                    // Obtener información completa de la cita para la factura
                    const queryCitaCompleta = `
                        SELECT 
                            c.*,
                            v.precio
                        FROM citas c
                        INNER JOIN vehiculos v ON c.id_vehiculo = v.id_vehiculo
                        WHERE c.id_cita = $1
                    `;
                    const resultCita = await pool.query(queryCitaCompleta, [id]);
                    const citaCompleta = resultCita.rows[0];

                    // Generar factura automáticamente
                    const factura = await Factura.generarFacturaDesdeCita({
                        id_cita: id,
                        id_usuario: citaCompleta.id_usuario,
                        id_vehiculo: citaCompleta.id_vehiculo,
                        precio: citaCompleta.precio
                    });

                    console.log('✅ Factura generada:', factura.numero_factura);

                    // Crear notificación para el usuario
                    await Notificacion.crear({
                        id_usuario: citaCompleta.id_usuario,
                        id_cita: id,
                        tipo: 'cita_atendida',
                        titulo: '✅ Tu cita ha sido atendida',
                        mensaje: `Tu cita ha sido atendida exitosamente. Factura N° ${factura.numero_factura} generada.`
                    });

                    console.log('✅ Notificación enviada al usuario');
                }
            } catch (facturaError) {
                console.error('❌ Error al generar factura:', facturaError);
                // No detenemos el proceso, solo logueamos el error
            }
        }

        // ========================================
        // LIBERAR HORARIO SI ES "CANCELADA"
        // ========================================
        if (estado === 'Cancelada') {
            await Horario.marcarLibre({
                fecha: cita.fecha,
                hora: cita.hora,
                id_oficina: cita.id_oficina
            });
        }

        res.json({
            message: 'Estado actualizado correctamente',
            cita
        });

    } catch (error) {
        console.error('❌ Error al cambiar el estado:', error);
        res.status(500).json({ error: 'Error al cambiar el estado' });
    }
};

exports.create = async (req, res) => {
    try {
        console.log('📝 Cita recibida:', req.body);
        const { id_usuario, id_vehiculo, id_oficina, fecha, hora, comentario } = req.body;

        // Normalizar fecha (extraer solo YYYY-MM-DD)
        const fechaNormalizada = fecha.includes('T') ? fecha.split('T')[0] : fecha;

        // Normalizar hora (eliminar segundos si vienen)
        const horaNormalizada = hora.includes(':') ? hora.substring(0, 5) : hora;

        console.log('🔍 Verificando horario:', {
            id_oficina,
            fecha: fechaNormalizada,
            hora: horaNormalizada
        });

        // Verificar que el horario esté disponible
        const horarioEstado = await Horario.verificarEstado({
            id_oficina,
            fecha: fechaNormalizada,
            hora: horaNormalizada
        });

        console.log('📊 Estado del horario:', horarioEstado);

        if (!horarioEstado) {
            return res.status(400).json({
                error: 'El horario no existe en el sistema'
            });
        }

        if (horarioEstado.estado !== 'disponible') {  // ✅ minúscula
            return res.status(400).json({
                error: 'El horario seleccionado ya está reservado',
                estadoActual: horarioEstado.estado
            });
        }

        // Crear la cita con fecha normalizada
        const nuevaCita = await Cita.create({
            id_usuario,
            id_vehiculo,
            id_oficina,
            fecha: fechaNormalizada,
            hora: horaNormalizada,
            comentario
        });

        // Marcar el horario como reservado
        await Horario.marcarOcupado({
            id_oficina,
            fecha: fechaNormalizada,
            hora: horaNormalizada
        });

        try {
            await Notificacion.crearParaAdmin({
                id_cita: nuevaCita.id_cita,
                tipo: 'nueva_cita',
                titulo: '📅 Nueva cita agendada',
                mensaje: `Se ha agendado una nueva cita para el ${fechaNormalizada} a las ${horaNormalizada}`
            });
            console.log('✅ Notificación enviada al admin');
        } catch (notifError) {
            console.error('⚠️ Error al crear notificación (no crítico):', notifError.message);
        }

        console.log('✅ Cita creada exitosamente:', nuevaCita.id_cita);
        res.status(201).json(nuevaCita);
    } catch (error) {
        console.error('❌ Error al crear cita:', error);
        res.status(400).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { fecha, hora, estado, comentario } = req.body;
        const citaActualizada = await Cita.update(req.params.id, { fecha, hora, estado, comentario });
        res.json(citaActualizada);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.remove = async (req, res) => {
    try {
        const citaEliminada = await Cita.remove(req.params.id);
        res.json(citaEliminada);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// ---------------------------------------------
//  NUEVO: OBTENER EL MEJOR HORARIO DISPONIBLE
//  (Para autocompletar en el frontend)
// ---------------------------------------------
exports.obtenerMejorHorarioDisponible = async (req, res) => {
    try {
        const horario = await Horario.getMejorHorarioDisponible();

        if (!horario) {
            return res.status(404).json({
                message: 'No hay horarios disponibles en los próximos días'
            });
        }

        res.json({
            id_oficina: horario.id_oficina,
            fecha: horario.fecha,
            hora: horario.hora,
            nombre_oficina: horario.nombre_oficina,
            direccion_oficina: horario.direccion_oficina
        });
    } catch (error) {
        console.error('Error al obtener mejor horario:', error);
        res.status(500).json({ error: error.message });
    }
};

// Obtener horarios disponibles por fecha y oficina
exports.verificarDisponibilidad = async (req, res) => {
    try {
        const { fecha, id_oficina } = req.query;

        if (!fecha || !id_oficina) {
            return res.status(400).json({ error: "Faltan parámetros" });
        }

        // Convertir fecha ISO a formato YYYY-MM-DD si viene con timestamp
        const fechaFormateada = fecha.includes('T') ? fecha.split('T')[0] : fecha;

        // Obtener horarios disponibles desde la tabla horarios usando PostgreSQL
        const result = await pool.query(
            `SELECT hora FROM horarios
             WHERE fecha = $1 
               AND id_oficina = $2 
               AND estado = 'disponible'
             ORDER BY hora ASC`,
            [fechaFormateada, id_oficina]
        );

        const horariosDisponibles = result.rows.map(h => h.hora);

        return res.json({
            disponible: horariosDisponibles.length > 0,
            horarios: horariosDisponibles
        });

    } catch (error) {
        console.error("Error en verificarDisponibilidad:", error);
        return res.status(500).json({ error: "Error interno", detalles: error.message });
    }
};

exports.obtenerHorasOcupadas = async (req, res) => {
    try {
        const { fecha, id_oficina } = req.query;
        if (!fecha || !id_oficina) {
            return res.status(400).json({ error: 'Faltan parámetros' });
        }

        const horas = await Cita.obtenerHorasOcupadas({ fecha, id_oficina });
        res.json({ horas });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getHistorialByUsuario = async (req, res) => {
    try {
        const { id_usuario } = req.usuario;
        const citas = await Cita.getAllByUsuario(id_usuario);
        const ahora = new Date();

        for (const cita of citas) {
            const fechaHora = new Date(`${cita.fecha}T${cita.hora}`);

            if (cita.estado === 'Pendiente' && fechaHora < ahora) {
                await Cita.actualizarEstado(cita.id_cita, 'Cancelada');
                cita.estado = 'Cancelada';
            }
        }

        res.json(citas);
    } catch (error) {
        console.error('Error al obtener historial de citas:', error);
        res.status(500).json({ error: error.message });
    }
};