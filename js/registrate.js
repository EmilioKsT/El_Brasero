// B-03 Registro — sin persistencia (solo memoria) + sesión actual
let mockDB = [
  "prueba+1@brasero.cl" 
];

const form = document.getElementById("registroForm");
const mensaje = document.getElementById("mensaje");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value.trim();
  const password2 = document.getElementById("password2")?.value.trim() || "";

  // Reset mensaje
  mensaje.classList.add("d-none");
  mensaje.classList.remove("alert-success", "alert-danger");

  // 1) Email ya registrado
  if (mockDB.includes(email)) {
    mensaje.textContent = "El email ya está en uso";
    mensaje.classList.remove("d-none");
    mensaje.classList.add("alert-danger");
    return;
  }

  // 2) Contraseña inválida (<8, sin mayúscula o sin número)
  const regexPass = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!regexPass.test(password)) {
    mensaje.textContent = "La contraseña no cumple los requisitos";
    mensaje.classList.remove("d-none");
    mensaje.classList.add("alert-danger");
    return;
  }

  // 3) Coincidencia de contraseñas
  if (password !== password2) {
    mensaje.textContent = "Las contraseñas no coinciden";
    mensaje.classList.remove("d-none");
    mensaje.classList.add("alert-danger");
    return;
  }

  // 4) Éxito: agregamos a la "BD" en memoria SOLO para esta ejecución
  mockDB.push(email);

  // Quedar autenticado en la sesión actual (no persistente entre pestañas/cierres)
  sessionStorage.setItem("usuarioActivo", email);

  mensaje.textContent = "Registro exitoso. Redirigiendo al perfil...";
  mensaje.classList.remove("d-none");
  mensaje.classList.add("alert-success");

  setTimeout(() => {
    window.location.href = "../perfil/perfil.html";
  }, 800);
});

// Feedback en vivo para repetir contraseña (opcional)
const pass1 = document.getElementById("password");
const pass2 = document.getElementById("password2");
if (pass1 && pass2) {
  const checkMatch = () => {
    if (!pass2.value) return;
    if (pass1.value === pass2.value) {
      pass2.classList.remove("is-invalid");
      pass2.classList.add("is-valid");
    } else {
      pass2.classList.remove("is-valid");
      pass2.classList.add("is-invalid");
    }
  };
  ["input", "change"].forEach(ev => {
    pass1.addEventListener(ev, checkMatch);
    pass2.addEventListener(ev, checkMatch);
  });
}
