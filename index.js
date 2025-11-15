require('dotenv').config();
const app = require('./src/app'); // ya contiene express
const cors = require('cors');
const PORT = process.env.PORT || 3000;

// Habilita CORS
app.use(cors());

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});