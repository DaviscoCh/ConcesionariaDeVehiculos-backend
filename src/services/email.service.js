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

module.exports = {
    generarCodigo2FA,
    enviarCodigo2FA,
    enviarNotificacionLogin
};