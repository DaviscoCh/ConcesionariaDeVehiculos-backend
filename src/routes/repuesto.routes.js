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
//  RUTAS ADMIN (Sin autenticación, como modelos y marcas)
// ========================================
// 🔍 DEBUG: Log al cargar el archivo de rutas
console.log('📦 Cargando rutas de repuestos...');

// ========================================
//  RUTAS ADMIN (Sin autenticación)
// ========================================

// 🔍 DEBUG:  Middleware de logging
router.use((req, res, next) => {
    console.log(`🔍 [REPUESTOS] ${req.method} ${req.path}`);
    console.log(`🔍 [HEADERS] Authorization: ${req.headers.authorization ? 'Presente' : 'Ausente'}`);
    next();
});

// Obtener todos los repuestos
router.get('/', (req, res, next) => {
    console.log('✅ Entrando a GET /api/repuestos (SIN authMiddleware)');
    next();
}, repuestoController.getAll);

// Obtener repuesto por ID
router.get('/:id', (req, res, next) => {
    console.log('✅ Entrando a GET /api/repuestos/:id (SIN authMiddleware)');
    next();
}, repuestoController.getById);

// Crear repuesto
router.post('/', (req, res, next) => {
    console.log('✅ Entrando a POST /api/repuestos (SIN authMiddleware)');
    next();
}, repuestoController.create);

// Actualizar repuesto
router.put('/:id', (req, res, next) => {
    console.log('✅ Entrando a PUT /api/repuestos/:id (SIN authMiddleware)');
    next();
}, repuestoController.update);

// Eliminar repuesto
router.delete('/:id', (req, res, next) => {
    console.log('✅ Entrando a DELETE /api/repuestos/:id (SIN authMiddleware)');
    next();
}, repuestoController.delete);

console.log('📦 Rutas de repuestos configuradas correctamente');


module.exports = router;