const cron = require('node-cron');
const Cita = require('../models/cita.models');
const Horario = require('../models/horarios.models');

exports.iniciarJobCitasVencidas = () => {
    cron.schedule('*/2 * * * *', async () => {
        try {
            console.log('🔄 [CRON] Verificando citas vencidas...');

            // ✅ Obtener hora actual en Ecuador usando Intl API
            const formatter = new Intl.DateTimeFormat('es-EC', {
                timeZone: 'America/Guayaquil',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });

            const ahora = new Date();
            const partes = formatter.formatToParts(ahora);
            const obtenerValor = (tipo) => partes.find(p => p.type === tipo)?.value;

            const año = obtenerValor('year');
            const mes = obtenerValor('month');
            const dia = obtenerValor('day');
            const horaActual = parseInt(obtenerValor('hour'));
            const minutoActual = parseInt(obtenerValor('minute'));

            // Calcular hora con 20 minutos de tolerancia RESTADOS
            let horaLimite = horaActual;
            let minutoLimite = minutoActual - 20;

            // Ajustar si los minutos son negativos
            if (minutoLimite < 0) {
                minutoLimite += 60;
                horaLimite -= 1;
            }

            // Ajustar si la hora es negativa (pasó medianoche)
            let fechaLimite = `${año}-${mes}-${dia}`;
            if (horaLimite < 0) {
                horaLimite += 24;
                // Calcular día anterior
                const fechaAnterior = new Date(`${año}-${mes}-${dia}`);
                fechaAnterior.setDate(fechaAnterior.getDate() - 1);
                const mesAnterior = String(fechaAnterior.getMonth() + 1).padStart(2, '0');
                const diaAnterior = String(fechaAnterior.getDate()).padStart(2, '0');
                fechaLimite = `${fechaAnterior.getFullYear()}-${mesAnterior}-${diaAnterior}`;
            }

            const horaLimiteStr = `${horaLimite.toString().padStart(2, '0')}:${minutoLimite.toString().padStart(2, '0')}:00`;

            console.log(`🕐 [CRON] Ahora (Ecuador): ${dia}/${mes}/${año} ${horaActual}:${minutoActual.toString().padStart(2, '0')}`);
            console.log(`🕐 [CRON] Límite con tolerancia: ${fechaLimite} ${horaLimiteStr}`);

            // Buscar citas vencidas
            const { rows: citasVencidas } = await require('../config/db').query(
                `SELECT c.*
                 FROM citas c
                 WHERE c.estado IN ('Pendiente', 'Confirmada')
                   AND (
                       c.fecha < $1 
                       OR (c.fecha = $1 AND c.hora <= $2)
                   )
                 ORDER BY c.fecha, c.hora`,
                [fechaLimite, horaLimiteStr]
            );

            if (citasVencidas.length === 0) {
                console.log('✅ [CRON] No hay citas vencidas');
                return;
            }

            console.log(`⚠️ [CRON] Encontradas ${citasVencidas.length} citas vencidas:`);

            for (const cita of citasVencidas) {
                console.log(`   📅 Cita ${cita.id_cita.substring(0, 8)}: ${cita.fecha} ${cita.hora} (${cita.estado})`);

                // Cancelar la cita
                await Cita.actualizarEstado(cita.id_cita, 'Cancelada');

                // ✅ NUEVA LÓGICA: Verificar si el horario ya pasó
                const horarioCita = `${cita.fecha} ${cita.hora}`;
                const fechaHoraCita = new Date(horarioCita);
                const fechaHoraActual = new Date(`${año}-${mes}-${dia} ${horaActual.toString().padStart(2, '0')}:${minutoActual.toString().padStart(2, '0')}:00`);

                // Si el horario de la cita ya pasó completamente (sin tolerancia)
                if (fechaHoraCita < fechaHoraActual) {
                    console.log(`   ⏰ Horario ${cita.hora} ya pasó - NO se libera`);
                    // NO liberamos el horario, lo dejamos como está o lo marcamos como ocupado
                    // para que no aparezca en los horarios disponibles
                    await Horario.marcarOcupado({
                        id_oficina: cita.id_oficina,
                        fecha: cita.fecha,
                        hora: cita.hora
                    });
                    console.log(`   🔒 Horario marcado como ocupado (ya pasó)`);
                } else {
                    // Si el horario aún no ha pasado completamente, sí lo liberamos
                    await Horario.marcarLibre({
                        id_oficina: cita.id_oficina,
                        fecha: cita.fecha,
                        hora: cita.hora
                    });
                    console.log(`   ✅ Horario liberado (aún no pasa)`);
                }

                console.log(`   ✅ Cita cancelada`);
            }

            console.log('✅ [CRON] Proceso completado\n');

        } catch (error) {
            console.error('❌ [CRON] Error:', error);
            console.error(error.stack);
        }
    });

    console.log('🚀 Job de citas vencidas iniciado (cada 2 min, tolerancia 20 min, zona Ecuador)');
};