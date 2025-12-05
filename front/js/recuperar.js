console.log("Script recuperar.js cargado");

// Referencias al DOM
const stepEmail = document.getElementById('stepEmail');
const stepCode = document.getElementById('stepCode');
const stepNewPass = document.getElementById('stepNewPass');
const stepSuccess = document.getElementById('stepSuccess');
const alertBox = document.getElementById('alertBox');

// Estado
let emailUsuario = '';

// 1. ENVIAR EMAIL
stepEmail.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();

    if (!email) return mostrarAlerta('Ingresa un email', 'warning');

    try {
        const res = await fetch(`${API_URL}/auth/recovery/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        // Siempre pasamos al siguiente paso por seguridad (incluso si el email no existe)
        emailUsuario = email;
        mostrarPaso(stepCode);
        mostrarAlerta('Si el correo existe, recibirás un código en breve.', 'info');

    } catch (error) {
        console.error(error);
        mostrarAlerta('Error de conexión', 'danger');
    }
});

// 2. VALIDAR CÓDIGO
stepCode.addEventListener('submit', async (e) => {
    e.preventDefault();
    const codigo = document.getElementById('code').value.trim();

    try {
        const res = await fetch(`${API_URL}/auth/recovery/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailUsuario, codigo })
        });

        const data = await res.json();

        if (res.ok) {
            mostrarPaso(stepNewPass);
            mostrarAlerta('Código verificado. Crea tu nueva contraseña.', 'success');
        } else {
            mostrarAlerta(data.mensaje || 'Código inválido', 'danger');
        }
    } catch (error) {
        console.error(error);
        mostrarAlerta('Error al validar código', 'danger');
    }
});

// 3. CAMBIAR CONTRASEÑA
stepNewPass.addEventListener('submit', async (e) => {
    e.preventDefault();
    const codigo = document.getElementById('code').value.trim(); // Necesitamos el código de nuevo
    const password = document.getElementById('newPass').value.trim();
    const confirm = document.getElementById('confirmPass').value.trim();

    if (password !== confirm) {
        return mostrarAlerta('Las contraseñas no coinciden', 'danger');
    }

    try {
        const res = await fetch(`${API_URL}/auth/recovery/reset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: emailUsuario, 
                codigo: codigo, 
                nuevaPassword: password 
            })
        });

        const data = await res.json();

        if (res.ok) {
            mostrarPaso(stepSuccess);
            mostrarAlerta('', 'd-none'); // Limpiar alertas
        } else {
            mostrarAlerta(data.mensaje || 'Error al cambiar contraseña', 'danger');
        }
    } catch (error) {
        console.error(error);
        mostrarAlerta('Error de conexión', 'danger');
    }
});

// Botones "Volver"
document.getElementById('backToEmail').addEventListener('click', () => mostrarPaso(stepEmail));
document.getElementById('backToCode').addEventListener('click', () => mostrarPaso(stepCode));

// Utilidades
function mostrarPaso(pasoVisible) {
    // Ocultar todos
    stepEmail.classList.add('d-none');
    stepCode.classList.add('d-none');
    stepNewPass.classList.add('d-none');
    stepSuccess.classList.add('d-none');
    
    // Mostrar el deseado
    pasoVisible.classList.remove('d-none');
    alertBox.classList.add('d-none'); // Limpiar alertas al cambiar paso
}

function mostrarAlerta(msg, tipo) {
    if (tipo === 'd-none') {
        alertBox.classList.add('d-none');
        return;
    }
    alertBox.textContent = msg;
    alertBox.className = `alert alert-${tipo} d-block`;
}