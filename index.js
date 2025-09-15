require('dotenv').config(); // <- Esto carga las variables del archivo .env
const app = require('./src/app');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
