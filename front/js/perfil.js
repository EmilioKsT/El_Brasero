console.log("Script perfil.js cargado");

// Verificar autenticación al inicio (Protección de ruta)
if (!AuthService.estaLogueado()) {
    window.location.href = './login.html';
}

const formPerfil = document.getElementById('perfilForm');
const msgPerfil = document.getElementById('msgPerfil');
const btnCancelar = document.getElementById('btnCancelar');

// Guardamos los datos originales para la función "Cancelar"
let datosOriginales = {};

// ==========================================
// 1. CARGAR PERFIL (GET)
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const token = AuthService.obtenerToken();
        
        // Call Servicio: GET /api/auth/perfil
        const respuesta = await fetch(`${API_URL}/auth/perfil`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // ¡Importante! Token en header
                'Content-Type': 'application/json'
            }
        });

        if (respuesta.ok) {
            const data = await respuesta.json();
            
            // Rellenar formulario (Recopilar al revés: JSON -> HTML)
            document.getElementById('email').value = data.email || '';
            document.getElementById('nombre').value = data.nombre || '';
            document.getElementById('telefono').value = data.telefono || '';
            document.getElementById('direccion').value = data.direccion || '';
            document.getElementById('comuna').value = data.comuna || '';

            // Guardar copia para cancelar después
            datosOriginales = { ...data }; 

        } else {
            mostrarAlerta('Error al cargar perfil. Por favor inicia sesión de nuevo.', 'danger');
            setTimeout(() => AuthService.logout(), 2000); // Si falla el token, sacarlo
        }

    } catch (error) {
        console.error(error);
        mostrarAlerta('Error de conexión al cargar el perfil', 'danger');
    }
});

// ==========================================
// 2. ACTUALIZAR PERFIL (PUT)
// ==========================================
formPerfil.addEventListener('submit', async (e) => {
    e.preventDefault();

    // A. Recopilar datos
    const datosActualizados = {
        nombre: document.getElementById('nombre').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        direccion: document.getElementById('direccion').value.trim(),
        comuna: document.getElementById('comuna').value.trim()
    };

    // B. Validaciones extra (opcional, el HTML5 ya ayuda)
    if (datosActualizados.nombre.length < 2) {
        mostrarAlerta('El nombre es muy corto', 'warning');
        return;
    }

    try {
        const token = AuthService.obtenerToken();

        // C. Call Servicio: PUT /api/auth/perfil
        const respuesta = await fetch(`${API_URL}/auth/perfil`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosActualizados)
        });

        const data = await respuesta.json();

        // D. Interpretar Respuesta
        if (respuesta.ok) {
            mostrarAlerta('Datos actualizados correctamente. Redirigiendo...', 'success');
            
            // Actualizamos "originales" con los nuevos valores confirmados
            datosOriginales = { ...datosOriginales, ...datosActualizados };

            setTimeout(() => {
                window.location.href = './home.html'; 
            }, 1500);
            
        } else {
            mostrarAlerta(data.mensaje || 'Error al actualizar', 'danger');
        }

    } catch (error) {
        console.error(error);
        mostrarAlerta('Error de conexión al guardar', 'danger');
    }
});

// ==========================================
// 3. CANCELAR CAMBIOS
// ==========================================
btnCancelar.addEventListener('click', () => {
    // Restaurar valores desde la copia
    document.getElementById('nombre').value = datosOriginales.nombre || '';
    document.getElementById('telefono').value = datosOriginales.telefono || '';
    document.getElementById('direccion').value = datosOriginales.direccion || '';
    document.getElementById('comuna').value = datosOriginales.comuna || '';
    
    mostrarAlerta('Cambios cancelados', 'info');
});

// Helper
function mostrarAlerta(mensaje, tipo) {
    msgPerfil.textContent = mensaje;
    msgPerfil.className = `alert alert-${tipo} d-block`;
    
    // Auto-ocultar a los 3 segundos
    setTimeout(() => {
        msgPerfil.classList.add('d-none');
        msgPerfil.classList.remove('d-block');
    }, 3000);
}