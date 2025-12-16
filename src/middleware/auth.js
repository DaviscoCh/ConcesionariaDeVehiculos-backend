const jwt = require('jsonwebtoken');
require('dotenv').config();

function authMiddleware(req, res, next) {
    console.log('🔐 [AUTH] Middleware ejecutado en:', req.method, req.path);

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!authHeader || !authHeader.startsWith('Bearer ') || !token) {
        console.log('❌ [AUTH] Token no proporcionado o inválido');
        return res.status(401).json({ message: 'Token no válido o no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded;
        console.log('✅ [AUTH] Token válido para usuario:', decoded.id_usuario);
        next();
    } catch (err) {
        console.error('❌ [AUTH] Error al validar token:', err.message);
        return res.status(403).json({ message: 'Token inválido o expirado' });
    }
}

function adminOnly(req, res, next) {
    console.log('👑 [ADMIN] Verificando rol de administrador');
    const usuario = req.usuario;
    if (!usuario || usuario.rol !== 'admin') {
        console.log('❌ [ADMIN] Acceso denegado para:', usuario?.rol || 'sin usuario');
        return res.status(403).json({ message: 'Acceso denegado: solo administradores' });
    }
    console.log('✅ [ADMIN] Acceso permitido');
    next();
}

module.exports = {
    authMiddleware,
    adminOnly
};