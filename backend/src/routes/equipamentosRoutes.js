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

// Novos endpoints para movimentação de status
router.post('/:id/mover-reparo', controller.moverParaReparo);
router.post('/:id/completar-pronto', controller.completarPronto);
router.post('/:id/marcar-descarte', controller.marcarDescarte);
router.patch('/:id/status', controller.atualizarStatus);
router.put('/:id', controller.atualizarEquipamento);
router.delete('/:id', controller.excluirEquipamento);

// Novas rotas de workflow
router.put('/:id/reparo', controller.moverParaReparo);
router.put('/:id/pronto', controller.completarPronto);
router.put('/:id/descarte', controller.marcarDescarte);

module.exports = router;
