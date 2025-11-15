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