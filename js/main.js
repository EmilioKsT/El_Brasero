// -------- MOCK API (simula el backend) -----------------
const MockConfig = {
  // "auto" = lógica normal; "ok" = fuerza éxito; "email" = fuerza email en uso; "pass" = fuerza pass débil; "random" = aleatorio
  mode: "auto",
  delayMs: 400
};

// Permite forzar modo por querystring: ?mock=ok|email|pass|random|auto
(() => {
  const m = new URLSearchParams(location.search).get("mock");
  if (m) MockConfig.mode = m;
})();

const MockDB = {
  key: "elb_users",
  load() { try { return JSON.parse(localStorage.getItem(this.key)) || []; } catch { return []; } },
  save(users) { localStorage.setItem(this.key, JSON.stringify(users)); }
};

function validaPassword(pass) {
  // 8+ caracteres, 1 mayúscula, 1 dígito (ajusta a tu rúbrica)
  return /[A-Z]/.test(pass) && /\d/.test(pass) && pass.length >= 8;
}

function hash(s){ let h=0; for (let i=0;i<s.length;i++) h=(h<<5)-h+s.charCodeAt(i)|0; return String(h); }

async function apiRegistrar(email, pass) {
  // Delay para parecer red
  await new Promise(r => setTimeout(r, MockConfig.delayMs));

  // Modos forzados para demo en clases
  if (MockConfig.mode === "ok")       return { ok: true };
  if (MockConfig.mode === "email")    return { ok: false, error: "EMAIL_IN_USE" };
  if (MockConfig.mode === "pass")     return { ok: false, error: "WEAK_PASSWORD" };
  if (MockConfig.mode === "random")   return Math.random() < 0.5 ? { ok: true } : { ok:false, error:"RANDOM_FAIL" };

  // Lógica "auto": replica los escenarios del wireframe
  if (!validaPassword(pass)) return { ok:false, error:"WEAK_PASSWORD" };

  const users = MockDB.load();
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { ok:false, error:"EMAIL_IN_USE" };
  }
  users.push({ email, passHash: hash(pass), createdAt: Date.now() });
  MockDB.save(users);
  return { ok:true };
}

// Exponer funciones que usará la página /registrate
window.MockAuth = { apiRegistrar, validaPassword };

// -------- CONTROLADOR DE /registrate (si la página existe) --------
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-registro");
  if (!form) return; // no estamos en /registrate

  const emailEl = document.getElementById("email");
  const passEl  = document.getElementById("password");
  const msgEl   = document.getElementById("msg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    showMsg("");

    const email = emailEl.value.trim();
    const pass  = passEl.value;

    const res = await window.MockAuth.apiRegistrar(email, pass);

    if (res.ok) {
      showMsg("Registro exitoso. Redirigiendo a tu perfil…", "ok");
      // “Autenticar” y redirigir
      sessionStorage.setItem("elb_session", JSON.stringify({ email }));
      setTimeout(() => location.href = "/dashboard/", 900);
    } else {
      const map = {
        EMAIL_IN_USE: "El email ya está en uso",
        WEAK_PASSWORD: "La contraseña no cumple los requisitos",
        RANDOM_FAIL: "No se pudo registrar. Intenta otra vez"
      };
      showMsg(map[res.error] || "Error inesperado", "error");
    }
  });

  function showMsg(text, kind){
    msgEl.textContent = text;
    msgEl.hidden = !text;
    msgEl.className = "alert " + (kind==="ok" ? "alert--ok" : "alert--error");
  }
});
