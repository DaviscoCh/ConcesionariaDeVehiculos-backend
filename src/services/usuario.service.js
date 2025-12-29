const bcrypt = require('bcrypt');
const pool = require('../config/db');
const Persona = require('../models/persona.models');
const Usuario = require('../models/usuario.models');
const jwt = require('jsonwebtoken');
const { generarCodigo2FA, enviarCodigo2FA, enviarNotificacionLogin } = require('./email.service');

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

    // 3️⃣ Crear registro en USUARIO (con 2FA deshabilitado por defecto)
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
// LOGIN USUARIO - FASE 1: VALIDAR CREDENCIALES Y ENVIAR CÓDIGO 2FA
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

    let isMatch = false;

    // ✅ Detectar si la contraseña está hasheada con bcrypt
    if (usuario.password.startsWith('$2b$') || usuario.password.startsWith('$2a$')) {
        console.log('🔐 Contraseña hasheada detectada - usando bcrypt.compare()');
        isMatch = await bcrypt.compare(password, usuario.password);
    } else {
        console.log('⚠️ Contraseña en texto plano detectada - comparación directa');
        isMatch = (password === usuario.password);

        // 🔄 Actualizar a bcrypt después del login exitoso
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

    console.log('✅ Credenciales válidas');

    // ========================================
    // 🔐 FLUJO 2FA
    // ========================================

    // Generar código 2FA de 6 dígitos
    const codigo2FA = generarCodigo2FA();
    console.log('🔑 Código 2FA generado:', codigo2FA);

    // Guardar código en la base de datos (expira en 5 minutos)
    console.log('💾 Intentando guardar código:', { id_usuario: usuario.id_usuario, codigo: codigo2FA });
    await Usuario.guardarCodigo2FA(usuario.id_usuario, codigo2FA);
    console.log('✅ Código guardado exitosamente');

    // Enviar código por correo
    try {
        await enviarCodigo2FA(correo, codigo2FA, usuario.nombres);
        console.log('📧 Código 2FA enviado al correo:', correo);
    } catch (error) {
        console.error('❌ Error al enviar código 2FA:', error);
        throw new Error('Error al enviar código de verificación');
    }

    // ========================================
    // RESPUESTA: Indica que se debe verificar el código
    // ========================================
    return {
        requiresTwoFactor: true,
        message: 'Se ha enviado un código de verificación a tu correo',
        id_usuario: usuario.id_usuario, // Necesario para la verificación
        correo: usuario.correo
    };
};

// ========================================
// VERIFICAR CÓDIGO 2FA - FASE 2: COMPLETAR LOGIN
// ========================================
exports.verificarCodigo2FA = async ({ id_usuario, codigo }) => {
    console.log('🔍 Verificando código 2FA para usuario:', id_usuario);

    // Verificar el código
    const verificacion = await Usuario.verificarCodigo2FA(id_usuario, codigo);

    if (!verificacion.valido) {
        console.log('❌ Código inválido:', verificacion.mensaje);
        throw new Error(verificacion.mensaje);
    }

    console.log('✅ Código 2FA válido');

    // Limpiar código usado
    await Usuario.limpiarCodigo2FA(id_usuario);

    // Obtener datos del usuario
    const result = await pool.query(
        `SELECT u.*, p.nombres, p.apellidos, p.correo
         FROM usuario u
         JOIN persona p ON u.id_persona = p.id_persona
         WHERE u.id_usuario = $1`,
        [id_usuario]
    );

    const usuario = result.rows[0];

    if (!usuario) {
        throw new Error('Usuario no encontrado');
    }

    // Determinar el rol
    const isAdmin = usuario.correo.endsWith('@carpremier.com') ||  // ✅ usuario.correo
        usuario.correo === 'acarpremier@gmail.com';                 // ✅ usuario.correo
    const rol = isAdmin ? 'admin' : 'cliente';

    // Generar token JWT
    const token = jwt.sign({
        id_usuario: usuario.id_usuario,
        rol: rol,
        correo: usuario.correo
    }, process.env.JWT_SECRET, { expiresIn: '2h' });

    // Enviar notificación de login exitoso (opcional)
    try {
        await enviarNotificacionLogin(usuario.correo, usuario.nombres);
    } catch (error) {
        console.error('⚠️ Error al enviar notificación de login:', error);
        // No lanzamos error porque no es crítico
    }

    console.log('✅ Login completado exitosamente');

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
// REENVIAR CÓDIGO 2FA
// ========================================
exports.reenviarCodigo2FA = async (id_usuario) => {
    console.log('🔄 Reenviando código 2FA para usuario:', id_usuario);

    // Obtener datos del usuario
    const usuario = await Usuario.findById(id_usuario);
    if (!usuario) {
        throw new Error('Usuario no encontrado');
    }

    // Obtener datos de persona
    const result = await pool.query(
        `SELECT p.nombres, p.correo
         FROM persona p
         WHERE p.id_persona = $1`,
        [usuario.id_persona]
    );

    const persona = result.rows[0];

    // Generar nuevo código
    const codigo2FA = generarCodigo2FA();
    await Usuario.guardarCodigo2FA(id_usuario, codigo2FA);

    // Enviar por correo
    await enviarCodigo2FA(persona.correo, codigo2FA, persona.nombres);

    console.log('✅ Código reenviado exitosamente');

    return {
        message: 'Código reenviado exitosamente'
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
                u.fecha_creacion as usuario_fecha_creacion,
                u.two_factor_enabled,
                p.id_persona,
                p.nombres,
                p.apellidos,
                p.tipo_documento,
                p.documento,
                p.telefono,
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
            fecha_creacion: usuario.usuario_fecha_creacion,
            two_factor_enabled: usuario.two_factor_enabled
        });
    } catch (error) {
        console.error('❌ Error al obtener perfil:', error);
        res.status(500).json({ error: 'Error al obtener perfil del usuario' });
    }
};