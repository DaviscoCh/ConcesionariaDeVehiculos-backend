const express = require('express');
const router = express.Router();
const historialController = require('../controllers/historialMantenimiento.controller');
const { authMiddleware } = require('../middleware/auth');

// ========================================
// RUTAS DE HISTORIAL
// ========================================

// Obtener historial por vehículo
router.get('/vehiculo/:id_vehiculo', authMiddleware, historialController.getHistorialByVehiculo);

// Obtener historial por usuario
router.get('/usuario/:id_usuario', authMiddleware, historialController.getHistorialByUsuario);

// Obtener último servicio de un vehículo
router.get('/vehiculo/:id_vehiculo/ultimo', authMiddleware, historialController.getUltimoServicio);

module.exports = router;