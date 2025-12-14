const Vehiculo = require('../models/vehiculo.models');

exports.getAll = async (req, res) => {
    try {
        const vehiculos = await Vehiculo.getAll();
        res.json(vehiculos);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getFiltered = async (req, res) => {
    try {
        const filtros = {
            marca: req.query.marca,
            modelo: req.query.modelo,
            anio: req.query.anio,
            tipo: req.query.tipo,
            color: req.query.color,
            precioMin: req.query.precioMin,
            precioMax: req.query.precioMax,
            estado: req.query.estado,
            busqueda: req.query.busqueda
        };

        const vehiculos = await Vehiculo.getFiltered(filtros);
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
        const {
            id_modelo,
            anio,
            color,
            precio,
            tipo,
            estado,
            descripcion,
            fecha_ingreso,
            imagen_url
        } = req.body;

        const vehiculo = await Vehiculo.create({
            id_modelo, // 👈 mapeo correcto
            anio: parseInt(anio),
            color,
            precio: parseFloat(precio),
            tipo,
            estado,
            descripcion,
            fecha_ingreso,
            imagen_url
        });

        res.status(201).json(vehiculo);
    } catch (error) {
        console.error('Error en backend (POST):', error);
        res.status(400).json({ error: error.message, detalle: error.stack });
    }
};

exports.update = async (req, res) => {
    try {
        const {
            id_modelo,
            anio,
            color,
            precio,
            tipo,
            estado,
            descripcion,
            fecha_ingreso,
            imagen_url
        } = req.body;

        const vehiculo = await Vehiculo.update(req.params.id, {
            id_modelo, // 👈 mapeo correcto
            anio: parseInt(anio),
            color,
            precio: parseFloat(precio),
            tipo,
            estado,
            descripcion,
            fecha_ingreso,
            imagen_url
        });
        console.log('PUT recibido en backend');
        console.log('ID:', req.params.id);
        console.log('Body:', req.body);
        res.json(vehiculo);
    } catch (error) {
        console.error('Error en backend (PUT):', error);
        res.status(400).json({ error: error.message, detalle: error.stack });
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