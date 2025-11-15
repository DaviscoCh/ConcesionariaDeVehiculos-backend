const pool = require('../config/db');

exports.getAll = async () => {
    const result = await pool.query(`
    SELECT
      mo.id_modelo,
      mo.id_marca,
      m.nombre AS marca,
      mo.nombre,
      mo.descripcion
    FROM modelos mo
    JOIN marcas m ON mo.id_marca = m.id_marca
  `);
    return result.rows;
};

exports.create = async ({ id_marca, nombre, descripcion }) => {
    const result = await pool.query(
        'INSERT INTO modelos (id_marca, nombre, descripcion) VALUES ($1, $2, $3) RETURNING *',
        [id_marca, nombre, descripcion]
    );
    return result.rows[0];
};

exports.update = async (id_modelo, { id_marca, nombre, descripcion }) => {
    const result = await pool.query(
        `UPDATE modelos
     SET id_marca = $1, nombre = $2, descripcion = $3
     WHERE id_modelo = $4
     RETURNING *`,
        [id_marca, nombre, descripcion, id_modelo]
    );
    return result.rows[0];
};

exports.remove = async (id_modelo) => {
    const result = await pool.query(
        'DELETE FROM modelos WHERE id_modelo = $1 RETURNING *',
        [id_modelo]
    );
    return result.rows[0];
};