const pool = require('../config/db');

// Obtener todos los vehículos desde la vista
exports.getAll = async () => {
    const result = await pool.query('SELECT * FROM vista_vehiculos');
    return result.rows;
};

// Obtener un vehículo por su ID desde la vista
exports.getById = async (id_vehiculo) => {
    const result = await pool.query(
        'SELECT * FROM vista_vehiculos WHERE id_vehiculo = $1',
        [id_vehiculo]
    );
    return result.rows[0];
};

// Crear un vehículo
exports.create = async ({
    id_modelo,
    anio,
    color,
    precio,
    tipo,
    estado,
    descripcion,
    fecha_ingreso,
    imagen_url,
    stock
}) => {
    const result = await pool.query(
        `INSERT INTO vehiculos (
      id_modelo, anio, color, precio, tipo, estado,
      descripcion, fecha_ingreso, imagen_url, stock
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
        [id_modelo, anio, color, precio, tipo, estado, descripcion, fecha_ingreso, imagen_url, stock]
    );
    return result.rows[0];
};

// Actualizar un vehículo
exports.update = async (
    id_vehiculo,
    {
        id_modelo,
        anio,
        color,
        precio,
        tipo,
        estado,
        descripcion,
        fecha_ingreso,
        imagen_url,
        stock
    }
) => {
    const result = await pool.query(
        `UPDATE vehiculos SET
      id_modelo = $1,
      anio = $2,
      color = $3,
      precio = $4,
      tipo = $5,
      estado = $6,
      descripcion = $7,
      fecha_ingreso = $8,
      imagen_url = $9,
      stock = $10
    WHERE id_vehiculo = $11
    RETURNING *`,
        [id_modelo, anio, color, precio, tipo, estado, descripcion, fecha_ingreso, imagen_url, stock, id_vehiculo]
    );
    return result.rows[0];
};

// Eliminar un vehículo
exports.remove = async (id_vehiculo) => {
    const result = await pool.query(
        'DELETE FROM vehiculos WHERE id_vehiculo = $1 RETURNING *',
        [id_vehiculo]
    );
    return result.rows[0];
};