const pool = require('../config/db');

// ========================================
//  CREAR COMPRA DE REPUESTO
// ========================================
exports.create = async (compraData) => {
    const {
        id_usuario,
        id_repuesto,
        id_tarjeta,
        cantidad,
        precio_unitario,
        subtotal,
        iva,
        total
    } = compraData;

    const result = await pool.query(
        `INSERT INTO compras_repuestos (
            id_usuario, id_repuesto, id_tarjeta, cantidad,
            precio_unitario, subtotal, iva, total,
            numero_factura
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 
                'REP-' || nextval('repuesto_factura_seq'))
        RETURNING *`,
        [id_usuario, id_repuesto, id_tarjeta, cantidad, precio_unitario, subtotal, iva, total]
    );
    return result.rows[0];
};

// ========================================
//  OBTENER COMPRAS POR USUARIO
// ========================================
exports.getByUsuario = async (id_usuario) => {
    const result = await pool.query(
        `SELECT 
            c.*,
            r.nombre as nombre_repuesto,
            r.categoria,
            r.imagen_url,
            t.numero as numero_tarjeta
         FROM compras_repuestos c
         INNER JOIN repuestos r ON c.id_repuesto = r.id_repuesto
         LEFT JOIN tarjetas t ON c.id_tarjeta = t.id_tarjeta
         WHERE c.id_usuario = $1
         ORDER BY c.fecha_compra DESC`,
        [id_usuario]
    );
    return result.rows;
};

// ========================================
//  OBTENER COMPRA POR ID (Para factura detallada)
// ========================================
exports.getById = async (id_compra) => {
    const result = await pool.query(
        `SELECT 
            c.*,
            r.nombre as nombre_repuesto,
            r.descripcion as descripcion_repuesto,
            r.categoria,
            r.imagen_url,
            p.nombres,
            p.apellidos,
            p.documento,
            p.correo,
            p.telefono,
            p.direccion,
            t.numero as numero_tarjeta,
            t.tipo as tipo_tarjeta
         FROM compras_repuestos c
         INNER JOIN repuestos r ON c.id_repuesto = r.id_repuesto
         INNER JOIN usuario u ON c.id_usuario = u.id_usuario
         INNER JOIN persona p ON u.id_persona = p.id_persona
         LEFT JOIN tarjetas t ON c.id_tarjeta = t.id_tarjeta
         WHERE c.id_compra = $1`,
        [id_compra]
    );
    return result.rows[0];
};

// ========================================
//  OBTENER TODAS LAS COMPRAS (ADMIN)
// ========================================
exports.getAll = async () => {
    const result = await pool.query(
        `SELECT 
            c.*,
            r.nombre as nombre_repuesto,
            r.categoria,
            p.nombres || ' ' || p.apellidos as nombre_usuario,
            p.correo
         FROM compras_repuestos c
         INNER JOIN repuestos r ON c.id_repuesto = r.id_repuesto
         INNER JOIN usuario u ON c.id_usuario = u.id_usuario
         INNER JOIN persona p ON u.id_persona = p.id_persona
         ORDER BY c.fecha_compra DESC`
    );
    return result.rows;
};