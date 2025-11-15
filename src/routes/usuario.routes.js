const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const { authMiddleware } = require('../middleware/auth');

router.post('/register', usuarioController.registrar);
router.post('/login', usuarioController.login);

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