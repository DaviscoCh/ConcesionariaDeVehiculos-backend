const express = require('express');
const router = express.Router();
const oficinaController = require('../controllers/oficina.controller');

router.get('/', oficinaController.getAll);
router.post('/', oficinaController.create);
router.delete('/:id', oficinaController.remove);

module.exports = router;