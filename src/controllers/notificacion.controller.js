const Notificacion = require('../models/notificacion.models');

// ---------------------------------------------
//  OBTENER NOTIFICACIONES DEL USUARIO
// ---------------------------------------------
exports.getMisNotificaciones = async (req, res) => {
    try {
        const { id_usuario } = req.usuario; // Del middleware de autenticación
        const notificaciones = await Notificacion.getByUsuario(id_usuario);
        res.json(notificaciones);
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        res.status(500).json({ error: error.message });
    }
};

// ---------------------------------------------
//  OBTENER CONTADOR DE NO LEÍDAS
// ---------------------------------------------
exports.getContadorNoLeidas = async (req, res) => {
    try {
        const { id_usuario } = req.usuario;
        const total = await Notificacion.getNoLeidas(id_usuario);
        res.json({ total });
    } catch (error) {
        console.error('Error al obtener contador:', error);
        res.status(500).json({ error: error.message });
    }
};

// ---------------------------------------------
//  MARCAR NOTIFICACIÓN COMO LEÍDA
// ---------------------------------------------
exports.marcarLeida = async (req, res) => {
    try {
        const { id } = req.params;
        const notificacion = await Notificacion.marcarLeida(id);
        
        if (!notificacion) {
            return res.status(404).json({ error: 'Notificación no encontrada' });
        }
        
        res.json({ message: 'Notificación marcada como leída', notificacion });
    } catch (error) {
        console.error('Error al marcar como leída:', error);
        res.status(500).json({ error: error.message });
    }
};

// ---------------------------------------------
//  MARCAR TODAS COMO LEÍDAS
// ---------------------------------------------
exports.marcarTodasLeidas = async (req, res) => {
    try {
        const { id_usuario } = req.usuario;
        const notificaciones = await Notificacion.marcarTodasLeidas(id_usuario);
        res.json({ 
            message: 'Todas las notificaciones marcadas como leídas',
            total: notificaciones.length 
        });
    } catch (error) {
        console.error('Error al marcar todas como leídas:', error);
        res.status(500).json({ error: error.message });
    }
};

// ---------------------------------------------
//  ELIMINAR NOTIFICACIÓN
// ---------------------------------------------
exports.eliminar = async (req, res) => {
    try {
        const { id } = req.params;
        const notificacion = await Notificacion.eliminar(id);
        
        if (!notificacion) {
            return res.status(404).json({ error: 'Notificación no encontrada' });
        }
        
        res.json({ message: 'Notificación eliminada', notificacion });
    } catch (error) {
        console.error('Error al eliminar notificación:', error);
        res.status(500).json({ error: error.message });
    }
};