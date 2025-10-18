const Vehiculo = require('../models/vehiculo.models');

exports.getAll = async (req, res) => {
    try {
        const vehiculos = await Vehiculo.getAll();
        res.json(vehiculos);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const vehiculo = await Vehiculo.getById(req.params.id);
        res.json(vehiculo);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const vehiculo = await Vehiculo.create(req.body);
        res.status(201).json(vehiculo);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const vehiculo = await Vehiculo.update(req.params.id, req.body);
        res.json(vehiculo);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.remove = async (req, res) => {
    try {
        const vehiculo = await Vehiculo.remove(req.params.id);
        res.json(vehiculo);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};