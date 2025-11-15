const db = require('../config/db');

// 🧾 Crear una nueva factura
exports.crearFactura = async ({ id_usuario, id_vehiculo, precio, metodo_pago, comentario, id_tarjeta }) => {
    const query = `
    INSERT INTO facturas (id_usuario, id_vehiculo, precio, metodo_pago, comentario, fecha, id_tarjeta)
    VALUES ($1, $2, $3, $4, $5, NOW(), $6)
    RETURNING *;
  `;
    const values = [id_usuario, id_vehiculo, precio, metodo_pago, comentario, id_tarjeta];
    const result = await db.query(query, values);
    return result.rows[0];
};

// 📜 Obtener historial de facturas por usuario
exports.obtenerFacturasPorUsuario = async (id_usuario) => {
    const query = `
    SELECT 
      f.id_factura,
      f.precio,
      f.metodo_pago,
      f.comentario,
      f.fecha,
      m.nombre || ' ' || mo.nombre AS nombre_vehiculo
    FROM facturas f
    JOIN vehiculos v ON f.id_vehiculo = v.id_vehiculo
    JOIN modelos mo ON v.id_modelo = mo.id_modelo
    JOIN marcas m ON mo.id_marca = m.id_marca
    WHERE f.id_usuario = $1
    ORDER BY f.fecha DESC;
  `;
    const result = await db.query(query, [id_usuario]);
    return result.rows;
};