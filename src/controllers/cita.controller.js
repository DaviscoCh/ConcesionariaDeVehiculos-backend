const Cita = require('../models/cita.models');

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
                cita.estado = 'Cancelada'; // reflejar el cambio en la respuesta
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

        const cita = await Cita.actualizarEstado(id, estado);

        res.json({ message: 'Estado actualizado correctamente', cita });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al cambiar el estado' });
    }
};


exports.create = async (req, res) => {
    try {
        console.log('Cita recibida:', req.body); // ✅ Mueve esto arriba
        const { id_usuario, id_vehiculo, id_oficina, fecha, hora, comentario } = req.body;
        const nuevaCita = await Cita.create({ id_usuario, id_vehiculo, id_oficina, fecha, hora, comentario });
        res.status(201).json(nuevaCita);
    } catch (error) {
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

exports.verificarDisponibilidad = async (req, res) => {
    try {
        const { fecha, hora, id_oficina } = req.query;
        if (!fecha || !hora || !id_oficina) {
            return res.status(400).json({ error: 'Faltan parámetros' });
        }

        const disponible = await Cita.verificarDisponibilidad({ fecha, hora, id_oficina });
        res.json({ disponible });
    } catch (error) {
        res.status(500).json({ error: error.message });
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
        // asegúrate de que el middleware de autenticación lo inyecta
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
