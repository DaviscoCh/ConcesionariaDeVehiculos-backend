const TarjetaModel = require('../models/tarjeta.models');

// 💳 Crear una nueva tarjeta
exports.crearTarjeta = async ({ id_usuario, numero, nombre, vencimiento, cvv, tipo }) => {
    // Validaciones básicas
    if (!numero || !nombre || !vencimiento || !cvv) {
        throw new Error('Todos los campos de la tarjeta son obligatorios');
    }

    // Podrías agregar validaciones de formato aquí si lo deseas

    const tarjeta = await TarjetaModel.crearTarjeta({
        id_usuario,
        numero,
        nombre,
        vencimiento,
        cvv,
        tipo
    });

    return tarjeta;
};

// 📋 Obtener tarjetas del usuario
exports.obtenerTarjetas = async (id_usuario) => {
    return await TarjetaModel.obtenerTarjetasPorUsuario(id_usuario);
};

// 💰 Recargar saldo
exports.recargarSaldo = async ({ id_tarjeta, monto }) => {
    if (!monto || monto <= 0) {
        throw new Error('El monto debe ser mayor a cero');
    }

    const resultado = await TarjetaModel.recargarSaldo({ id_tarjeta, monto });
    return resultado;
};