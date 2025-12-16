const pool = require('../config/db');

// ========================================
// CREAR NUEVA ORDEN DE SERVICIO
// ========================================
exports.create = async (ordenData) => {
    const {
        id_usuario, id_vehiculo, id_factura_vehiculo, id_oficina, id_cita,
        tipo_servicio, descripcion_problema, subtotal_mano_obra, subtotal_repuestos,
        subtotal, iva, total, estado, estado_pago
    } = ordenData;

    const result = await pool.query(
        `INSERT INTO ordenes_servicio 
     (id_usuario, id_vehiculo, id_factura_vehiculo, id_oficina, id_cita, tipo_servicio, 
      descripcion_problema, subtotal_mano_obra, subtotal_repuestos, subtotal, iva, total, estado, estado_pago)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     RETURNING *`,
        [id_usuario, id_vehiculo, id_factura_vehiculo, id_oficina, id_cita, tipo_servicio,
            descripcion_problema, subtotal_mano_obra, subtotal_repuestos, subtotal, iva, total, estado, estado_pago]
    );
    return result.rows[0];
};

// ========================================
// OBTENER ORDEN POR ID
// ========================================
exports.getById = async (id_orden) => {
    const result = await pool.query(
        `SELECT 
      o. id_orden,
      o. numero_orden,
      o. id_usuario,
      o. id_vehiculo,
      o.id_factura_vehiculo,
      o.id_oficina,
      o.id_cita,
      o.tipo_servicio,
      o. descripcion_problema,
      o.diagnostico_tecnico,
      o.fecha_solicitud,
      o.fecha_inicio,
      o.fecha_finalizacion,
      CAST(o.subtotal_mano_obra AS DECIMAL(10,2)) as subtotal_mano_obra,
      CAST(o. subtotal_repuestos AS DECIMAL(10,2)) as subtotal_repuestos,
      CAST(o.subtotal AS DECIMAL(10,2)) as subtotal,
      CAST(o.iva AS DECIMAL(10,2)) as iva,
      CAST(o.total AS DECIMAL(10,2)) as total,
      o.estado,
      o.metodo_pago,
      o.id_tarjeta,
      o.estado_pago,
      o.fecha_pago,
      o.calificacion,
      o.comentario_cliente,
      o.created_at,
      o.updated_at,
      json_build_object(
        'id_usuario', u.id_usuario,
        'correo', u.correo,
        'persona', json_build_object(
          'nombres', p.nombres,
          'apellidos', p.apellidos,
          'telefono', p.telefono
        )
      ) as usuario,
      json_build_object(
        'id_vehiculo', v.id_vehiculo,
        'anio', v.anio,
        'color', v.color,
        'imagen_url', v. imagen_url,
        'modelo', json_build_object(
          'nombre', mo.nombre,
          'marca', json_build_object('nombre', ma.nombre)
        )
      ) as vehiculo,
      json_build_object(
        'id_oficina', of.id_oficina,
        'nombre', of.nombre,
        'direccion', of.direccion
      ) as oficina
     FROM ordenes_servicio o
     LEFT JOIN usuario u ON o.id_usuario = u.id_usuario
     LEFT JOIN persona p ON u.id_persona = p.id_persona
     LEFT JOIN vehiculos v ON o.id_vehiculo = v.id_vehiculo
     LEFT JOIN modelos mo ON v.id_modelo = mo.id_modelo
     LEFT JOIN marcas ma ON mo.id_marca = ma.id_marca
     LEFT JOIN oficinas of ON o.id_oficina = of.id_oficina
     WHERE o.id_orden = $1`,
        [id_orden]
    );

    if (!result.rows[0]) return null;

    const orden = result.rows[0];
    return {
        ...orden,
        subtotal_mano_obra: parseFloat(orden.subtotal_mano_obra) || 0,
        subtotal_repuestos: parseFloat(orden.subtotal_repuestos) || 0,
        subtotal: parseFloat(orden.subtotal) || 0,
        iva: parseFloat(orden.iva) || 0,
        total: parseFloat(orden.total) || 0
    };
};

// ========================================
// OBTENER TODAS LAS ÓRDENES POR USUARIO
// ========================================
exports.getAllByUsuario = async (id_usuario) => {
    const result = await pool.query(
        `SELECT 
      o. id_orden,
      o.numero_orden,
      o.id_usuario,
      o.id_vehiculo,
      o. id_factura_vehiculo,
      o.id_oficina,
      o.id_cita,
      o.tipo_servicio,
      o.descripcion_problema,
      o. diagnostico_tecnico,
      o.fecha_solicitud,
      o. fecha_inicio,
      o. fecha_finalizacion,
      CAST(o.subtotal_mano_obra AS DECIMAL(10,2)) as subtotal_mano_obra,
      CAST(o.subtotal_repuestos AS DECIMAL(10,2)) as subtotal_repuestos,
      CAST(o.subtotal AS DECIMAL(10,2)) as subtotal,
      CAST(o. iva AS DECIMAL(10,2)) as iva,
      CAST(o.total AS DECIMAL(10,2)) as total,
      o.estado,
      o.metodo_pago,
      o.id_tarjeta,
      o.estado_pago,
      o. fecha_pago,
      o.calificacion,
      o.comentario_cliente,
      o. created_at,
      o.updated_at,
      json_build_object(
        'anio', v.anio,
        'color', v.color,
        'imagen_url', v.imagen_url,
        'modelo', json_build_object(
          'nombre', mo.nombre,
          'marca', json_build_object('nombre', ma. nombre)
        )
      ) as vehiculo,
      json_build_object(
        'nombre', of.nombre,
        'direccion', of.direccion
      ) as oficina
     FROM ordenes_servicio o
     LEFT JOIN vehiculos v ON o.id_vehiculo = v.id_vehiculo
     LEFT JOIN modelos mo ON v.id_modelo = mo. id_modelo
     LEFT JOIN marcas ma ON mo.id_marca = ma.id_marca
     LEFT JOIN oficinas of ON o. id_oficina = of.id_oficina
     WHERE o. id_usuario = $1
     ORDER BY o.fecha_solicitud DESC`,
        [id_usuario]
    );

    // Asegurar conversión a número en JavaScript
    return result.rows.map(orden => ({
        ...orden,
        subtotal_mano_obra: parseFloat(orden.subtotal_mano_obra) || 0,
        subtotal_repuestos: parseFloat(orden.subtotal_repuestos) || 0,
        subtotal: parseFloat(orden.subtotal) || 0,
        iva: parseFloat(orden.iva) || 0,
        total: parseFloat(orden.total) || 0
    }));
};

// ========================================
// OBTENER TODAS LAS ÓRDENES (ADMIN)
// ========================================
exports.getAll = async (filtros = {}) => {
    let query = `
    SELECT 
      o.*,
      json_build_object(
        'correo', u.correo,
        'persona', json_build_object(
          'nombres', p.nombres,
          'apellidos', p.apellidos
        )
      ) as usuario,
      json_build_object(
        'anio', v.anio,
        'color', v.color,
        'modelo', json_build_object(
          'nombre', mo.nombre,
          'marca', json_build_object('nombre', ma.nombre)
        )
      ) as vehiculo,
      json_build_object('nombre', of.nombre) as oficina
    FROM ordenes_servicio o
    LEFT JOIN usuario u ON o.id_usuario = u.id_usuario
    LEFT JOIN persona p ON u.id_persona = p.id_persona
    LEFT JOIN vehiculos v ON o.id_vehiculo = v.id_vehiculo
    LEFT JOIN modelos mo ON v.id_modelo = mo.id_modelo
    LEFT JOIN marcas ma ON mo.id_marca = ma.id_marca
    LEFT JOIN oficinas of ON o.id_oficina = of.id_oficina
    WHERE 1=1
  `;

    const params = [];
    let paramCount = 1;

    if (filtros.estado) {
        query += ` AND o.estado = $${paramCount}`;
        params.push(filtros.estado);
        paramCount++;
    }

    if (filtros.fecha_desde) {
        query += ` AND o.fecha_solicitud >= $${paramCount}`;
        params.push(filtros.fecha_desde);
        paramCount++;
    }

    if (filtros.fecha_hasta) {
        query += ` AND o.fecha_solicitud <= $${paramCount}`;
        params.push(filtros.fecha_hasta);
        paramCount++;
    }

    query += ' ORDER BY o.fecha_solicitud DESC';

    const result = await pool.query(query, params);
    return result.rows;
};

// ========================================
// ACTUALIZAR ORDEN DE SERVICIO
// ========================================
exports.update = async (id_orden, ordenData) => {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(ordenData).forEach(key => {
        fields.push(`${key} = $${paramCount}`);
        values.push(ordenData[key]);
        paramCount++;
    });

    values.push(id_orden);

    const result = await pool.query(
        `UPDATE ordenes_servicio 
     SET ${fields.join(', ')}
     WHERE id_orden = $${paramCount}
     RETURNING *`,
        values
    );
    return result.rows[0];
};

// ========================================
// ACTUALIZAR ESTADO DE LA ORDEN
// ========================================
exports.updateEstado = async (id_orden, nuevoEstado, datosAdicionales = {}) => {
    const updateData = {
        estado: nuevoEstado,
        ...datosAdicionales
    };

    if (nuevoEstado === 'Completado' && !datosAdicionales.fecha_finalizacion) {
        updateData.fecha_finalizacion = new Date();
    }

    if (nuevoEstado === 'En Proceso' && !datosAdicionales.fecha_inicio) {
        updateData.fecha_inicio = new Date();
    }

    return exports.update(id_orden, updateData);
};

// ========================================
// ACTUALIZAR PAGO
// ========================================
exports.updatePago = async (id_orden, datosPago) => {
    const updateData = {
        estado_pago: 'Pagado',
        fecha_pago: new Date(),
        ...datosPago
    };

    return exports.update(id_orden, updateData);
};

// ========================================
// CANCELAR ORDEN
// ========================================
exports.cancelar = async (id_orden, motivo) => {
    return exports.update(id_orden, {
        estado: 'Cancelado',
        comentario_cliente: motivo
    });
};

// ========================================
// AGREGAR CALIFICACIÓN
// ========================================
exports.addCalificacion = async (id_orden, calificacion, comentario) => {
    return exports.update(id_orden, {
        calificacion,
        comentario_cliente: comentario
    });
};

// ========================================
// VERIFICAR SI USUARIO PUEDE SOLICITAR SERVICIO PARA VEHÍCULO
// ========================================
exports.verificarPropiedadVehiculo = async (id_usuario, id_vehiculo) => {
    const result = await pool.query(
        `SELECT id_factura, id_vehiculo 
     FROM facturas 
     WHERE id_usuario = $1 AND id_vehiculo = $2 AND estado = 'Pagada'
     LIMIT 1`,
        [id_usuario, id_vehiculo]
    );
    return result.rows[0] || null;
};