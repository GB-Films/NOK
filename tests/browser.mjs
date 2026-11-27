// Smoke test against an isolated browser profile. No real Google accounts or user data.
import {chromium} from "playwright-core";
import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import assert from "node:assert/strict";
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
    const context=await browser.newContext({viewport}); const page=await context.newPage(), errors=[];
    page.on("pageerror",e=>errors.push(e.message));
    page.on("response",r=>{if(r.status()>=400 && r.url().startsWith(target)) errors.push(r.status()+" "+r.url());});
    await page.goto(target);
    await page.locator("#account-guest").click();
    await page.locator("#start-adventure").click();
    await page.locator("#character-setup-name").fill("Visitante de prueba");
    await page.locator("#character-name-next").click();
    await page.locator("#character-setup-birth").fill("1999-08-20");
    await page.locator("#character-birth-next").click();
    await page.locator("#finish-character-setup").click();
    await page.locator("#character-setup").waitFor({state:"hidden"});
    assert.match(await page.locator("#player-name-label").innerText(),/visitante de prueba/i);
    assert.deepEqual(await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith("nok-"))),[]);
    await page.reload();
    await page.locator("#account-guest").click();await page.locator("#start-adventure").click();
    assert.equal(await page.locator("#character-setup-name").inputValue(),"");
    assert.deepEqual(errors,[]);
    console.log("Campamento, personaje y sesión aislada: "+viewport.width+" × "+viewport.height);
    await context.close();
  }
} finally { await browser.close(); server.close(); }
