const CompraRepuesto = require('../models/compraRepuesto.models');
const Repuesto = require('../models/repuesto.models');
const Tarjeta = require('../models/tarjeta.models');
const pool = require('../config/db');

// ========================================
//  PROCESAR COMPRA DE REPUESTO
// ========================================
exports.procesarCompra = async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const id_usuario = req.usuario.id_usuario;
        const { id_repuesto, id_tarjeta, cantidad } = req.body;

        // Validaciones
        if (!id_repuesto || !id_tarjeta || !cantidad || cantidad <= 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                error: 'Datos incompletos o inválidos'
            });
        }

        // 1. Verificar que el repuesto existe y tiene stock
        const repuesto = await Repuesto.getById(id_repuesto);
        if (!repuesto) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                error: 'Repuesto no encontrado'
            });
        }

        if (repuesto.stock < cantidad) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                error: `Stock insuficiente. Disponible: ${repuesto.stock}`
            });
        }

        // 2. Calcular totales (IVA 15%)
        const precio_unitario = parseFloat(repuesto.precio);
        const subtotal = precio_unitario * cantidad;
        const iva = subtotal * 0.15;
        const total = subtotal + iva;

        // 3. Verificar que la tarjeta existe y tiene saldo suficiente
        const tarjetaResult = await client.query(
            'SELECT * FROM tarjetas WHERE id_tarjeta = $1 AND id_usuario = $2',
            [id_tarjeta, id_usuario]
        );

        if (tarjetaResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                error: 'Tarjeta no encontrada'
            });
        }

        const tarjeta = tarjetaResult.rows[0];
        if (parseFloat(tarjeta.saldo) < total) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                error: 'Saldo insuficiente en la tarjeta'
            });
        }

        // 4. Descontar saldo de la tarjeta
        await client.query(
            'UPDATE tarjetas SET saldo = saldo - $1 WHERE id_tarjeta = $2',
            [total, id_tarjeta]
        );

        // 5. Reducir stock del repuesto
        await client.query(
            `UPDATE repuestos 
             SET stock = stock - $1,
                 estado = CASE 
                     WHEN (stock - $1) <= 0 THEN 'Agotado'
                     ELSE 'Disponible'
                 END
             WHERE id_repuesto = $2`,
            [cantidad, id_repuesto]
        );

        // 6. Crear registro de compra
        const compraResult = await client.query(
            `INSERT INTO compras_repuestos (
                id_usuario, id_repuesto, id_tarjeta, cantidad,
                precio_unitario, subtotal, iva, total,
                numero_factura
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 
                    'REP-' || nextval('repuesto_factura_seq'))
            RETURNING *`,
            [id_usuario, id_repuesto, id_tarjeta, cantidad, precio_unitario, subtotal, iva, total]
        );

        await client.query('COMMIT');

        const compra = compraResult.rows[0];

        res.status(201).json({
            message: 'Compra realizada exitosamente',
            data: {
                compra,
                numero_factura: compra.numero_factura,
                total: compra.total
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al procesar compra:', error);
        res.status(500).json({
            error: 'Error al procesar la compra',
            detalle: error.message
        });
    } finally {
        client.release();
    }
};

// ========================================
//  OBTENER HISTORIAL DE COMPRAS
// ========================================
exports.obtenerHistorial = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;
        const compras = await CompraRepuesto.getByUsuario(id_usuario);

        res.json({
            message: 'Historial obtenido exitosamente',
            data: compras
        });
    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({
            error: 'Error al obtener historial de compras'
        });
    }
};

// ========================================
//  OBTENER COMPRA POR ID (Para factura)
// ========================================
exports.obtenerPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const compra = await CompraRepuesto.getById(id);

        if (!compra) {
            return res.status(404).json({
                error: 'Compra no encontrada'
            });
        }

        res.json({
            message: 'Compra obtenida exitosamente',
            data: compra
        });
    } catch (error) {
        console.error('Error al obtener compra:', error);
        res.status(500).json({
            error: 'Error al obtener la compra'
        });
    }
};

// ========================================
//  OBTENER TODAS LAS COMPRAS (ADMIN)
// ========================================
exports.getAllCompras = async (req, res) => {
    try {
        const compras = await CompraRepuesto.getAll();

        res.json({
            message: 'Compras obtenidas exitosamente',
            data: compras
        });
    } catch (error) {
        console.error('Error al obtener compras:', error);
        res.status(500).json({
            error: 'Error al obtener compras'
        });
    }
};