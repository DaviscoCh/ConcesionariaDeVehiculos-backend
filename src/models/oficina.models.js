const pool = require('../config/db');

// Obtener todas las oficinas
exports.getAll = async () => {
    const result = await pool.query('SELECT * FROM oficinas ORDER BY nombre');
    return result.rows;
};

// Obtener una oficina por ID
exports.getById = async (id) => {
    const result = await pool.query('SELECT * FROM oficinas WHERE id_oficina = $1', [id]);
    return result.rows[0];
};

// Crear una nueva oficina
exports.create = async ({ nombre, direccion }) => {
    const result = await pool.query(
        'INSERT INTO oficinas (nombre, direccion) VALUES ($1, $2) RETURNING *',
        [nombre, direccion]
    );
    return result.rows[0];
};

// Eliminar una oficina
exports.remove = async (id) => {
    const result = await pool.query('DELETE FROM oficinas WHERE id_oficina = $1 RETURNING *', [id]);
    return result.rows[0];
};