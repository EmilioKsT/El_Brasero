console.log("Script admin.js cargado");

// 1. PROTECCIÓN DE RUTA
if (!AuthService.esAdmin()) {
    window.location.href = './login.html';
}

// 2. REFERENCIAS DOM
const kpiPedidos = document.getElementById('kpi-pedidos');
const kpiVentas = document.getElementById('kpi-ventas');
const kpiCocina = document.getElementById('kpi-cocina');
const listaActividad = document.getElementById('lista-actividad');
const adminEmail = document.getElementById('admin-email');

// Formateador de moneda
const formatoCLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });

// ==========================================
// A. CARGAR DATOS DASHBOARD
// ==========================================
async function cargarDashboard() {
    try {
        const token = AuthService.obtenerToken();
        
        // 1. Cargar Info del Admin (Perfil)
        cargarInfoAdmin(token);

        // 2. Cargar KPIs y Actividad (Nuevo Endpoint)
        const res = await fetch(`${API_URL}/admin/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Error cargando dashboard');

        const data = await res.json();
        renderizarKPIs(data.kpis);
        renderizarActividad(data.actividad);

    } catch (error) {
        console.error(error);
        // Manejo de error visual (opcional)
    }
}

// Helper: Info del Admin
async function cargarInfoAdmin(token) {
    try {
        const res = await fetch(`${API_URL}/auth/perfil`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const user = await res.json();
            if(adminEmail) adminEmail.textContent = user.email;
        }
    } catch(e) { console.error(e); }
}

// Helper: Pintar KPIs
function renderizarKPIs(kpis) {
    if(kpiPedidos) kpiPedidos.textContent = kpis.pedidosHoy;
    if(kpiVentas) kpiVentas.textContent = formatoCLP.format(kpis.ventasHoy);
    if(kpiCocina) kpiCocina.textContent = kpis.enCocina;
}

// Helper: Pintar Actividad Reciente
function renderizarActividad(pedidos) {
    if (!listaActividad) return;

    if (pedidos.length === 0) {
        listaActividad.innerHTML = '<div class="p-4 text-center text-muted">Sin actividad reciente.</div>';
        return;
    }

    let html = '';
    pedidos.forEach(p => {
        // Icono y color según estado
        let icono = 'fa-clock';
        let color = 'text-secondary';
        
        if (p.estado === 'En preparación') { icono = 'fa-fire-burner'; color = 'text-info'; }
        if (p.estado === 'Entregado') { icono = 'fa-circle-check'; color = 'text-success'; }
        if (p.estado === 'Anulado') { icono = 'fa-ban'; color = 'text-danger'; }

        // Tiempo relativo simple (Ej: "10:30")
        const hora = new Date(p.createdAt).toLocaleTimeString('es-CL', {hour: '2-digit', minute:'2-digit'});

        html += `
            <div class="list-group-item px-4 py-3 d-flex align-items-start border-0 border-bottom">
                <div class="me-3 mt-1 ${color}"><i class="fa-solid ${icono}"></i></div>
                <div class="flex-grow-1">
                    <div>
                        Pedido <strong>#${p._id.slice(-6).toUpperCase()}</strong> 
                        (${p.nombreCliente}) está <span class="badge bg-light text-dark border">${p.estado}</span>
                    </div>
                    <small class="text-muted">Hoy a las ${hora} • ${formatoCLP.format(p.total)}</small>
                </div>
            </div>
        `;
    });
    listaActividad.innerHTML = html;
}

// ==========================================
// B. LOGOUT
// ==========================================
document.getElementById('btn-logout')?.addEventListener('click', () => {
    if(confirm("¿Cerrar sesión?")) AuthService.logout();
});

// Inicializar
document.addEventListener('DOMContentLoaded', cargarDashboard);