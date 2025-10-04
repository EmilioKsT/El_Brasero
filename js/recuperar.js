// B-05 Recuperación de contraseña (100% front-end simulado)

// Datos de demo (no hay backend)
const DEMO_EMAIL = "cliente@brasero.cl";
const DEMO_CODE  = "123456";

// Helpers UI
const $ = (sel) => document.querySelector(sel);
const show    = (el) => el.classList.remove("d-none");
const hide    = (el) => el.classList.add("d-none");
const setAlert = (type, msg) => {
  const box = $("#alertBox");
  box.className = `alert alert-${type}`;
  box.textContent = msg;
  show(box);
};
const clearAlert = () => {
  const box = $("#alertBox");
  box.className = "alert d-none";
  box.textContent = "";
};

// Pasos
const stepEmail   = $("#stepEmail");
const stepCode    = $("#stepCode");
const stepNewPass = $("#stepNewPass");
const stepSuccess = $("#stepSuccess");

// Navegación entre pasos
function goTo(step) {
  [stepEmail, stepCode, stepNewPass, stepSuccess].forEach(hide);
  clearAlert();
  show(step);
}

// Validaciones
function isValidEmail(value) {
  // Usa validación nativa del input type="email" + chequeo simple
  return /\S+@\S+\.\S+/.test(value);
}
function passwordPolicyOk(pwd) {
  const long  = pwd.length >= 8;
  const upper = /[A-ZÁÉÍÓÚÑ]/.test(pwd);
  const digit = /\d/.test(pwd);
  return long && upper && digit;
}

// Paso 1: Email -> responder genérico y avanzar
stepEmail.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = $("#email");

  if (!isValidEmail(email.value)) {
    email.classList.add("is-invalid");
    setAlert("danger", "Ingresa un email válido");
    return;
  }
  email.classList.remove("is-invalid");

  // Respuesta genérica (no revelamos existencia de cuenta)
  setAlert("info", "Si existe una cuenta, te enviaremos un correo con instrucciones");

  // Avanzar al paso de código (simulado)
  setTimeout(() => {
    goTo(stepCode);
  }, 700);
});

// Botón volver desde Código
$("#backToEmail").addEventListener("click", () => goTo(stepEmail));

// Paso 2: Verificar código (debe ser exactamente 123456)
stepCode.addEventListener("submit", (e) => {
  e.preventDefault();
  const code = $("#code");
  const raw  = code.value.trim();

  if (!/^\d{6}$/.test(raw)) {
    code.classList.add("is-invalid");
    setAlert("danger", "Ingresa un código de 6 dígitos");
    return;
  }
  code.classList.remove("is-invalid");

  if (raw !== DEMO_CODE) {
    setAlert("danger", "Código inválido. Intenta nuevamente");
    return;
  }

  goTo(stepNewPass);
});

// Botón volver desde Nueva contraseña
$("#backToCode").addEventListener("click", () => goTo(stepCode));

// Paso 3: Nueva contraseña -> validar política y coincidencia
stepNewPass.addEventListener("submit", (e) => {
  e.preventDefault();
  const np = $("#newPass");
  const cf = $("#confirmPass");

  let ok = true;

  if (!passwordPolicyOk(np.value)) {
    np.classList.add("is-invalid");        // Esc4
    setAlert("danger", "La contraseña no cumple los requisitos");
    ok = false;
  } else {
    np.classList.remove("is-invalid");
  }

  if (cf.value !== np.value) {
    cf.classList.add("is-invalid");        // Esc5
    setAlert("danger", "Las contraseñas no coinciden");
    ok = false;
  } else {
    cf.classList.remove("is-invalid");
  }

  if (!ok) return;

  // "Guardar" simulado (sin persistencia)
  setAlert("success", "Guardando...");
  setTimeout(() => {
    clearAlert();
    goTo(stepSuccess);
  }, 700);
});

// (Opcional) autocompletar de demo si el usuario escribe el email conocido
$("#email").addEventListener("input", () => {
  $("#email").classList.remove("is-invalid");
});
$("#code").addEventListener("input", () => {
  $("#code").classList.remove("is-invalid");
});
$("#newPass").addEventListener("input", () => {
  $("#newPass").classList.remove("is-invalid");
});
$("#confirmPass").addEventListener("input", () => {
  $("#confirmPass").classList.remove("is-invalid");
});
