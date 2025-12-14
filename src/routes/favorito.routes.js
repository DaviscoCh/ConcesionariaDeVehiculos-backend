const express = require('express');
const router = express.Router();
const favoritoController = require('../controllers/favorito.controller');
const { authMiddleware } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.post('/', authMiddleware, favoritoController.agregar);
router.get('/', authMiddleware, favoritoController.obtenerTodos);
router.get('/verificar/:id_vehiculo', authMiddleware, favoritoController.verificar);
router.delete('/:id_vehiculo', authMiddleware, favoritoController.eliminar);

module.exports = router;