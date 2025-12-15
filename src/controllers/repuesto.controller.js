const Repuesto = require('../models/repuesto.models');

// ========================================
//  OBTENER TODOS LOS REPUESTOS
// ========================================
exports.getAll = async (req, res) => {
    try {
        const repuestos = await Repuesto.getAll();
        res.json({
            message: 'Repuestos obtenidos exitosamente',
            data: repuestos
        });
    } catch (error) {
        console.error('Error al obtener repuestos:', error);
        res.status(500).json({
            error: 'Error al obtener repuestos'
        });
    }
};

// ========================================
//  OBTENER REPUESTO POR ID
// ========================================
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const repuesto = await Repuesto.getById(id);

        if (!repuesto) {
            return res.status(404).json({
                error: 'Repuesto no encontrado'
            });
        }

        res.json({
            message: 'Repuesto obtenido exitosamente',
            data: repuesto
        });
    } catch (error) {
        console.error('Error al obtener repuesto:', error);
        res.status(500).json({
            error: 'Error al obtener repuesto'
        });
    }
};

// ========================================
//  OBTENER REPUESTOS COMPATIBLES (Usuario autenticado)
// ========================================
exports.getCompatibles = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;
        const repuestos = await Repuesto.getRepuestosCompatibles(id_usuario);

        res.json({
            message: 'Repuestos compatibles obtenidos exitosamente',
            data: repuestos
        });
    } catch (error) {
        console.error('Error al obtener repuestos compatibles:', error);
        res.status(500).json({
            error: 'Error al obtener repuestos compatibles'
        });
    }
};

// ========================================
//  OBTENER VEHÍCULOS DEL USUARIO
// ========================================
exports.getVehiculosUsuario = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;
        const vehiculos = await Repuesto.getVehiculosUsuario(id_usuario);

        res.json({
            message: 'Vehículos obtenidos exitosamente',
            data: vehiculos
        });
    } catch (error) {
        console.error('Error al obtener vehículos:', error);
        res.status(500).json({
            error: 'Error al obtener vehículos del usuario'
        });
    }
};

// ========================================
//  CREAR REPUESTO (ADMIN)
// ========================================
exports.create = async (req, res) => {
    try {
        const repuestoData = req.body;
        const repuesto = await Repuesto.create(repuestoData);

        res.status(201).json({
            message: 'Repuesto creado exitosamente',
            data: repuesto
        });
    } catch (error) {
        console.error('Error al crear repuesto:', error);
        res.status(500).json({
            error: 'Error al crear repuesto'
        });
    }
};

// ========================================
//  ACTUALIZAR REPUESTO (ADMIN)
// ========================================
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const repuestoData = req.body;
        const repuesto = await Repuesto.update(id, repuestoData);

        if (!repuesto) {
            return res.status(404).json({
                error: 'Repuesto no encontrado'
            });
        }

        res.json({
            message: 'Repuesto actualizado exitosamente',
            data: repuesto
        });
    } catch (error) {
        console.error('Error al actualizar repuesto:', error);
        res.status(500).json({
            error: 'Error al actualizar repuesto'
        });
    }
};

// ========================================
//  ELIMINAR REPUESTO (ADMIN)
// ========================================
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const repuesto = await Repuesto.delete(id);

        if (!repuesto) {
            return res.status(404).json({
                error: 'Repuesto no encontrado'
            });
        }

        res.json({
            message: 'Repuesto eliminado exitosamente',
            data: repuesto
        });
    } catch (error) {
        console.error('Error al eliminar repuesto:', error);
        res.status(500).json({
            error: 'Error al eliminar repuesto'
        });
    }
};