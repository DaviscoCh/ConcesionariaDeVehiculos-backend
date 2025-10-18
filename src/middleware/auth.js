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
        req.user = decoded; // Ahora puedes acceder a req.user.id_usuario, req.user.correo, etc.
        next();
    } catch (err) {
        console.error('❌ Error al validar token:', err.message);
        return res.status(403).json({ message: 'Token inválido o expirado' });
    }
}

module.exports = authMiddleware;