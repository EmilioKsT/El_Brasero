// /js/nav-auth.js
(() => {
  const KEY_USER  = "brasero_user";        // { email, authed:true }
  const KEY_ADMIN = "brasero_admin_auth";  // { email, authed:true }

  const mount = document.getElementById("navCuentaMount");
  if (!mount) return;

  // 1) Detectar la raíz real del proyecto a partir de la ubicación del script.
  //    Esto evita suposiciones según la URL actual (que fallaban al abrir los
  //    HTML directamente con file:// o cuando el sitio vive en un subdirectorio).
  const resolveBaseURL = () => {
    const current = document.currentScript;
    if (current?.src) return new URL(current.src, window.location.href);

 const fallback = Array.from(document.querySelectorAll("script"))
      .reverse()
      .find((el) => /nav-auth\.js(?:\?|$)/.test(el.src || ""));
    if (fallback?.src) return new URL(fallback.src, window.location.href);

    return new URL(window.location.href);
  };

  const scriptURL = resolveBaseURL();
  const baseURL = new URL("../", scriptURL); // carpeta /front/ (o raíz del sitio)

  // 2) URLs absolutas correctas desde cualquier carpeta / protocolo.
  const URLS = {
    loginUser : new URL("login/login.html", baseURL).href,
    perfil    : new URL("perfil/perfil.html", baseURL).href,
    adminLogin: new URL("admin/login.html", baseURL).href,
    adminHome : new URL("admin/admin.html", baseURL).href,
    home      : new URL("home.html", baseURL).href,
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
        window.location.assign(URLS.home);
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

