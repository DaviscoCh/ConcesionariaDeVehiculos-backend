const pool = require('../config/db');

// ========================================
//  OBTENER TODOS LOS REPUESTOS
// ========================================
exports.getAll = async () => {
    const result = await pool.query(
        `SELECT * FROM repuestos 
         ORDER BY created_at DESC`
    );
    return result.rows;
};

// ========================================
//  OBTENER REPUESTO POR ID
// ========================================
exports.getById = async (id_repuesto) => {
    const result = await pool.query(
        `SELECT * FROM repuestos WHERE id_repuesto = $1`,
        [id_repuesto]
    );
    return result.rows[0];
};

// ========================================
//  OBTENER REPUESTOS COMPATIBLES CON VEHÍCULOS DEL USUARIO
// ========================================
exports.getRepuestosCompatibles = async (id_usuario) => {
    const result = await pool.query(
        `SELECT DISTINCT r.*
         FROM repuestos r
         WHERE r.estado = 'Disponible' 
         AND r.stock > 0
         AND EXISTS (
             SELECT 1 
             FROM facturas f
             INNER JOIN vehiculos v ON f.id_vehiculo = v.id_vehiculo
             INNER JOIN modelos mo ON v.id_modelo = mo.id_modelo
             INNER JOIN marcas ma ON mo.id_marca = ma.id_marca
             WHERE f.id_usuario = $1
             AND (
                 ma.nombre = ANY(r.marcas_compatibles)
                 OR mo.nombre = ANY(r.modelos_compatibles)
             )
         )
         ORDER BY r.categoria, r.nombre`,
        [id_usuario]
    );
    return result.rows;
};

// ========================================
//  CREAR REPUESTO (ADMIN)
// ========================================
exports.create = async (repuestoData) => {
    const { nombre, descripcion, precio, stock, imagen_url, categoria, marcas_compatibles, modelos_compatibles } = repuestoData;

    const result = await pool.query(
        `INSERT INTO repuestos (
            nombre, descripcion, precio, stock, imagen_url, categoria, 
            marcas_compatibles, modelos_compatibles
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [nombre, descripcion, precio, stock, imagen_url, categoria, marcas_compatibles, modelos_compatibles]
    );
    return result.rows[0];
};

// ========================================
//  ACTUALIZAR REPUESTO (ADMIN)
// ========================================
exports.update = async (id_repuesto, repuestoData) => {
    const { nombre, descripcion, precio, stock, imagen_url, categoria, estado, marcas_compatibles, modelos_compatibles } = repuestoData;

    const result = await pool.query(
        `UPDATE repuestos 
         SET nombre = $1, descripcion = $2, precio = $3, stock = $4, 
             imagen_url = $5, categoria = $6, estado = $7,
             marcas_compatibles = $8, modelos_compatibles = $9
         WHERE id_repuesto = $10
         RETURNING *`,
        [nombre, descripcion, precio, stock, imagen_url, categoria, estado, marcas_compatibles, modelos_compatibles, id_repuesto]
    );
    return result.rows[0];
};

// ========================================
//  ELIMINAR REPUESTO (ADMIN)
// ========================================
exports.delete = async (id_repuesto) => {
    const result = await pool.query(
        `DELETE FROM repuestos WHERE id_repuesto = $1 RETURNING *`,
        [id_repuesto]
    );
    return result.rows[0];
};

// ========================================
//  REDUCIR STOCK AL COMPRAR
// ========================================
exports.reducirStock = async (id_repuesto, cantidad) => {
    const result = await pool.query(
        `UPDATE repuestos 
         SET stock = stock - $1,
             estado = CASE 
                 WHEN (stock - $1) <= 0 THEN 'Agotado'
                 ELSE 'Disponible'
             END
         WHERE id_repuesto = $2 
         AND stock >= $1
         RETURNING *`,
        [cantidad, id_repuesto]
    );
    return result.rows[0];
};

// ========================================
//  OBTENER VEHÍCULOS DEL USUARIO (desde facturas)
// ========================================
exports.getVehiculosUsuario = async (id_usuario) => {
    const result = await pool.query(
        `SELECT DISTINCT
             v.id_vehiculo,
             ma.nombre as marca,
             mo.nombre as modelo,
             v.anio,
             v.color,
             v.imagen_url
         FROM facturas f
         INNER JOIN vehiculos v ON f.id_vehiculo = v.id_vehiculo
         INNER JOIN modelos mo ON v.id_modelo = mo.id_modelo
         INNER JOIN marcas ma ON mo.id_marca = ma.id_marca
         WHERE f.id_usuario = $1
         ORDER BY ma.nombre, mo.nombre`,
        [id_usuario]
    );
    return result.rows;
};