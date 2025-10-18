const Marca = require('../models/marca.models');

exports.getAll = async (req, res) => {
  try {
    const marcas = await Marca.getAll();
    res.json(marcas);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const marca = await Marca.create(req.body);
    res.status(201).json(marca);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const marca = await Marca.update(req.params.id, req.body);
    res.json(marca);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const marca = await Marca.remove(req.params.id);
    res.json(marca);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};