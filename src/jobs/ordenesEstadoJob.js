const ordenModel = require('../models/ordenServicio.models');
const pool = require('../config/db');

// ========================================
// JOB:  ACTUALIZAR ESTADOS DE ÓRDENES
// ========================================
const actualizarEstadosOrdenes = async () => {
    let client;
    try {
        console.log('🔄 Verificando estados de órdenes...');

        // ✅ Obtener cliente del pool
        client = await pool.connect();

        // 1. Cambiar "Aprobado" → "En Proceso"
        const ordenesAprobadas = await client.query(
            `SELECT * FROM ordenes_servicio 
             WHERE estado = 'Aprobado' 
             AND estado_pago = 'Pagado'
             AND fecha_pago IS NOT NULL
             AND fecha_pago <= NOW() - INTERVAL '5 minutes'
             AND fecha_inicio IS NULL`
        );

        for (const orden of ordenesAprobadas.rows) {
            await ordenModel.updateEstado(orden.id_orden, 'En Proceso', {
                fecha_inicio: new Date()
            });
            console.log(`✅ Orden ${orden.numero_orden} → En Proceso`);
        }

        // 2. Cambiar "En Proceso" → "Completado"
        const ordenesEnProceso = await client.query(
            `SELECT * FROM ordenes_servicio 
             WHERE estado = 'En Proceso'
             AND fecha_inicio IS NOT NULL
             AND tiempo_estimado_minutos > 0
             AND fecha_inicio <= NOW() - (tiempo_estimado_minutos || ' minutes')::INTERVAL`
        );

        for (const orden of ordenesEnProceso.rows) {
            await ordenModel.updateEstado(orden.id_orden, 'Completado', {
                fecha_finalizacion: new Date(),
                diagnostico_tecnico: orden.diagnostico_tecnico || 'Servicio completado satisfactoriamente'
            });
            console.log(`✅ Orden ${orden.numero_orden} → Completado`);
        }

        console.log(`✅ Verificación completada (Aprobadas: ${ordenesAprobadas.rows.length}, Completadas: ${ordenesEnProceso.rows.length})`);

    } catch (error) {
        console.error('❌ Error al actualizar estados:', error.message);
    } finally {
        // ✅ IMPORTANTE: Siempre liberar el cliente
        if (client) {
            client.release();
        }
    }
};

// ========================================
// INICIAR JOB CON INTERVALO
// ========================================
const iniciarJob = () => {
    console.log('🚀 Job de estados de órdenes iniciado (cada 60s)');

    // Ejecutar inmediatamente
    actualizarEstadosOrdenes();

    // Ejecutar cada 60 segundos
    setInterval(actualizarEstadosOrdenes, 60000);
};

module.exports = { iniciarJob, actualizarEstadosOrdenes };