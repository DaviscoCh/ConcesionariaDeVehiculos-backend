const express = require('express');
const router = express.Router();
const facturaController = require('../controllers/factura.controller');
const { authMiddleware } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.get('/historial', authMiddleware, facturaController.obtenerHistorial);
router.get('/:id', authMiddleware, facturaController.obtenerFacturaPorId);
router.get('/cita/:id_cita', authMiddleware, facturaController.obtenerFacturaPorCita);

module.exports = router;