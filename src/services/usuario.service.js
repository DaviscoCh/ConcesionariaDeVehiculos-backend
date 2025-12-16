const bcrypt = require('bcrypt');
const pool = require('../config/db');
const Persona = require('../models/persona.models');
const Usuario = require('../models/usuario.models');
const jwt = require('jsonwebtoken');

// ========================================
// REGISTRAR USUARIO
// ========================================
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

    console.log('📝 Registrando usuario:', correo);

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

    console.log('✅ Persona creada con ID:', persona.id_persona);

    // 2️⃣ Hashear contraseña con bcrypt
    console.log('🔐 Hasheando contraseña...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✅ Hash generado:', hashedPassword.substring(0, 20) + '...');

    // 3️⃣ Crear registro en USUARIO
    const usuario = await Usuario.create({
        id_persona: persona.id_persona,
        correo,
        password: hashedPassword,
        estado: 'activo'
    });

    console.log('✅ Usuario creado con ID:', usuario.id_usuario);

    return {
        message: 'Usuario registrado correctamente',
        usuario,
        persona
    };
};

// ========================================
// LOGIN USUARIO (Compatible con ambos tipos)
// ========================================
exports.loginUsuario = async ({ correo, password }) => {
    console.log('🔍 Intentando login para:', correo);

    const result = await pool.query(
        `SELECT u.*, p.nombres, p.apellidos, p.correo
         FROM usuario u
         JOIN persona p ON u.id_persona = p.id_persona
         WHERE p.correo = $1 AND u.estado = 'activo'`,
        [correo]
    );

    const usuario = result.rows[0];

    if (!usuario) {
        console.log('❌ Usuario no encontrado');
        throw new Error('Credenciales inválidas');
    }

    console.log('🔐 Validando contraseña...');
    console.log('Password ingresado:', password);
    console.log('Password en BD:', usuario.password.substring(0, 20) + '...');
    console.log('Longitud password BD:', usuario.password.length);

    let isMatch = false;

    // ✅ Detectar si la contraseña está hasheada con bcrypt
    if (usuario.password.startsWith('$2b$') || usuario.password.startsWith('$2a$')) {
        console.log('🔐 Contraseña hasheada detectada - usando bcrypt. compare()');
        isMatch = await bcrypt.compare(password, usuario.password);
    } else {
        console.log('⚠️ Contraseña en texto plano detectada - comparación directa');
        isMatch = (password === usuario.password);

        // 🔄 Opcional: Actualizar a bcrypt después del login exitoso
        if (isMatch) {
            console.log('🔄 Actualizando contraseña a bcrypt...');
            const hashedPassword = await bcrypt.hash(password, 10);
            await pool.query(
                'UPDATE usuario SET password = $1 WHERE id_usuario = $2',
                [hashedPassword, usuario.id_usuario]
            );
            console.log('✅ Contraseña actualizada a bcrypt');
        }
    }

    console.log('🔐 Resultado de validación:', isMatch);

    if (!isMatch) {
        console.log('❌ Contraseña incorrecta');
        throw new Error('Credenciales inválidas');
    }

    console.log('✅ Login exitoso');

    // Determinar el rol
    const isAdmin = correo.endsWith('@carpremier.com');
    const rol = isAdmin ? 'admin' : 'cliente';

    // Generar token
    const token = jwt.sign({
        id_usuario: usuario.id_usuario,
        rol: rol,
        correo: usuario.correo
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

// ========================================
// OBTENER PERFIL DEL USUARIO AUTENTICADO
// ========================================
exports.getPerfil = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;

        const result = await pool.query(
            `SELECT 
                u.id_usuario,
                u.correo,
                u.estado,
                u. fecha_creacion as usuario_fecha_creacion,
                p. id_persona,
                p. nombres,
                p.apellidos,
                p.tipo_documento,
                p.documento,
                p. telefono,
                p.direccion,
                p.fecha_nacimiento,
                p.fecha_creacion as persona_fecha_creacion
            FROM usuario u
            INNER JOIN persona p ON u.id_persona = p.id_persona
            WHERE u.id_usuario = $1`,
            [id_usuario]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const usuario = result.rows[0];

        res.json({
            id_usuario: usuario.id_usuario,
            correo: usuario.correo,
            estado: usuario.estado,
            nombres: usuario.nombres,
            apellidos: usuario.apellidos,
            tipo_documento: usuario.tipo_documento,
            documento: usuario.documento,
            telefono: usuario.telefono,
            direccion: usuario.direccion,
            fecha_nacimiento: usuario.fecha_nacimiento,
            fecha_creacion: usuario.usuario_fecha_creacion
        });
    } catch (error) {
        console.error('❌ Error al obtener perfil:', error);
        res.status(500).json({ error: 'Error al obtener perfil del usuario' });
    }
};