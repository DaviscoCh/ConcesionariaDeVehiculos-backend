const express = require('express');
const router = express.Router();
const servicioController = require('../../controllers/servicioMantenimiento.controller');

console.log('⚙️ [ADMIN] Cargando rutas de servicios admin...');

// Middleware de logging
router.use((req, res, next) => {
    console.log(`🔍 [ADMIN SERVICIOS] ${req.method} ${req.path}`);
    next();
});

// ========================================
//  RUTAS ADMIN (Sin autenticación)
// ========================================

// Obtener todos los servicios
router.get('/', servicioController.getAllServicios);

// Obtener categorías
router.get('/categorias', servicioController.getCategorias);

// Obtener servicios por categoría
router.get('/categoria/:categoria', servicioController.getServiciosByCategoria);

// Obtener servicio por ID
router.get('/:id', servicioController.getServicioById);

// Crear servicio
router.post('/', servicioController.createServicio);

// Actualizar servicio
router.put('/:id', servicioController.updateServicio);

// Eliminar servicio (soft delete)
router.delete('/:id', servicioController.deleteServicio);

console.log('✅ [ADMIN] Rutas de servicios admin configuradas');

module.exports = router;