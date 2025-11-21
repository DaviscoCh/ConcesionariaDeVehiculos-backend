const pool = require('../config/db');

// Obtener todas las citas
exports.getAll = async () => {
    const result = await pool.query('SELECT * FROM citas ORDER BY fecha_creacion DESC');
    return result.rows;
};

exports.getAllAdmin = async () => {
    const query = `
        SELECT 
            c.id_cita,
            c.fecha,
            c.hora,
            c.estado,
            c.comentario,
            c.fecha_creacion,

            -- Datos del usuario
            u.correo,
            p.nombres || ' ' || p.apellidos AS cliente,

            -- Datos del vehículo
            v.tipo,
            v.precio,
            mo.nombre AS modelo,
            ma.nombre AS marca,

            -- Datos de oficina
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

exports.actualizarEstado = async (id_cita, nuevoEstado) => {
    const result = await pool.query(
        `UPDATE citas 
         SET estado = $1
         WHERE id_cita = $2
         RETURNING *`,
        [nuevoEstado, id_cita]
    );
    return result.rows[0];
};

// Obtener todas las citas de un usuario con datos del vehículo
exports.getAllByUsuario = async (id_usuario) => {
    const query = `
        SELECT 
            c.*,
            v.anio,
            v.color,
            v.precio,
            v.tipo,
            v.imagen_url,
            mo.nombre AS modelo,
            ma.nombre AS marca,
            o.nombre AS oficina
        FROM citas c
        JOIN vehiculos v ON c.id_vehiculo = v.id_vehiculo
        JOIN modelos mo ON v.id_modelo = mo.id_modelo
        JOIN marcas ma ON mo.id_marca = ma.id_marca
        JOIN oficinas o ON c.id_oficina = o.id_oficina
        WHERE c.id_usuario = $1
        ORDER BY c.fecha DESC
    `;

    const result = await pool.query(query, [id_usuario]);
    return result.rows;
};

exports.getAllByOficina = async (id_oficina) => {
    const query = `
        SELECT 
            c.*,
            p.nombres || ' ' || p.apellidos AS cliente,
            u.correo AS correo_cliente,
            v.tipo,
            v.precio,
            mo.nombre AS modelo,
            ma.nombre AS marca
        FROM citas c
        JOIN usuario u ON c.id_usuario = u.id_usuario
        JOIN persona p ON u.id_persona = p.id_persona
        JOIN vehiculos v ON c.id_vehiculo = v.id_vehiculo
        JOIN modelos mo ON v.id_modelo = mo.id_modelo
        JOIN marcas ma ON mo.id_marca = ma.id_marca
        WHERE c.id_oficina = $1
        ORDER BY c.fecha, c.hora
    `;
    const result = await pool.query(query, [id_oficina]);
    return result.rows;
};

// Crear una nueva cita
exports.create = async ({ id_usuario, id_vehiculo, id_oficina, fecha, hora, comentario }) => {
    const result = await pool.query(
        `INSERT INTO citas 
        (id_usuario, id_vehiculo, id_oficina, fecha, hora, comentario)
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

exports.getDetalle = async (id_cita) => {
    const result = await pool.query(
        `SELECT * FROM citas WHERE id_cita = $1`,
        [id_cita]
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
    return parseInt(result.rows[0].count) === 0;
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