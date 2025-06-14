const express = require('express');
const router = express.Router();
const controller = require('../controllers/tecnicosController');

router.get('/', controller.listarTecnicos);

module.exports = router;
