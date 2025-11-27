console.log("Script registro.js cargado correctamente"); // PRUEBA 1: Si no ves esto en consola, el archivo no está vinculado.

const formulario = document.getElementById('registroForm');
const mensajeDiv = document.getElementById('mensaje');

// Referencias a los campos
const inputEmail = document.getElementById('email');
const inputPass1 = document.getElementById('password');
const inputPass2 = document.getElementById('password2');

// Regex para contraseña (8 chars, 1 mayúscula, 1 número) - Tu validación original
const REGEX_PASS = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
// Regex simple para email
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

formulario.addEventListener('submit', async (evento) => {
    console.log("Evento submit interceptado"); // PRUEBA 2: Si ves esto, el preventDefault funcionará.
    evento.preventDefault(); 

    // 1. RECOPILAR DATOS
    const email = inputEmail.value.trim();
    const password = inputPass1.value.trim();
    const passwordConfirm = inputPass2.value.trim();

    // Limpiar alertas previas
    mensajeDiv.className = 'alert d-none';

    // 2. VALIDACIONES LOCALES (Antes de ir al servidor)
    
    // A) Campos vacíos
    if (!email || !password || !passwordConfirm) {
        mostrarAlerta('Por favor completa todos los campos.', 'warning');
        return;
    }

    // B) Formato Email
    if (!REGEX_EMAIL.test(email)) {
        mostrarAlerta('El correo electrónico no tiene un formato válido.', 'danger');
        return;
    }

    // C) Formato Contraseña
    if (!REGEX_PASS.test(password)) {
        mostrarAlerta('La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.', 'danger');
        return;
    }

    // D) Coincidencia
    if (password !== passwordConfirm) {
        mostrarAlerta('Las contraseñas no coinciden.', 'danger');
        return;
    }

    // 3. PREPARAR PAYLOAD (Objeto a enviar)
    const datosUsuario = {
        email: email,
        password: password
    };

    // 4. LLAMADA AL SERVIDOR (Fetch AJAX)
    try {
        console.log("Enviando datos a:", API_URL + "/auth/register"); // Debug url

        const respuesta = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosUsuario)
        });

        const datos = await respuesta.json();
        console.log("Respuesta del servidor:", datos); // Debug respuesta

        // 5. INTERPRETAR RESPUESTA
        if (respuesta.ok) {
            mostrarAlerta('¡Registro exitoso! Redirigiendo al login...', 'success');
            setTimeout(() => {
                window.location.href = './login.html';
            }, 2000);
        } else {
            // Error del backend (ej: "El email ya está en uso")
            mostrarAlerta(datos.mensaje || 'Ocurrió un error al registrar.', 'danger');
        }

    } catch (error) {
        console.error('Error crítico:', error);
        mostrarAlerta('No se pudo conectar con el servidor (Revisa que el backend esté corriendo).', 'danger');
    }
});

// Función de utilidad para mostrar mensajes
function mostrarAlerta(mensaje, tipo) {
    mensajeDiv.textContent = mensaje;
    mensajeDiv.className = `alert alert-${tipo} d-block`;
}