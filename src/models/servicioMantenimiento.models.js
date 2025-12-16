const pool = require('../config/db');

// ========================================
// OBTENER TODOS LOS SERVICIOS
// ========================================
exports.getAll = async () => {
    const result = await pool.query(
        `SELECT * FROM servicios_mantenimiento 
     WHERE estado = 'Activo' 
     ORDER BY categoria, nombre`
    );
    return result.rows;
};

// ========================================
// OBTENER SERVICIOS POR CATEGORÍA
// ========================================
exports.getByCategoria = async (categoria) => {
    const result = await pool.query(
        `SELECT * FROM servicios_mantenimiento 
     WHERE categoria = $1 AND estado = 'Activo'
     ORDER BY nombre`,
        [categoria]
    );
    return result.rows;
};

// ========================================
// OBTENER SERVICIO POR ID
// ========================================
exports.getById = async (id_servicio) => {
    const result = await pool.query(
        `SELECT * FROM servicios_mantenimiento 
     WHERE id_servicio = $1`,
        [id_servicio]
    );
    return result.rows[0];
};

// ========================================
// CREAR NUEVO SERVICIO
// ========================================
exports.create = async (servicioData) => {
    const { nombre, descripcion, categoria, precio_mano_obra, tiempo_estimado, requiere_repuestos, imagen_url } = servicioData;

    const result = await pool.query(
        `INSERT INTO servicios_mantenimiento 
     (nombre, descripcion, categoria, precio_mano_obra, tiempo_estimado, requiere_repuestos, imagen_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
        [nombre, descripcion, categoria, precio_mano_obra, tiempo_estimado, requiere_repuestos, imagen_url]
    );
    return result.rows[0];
};

// ========================================
// ACTUALIZAR SERVICIO
// ========================================
exports.update = async (id_servicio, servicioData) => {
    const { nombre, descripcion, categoria, precio_mano_obra, tiempo_estimado, requiere_repuestos, estado, imagen_url } = servicioData;

    const result = await pool.query(
        `UPDATE servicios_mantenimiento 
     SET nombre = $1, descripcion = $2, categoria = $3, precio_mano_obra = $4,
         tiempo_estimado = $5, requiere_repuestos = $6, estado = $7, imagen_url = $8
     WHERE id_servicio = $9
     RETURNING *`,
        [nombre, descripcion, categoria, precio_mano_obra, tiempo_estimado, requiere_repuestos, estado, imagen_url, id_servicio]
    );
    return result.rows[0];
};

// ========================================
// ELIMINAR SERVICIO (soft delete)
// ========================================
exports.delete = async (id_servicio) => {
    const result = await pool.query(
        `UPDATE servicios_mantenimiento 
     SET estado = 'Inactivo'
     WHERE id_servicio = $1
     RETURNING *`,
        [id_servicio]
    );
    return result.rows[0];
};

// ========================================
// OBTENER CATEGORÍAS ÚNICAS
// ========================================
exports.getCategorias = async () => {
    const result = await pool.query(
        `SELECT DISTINCT categoria 
     FROM servicios_mantenimiento 
     WHERE estado = 'Activo'
     ORDER BY categoria`
    );
    return result.rows.map(row => row.categoria);
};