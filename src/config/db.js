const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.PG_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false },
    // ✅ Configuración para mantener las conexiones activas
    max: 20, // Máximo de conexiones en el pool
    idleTimeoutMillis: 30000, // Cierra conexiones inactivas después de 30 seg
    connectionTimeoutMillis: 10000, // Timeout de 10 seg para conectar
});

// ✅ Manejar errores de conexión
pool.on('error', (err, client) => {
    console.error('❌ Error inesperado en el pool de PostgreSQL:', err);
    process.exit(-1);
});

// ✅ Verificar conexión al iniciar
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Error al conectar con Supabase:', err.stack);
    } else {
        console.log('✅ Conectado exitosamente a Supabase');
        release();
    }
});

module.exports = pool;