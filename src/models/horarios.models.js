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
//  ENCONTRAR EL MEJOR HORARIO DISPONIBLE (CORREGIDO)
//  LÓGICA: 
//  1. Priorizar la fecha más cercana
//  2. Dentro de esa fecha, la hora más temprana disponible
//  3. Usar zona horaria de Ecuador (America/Guayaquil)
// ---------------------------------------------
exports.getMejorHorarioDisponible = async () => {
    // Obtener fecha y hora actual en zona horaria de Ecuador
    const formatter = new Intl.DateTimeFormat('es-EC', {
        timeZone: 'America/Guayaquil',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    const partes = formatter.formatToParts(new Date());
    const obtenerValor = (tipo) => partes.find(p => p.type === tipo)?.value;

    const año = obtenerValor('year');
    const mes = obtenerValor('month');
    const dia = obtenerValor('day');
    const hora = parseInt(obtenerValor('hour'));
    const minuto = parseInt(obtenerValor('minute'));

    const fechaActual = `${año}-${mes}-${dia}`;

    // Calcular la PRÓXIMA hora disponible considerando minutos
    let horaSiguiente = hora;
    if (minuto > 0) {
        horaSiguiente += 1;
    }

    const horaActualStr = horaSiguiente.toString().padStart(2, '0') + ':00:00';

    console.log(`🕐 Hora actual (Ecuador): ${fechaActual} ${hora}:${minuto}`);
    console.log(`🕐 Buscando desde: ${fechaActual} ${horaActualStr}`);

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
                TO_TIMESTAMP(h.fecha::text || ' ' || h.hora::text, 'YYYY-MM-DD HH24:MI:SS') 
                >= TO_TIMESTAMP($1 || ' ' || $2, 'YYYY-MM-DD HH24:MI:SS')
            )
        ORDER BY 
            h.fecha ASC,
            h.hora ASC,
            h.id_oficina ASC
        LIMIT 1
    `;

    const result = await pool.query(query, [fechaActual, horaActualStr]);

    if (result.rows[0]) {
        console.log(`✅ Mejor horario: ${result.rows[0].fecha} ${result.rows[0].hora} - ${result.rows[0].nombre_oficina}`);
    }

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