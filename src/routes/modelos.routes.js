const express = require('express');
const router = express.Router();
const modeloController = require('../controllers/modelo.controller');

router.get('/', modeloController.getAll);
router.post('/', modeloController.create);
router.put('/:id', modeloController.update);
router.delete('/:id', modeloController.remove);

module.exports = router;