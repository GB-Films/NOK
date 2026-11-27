import { worldStorage } from "./storage.js";
import { preloadSavedTerrain } from "./terrain.js";
import { auth, cloudWorld, login, logout, calendarFor } from "./firebase.js";
const q = s => document.querySelector(s);
const each = (s,fn) => document.querySelectorAll(s).forEach(fn);
const gate = q("#account-gate"), message = q("#account-message");
let remote, world, dirty = 0, saved = 0, timer, running, active = false, conflict = false, leaving = false;
let privateUid = null, opening = false, guestVisit = false;
function status(text) { each("[data-account-status]", el => el.textContent = text); }
function buttons(disabled) { each("#account-gate button", el => el.disabled = disabled); }
function showGate(mode, text) {
  const busy = mode === "busy", retry = mode === "retry";
  q("#account-google").hidden = busy;
  q("#account-google").textContent = retry ? "Reintentar abrir mi mundo" : "Continuar con Google";
  q("#account-guest").hidden = busy || retry;
  q("#account-forget").hidden = !retry;
  buttons(busy); message.textContent = text;
}
function checkOwner(user) {
  if (leaving || (user && auth.currentUser?.uid !== user.uid)) throw Error("La sesión cambió.");
}
function reloadLocked() {
  window.nokCalendar?.disconnect();
  leaving=true; clearTimeout(timer); remote=null;
  document.body.classList.add("account-locked"); gate.hidden=false;
  showGate("busy","Comprobando tu sesión…"); location.reload();
}
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
  checkOwner(user);
  world = worldStorage(initial, changed); remote = store;
  window.nokGameStorage = world.storage;
  window.nokCalendar = user ? calendarFor(user.uid) : null;
  preloadSavedTerrain(world.storage);
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
  checkOwner(user);
  active=true; gate.hidden=true; document.body.classList.remove("account-locked");
  document.dispatchEvent(new Event("nok:world-entered"));
}
function readable(error) {
  if (error.code === "auth/popup-closed-by-user" || error.code === "auth/cancelled-popup-request") return "Se canceló el acceso. Podés intentarlo otra vez.";
  if (error.code === "auth/popup-blocked") return "Permití la ventana de Google y volvé a intentar.";
  if (error.code === "permission-denied") return "El guardado privado no está disponible. No se abrió ni se modificó tu partida.";
  return "No se pudo abrir tu partida. Revisá la conexión y volvé a intentar. No se reemplazaron tus datos.";
}
async function openPrivate(user) {
  if (opening || active || leaving) return;
  if (!user.emailVerified) { showGate("retry","Google todavía no verificó esta cuenta. No se abrió la partida."); return; }
  opening=true; showGate("busy","Abriendo tu partida privada…");
  try { await enter(user); }
  catch(error) {
    if (!leaving && auth.currentUser?.uid === user.uid) {
      remote=null; showGate("retry",readable(error));
    }
  } finally { opening=false; }
}

// Both a fresh sign-in and a remembered one enter here, never in the popup callback.
auth.onAuthStateChanged(user => {
  if (leaving || guestVisit) return;
  if (privateUid && privateUid !== user?.uid) { reloadLocked(); return; }
  privateUid = user?.uid ?? null;
  if (user) { void openPrivate(user); return; }
  showGate("signed-out","En este navegador recordaremos tu sesión. Si compartís la compu, cerrá sesión desde Ajustes antes de irte.");
});
q("#account-google").addEventListener("click", async () => {
  if (auth.currentUser) { await openPrivate(auth.currentUser); return; }
  showGate("busy","Esperando a Google…");
  try { await login(); }
  catch(error) { if (!auth.currentUser) showGate("signed-out",readable(error)); }
});
q("#account-forget").addEventListener("click", async () => {
  buttons(true);
  try { await logout(); }
  catch { showGate("retry","No se pudo cerrar la sesión. Volvé a intentarlo."); }
});
q("#account-guest").addEventListener("click", async () => {
  if (auth.currentUser) { await openPrivate(auth.currentUser); return; }
  guestVisit=true; showGate("busy","Abriendo la exploración…");
  try { await enter(null); }
  catch { guestVisit=false; showGate("signed-out","No se pudo abrir el juego. Recargá para reintentar."); }
});
each("[data-account-retry]", el => el.addEventListener("click", () => flush().catch(()=>{})));
each("[data-account-exit]", el => el.addEventListener("click", async () => {
  if (leaving) return;
  if (!remote && !confirm("¿Salir de la exploración? Esta partida de prueba no se guarda.")) return;
  try {
    if (conflict) { if (!confirm("¿Descartar los cambios de esta pestaña? La versión guardada en el otro dispositivo se conserva.")) return; }
    else await flush();
    leaving=true; if (!guestVisit) await logout(); reloadLocked();
  } catch { leaving=false; alertSave("No se pudo guardar y cerrar la sesión. Conservá la pestaña abierta y reintentá."); }
}));
window.addEventListener("online", () => flush().catch(()=>{}));
document.addEventListener("visibilitychange", () => { if (document.hidden) flush().catch(()=>{}); });
window.addEventListener("beforeunload", e => { if (!leaving && remote && saved!==dirty) { e.preventDefault(); e.returnValue=""; } });
window.addEventListener("pageshow", e => { if(e.persisted) location.reload(); });
