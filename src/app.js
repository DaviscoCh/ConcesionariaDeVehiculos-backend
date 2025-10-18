const express = require('express');
const cors = require('cors');
const path = require('path');

const personaRoutes = require('./routes/persona.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const vehiculoRoutes = require('./routes/vehiculo.routes');
const marcaRoutes = require('./routes/marca.routes');
const modeloRoutes = require('./routes/modelos.routes');
const cotizacionRoutes = require('./routes/cotizacion.routes');

const app = express();
app.use(cors({
  origin: ['http://localhost:4200'],
  credentials: true
}));

app.use(express.json());
app.use('/api/personas', personaRoutes);
app.use('/api/usuario', usuarioRoutes);
app.use('/api/vehiculos', vehiculoRoutes);
app.use('/api/marcas', marcaRoutes);
app.use('/api/modelos', modeloRoutes);
app.use('/api/cotizaciones', cotizacionRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});

module.exports = app