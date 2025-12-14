const Favorito = require('../models/favorito.models');

// ---------------------------------------------
//  AGREGAR VEHÍCULO A FAVORITOS
// ---------------------------------------------
exports.agregar = async (req, res) => {
    try {
        const { id_vehiculo } = req.body;
        const id_usuario = req.usuario.id_usuario; // Del middleware auth

        if (!id_vehiculo) {
            return res.status(400).json({
                error: 'El id del vehículo es requerido'
            });
        }

        const favorito = await Favorito.agregar(id_usuario, id_vehiculo);

        if (!favorito) {
            return res.status(200).json({
                message: 'El vehículo ya estaba en favoritos'
            });
        }

        res.status(201).json({
            message: 'Vehículo agregado a favoritos',
            data: favorito
        });
    } catch (error) {
        console.error('Error al agregar favorito:', error);
        res.status(500).json({
            error: 'Error al agregar a favoritos'
        });
    }
};

// ---------------------------------------------
//  ELIMINAR VEHÍCULO DE FAVORITOS
// ---------------------------------------------
exports.eliminar = async (req, res) => {
    try {
        const { id_vehiculo } = req.params;
        const id_usuario = req.usuario.id_usuario;

        const favorito = await Favorito.eliminar(id_usuario, id_vehiculo);

        if (!favorito) {
            return res.status(404).json({
                error: 'Favorito no encontrado'
            });
        }

        res.json({
            message: 'Vehículo eliminado de favoritos',
            data: favorito
        });
    } catch (error) {
        console.error('Error al eliminar favorito:', error);
        res.status(500).json({
            error: 'Error al eliminar de favoritos'
        });
    }
};

// ---------------------------------------------
//  OBTENER TODOS LOS FAVORITOS DEL USUARIO
// ---------------------------------------------
exports.obtenerTodos = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;
        const favoritos = await Favorito.obtenerPorUsuario(id_usuario);

        res.json({
            message: 'Favoritos obtenidos exitosamente',
            data: favoritos
        });
    } catch (error) {
        console.error('Error al obtener favoritos:', error);
        res.status(500).json({
            error: 'Error al obtener favoritos'
        });
    }
};

// ---------------------------------------------
//  VERIFICAR SI UN VEHÍCULO ES FAVORITO
// ---------------------------------------------
exports.verificar = async (req, res) => {
    try {
        const { id_vehiculo } = req.params;
        const id_usuario = req.usuario.id_usuario;

        const esFavorito = await Favorito.esFavorito(id_usuario, id_vehiculo);

        res.json({
            es_favorito: esFavorito
        });
    } catch (error) {
        console.error('Error al verificar favorito:', error);
        res.status(500).json({
            error: 'Error al verificar favorito'
        });
    }
};