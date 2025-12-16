const historialModel = require('../models/historialMantenimiento.models');

// ========================================
// OBTENER HISTORIAL POR VEHÍCULO
// ========================================
exports.getHistorialByVehiculo = async (req, res) => {
    try {
        const { id_vehiculo } = req.params;
        const historial = await historialModel.getByVehiculo(id_vehiculo);
        res.status(200).json(historial);
    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({ error: 'Error al obtener historial', detalle: error.message });
    }
};

// ========================================
// OBTENER HISTORIAL POR USUARIO
// ========================================
exports.getHistorialByUsuario = async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const historial = await historialModel.getByUsuario(id_usuario);
        res.status(200).json(historial);
    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({ error: 'Error al obtener historial', detalle: error.message });
    }
};

// ========================================
// OBTENER ÚLTIMO SERVICIO DE UN VEHÍCULO
// ========================================
exports.getUltimoServicio = async (req, res) => {
    try {
        const { id_vehiculo } = req.params;
        const ultimoServicio = await historialModel.getUltimoServicio(id_vehiculo);

        if (!ultimoServicio) {
            return res.status(404).json({ mensaje: 'No hay servicios registrados para este vehículo' });
        }

        res.status(200).json(ultimoServicio);
    } catch (error) {
        console.error('Error al obtener último servicio:', error);
        res.status(500).json({ error: 'Error al obtener último servicio', detalle: error.message });
    }
};