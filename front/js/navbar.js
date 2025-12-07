// front/js/navbar.js
console.log("Script navbar.js cargado");

const navBadge = document.getElementById('navCartCount');
const navCuentaMount = document.getElementById('navCuentaMount');

// ==========================================
// 1. LOGICA DEL BADGE (Contador Carrito)
// ==========================================
async function actualizarBadge() {
    // Si no hay elemento badge en el HTML, salimos (evita errores)
    if (!navBadge) return;

    // Si NO está logueado, mostramos 0 y no llamamos a la API (Evita error 401)
    if (!AuthService.estaLogueado()) {
        navBadge.textContent = '0';
        navBadge.classList.add('d-none'); // Opcional: ocultarlo si es 0
        return;
    }

    try {
        const token = AuthService.obtenerToken();
        // Llamamos al endpoint específico B-07 que creaste en el backend
        const respuesta = await fetch(`${API_URL}/carrito/resumen`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (respuesta.ok) {
            const data = await respuesta.json(); // { totalItems: 5 }
            const cantidad = data.totalItems || 0;
            
            navBadge.textContent = cantidad;
            
            // Mostrar/Ocultar según cantidad
            if (cantidad > 0) {
                navBadge.classList.remove('d-none');
            } else {
                navBadge.classList.remove('d-none'); // O .add('d-none') si prefieres ocultarlo
            }
        } 
    } catch (error) {
        console.warn("No se pudo actualizar el badge", error);
    }
}

// ==========================================
// 2. LOGICA DEL MENU CUENTA (Dinámico)
// ==========================================
function renderizarMenuCuenta() {
    if (!navCuentaMount) return;

    if (AuthService.estaLogueado()) {
        // --- USUARIO LOGUEADO ---
        const esAdmin = AuthService.esAdmin();
        const urlDashboard = esAdmin ? './admin.html' : './perfil.html';
        const textoDashboard = esAdmin ? 'Administración' : 'Mi Perfil';

        navCuentaMount.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-outline-primary dropdown-toggle btn-sm" type="button" data-bs-toggle="dropdown">
                    Cuenta
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item" href="${urlDashboard}">${textoDashboard}</a></li>
                    <li><a class="dropdown-item" href="./perfil.html">Mis Datos</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><button class="dropdown-item text-danger" onclick="AuthService.logout()">Cerrar sesión</button></li>
                </ul>
            </div>
        `;
    } else {
        // --- VISITANTE (GUEST) ---
        navCuentaMount.innerHTML = `
            <a href="./login.html" class="btn btn-primary btn-sm">Ingresar</a>
        `;
    }
}

// ==========================================
// 3. INICIALIZACION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    renderizarMenuCuenta();
    actualizarBadge();
});

// Hacemos la función global para poder llamarla desde otros scripts (ej: al agregar un producto)
window.actualizarBadgeGlobal = actualizarBadge;