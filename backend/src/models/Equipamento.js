const db = require('../config/db');

const Equipamento = {
    getAll: async () => {
        const [rows] = await db.query(`SELECT * FROM equipamentos`);
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query(`SELECT * FROM equipamentos WHERE idEquip = ?`, [id]);
        return rows[0];
    },

    create: async (dados) => {
        const { idTomb, ambiente, descDefeito, tipo, idUnidade, idTecnico } = dados;

        const [result] = await db.query(
            `INSERT INTO equipamentos (idTomb, ambiente, descDefeito, tipo, idUnidade, idTecnico) VALUES (?, ?, ?, ?, ?, ?)`,
            [idTomb, ambiente, descDefeito, tipo, idUnidade, idTecnico]
        );

        const idEquip = result.insertId;

        // Gera o código no formato yyyymmNNNN
        const now = new Date();
        const anoMes = now.getFullYear().toString() + String(now.getMonth() + 1).padStart(2, '0');
        const codigoEtiqueta = `${anoMes}${String(idEquip).padStart(4, '0')}`;

        // Atualiza o equipamento com o código gerado
        await db.query(`UPDATE equipamentos SET codigoEtiqueta = ? WHERE idEquip = ?`, [codigoEtiqueta, idEquip]);

        return { idEquip, codigoEtiqueta };
    },


    // create: async (dados) => {
    //     const {
    //         idTomb,
    //         ambiente,
    //         descDefeito,
    //         tipo,
    //         status = 'ENTRADA',
    //         dataEntrada = new Date(),
    //         dataSaida = null,
    //         idUnidade,
    //         idTecnico
    //     } = dados;

    //     // 1. Inserir equipamento (sem o códigoEtiqueta ainda)
    //     const [result] = await db.query(
    //         `INSERT INTO equipamentos 
    //             (idTomb, ambiente, descDefeito, tipo, status, dataEntrada, dataSaida, idUnidade, idTecnico)
    //         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    //         [idTomb, ambiente, descDefeito, tipo, status, dataEntrada, dataSaida, idUnidade, idTecnico]
    //     );

    //     const idEquip = result.insertId;

    //     // 2. Gerar códigoEtiqueta no formato yyyymmNNNN
    //     const now = new Date();
    //     const ano = now.getFullYear();
    //     const mes = String(now.getMonth() + 1).padStart(2, '0');
    //     const sequencia = String(idEquip).padStart(4, '0');
    //     const codigoEtiqueta = `${ano}${mes}${sequencia}`;

    //     // 3. Atualizar o registro com o código gerado
    //     await db.query(
    //         `UPDATE equipamentos SET codigoEtiqueta = ? WHERE idEquip = ?`,
    //         [codigoEtiqueta, idEquip]
    //     );

    //     return idEquip;
    // }
};


// Busca chamados relacionados por tombamento, unidade ou ambiente (exceto o próprio id)
Equipamento.getRelacionados = async (id) => {
    // Busca o equipamento principal
    const [rows] = await db.query('SELECT * FROM equipamentos WHERE idEquip = ?', [id]);
    const eq = rows[0];
    if (!eq) return [];
    // Busca outros equipamentos com mesmo tombamento, unidade ou ambiente (exceto o próprio)
    const [relacionados] = await db.query(
        `SELECT e.idEquip as id, e.idTomb as tombamento, e.status, u.nomeUnidade as unidade, e.descDefeito as descricao, DATE_FORMAT(e.dataEntrada, '%Y-%m-%d') as dataAbertura
         FROM equipamentos e
         LEFT JOIN unidades u ON e.idUnidade = u.idUnidade
         WHERE (e.idTomb = ? OR e.idUnidade = ? OR e.ambiente = ?) AND e.idEquip != ?
         ORDER BY e.dataEntrada DESC
         LIMIT 10`,
        [eq.idTomb, eq.idUnidade, eq.ambiente, id]
    );
    return relacionados;
};

// Busca histórico de ações do equipamento (simples: status, edições, etc)
Equipamento.getHistorico = async (id) => {
    // Se houver uma tabela de logs, use-a. Caso contrário, gera histórico simples a partir dos dados do equipamento
    // Exemplo: status, datas, observações
    const [rows] = await db.query('SELECT * FROM equipamentos WHERE idEquip = ?', [id]);
    const eq = rows[0];
    if (!eq) return [];
    const historico = [];
    historico.push({
        acao: 'Ticket criado',
        usuario: eq.usuarioCriacao || 'Sistema',
        data: eq.dataEntrada ? eq.dataEntrada.toISOString().slice(0, 16).replace('T', ' ') : '',
        detalhes: 'Abertura do chamado',
    });
    if (eq.status) {
        historico.push({
            acao: 'Status atual',
            usuario: 'Sistema',
            data: eq.dataUltimaAtualizacao ? eq.dataUltimaAtualizacao.toISOString().slice(0, 16).replace('T', ' ') : '',
            detalhes: `Status: ${eq.status}`,
        });
    }
    if (eq.observacoes) {
        historico.push({
            acao: 'Observação adicionada',
            usuario: eq.tecnico || 'Técnico',
            data: eq.dataUltimaAtualizacao ? eq.dataUltimaAtualizacao.toISOString().slice(0, 16).replace('T', ' ') : '',
            detalhes: eq.observacoes,
        });
    }
    return historico;
};

module.exports = Equipamento;
