const Oficina = require('../models/oficina.models');

exports.getAll = async (req, res) => {
    try {
        const oficinas = await Oficina.getAll();
        res.json(oficinas);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { nombre, direccion } = req.body;
        const nueva = await Oficina.create({ nombre, direccion });
        res.status(201).json(nueva);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.remove = async (req, res) => {
    try {
        const eliminada = await Oficina.remove(req.params.id);
        res.json(eliminada);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};