// ======= Config de simulación =======
const VALID_EMAIL = "cliente@brasero.cl";
const VALID_PASS  = "Clave2025"; 

// ======= Utilidades =======
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const showMsg = (el, type, text) => {
  el.classList.remove("d-none", "alert-success", "alert-danger");
  el.classList.add(type === "ok" ? "alert-success" : "alert-danger");
  el.textContent = text;
};

// ======= Lógica B-04 =======
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

    // Campos vacíos
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

    // Email inválido
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

    // Éxito
    showMsg(msg, "ok", "Login exitoso → Redirección a Panel (simulado)");
    setTimeout(() => {
      alert("Login exitoso. Redirigiendo al Panel… (simulado)");
      // window.location.href = "../panel/index.html"; // si quieres redirigir
    }, 700);
  });
});
