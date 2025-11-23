const pool = require('../config/db');

exports.getHorariosDisponibles = async ({ fecha, id_oficina }) => {
    const result = await pool.query(
        `SELECT * FROM horarios
         WHERE fecha = $1 AND id_oficina = $2
         ORDER BY hora`,
        [fecha, id_oficina]
    );
    return result.rows;
};

exports.getOcupados = async ({ fecha, id_oficina }) => {
    const result = await pool.query(
        `SELECT hora FROM horarios
         WHERE fecha = $1 AND id_oficina = $2
           AND estado = 'reservado'`,
    [fecha, id_oficina]
    );
    return result.rows.map(r => r.hora);
};

// ---------------------------------------------
//  VERIFICAR ESTADO DEL HORARIO ESPECÍFICO
// ---------------------------------------------
exports.verificarEstado = async ({ id_oficina, fecha, hora }) => {
    const result = await pool.query(
        `SELECT estado FROM horarios
         WHERE id_oficina = $1 AND fecha = $2 AND hora = $3`,
        [id_oficina, fecha, hora]
    );
    return result.rows[0];
};

// ---------------------------------------------
//  MARCAR HORARIO COMO OCUPADO
// ---------------------------------------------
exports.marcarOcupado = async ({ id_oficina, fecha, hora }) => {
    const result = await pool.query(
        `UPDATE horarios SET estado = 'reservado'
         WHERE id_oficina = $1 AND fecha = $2 AND hora = $3
         RETURNING *`,
        [id_oficina, fecha, hora]
    );
    return result.rows[0];
};

// ---------------------------------------------
//  MARCAR HORARIO COMO LIBRE (Usado en Cancelación)
// ---------------------------------------------
exports.marcarLibre = async ({ id_oficina, fecha, hora }) => {
    const result = await pool.query(
        `UPDATE horarios SET estado = 'disponible'
         WHERE id_oficina = $1 AND fecha = $2 AND hora = $3
         RETURNING *`,
        [id_oficina, fecha, hora]
    );
    return result.rows[0];
};

// ---------------------------------------------
//  ENCONTRAR EL MEJOR HORARIO DISPONIBLE (Alternancia CORRECTA)
//  LÓGICA: 
//  1. Priorizar la fecha más cercana
//  2. Dentro de esa fecha, la hora más temprana
//  3. Solo alternar oficinas cuando una hora específica está ocupada
// ---------------------------------------------
exports.getMejorHorarioDisponible = async () => {
    const ahora = new Date();
    const fechaActual = ahora.toISOString().split('T')[0];

    // Redondear hora actual al siguiente intervalo
    const horaActual = new Date(ahora);
    horaActual.setMinutes(0, 0, 0);
    if (ahora.getMinutes() > 0) {
        horaActual.setHours(horaActual.getHours() + 1);
    }
    const horaActualStr = horaActual.toTimeString().split(' ')[0].substring(0, 5);

    const query = `
        SELECT 
            h.id_horario, 
            h.id_oficina, 
            h.fecha, 
            h.hora, 
            o.nombre AS nombre_oficina,
            o.direccion AS direccion_oficina
        FROM horarios h
        JOIN oficinas o ON h.id_oficina = o.id_oficina
        WHERE 
            h.estado = 'disponible'
            AND (
                h.fecha > $1 
                OR (h.fecha = $1 AND h.hora >= $2)
            )
        ORDER BY 
            h.fecha ASC,
            h.hora ASC,
            h.id_oficina ASC
        LIMIT 1
    `;

    const result = await pool.query(query, [fechaActual, horaActualStr]);
    return result.rows[0];
};

// ---------------------------------------------
//  OBTENER TODOS LOS HORARIOS DISPONIBLES DE UN DÍA
//  (útil para el frontend)
// ---------------------------------------------
exports.getHorariosDisponiblesPorDia = async (fecha) => {
    const query = `
        SELECT 
            h.id_horario,
            h.id_oficina,
            h.fecha,
            h.hora,
            h.estado,
            o.nombre AS nombre_oficina,
            o.direccion AS direccion_oficina
        FROM horarios h
        JOIN oficinas o ON h.id_oficina = o.id_oficina
        WHERE h.fecha = $1 AND h.estado = 'disponible'
        ORDER BY h.hora ASC, h.id_oficina ASC
    `;

    const result = await pool.query(query, [fecha]);
    return result.rows;
};

// ---------------------------------------------
//  VERIFICAR SI UNA HORA ESPECÍFICA ESTÁ DISPONIBLE
//  EN ALGUNA OFICINA
// ---------------------------------------------
exports.verificarHoraDisponibleEnAlgunaOficina = async (fecha, hora) => {
    const query = `
        SELECT 
            h.id_oficina,
            o.nombre AS nombre_oficina
        FROM horarios h
        JOIN oficinas o ON h.id_oficina = o.id_oficina
        WHERE h.fecha = $1 
          AND h.hora = $2 
          AND h.estado = 'disponible'
        ORDER BY h.id_oficina ASC
        LIMIT 1
    `;

    const result = await pool.query(query, [fecha, hora]);
    return result.rows[0];
};