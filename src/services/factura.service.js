const db = require('../config/db');
const FacturaModel = require('../models/factura.models');

// 🧾 Registrar una compra
exports.registrarCompra = async ({ id_usuario, id_vehiculo, precio, metodo_pago, comentario, id_tarjeta }) => {
    // 1. Verificar que el vehículo existe
    const vehiculoQuery = 'SELECT id_vehiculo FROM vehiculos WHERE id_vehiculo = $1';
    const vehiculoResult = await db.query(vehiculoQuery, [id_vehiculo]);

    if (vehiculoResult.rows.length === 0) {
        throw new Error('Vehículo no encontrado');
    }

    // 2. Validar que se haya seleccionado una tarjeta
    if (!id_tarjeta) {
        throw new Error('Debe seleccionar una tarjeta para realizar la compra');
    }

    // 3. Verificar tarjeta y saldo
    const tarjetaQuery = 'SELECT saldo, tipo FROM tarjetas WHERE id_tarjeta = $1 AND id_usuario = $2';
    const tarjetaResult = await db.query(tarjetaQuery, [id_tarjeta, id_usuario]);

    if (tarjetaResult.rows.length === 0) {
        throw new Error('Tarjeta no encontrada o no pertenece al usuario');
    }

    const { saldo, tipo } = tarjetaResult.rows[0];

    if (saldo < precio) {
        throw new Error('Saldo insuficiente en la tarjeta');
    }

    // 4. Descontar saldo si es prepago
    if (tipo === 'prepago') {
        const actualizarSaldoQuery = 'UPDATE tarjetas SET saldo = saldo - $1 WHERE id_tarjeta = $2';
        await db.query(actualizarSaldoQuery, [precio, id_tarjeta]);
    }

    // 5. (Ya no se reduce stock porque cada vehículo es único)

    // 6. Crear la factura
    const factura = await FacturaModel.crearFactura({
        id_usuario,
        id_vehiculo,
        precio,
        metodo_pago,
        comentario,
        id_tarjeta
    });

    let saldoRestante = null;

    if (tipo === 'prepago') {
        const saldoQuery = 'SELECT saldo FROM tarjetas WHERE id_tarjeta = $1';
        const saldoResult = await db.query(saldoQuery, [id_tarjeta]);
        saldoRestante = saldoResult.rows[0].saldo;
    }

    return { factura, saldoRestante };
};

// 📜 Obtener historial de compras del usuario
exports.obtenerHistorial = async (id_usuario) => {
    return await FacturaModel.obtenerFacturasPorUsuario(id_usuario);
};