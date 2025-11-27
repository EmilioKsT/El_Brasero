import nodemailer from 'nodemailer';

// Configuración del transporte (SMTP)
// NOTA: Para pruebas rápidas usaremos Ethereal (falso SMTP).
// Para usar Gmail real, cambia estos datos en tu .env por tu correo y "App Password".
const createTransporter = async () => {
  // Opción A: Gmail (Producción/Real)
  /*
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Tu gmail
      pass: process.env.EMAIL_PASS  // Tu contraseña de aplicación (no la normal)
    }
  });
  */

  // Opción B: Ethereal (Desarrollo seguro - Recomendado ahora)
  // Genera una cuenta de prueba automática cada vez (o usa credenciales fijas)
  const testAccount = await nodemailer.createTestAccount();
  
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

export const enviarCodigoRecuperacion = async (emailDestino, codigo) => {
  try {
    const transporter = await createTransporter();

    const info = await transporter.sendMail({
      from: '"El Brasero 🔥" <no-reply@elbrasero.cl>',
      to: emailDestino,
      subject: "Recupera tu contraseña - El Brasero",
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h1 style="color: #d32f2f;">El Brasero</h1>
          <h2>Código de recuperación</h2>
          <p>Has solicitado restablecer tu contraseña. Usa el siguiente código:</p>
          <div style="background: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; border-radius: 8px;">
            ${codigo}
          </div>
          <p style="margin-top: 20px; font-size: 12px; color: #777;">
            Este código expira en 15 minutos. Si no lo solicitaste, ignora este correo.
          </p>
        </div>
      `,
    });

    console.log("📨 Correo enviado: %s", info.messageId);
    // Ethereal genera una URL para ver el correo en el navegador
    console.log("👀 Vista previa (URL): %s", nodemailer.getTestMessageUrl(info));
    
    return true;
  } catch (error) {
    console.error("❌ Error enviando correo:", error);
    return false;
  }
};