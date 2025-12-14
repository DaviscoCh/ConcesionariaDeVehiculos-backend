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


// =============================================
//  🆕 FUNCIONES PARA NOTIFICACIONES DEL ADMIN
// =============================================

// ---------------------------------------------
//  CREAR NOTIFICACIÓN PARA ADMIN
//  (id_usuario = NULL para identificar que es del admin)
// ---------------------------------------------
exports.crearParaAdmin = async ({ id_cita, tipo, titulo, mensaje }) => {
    const result = await pool.query(
        `INSERT INTO notificaciones (id_usuario, id_cita, tipo, titulo, mensaje, leida)
         VALUES (NULL, $1, $2, $3, $4, FALSE)
         RETURNING *`,
        [id_cita, tipo, titulo, mensaje]
    );
    return result.rows[0];
};

// ---------------------------------------------
//  OBTENER NOTIFICACIONES DEL ADMIN
//  (Todas las que tienen id_usuario = NULL)
// ---------------------------------------------
exports.getNotificacionesAdmin = async () => {
    const result = await pool.query(
        `SELECT 
            n.*,
            c.fecha AS fecha_cita,
            c.hora AS hora_cita,
            c.estado AS estado_cita,
            o.nombre AS nombre_oficina,
            o.direccion AS direccion_oficina,
            CONCAT(p.nombres, ' ', p.apellidos) AS nombre_usuario,
            u.correo AS correo_usuario
         FROM notificaciones n
         LEFT JOIN citas c ON n.id_cita = c.id_cita
         LEFT JOIN oficinas o ON c.id_oficina = o.id_oficina
         LEFT JOIN usuario u ON c.id_usuario = u.id_usuario
         LEFT JOIN persona p ON u.id_persona = p.id_persona
         WHERE n.id_usuario IS NULL
         ORDER BY n.fecha_creacion DESC
         LIMIT 50`,
        []
    );
    return result.rows;
};

// ---------------------------------------------
//  OBTENER CONTADOR DE NO LEÍDAS DEL ADMIN
// ---------------------------------------------
exports.getNoLeidasAdmin = async () => {
    const result = await pool.query(
        `SELECT COUNT(*) AS total
         FROM notificaciones
         WHERE id_usuario IS NULL AND leida = FALSE`,
        []
    );
    return parseInt(result.rows[0].total);
};

// ---------------------------------------------
//  MARCAR NOTIFICACIÓN DEL ADMIN COMO LEÍDA
// ---------------------------------------------
exports.marcarLeidaAdmin = async (id_notificacion) => {
    const result = await pool.query(
        `UPDATE notificaciones 
         SET leida = TRUE 
         WHERE id_notificacion = $1 AND id_usuario IS NULL
         RETURNING *`,
        [id_notificacion]
    );
    return result.rows[0];
};

// ---------------------------------------------
//  MARCAR TODAS LAS NOTIFICACIONES DEL ADMIN COMO LEÍDAS
// ---------------------------------------------
exports.marcarTodasLeidasAdmin = async () => {
    const result = await pool.query(
        `UPDATE notificaciones 
         SET leida = TRUE 
         WHERE id_usuario IS NULL AND leida = FALSE
         RETURNING *`,
        []
    );
    return result.rows;
};

// ---------------------------------------------
//  ELIMINAR NOTIFICACIÓN DEL ADMIN
// ---------------------------------------------
exports.eliminarAdmin = async (id_notificacion) => {
    const result = await pool.query(
        `DELETE FROM notificaciones 
         WHERE id_notificacion = $1 AND id_usuario IS NULL
         RETURNING *`,
        [id_notificacion]
    );
    return result.rows[0];
};