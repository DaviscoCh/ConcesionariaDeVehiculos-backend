const pool = require('../config/db');

// ---------------------------------------------
//  OBTENER TODAS LAS CITAS
// ---------------------------------------------
exports.getAll = async () => {
    const result = await pool.query(
        'SELECT * FROM citas ORDER BY fecha_creacion DESC'
    );
    return result.rows;
};

// ---------------------------------------------
//  OBTENER CITAS CON DATOS COMPLETOS (ADMIN)
// ---------------------------------------------
exports.getAllAdmin = async () => {
    const query = `
        SELECT 
            c.*,
            u.correo,
            p.nombres || ' ' || p.apellidos AS cliente,
            v.tipo,
            v.precio,
            mo.nombre AS modelo,
            ma.nombre AS marca,
            o.nombre AS oficina
        FROM citas c
        JOIN usuario u ON c.id_usuario = u.id_usuario
        JOIN persona p ON u.id_persona = p.id_persona
        JOIN vehiculos v ON c.id_vehiculo = v.id_vehiculo
        JOIN modelos mo ON v.id_modelo = mo.id_modelo
        JOIN marcas ma ON mo.id_marca = ma.id_marca
        JOIN oficinas o ON c.id_oficina = o.id_oficina
        ORDER BY c.fecha DESC, c.hora DESC
    `;
    const result = await pool.query(query);
    return result.rows;
};

// ---------------------------------------------
//  VERIFICAR SI YA EXISTE UNA CITA EN LA MISMA
//  FECHA - HORA - OFICINA
// ---------------------------------------------
exports.existe = async (id_oficina, fecha, hora) => {
    const result = await pool.query(
        `SELECT 1 FROM citas
         WHERE id_oficina = $1 AND fecha = $2 AND hora = $3`,
        [id_oficina, fecha, hora]
    );
    return result.rows.length > 0;
};

// ---------------------------------------------
//  CREAR CITA
// ---------------------------------------------
exports.create = async ({ id_usuario, id_vehiculo, id_oficina, fecha, hora, comentario }) => {
    const result = await pool.query(
        `INSERT INTO citas (
            id_usuario, id_vehiculo, id_oficina, fecha, hora, comentario, estado
        )
         VALUES ($1, $2, $3, $4, $5, $6, 'Pendiente')
         RETURNING *`,
        [id_usuario, id_vehiculo, id_oficina, fecha, hora, comentario]
    );
    return result.rows[0];
};

// ---------------------------------------------
//  OBTENER HORAS OCUPADAS
// ---------------------------------------------
exports.obtenerHorasOcupadas = async ({ fecha, id_oficina }) => {
    const result = await pool.query(
        `SELECT hora FROM citas
         WHERE fecha = $1 AND id_oficina = $2`,
        [fecha, id_oficina]
    );
    return result.rows.map(r => r.hora);
};

// ---------------------------------------------
//  ACTUALIZAR CITA
// ---------------------------------------------
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

// ---------------------------------------------
//  ELIMINAR CITA
// ---------------------------------------------
exports.remove = async (id_cita) => {
    const result = await pool.query(
        'DELETE FROM citas WHERE id_cita = $1 RETURNING *',
        [id_cita]
    );
    return result.rows[0];
};

exports.getAllByUsuario = async (id_usuario) => {
    const query = `
        SELECT 
            c.*,
            o.nombre AS nombre_oficina,
            v.anio,
            v.color,
            mo.nombre AS modelo,
            ma.nombre AS marca
        FROM citas c
        JOIN oficinas o ON c.id_oficina = o.id_oficina
        JOIN vehiculos v ON c.id_vehiculo = v.id_vehiculo
        JOIN modelos mo ON v.id_modelo = mo.id_modelo
        JOIN marcas ma ON mo.id_marca = ma.id_marca
        WHERE c.id_usuario = $1
        ORDER BY c.fecha DESC, c.hora DESC
    `;
    const result = await pool.query(query, [id_usuario]);
    return result.rows;
};

// ---------------------------------------------
//  ACTUALIZAR SOLO EL ESTADO DE UNA CITA
// ---------------------------------------------
exports.actualizarEstado = async (id_cita, estado) => {
    const result = await pool.query(
        `UPDATE citas SET estado = $1
         WHERE id_cita = $2
         RETURNING *`,
        [estado, id_cita]
    );
    return result.rows[0];
};