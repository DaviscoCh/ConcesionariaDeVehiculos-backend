const express = require('express');
const router = express.Router();
const repuestoController = require('../controllers/repuesto.controller');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// ========================================
//  RUTAS PÚBLICAS / USUARIO
// ========================================

// Obtener todos los repuestos (usuario autenticado)
router.get('/', authMiddleware, repuestoController.getAll);

// Obtener repuestos compatibles con vehículos del usuario
router.get('/compatibles', authMiddleware, repuestoController.getCompatibles);

// Obtener vehículos del usuario
router.get('/mis-vehiculos', authMiddleware, repuestoController.getVehiculosUsuario);

// Obtener repuesto por ID
router.get('/:id', authMiddleware, repuestoController.getById);

// ========================================
//  RUTAS ADMIN
// ========================================

// Crear repuesto
router.post('/', authMiddleware, adminOnly, repuestoController.create);

// Actualizar repuesto
router.put('/:id', authMiddleware, adminOnly, repuestoController.update);

// Eliminar repuesto
router.delete('/:id', authMiddleware, adminOnly, repuestoController.delete);

module.exports = router;