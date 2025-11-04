// /js/nav-auth.js
(() => {
  const KEY_USER  = "brasero_user";        // { email, authed:true }
  const KEY_ADMIN = "brasero_admin_auth";  // { email, authed:true }

  const mount = document.getElementById("navCuentaMount");
  if (!mount) return;

  // 1) Detectar raíz del proyecto (primer segmento después del host)
  //    p.ej. /EL_Brasero/catalogo/GridProductos.html  => root = "EL_Brasero"
  //    p.ej. /home.html (sin carpeta)                 => root = ""
  const segs = location.pathname.split("/").filter(Boolean);
  const root = segs[0] || "";
  const BASE = root ? `/${root}/` : `/`; // <- SIEMPRE ABSOLUTO

  // 2) URLs absolutas correctas desde cualquier carpeta
  const URLS = {
    loginUser : `${BASE}login/login.html`,
    perfil    : `${BASE}perfil/perfil.html`,
    adminLogin: `${BASE}admin/login.html`,
    adminHome : `${BASE}admin/admin.html`,
  };

  const isUser = () => {
    try { return !!(JSON.parse(sessionStorage.getItem(KEY_USER))?.authed); } catch { return false; }
  };
  const isAdmin = () => {
    try { return !!(JSON.parse(sessionStorage.getItem(KEY_ADMIN))?.authed); } catch { return false; }
  };

  function renderDropdown() {
    mount.innerHTML = `
      <div class="dropdown">
        <a class="btn btn-outline-primary dropdown-toggle ms-lg-3" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
          Cuenta
        </a>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><a class="dropdown-item" href="${URLS.loginUser}">Ingresar</a></li>
          <li><a class="dropdown-item" href="${URLS.adminLogin}">Administración</a></li>
        </ul>
      </div>
    `;
  }
  
  function renderPerfilBtn() {
    // Dropdown con opciones: Ver perfil y Cerrar sesión
    mount.innerHTML = `
      <div class="dropdown">
        <a class="btn btn-outline-primary dropdown-toggle ms-lg-3" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
          Perfil
        </a>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><a class="dropdown-item" href="${URLS.perfil}">Ver perfil</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><button class="dropdown-item text-danger" id="logoutClientBtn" type="button">Cerrar sesión</button></li>
        </ul>
      </div>
    `;

    // Agregar funcionalidad al botón Cerrar sesión
    const btnLogout = document.getElementById("logoutClientBtn");
    if (btnLogout) {
      btnLogout.addEventListener("click", () => {
        // Eliminar la sesión del cliente
        sessionStorage.removeItem("brasero_user");

        // Redirigir a la página principal (home)
        const target = new URL(`${BASE}home.html`, window.location.href).href;
        window.location.assign(target);
      });
    }
  }

  function renderAdminBtn() {
    mount.innerHTML = `<a class="btn btn-primary ms-lg-3" href="${URLS.adminHome}">Administración</a>`;
  }

  // 3) Render según estado
  if (isAdmin()) renderAdminBtn();
  else if (isUser()) renderPerfilBtn();
  else renderDropdown();
})();

