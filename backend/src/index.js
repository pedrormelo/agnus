require('dotenv').config();

const express = require('express');
const cors = require('cors');

const tecnicosRoutes = require("./routes/tecnicosRoutes");
const equipamentosRoutes = require("./routes/equipamentosRoutes");
const unidadesRoutes = require("./routes/unidadesRoutes");

const app = express();

app.use(cors({
    origin: 'http://localhost:3004', //frontend url
    credentials: true,
}));

app.use(express.json());

//rotas
app.use('/tecnicos', tecnicosRoutes);
app.use('/equipamentos', equipamentosRoutes);
app.use('/unidades', unidadesRoutes);

const PORT = process.env.PORT || 3005;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;