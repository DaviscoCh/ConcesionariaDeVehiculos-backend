const express = require('express');
const router = express.Router();
const ordenController = require('../controllers/ordenServicio.controller');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// ========================================
// RUTAS DE USUARIO
// ========================================

// Crear nueva orden de servicio
router.post('/', authMiddleware, ordenController.crearOrden);

// Obtener órdenes del usuario
router.get('/usuario/:id_usuario', authMiddleware, ordenController.getOrdenesByUsuario);

// Obtener orden por ID con detalles
router.get('/:id', authMiddleware, ordenController.getOrdenById);

// Procesar pago de orden
router.post('/:id_orden/pago', authMiddleware, ordenController.procesarPago);

// Cancelar orden
router.put('/:id/cancelar', authMiddleware, ordenController.cancelarOrden);

// Agregar calificación
router.post('/:id/calificar', authMiddleware, ordenController.addCalificacion);

// ========================================
// RUTAS ADMIN
// ========================================

// Obtener todas las órdenes con filtros
router.get('/', authMiddleware, adminOnly, ordenController.getAllOrdenes);

// Actualizar estado de orden
router.put('/:id/estado', authMiddleware, adminOnly, ordenController.updateEstado);

module.exports = router;