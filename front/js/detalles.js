// front/js/detalles.js

console.log("Script detalles.js cargado");

// 1. Referencias al DOM (Buscamos los elementos por su ID del HTML B-10)
const imgProducto = document.getElementById('b10-img');
const txtNombre = document.getElementById('b10-nombre');
const txtDesc = document.getElementById('b10-desc');
const txtPrecio = document.getElementById('b10-precio');
const selectCant = document.getElementById('b10-cant');
const btnAgregar = document.getElementById('b10-add');
const alerta404 = document.getElementById('b10-notfound');
const tarjetaDetalle = document.querySelector('.card.h-100'); // Contenedor de info
const toastEl = document.getElementById('b10-toast'); // El toast de éxito

// 2. Obtener el ID de la URL
const params = new URLSearchParams(window.location.search);
const productoId = params.get('id'); // ej: "654..."

// ============================================
// FUNCION: Cargar Detalle (GET)
// ============================================
async function cargarProducto() {
    // Validación rápida
    if (!productoId) {
        mostrarError();
        return;
    }

    try {
        // URL: http://localhost:3000/api/productos/:id
        const respuesta = await fetch(`${API_URL}/productos/${productoId}`);

        if (!respuesta.ok) {
            throw new Error('Producto no encontrado');
        }

        const producto = await respuesta.json();

        // [RENDER] Pintar datos en el HTML
        txtNombre.textContent = producto.nombre;
        txtDesc.textContent = producto.descripcion || 'Sin descripción disponible.';
        
        // Formatear precio CLP
        txtPrecio.textContent = new Intl.NumberFormat('es-CL', { 
            style: 'currency', currency: 'CLP' 
        }).format(producto.precio);

        // Imagen (o placeholder si viene vacía)
        imgProducto.src = producto.imagenUrl || './img/logo.png'; 
        
        // Llenar selector de cantidad (1 a 10)
        let opciones = '';
        for (let i = 1; i <= 10; i++) {
            opciones += `<option value="${i}">${i}</option>`;
        }
        selectCant.innerHTML = opciones;

    } catch (error) {
        console.error(error);
        mostrarError();
    }
}

// ============================================
// FUNCION: Agregar al Carrito (POST)
// ============================================
btnAgregar.addEventListener('click', async () => {
    // Verificar si el usuario está logueado (Requisito B-11)
    if (!AuthService.estaLogueado()) {
        alert("Debes iniciar sesión para comprar.");
        window.location.href = './login.html';
        return;
    }

    const cantidad = parseInt(selectCant.value);
    const token = AuthService.obtenerToken(); // Necesitamos el JWT

    // Deshabilitar botón para evitar doble click
    btnAgregar.disabled = true;
    btnAgregar.textContent = "Agregando...";

    try {
        // [FETCH] Enviar datos al Carrito
        const respuesta = await fetch(`${API_URL}/carrito/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // ¡Clave para ZTA!
            },
            body: JSON.stringify({
                productoId: productoId,
                cantidad: cantidad
            })
        });

        if (respuesta.ok) {
            const toastEl = document.getElementById('b10-toast');
            if (toastEl) {
                const toast = new bootstrap.Toast(toastEl);
                toast.show();
            }

            // ---> AGREGA ESTO AQUI: <---
            if (window.actualizarBadgeGlobal) {
                window.actualizarBadgeGlobal();
            }
            
        } else {
            alert('Error al agregar al carrito');
        }

    } catch (error) {
        console.error(error);
        alert("Error de conexión con el servidor.");
    } finally {
        // Restaurar botón
        btnAgregar.disabled = false;
        btnAgregar.textContent = "Agregar al carrito";
    }
});

// Helper para mostrar estado 404
function mostrarError() {
    alerta404.classList.remove('d-none');
    tarjetaDetalle.classList.add('d-none'); // Ocultar panel derecho
    imgProducto.parentElement.classList.add('d-none'); // Ocultar imagen
}

// Iniciar
document.addEventListener('DOMContentLoaded', cargarProducto);