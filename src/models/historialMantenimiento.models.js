const pool = require('../config/db');

// ========================================
// CREAR REGISTRO EN HISTORIAL
// ========================================
exports.create = async (historialData) => {
    const { id_vehiculo, id_orden, id_usuario, fecha_servicio, kilometraje, resumen } = historialData;

    const result = await pool.query(
        `INSERT INTO historial_mantenimiento 
     (id_vehiculo, id_orden, id_usuario, fecha_servicio, kilometraje, resumen)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
        [id_vehiculo, id_orden, id_usuario, fecha_servicio, kilometraje, resumen]
    );
    return result.rows[0];
};

// ========================================
// OBTENER HISTORIAL POR VEHÍCULO
// ========================================
exports.getByVehiculo = async (id_vehiculo) => {
    const result = await pool.query(
        `SELECT 
      h.*,
      json_build_object(
        'numero_orden', o.numero_orden,
        'fecha_solicitud', o.fecha_solicitud,
        'fecha_finalizacion', o.fecha_finalizacion,
        'total', o.total,
        'estado', o.estado
      ) as orden,
      json_build_object(
        'correo', u.correo,
        'persona', json_build_object(
          'nombres', p.nombres,
          'apellidos', p.apellidos
        )
      ) as usuario
     FROM historial_mantenimiento h
     LEFT JOIN ordenes_servicio o ON h.id_orden = o.id_orden
     LEFT JOIN usuario u ON h.id_usuario = u.id_usuario
     LEFT JOIN persona p ON u.id_persona = p.id_persona
     WHERE h.id_vehiculo = $1
     ORDER BY h.fecha_servicio DESC`,
        [id_vehiculo]
    );
    return result.rows;
};

// ========================================
// OBTENER HISTORIAL POR USUARIO
// ========================================
exports.getByUsuario = async (id_usuario) => {
    const result = await pool.query(
        `SELECT 
      h.*,
      json_build_object(
        'anio', v.anio,
        'color', v.color,
        'imagen_url', v.imagen_url,
        'modelo', json_build_object(
          'nombre', mo.nombre,
          'marca', json_build_object('nombre', ma.nombre)
        )
      ) as vehiculo,
      json_build_object(
        'numero_orden', o.numero_orden,
        'fecha_solicitud', o.fecha_solicitud,
        'total', o.total,
        'estado', o.estado
      ) as orden
     FROM historial_mantenimiento h
     LEFT JOIN vehiculos v ON h.id_vehiculo = v.id_vehiculo
     LEFT JOIN modelos mo ON v.id_modelo = mo.id_modelo
     LEFT JOIN marcas ma ON mo.id_marca = ma.id_marca
     LEFT JOIN ordenes_servicio o ON h.id_orden = o.id_orden
     WHERE h.id_usuario = $1
     ORDER BY h.fecha_servicio DESC`,
        [id_usuario]
    );
    return result.rows;
};

// ========================================
// OBTENER ÚLTIMO SERVICIO DE UN VEHÍCULO
// ========================================
exports.getUltimoServicio = async (id_vehiculo) => {
    const result = await pool.query(
        `SELECT 
      h.*,
      json_build_object(
        'numero_orden', o.numero_orden,
        'fecha_solicitud', o.fecha_solicitud,
        'total', o.total
      ) as orden
     FROM historial_mantenimiento h
     LEFT JOIN ordenes_servicio o ON h.id_orden = o.id_orden
     WHERE h.id_vehiculo = $1
     ORDER BY h.fecha_servicio DESC
     LIMIT 1`,
        [id_vehiculo]
    );
    return result.rows[0] || null;
};

// ========================================
// ACTUALIZAR HISTORIAL
// ========================================
exports.update = async (id_historial, historialData) => {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(historialData).forEach(key => {
        fields.push(`${key} = $${paramCount}`);
        values.push(historialData[key]);
        paramCount++;
    });

    values.push(id_historial);

    const result = await pool.query(
        `UPDATE historial_mantenimiento 
     SET ${fields.join(', ')}
     WHERE id_historial = $${paramCount}
     RETURNING *`,
        values
    );
    return result.rows[0];
};