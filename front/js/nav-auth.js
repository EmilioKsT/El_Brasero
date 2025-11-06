// /El_Brasero/front/js/nav-auth.js — versión estable (rutas absolutas fijas)
(() => {
  const KEY_USER  = "brasero_user";
  const KEY_ADMIN = "brasero_admin_auth";

  const mount = document.getElementById("navCuentaMount");
  if (!mount) return;

  // Rutas absolutas correctas desde cualquier página
  const ORIGIN = location.origin;
  const ROOT   = "/El_Brasero/front";
  const URLS = {
    home      : `${ORIGIN}${ROOT}/home.html`,
    loginUser : `${ORIGIN}${ROOT}/login/login.html`,
    perfil    : `${ORIGIN}${ROOT}/perfil/perfil.html`,
    adminLogin: `${ORIGIN}${ROOT}/admin/login.html`,
    adminHome : `${ORIGIN}${ROOT}/admin/admin.html`,
  };

  const parse = (v) => { try { return JSON.parse(v); } catch { return null; } };
  const get   = (k) => parse(sessionStorage.getItem(k)) || parse(localStorage.getItem(k));

  const u = get(KEY_USER);
  const a = get(KEY_ADMIN);
  const isUser  = !!(u && (u.authed === true || u.authed === "true"));
  const isAdmin = !!(a && (a.authed === true || a.authed === "true"));

  const dropdown = (label, items) => `
    <div class="dropdown">
      <button class="btn btn-outline-primary dropdown-toggle ms-lg-3"
              type="button" id="navCuentaBtn" data-bs-toggle="dropdown" aria-expanded="false">
        ${label}
      </button>
      <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navCuentaBtn">
        ${items}
      </ul>
    </div>
  `;

  const bindLogout = () => {
    const btn = document.getElementById("navLogout");
    if (!btn) return;
    btn.addEventListener("click", () => {
      try {
        sessionStorage.removeItem(KEY_USER);
        localStorage.removeItem(KEY_USER);
        sessionStorage.removeItem(KEY_ADMIN);
        localStorage.removeItem(KEY_ADMIN);
      } catch {}
      window.location.assign(URLS.home);
    });
  };

  if (!isUser && !isAdmin) {
    // Usuario anónimo
    mount.innerHTML = dropdown("Cuenta", `
      <li><a class="dropdown-item" href="${URLS.loginUser}">Ingresar</a></li>
      <li><a class="dropdown-item" href="${URLS.adminLogin}">Administración</a></li>
    `);
    return;
  }

  if (isAdmin && !isUser) {
    // Solo admin logueado
    mount.innerHTML = dropdown("Cuenta", `
      <li><a class="dropdown-item" href="${URLS.adminHome}">Administración</a></li>
      <li><hr class="dropdown-divider"></li>
      <li><button class="dropdown-item text-danger" id="navLogout" type="button">Cerrar sesión</button></li>
    `);
    bindLogout();
    return;
  }

  if (isUser && !isAdmin) {
    // Solo usuario logueado
    const nombre = u?.nombre || "Perfil";
    mount.innerHTML = dropdown(nombre, `
      <li><a class="dropdown-item" href="${URLS.perfil}">Ver perfil</a></li>
      <li><hr class="dropdown-divider"></li>
      <li><button class="dropdown-item text-danger" id="navLogout" type="button">Cerrar sesión</button></li>
    `);
    bindLogout();
    return;
  }

  // Usuario y admin activos
  const nombre = u?.nombre || "Cuenta";
  mount.innerHTML = dropdown(nombre, `
    <li><a class="dropdown-item" href="${URLS.perfil}">Ver perfil</a></li>
    <li><a class="dropdown-item" href="${URLS.adminHome}">Administración</a></li>
    <li><hr class="dropdown-divider"></li>
    <li><button class="dropdown-item text-danger" id="navLogout" type="button">Cerrar sesión</button></li>
  `);
  bindLogout();
})();
