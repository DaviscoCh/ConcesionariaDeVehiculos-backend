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
//  OBTENER FACTURA POR ID (Citas Y Mantenimiento)
// ========================================
exports.obtenerFacturaPorId = async (id_factura) => {
  console.log('🔍 Buscando factura con id:', id_factura);

  const query = `
    SELECT 
      f.*,
      p.nombres,
      p.apellidos,
      p. documento,
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
      o. direccion as oficina_direccion,
      c.fecha as fecha_cita,
      c. hora as hora_cita,
      -- ✅ Datos de mantenimiento (si es factura de orden)
      os.numero_orden,
      os.tipo_servicio,
      os.descripcion_problema,
      os.diagnostico_tecnico,
      os.fecha_finalizacion,
      os.subtotal_mano_obra,
      os.subtotal_repuestos
    FROM facturas f
    INNER JOIN usuario u ON f.id_usuario = u.id_usuario
    INNER JOIN persona p ON u.id_persona = p.id_persona
    INNER JOIN vehiculos v ON f.id_vehiculo = v.id_vehiculo
    INNER JOIN modelos mo ON v.id_modelo = mo.id_modelo
    INNER JOIN marcas ma ON mo.id_marca = ma.id_marca
    -- ✅ LEFT JOIN para soportar facturas SIN cita
    LEFT JOIN citas c ON f.id_cita = c.id_cita
    LEFT JOIN oficinas o ON c.id_oficina = o.id_oficina
    -- ✅ LEFT JOIN para facturas de mantenimiento
    LEFT JOIN ordenes_servicio os ON f. id_factura = os.id_factura_mantenimiento
    WHERE f.id_factura = $1;
  `;

  const result = await pool.query(query, [id_factura]);

  if (result.rows.length === 0) {
    console.log('⚠️ No se encontró factura con id:', id_factura);
    return null;
  }

  const factura = result.rows[0];
  console.log('✅ Factura encontrada:', factura.numero_factura);
  console.log('📋 Tipo:', factura.id_cita ? 'CITA' : 'MANTENIMIENTO');

  return factura;
};

// Obtener facturas por usuario
exports.obtenerFacturasPorUsuario = async (id_usuario) => {
  const result = await pool.query(
    `SELECT 
      f.*,
      v.id_vehiculo,
      v. anio,
      v.color,
      v.imagen_url,
      mo.id_modelo,
      mo.nombre as modelo_nombre,
      ma.id_marca,
      ma.nombre as marca_nombre,
      c.fecha as fecha_cita,
      c.hora as hora_cita,
      o.nombre as oficina_nombre
    FROM facturas f
    LEFT JOIN vehiculos v ON f.id_vehiculo = v.id_vehiculo
    LEFT JOIN modelos mo ON v.id_modelo = mo.id_modelo
    LEFT JOIN marcas ma ON mo.id_marca = ma. id_marca
    LEFT JOIN citas c ON f.id_cita = c.id_cita
    LEFT JOIN oficinas o ON c.id_oficina = o.id_oficina
    WHERE f.id_usuario = $1
    ORDER BY f.fecha_emision DESC`,
    [id_usuario]
  );

  // Formatear respuesta
  return result.rows.map(row => ({
    id_factura: row.id_factura,
    id_usuario: row.id_usuario,
    id_vehiculo: row.id_vehiculo,
    id_cita: row.id_cita,  // ✅ AGREGAR ESTO
    fecha: row.fecha,
    precio: row.precio,
    metodo_pago: row.metodo_pago,
    estado: row.estado,
    comentario: row.comentario,
    numero_factura: row.numero_factura,
    subtotal: row.subtotal,
    iva: row.iva,
    total: row.total,
    fecha_emision: row.fecha_emision,
    fecha_cita: row.fecha_cita,  // ✅ AGREGAR
    hora_cita: row.hora_cita,    // ✅ AGREGAR
    oficina_nombre: row.oficina_nombre,  // ✅ AGREGAR
    nombre_vehiculo: `${row.marca_nombre || ''} ${row.modelo_nombre || ''}`.trim(),  // ✅ AGREGAR
    anio: row.anio,  // ✅ AGREGAR
    vehiculo: row.id_vehiculo ? {
      id_vehiculo: row.id_vehiculo,
      anio: row.anio,
      color: row.color,
      imagen_url: row.imagen_url,
      modelo: {
        id_modelo: row.id_modelo,
        nombre: row.modelo_nombre,
        marca: {
          id_marca: row.id_marca,
          nombre: row.marca_nombre
        }
      }
    } : null
  }));
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

// ========================================
//  OBTENER HISTORIAL DE FACTURAS POR USUARIO (Citas Y Mantenimiento)
// ========================================
exports.obtenerFacturasPorUsuario = async (id_usuario) => {
  const result = await pool.query(
    `SELECT 
      f. id_factura,
      f. id_usuario,
      f. id_vehiculo,
      f.id_cita,
      f.fecha,
      f. precio,
      f.metodo_pago,
      f. estado,
      f.comentario,
      f.numero_factura,
      f.subtotal,
      f.iva,
      f.total,
      f.fecha_emision,
      -- Datos del vehículo
      v. anio,
      v.color,
      v.imagen_url,
      mo.id_modelo,
      mo.nombre as modelo_nombre,
      ma.id_marca,
      ma.nombre as marca_nombre,
      -- Datos de CITA (si existe)
      c.fecha as fecha_cita,
      c.hora as hora_cita,
      o1.nombre as oficina_cita_nombre,
      -- Datos de ORDEN DE SERVICIO (si existe)
      os.numero_orden,
      os.fecha_finalizacion,
      o2.nombre as oficina_orden_nombre
    FROM facturas f
    LEFT JOIN vehiculos v ON f.id_vehiculo = v.id_vehiculo
    LEFT JOIN modelos mo ON v.id_modelo = mo.id_modelo
    LEFT JOIN marcas ma ON mo.id_marca = ma. id_marca
    -- JOIN para facturas de CITAS
    LEFT JOIN citas c ON f.id_cita = c.id_cita
    LEFT JOIN oficinas o1 ON c.id_oficina = o1.id_oficina
    -- JOIN para facturas de MANTENIMIENTO
    LEFT JOIN ordenes_servicio os ON f. id_factura = os.id_factura_mantenimiento
    LEFT JOIN oficinas o2 ON os.id_oficina = o2.id_oficina
    WHERE f. id_usuario = $1
    ORDER BY f.fecha_emision DESC`,
    [id_usuario]
  );

  // Formatear respuesta
  return result.rows.map(row => {
    // Determinar si es factura de cita o mantenimiento
    const esCita = !!row.id_cita;
    const esMantenimiento = !!row.numero_orden;

    return {
      id_factura: row.id_factura,
      id_usuario: row.id_usuario,
      id_vehiculo: row.id_vehiculo,
      id_cita: row.id_cita,
      fecha: row.fecha,
      precio: row.precio,
      metodo_pago: row.metodo_pago,
      estado: row.estado,
      comentario: row.comentario,
      numero_factura: row.numero_factura,
      subtotal: row.subtotal,
      iva: row.iva,
      total: row.total,
      fecha_emision: row.fecha_emision,

      // ✅ Datos del vehículo
      anio: row.anio,
      nombre_vehiculo: `${row.marca_nombre || ''} ${row.modelo_nombre || ''}`.trim(),

      // ✅ Oficina (de cita O de orden)
      oficina_nombre: row.oficina_cita_nombre || row.oficina_orden_nombre || 'N/A',

      // ✅ Fecha y hora (de cita O de orden)
      fecha_cita: row.fecha_cita || row.fecha_finalizacion,
      hora_cita: row.hora_cita || null,

      // ✅ Objeto vehículo anidado
      vehiculo: row.id_vehiculo ? {
        id_vehiculo: row.id_vehiculo,
        anio: row.anio,
        color: row.color,
        imagen_url: row.imagen_url,
        modelo: {
          id_modelo: row.id_modelo,
          nombre: row.modelo_nombre,
          marca: {
            id_marca: row.id_marca,
            nombre: row.marca_nombre
          }
        }
      } : null
    };
  });
};

// ========================================
//  GENERAR FACTURA DESDE ORDEN DE SERVICIO
// ========================================
exports.generarFacturaDesdeOrden = async (ordenData) => {
  const {
    id_orden,
    id_usuario,
    id_vehiculo,
    subtotal,
    iva,
    total,
    metodo_pago
  } = ordenData;

  console.log('💾 Insertando factura en BD para orden:', id_orden);

  const query = `
    INSERT INTO facturas (
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
      comentario,
      id_cita
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, 'Pagada', 
      'FACT-MANT-' || to_char(nextval('factura_numero_seq'), 'FM000000'),
      NOW(), NOW(), 
      'Factura de servicio de mantenimiento - Orden: ' || $8,
      NULL
    )
    RETURNING *;
  `;

  const values = [
    id_usuario,
    id_vehiculo,
    total, // precio
    subtotal,
    iva,
    total,
    metodo_pago || 'Tarjeta',
    id_orden
  ];

  const result = await pool.query(query, values);

  console.log('✅ Factura insertada:', result.rows[0].id_factura);

  // Actualizar la orden con el id de factura
  await pool.query(
    `UPDATE ordenes_servicio SET id_factura_mantenimiento = $1 WHERE id_orden = $2`,
    [result.rows[0].id_factura, id_orden]
  );

  console.log('✅ Orden actualizada con id_factura');

  return result.rows[0];
};

// ========================================
//  OBTENER FACTURA POR ID DE ORDEN
// ========================================
exports.obtenerFacturaPorOrden = async (id_orden) => {
  console.log('🔍 Buscando factura para orden:', id_orden);

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
      v.imagen_url,
      o.nombre as oficina_nombre,
      o.direccion as oficina_direccion,
      os.numero_orden,
      os.tipo_servicio,
      os.descripcion_problema,
      os.diagnostico_tecnico,
      os.fecha_solicitud,
      os.fecha_finalizacion,
      os.subtotal_mano_obra,
      os.subtotal_repuestos
    FROM facturas f
    INNER JOIN ordenes_servicio os ON f. id_factura = os.id_factura_mantenimiento
    INNER JOIN usuario u ON f.id_usuario = u.id_usuario
    INNER JOIN persona p ON u.id_persona = p.id_persona
    INNER JOIN vehiculos v ON f.id_vehiculo = v.id_vehiculo
    INNER JOIN modelos mo ON v.id_modelo = mo.id_modelo
    INNER JOIN marcas ma ON mo.id_marca = ma.id_marca
    LEFT JOIN oficinas o ON os.id_oficina = o. id_oficina
    WHERE os.id_orden = $1;
  `;

  const result = await pool.query(query, [id_orden]);

  if (result.rows.length === 0) {
    console.log('⚠️ No se encontró factura para la orden');
    return null;
  }

  console.log('✅ Factura encontrada:', result.rows[0].numero_factura);
  return result.rows[0];
};

// ========================================
//  OBTENER DETALLES DE SERVICIOS Y REPUESTOS
// ========================================
exports.obtenerDetallesFacturaOrden = async (id_orden) => {
  const query = `
    SELECT 
      d.tipo_item,
      d.descripcion,
      d.cantidad,
      CAST(d.precio_unitario AS DECIMAL(10,2)) as precio_unitario,
      CAST(d.subtotal AS DECIMAL(10,2)) as subtotal,
      s.nombre as servicio_nombre,
      s.categoria as servicio_categoria,
      r.nombre as repuesto_nombre,
      r.categoria as repuesto_categoria
    FROM ordenes_servicio_detalle d
    LEFT JOIN servicios_mantenimiento s ON d.id_servicio = s.id_servicio
    LEFT JOIN repuestos r ON d.id_repuesto = r.id_repuesto
    WHERE d.id_orden = $1
    ORDER BY d.tipo_item, d.created_at;
  `;

  const result = await pool.query(query, [id_orden]);

  // Asegurar que los valores sean numéricos
  return result.rows.map(row => ({
    ...row,
    precio_unitario: parseFloat(row.precio_unitario) || 0,
    subtotal: parseFloat(row.subtotal) || 0
  }));
};