const pool = require('../config/db');

exports.getAll = async () => {
    const result = await pool.query('SELECT * FROM marcas');
    return result.rows;
};

exports.create = async ({ nombre, descripcion }) => {
    const result = await pool.query(
        'INSERT INTO marcas (nombre, descripcion) VALUES ($1, $2) RETURNING *',
        [nombre, descripcion]
    );
    return result.rows[0];
};

exports.update = async (id_marca, { nombre, descripcion }) => {
    const result = await pool.query(
        'UPDATE marcas SET nombre = $1, descripcion = $2 WHERE id_marca = $3 RETURNING *',
        [nombre, descripcion, id_marca]
    );
    return result.rows[0];
};

exports.remove = async (id_marca) => {
    const result = await pool.query(
        'DELETE FROM marcas WHERE id_marca = $1 RETURNING *',
        [id_marca]
    );
    return result.rows[0];
};