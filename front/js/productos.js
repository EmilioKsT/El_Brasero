console.log("Script productos.js cargado (Con Filtros y Paginación)");

const gridContenedor = document.getElementById('b09-grid');
const paginacionContenedor = document.getElementById('b09-pagination');
const emptyState = document.getElementById('b09-empty');

// Referencias a los inputs de filtros (Desktop)
const inputBusqueda = document.getElementById('b09-buscar');
const selectCategoria = document.getElementById('b09-categoria');
const inputMin = document.getElementById('b09-min');
const inputMax = document.getElementById('b09-max');
const btnAplicar = document.getElementById('b09-aplicar');
const btnLimpiar = document.getElementById('b09-limpiar');
const btnLimpiarEmpty = document.getElementById('b09-empty-reset');

// Referencias a los inputs de filtros (Móvil) - Si existen en tu HTML
const selectCategoriaMovil = document.getElementById('b09-categoria-m');
const inputMinMovil = document.getElementById('b09-min-m');
const inputMaxMovil = document.getElementById('b09-max-m');
const btnAplicarMovil = document.getElementById('b09-aplicar-m');
const btnLimpiarMovil = document.getElementById('b09-limpiar-m');


// Estado global de la vista
let estadoActual = {
    page: 1,
    limit: 8,
    filtros: {
        q: '',
        categoria: '',
        min: '',
        max: ''
    }
};

// ==========================================
// 1. INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    configurarEventos();
    cargarProductos();
});

function configurarEventos() {
    // Búsqueda por texto (al escribir o presionar Enter)
    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', (e) => {
            // Debounce simple para no saturar con peticiones mientras escribe
            clearTimeout(window.searchTimeout);
            window.searchTimeout = setTimeout(() => {
                aplicarFiltro('q', e.target.value);
            }, 500); 
        });
    }

    // Filtros Desktop
    if (btnAplicar) {
        btnAplicar.addEventListener('click', () => {
            aplicarFiltrosDesdeInputs(selectCategoria, inputMin, inputMax);
        });
    }

    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', limpiarFiltros);
    }
    
    // Filtros Móvil
    if (btnAplicarMovil) {
        btnAplicarMovil.addEventListener('click', () => {
            aplicarFiltrosDesdeInputs(selectCategoriaMovil, inputMinMovil, inputMaxMovil);
        });
    }

    if (btnLimpiarMovil) {
        btnLimpiarMovil.addEventListener('click', limpiarFiltros);
    }

    // Botón limpiar desde estado vacío
    if (btnLimpiarEmpty) {
        btnLimpiarEmpty.addEventListener('click', limpiarFiltros);
    }
}

function aplicarFiltrosDesdeInputs(catSelect, minInput, maxInput) {
    const categoria = catSelect ? catSelect.value : '';
    const min = minInput ? minInput.value : '';
    const max = maxInput ? maxInput.value : '';

    estadoActual.filtros.categoria = (categoria === 'Todas') ? '' : categoria;
    estadoActual.filtros.min = min;
    estadoActual.filtros.max = max;
    estadoActual.page = 1; // Resetear a página 1
    
    cargarProductos();
}

function aplicarFiltro(clave, valor) {
    estadoActual.filtros[clave] = valor;
    estadoActual.page = 1; // Siempre volver a la página 1 al filtrar
    cargarProductos();
}

function limpiarFiltros() {
    // Resetear estado
    estadoActual.filtros = { q: '', categoria: '', min: '', max: '' };
    estadoActual.page = 1;

    // Limpiar inputs visualmente
    if (inputBusqueda) inputBusqueda.value = '';
    
    // Desktop
    if (selectCategoria) selectCategoria.value = 'Todas';
    if (inputMin) inputMin.value = '';
    if (inputMax) inputMax.value = '';

    // Móvil
    if (selectCategoriaMovil) selectCategoriaMovil.value = 'Todas';
    if (inputMinMovil) inputMinMovil.value = '';
    if (inputMaxMovil) inputMaxMovil.value = '';

    cargarProductos();
}


// ==========================================
// 2. CARGAR PRODUCTOS 
// ==========================================
async function cargarProductos() {
    try {
        // Construir URLSearchParams limpia (sin vacíos)
        const params = new URLSearchParams();
        params.append('page', estadoActual.page);
        params.append('limit', estadoActual.limit);

        if (estadoActual.filtros.q) params.append('q', estadoActual.filtros.q);
        if (estadoActual.filtros.categoria) params.append('categoria', estadoActual.filtros.categoria);
        if (estadoActual.filtros.min) params.append('min', estadoActual.filtros.min);
        if (estadoActual.filtros.max) params.append('max', estadoActual.filtros.max);

        const respuesta = await fetch(`${API_URL}/productos?${params}`);
        
        if (!respuesta.ok) throw new Error('Error API');

        const data = await respuesta.json();

        // Renderizar
        renderizarGrid(data.productos);
        renderizarPaginacion(data.paginacion);

    } catch (error) {
        console.error(error);
        gridContenedor.innerHTML = '<div class="col-12 text-center text-danger">Error al cargar el catálogo.</div>';
    }
}

// ==========================================
// 3. RENDERIZAR GRID
// ==========================================
function renderizarGrid(listaProductos) {
    gridContenedor.innerHTML = ''; 

    // Estado vacío
    if (!listaProductos || listaProductos.length === 0) {
        gridContenedor.classList.add('d-none');
        emptyState.classList.remove('d-none');
        paginacionContenedor.innerHTML = ''; // Ocultar paginación si no hay resultados
        return;
    }

    gridContenedor.classList.remove('d-none');
    emptyState.classList.add('d-none');

    listaProductos.forEach(prod => {
        const precio = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(prod.precio);
        const imagen = prod.imagenUrl || './img/logo.png';

        const card = `
            <div class="col-12 col-sm-6 col-lg-3 d-flex align-items-stretch">
                <div class="card w-100 shadow-sm b08-card">
                    <img src="${imagen}" class="card-img-top b08-img" alt="${prod.nombre}" style="height: 200px; object-fit: cover;">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title text-truncate" title="${prod.nombre}">${prod.nombre}</h5>
                        <p class="card-text fw-bold text-primary mb-auto">${precio}</p>
                        <div class="d-grid gap-2 mt-3">
                            <a href="./detalles.html?id=${prod._id}" class="btn btn-outline-primary btn-sm">Ver detalle</a>
                            <button class="btn btn-primary btn-sm" onclick="window.agregarRapido('${prod._id}')">Agregar</button>
                    </div>
                </div>
            </div>
        `;
        gridContenedor.insertAdjacentHTML('beforeend', card);
    });
}

// ==========================================
// 4. RENDERIZAR PAGINACIÓN
// ==========================================
function renderizarPaginacion(info) {
    paginacionContenedor.innerHTML = ''; 

    if (!info || info.totalPaginas <= 1) return;

    // Anterior
    const prevDisabled = info.page === 1 ? 'disabled' : '';
    const prevClick = info.page === 1 ? '' : `onclick="cambiarPagina(${info.page - 1})"`;
    
    paginacionContenedor.innerHTML += `
        <li class="page-item ${prevDisabled}">
            <button class="page-link" ${prevClick}>&laquo;</button>
        </li>
    `;

    // Números
    for (let i = 1; i <= info.totalPaginas; i++) {
        const activo = i === info.page ? 'active' : '';
        paginacionContenedor.innerHTML += `
            <li class="page-item ${activo}">
                <button class="page-link" onclick="cambiarPagina(${i})">${i}</button>
            </li>
        `;
    }

    // Siguiente
    const nextDisabled = info.page === info.totalPaginas ? 'disabled' : '';
    const nextClick = info.page === info.totalPaginas ? '' : `onclick="cambiarPagina(${info.page + 1})"`;

    paginacionContenedor.innerHTML += `
        <li class="page-item ${nextDisabled}">
            <button class="page-link" ${nextClick}>&raquo;</button>
        </li>
    `;
}

// Función global
window.cambiarPagina = (nuevaPagina) => {
    estadoActual.page = nuevaPagina;
    cargarProductos();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// front/js/productos.js (Al final del archivo)

window.agregarRapido = async (productoId) => {
    // 1. Validar sesión
    if (!AuthService.estaLogueado()) {
        alert("Inicia sesión para comprar");
        window.location.href = './login.html';
        return;
    }

    try {
        const token = AuthService.obtenerToken();
        
        // 2. Petición POST al carrito
        const respuesta = await fetch(`${API_URL}/carrito/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                productoId: productoId,
                cantidad: 1 // Agrega de a 1 desde el grid
            })
        });

        if (respuesta.ok) {
            // 3. ¡AQUÍ ESTÁ LA MAGIA! 
            // Llamamos a la función global que creamos en navbar.js
            if (window.actualizarBadgeGlobal) {
                window.actualizarBadgeGlobal();
            }
            
            // Feedback visual simple (opcional: podrías usar un Toast mejor)
            console.log("Producto agregado al carrito");

            const btn = document.activeElement;
            if(btn && btn.tagName === 'BUTTON') {
                const textoOriginal = btn.innerText;
                btn.innerText = "✔ Agregado";
                btn.classList.replace('btn-primary', 'btn-success');
                setTimeout(() => {
                    btn.innerText = textoOriginal;
                    btn.classList.replace('btn-success', 'btn-primary');
                }, 1000);
            }

        } else {
            console.error("Error al agregar");
        }

    } catch (error) {
        console.error(error);
    }
};