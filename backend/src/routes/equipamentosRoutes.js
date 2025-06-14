// routes/equipamentosRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/equipamentosController');

router.get('/', controller.listarEquipamentos);
router.post('/', controller.criarEquipamento);
router.get('/:id/etiqueta', controller.gerarEtiqueta);


module.exports = router;
