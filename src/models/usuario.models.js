const pool = require('../config/db');

// Obtener todos los usuarios
exports.findAll = async () => {
  const result = await pool.query('SELECT * FROM usuario');
  return result.rows;
};

// Obtener usuario por ID
exports.findById = async (id_usuario) => {
  const result = await pool.query('SELECT * FROM usuario WHERE id_usuario = $1', [id_usuario]);
  return result.rows[0];
};

// Obtener usuario por correo (requiere JOIN con persona)
exports.findByCorreo = async (correo) => {
  if (typeof correo !== 'string') return null;

  const correoNormalizado = correo.trim().toLowerCase();
  const result = await pool.query(
    `SELECT * FROM usuario WHERE correo = $1 LIMIT 1`,
    [correoNormalizado]
  );
  return result.rows[0] || null;
};

// Crear nuevo usuario
exports.create = async ({ id_persona, correo, password, estado }) => {
  const result = await pool.query(
    `INSERT INTO usuario (id_persona, correo, password, estado)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [id_persona, correo, password, estado]
  );
  return result.rows[0];
};

// Actualizar estado del usuario
exports.updateEstado = async (id_usuario, estado) => {
  const result = await pool.query(
    'UPDATE usuario SET estado = $1 WHERE id_usuario = $2 RETURNING *',
    [estado, id_usuario]
  );
  return result.rows[0];
};

// Eliminar usuario
exports.remove = async (id_usuario) => {
  const result = await pool.query(
    'DELETE FROM usuario WHERE id_usuario = $1 RETURNING *',
    [id_usuario]
  );
  return result.rows[0];
};

// ========================================
// FUNCIONES PARA 2FA
// ========================================

/**
 * Guardar código 2FA en la base de datos
 */
exports.guardarCodigo2FA = async (id_usuario, codigo) => {
  // El código expira en 5 minutos
  const expiracion = new Date(Date.now() + 5 * 60 * 1000);

  const result = await pool.query(
    `UPDATE usuario 
     SET two_factor_code = $1, two_factor_expires = $2
     WHERE id_usuario = $3
     RETURNING id_usuario, two_factor_code, two_factor_expires`,
    [codigo, expiracion, id_usuario]
  );

  return result.rows[0];
};

/**
 * Verificar código 2FA
 */
exports.verificarCodigo2FA = async (id_usuario, codigo) => {
  const result = await pool.query(
    `SELECT id_usuario, two_factor_code, two_factor_expires
     FROM usuario
     WHERE id_usuario = $1`,
    [id_usuario]
  );

  const usuario = result.rows[0];

  if (!usuario) {
    return { valido: false, mensaje: 'Usuario no encontrado' };
  }

  // Verificar si el código coincide
  if (usuario.two_factor_code !== codigo) {
    return { valido: false, mensaje: 'Código incorrecto' };
  }

  // Verificar si el código no ha expirado
  const ahora = new Date();
  const expiracion = new Date(usuario.two_factor_expires);

  if (ahora > expiracion) {
    return { valido: false, mensaje: 'Código expirado' };
  }

  return { valido: true, mensaje: 'Código válido' };
};

/**
 * Limpiar código 2FA después de usarlo
 */
exports.limpiarCodigo2FA = async (id_usuario) => {
  const result = await pool.query(
    `UPDATE usuario 
     SET two_factor_code = NULL, two_factor_expires = NULL
     WHERE id_usuario = $1
     RETURNING id_usuario`,
    [id_usuario]
  );

  return result.rows[0];
};

/**
 * Habilitar o deshabilitar 2FA para un usuario
 */
exports.toggleTwoFactor = async (id_usuario, enabled) => {
  const result = await pool.query(
    `UPDATE usuario 
     SET two_factor_enabled = $1
     WHERE id_usuario = $2
     RETURNING id_usuario, two_factor_enabled`,
    [enabled, id_usuario]
  );

  return result.rows[0];
};

/**
 * Verificar si un usuario tiene 2FA habilitado
 */
exports.tieneTwoFactorHabilitado = async (id_usuario) => {
  const result = await pool.query(
    `SELECT two_factor_enabled FROM usuario WHERE id_usuario = $1`,
    [id_usuario]
  );

  return result.rows[0]?.two_factor_enabled || false;
};