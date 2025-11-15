const db = require('../config/db');

// 💳 Crear una nueva tarjeta
exports.crearTarjeta = async ({ id_usuario, numero, nombre, vencimiento, cvv, tipo }) => {
    const query = `
    INSERT INTO tarjetas (id_usuario, numero, nombre, vencimiento, cvv, tipo)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
    const values = [id_usuario, numero, nombre, vencimiento, cvv, tipo];
    const result = await db.query(query, values);
    return result.rows[0];
};

// 📋 Obtener todas las tarjetas de un usuario
exports.obtenerTarjetasPorUsuario = async (id_usuario) => {
    const query = `
    SELECT id_tarjeta, numero, nombre, vencimiento, tipo, saldo
    FROM tarjetas
    WHERE id_usuario = $1
    ORDER BY vencimiento ASC;
  `;
    const result = await db.query(query, [id_usuario]);
    return result.rows;
};

// 💰 Recargar saldo en una tarjeta
exports.recargarSaldo = async ({ id_tarjeta, monto }) => {
    const query = `
    UPDATE tarjetas
    SET saldo = saldo + $1
    WHERE id_tarjeta = $2
    RETURNING saldo;
  `;
    const values = [monto, id_tarjeta];
    const result = await db.query(query, values);
    return result.rows[0];
};