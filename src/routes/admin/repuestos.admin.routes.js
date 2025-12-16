const express = require('express');
const router = express.Router();
const repuestoController = require('../../controllers/repuesto.controller');

console.log('📦 [ADMIN] Cargando rutas de repuestos admin...');

// Middleware de logging
router.use((req, res, next) => {
    console.log(`🔍 [ADMIN REPUESTOS] ${req.method} ${req.path}`);
    next();
});

// ========================================
//  RUTAS ADMIN (Sin autenticación)
// ========================================

// Obtener todos los repuestos
router.get('/', repuestoController.getAll);

// Obtener repuesto por ID
router.get('/:id', repuestoController.getById);

// Crear repuesto
router.post('/', repuestoController.create);

// Actualizar repuesto
router.put('/:id', repuestoController.update);

// Eliminar repuesto
router.delete('/:id', repuestoController.delete);

console.log('✅ [ADMIN] Rutas de repuestos admin configuradas');

module.exports = router;