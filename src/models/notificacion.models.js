const pool = require('../config/db');

// ---------------------------------------------
//  OBTENER NOTIFICACIONES DE UN USUARIO
// ---------------------------------------------
exports.getByUsuario = async (id_usuario) => {
    const result = await pool.query(
        `SELECT 
            n.*,
            c.fecha AS fecha_cita,
            c.hora AS hora_cita,
            o.nombre AS nombre_oficina
         FROM notificaciones n
         LEFT JOIN citas c ON n.id_cita = c.id_cita
         LEFT JOIN oficinas o ON c.id_oficina = o.id_oficina
         WHERE n.id_usuario = $1
         ORDER BY n.fecha_creacion DESC`,
        [id_usuario]
    );
    return result.rows;
};

// ---------------------------------------------
//  OBTENER NOTIFICACIONES NO LEÍDAS
// ---------------------------------------------
exports.getNoLeidas = async (id_usuario) => {
    const result = await pool.query(
        `SELECT COUNT(*) AS total
         FROM notificaciones
         WHERE id_usuario = $1 AND leida = FALSE`,
        [id_usuario]
    );
    return parseInt(result.rows[0].total);
};

// ---------------------------------------------
//  MARCAR NOTIFICACIÓN COMO LEÍDA
// ---------------------------------------------
exports.marcarLeida = async (id_notificacion) => {
    const result = await pool.query(
        `UPDATE notificaciones 
         SET leida = TRUE 
         WHERE id_notificacion = $1
         RETURNING *`,
        [id_notificacion]
    );
    return result.rows[0];
};

// ---------------------------------------------
//  MARCAR TODAS COMO LEÍDAS
// ---------------------------------------------
exports.marcarTodasLeidas = async (id_usuario) => {
    const result = await pool.query(
        `UPDATE notificaciones 
         SET leida = TRUE 
         WHERE id_usuario = $1 AND leida = FALSE
         RETURNING *`,
        [id_usuario]
    );
    return result.rows;
};

// ---------------------------------------------
//  ELIMINAR NOTIFICACIÓN
// ---------------------------------------------
exports.eliminar = async (id_notificacion) => {
    const result = await pool.query(
        `DELETE FROM notificaciones 
         WHERE id_notificacion = $1 
         RETURNING *`,
        [id_notificacion]
    );
    return result.rows[0];
};

// ---------------------------------------------
//  CREAR NOTIFICACIÓN MANUAL (desde admin)
// ---------------------------------------------
exports.crear = async ({ id_usuario, id_cita, tipo, titulo, mensaje }) => {
    const result = await pool.query(
        `INSERT INTO notificaciones (id_usuario, id_cita, tipo, titulo, mensaje)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [id_usuario, id_cita, tipo, titulo, mensaje]
    );
    return result.rows[0];
};