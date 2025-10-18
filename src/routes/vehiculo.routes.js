const express = require('express');
const router = express.Router();
const vehiculoController = require('../controllers/vehiculo.controller');

router.get('/', vehiculoController.getAll);
router.get('/:id', vehiculoController.getById);
router.post('/', vehiculoController.create);
router.put('/:id', vehiculoController.update);
router.delete('/:id', vehiculoController.remove);

module.exports = router;