const pool = require('../config/db');

// ========================================
// CREAR DETALLE (Servicio o Repuesto)
// ========================================
exports.create = async (detalleData) => {
    const { id_orden, tipo_item, id_servicio, id_repuesto, descripcion, cantidad, precio_unitario, subtotal } = detalleData;

    const result = await pool.query(
        `INSERT INTO ordenes_servicio_detalle 
     (id_orden, tipo_item, id_servicio, id_repuesto, descripcion, cantidad, precio_unitario, subtotal)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
        [id_orden, tipo_item, id_servicio, id_repuesto, descripcion, cantidad, precio_unitario, subtotal]
    );
    return result.rows[0];
};

// ========================================
// CREAR MÚLTIPLES DETALLES
// ========================================
exports.createMultiple = async (detallesArray) => {
    const results = [];
    for (const detalle of detallesArray) {
        const result = await exports.create(detalle);
        results.push(result);
    }
    return results;
};

// ========================================
// OBTENER DETALLES POR ORDEN
// ========================================
exports.getByOrden = async (id_orden) => {
    const result = await pool.query(
        `SELECT 
      d.id_detalle,
      d.id_orden,
      d.tipo_item,
      d.id_servicio,
      d.id_repuesto,
      d.descripcion,
      CAST(d.cantidad AS INTEGER) as cantidad,
      CAST(d.precio_unitario AS DECIMAL(10,2)) as precio_unitario,
      CAST(d.subtotal AS DECIMAL(10,2)) as subtotal,
      d.created_at,
      s.nombre as servicio_nombre,
      s.descripcion as servicio_descripcion,
      s.categoria as servicio_categoria,
      r.nombre as repuesto_nombre,
      r. descripcion as repuesto_descripcion,
      r.categoria as repuesto_categoria
     FROM ordenes_servicio_detalle d
     LEFT JOIN servicios_mantenimiento s ON d.id_servicio = s.id_servicio
     LEFT JOIN repuestos r ON d.id_repuesto = r.id_repuesto
     WHERE d.id_orden = $1
     ORDER BY d.created_at`,
        [id_orden]
    );

    // Formatear respuesta y asegurar tipos numéricos
    return result.rows.map(row => ({
        id_detalle: row.id_detalle,
        id_orden: row.id_orden,
        tipo_item: row.tipo_item,
        id_servicio: row.id_servicio,
        id_repuesto: row.id_repuesto,
        descripcion: row.descripcion,
        cantidad: parseInt(row.cantidad) || 0,
        precio_unitario: parseFloat(row.precio_unitario) || 0,
        subtotal: parseFloat(row.subtotal) || 0,
        created_at: row.created_at,
        servicio: row.servicio_nombre ? {
            nombre: row.servicio_nombre,
            descripcion: row.servicio_descripcion,
            categoria: row.servicio_categoria
        } : null,
        repuesto: row.repuesto_nombre ? {
            nombre: row.repuesto_nombre,
            descripcion: row.repuesto_descripcion,
            categoria: row.repuesto_categoria
        } : null
    }));
};

// ========================================
// ACTUALIZAR DETALLE
// ========================================
exports.update = async (id_detalle, detalleData) => {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(detalleData).forEach(key => {
        fields.push(`${key} = $${paramCount}`);
        values.push(detalleData[key]);
        paramCount++;
    });

    values.push(id_detalle);

    const result = await pool.query(
        `UPDATE ordenes_servicio_detalle 
     SET ${fields.join(', ')}
     WHERE id_detalle = $${paramCount}
     RETURNING *`,
        values
    );
    return result.rows[0];
};

// ========================================
// ELIMINAR DETALLE
// ========================================
exports.delete = async (id_detalle) => {
    const result = await pool.query(
        `DELETE FROM ordenes_servicio_detalle 
     WHERE id_detalle = $1
     RETURNING *`,
        [id_detalle]
    );
    return result.rows[0];
};

// ========================================
// ELIMINAR TODOS LOS DETALLES DE UNA ORDEN
// ========================================
exports.deleteByOrden = async (id_orden) => {
    const result = await pool.query(
        `DELETE FROM ordenes_servicio_detalle 
     WHERE id_orden = $1
     RETURNING *`,
        [id_orden]
    );
    return result.rows;
};