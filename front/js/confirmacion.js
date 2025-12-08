console.log("Script confirmacion.js cargado");

// Referencias DOM
const emptyState = document.getElementById('b14-empty');
const flowState = document.getElementById('b14-flow');
const ordenSpan = document.getElementById('b14-orden');
const fechaSpan = document.getElementById('b14-fecha');
const clienteSpan = document.getElementById('b14-cliente');
const totalSpan = document.getElementById('b14-total');
const tbody = document.getElementById('b14-tbody');
const btnPrint = document.getElementById('b14-print');

// Formateador
const formatoCLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });

// Obtener orderId de la URL
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('orderId');

// Cargar confirmación
async function cargarConfirmacion() {
    // AC 4: Sin pedido previo
    if (!orderId) {
        console.log('No hay orderId en la URL');
        mostrarError();
        return;
    }

    try {
        const token = AuthService.obtenerToken();
        
        const response = await fetch(`${API_URL}/pedidos/confirmacion/${orderId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Pedido no encontrado');
        }

        const data = await response.json();
        console.log('Datos del pedido:', data);
        
        mostrarExito(data.pedido);

    } catch (error) {
        console.error('Error al cargar confirmación:', error);
        mostrarError();
    }
}

// Mostrar confirmación exitosa
function mostrarExito(pedido) {
    emptyState.classList.add('d-none');
    flowState.classList.remove('d-none');

    // AC 1: Número de pedido (formato BR-XXXXXX)
    const numeroPedido = `BR-${pedido.id.slice(-6).toUpperCase()}`;
    ordenSpan.textContent = numeroPedido;

    // AC 1: Fecha/hora en formato local chileno
    const fecha = new Date(pedido.fecha);
    fechaSpan.textContent = fecha.toLocaleString('es-CL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    // Cliente
    clienteSpan.textContent = pedido.cliente;

    // AC 2: Total en formato CLP
    totalSpan.textContent = formatoCLP.format(pedido.total);

    // AC 2: Resumen de items (tabla)
    let htmlItems = '';
    pedido.items.forEach(item => {
        htmlItems += `
            <tr>
                <td>${item.nombre}</td>
                <td class="text-end">${formatoCLP.format(item.precioUnitario)}</td>
                <td class="text-center">${item.cantidad}</td>
            </tr>
        `;
    });
    tbody.innerHTML = htmlItems;

    console.log('Confirmación cargada exitosamente');
}

// Mostrar error (AC 4)
function mostrarError() {
    emptyState.classList.remove('d-none');
    flowState.classList.add('d-none');
}

// AC 3: Botón imprimir
if (btnPrint) {
    btnPrint.addEventListener('click', () => {
        window.print();
    });
}

// Inicializar
document.addEventListener('DOMContentLoaded', cargarConfirmacion);