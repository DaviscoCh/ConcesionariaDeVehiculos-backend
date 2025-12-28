const nodemailer = require('nodemailer');
require('dotenv').config();

// Configurar el transportador de Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false  // ← Agrega esta línea
    }
});

// Verificar configuración del transportador
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Error en configuración de email:', error);
    } else {
        console.log('✅ Servidor de email listo para enviar mensajes');
    }
});

/**
 * Generar código de 6 dígitos
 */
const generarCodigo2FA = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Enviar código 2FA por email
 */
const enviarCodigo2FA = async (correo, codigo, nombreUsuario = 'Usuario') => {
    try {
        const mailOptions = {
            from: `"CarPremier 🚗" <${process.env.EMAIL_USER}>`,
            to: correo,
            subject: '🔐 Código de Verificación - CarPremier',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 40px auto;
                            background-color: #ffffff;
                            border-radius: 10px;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                            overflow: hidden;
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 28px;
                        }
                        .content {
                            padding: 40px 30px;
                            text-align: center;
                        }
                        .code-box {
                            background-color: #f8f9fa;
                            border: 2px dashed #667eea;
                            border-radius: 8px;
                            padding: 20px;
                            margin: 30px 0;
                        }
                        .code {
                            font-size: 36px;
                            font-weight: bold;
                            color: #667eea;
                            letter-spacing: 8px;
                            margin: 0;
                        }
                        .info {
                            color: #666;
                            font-size: 14px;
                            line-height: 1.6;
                        }
                        .warning {
                            background-color: #fff3cd;
                            border-left: 4px solid #ffc107;
                            padding: 15px;
                            margin-top: 20px;
                            text-align: left;
                        }
                        .footer {
                            background-color: #f8f9fa;
                            padding: 20px;
                            text-align: center;
                            color: #999;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🚗 CarPremier</h1>
                        </div>
                        <div class="content">
                            <h2>Hola, ${nombreUsuario}!</h2>
                            <p class="info">
                                Has solicitado iniciar sesión en tu cuenta de CarPremier.<br>
                                Usa el siguiente código de verificación para continuar:
                            </p>
                            
                            <div class="code-box">
                                <p class="code">${codigo}</p>
                            </div>
                            
                            <p class="info">
                                Este código es válido por <strong>5 minutos</strong>.
                            </p>
                            
                            <div class="warning">
                                <strong>⚠️ Importante:</strong> Si no solicitaste este código, 
                                ignora este mensaje. Nunca compartas este código con nadie.
                            </div>
                        </div>
                        <div class="footer">
                            <p>Este es un mensaje automático, por favor no responder.</p>
                            <p>&copy; 2024 CarPremier. Todos los derechos reservados.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email enviado:', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Error al enviar email:', error);
        throw new Error('Error al enviar el código de verificación');
    }
};

/**
 * Enviar notificación de inicio de sesión exitoso
 */
const enviarNotificacionLogin = async (correo, nombreUsuario = 'Usuario') => {
    try {
        const mailOptions = {
            from: `"CarPremier 🚗" <${process.env.EMAIL_USER}>`,
            to: correo,
            subject: '✅ Inicio de sesión exitoso - CarPremier',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 40px auto;
                            background-color: #ffffff;
                            border-radius: 10px;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        }
                        .header {
                            background-color: #28a745;
                            color: white;
                            padding: 20px;
                            text-align: center;
                            border-radius: 10px 10px 0 0;
                        }
                        .content {
                            padding: 30px;
                        }
                        .footer {
                            background-color: #f8f9fa;
                            padding: 15px;
                            text-align: center;
                            color: #999;
                            font-size: 12px;
                            border-radius: 0 0 10px 10px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>✅ Inicio de Sesión Exitoso</h2>
                        </div>
                        <div class="content">
                            <p>Hola, <strong>${nombreUsuario}</strong>!</p>
                            <p>Has iniciado sesión correctamente en tu cuenta de CarPremier.</p>
                            <p><strong>Fecha y hora:</strong> ${new Date().toLocaleString('es-ES')}</p>
                            <p>Si no fuiste tú, por favor contacta con soporte inmediatamente.</p>
                        </div>
                        <div class="footer">
                            <p>&copy; 2024 CarPremier. Todos los derechos reservados.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Notificación de login enviada');
    } catch (error) {
        console.error('❌ Error al enviar notificación:', error);
        // No lanzamos error aquí porque no es crítico
    }
};


/**
 * Enviar factura de CITA (compra de vehículo) por email
 */
const enviarFacturaCita = async (facturaData) => {
    const {
        correo,
        nombres,
        apellidos,
        numero_factura,
        fecha_emision,
        marca_nombre,
        modelo_nombre,
        anio,
        color,
        subtotal,
        iva,
        total,
        metodo_pago,
        oficina_nombre,
        fecha_cita,
        hora_cita
    } = facturaData;

    const nombreCompleto = `${nombres} ${apellidos}`;
    const vehiculo = `${marca_nombre} ${modelo_nombre} ${anio}`;
    const fechaFormateada = new Date(fecha_emision).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    try {
        const mailOptions = {
            from: `"CarPremier 🚗" <${process.env.EMAIL_USER}>`,
            to: correo,
            subject: `✅ Factura de Compra ${numero_factura} - CarPremier`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 650px;
                            margin: 30px auto;
                            background-color: #ffffff;
                            border-radius: 12px;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                            overflow: hidden;
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 28px;
                        }
                        .header p {
                            margin: 10px 0 0 0;
                            font-size: 16px;
                            opacity: 0.9;
                        }
                        .content {
                            padding: 40px 30px;
                        }
                        .factura-info {
                            background-color: #f8f9fa;
                            border-left: 4px solid #667eea;
                            padding: 20px;
                            margin-bottom: 30px;
                            border-radius: 4px;
                        }
                        .factura-info h2 {
                            margin: 0 0 15px 0;
                            color: #333;
                            font-size: 20px;
                        }
                        .info-row {
                            display: flex;
                            justify-content: space-between;
                            padding: 10px 0;
                            border-bottom: 1px solid #e0e0e0;
                        }
                        .info-row:last-child {
                            border-bottom: none;
                        }
                        .info-label {
                            font-weight: 600;
                            color: #666;
                        }
                        .info-value {
                            color: #333;
                        }
                        .vehiculo-box {
                            background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
                            padding: 20px;
                            border-radius: 8px;
                            margin: 20px 0;
                            text-align: center;
                        }
                        .vehiculo-box h3 {
                            margin: 0 0 10px 0;
                            color: #667eea;
                            font-size: 24px;
                        }
                        .vehiculo-box p {
                            margin: 5px 0;
                            color: #666;
                        }
                        .totales {
                            background-color: #f8f9fa;
                            padding: 20px;
                            border-radius: 8px;
                            margin-top: 20px;
                        }
                        .total-row {
                            display: flex;
                            justify-content: space-between;
                            padding: 8px 0;
                            font-size: 16px;
                        }
                        .total-final {
                            border-top: 2px solid #667eea;
                            margin-top: 10px;
                            padding-top: 15px;
                            font-weight: bold;
                            font-size: 20px;
                            color: #667eea;
                        }
                        .footer {
                            background-color: #f8f9fa;
                            padding: 25px;
                            text-align: center;
                            color: #999;
                            font-size: 13px;
                        }
                        .success-badge {
                            display: inline-block;
                            background-color: #28a745;
                            color: white;
                            padding: 8px 16px;
                            border-radius: 20px;
                            font-size: 14px;
                            font-weight: 600;
                            margin-bottom: 15px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🚗 CarPremier</h1>
                            <p>Factura de Compra</p>
                        </div>
                        
                        <div class="content">
                            <div style="text-align: center; margin-bottom: 20px;">
                                <span class="success-badge">✓ Compra Exitosa</span>
                            </div>
                            
                            <p style="font-size: 16px; color: #333;">Hola <strong>${nombreCompleto}</strong>,</p>
                            <p style="color: #666; line-height: 1.6;">
                                Gracias por tu compra en CarPremier. A continuación encontrarás los detalles de tu factura:
                            </p>
                            
                            <div class="factura-info">
                                <h2>Información de la Factura</h2>
                                <div class="info-row">
                                    <span class="info-label">Número de Factura:</span>
                                    <span class="info-value"><strong>${numero_factura}</strong></span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Fecha de Emisión:</span>
                                    <span class="info-value">${fechaFormateada}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Método de Pago:</span>
                                    <span class="info-value">${metodo_pago}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Oficina:</span>
                                    <span class="info-value">${oficina_nombre || 'N/A'}</span>
                                </div>
                                ${fecha_cita ? `
                                <div class="info-row">
                                    <span class="info-label">Fecha de Cita:</span>
                                    <span class="info-value">${new Date(fecha_cita).toLocaleDateString('es-ES')} ${hora_cita || ''}</span>
                                </div>
                                ` : ''}
                            </div>
                            
                            <div class="vehiculo-box">
                                <h3>🚙 ${vehiculo}</h3>
                                <p><strong>Color:</strong> ${color}</p>
                            </div>
                            
                            <div class="totales">
                                <div class="total-row">
                                    <span>Subtotal:</span>
                                    <span>$${parseFloat(subtotal).toFixed(2)}</span>
                                </div>
                                <div class="total-row">
                                    <span>IVA (15%):</span>
                                    <span>$${parseFloat(iva).toFixed(2)}</span>
                                </div>
                                <div class="total-row total-final">
                                    <span>TOTAL:</span>
                                    <span>$${parseFloat(total).toFixed(2)}</span>
                                </div>
                            </div>
                            
                            <p style="margin-top: 30px; color: #666; font-size: 14px; text-align: center;">
                                Si tienes alguna pregunta sobre esta factura, no dudes en contactarnos.
                            </p>
                        </div>
                        
                        <div class="footer">
                            <p><strong>CarPremier</strong></p>
                            <p>Tu concesionario de confianza</p>
                            <p style="margin-top: 15px;">&copy; 2024 CarPremier. Todos los derechos reservados.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Factura de cita enviada a:', correo);
        return true;
    } catch (error) {
        console.error('❌ Error al enviar factura de cita:', error);
        throw new Error('Error al enviar la factura por email');
    }
};

/**
 * Enviar factura de MANTENIMIENTO por email
 */
const enviarFacturaMantenimiento = async (facturaData, detalles = []) => {
    const {
        correo,
        nombres,
        apellidos,
        numero_factura,
        fecha_emision,
        marca_nombre,
        modelo_nombre,
        anio,
        numero_orden,
        tipo_servicio,
        subtotal_mano_obra,
        subtotal_repuestos,
        subtotal,
        iva,
        total,
        metodo_pago,
        oficina_nombre
    } = facturaData;

    const nombreCompleto = `${nombres} ${apellidos}`;
    const vehiculo = `${marca_nombre} ${modelo_nombre} ${anio}`;
    const fechaFormateada = new Date(fecha_emision).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Generar HTML de detalles
    let detallesHTML = '';
    if (detalles && detalles.length > 0) {
        detallesHTML = `
            <div style="margin: 20px 0;">
                <h3 style="color: #333; margin-bottom: 15px;">Detalles del Servicio</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #f8f9fa; border-bottom: 2px solid #667eea;">
                            <th style="padding: 10px; text-align: left;">Descripción</th>
                            <th style="padding: 10px; text-align: center;">Cant.</th>
                            <th style="padding: 10px; text-align: right;">Precio Unit.</th>
                            <th style="padding: 10px; text-align: right;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${detalles.map(det => `
                            <tr style="border-bottom: 1px solid #e0e0e0;">
                                <td style="padding: 10px;">
                                    <strong>${det.tipo_item === 'servicio' ? '🔧' : '🔩'} ${det.descripcion}</strong>
                                    ${det.tipo_item === 'servicio' ? '<br><small style="color: #999;">Servicio</small>' : '<br><small style="color: #999;">Repuesto</small>'}
                                </td>
                                <td style="padding: 10px; text-align: center;">${det.cantidad}</td>
                                <td style="padding: 10px; text-align: right;">$${parseFloat(det.precio_unitario).toFixed(2)}</td>
                                <td style="padding: 10px; text-align: right;"><strong>$${parseFloat(det.subtotal).toFixed(2)}</strong></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    try {
        const mailOptions = {
            from: `"CarPremier 🚗" <${process.env.EMAIL_USER}>`,
            to: correo,
            subject: `🔧 Factura de Mantenimiento ${numero_factura} - CarPremier`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 700px;
                            margin: 30px auto;
                            background-color: #ffffff;
                            border-radius: 12px;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                            overflow: hidden;
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 28px;
                        }
                        .content {
                            padding: 40px 30px;
                        }
                        .factura-info {
                            background-color: #f8f9fa;
                            border-left: 4px solid #667eea;
                            padding: 20px;
                            margin-bottom: 20px;
                            border-radius: 4px;
                        }
                        .info-row {
                            display: flex;
                            justify-content: space-between;
                            padding: 10px 0;
                            border-bottom: 1px solid #e0e0e0;
                        }
                        .totales {
                            background-color: #f8f9fa;
                            padding: 20px;
                            border-radius: 8px;
                            margin-top: 20px;
                        }
                        .total-row {
                            display: flex;
                            justify-content: space-between;
                            padding: 8px 0;
                        }
                        .total-final {
                            border-top: 2px solid #667eea;
                            margin-top: 10px;
                            padding-top: 15px;
                            font-weight: bold;
                            font-size: 20px;
                            color: #667eea;
                        }
                        .footer {
                            background-color: #f8f9fa;
                            padding: 25px;
                            text-align: center;
                            color: #999;
                            font-size: 13px;
                        }
                        .success-badge {
                            display: inline-block;
                            background-color: #28a745;
                            color: white;
                            padding: 8px 16px;
                            border-radius: 20px;
                            font-size: 14px;
                            font-weight: 600;
                            margin-bottom: 15px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔧 CarPremier</h1>
                            <p>Factura de Mantenimiento</p>
                        </div>
                        
                        <div class="content">
                            <div style="text-align: center; margin-bottom: 20px;">
                                <span class="success-badge">✓ Servicio Completado</span>
                            </div>
                            
                            <p style="font-size: 16px; color: #333;">Hola <strong>${nombreCompleto}</strong>,</p>
                            <p style="color: #666; line-height: 1.6;">
                                Tu servicio de mantenimiento ha sido completado exitosamente. A continuación los detalles:
                            </p>
                            
                            <div class="factura-info">
                                <div class="info-row">
                                    <span><strong>Factura:</strong></span>
                                    <span>${numero_factura}</span>
                                </div>
                                <div class="info-row">
                                    <span><strong>Orden:</strong></span>
                                    <span>${numero_orden}</span>
                                </div>
                                <div class="info-row">
                                    <span><strong>Fecha:</strong></span>
                                    <span>${fechaFormateada}</span>
                                </div>
                                <div class="info-row">
                                    <span><strong>Vehículo:</strong></span>
                                    <span>${vehiculo}</span>
                                </div>
                                <div class="info-row">
                                    <span><strong>Tipo de Servicio:</strong></span>
                                    <span>${tipo_servicio || 'N/A'}</span>
                                </div>
                                <div class="info-row">
                                    <span><strong>Oficina:</strong></span>
                                    <span>${oficina_nombre || 'N/A'}</span>
                                </div>
                            </div>
                            
                            ${detallesHTML}
                            
                            <div class="totales">
                                <div class="total-row">
                                    <span>Mano de Obra:</span>
                                    <span>$${parseFloat(subtotal_mano_obra || 0).toFixed(2)}</span>
                                </div>
                                <div class="total-row">
                                    <span>Repuestos:</span>
                                    <span>$${parseFloat(subtotal_repuestos || 0).toFixed(2)}</span>
                                </div>
                                <div class="total-row">
                                    <span>Subtotal:</span>
                                    <span>$${parseFloat(subtotal).toFixed(2)}</span>
                                </div>
                                <div class="total-row">
                                    <span>IVA (15%):</span>
                                    <span>$${parseFloat(iva).toFixed(2)}</span>
                                </div>
                                <div class="total-row total-final">
                                    <span>TOTAL:</span>
                                    <span>$${parseFloat(total).toFixed(2)}</span>
                                </div>
                                <div class="total-row" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e0e0e0;">
                                    <span>Método de Pago:</span>
                                    <span><strong>${metodo_pago}</strong></span>
                                </div>
                            </div>
                            
                            <p style="margin-top: 30px; color: #666; font-size: 14px; text-align: center;">
                                Gracias por confiar en CarPremier para el mantenimiento de tu vehículo.
                            </p>
                        </div>
                        
                        <div class="footer">
                            <p><strong>CarPremier</strong></p>
                            <p>Tu taller de confianza</p>
                            <p style="margin-top: 15px;">&copy; 2024 CarPremier. Todos los derechos reservados.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Factura de mantenimiento enviada a:', correo);
        return true;
    } catch (error) {
        console.error('❌ Error al enviar factura de mantenimiento:', error);
        throw new Error('Error al enviar la factura por email');
    }
};


/**
 * Enviar factura de COMPRA DE REPUESTO por email
 */
const enviarFacturaRepuesto = async (compraData) => {
    const {
        correo,
        nombres,
        apellidos,
        numero_factura,
        fecha_compra,
        nombre_repuesto,
        descripcion_repuesto,
        categoria,
        cantidad,
        precio_unitario,
        subtotal,
        iva,
        total,
        numero_tarjeta,
        tipo_tarjeta
    } = compraData;

    const nombreCompleto = `${nombres} ${apellidos}`;
    const fechaFormateada = new Date(fecha_compra).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    try {
        const mailOptions = {
            from: `"CarPremier 🚗" <${process.env.EMAIL_USER}>`,
            to: correo,
            subject: `🔩 Factura de Compra de Repuesto ${numero_factura} - CarPremier`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 650px;
                            margin: 30px auto;
                            background-color: #ffffff;
                            border-radius: 12px;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                            overflow: hidden;
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 28px;
                        }
                        .header p {
                            margin: 10px 0 0 0;
                            font-size: 16px;
                            opacity: 0.9;
                        }
                        .content {
                            padding: 40px 30px;
                        }
                        .factura-info {
                            background-color: #f8f9fa;
                            border-left: 4px solid #667eea;
                            padding: 20px;
                            margin-bottom: 30px;
                            border-radius: 4px;
                        }
                        .factura-info h2 {
                            margin: 0 0 15px 0;
                            color: #333;
                            font-size: 20px;
                        }
                        .info-row {
                            display: flex;
                            justify-content: space-between;
                            padding: 10px 0;
                            border-bottom: 1px solid #e0e0e0;
                        }
                        .info-row:last-child {
                            border-bottom: none;
                        }
                        .info-label {
                            font-weight: 600;
                            color: #666;
                        }
                        .info-value {
                            color: #333;
                        }
                        .repuesto-box {
                            background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
                            padding: 25px;
                            border-radius: 8px;
                            margin: 20px 0;
                        }
                        .repuesto-box h3 {
                            margin: 0 0 10px 0;
                            color: #667eea;
                            font-size: 22px;
                        }
                        .repuesto-box .categoria {
                            display: inline-block;
                            background-color: #667eea;
                            color: white;
                            padding: 5px 12px;
                            border-radius: 15px;
                            font-size: 12px;
                            font-weight: 600;
                            margin-bottom: 10px;
                        }
                        .repuesto-box p {
                            margin: 10px 0;
                            color: #666;
                            line-height: 1.6;
                        }
                        .detalle-compra {
                            background-color: #f8f9fa;
                            padding: 20px;
                            border-radius: 8px;
                            margin: 20px 0;
                        }
                        .detalle-row {
                            display: flex;
                            justify-content: space-between;
                            padding: 12px 0;
                            font-size: 16px;
                        }
                        .detalle-row.destacado {
                            background-color: #fff;
                            padding: 12px 15px;
                            border-radius: 6px;
                            margin: 5px 0;
                        }
                        .totales {
                            background-color: #f8f9fa;
                            padding: 20px;
                            border-radius: 8px;
                            margin-top: 20px;
                        }
                        .total-row {
                            display: flex;
                            justify-content: space-between;
                            padding: 8px 0;
                            font-size: 16px;
                        }
                        .total-final {
                            border-top: 2px solid #667eea;
                            margin-top: 10px;
                            padding-top: 15px;
                            font-weight: bold;
                            font-size: 20px;
                            color: #667eea;
                        }
                        .footer {
                            background-color: #f8f9fa;
                            padding: 25px;
                            text-align: center;
                            color: #999;
                            font-size: 13px;
                        }
                        .success-badge {
                            display: inline-block;
                            background-color: #28a745;
                            color: white;
                            padding: 8px 16px;
                            border-radius: 20px;
                            font-size: 14px;
                            font-weight: 600;
                            margin-bottom: 15px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔩 CarPremier</h1>
                            <p>Factura de Compra de Repuesto</p>
                        </div>
                        
                        <div class="content">
                            <div style="text-align: center; margin-bottom: 20px;">
                                <span class="success-badge">✓ Compra Exitosa</span>
                            </div>
                            
                            <p style="font-size: 16px; color: #333;">Hola <strong>${nombreCompleto}</strong>,</p>
                            <p style="color: #666; line-height: 1.6;">
                                Gracias por tu compra en CarPremier. Tu pedido ha sido procesado exitosamente.
                            </p>
                            
                            <div class="factura-info">
                                <h2>Información de la Compra</h2>
                                <div class="info-row">
                                    <span class="info-label">Número de Factura:</span>
                                    <span class="info-value"><strong>${numero_factura}</strong></span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Fecha de Compra:</span>
                                    <span class="info-value">${fechaFormateada}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Método de Pago:</span>
                                    <span class="info-value">${tipo_tarjeta || 'Tarjeta'} **** ${numero_tarjeta ? numero_tarjeta.slice(-4) : '****'}</span>
                                </div>
                            </div>
                            
                            <div class="repuesto-box">
                                <span class="categoria">📦 ${categoria || 'Repuesto'}</span>
                                <h3>${nombre_repuesto}</h3>
                                ${descripcion_repuesto ? `<p>${descripcion_repuesto}</p>` : ''}
                            </div>
                            
                            <div class="detalle-compra">
                                <h3 style="margin: 0 0 15px 0; color: #333;">Detalle del Pedido</h3>
                                <div class="detalle-row destacado">
                                    <span><strong>Producto:</strong></span>
                                    <span>${nombre_repuesto}</span>
                                </div>
                                <div class="detalle-row destacado">
                                    <span><strong>Cantidad:</strong></span>
                                    <span>${cantidad} unidad${cantidad > 1 ? 'es' : ''}</span>
                                </div>
                                <div class="detalle-row destacado">
                                    <span><strong>Precio Unitario:</strong></span>
                                    <span>$${parseFloat(precio_unitario).toFixed(2)}</span>
                                </div>
                            </div>
                            
                            <div class="totales">
                                <div class="total-row">
                                    <span>Subtotal:</span>
                                    <span>$${parseFloat(subtotal).toFixed(2)}</span>
                                </div>
                                <div class="total-row">
                                    <span>IVA (15%):</span>
                                    <span>$${parseFloat(iva).toFixed(2)}</span>
                                </div>
                                <div class="total-row total-final">
                                    <span>TOTAL PAGADO:</span>
                                    <span>$${parseFloat(total).toFixed(2)}</span>
                                </div>
                            </div>
                            
                            <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin-top: 25px; border-radius: 4px;">
                                <p style="margin: 0; color: #1565c0; font-size: 14px;">
                                    <strong>ℹ️ Información:</strong> Tu repuesto estará disponible para retiro en nuestras oficinas.
                                </p>
                            </div>
                            
                            <p style="margin-top: 30px; color: #666; font-size: 14px; text-align: center;">
                                Si tienes alguna pregunta sobre tu compra, no dudes en contactarnos.
                            </p>
                        </div>
                        
                        <div class="footer">
                            <p><strong>CarPremier</strong></p>
                            <p>Repuestos originales y de calidad</p>
                            <p style="margin-top: 15px;">&copy; 2024 CarPremier. Todos los derechos reservados.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Factura de repuesto enviada a:', correo);
        return true;
    } catch (error) {
        console.error('❌ Error al enviar factura de repuesto:', error);
        throw new Error('Error al enviar la factura por email');
    }
};

// ✅ ACTUALIZAR EL MODULE.EXPORTS
module.exports = {
    generarCodigo2FA,
    enviarCodigo2FA,
    enviarNotificacionLogin,
    enviarFacturaCita,
    enviarFacturaMantenimiento,
    enviarFacturaRepuesto  // ← AGREGAR ESTA LÍNEA
};
