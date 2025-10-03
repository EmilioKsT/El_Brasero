// "Mock DB" → emails ya registrados
const mockDB = ["cliente@brasero.cl"];

const form = document.getElementById("registroForm");
const mensaje = document.getElementById("mensaje");

form.addEventListener("submit", function(e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  // Reset mensaje
  mensaje.classList.add("d-none");
  mensaje.classList.remove("alert-success", "alert-danger");

  // Escenario 2: Email ya registrado
  if (mockDB.includes(email)) {
    mensaje.textContent = "El email ya está en uso";
    mensaje.classList.remove("d-none");
    mensaje.classList.add("alert-danger");
    return;
  }

  // Escenario 3: Contraseña inválida (<8, sin mayúscula, sin número)
  const regexPass = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!regexPass.test(password)) {
    mensaje.textContent = "La contraseña no cumple los requisitos";
    mensaje.classList.remove("d-none");
    mensaje.classList.add("alert-danger");
    return;
  }

  // Escenario 1: Registro exitoso → simulamos guardado en DB
  mockDB.push(email);
  mensaje.textContent = "Registro exitoso";
  mensaje.classList.remove("d-none");
  mensaje.classList.add("alert-success");

  // Simulación de redirección
  setTimeout(() => {
    alert("Redirigiendo...");
    // window.location.href = "area-privada.html";
  }, 1500);
});
