const bcrypt = require('bcrypt'); // ⭐ IMPORTANTE
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
// Login de usuario
exports.login = async (req, res) => {
    try {
        console.log('Datos recibidos en login:', req.body);
        const resultado = await loginUsuario(req.body);
        console.log('Resultado del login:', resultado);

        // ✅ CASO 1: Requiere 2FA (nuevo flujo)
        if (resultado.requiresTwoFactor) {
            return res.status(200).json({
                requiresTwoFactor: true,
                message: resultado.message,
                id_usuario: resultado.id_usuario,
                correo: resultado.correo
            });
        }

        // ✅ CASO 2: Login directo sin 2FA (legacy, por si acaso)
        res.status(200).json({
            token: resultado.token,
            rol: resultado.rol,
            usuario: {
                id_usuario: resultado.usuario.id_usuario,
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

// ========================================
// AGREGAR ESTOS MÉTODOS AL FINAL DE usuario.controller.js
// ========================================

const { verificarCodigo2FA, reenviarCodigo2FA } = require('../services/usuario.service');

// Verificar código 2FA
exports.verify2FA = async (req, res) => {
    try {
        const { id_usuario, codigo } = req.body;

        console.log('🔐 Verificando código 2FA:', { id_usuario, codigo });

        if (!id_usuario || !codigo) {
            return res.status(400).json({
                error: 'Se requiere id_usuario y código'
            });
        }

        const resultado = await verificarCodigo2FA({ id_usuario, codigo });

        res.status(200).json(resultado);
    } catch (error) {
        console.error('❌ Error en verificación 2FA:', error);
        res.status(401).json({ error: error.message });
    }
};

// Reenviar código 2FA
exports.resendCode = async (req, res) => {
    try {
        const { id_usuario } = req.body;

        console.log('🔄 Reenviando código para usuario:', id_usuario);

        if (!id_usuario) {
            return res.status(400).json({
                error: 'Se requiere id_usuario'
            });
        }

        const resultado = await reenviarCodigo2FA(id_usuario);

        res.status(200).json(resultado);
    } catch (error) {
        console.error('❌ Error al reenviar código:', error);
        res.status(400).json({ error: error.message });
    }
};