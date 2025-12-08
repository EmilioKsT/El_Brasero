console.log("Script pago.js cargado");

// 1. Verificar sesión
if (!AuthService.estaLogueado()) {
    window.location.href = './login.html';
}

// 2. Obtener orderId de la URL
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('orderId');

if (!orderId) {
    alert('No se encontró el ID del pedido');
    window.location.href = './GridProductos.html';
}

// 3. Referencias al DOM
const totalSpan = document.getElementById('pago-total');
const pedidoIdSpan = document.getElementById('pago-pedido-id');
const btnPagar = document.getElementById('btn-pagar');

// Formateador
const formatoMoney = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });

// 4. Cargar datos del pedido
async function cargarDatosPedido() {
    try {
        const token = AuthService.obtenerToken();
        
        const response = await fetch(`${API_URL}/pedidos/confirmacion/${orderId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Error al cargar pedido');
        }

        const data = await response.json();
        
        // Mostrar datos
        if (totalSpan) totalSpan.textContent = formatoMoney.format(data.pedido.total);
        if (pedidoIdSpan) pedidoIdSpan.textContent = `Pedido # ${data.pedido.id.slice(-8).toUpperCase()}`;
        
        console.log('Pedido cargado:', data.pedido);

    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar el pedido');
        window.location.href = './GridProductos.html';
    }
}

// 5. Iniciar pago con Webpay
async function iniciarPagoWebpay() {
    try {
        btnPagar.disabled = true;
        btnPagar.textContent = 'Conectando con Webpay...';

        const token = AuthService.obtenerToken();
        
        const response = await fetch(`${API_URL}/pagos/iniciar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ orderId: orderId })
        });

        const data = await response.json();

        if (response.ok && data.exito) {
            console.log('Redirigiendo a Webpay...');
            console.log('URL:', data.url);
            console.log('Token:', data.token);
            
            // Redirigir a Webpay
            window.location.href = `${data.url}?token_ws=${data.token}`;
        } else {
            alert(data.mensaje || 'Error al iniciar el pago');
            btnPagar.disabled = false;
            btnPagar.textContent = 'Pagar';
        }

    } catch (error) {
        console.error('Error al iniciar pago:', error);
        alert('Error de conexión con el servidor');
        btnPagar.disabled = false;
        btnPagar.textContent = 'Pagar';
    }
}

// 6. Event listener para el botón
if (btnPagar) {
    btnPagar.addEventListener('click', iniciarPagoWebpay);
}

// 7. Inicializar
document.addEventListener('DOMContentLoaded', cargarDatosPedido);