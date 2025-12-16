const TarjetaService = require('../services/tarjeta.service');
const pool = require('../config/db'); // ✅ DEBE ESTAR AL INICIO

// 💳 Crear una nueva tarjeta
exports.crearTarjeta = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario; // viene del middleware auth.js
        const { numero, nombre, vencimiento, cvv, tipo } = req.body;

        const tarjeta = await TarjetaService.crearTarjeta({
            id_usuario,
            numero,
            nombre,
            vencimiento,
            cvv,
            tipo
        });

        res.status(201).json({ mensaje: 'Tarjeta registrada con éxito', tarjeta });
    } catch (error) {
        console.error('Error al crear tarjeta:', error.message);
        res.status(400).json({ error: error.message });
    }
};

// 📋 Obtener tarjetas del usuario
exports.obtenerTarjetas = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;

        const tarjetas = await TarjetaService.obtenerTarjetas(id_usuario);

        res.status(200).json({ tarjetas });
    } catch (error) {
        console.error('Error al obtener tarjetas:', error.message);
        res.status(500).json({ error: 'Error al obtener tarjetas' });
    }
};

// 💰 Recargar saldo
exports.recargarSaldo = async (req, res) => {
    try {
        const { id_tarjeta, monto } = req.body;

        const resultado = await TarjetaService.recargarSaldo({ id_tarjeta, monto });

        res.status(200).json({ mensaje: 'Saldo recargado con éxito', saldo: resultado.saldo });
    } catch (error) {
        console.error('Error al recargar saldo:', error.message);
        res.status(400).json({ error: error.message });
    }
};

// ========================================
// AGREGAR NUEVA TARJETA
// ========================================
exports.agregarTarjeta = async (req, res) => {
    try {
        const { numero, nombre, vencimiento, cvv, tipo } = req.body;
        const id_usuario = req.usuario.id_usuario;

        // Validaciones básicas
        if (!numero || !nombre || !vencimiento || !cvv) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        // Validar longitud del número de tarjeta
        if (numero.length < 13 || numero.length > 19) {
            return res.status(400).json({ error: 'El número de tarjeta debe tener entre 13 y 19 dígitos' });
        }

        // Validar CVV
        if (cvv.length < 3 || cvv.length > 4) {
            return res.status(400).json({ error: 'El CVV debe tener 3 o 4 dígitos' });
        }

        // ✅ SALDO INICIAL AUTOMÁTICO
        const saldoInicial = tipo === 'credito' ? 50000 : 10000; // Crédito: $50k, Prepago: $10k

        const result = await pool.query(
            `INSERT INTO tarjetas (id_usuario, numero, nombre, vencimiento, cvv, tipo, saldo, estado)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'activa')
             RETURNING *`,
            [id_usuario, numero, nombre, vencimiento, cvv, tipo, saldoInicial]
        );

        console.log(`✅ Tarjeta creada con saldo inicial de $${saldoInicial}`);

        res.status(201).json({
            mensaje: `Tarjeta registrada exitosamente con saldo inicial de $${saldoInicial.toFixed(2)}`,
            tarjeta: result.rows[0]
        });
    } catch (error) {
        console.error('❌ Error al agregar tarjeta:', error);
        res.status(500).json({ error: 'Error al agregar tarjeta' });
    }
};

// ========================================
// ELIMINAR TARJETA
// ========================================
exports.eliminarTarjeta = async (req, res) => {
    try {
        const { id } = req.params;
        const id_usuario = req.usuario.id_usuario;

        // Verificar que la tarjeta pertenezca al usuario
        const verificar = await pool.query(
            'SELECT * FROM tarjetas WHERE id_tarjeta = $1 AND id_usuario = $2',
            [id, id_usuario]
        );

        if (verificar.rows.length === 0) {
            return res.status(404).json({ error: 'Tarjeta no encontrada o no tienes permiso para eliminarla' });
        }

        // Eliminar tarjeta
        await pool.query('DELETE FROM tarjetas WHERE id_tarjeta = $1', [id]);

        console.log(`✅ Tarjeta ${id} eliminada`);

        res.json({ mensaje: 'Tarjeta eliminada exitosamente' });
    } catch (error) {
        console.error('❌ Error al eliminar tarjeta:', error);
        res.status(500).json({ error: 'Error al eliminar tarjeta' });
    }
};
