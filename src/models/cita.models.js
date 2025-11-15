const pool = require('../config/db');

// Obtener todas las citas
exports.getAll = async () => {
    const result = await pool.query('SELECT * FROM citas ORDER BY fecha_creacion DESC');
    return result.rows;
};

// Obtener todas las citas de un usuario con datos del vehículo
exports.getAllByUsuario = async (id_usuario) => {
    const query = `
    SELECT c.*, v.marca, v.modelo, v.anio, v.imagen_url
    FROM citas c
    JOIN vehiculo v ON c.id_vehiculo = v.id_vehiculo
    WHERE c.id_usuario = $1
    ORDER BY c.fecha DESC
  `;
    const result = await pool.query(query, [id_usuario]);
    return result.rows;
};

// Crear una nueva cita
exports.create = async ({ id_usuario, id_vehiculo, id_oficina, fecha, hora, comentario }) => {
    const result = await pool.query(
        `INSERT INTO citas (id_usuario, id_vehiculo, id_oficina, fecha, hora, comentario)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
        [id_usuario, id_vehiculo, id_oficina, fecha, hora, comentario]
    );
    return result.rows[0];
};

// Actualizar una cita (por ejemplo, cambiar estado o comentario)
exports.update = async (id_cita, { fecha, hora, estado, comentario }) => {
    const result = await pool.query(
        `UPDATE citas SET
      fecha = $1,
      hora = $2,
      estado = $3,
      comentario = $4
     WHERE id_cita = $5
     RETURNING *`,
        [fecha, hora, estado, comentario, id_cita]
    );
    return result.rows[0];
};

// Eliminar una cita
exports.remove = async (id_cita) => {
    const result = await pool.query(
        'DELETE FROM citas WHERE id_cita = $1 RETURNING *',
        [id_cita]
    );
    return result.rows[0];
};

exports.verificarDisponibilidad = async ({ fecha, hora, id_oficina }) => {
    const result = await pool.query(
        `SELECT COUNT(*) FROM citas
     WHERE fecha = $1 AND hora = $2 AND id_oficina = $3
     AND estado IN ('Pendiente', 'Confirmada')`,
        [fecha, hora, id_oficina]
    );
    return parseInt(result.rows[0].count) === 0; // true si está disponible
};

exports.obtenerHorasOcupadas = async ({ fecha, id_oficina }) => {
    const result = await pool.query(
        `SELECT hora FROM citas
     WHERE fecha = $1 AND id_oficina = $2
     AND estado IN ('Pendiente', 'Confirmada')`,
        [fecha, id_oficina]
    );
    return result.rows.map(row => row.hora);
};