const Vehiculo = require('../models/vehiculo.models');
const pool = require('../config/db');

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

// Obtener vehículos por marca
exports.getByMarca = async (req, res) => {
    try {
        const { id_marca } = req.params;
        const result = await pool.query(
            `SELECT 
                v.*,
                mo.nombre as modelo,
                ma.nombre as marca,
                ma.descripcion as marca_descripcion
             FROM vehiculos v
             INNER JOIN modelos mo ON v.id_modelo = mo.id_modelo
             INNER JOIN marcas ma ON mo.id_marca = ma.id_marca
             WHERE ma.id_marca = $1
             ORDER BY v.fecha_ingreso DESC`,
            [id_marca]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener vehículos por marca:', error);
        res.status(500).json({ error: 'Error al obtener vehículos' });
    }
};