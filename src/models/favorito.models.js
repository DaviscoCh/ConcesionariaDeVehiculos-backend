const pool = require('../config/db');

// ---------------------------------------------
//  AGREGAR VEHÍCULO A FAVORITOS
// ---------------------------------------------
exports.agregar = async (id_usuario, id_vehiculo) => {
    const result = await pool.query(
        `INSERT INTO favoritos (id_usuario, id_vehiculo)
         VALUES ($1, $2)
         ON CONFLICT (id_usuario, id_vehiculo) DO NOTHING
         RETURNING *`,
        [id_usuario, id_vehiculo]
    );
    return result.rows[0];
};

// ---------------------------------------------
//  ELIMINAR VEHÍCULO DE FAVORITOS
// ---------------------------------------------
exports.eliminar = async (id_usuario, id_vehiculo) => {
    const result = await pool.query(
        `DELETE FROM favoritos
         WHERE id_usuario = $1 AND id_vehiculo = $2
         RETURNING *`,
        [id_usuario, id_vehiculo]
    );
    return result.rows[0];
};

// ---------------------------------------------
//  OBTENER TODOS LOS FAVORITOS DE UN USUARIO
// ---------------------------------------------
exports.obtenerPorUsuario = async (id_usuario) => {
    const result = await pool.query(
        `SELECT 
            f.id_favorito,
            f.id_vehiculo,
            f.fecha_agregado,
            v.anio,
            v.color,
            v.precio,
            v.tipo,
            v.estado,
            v.descripcion,
            v.imagen_url,
            mo.nombre as modelo_nombre,
            ma.nombre as marca_nombre
         FROM favoritos f
         INNER JOIN vehiculos v ON f.id_vehiculo = v.id_vehiculo
         INNER JOIN modelos mo ON v.id_modelo = mo.id_modelo
         INNER JOIN marcas ma ON mo.id_marca = ma.id_marca
         WHERE f.id_usuario = $1
         ORDER BY f.fecha_agregado DESC`,
        [id_usuario]
    );
    return result.rows;
};

// ---------------------------------------------
//  VERIFICAR SI UN VEHÍCULO ESTÁ EN FAVORITOS
// ---------------------------------------------
exports.esFavorito = async (id_usuario, id_vehiculo) => {
    const result = await pool.query(
        `SELECT EXISTS(
            SELECT 1 FROM favoritos
            WHERE id_usuario = $1 AND id_vehiculo = $2
         ) as es_favorito`,
        [id_usuario, id_vehiculo]
    );
    return result.rows[0].es_favorito;
};