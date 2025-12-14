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

// =============================================
//  🆕 RUTAS DE NOTIFICACIONES DEL ADMIN
// =============================================

router.get('/admin', notificacionController.getNotificacionesAdmin);
router.get('/admin/contador', notificacionController.getContadorNoLeidasAdmin);
router.patch('/admin/:id/leida', notificacionController.marcarLeidaAdmin);
router.patch('/admin/marcar-todas-leidas', notificacionController.marcarTodasLeidasAdmin);
router.delete('/admin/:id', notificacionController.eliminarAdmin);

module.exports = router;