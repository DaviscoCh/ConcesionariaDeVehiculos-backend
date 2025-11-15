const Cita = require('../models/cita.models');

exports.getAll = async (req, res) => {
    try {
        const citas = await Cita.getAll();
        res.json(citas);
    } catch (error) {
        res.status(400).json({ error: error.message });
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
        const { id_usuario } = req.user; // asegúrate de que el middleware de autenticación lo inyecta
        const citas = await Cita.getAllByUsuario(id_usuario);
        res.json(citas);
    } catch (error) {
        console.error('Error al obtener historial de citas:', error);
        res.status(500).json({ error: error.message });
    }
};
