
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

exports.getTecnicoById = async (req, res) => {
    try {
        const tecnico = await Tecnico.getById(req.params.id);
        if (!tecnico) return res.status(404).json({ error: 'Técnico não encontrado' });
        res.json(tecnico);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar técnico' });
    }
};


exports.criarTecnico = async (req, res) => {
    try {
        const { nomeTec, numTec, habTec, areaTec } = req.body;
        if (!nomeTec || !areaTec) {
            return res.status(400).json({ error: 'nomeTec e areaTec são obrigatórios' });
        }
        const tecnico = await Tecnico.create({ nomeTec, numTec, habTec, areaTec });
        res.status(201).json(tecnico);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao criar técnico', details: err.message });
    }
};

exports.atualizarTecnico = async (req, res) => {
    try {
        const tecnico = await Tecnico.getById(req.params.id);
        if (!tecnico) return res.status(404).json({ error: 'Técnico não encontrado' });
        const { nomeTec, numTec, habTec, areaTec } = req.body;
        if (!nomeTec || !areaTec) {
            return res.status(400).json({ error: 'nomeTec e areaTec são obrigatórios' });
        }
        const atualizado = await Tecnico.update(req.params.id, { nomeTec, numTec, habTec, areaTec });
        res.json(atualizado);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao atualizar técnico', details: err.message });
    }
};

exports.excluirTecnico = async (req, res) => {
    try {
        const tecnico = await Tecnico.getById(req.params.id);
        if (!tecnico) return res.status(404).json({ error: 'Técnico não encontrado' });
        await Tecnico.delete(req.params.id);
        res.json({ message: 'Técnico excluído com sucesso' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao excluir técnico' });
    }
};
