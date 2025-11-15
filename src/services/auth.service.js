const db = require('../config/db'); // conexión a Supabase/PostgreSQL
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const AuthService = {
    async login(correo, password) {
        try {
            // Buscar usuario por correo
            const query = `SELECT * FROM usuario WHERE correo = $1 AND estado = 'activo'`;
            const result = await db.query(query, [correo]);

            if (result.rows.length === 0) return null;

            const usuario = result.rows[0];

            // Validar contraseña
            const match = await bcrypt.compare(password, usuario.password);
            if (!match) return null;

            // Determinar si es admin por dominio
            const isAdmin = correo.endsWith('@carpremier.com');
            const rol = isAdmin ? 'admin' : 'usuario';

            // Generar token
            const token = jwt.sign(
                { id_usuario: usuario.id_usuario, rol },
                process.env.JWT_SECRET,
                { expiresIn: '2h' }
            );

            // Obtener datos de persona (opcional)
            const personaQuery = `SELECT * FROM persona WHERE id_persona = $1`;
            const personaRes = await db.query(personaQuery, [usuario.id_persona]);
            const persona = personaRes.rows[0];

            return {
                token,
                rol,
                usuario: {
                    id_usuario: usuario.id_usuario,
                    nombres: persona?.nombres,
                    apellidos: persona?.apellidos,
                    correo: usuario.correo
                }
            };
        } catch (err) {
            console.error('❌ Error en login:', err.message);
            throw err;
        }
    },

    async register(data) {
        try {
            const hashedPassword = await bcrypt.hash(data.password, 10);
            const query = `
        INSERT INTO usuario (id_persona, correo, password, estado, fecha_creacion)
        VALUES ($1, $2, $3, 'activo', NOW())
        RETURNING *`;
            const result = await db.query(query, [data.id_persona, data.correo, hashedPassword]);
            return result.rows[0];
        } catch (err) {
            console.error('❌ Error en registro:', err.message);
            throw err;
        }
    }
};

module.exports = AuthService;