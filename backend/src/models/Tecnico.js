const db = require('../config/db');

const Tecnico = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM tecnicos ORDER BY idTec');
        return rows;
    },

    getById: async (idTec) => {
        const [rows] = await db.query('SELECT * FROM tecnicos WHERE idTec = ?', [idTec]);
        return rows[0];
    },

    create: async (dados) => {
        const { nomeTec, numTec, habTec, areaTec } = dados;
        const [result] = await db.query(
            'INSERT INTO tecnicos (nomeTec, numTec, habTec, areaTec) VALUES (?, ?, ?, ?)',
            [nomeTec, numTec, habTec, areaTec]
        );
        const idTec = result.insertId;
        return { idTec, nomeTec, numTec, habTec, areaTec };
    },

    update: async (idTec, dados) => {
        const { nomeTec, numTec, habTec, areaTec } = dados;
        await db.query(
            'UPDATE tecnicos SET nomeTec = ?, numTec = ?, habTec = ?, areaTec = ? WHERE idTec = ?',
            [nomeTec, numTec, habTec, areaTec, idTec]
        );
        return { idTec, nomeTec, numTec, habTec, areaTec };
    },

    delete: async (idTec) => {
        await db.query('DELETE FROM tecnicos WHERE idTec = ?', [idTec]);
        return { idTec };
    },
};

module.exports = Tecnico;
