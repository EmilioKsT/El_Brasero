
// Datos de demo simulados
const DEMO_PROFILE = {
  nombre:   "María López",
  telefono: "987654321",
  direccion:"Av. Las Brasas 123",
  comuna:   "Maipú",
  email:    "cliente@brasero.cl" // solo lectura
};

// Helpers UI
const $       = (sel) => document.querySelector(sel);
const show    = (el) => el.classList.remove("d-none");
const hide    = (el) => el.classList.add("d-none");
const setAlert = (type, msg) => {
  const box = $("#msgPerfil");
  box.className = `alert alert-${type}`;
  box.textContent = msg;
  show(box);
};
const clearAlert = () => {
  const box = $("#msgPerfil");
  box.className = "alert d-none";
  box.textContent = "";
};

// Campos del formulario
const form = $("#perfilForm");
const fNombre = $("#nombre");
const fTelefono = $("#telefono");
const fDireccion = $("#direccion");
const fComuna = $("#comuna");
const fEmail = $("#email");
const btnCancelar = $("#btnCancelar");

// Estado simulado
let state = { ...DEMO_PROFILE };
let previous = { ...DEMO_PROFILE };

// Render inicial
function renderFromState(s) {
  fNombre.value = s.nombre;
  fTelefono.value = s.telefono;
  fDireccion.value = s.direccion;
  fComuna.value = s.comuna;
  fEmail.value = s.email;
}
renderFromState(state);

// Validaciones simples
function isPhoneValid(v) {
  return /^\d{9,11}$/.test(v.trim());
}
function isMinLen(v, n) {
  return (v.trim().length >= n);
}

// Quitar error al escribir
[fNombre, fTelefono, fDireccion, fComuna].forEach(inp => {
  inp.addEventListener("input", () => {
    inp.classList.remove("is-invalid");
    clearAlert();
  });
});

// Guardar (simulado)
form.addEventListener("submit", (e) => {
  e.preventDefault();
  clearAlert();

  [fNombre, fTelefono, fDireccion, fComuna].forEach(i => i.classList.remove("is-invalid"));

  let invalid = false;

  if (!fNombre.value.trim()) { fNombre.classList.add("is-invalid"); invalid = true; }
  if (!isPhoneValid(fTelefono.value)) { fTelefono.classList.add("is-invalid"); invalid = true; }
  if (!isMinLen(fDireccion.value, 5)) { fDireccion.classList.add("is-invalid"); invalid = true; }
  if (!fComuna.value.trim()) { fComuna.classList.add("is-invalid"); invalid = true; }

  if (invalid) {
    if (fTelefono.classList.contains("is-invalid")) {
      setAlert("danger", "Ingresa un teléfono válido");
    } else {
      setAlert("danger", "El campo es obligatorio o no cumple el mínimo.");
    }
    return;
  }

  state = {
    nombre: fNombre.value.trim(),
    telefono: fTelefono.value.trim(),
    direccion: fDireccion.value.trim(),
    comuna: fComuna.value.trim(),
    email: fEmail.value
  };
  previous = { ...state };

  setAlert("success", "Datos actualizados");
});

// Cancelar → volver a estado anterior
btnCancelar.addEventListener("click", () => {
  renderFromState(previous);
  clearAlert();
  [fNombre, fTelefono, fDireccion, fComuna].forEach(i => i.classList.remove("is-invalid"));
  setAlert("secondary", "Cambios cancelados. Se restauraron los valores previos.");
});
