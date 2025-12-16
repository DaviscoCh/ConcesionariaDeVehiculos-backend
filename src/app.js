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
const repuestoRoutes = require('./routes/repuesto.routes');
const repuestosAdminRoutes = require('./routes/admin/repuestos.admin.routes'); // ⭐ NUEVO
const serviciosAdminRoutes = require('./routes/admin/servicios.admin.routes'); // ⭐ NUEVO
const compraRepuestoRoutes = require('./routes/compraRepuesto.routes');
const servicioMantenimientoRoutes = require('./routes/servicioMantenimiento.routes');
const ordenServicioRoutes = require('./routes/ordenServicio.routes');
const historialMantenimientoRoutes = require('./routes/historialMantenimiento.routes');
const { iniciarJob: iniciarJobOrdenes } = require('./jobs/ordenesEstadoJob');

const app = express();
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:3001'],
  credentials: true
}));

app.use(express.json());
app.use((req, res, next) => {
  console.log(`\n📥 [${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
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
app.use('/api/admin/repuestos', repuestosAdminRoutes); // ⭐ NUEVO
app.use('/api/admin/servicios', serviciosAdminRoutes); // ⭐ NUEVO
app.use('/api/repuestos', repuestoRoutes);
app.use('/api/compras-repuestos', compraRepuestoRoutes);
app.use('/api/servicios-mantenimiento', servicioMantenimientoRoutes);
app.use('/api/ordenes-servicio', ordenServicioRoutes);
app.use('/api/historial-mantenimiento', historialMantenimientoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
  iniciarJobCitasVencidas();
  iniciarJobOrdenes();
});

// ✅ NUEVO: Cerrar conexiones al detener el servidor
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando servidor.. .');

  server.close(() => {
    console.log('✅ Servidor HTTP cerrado');
  });

  try {
    await pool.end();
    console.log('✅ Pool de conexiones cerrado');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al cerrar pool:', err);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Señal SIGTERM recibida');
  await pool.end();
  process.exit(0);
});

module.exports = app