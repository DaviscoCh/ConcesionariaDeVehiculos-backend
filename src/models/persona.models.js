const pool = require('../config/db');

exports.findAll = async () => {
  const result = await pool.query('SELECT * FROM persona');
  return result.rows;
};

exports.findById = async (id) => {
  const result = await pool.query('SELECT * FROM persona WHERE id_persona = $1', [id]);
  return result.rows[0];
};

exports.findByCorreo = async (correo) => {
  const correoNormalizado = correo.trim().toLowerCase();
  const result = await pool.query('SELECT * FROM persona WHERE correo = $1 LIMIT 1', [correoNormalizado]);
  return result.rows[0] || null;
};

exports.create = async ({ nombres, apellidos, tipo_documento, documento, correo, direccion, telefono, fecha_nacimiento }) => {
  const existente = await exports.findByCorreo(correo);
  if (existente) {
    throw new Error('Ya existe una persona con ese correo');
  }

  const correoNormalizado = correo.trim().toLowerCase();
  const result = await pool.query(
    `INSERT INTO persona (nombres, apellidos, tipo_documento, documento, correo, direccion, telefono, fecha_nacimiento)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [nombres, apellidos, tipo_documento, documento, correoNormalizado, direccion, telefono, fecha_nacimiento]
  );
  return result.rows[0];
};

exports.update = async (id, { correo, fecha_nacimiento }) => {
  const result = await pool.query(
    'UPDATE persona SET correo = $1, fecha_nacimiento = $2 WHERE id_persona = $3 RETURNING *',
    [correo, fecha_nacimiento, id]
  );
  return result.rows[0];
};

exports.remove = async (id) => {
  const result = await pool.query('DELETE FROM persona WHERE id_persona = $1 RETURNING *', [id]);
  return result.rows[0];
};

exports.searchByName = async (name) => {
  const result = await pool.query('SELECT * FROM persona WHERE nombres ILIKE $1', [`%${name}%`]);
  return result.rows;
};