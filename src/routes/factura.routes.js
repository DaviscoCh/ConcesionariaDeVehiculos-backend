const express = require('express');
const router = express.Router();
const facturaController = require('../controllers/factura.controller');
const { authMiddleware } = require('../middleware/auth');
// 🧾 Registrar una compra (requiere autenticación)
router.post('/', authMiddleware, facturaController.crearFactura);

// 📜 Obtener historial de compras del usuario (requiere autenticación)
router.get('/mis-compras', authMiddleware, facturaController.obtenerHistorial);

module.exports = router;