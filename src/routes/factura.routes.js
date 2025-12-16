const express = require('express');
const router = express.Router();
const facturaController = require('../controllers/factura.controller');
const { authMiddleware } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.get('/historial', authMiddleware, facturaController.obtenerHistorial);
router.post('/generar-orden', authMiddleware, facturaController.generarFacturaDesdeOrden);
router.get('/orden/:id_orden', authMiddleware, facturaController.obtenerFacturaPorOrden);
router.get('/cita/:id_cita', authMiddleware, facturaController.obtenerFacturaPorCita);
router.get('/usuario/:id_usuario', authMiddleware, facturaController.obtenerFacturasPorUsuario);
router.get('/:id', authMiddleware, facturaController.obtenerFacturaPorId);

module.exports = router;