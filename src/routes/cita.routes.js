const express = require('express');
const router = express.Router();
const citaController = require('../controllers/cita.controller');

// Rutas para citas
router.get('/', citaController.getAll);
router.get('/disponibilidad', citaController.verificarDisponibilidad);
router.get('/horas-ocupadas', citaController.obtenerHorasOcupadas);
router.get('/historial', citaController.getHistorialByUsuario);
router.post('/', citaController.create);
router.put('/:id', citaController.update);
router.delete('/:id', citaController.remove);

module.exports = router;