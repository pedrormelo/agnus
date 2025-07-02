// routes/equipamentosRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/equipamentosController');

router.get('/', controller.listarEquipamentos);
router.post('/', controller.criarEquipamento);

// Novos endpoints para relacionados e histórico
router.get('/:id/relacionados', controller.getRelacionados);
router.get('/:id/historico', controller.getHistorico);

router.get('/:id/etiqueta', controller.gerarEtiqueta);
router.get('/equipamentos/etiqueta/:codigo', controller.buscarPorCodigoEtiqueta);
router.patch('/:id/status', controller.atualizarStatus);
router.put('/:id', controller.atualizarEquipamento);
router.delete('/:id', controller.excluirEquipamento);

module.exports = router;
