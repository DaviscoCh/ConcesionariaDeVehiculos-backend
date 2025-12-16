const { Pool } = require('pg');
require('dotenv').config();

// ========================================
// CONFIGURACIÓN DEL POOL OPTIMIZADA PARA SUPABASE
// ========================================
const pool = new Pool({
    connectionString: process.env.PG_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false },

    // ✅ Configuración optimizada para Supabase
    max: 5, // Reducir a 5 (Supabase tiene límite bajo)
    min: 0, // No mantener conexiones mínimas
    idleTimeoutMillis: 20000, // Cerrar conexiones idle después de 20s
    connectionTimeoutMillis: 10000, // Timeout de conexión:  10s
    maxUses: 7500, // Reciclar conexión después de 7500 queries

    // ✅ Zona horaria para Ecuador
    options: '-c timezone=America/Guayaquil',

    // ✅ Configuración adicional para estabilidad
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    allowExitOnIdle: true // Permitir que Node.js cierre cuando está idle
});

// ========================================
// MANEJO DE ERRORES CON RECONEXIÓN
// ========================================
pool.on('error', (err, client) => {
    console.error('❌ Error inesperado en el pool de PostgreSQL:', err.message);

    // ⚠️ NO cerrar el proceso, solo loggear
    // El pool manejará la reconexión automáticamente

    if (err.code === 'XX000' || err.message.includes('DbHandler exited')) {
        console.warn('⚠️ Supabase cerró la conexión. El pool creará una nueva automáticamente.');
    }

    if (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') {
        console.warn('⚠️ Conexión perdida. Reconectando.. .');
    }
});

// ========================================
// CONFIGURAR TIMEZONE AL CONECTAR
// ========================================
pool.on('connect', (client) => {
    client.query("SET timezone = 'America/Guayaquil'").catch(err => {
        console.error('❌ Error al configurar timezone:', err.message);
    });
});

// ========================================
// VERIFICAR CONEXIÓN INICIAL
// ========================================
pool.connect()
    .then(client => {
        console.log('✅ Conectado exitosamente a Supabase (Timezone: America/Guayaquil)');
        console.log(`📊 Pool configurado: max=${pool.options.max}, idle=${pool.options.idleTimeoutMillis}ms`);
        client.release();
    })
    .catch(err => {
        console.error('❌ Error al conectar con Supabase:', err.message);
    });

// ========================================
// FUNCIÓN HELPER PARA QUERIES SEGURAS
// ========================================
const queryWithRetry = async (text, params, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await pool.query(text, params);
        } catch (error) {
            console.error(`❌ Query falló (intento ${i + 1}/${retries}):`, error.message);

            if (i === retries - 1) throw error; // Último intento

            // Esperar antes de reintentar
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
};

// ========================================
// MONITOREO DEL POOL (OPCIONAL)
// ========================================
setInterval(() => {
    const { totalCount, idleCount, waitingCount } = pool;
    if (waitingCount > 0 || totalCount > 3) {
        console.log(`📊 Pool Status:  Total=${totalCount}, Idle=${idleCount}, Waiting=${waitingCount}`);
    }
}, 30000); // Cada 30 segundos

module.exports = pool;
module.exports.queryWithRetry = queryWithRetry;