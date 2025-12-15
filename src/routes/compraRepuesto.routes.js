const express = require('express');
const router = express.Router();
const compraRepuestoController = require('../controllers/compraRepuesto.controller');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// ========================================
//  RUTAS USUARIO
// ========================================

// Procesar compra de repuesto
router.post('/', authMiddleware, compraRepuestoController.procesarCompra);

// Obtener historial de compras
router.get('/historial', authMiddleware, compraRepuestoController.obtenerHistorial);

// Obtener compra por ID (para factura)
router.get('/:id', authMiddleware, compraRepuestoController.obtenerPorId);

// ========================================
//  RUTAS ADMIN
// ========================================

// Obtener todas las compras
router.get('/admin/todas', authMiddleware, adminOnly, compraRepuestoController.getAllCompras);

module.exports = router;