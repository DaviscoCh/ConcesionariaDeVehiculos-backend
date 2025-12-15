const express = require('express');
const router = express.Router();
const vehiculoController = require('../controllers/vehiculo.controller');

router.get('/', vehiculoController.getAll);
router.get('/filtrar', vehiculoController.getFiltered);
router.get('/:id', vehiculoController.getById);
router.post('/', vehiculoController.create);
router.put('/:id', vehiculoController.update);
router.delete('/:id', vehiculoController.remove);
router.get('/marca/:id_marca', vehiculoController.getByMarca);

module.exports = router;