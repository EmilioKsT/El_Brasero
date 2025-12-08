console.log("Script admin.pedidos.js cargado");

// 1. PROTECCIÓN DE RUTA (ZTA)
if (!AuthService.esAdmin()) {
    window.location.href = './login.html';
}

// 2. REFERENCIAS DOM
const tbody = document.getElementById('tbodyPedidos');
const toastEl = document.getElementById('toastOk');
const bsToast = new bootstrap.Toast(toastEl);
const msgBox = document.getElementById('msgBox');

// Estados posibles del sistema
const ESTADOS = ['Pendiente de pago', 'En preparación', 'Despachado', 'Entregado', 'Anulado'];

// ==========================================
// A. CARGAR PEDIDOS (READ)
// ==========================================
async function cargarPedidos() {
    try {
        const token = AuthService.obtenerToken();
        
        // GET /api/admin/pedidos
        const res = await fetch(`${API_URL}/admin/pedidos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Error al cargar pedidos');

        const pedidos = await res.json();
        renderizarTabla(pedidos);

    } catch (error) {
        console.error(error);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger"><i class="fa-solid fa-triangle-exclamation me-2"></i>Error de conexión</td></tr>`;
    }
}

// ==========================================
// B. RENDERIZAR TABLA
// ==========================================
function renderizarTabla(pedidos) {
    if (pedidos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-5">No hay pedidos registrados.</td></tr>`;
        return;
    }

    let html = '';
    const formatoCLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });

    pedidos.forEach(p => {
        // 1. Formatear Fecha
        const fecha = new Date(p.createdAt).toLocaleString('es-CL', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        });

        // 2. Configurar Badge de Estado (Color e Icono)
        let badgeClass = 'bg-secondary';
        let icono = 'fa-clock'; // Default

        if (p.estado === 'Pendiente de pago') { badgeClass = 'bg-warning text-dark'; }
        else if (p.estado === 'En preparación') { badgeClass = 'bg-info text-dark'; icono = 'fa-fire-burner'; }
        else if (p.estado === 'Despachado') { badgeClass = 'bg-primary'; icono = 'fa-truck-fast'; }
        else if (p.estado === 'Entregado') { badgeClass = 'bg-success'; icono = 'fa-check-circle'; }
        else if (p.estado === 'Anulado') { badgeClass = 'bg-danger'; icono = 'fa-ban'; }

        // 3. Generar Selector de Acciones
        const selectorAcciones = generarSelector(p._id, p.estado);

        html += `
            <tr>
                <td class="align-middle"><span class="font-monospace small text-primary">#${p._id.slice(-6).toUpperCase()}</span></td>
                <td class="align-middle"><small>${fecha}</small></td>
                <td class="align-middle">
                    <div class="fw-bold">${p.nombreCliente}</div>
                    <div class="small text-muted"><i class="fa-solid fa-location-dot me-1"></i>${p.comuna}</div>
                </td>
                <td class="align-middle text-end fw-bold">${formatoCLP.format(p.total)}</td>
                <td class="align-middle text-center">
                    <span class="badge ${badgeClass} rounded-pill">
                        <i class="fa-solid ${icono} me-1"></i>${p.estado}
                    </span>
                </td>
                <td class="align-middle">
                    ${selectorAcciones}
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

// Helper: Crea el <select> aplicando reglas de negocio
function generarSelector(id, estadoActual) {
    // Regla: Si ya terminó, no se edita más
    if (estadoActual === 'Entregado' || estadoActual === 'Anulado') {
        return '<small class="text-muted fst-italic"><i class="fa-solid fa-lock me-1"></i>Finalizado</small>';
    }

    let opciones = `<select class="form-select form-select-sm border-primary" onchange="cambiarEstado('${id}', this.value)">`;
    
    ESTADOS.forEach(est => {
        // Regla de Negocio: SOLO se puede anular si está "Pendiente de pago"
        let disabled = '';
        if (est === 'Anulado' && estadoActual !== 'Pendiente de pago') {
            disabled = 'disabled'; 
        }

        const selected = est === estadoActual ? 'selected' : '';
        opciones += `<option value="${est}" ${selected} ${disabled}>${est}</option>`;
    });

    opciones += '</select>';
    return opciones;
}

// ==========================================
// C. ACTUALIZAR ESTADO (UPDATE)
// ==========================================
window.cambiarEstado = async (id, nuevoEstado) => {
    // Confirmación especial para anular
    if (nuevoEstado === 'Anulado') {
        if (!confirm('¿Seguro que deseas ANULAR este pedido?')) {
            cargarPedidos(); // Recargar para revertir la selección visual
            return;
        }
    }

    try {
        const token = AuthService.obtenerToken();
        const res = await fetch(`${API_URL}/admin/pedidos/${id}/estado`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ nuevoEstado })
        });

        const data = await res.json();

        if (res.ok) {
            // Toast de éxito
            document.querySelector('#toastOk .toast-body').innerText = `Pedido actualizado a: ${nuevoEstado}`;
            bsToast.show();
            cargarPedidos(); // Refrescar la tabla
        } else {
            alert(data.mensaje || 'Error al actualizar');
            cargarPedidos(); // Revertir visualmente si falló
        }

    } catch (error) {
        console.error(error);
        alert('Error de conexión');
    }
};

// Inicializar
document.addEventListener('DOMContentLoaded', cargarPedidos);