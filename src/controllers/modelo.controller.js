const Modelo = require('../models/modelo.models');

exports.getAll = async (req, res) => {
  try {
    const modelos = await Modelo.getAll();
    res.json(modelos);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const modelo = await Modelo.create(req.body);
    res.status(201).json(modelo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const modelo = await Modelo.update(req.params.id, req.body);
    res.json(modelo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const modelo = await Modelo.remove(req.params.id);
    res.json(modelo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};