// B-15 Acceso admin simulado (sin backend)
// Credenciales válidas (DoR): admin@brasero.cl / Admin2025


const ADMIN_EMAIL = "admin@brasero.cl";
const ADMIN_PASS  = "Admin2025";

// Helpers breves
const $ = (s) => document.querySelector(s);
const show = (el) => el && el.classList.remove("d-none");
const hide = (el) => el && el.classList.add("d-none");

// Estado en sessionStorage
const ADMIN_KEY = "brasero_admin_auth";   // "1" => logueado
const ADMIN_MAIL_KEY = "brasero_admin_email";

// ¿Estoy en login o en dashboard?
const isLogin = document.body.classList.contains("admin-login");
const isDashboard = document.body.classList.contains("admin-dashboard");

// --- Login page ---
if (isLogin) {
  const form = $("#admin-login-form");
  const msg  = $("#admin-msg");
  const email = $("#admin-email");
  const pass  = $("#admin-pass");
  const toggleBtn = $("#admin-toggle-pass");

  // Si ya está logueado, ir directo al dashboard
  if (sessionStorage.getItem(ADMIN_KEY) === "1") {
    window.location.replace("./admin.html");
  }

  toggleBtn?.addEventListener("click", () => {
    const type = pass.type === "password" ? "text" : "password";
    pass.type = type;
    toggleBtn.textContent = type === "password" ? "Mostrar" : "Ocultar";
  });

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    // Validación HTML5
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const ok = email.value.trim().toLowerCase() === ADMIN_EMAIL &&
               pass.value === ADMIN_PASS;

    if (ok) {
      sessionStorage.setItem(ADMIN_KEY, "1");
      sessionStorage.setItem(ADMIN_MAIL_KEY, ADMIN_EMAIL);
      // Ir al dashboard admin (ruta separada del login de cliente)
      window.location.href = "./admin.html";
    } else {
      msg.className = "alert alert-danger";
      msg.textContent = "Acceso denegado";
      show(msg);
    }
  });
}

// --- Dashboard ---
if (isDashboard) {
  // Guardia de ruta: si no hay sesión admin => volver a login
  if (sessionStorage.getItem(ADMIN_KEY) !== "1") {
    window.location.replace("./login.html");
  }

  // Pintar email en topbar
  const topEmail = $("#admin-top-email");
  if (topEmail) topEmail.textContent = sessionStorage.getItem(ADMIN_MAIL_KEY) || "admin@brasero.cl";

  // Logout
  $("#admin-logout")?.addEventListener("click", () => {
    sessionStorage.removeItem(ADMIN_KEY);
    sessionStorage.removeItem(ADMIN_MAIL_KEY);
    window.location.replace("./login.html");
  });
}
