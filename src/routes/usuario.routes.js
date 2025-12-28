const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const { authMiddleware } = require('../middleware/auth');

// ========================================
// RUTAS PÚBLICAS (sin autenticación)
// ========================================
router.post('/register', usuarioController.registrar);
router.post('/login', usuarioController.login);

// ========================================
// RUTAS 2FA (sin autenticación, pero requieren datos de login previo)
// ========================================
router.post('/verify-2fa', usuarioController.verify2FA);
router.post('/resend-code', usuarioController.resendCode);

// ========================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ========================================
router.get('/', authMiddleware, usuarioController.getAll);
router.get('/perfil', authMiddleware, usuarioController.getPerfil);
router.get('/cotizaciones', authMiddleware, usuarioController.getCotizaciones);
router.post('/cotizaciones', authMiddleware, usuarioController.crearCotizacion);
router.get('/protegido', authMiddleware, (req, res) => {
  res.json({
    message: 'Acceso autorizado',
    usuario: req.user
  });
});

module.exports = router;