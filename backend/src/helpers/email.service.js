import nodemailer from 'nodemailer';

// Configuración para GMAIL
const createTransporter = async () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Tu correo (desde .env)
      pass: process.env.EMAIL_PASS  // Tu contraseña de aplicación (desde .env)
    }
  });
};

export const enviarCodigoRecuperacion = async (emailDestino, codigo) => {
  try {
    const transporter = await createTransporter();

    // Verificación de seguridad para depuración
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("FALTA CONFIGURACIÓN: Revisa tu archivo .env");
      return false;
    }

    const info = await transporter.sendMail({
      from: '"El Brasero " <no-reply@elbrasero.cl>',
      to: emailDestino,
      subject: "Recupera tu contraseña - El Brasero",
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h1 style="color: #d32f2f;">El Brasero</h1>
          <h2>Código de recuperación</h2>
          <p>Usa este código para restablecer tu contraseña:</p>
          <div style="background: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; border-radius: 8px;">
            ${codigo}
          </div>
          <p style="margin-top: 20px; font-size: 12px; color: #777;">
            Expira en 15 minutos.
          </p>
        </div>
      `,
    });

    console.log('Correo enviado exitosamente a: ${emailDestino}');
    return true;
  } catch (error) {
    console.error("Error enviando correo:", error);
    return false;
  }
};