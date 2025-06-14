const db = require('../config/db');
const Tecnico = require('../models/Tecnico');

exports.listarTecnicos = async (req, res) => {
    try {
        const tecnicos = await Tecnico.getAll();
        res.json(tecnicos);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao listar técnicos' });
    }
};
