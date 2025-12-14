const pool = require('../config/db');

// ========================================
//  GENERAR FACTURA AUTOMÁTICA DESDE CITA
// ========================================
exports.generarFacturaDesdeCita = async (citaData) => {
  const {
    id_cita,
    id_usuario,
    id_vehiculo,
    precio
  } = citaData;

  // Métodos de pago posibles (selección aleatoria)
  const metodosPago = ['Efectivo', 'Transferencia', 'Tarjeta de Crédito', 'Tarjeta de Débito'];
  const metodoPagoAleatorio = metodosPago[Math.floor(Math.random() * metodosPago.length)];

  // Calcular subtotal, IVA y total (IVA del 15%)
  const subtotal = parseFloat(precio);
  const iva = subtotal * 0.15;
  const total = subtotal + iva;

  const query = `
        INSERT INTO facturas (
            id_cita,
            id_usuario, 
            id_vehiculo, 
            precio, 
            subtotal,
            iva,
            total,
            metodo_pago, 
            estado,
            numero_factura,
            fecha,
            fecha_emision,
            comentario
        )
        VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, 'Pagada', 
            'FACT-' || nextval('factura_numero_seq'),
            NOW(), NOW(), 
            'Factura generada automáticamente por atención de cita'
        )
        RETURNING *;
    `;

  const values = [
    id_cita,
    id_usuario,
    id_vehiculo,
    precio,
    subtotal,
    iva,
    total,
    metodoPagoAleatorio
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// ========================================
//  OBTENER FACTURA POR ID DE CITA
// ========================================
exports.obtenerFacturaPorCita = async (id_cita) => {
  const query = `
        SELECT 
            f.*,
            p.nombres,
            p.apellidos,
            p.documento,
            p.correo,
            p.telefono,
            p.direccion,
            ma.nombre as marca_nombre,
            mo.nombre as modelo_nombre,
            v.anio,
            v.color,
            v.tipo,
            o.nombre as oficina_nombre,
            o.direccion as oficina_direccion,
            c.fecha as fecha_cita,
            c.hora as hora_cita
        FROM facturas f
        INNER JOIN citas c ON f.id_cita = c.id_cita
        INNER JOIN usuario u ON f.id_usuario = u.id_usuario
        INNER JOIN persona p ON u.id_persona = p.id_persona
        INNER JOIN vehiculos v ON f.id_vehiculo = v.id_vehiculo
        INNER JOIN modelos mo ON v.id_modelo = mo.id_modelo
        INNER JOIN marcas ma ON mo.id_marca = ma.id_marca
        INNER JOIN oficinas o ON c.id_oficina = o.id_oficina
        WHERE f.id_cita = $1;
    `;

  const result = await pool.query(query, [id_cita]);
  return result.rows[0];
};

// ========================================
//  OBTENER FACTURA POR ID
// ========================================
exports.obtenerFacturaPorId = async (id_factura) => {
  const query = `
        SELECT 
            f.*,
            p.nombres,
            p.apellidos,
            p.documento,
            p.correo,
            p.telefono,
            p.direccion,
            ma.nombre as marca_nombre,
            mo.nombre as modelo_nombre,
            v.anio,
            v.color,
            v.tipo,
            v.precio as precio_vehiculo,
            o.nombre as oficina_nombre,
            o.direccion as oficina_direccion,
            c.fecha as fecha_cita,
            c.hora as hora_cita
        FROM facturas f
        INNER JOIN citas c ON f.id_cita = c.id_cita
        INNER JOIN usuario u ON f.id_usuario = u.id_usuario
        INNER JOIN persona p ON u.id_persona = p.id_persona
        INNER JOIN vehiculos v ON f.id_vehiculo = v.id_vehiculo
        INNER JOIN modelos mo ON v.id_modelo = mo.id_modelo
        INNER JOIN marcas ma ON mo.id_marca = ma.id_marca
        INNER JOIN oficinas o ON c.id_oficina = o.id_oficina
        WHERE f.id_factura = $1;
    `;

  const result = await pool.query(query, [id_factura]);
  return result.rows[0];
};

// ========================================
//  OBTENER HISTORIAL DE FACTURAS POR USUARIO
// ========================================
exports.obtenerFacturasPorUsuario = async (id_usuario) => {
  const query = `
        SELECT 
            f.id_factura,
            f.numero_factura,
            f.total,
            f.metodo_pago,
            f.estado,
            f.fecha_emision,
            ma.nombre || ' ' || mo.nombre AS nombre_vehiculo,
            v.anio,
            c.fecha as fecha_cita,
            c.hora as hora_cita,
            o.nombre as oficina_nombre
        FROM facturas f
        INNER JOIN citas c ON f.id_cita = c.id_cita
        INNER JOIN vehiculos v ON f.id_vehiculo = v.id_vehiculo
        INNER JOIN modelos mo ON v.id_modelo = mo.id_modelo
        INNER JOIN marcas ma ON mo.id_marca = ma.id_marca
        INNER JOIN oficinas o ON c.id_oficina = o.id_oficina
        WHERE f.id_usuario = $1
        ORDER BY f.fecha_emision DESC;
    `;

  const result = await pool.query(query, [id_usuario]);
  return result.rows;
};

// ========================================
//  VERIFICAR SI YA EXISTE FACTURA PARA UNA CITA
// ========================================
exports.existeFacturaParaCita = async (id_cita) => {
  const query = `
        SELECT EXISTS(
            SELECT 1 FROM facturas WHERE id_cita = $1
        ) as existe;
    `;

  const result = await pool.query(query, [id_cita]);
  return result.rows[0].existe;
};