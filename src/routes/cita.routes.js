const express = require('express');
const router = express.Router();
const citaController = require('../controllers/cita.controller');
const { authMiddleware } = require('../middleware/auth');

// Rutas para citas
router.get('/', citaController.getAll);
router.get('/admin', authMiddleware, citaController.getAll);
router.get('/admin/all', citaController.getAllAdmin);
router.get('/disponibilidad', citaController.verificarDisponibilidad);
router.get('/horas-ocupadas', citaController.obtenerHorasOcupadas);
router.get('/historial', authMiddleware, citaController.getHistorialByUsuario);
router.post('/', citaController.create);
router.put('/:id', citaController.update);
router.patch("/:id/estado", citaController.cambiarEstado); 
router.delete('/:id', citaController.remove);

module.exports = router;