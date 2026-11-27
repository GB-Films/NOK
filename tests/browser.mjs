// Smoke test against an isolated browser profile. No real Google accounts or user data.
import {chromium} from "playwright-core";
import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import assert from "node:assert/strict";
import {build} from "esbuild";
const root=resolve("dist");
const types={".js":"text/javascript",".css":"text/css",".html":"text/html",".webp":"image/webp",".svg":"image/svg+xml"};
const server=createServer(async(req,res)=>{
  const path=new URL(req.url,"http://localhost").pathname;
  const file=resolve(root,"."+path.slice(4)+(path.endsWith("/")?"index.html":""));
  if(!path.startsWith("/NOK/") || !file.startsWith(root+sep)){res.writeHead(404).end();return;}
  try { const bytes=await readFile(file);res.writeHead(200,{"Content-Type":types[extname(file)]||"application/octet-stream"}).end(bytes); }
  catch {res.writeHead(404).end();}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
const browser=await chromium.launch({channel:process.env.NOK_BROWSER || "chrome",headless:true});
const target=process.env.NOK_SMOKE_URL || "http://127.0.0.1:"+server.address().port+"/NOK/";
try {
  for (const viewport of [{width:1366,height:768},{width:390,height:844}]) {
    const mobile=viewport.width<760;
    const context=await browser.newContext({viewport,isMobile:mobile,hasTouch:mobile}); const page=await context.newPage(), errors=[];
    page.on("pageerror",e=>errors.push(e.message));
    page.on("response",r=>{if(r.status()>=400 && r.url().startsWith(target)) errors.push(r.status()+" "+r.url());});
    await page.goto(target);
    assert.equal(await page.locator("#account-gate .start-logo-image").isVisible(),true);
    assert.equal(await page.getByRole("button",{name:"Continuar con Google"}).isVisible(),true);
    assert.equal(await page.locator("#world").isVisible(),false);
    await page.locator("#account-guest").click();
    await page.locator("#character-setup-name").fill("Visitante de prueba");
    await page.locator("#character-name-next").click();
    await page.locator("#character-setup-birth").fill("1999-08-20");
    await page.locator("#character-birth-next").click();
    await page.locator("#finish-character-setup").click();
    await page.locator("#character-setup").waitFor({state:"hidden"});
    assert.match(await page.locator("#player-name-label").innerText(),/visitante de prueba/i);
    if (!process.env.NOK_SMOKE_URL) {
      // The removed prop must not leave either a hit target or an invisible construction cell.
      const house = page.locator("#world-house, [data-build-prop=house]");
      const cells = page.locator("#world-grid .world-build-plot");
      assert.equal(await house.count(),0);
      assert.equal(await page.locator("#world").getByText("HOGAR",{exact:true}).count(),0);
      assert.equal(await cells.count(),0);
      await page.locator("#world-build-toggle").click();
      assert.equal(await house.count(),0);
      assert.ok(await cells.count()>0);
      assert.equal(await page.locator("#world [data-build-prop]").count(),3);
      await page.keyboard.press("Escape");
      assert.equal(await cells.count(),0);
      assert.equal(await page.evaluate(()=>performance.getEntriesByType("resource").some(r=>r.name.includes("world-house"))),false);
      await page.locator('#quickbar [data-open="board"]').click();
      await page.locator("#board-week-mode").click();
      assert.equal(await page.locator("#board-week-view").isVisible(),true);
      await page.locator("#board-today-mode").click();
      if (viewport.width < 760) {
        await page.locator("[data-board-mobile-section=backlog]").click();
        assert.equal(await page.locator("#board-loose-list").isVisible(),true);
        assert.notEqual(await page.locator("#board-loose-list").innerText(),"");
      }
      await page.locator("#close-board").click();
      if (mobile) {
        await page.locator("#open-settings").tap();
        await page.locator(".settings-controls-card .settings-accordion-toggle").tap();
        await page.locator("label").filter({has:page.locator("#settings-touch-joystick")}).tap();
        await page.locator("#close-panel").tap();
        const stick=await page.locator("#mobile-joystick-base").boundingBox();
        assert.ok(stick);
        const playerX=()=>page.locator("#movable-player").evaluate(el=>el.getBoundingClientRect().left-document.querySelector("#world").getBoundingClientRect().left);
        const client=await context.newCDPSession(page),x=await playerX();
        await client.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x:stick.x+stick.width*.8,y:stick.y+stick.height*.5}]});
        await page.waitForFunction(x=>Math.abs(document.querySelector("#movable-player").getBoundingClientRect().left-document.querySelector("#world").getBoundingClientRect().left-x)>1,x);
        await client.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
        assert.equal(await page.locator("#mobile-joystick.is-active").count(),0);
      }
    }
    assert.deepEqual(await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith("nok-"))),[]);
    await page.reload();
    await page.locator("#account-guest").click();
    await page.locator("#character-setup-name").waitFor();
    assert.equal(await page.locator("#character-setup-name").inputValue(),"");
    assert.deepEqual(errors,[]);
    console.log("Campamento, personaje y sesión aislada: "+viewport.width+" × "+viewport.height);
    await context.close();
  }
  if (!process.env.NOK_SMOKE_URL) {
    // Only this isolated browser gets a fake account provider. Build and Pages use real Firebase.
    const testEntry=await build({entryPoints:["account/entry.js"],bundle:true,write:false,format:"esm",plugins:[{
      name:"fake-account", setup(esbuild) {
        esbuild.onResolve({filter:/^\.\/firebase\.js$/},()=>({path:"firebase",namespace:"test"}));
        esbuild.onLoad({filter:/.*/,namespace:"test"},()=>({contents:`
          export const auth={onAuthStateChanged(){}}, logout=async()=>{};
          export const login=async()=>({uid:"test",email:"test@example.invalid"});
          export const cloudWorld=()=>({
            load:async()=>{ if(!window.fixture) throw {code:"permission-denied"}; return window.fixture; },
            save:async()=>{}
          });
        `}));
      }
    }]});
    for (const kind of ["returning","new","partial","denied"]) {
      const page=await browser.newPage(); const errors=[];
      page.on("pageerror",e=>errors.push(e.message));
      await page.route(/\/account\.js(?:\?.*)?$/,r=>r.fulfill({contentType:"text/javascript",body:testEntry.outputFiles[0].text}));
      await page.goto(target);
      await page.evaluate(kind=>{
        if (kind==="returning") window.fixture={
          "nok-desktop-profile-v1":JSON.stringify({name:"Sol",birthDate:"1995-01-12",homeName:"Casa de prueba"}),
          "nok-settings-v1":JSON.stringify({characterSetupComplete:true,worldTheme:"earth",worldPropPositions:{house:{x:13.5,y:29}}}),
          "nok-progress-v1":JSON.stringify({unlockedRewards:["map-coast","season-cycle"]})
        };
        if(kind==="partial") window.fixture={"nok-desktop-profile-v1":JSON.stringify({name:"Sol"})};
        if(kind==="new") window.fixture={};
      },kind);
      await page.getByRole("button",{name:"Continuar con Google"}).click();
      if(kind==="denied"){
        await page.getByRole("status").filter({hasText:"El guardado privado no está disponible"}).waitFor();
        assert.equal(await page.locator("#world").isVisible(),false);
      }else{
        await page.locator("#account-gate").waitFor({state:"hidden"});
        assert.equal(await page.locator("#start-adventure").count(),0);
        if(kind==="returning"){
          assert.equal(await page.locator("#character-setup").isVisible(),false);
          assert.equal(await page.locator("#world").isVisible(),true);
          assert.match(await page.locator("#player-name-label").innerText(),/sol/i);
          assert.deepEqual(await page.evaluate(()=>JSON.parse(window.nokGameStorage.getItem("nok-settings-v1")).worldPropPositions.house),{x:13.5,y:29});
          const map=await page.locator(".world-art").evaluate(el=>getComputedStyle(el).backgroundImage.match(/url\("([^"]+)"\)/)[1]);
          assert.match(map,/world-earth-(day|night)\.webp$/);
          assert.ok(await page.locator("head link[rel=preload]").evaluateAll((els,url)=>els.some(el=>el.href===url),map));
          await page.locator("#open-profile").click();
          await page.locator("[data-passport-page=home]").click();
          assert.equal(await page.locator("#profile-home-name").inputValue(),"Casa de prueba");
          await page.locator("#close-panel").click();
          await page.locator("#open-settings").click();
          await page.locator("#edit-character").click();
          await page.locator("#close-character-setup").click();
          assert.equal(await page.locator("#character-setup").isVisible(),false);
        }else{
          await page.locator(kind==="new"?"#character-setup-name":"#character-setup-birth").waitFor();
        }
      }
      assert.deepEqual(errors,[]); await page.close();
    }
    console.log("Acceso con proveedor de prueba: cuenta nueva, incompleta, configurada y carga denegada.");
  }
} finally { await browser.close(); server.close(); }
