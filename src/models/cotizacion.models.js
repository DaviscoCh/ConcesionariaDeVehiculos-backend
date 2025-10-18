const pool = require('../config/db');

// Obtener todas las cotizaciones de un usuario
exports.getAllByUsuario = async (id_usuario) => {
    const result = await pool.query(
        `SELECT c.*, v.placa, v.color, v.precio, v.descripcion
     FROM cotizaciones c
     JOIN vehiculos v ON c.id_vehiculo = v.id_vehiculo
     WHERE c.id_usuario = $1`,
        [id_usuario]
    );
    return result.rows;
};

// Crear una nueva cotización
exports.create = async ({ id_usuario, id_vehiculo, precio_cotizado, comentario }) => {
    const result = await pool.query(
        `INSERT INTO cotizaciones (id_usuario, id_vehiculo, precio_cotizado, comentario)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
        [id_usuario, id_vehiculo, precio_cotizado, comentario]
    );
    return result.rows[0];
};