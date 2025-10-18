const express = require('express');
const router = express.Router();
const cotizacionController = require('../controllers/cotizacion.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', cotizacionController.getByUsuario);
router.post('/', cotizacionController.create);

module.exports = router;