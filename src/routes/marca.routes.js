const express = require('express');
const router = express.Router();
const marcaController = require('../controllers/marca.controller');

router.get('/', marcaController.getAll);
router.get('/:id', marcaController.getById);
router.post('/', marcaController.create);
router.put('/:id', marcaController.update);
router.delete('/:id', marcaController.remove);

module.exports = router;