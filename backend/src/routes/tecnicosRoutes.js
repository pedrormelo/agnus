const express = require('express');
const router = express.Router();
const controller = require('../controllers/tecnicosController');

router.get('/', controller.listarTecnicos);
router.get('/:id', controller.getTecnicoById);
router.post('/', controller.criarTecnico);
router.put('/:id', controller.atualizarTecnico);
router.delete('/:id', controller.excluirTecnico);

module.exports = router;
