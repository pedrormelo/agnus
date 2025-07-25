// controllers/equipamentosController.js
const db = require('../config/db');
const { exec } = require('child_process');
const Equipamento = require('../models/Equipamento');

// Nova rota: Mover para REPARO
exports.moverParaReparo = async (req, res) => {
    const id = req.params.id;
    const { idTecnico, dataReparo } = req.body;
    try {
        await Equipamento.moveToReparo(id, { idTecnico, dataReparo });
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Nova rota: Completar como PRONTO
exports.completarPronto = async (req, res) => {
    const id = req.params.id;
    const { solucao } = req.body;
    try {
        await Equipamento.completePronto(id, { solucao });
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Nova rota: Marcar como DESCARTE
exports.marcarDescarte = async (req, res) => {
    const id = req.params.id;
    const { motivoDescarte } = req.body;
    try {
        await Equipamento.markDescarte(id, { motivoDescarte });
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
// Retorna chamados relacionados para um equipamento
exports.getRelacionados = async (req, res) => {
    const id = req.params.id;
    try {
        const relacionados = await Equipamento.getRelacionados(id);
        res.json(relacionados);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar chamados relacionados' });
    }
};

// Retorna histórico do equipamento
exports.getHistorico = async (req, res) => {
    const id = req.params.id;
    try {
        const historico = await Equipamento.getHistorico(id);
        res.json(historico);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar histórico do registro' });
    }
};

exports.listarEquipamentos = async (req, res) => {
    try {
        const data = await Equipamento.getAll();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao listar equipamentos' });
    }
};

exports.criarEquipamento = async (req, res) => {
    try {
        const { idEquip, codigoEtiqueta } = await Equipamento.create(req.body);

        // Geração de ZPL com base nos dados do equipamento
        const [rows] = await db.query(`
            SELECT e.*, u.nomeUnidade, t.nomeTec FROM equipamentos e
            LEFT JOIN unidades u ON e.idUnidade = u.idUnidade
            LEFT JOIN tecnicos t ON e.idTecnico = t.idTec
            WHERE e.idEquip = ?
        `, [idEquip]);

        const eq = rows[0];

        const dataHoje = new Date().toLocaleDateString('pt-BR');
        const removeAcentos = (texto) => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ç/g, "c").replace(/Ç/g, "C");

        const zpl = `CT~~CD,~CC^~CT~
^XA
^LL415
^PR3
^MD30
^PW480
^FO0,288^GFA,02048,02048,00016,:Z64:
eJzt1DGuozAQANCxXNBEcAGE9wi/pIjWZ/k3gI7iayHN0iVH2KsgpeAaRFzAaBsXlmfHGAIfkeRLW6200z0ZzDCeMcD/+KcjiHRkApvmiGZju2NWDxpACjwp+E7mrXNJ7iDxNmuzy2/nX8i8QdI+ArFhPT4yysW8VQGihuD0RWt6n2uztuXabtZXloANqGrKj+sQyg5uzQMznUDZLAYqTcmxAzbXy6Y/HnisL1jITYFNNh/AczMUaI+FaDL9dnD5YIQ2JtNDyY7Z7MFkid/imHFMpJXV5NRbrB3P5pWFMKY/Hjpw+fNmcr44WhuFjnody7NQUz7OCVnvmeHFkA/yLPVhrM/QXuIAXH/B5PNnX0cP3ryNmhDkrVXHwtxdkuPCbuz72XIFJWrVV34/G4zO9820cB1CTQVvH+P5R7pE7AIL/nsr28Xu+czXh+kISptGBmaHTwzQ8dP1whqQyltRa9ZkoSfz2b5/DlRD2uIbtv74QucEcqxf+OdIGV3PNJ86PBaTW+94a9+BUslKUL9QP8QbJ3vrFBkUHSi4x+jsa+Y0zFlfJ/N95JxPtpt1X0/qX1Hf9Dyvr9yatLQlzW9vvWl+zWh8aPvZGf0v5C88rEz5ypXzZ6Z8mXHzu+Q/Ol8Ma7vLz3yI6n2pD9B8Bqdnll1wv4/+Lv4AXrlDXA==:7849
^FO96,352^GFA,02304,02304,00036,:Z64:
eJzt0jFOxTAMBmBHHTzmCLlJcyVO0JSJDY7ATVDQGxi5AIK+GwSxGL3Ixk7eg74ndoTUf8jQflUd2wBbtmzZ8kfBha4oSvYZ0uwIkAB8gZgxj3qGOTZD3ThZ1AQGiBWk4DI6KSGntUEpapIACDshLOMg5PN0bqiZGUQGqWq8VC+8Nr4Zkdl1Q2r4aD4rgTezr2o4ZFfjTWGso8+MUu1m3yabqVo8hZtlMlPTybycDJgBO1ENq4k/JrR6yN5qyU6aETPDO5k5vHaDMg8Vkj6z5kz49osZZFET9R6pmnl+WJnbbuxzBq89DNyMddx9lDODZCDN+jMzT80cmpG7fi+tOGjFQU00s2OX04XBvZlJTT0avzAclmZQZ7ET0XnF+9znZeZRm8wgZ0annPwS1aRm+iAuTWlGy+Zu9CtIeW10xxhL37FmJt2xCwPpug7Ud7WZ0UA3W/5RvgDZq1vo:CCE9
^FO128,352^GFA,01024,01024,00032,:Z64:
eJzt0rFqwzAQANATAnlR7fVKAv4FlS7e1E/R1K7+gEJkAs0S6C9dMKRLPqCjunTO6IKxK52T0mQoWbrlttODO91JANf4z5B7p9GoguxOrADE2Azyw5suivAWIOvYy7DYiVcffTkUX/5+YB8J8rlBRF3VYStvKRZYKY30lCdvQgBU7A5pKzH5i0JNj5LdG6gy22HZhzm9jUgWxDr6+Cmhn9zIco9FR5raAeHgiy1MjtHRYOyoXaswzsPuWs/1++SxtzKk7WadfEx+1+z/dv/M88EvrycXk+dHrzJFKF2YO3r/8Rko9nh/VOwOj57mnyn2hkzcH3tV1wdfJc+m+nF/WSeX44bKYKlG4P2jzmUf3fYLiu/HXlB58Ca56Nitv+AHZO785OEkK8K500l2Q2csLul6aXwD1KyHAA==:072C
^FO180,320^A0I,35,35^FD${dataHoje}^FS
^FO384,320^GFA,01152,01152,00012,:Z64:
eJzN0z1u2zAUAODHcuASiBdQpF6hm40q1pVkZKiBBiELDx5zgaA+SlkYqDfnAkEio4OXwlA2FVX18h4lk0bR7uVAfRCo9ycJ4B9L9qoH407uwNjBnW5PVkVSwWE4ryZpHX1Vw3FwUr130R9tcP0Bog/B6f4YfPl1B7AbvblnS848JQsyVzfdpmzl/TC4Jr/bkb+Bat4CzNlbSl+R+xTkCvSkAVhgwlZTeqAoE4VLK79QoDRXiMtGrilZoleIAsVnrlOtmzeA+0fuUSLt5ufglvYC79mCs2elN7C1HswVqrvU20/yiV16i45thlaRo2G0GMdqqGRqw6+Kt/H+5E9f22hz5tJF6++IzWjqFvvRgox2MO80zArGJZpoWMC8OfkGrrnmCzZ9NR1dcj5/hDIb88otXCRcD41ErWiW5BcKkNMwqHdR3wDMpE+s2hmFJy+ozI4CNfR26WiWIZ3LHU94ptFKVzr+BoxCp+wCFLVqVr+cpio1D/h5Wmc0tVsupb+sCzDY+RJz10KJvnzUn+iqeUrioJfu1OpmfbDBvzG0vW9vg1+40HHNuyy47IvouzY4V2FioJd1sNq4YIE2GGJa+gej9Y/oPD4KV+7v98+tz8L/B+sVfrzI3Q==:75AF
^FO70,235^FB400,2,0,L^A0I,38,32^FD${removeAcentos(eq.nomeUnidade)}^FS
^FO70,198^FB400,1,0,L^A0I,32,28^FD${removeAcentos(eq.ambiente)}^FS
^FO70,80^FB400,3,0,L^A0I,32,30^FD${removeAcentos(eq.descDefeito)}^FS
^FO100,15^BCI,40,N,N,N^FD${codigoEtiqueta}^FS
^FO10,66^A0I,36,30^FD${removeAcentos(eq.nomeTec)}^FS
^FO0,0^GFA,00768,00768,00008,:Z64:
eJxjYBiugP3/AfYHQFr+/wH5D0Da/v8B+x8Quv4PkK5Hp/kP/PsHpOv4D/ypQ6MLIPIgZSD9KLQ8lGaH0vxo4vb8OOj/+M3jRzN3FNACAAAErUo8:F906
^FO379,316^GB96,96,4^FS
^FO107,316^GB272,0,4^FS
^FO9,59^GB466,0,4^FS
^FO8,19^GB48,44,4^FS
^LRY^FO23,24^GB54,0,33^FS^LRN
^PQ1,1,1,Y^XZ`;

        // Salva o ZPL em um arquivo temporário
        const fs = require('fs');
        const path = require('path');
        // Caminho da pasta compartilhada na máquina de impressão
        const zplSharePath = process.env.ZPL_SHARE_PATH || "\\\\TI-02\\zpl-jobs"; // Use env or fallback
        const zplPath = path.join(zplSharePath, `etiqueta_${codigoEtiqueta}.zpl`);
        fs.writeFileSync(zplPath, zpl);
        // Não imprime aqui! O agente local fará a impressão.
        res.status(201).json({ idEquip, codigoEtiqueta });
    } catch (err) {
        console.error('Erro ao criar equipamento:', err);
        res.status(500).json({ error: 'Erro ao criar equipamento' });
    }
};


// exports.criarEquipamento = async (req, res) => {
//     try {
//         // 1. Cria o equipamento normalmente
//         const id = await Equipamento.create(req.body);

//         // 2. Monta o codigoEtiqueta no formato yyyymmNNNN
//         const dataAtual = new Date();
//         const ano = dataAtual.getFullYear();
//         const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
//         const sufixo = String(id).padStart(4, '0');
//         const codigoEtiqueta = `${ano}${mes}${sufixo}`;

//         // 3. Atualiza o campo no banco
//         await db.query('UPDATE equipamentos SET codigoEtiqueta = ? WHERE idEquip = ?', [codigoEtiqueta, id]);

//         res.status(201).json({ idEquip: id, codigoEtiqueta });
//     } catch (err) {
//         console.error('Erro ao criar equipamento:', err);
//         res.status(500).json({ error: 'Erro ao criar equipamento' });
//     }
// };


const removeAcentos = (texto) => {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ç/g, "c").replace(/Ç/g, "C");
};

exports.gerarEtiqueta = async (req, res) => {
    const id = req.params.id;

    try {
        const [rows] = await db.query(`
            SELECT e.idEquip, e.codigoEtiqueta, e.ambiente, e.descDefeito, u.nomeUnidade, t.nomeTec
            FROM equipamentos e
            LEFT JOIN unidades u ON e.idUnidade = u.idUnidade
            LEFT JOIN tecnicos t ON e.idTecnico = t.idTec
            WHERE e.idEquip = ?
        `, [id]);

        const eq = rows[0];
        if (!eq) return res.status(404).json({ error: 'Equipamento não encontrado' });

        const dataHoje = new Date().toLocaleDateString('pt-BR');

        // Normaliza os dados para evitar problemas com impressoras
        eq.nomeUnidade = removeAcentos(eq.nomeUnidade || '');
        eq.ambiente = removeAcentos(eq.ambiente || '');
        eq.descDefeito = removeAcentos(eq.descDefeito || '');
        eq.nomeTec = removeAcentos(eq.nomeTec || '');

        // Geração do ZPL
        const zpl = `CT~~CD,~CC^~CT~
^XA
^LL415
^PR3
^MD30
^PW480
^FO0,288^GFA,02048,02048,00016,:Z64:
eJzt1DGuozAQANCxXNBEcAGE9wi/pIjWZ/k3gI7iayHN0iVH2KsgpeAaRFzAaBsXlmfHGAIfkeRLW6200z0ZzDCeMcD/+KcjiHRkApvmiGZju2NWDxpACjwp+E7mrXNJ7iDxNmuzy2/nX8i8QdI+ArFhPT4yysW8VQGihuD0RWt6n2uztuXabtZXloANqGrKj+sQyg5uzQMznUDZLAYqTcmxAzbXy6Y/HnisL1jITYFNNh/AczMUaI+FaDL9dnD5YIQ2JtNDyY7Z7MFkid/imHFMpJXV5NRbrB3P5pWFMKY/Hjpw+fNmcr44WhuFjnody7NQUz7OCVnvmeHFkA/yLPVhrM/QXuIAXH/B5PNnX0cP3ryNmhDkrVXHwtxdkuPCbuz72XIFJWrVV34/G4zO9820cB1CTQVvH+P5R7pE7AIL/nsr28Xu+czXh+kISptGBmaHTwzQ8dP1whqQyltRa9ZkoSfz2b5/DlRD2uIbtv74QucEcqxf+OdIGV3PNJ86PBaTW+94a9+BUslKUL9QP8QbJ3vrFBkUHSi4x+jsa+Y0zFlfJ/N95JxPtpt1X0/qX1Hf9Dyvr9yatLQlzW9vvWl+zWh8aPvZGf0v5C88rEz5ypXzZ6Z8mXHzu+Q/Ol8Ma7vLz3yI6n2pD9B8Bqdnll1wv4/+Lv4AXrlDXA==:7849
^FO96,352^GFA,02304,02304,00036,:Z64:
eJzt0jFOxTAMBmBHHTzmCLlJcyVO0JSJDY7ATVDQGxi5AIK+GwSxGL3Ixk7eg74ndoTUf8jQflUd2wBbtmzZ8kfBha4oSvYZ0uwIkAB8gZgxj3qGOTZD3ThZ1AQGiBWk4DI6KSGntUEpapIACDshLOMg5PN0bqiZGUQGqWq8VC+8Nr4Zkdl1Q2r4aD4rgTezr2o4ZFfjTWGso8+MUu1m3yabqVo8hZtlMlPTybycDJgBO1ENq4k/JrR6yN5qyU6aETPDO5k5vHaDMg8Vkj6z5kz49osZZFET9R6pmnl+WJnbbuxzBq89DNyMddx9lDODZCDN+jMzT80cmpG7fi+tOGjFQU00s2OX04XBvZlJTT0avzAclmZQZ7ET0XnF+9znZeZRm8wgZ0annPwS1aRm+iAuTWlGy+Zu9CtIeW10xxhL37FmJt2xCwPpug7Ud7WZ0UA3W/5RvgDZq1vo:CCE9
^FO128,352^GFA,01024,01024,00032,:Z64:
eJzt0rFqwzAQANATAnlR7fVKAv4FlS7e1E/R1K7+gEJkAs0S6C9dMKRLPqCjunTO6IKxK52T0mQoWbrlttODO91JANf4z5B7p9GoguxOrADE2Azyw5suivAWIOvYy7DYiVcffTkUX/5+YB8J8rlBRF3VYStvKRZYKY30lCdvQgBU7A5pKzH5i0JNj5LdG6gy22HZhzm9jUgWxDr6+Cmhn9zIco9FR5raAeHgiy1MjtHRYOyoXaswzsPuWs/1++SxtzKk7WadfEx+1+z/dv/M88EvrycXk+dHrzJFKF2YO3r/8Rko9nh/VOwOj57mnyn2hkzcH3tV1wdfJc+m+nF/WSeX44bKYKlG4P2jzmUf3fYLiu/HXlB58Ca56Nitv+AHZO785OEkK8K500l2Q2csLul6aXwD1KyHAA==:072C
^FO180,320^A0I,35,35^FD{{dataHoje}}^FS
^FO384,320^GFA,01152,01152,00012,:Z64:
eJzN0z1u2zAUAODHcuASiBdQpF6hm40q1pVkZKiBBiELDx5zgaA+SlkYqDfnAkEio4OXwlA2FVX18h4lk0bR7uVAfRCo9ycJ4B9L9qoH407uwNjBnW5PVkVSwWE4ryZpHX1Vw3FwUr130R9tcP0Bog/B6f4YfPl1B7AbvblnS848JQsyVzfdpmzl/TC4Jr/bkb+Bat4CzNlbSl+R+xTkCvSkAVhgwlZTeqAoE4VLK79QoDRXiMtGrilZoleIAsVnrlOtmzeA+0fuUSLt5ufglvYC79mCs2elN7C1HswVqrvU20/yiV16i45thlaRo2G0GMdqqGRqw6+Kt/H+5E9f22hz5tJF6++IzWjqFvvRgox2MO80zArGJZpoWMC8OfkGrrnmCzZ9NR1dcj5/hDIb88otXCRcD41ErWiW5BcKkNMwqHdR3wDMpE+s2hmFJy+ozI4CNfR26WiWIZ3LHU94ptFKVzr+BoxCp+wCFLVqVr+cpio1D/h5Wmc0tVsupb+sCzDY+RJz10KJvnzUn+iqeUrioJfu1OpmfbDBvzG0vW9vg1+40HHNuyy47IvouzY4V2FioJd1sNq4YIE2GGJa+gej9Y/oPD4KV+7v98+tz8L/B+sVfrzI3Q==:75AF
^FO70,235^FB400,2,0,L^A0I,38,32^FD{{nomeUnidade}}^FS
^FO70,175^FB400,1,0,L^A0I,35,32^FD{{ambiente}}^FS
^FO70,95^FB400,2,0,L^A0I,36,32^FD{{descDefeito}}^FS
^FO100,15^BCI,40,N,N,N^FD{{idEquip}}^FS
^FO10,66^A0I,36,30^FD{{nomeTec}}^FS
^FO0,0^GFA,00768,00768,00008,:Z64:
eJxjYBiugP3/AfYHQFr+/wH5D0Da/v8B+x8Quv4PkK5Hp/kP/PsHpOv4D/ypQ6MLIPIgZSD9KLQ8lGaH0vxo4vb8OOj/+M3jRzN3FNACAAAErUo8:F906
^FO379,316^GB96,96,4^FS
^FO107,316^GB272,0,4^FS
^FO9,59^GB466,0,4^FS
^FO8,19^GB48,44,4^FS
^LRY^FO23,24^GB54,0,33^FS^LRN
^PQ1,1,1,Y^XZ`.replace(/{{dataHoje}}/g, dataHoje)
            .replace(/{{nomeUnidade}}/g, eq.nomeUnidade)
            .replace(/{{ambiente}}/g, eq.ambiente)
            .replace(/{{descDefeito}}/g, eq.descDefeito)
            .replace(/{{nomeTec}}/g, eq.nomeTec)
            .replace(/{{idEquip}}/g, eq.codigoEtiqueta);

        // Salva o ZPL em um arquivo temporário
        const fs = require('fs');
        const path = require('path');
        // Caminho da pasta compartilhada na máquina de impressão
        const zplSharePath = process.env.ZPL_SHARE_PATH || "\\\\TI-02\\zpl-jobs"; // Use env or fallback
        const zplPath = path.join(zplSharePath, `etiqueta_${eq.codigoEtiqueta}.zpl`);
        fs.writeFileSync(zplPath, zpl);
        // Não imprime aqui! O agente local fará a impressão.
        res.status(201).json({ idEquip: eq.idEquip, codigoEtiqueta: eq.codigoEtiqueta });
    } catch (err) {
        console.error('Erro ao criar equipamento:', err);
        res.status(500).json({ error: 'Erro ao criar equipamento' });
    }
};

exports.buscarPorCodigoEtiqueta = async (req, res) => {
    const { codigo } = req.params;
    try {
        const equipamento = await Equipamento.getByCodigoEtiqueta(codigo);
        if (!equipamento) {
            return res.status(404).json({ error: 'Equipamento não encontrado' });
        }
        res.json(equipamento);
    } catch (err) {
        console.error('Erro ao buscar por código da etiqueta:', err);
        res.status(500).json({ error: 'Erro interno' });
    }
};

exports.atualizarStatus = async (req, res) => {
    const id = req.params.id;
    const { status } = req.body;
    try {
        await db.query('UPDATE equipamentos SET status = ? WHERE idEquip = ?', [status, id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao atualizar status' });
    }
};

exports.atualizarEquipamento = async (req, res) => {
    const id = req.params.id;
    const { idTomb, ambiente, tipo, descDefeito, unidade, tecnico } = req.body;
    try {
        // Buscar idUnidade e idTecnico pelo nome, se necessário
        let idUnidade = unidade;
        let idTecnico = tecnico;
        if (isNaN(unidade)) {
            const [u] = await db.query('SELECT idUnidade FROM unidades WHERE nomeUnidade = ?', [unidade]);
            idUnidade = u[0]?.idUnidade;
        }
        if (isNaN(tecnico)) {
            const [t] = await db.query('SELECT idTec FROM tecnicos WHERE nomeTec = ?', [tecnico]);
            idTecnico = t[0]?.idTec;
        }
        await db.query(
            'UPDATE equipamentos SET idTomb = ?, ambiente = ?, tipo = ?, descDefeito = ?, idUnidade = ?, idTecnico = ? WHERE idEquip = ?',
            [idTomb, ambiente, tipo, descDefeito, idUnidade, idTecnico, id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao atualizar equipamento' });
    }
};

exports.excluirEquipamento = async (req, res) => {
    const id = req.params.id;
    try {
        await db.query('DELETE FROM equipamentos WHERE idEquip = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao excluir equipamento' });
    }
};
