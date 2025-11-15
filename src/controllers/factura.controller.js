const FacturaService = require('../services/factura.service');

// 🧾 Registrar una compra
exports.crearFactura = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario; // viene del middleware auth.js
        const { id_vehiculo, precio, metodo_pago, comentario, id_tarjeta } = req.body;

        const factura = await FacturaService.registrarCompra({
            id_usuario,
            id_vehiculo,
            precio,
            metodo_pago,
            comentario,
            id_tarjeta
        });

        res.status(201).json({ mensaje: 'Compra registrada con éxito', factura: factura.factura, saldoRestante: factura.saldoRestante });
    } catch (error) {
        console.error('Error al registrar factura:', error.message);
        res.status(400).json({ error: error.message });
    }
};

// 📜 Obtener historial de compras del usuario
exports.obtenerHistorial = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;

        const historial = await FacturaService.obtenerHistorial(id_usuario);

        res.status(200).json({ historial });
    } catch (error) {
        console.error('Error al obtener historial:', error.message);
        res.status(500).json({ error: 'Error al obtener historial de compras' });
    }
};