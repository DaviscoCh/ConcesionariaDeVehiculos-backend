const express = require('express');
const cors = require('cors');
const path = require('path');

const personaRoutes = require('./routes/persona.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const vehiculoRoutes = require('./routes/vehiculo.routes');
const marcaRoutes = require('./routes/marca.routes');
const modeloRoutes = require('./routes/modelos.routes');
const cotizacionRoutes = require('./routes/cotizacion.routes');
const facturaRoutes = require('./routes/factura.routes');
const tarjetaRoutes = require('./routes/tarjeta.routes');
const citaRoutes = require('./routes/cita.routes');
const oficinaRoutes = require('./routes/oficina.routes');
const notificacionRoutes = require('./routes/notificacion.routes');
const { iniciarJobCitasVencidas } = require('./jobs/citasJob');
const favoritoRoutes = require('./routes/favorito.routes');

const app = express();
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:3001'],
  credentials: true
}));

app.use(express.json());
app.use('/api/personas', personaRoutes);
app.use('/api/usuario', usuarioRoutes);
app.use('/api/vehiculos', vehiculoRoutes);
app.use('/api/marcas', marcaRoutes);
app.use('/api/modelos', modeloRoutes);
app.use('/api/cotizaciones', cotizacionRoutes);
app.use('/api/facturas', facturaRoutes);
app.use('/api/tarjetas', tarjetaRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/oficinas', oficinaRoutes);
app.use('/api/notificaciones', notificacionRoutes);
app.use('/api/favoritos', favoritoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
  iniciarJobCitasVencidas();
});

module.exports = app