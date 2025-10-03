// Mock DB con usuarios de prueba
const mockDB = ["cliente@brasero.cl", "prueba+1@brasero.cl"];

const form = document.getElementById("registroForm");
const mensaje = document.getElementById("mensaje");

form.addEventListener("submit", function(e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value.trim();

  // Reset mensaje
  mensaje.classList.add("d-none");
  mensaje.classList.remove("alert-success", "alert-danger");

  // Escenario 2: email ya registrado
  if (mockDB.includes(email)) {
    mensaje.textContent = "El email ya está en uso";
    mensaje.classList.remove("d-none");
    mensaje.classList.add("alert-danger");
    return;
  }

  // Escenario 3: contraseña inválida (<8, sin mayúscula o sin número)
  const regexPass = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!regexPass.test(password)) {
    mensaje.textContent = "La contraseña no cumple los requisitos";
    mensaje.classList.remove("d-none");
    mensaje.classList.add("alert-danger");
    return;
  }

  // Escenario 1: éxito
  mockDB.push(email); // agregamos a la lista simulada
  mensaje.textContent = "Registro exitoso";
  mensaje.classList.remove("d-none");
  mensaje.classList.add("alert-success");

  // Simulación de redirección simple
  setTimeout(() => {
    alert("Registro exitoso. Redirigiendo al perfil personal (simulado)");
  }, 800);
});
