// ======= login.js v4 =======
console.log("login.js v4 cargado en:", window.location.href);

// ======= Config de simulación =======
const VALID_EMAIL = "cliente@brasero.cl";
const VALID_PASS  = "Clave2025";

// ======= Utilidades =======
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const showMsg = (el, type, text) => {
  el.classList.remove("d-none", "alert-success", "alert-danger");
  el.classList.add(type === "ok" ? "alert-success" : "alert-danger");
  el.textContent = text;
};

// ======= Lógica B-04 (Login cliente simulado) =======
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const msg  = document.getElementById("msgLogin");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    msg.classList.add("d-none");
    msg.classList.remove("alert-success", "alert-danger");
    [...form.querySelectorAll(".is-invalid")].forEach(i => i.classList.remove("is-invalid"));

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const pass  = document.getElementById("loginPassword").value.trim();

    // Validación
    let hasError = false;
    if (!email) {
      document.getElementById("loginEmail").classList.add("is-invalid");
      showMsg(msg, "err", 'El campo "Email" es obligatorio');
      hasError = true;
    }
    if (!pass) {
      document.getElementById("loginPassword").classList.add("is-invalid");
      showMsg(msg, "err", 'El campo "Contraseña" es obligatorio');
      hasError = true;
    }
    if (hasError) return;

    if (!isValidEmail(email)) {
      document.getElementById("loginEmail").classList.add("is-invalid");
      showMsg(msg, "err", "Ingresa un email válido");
      return;
    }

    // Comprobación simulada
    const credsOK = (email === VALID_EMAIL && pass === VALID_PASS);
    if (!credsOK) {
      showMsg(msg, "err", "Credenciales incorrectas");
      return;
    }

    // ======= Éxito =======
    showMsg(msg, "ok", "Login exitoso → Redirigiendo al catálogo…");

    // Guardar “sesión” del cliente (para que el navbar muestre PERFIL)
    sessionStorage.setItem("brasero_user", JSON.stringify({
      email,
      authed: true,
      ts: Date.now()
    }));

    // Construir URL robusta desde /login/login.html
    const targetURL = new URL("../catalogo/GridProductos.html", window.location.href).href;
    console.log("Redirigiendo a:", targetURL);

    // Redirigir (sin alert; el alert bloqueaba y era del código antiguo)
    setTimeout(() => {
      try {
        window.location.assign(targetURL);
      } catch {
        window.location.href = targetURL;
      }
    }, 400);
  });
});
