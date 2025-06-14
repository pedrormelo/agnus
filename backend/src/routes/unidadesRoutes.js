const express = require('express');
const router = express.Router();
const controller = require('../controllers/unidadesController');

router.get('/', controller.listarUnidades);

module.exports = router;
