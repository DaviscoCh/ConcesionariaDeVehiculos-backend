const Factura = require('../models/factura.models');

// ========================================
//  OBTENER FACTURA POR ID (Para PDF)
// ========================================
exports.obtenerFacturaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const factura = await Factura.obtenerFacturaPorId(id);

        if (!factura) {
            return res.status(404).json({
                error: 'Factura no encontrada'
            });
        }

        res.json({
            message: 'Factura obtenida exitosamente',
            data: factura
        });
    } catch (error) {
        console.error('Error al obtener factura:', error);
        res.status(500).json({
            error: 'Error al obtener la factura'
        });
    }
};

// ========================================
//  OBTENER FACTURA POR ID DE CITA
// ========================================
exports.obtenerFacturaPorCita = async (req, res) => {
    try {
        const { id_cita } = req.params;
        const factura = await Factura.obtenerFacturaPorCita(id_cita);

        if (!factura) {
            return res.status(404).json({
                error: 'No existe factura para esta cita'
            });
        }

        res.json({
            message: 'Factura obtenida exitosamente',
            data: factura
        });
    } catch (error) {
        console.error('Error al obtener factura:', error);
        res.status(500).json({
            error: 'Error al obtener la factura'
        });
    }
};

// ========================================
//  OBTENER HISTORIAL DE FACTURAS DEL USUARIO
// ========================================
exports.obtenerHistorial = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;
        const historial = await Factura.obtenerFacturasPorUsuario(id_usuario);

        res.json({
            message: 'Historial obtenido exitosamente',
            data: historial
        });
    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({
            error: 'Error al obtener historial de facturas'
        });
    }
};