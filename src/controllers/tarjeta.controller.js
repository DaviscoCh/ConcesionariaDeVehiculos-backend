const TarjetaService = require('../services/tarjeta.service');

// 💳 Crear una nueva tarjeta
exports.crearTarjeta = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario; // viene del middleware auth.js
        const { numero, nombre, vencimiento, cvv, tipo } = req.body;

        const tarjeta = await TarjetaService.crearTarjeta({
            id_usuario,
            numero,
            nombre,
            vencimiento,
            cvv,
            tipo
        });

        res.status(201).json({ mensaje: 'Tarjeta registrada con éxito', tarjeta });
    } catch (error) {
        console.error('Error al crear tarjeta:', error.message);
        res.status(400).json({ error: error.message });
    }
};

// 📋 Obtener tarjetas del usuario
exports.obtenerTarjetas = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;

        const tarjetas = await TarjetaService.obtenerTarjetas(id_usuario);

        res.status(200).json({ tarjetas });
    } catch (error) {
        console.error('Error al obtener tarjetas:', error.message);
        res.status(500).json({ error: 'Error al obtener tarjetas' });
    }
};

// 💰 Recargar saldo
exports.recargarSaldo = async (req, res) => {
    try {
        const { id_tarjeta, monto } = req.body;

        const resultado = await TarjetaService.recargarSaldo({ id_tarjeta, monto });

        res.status(200).json({ mensaje: 'Saldo recargado con éxito', saldo: resultado.saldo });
    } catch (error) {
        console.error('Error al recargar saldo:', error.message);
        res.status(400).json({ error: error.message });
    }
};