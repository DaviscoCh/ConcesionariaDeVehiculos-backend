const express = require('express');
const router = express.Router();
const servicioController = require('../controllers/servicioMantenimiento.controller');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// ========================================
// RUTAS PÚBLICAS (con auth)
// ========================================

// Obtener todos los servicios
router.get('/', authMiddleware, servicioController.getAllServicios);

// Obtener categorías
router.get('/categorias', authMiddleware, servicioController.getCategorias);

// Obtener servicios por categoría
router.get('/categoria/:categoria', authMiddleware, servicioController.getServiciosByCategoria);

// Obtener servicio por ID
router.get('/:id', authMiddleware, servicioController.getServicioById);

// ========================================
// RUTAS ADMIN
// ========================================

// Crear servicio
router.post('/', authMiddleware, adminOnly, servicioController.createServicio);

// Actualizar servicio
router.put('/:id', authMiddleware, adminOnly, servicioController.updateServicio);

// Eliminar servicio
router.delete('/:id', authMiddleware, adminOnly, servicioController.deleteServicio);

module.exports = router;