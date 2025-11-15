const jwt = require('jsonwebtoken');
require('dotenv').config();

function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!authHeader || !authHeader.startsWith('Bearer ') || !token) {
        return res.status(401).json({ message: 'Token no válido o no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded; // contiene id_usuario y rol
        next();
    } catch (err) {
        console.error('❌ Error al validar token:', err.message);
        return res.status(403).json({ message: 'Token inválido o expirado' });
    }
}

function adminOnly(req, res, next) {
    const usuario = req.usuario;
    if (!usuario || usuario.rol !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado: solo administradores' });
    }
    next();
}

module.exports = {
    authMiddleware,
    adminOnly
};