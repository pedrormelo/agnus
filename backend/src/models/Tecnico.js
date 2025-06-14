const db = require('../config/db');

const Tecnico = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM tecnicos ORDER BY idTec');
        return rows;
    }
};

module.exports = Tecnico;
