console.log("Script login.js cargado");

const formLogin = document.getElementById('loginForm');
const msgLogin = document.getElementById('msgLogin');

formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. RECOPILAR DATOS
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    // Validaciones locales (AC: Escenario 4 )
    if (!email || !password) {
        mostrarAlerta('Ingresa tu correo y contraseña', 'warning');
        return;
    }

    // 2. DEFINIR EL SERVICIO (Payload)
    const credenciales = {
        email: email,
        password: password
    };

    try {
        // 3. CALL SERVICIO (Fetch)
        const respuesta = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credenciales)
        });

        const data = await respuesta.json();

        // 4. INTERPRETAR RESPUESTA
        if (respuesta.ok) {
            // AC: Escenario 1 - Login Exitoso (200) [cite: 5]
            mostrarAlerta('¡Bienvenido! Ingresando...', 'success');

            // GUARDAR TOKEN (Usando nuestro servicio)
            AuthService.guardarSesion(data);

            // REDIRECCIÓN SEGÚN ROL O PERFIL
            setTimeout(() => {
                // Si es admin, va al dashboard
                if (data.rol === 'admin') {
                    window.location.href = './admin.html';
                } 
                // Si el perfil no está completo, sugerimos ir a completarlo (Inter-épica B-06 [cite: 66])
                else if (data.profileComplete === false) {
                    window.location.href = './perfil.html';
                } 
                // Usuario normal completo va al home
                else {
                    window.location.href = './home.html';
                }
            }, 1500);

        } else {
            // AC: Escenario 2 y 3 - Errores (401/403) [cite: 11, 15]
            mostrarAlerta(data.mensaje || 'Credenciales inválidas', 'danger');
        }

    } catch (error) {
        console.error(error);
        mostrarAlerta('Error de conexión', 'danger');
    }
});

function mostrarAlerta(mensaje, tipo) {
    msgLogin.textContent = mensaje;
    msgLogin.className = `alert alert-${tipo} d-block`;
}