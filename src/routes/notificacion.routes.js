const express = require('express');
const router = express.Router();
const notificacionController = require('../controllers/notificacion.controller');
const { authMiddleware } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.get('/', authMiddleware, notificacionController.getMisNotificaciones);
router.get('/contador', authMiddleware, notificacionController.getContadorNoLeidas);
router.patch('/:id/leida', authMiddleware, notificacionController.marcarLeida);
router.patch('/marcar-todas-leidas', authMiddleware, notificacionController.marcarTodasLeidas);
router.delete('/:id', authMiddleware, notificacionController.eliminar);

module.exports = router;