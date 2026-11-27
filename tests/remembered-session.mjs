// Real Firebase persistence and two real Chrome launches with one throwaway profile.
// Only the local Auth emulator, a simulated identity and an in-memory world are used.
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { chromium } from "playwright-core";
import { build } from "esbuild";

export async function verifyRememberedSession(target) {
  const emulator="http://"+process.env.FIREBASE_AUTH_EMULATOR_HOST;
  assert.equal(new URL(emulator).hostname,"127.0.0.1");
  assert.equal(new URL(target).hostname,"127.0.0.1");
  const appOrigin=new URL(target).origin;
  const bundle=await build({
    entryPoints:["account/entry.js"], bundle:true, write:false, format:"esm",
    plugins:[{name:"emulated-login",setup(builder) {
      builder.onResolve({filter:/^\.\/firebase\.js$/},()=>({path:"local-auth",namespace:"qa"}));
      builder.onLoad({filter:/.*/,namespace:"qa"},()=>({resolveDir:resolve("account"),contents:`
        import { initializeApp } from "firebase/app";
        import { connectAuthEmulator, GoogleAuthProvider, signInWithCredential, signOut } from "firebase/auth";
        import { createNokAuth } from "./auth.js";
        export const auth=createNokAuth(initializeApp({projectId:"demo-nok",apiKey:"demo-key"},"session-test"));
        connectAuthEmulator(auth,${JSON.stringify(appOrigin)},{disableWarnings:true});
        export const logout=()=>signOut(auth);
        export const calendarFor=()=>({connected:false,disconnect(){}});
        export async function login(){
          window.interactiveLogins++;
          try {
            await signInWithCredential(auth,GoogleAuthProvider.credential(JSON.stringify({
              sub:"nok-emulator-test",email:"sol@example.invalid",email_verified:true
            })));
          } catch(e) { window.loginError=e.code; throw e; }
        }
        export const cloudWorld=uid=>({
          async load(){
            window.worldReads++;
            if(uid!==auth.currentUser?.uid) throw Error("Cuenta inesperada");
            if(window.failNextRead){window.failNextRead=false;throw Error("Red no disponible");}
            return {"nok-desktop-profile-v1":JSON.stringify({name:"Sol",birthDate:"1995-01-12"}),
              "nok-settings-v1":JSON.stringify({characterSetupComplete:true})};
          },async save(){}
        });
      `}));
    }}]
  });
  const prefix=join(resolve(tmpdir()),"nok-session-test-"), profile=await mkdtemp(prefix);
  let context;
  async function launch(){
    context=await chromium.launchPersistentContext(profile,{channel:process.env.NOK_BROWSER||"chrome",headless:true});
    await context.addInitScript(()=>{window.interactiveLogins=0;window.worldReads=0;});
    await context.route("**/*",async route=>{
      const url=new URL(route.request().url());
      if (url.origin===appOrigin && url.pathname.endsWith("/account.js")) {
        return route.fulfill({contentType:"text/javascript",body:bundle.outputFiles[0].text});
      }
      // Relay only the emulator endpoints on the test origin; keep the site's CSP intact.
      if(url.origin===appOrigin && /^\/(identitytoolkit|securetoken)\.googleapis\.com\//.test(url.pathname)){
        const response=await route.fetch({url:emulator+url.pathname+url.search,maxRedirects:0});
        return route.fulfill({response});
      }
      if(url.origin===appOrigin) return route.continue();
      return route.abort();
    });
    return context.pages()[0];
  }
  async function checkWorld(page,logins,reads){
    try { await page.locator("#account-gate").waitFor({state:"hidden",timeout:10000}); }
    catch { throw Error("No se abrió la partida de prueba: "+await page.evaluate(()=>[document.querySelector("#account-message").textContent,window.loginError,window.worldReads].join(" / "))); }
    assert.match(await page.locator("#player-name-label").innerText(),/sol/i);
    assert.deepEqual(await page.evaluate(()=>[window.interactiveLogins,window.worldReads]),[logins,reads]);
  }
  try {
    let page=await launch(); await page.goto(target);
    await page.getByRole("button",{name:"Continuar con Google"}).click(); await checkWorld(page,1,1);
    await page.reload(); await checkWorld(page,0,1);
    await context.close();

    page=await launch(); await page.goto(target); await checkWorld(page,0,1);
    const other=await context.newPage();
    await other.addInitScript(()=>{window.failNextRead=true;});
    await other.goto(target);
    const retry=other.getByRole("button",{name:"Reintentar abrir mi mundo"});
    await retry.waitFor();
    assert.equal(await other.locator("#world").isVisible(),false);
    await retry.click(); await checkWorld(other,0,2);

    await page.locator("#open-settings").click();
    await page.locator(".nok-account-settings .settings-accordion-toggle").click();
    await page.getByRole("button",{name:"Guardar y cerrar sesión"}).click();
    for(const tab of [page,other]){
      await tab.getByRole("button",{name:"Continuar con Google"}).waitFor();
      assert.equal(await tab.locator("#world").isVisible(),false);
    }
    await context.close();
    page=await launch(); await page.goto(target);
    await page.getByRole("button",{name:"Continuar con Google"}).waitFor();
    assert.equal(await page.evaluate(()=>window.worldReads),0);
    console.log("Sesión recordada después de recargar y reiniciar Chrome; reintento sin Google; cierre en las dos pestañas y tras reiniciar.");
  } finally {
    await context?.close();
    if(resolve(profile).startsWith(prefix) && profile.length>prefix.length) await rm(profile,{recursive:true,force:true,maxRetries:3});
  }
}
