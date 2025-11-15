const express = require('express');
const router = express.Router();
const tarjetaController = require('../controllers/tarjeta.controller');
const { authMiddleware } = require('../middleware/auth');

// 💳 Crear tarjeta
router.post('/', authMiddleware, tarjetaController.crearTarjeta);

// 📋 Obtener tarjetas del usuario
router.get('/', authMiddleware, tarjetaController.obtenerTarjetas);

// 💰 Recargar saldo
router.put('/recargar', authMiddleware, tarjetaController.recargarSaldo);

module.exports = router;