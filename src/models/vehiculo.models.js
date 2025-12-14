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
    imagen_url
}) => {
    const result = await pool.query(
        `INSERT INTO vehiculos (
      id_modelo, anio, color, precio, tipo, estado,
      descripcion, fecha_ingreso, imagen_url
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`,
        [id_modelo, anio, color, precio, tipo, estado, descripcion, fecha_ingreso, imagen_url]
    );
    return result.rows[0];
};

// Obtener vehículos con filtros dinámicos
exports.getFiltered = async (filtros) => {
    let query = 'SELECT * FROM vista_vehiculos WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Filtro por marca
    if (filtros.marca && filtros.marca !== '') {
        query += ` AND LOWER(marca) = LOWER($${paramIndex})`;
        params.push(filtros.marca);
        paramIndex++;
    }

    // Filtro por modelo
    if (filtros.modelo && filtros.modelo !== '') {
        query += ` AND LOWER(modelo) = LOWER($${paramIndex})`;
        params.push(filtros.modelo);
        paramIndex++;
    }

    // Filtro por año
    if (filtros.anio && filtros.anio !== '') {
        query += ` AND anio = $${paramIndex}`;
        params.push(parseInt(filtros.anio));
        paramIndex++;
    }

    // Filtro por tipo
    if (filtros.tipo && filtros.tipo !== '') {
        query += ` AND LOWER(tipo) = LOWER($${paramIndex})`;
        params.push(filtros.tipo);
        paramIndex++;
    }

    // Filtro por color
    if (filtros.color && filtros.color !== '') {
        query += ` AND LOWER(color) = LOWER($${paramIndex})`;
        params.push(filtros.color);
        paramIndex++;
    }

    // Filtro por precio mínimo
    if (filtros.precioMin && filtros.precioMin !== '') {
        query += ` AND precio >= $${paramIndex}`;
        params.push(parseFloat(filtros.precioMin));
        paramIndex++;
    }

    // Filtro por precio máximo
    if (filtros.precioMax && filtros.precioMax !== '') {
        query += ` AND precio <= $${paramIndex}`;
        params.push(parseFloat(filtros.precioMax));
        paramIndex++;
    }

    // Filtro por estado (disponible/vendido)
    if (filtros.estado && filtros.estado !== '') {
        query += ` AND LOWER(estado) = LOWER($${paramIndex})`;
        params.push(filtros.estado);
        paramIndex++;
    }

    // Filtro por stock (solo mostrar vehículos con stock disponible)
    if (filtros.stock && filtros.stock !== '') {
        query += ` AND stock > 0`;
    }

    // Búsqueda general (por modelo, marca, descripción, tipo o color)
    if (filtros.busqueda && filtros.busqueda !== '') {
        query += ` AND (
            LOWER(modelo) LIKE LOWER($${paramIndex}) OR
            LOWER(marca) LIKE LOWER($${paramIndex}) OR
            LOWER(descripcion) LIKE LOWER($${paramIndex}) OR
            LOWER(tipo) LIKE LOWER($${paramIndex}) OR
            LOWER(color) LIKE LOWER($${paramIndex})
        )`;
        params.push(`%${filtros.busqueda}%`);
        paramIndex++;
    }

    // Ordenar por fecha de ingreso (más recientes primero)
    query += ' ORDER BY fecha_ingreso DESC';

    const result = await pool.query(query, params);
    return result.rows;
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
        imagen_url
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
      imagen_url = $9
    WHERE id_vehiculo = $10
    RETURNING *`,
        [id_modelo, anio, color, precio, tipo, estado, descripcion, fecha_ingreso, imagen_url, id_vehiculo]
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