const express = require('express');
const router = express.Router();
const controller = require('../controllers/persona.controller');

router.get('/buscar', controller.getByCorreo);
router.get('/search/:name', controller.search);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);
router.get('/', controller.getAll);

module.exports = router;