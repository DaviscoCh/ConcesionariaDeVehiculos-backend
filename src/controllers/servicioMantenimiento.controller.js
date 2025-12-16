const servicioModel = require('../models/servicioMantenimiento.models');

// Asegúrate que TODAS las funciones usen exports.nombreFuncion
exports.getAllServicios = async (req, res) => {
    try {
        const servicios = await servicioModel.getAll();
        res.status(200).json(servicios);
    } catch (error) {
        console.error('Error al obtener servicios:', error);
        res.status(500).json({ error: 'Error al obtener servicios', detalle: error.message });
    }
};

exports.getServiciosByCategoria = async (req, res) => {
    try {
        const { categoria } = req.params;
        const servicios = await servicioModel.getByCategoria(categoria);
        res.status(200).json(servicios);
    } catch (error) {
        console.error('Error al obtener servicios por categoría:', error);
        res.status(500).json({ error: 'Error al obtener servicios', detalle: error.message });
    }
};

exports.getServicioById = async (req, res) => {
    try {
        const { id } = req.params;
        const servicio = await servicioModel.getById(id);

        if (!servicio) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }

        res.status(200).json(servicio);
    } catch (error) {
        console.error('Error al obtener servicio:', error);
        res.status(500).json({ error: 'Error al obtener servicio', detalle: error.message });
    }
};

exports.getCategorias = async (req, res) => {
    try {
        const categorias = await servicioModel.getCategorias();
        res.status(200).json(categorias);
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ error: 'Error al obtener categorías', detalle: error.message });
    }
};

exports.createServicio = async (req, res) => {
    try {
        const servicioData = req.body;

        if (!servicioData.nombre || !servicioData.precio_mano_obra) {
            return res.status(400).json({ error: 'Nombre y precio son requeridos' });
        }

        const nuevoServicio = await servicioModel.create(servicioData);
        res.status(201).json({ mensaje: 'Servicio creado exitosamente', servicio: nuevoServicio });
    } catch (error) {
        console.error('Error al crear servicio:', error);
        res.status(500).json({ error: 'Error al crear servicio', detalle: error.message });
    }
};

exports.updateServicio = async (req, res) => {
    try {
        const { id } = req.params;
        const servicioData = req.body;

        const servicioActualizado = await servicioModel.update(id, servicioData);
        res.status(200).json({ mensaje: 'Servicio actualizado exitosamente', servicio: servicioActualizado });
    } catch (error) {
        console.error('Error al actualizar servicio:', error);
        res.status(500).json({ error: 'Error al actualizar servicio', detalle: error.message });
    }
};

exports.deleteServicio = async (req, res) => {
    try {
        const { id } = req.params;
        await servicioModel.delete(id);
        res.status(200).json({ mensaje: 'Servicio eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar servicio:', error);
        res.status(500).json({ error: 'Error al eliminar servicio', detalle: error.message });
    }
};