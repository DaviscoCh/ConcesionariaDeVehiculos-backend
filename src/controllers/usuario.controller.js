const { registrarUsuario, loginUsuario } = require('../services/usuario.service');
const Usuario = require('../models/usuario.models');
const pool = require('../config/db');
const Cotizacion = require('../models/cotizacion.models');


exports.getAll = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Registrar nuevo usuario
exports.registrar = async (req, res) => {
    try {
        console.log('Datos recibidos:', req.body);
        const resultado = await registrarUsuario(req.body);
        res.status(201).json(resultado);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Login de usuario
exports.login = async (req, res) => {
    try {
        console.log('Datos recibidos en login:', req.body);
        const resultado = await loginUsuario(req.body);
        console.log('Resultado del login:', resultado);

        // ✅ Aseguramos que el frontend reciba id_usuario
        res.status(200).json({
            token: resultado.token,
            rol: resultado.rol,
            usuario: {
                id_usuario: resultado.usuario.id_usuario, // ✅ este campo es clave
                nombres: resultado.usuario.nombres,
                apellidos: resultado.usuario.apellidos,
                correo: resultado.usuario.correo
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(401).json({ error: error.message });
    }
};

exports.getPerfil = async (req, res) => {
    try {
        const { correo } = req.usuario; // ✅
        const usuario = await Usuario.findByCorreo(correo);

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({
            id_usuario: usuario.id_usuario,
            nombres: usuario.nombres,
            apellidos: usuario.apellidos,
            correo: usuario.correo,
            estado: usuario.estado
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getCotizaciones = async (req, res) => {
    try {
        const { id_usuario } = req.user;
        const cotizaciones = await Cotizacion.getAllByUsuario(id_usuario);
        res.json(cotizaciones);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.crearCotizacion = async (req, res) => {
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

