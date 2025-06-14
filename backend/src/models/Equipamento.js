// models/Equipamento.js
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
        const { idTomb, ambiente, tipo, idUnidade, idTecnico } = dados;
        const [result] = await db.query(
            `INSERT INTO equipamentos (idTomb, ambiente, tipo, idUnidade, idTecnico) VALUES (?, ?, ?, ?, ?)`,
            [idTomb, ambiente, tipo, idUnidade, idTecnico]
        );
        return result.insertId;
    }
};

module.exports = Equipamento;
