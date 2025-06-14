const db = require('../config/db');

const Unidade = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM unidades');
        return rows;
    }
};

module.exports = Unidade;
