import { worldStorage } from "./storage.js";
import { auth, cloudWorld, login, logout } from "./firebase.js";
const q = s => document.querySelector(s);
const each = (s,fn) => document.querySelectorAll(s).forEach(fn);
const gate = q("#account-gate"), message = q("#account-message");
let remote, world, dirty = 0, saved = 0, timer, running, active = false, conflict = false, leaving = false;
function status(text) { each("[data-account-status]", el => el.textContent = text); }
function buttons(disabled) { each("#account-gate button", el => el.disabled = disabled); }
function alertSave(text) {
  let el = q("#nok-save-alert");
  if (!text) { el?.remove(); return; }
  if (!el) { el = document.createElement("aside"); el.id="nok-save-alert"; el.setAttribute("role","alert"); document.body.append(el); }
  el.textContent=text;
}
function changed() {
  if (!remote || leaving) return;
  dirty++; status("Cambios por guardar…");
  if (!timer && !running && !conflict) timer = setTimeout(() => flush().catch(() => {}), 2500);
}
function flush() {
  clearTimeout(timer); timer=0;
  if (!remote || dirty===saved) return Promise.resolve();
  if (running) return running;
  if (conflict) return Promise.reject(Error("Hay una versión más reciente."));
  running = (async () => {
    while (dirty !== saved) {
      const sequence = dirty;
      status("Guardando tu partida…");
      await remote.save(world.snapshot());
      saved = sequence;
    }
    alertSave(""); status("Partida guardada en tu cuenta.");
  })().catch(error => {
    conflict ||= error.code === "nok/conflict";
    const note = conflict ? "Hay cambios más nuevos en otro dispositivo. No se sobrescribió esa partida. Revisá Mi cuenta en Ajustes." : "No se pudo guardar. Conservá esta pestaña abierta y reintentá desde Ajustes.";
    alertSave(note); status(note); throw error;
  }).finally(() => { running=null; });
  return running;
}
async function enter(user) {
  const store = user ? cloudWorld(user.uid) : null;
  const initial = store ? await store.load() : {};
  world = worldStorage(initial, changed); remote = store;
  window.nokGameStorage = world.storage;
  document.documentElement.classList.toggle("mobile-runtime",matchMedia("(max-width:760px),(pointer:coarse) and (max-width:1024px)").matches);
  each("[data-account-name]", el => el.textContent = user?.email || "Exploración sin cuenta");
  each("[data-account-exit]", el => el.textContent = user ? "Guardar y cerrar sesión" : "Salir de la exploración");
  each("[data-account-retry]", el => el.hidden = !user);
  status(user ? "Tu partida es privada." : "Modo de prueba: esta partida no se guarda.");
  await new Promise((resolve,reject) => {
    const script=document.createElement("script");
    script.src="./app.js" + new URL(import.meta.url).search;
    script.onload=resolve; script.onerror=()=>reject(Error("No se pudo cargar NOK.")); document.body.append(script);
  });
  active=true; gate.hidden=true; document.body.classList.remove("account-locked");
  document.dispatchEvent(new Event("nok:world-entered"));
}
function readable(error) {
  if (error.code === "auth/popup-closed-by-user" || error.code === "auth/cancelled-popup-request") return "Se canceló el acceso. Podés intentarlo otra vez.";
  if (error.code === "auth/popup-blocked") return "Permití la ventana de Google y volvé a intentar.";
  if (error.code === "permission-denied") return "El guardado privado no está disponible. No se abrió ni se modificó tu partida.";
  return "No se pudo abrir tu partida. Revisá la conexión y volvé a intentar. No se reemplazaron tus datos.";
}
q("#account-google").addEventListener("click", async () => {
  buttons(true); message.textContent="Esperando a Google…";
  try { const user = await login(); message.textContent="Abriendo tu partida privada…"; await enter(user); }
  catch(error) { await logout().catch(()=>{}); remote=null; message.textContent=readable(error); buttons(false); }
});
q("#account-guest").addEventListener("click", async () => {
  buttons(true);
  try { await enter(null); }
  catch { message.textContent="No se pudo abrir el juego. Recargá para reintentar."; buttons(false); }
});
each("[data-account-retry]", el => el.addEventListener("click", () => flush().catch(()=>{})));
each("[data-account-exit]", el => el.addEventListener("click", async () => {
  if (leaving) return;
  if (!remote && !confirm("¿Salir de la exploración? Esta partida de prueba no se guarda.")) return;
  try {
    if (conflict) { if (!confirm("¿Descartar los cambios de esta pestaña? La versión guardada en el otro dispositivo se conserva.")) return; }
    else await flush();
    leaving=true; await logout(); location.reload();
  } catch { leaving=false; }
}));
window.addEventListener("online", () => flush().catch(()=>{}));
document.addEventListener("visibilitychange", () => { if (document.hidden) flush().catch(()=>{}); });
window.addEventListener("beforeunload", e => { if (!leaving && remote && saved!==dirty) { e.preventDefault(); e.returnValue=""; } });
window.addEventListener("pageshow", e => { if(e.persisted) location.reload(); });
auth.onAuthStateChanged(user => { if(active && remote && !user && !leaving) location.reload(); });
