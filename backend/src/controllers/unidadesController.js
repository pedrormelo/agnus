const db = require('../config/db');
const Unidade = require('../models/Unidade');

exports.listarUnidades = async (req, res) => {
    try {
        const unidades = await Unidade.getAll();
        res.json(unidades);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao listar unidades' });
    }
};
