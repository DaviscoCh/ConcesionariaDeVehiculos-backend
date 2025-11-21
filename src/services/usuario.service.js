const pool = require('../config/db');
const Persona = require('../models/persona.models');
const Usuario = require('../models/usuario.models');
const jwt = require('jsonwebtoken');

// Registrar usuario
exports.registrarUsuario = async (datos) => {
    const {
        correo,
        password,
        nombres,
        apellidos,
        tipo_documento,
        documento,
        direccion,
        telefono,
        fecha_nacimiento
    } = datos;

    // 1️⃣ Crear registro en PERSONA
    const persona = await Persona.create({
        nombres,
        apellidos,
        tipo_documento,
        documento,
        correo,
        direccion,
        telefono,
        fecha_nacimiento
    });

    // 2️⃣ Crear registro en USUARIO con contraseña hasheada
    const hashedPassword = await bcrypt.hash(password, 10);
    const usuario = await Usuario.create({
        id_persona: persona.id_persona,
        correo,
        password: hashedPassword,
        estado: 'activo'
    });

    return {
        message: 'Usuario registrado correctamente',
        usuario,
        persona
    };
};

// Login de usuario
exports.loginUsuario = async ({ correo, password }) => {
    const result = await pool.query(
        `SELECT u.*, p.nombres, p.apellidos, p.correo
     FROM usuario u
     JOIN persona p ON u.id_persona = p.id_persona
     WHERE p.correo = $1 AND u.estado = 'activo'`,
        [correo]
    );

    const usuario = result.rows[0];
    if (!usuario) {
        throw new Error('Credenciales inválidas');
    }

    if (password !== usuario.password) {
        throw new Error('Credenciales inválidas');
    }

    const isAdmin = correo.endsWith('@carpremier.com');
    const rol = isAdmin ? 'admin' : 'usuario';

    const token = jwt.sign({
        id_usuario: usuario.id_usuario,
        rol: usuario.rol,
        rol: rol,
        correo: usuario.correo // ✅ esto es lo que falta
    }, process.env.JWT_SECRET, { expiresIn: '2h' });

    return {
        token,
        rol,
        usuario: {
            id_usuario: usuario.id_usuario,
            nombres: usuario.nombres,
            apellidos: usuario.apellidos,
            correo: usuario.correo
        }
    };
};