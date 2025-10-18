const Cotizacion = require('../models/cotizacion.models');

exports.getByUsuario = async (req, res) => {
    try {
        const { id_usuario } = req.user;
        const cotizaciones = await Cotizacion.getAllByUsuario(id_usuario);
        res.json(cotizaciones);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { id_usuario } = req.user;
        const { id_vehiculo, precio_cotizado, comentario } = req.body;

        const cotizacion = await Cotizacion.create({
            id_usuario,
            id_vehiculo,
            precio_cotizado,
            comentario
        });

        res.status(201).json(cotizacion);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};