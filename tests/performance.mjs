// node tests/performance.mjs <dist directory or Pages URL> [desktop|mobile] [runs]
// Synthetic returning player through the real entry /NOK/. No login tokens or cloud writes.
import {chromium} from "playwright-core";
import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {gzipSync} from "node:zlib";
import assert from "node:assert/strict";
const source=process.argv[2]||"dist", profiles=process.argv[3]?[process.argv[3]]:["desktop","mobile"];
const repeats=Number(process.argv[4]||1), humanURL=/^https?:/.test(source);
assert.ok(profiles.every(p=>["desktop","mobile"].includes(p)) && Number.isSafeInteger(repeats) && repeats>0,
  "Usage: node tests/performance.mjs <dist or URL> [desktop|mobile] [positive runs]");
const root=resolve(source), types={".html":"text/html",".js":"text/javascript",".css":"text/css",".webp":"image/webp",".svg":"image/svg+xml"};
const server=createServer(async(req,res)=>{
  const url=new URL(req.url,"http://localhost"), path=url.pathname;
  const f=resolve(root,"."+path.slice(4)+(path.endsWith("/")?"index.html":""));
  if(!path.startsWith("/NOK/")||!f.startsWith(root+sep))return res.writeHead(404).end();
  try{let data=await readFile(f);const type=types[extname(f)]||"application/octet-stream";
    const headers={"Content-Type":type};
    if(type.startsWith("text/")){data=gzipSync(data);headers["Content-Encoding"]="gzip";}
    res.writeHead(200,{...headers,"Content-Length":data.length}).end(data);
  }catch{res.writeHead(404).end();}
});
if(!humanURL)await new Promise(r=>server.listen(0,"127.0.0.1",r));
const url=humanURL?source:"http://127.0.0.1:"+server.address().port+"/NOK/";
const browser=await chromium.launch({channel:"chrome"}), med=a=>[...a].sort((x,y)=>x-y)[Math.floor(a.length/2)];
const round=x=>Math.round(x*10)/10;
try{for(let run=1;run<=repeats;run++)for(const profile of profiles){
  const mobile=profile==="mobile",context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1366,height:768},
    isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1,timezoneId:"America/Buenos_Aires",locale:"es-AR"});
  const page=await context.newPage(),errors=[];page.on("pageerror",e=>errors.push(e.message));page.setDefaultTimeout(22000);
  const c=await context.newCDPSession(page);
  await c.send("Network.enable");await c.send("Network.setCacheDisabled",{cacheDisabled:true});
  await c.send("Network.emulateNetworkConditions",{offline:false,latency:mobile?100:30,downloadThroughput:(mobile?5:20)*1e6/8,uploadThroughput:2e6/8});
  await c.send("Emulation.setCPUThrottlingRate",{rate:mobile?4:1});await c.send("Performance.enable");
  await page.addInitScript(()=>{
    let storage,rand=437; Object.defineProperty(window,"nokGameStorage",{get:()=>storage,set(s){
      storage=s; Math.random=()=>((rand=(1664525*rand+1013904223)>>>0)/4294967296);
      s.setItem("nok-desktop-profile-v1",JSON.stringify({name:"QA",birthDate:"1995-01-17",pets:["Gato","Perro","Conejo","Gato"].map((species,i)=>({name:"Prueba "+i,species,id:"pet"+i}))}));
      s.setItem("nok-settings-v1",JSON.stringify({characterSetupComplete:true,keyboardMovement:true,touchJoystickEnabled:true}));
      s.setItem("nok-desktop-tasks-v1",JSON.stringify(Array.from({length:231},(_,i)=>({id:i+1,title:"Misión de prueba "+i,status:i%5===0?"done":"todo",
        isToday:i%6===0,project:"Proyecto "+i%3,area:"personal",priority:"normal",createdAt:"2026-01-01T12:00:00Z"}))));
    }});
    window.lcp=0;new PerformanceObserver(list=>{for(const e of list.getEntries())window.lcp=e.startTime;}).observe({type:"largest-contentful-paint",buffered:true});
    window.uiTimings={};document.addEventListener("click",e=>{
      const btn=e.target.closest("button");
      const id=btn?.id || btn?.dataset.quickAccess || (btn?.closest(".settings-sound-card") && btn.matches(".settings-accordion-toggle") ? "audio" : "");
      if(id){const t=e.timeStamp;requestAnimationFrame(()=>requestAnimationFrame(()=>{window.uiTimings[id]=performance.now()-t;}));}
    },true);
    document.addEventListener("nok:world-entered",()=>requestAnimationFrame(()=>requestAnimationFrame(()=>performance.mark("world-painted"))));
    document.addEventListener("click",e=>{if(e.target.closest("#account-guest"))performance.mark("enter");},true);
  });
  const trace=[];c.on("Tracing.dataCollected",({value})=>trace.push(...value));
  await c.send("Tracing.start",{categories:"devtools.timeline,blink.user_timing,disabled-by-default-devtools.timeline"+(process.env.NOK_PERF_DIAGNOSTICS?",blink,fonts":""),
    transferMode:"ReportEvents"});
  const metrics=async()=>Object.fromEntries((await c.send("Performance.getMetrics")).metrics.map(m=>[m.name,m.value]));
  const diff=(a,b)=>Object.fromEntries(["ScriptDuration","LayoutDuration","RecalcStyleDuration","TaskDuration"].map(k=>[k,round((b[k]-a[k])*1000)]));
  await page.goto(url,{waitUntil:"load"});await page.locator(".start-logo-image").evaluate(i=>i.decode());
  await page.waitForTimeout(220);
  const boot=await page.evaluate(()=>{
    const entries=performance.getEntriesByType("resource"),sum=a=>a.reduce((n,e)=>n+e.encodedBodySize,0);
    return {dcl:performance.getEntriesByType("navigation")[0].domContentLoadedEventEnd,load:Math.round(performance.getEntriesByType("navigation")[0].loadEventEnd),lcp:window.lcp,requests:entries.length,
      kB:Math.round((sum(entries)+performance.getEntriesByType("navigation")[0].encodedBodySize)/1000),
      artKB:Math.round(sum(entries.filter(e=>e.name.includes("/art/")&&!e.name.includes(".css")))/1000),
      jsKB:Math.round(sum(entries.filter(e=>/\.js(?:\?|$)/.test(e.name)))/1000),
      largest:entries.filter(e=>e.name.includes("/art/")).sort((a,b)=>b.encodedBodySize-a.encodedBodySize).slice(0,4).map(e=>[e.name.split("/").pop(),Math.round(e.encodedBodySize/1000)])};
  });
  await page.locator("#account-guest").click();await page.waitForFunction(()=>performance.getEntriesByName("world-painted").length);
  const entry=await page.evaluate(()=>performance.getEntriesByName("world-painted")[0].startTime-performance.getEntriesByName("enter")[0].startTime);
  // A previous networkidle signal can still be set when a hidden shell is revealed.
  // Wait for the map AND the eight visible portals, then for a quiet period before testing motion.
  await page.waitForFunction(()=>{
    const urls=performance.getEntriesByType("resource").map(e=>new URL(e.name).pathname);
    return urls.some(u=>/world-builder-(day|night)\.webp$/.test(u)) &&
      ["hub","focus","creativity","archive","projects","finance","learning","lists"].every(id=>urls.some(u=>new RegExp("/portal-"+id+"(-night)?\\.webp$").test(u)));
  });
  await page.waitForLoadState("networkidle");assert.equal(await page.locator("[data-pet-npc-key]").count(),4);
  // When the app accepts input is not necessarily when the full map has arrived.
  const world=await page.evaluate(()=>{
    const bg=getComputedStyle(document.querySelector(".world-art")).backgroundImage.match(/url\("([^"]+)"\)/)[1];
    const map=performance.getEntriesByName(bg).at(-1), start=performance.getEntriesByName("enter")[0].startTime;
    const end=Math.max(map.responseEnd,performance.getEntriesByName("world-painted")[0].startTime);
    const kB=performance.getEntriesByType("resource").filter(r=>r.startTime>=start).reduce((s,r)=>s+r.encodedBodySize,0)/1000;
    return {map:map.name.split("/").pop(),clickToMap:Math.round(end-start),entryKB:Math.round(kB)};
  });
  const pos=()=>page.locator("#movable-player").evaluate(el=>Math.round(el.getBoundingClientRect().x-document.querySelector("#world").getBoundingClientRect().x));
  const start=await pos(),a=await metrics();
  await page.evaluate(debug=>{performance.mark("walking");window.framesSeen=[];let prev;function frame(t){
    if(prev){framesSeen.push(t-prev);if(debug && t-prev>40){performance.mark("frame-gap-start",{startTime:prev});performance.mark("frame-gap-end",{startTime:t});}}
    prev=t;window.walkRaf=requestAnimationFrame(frame)}window.walkRaf=requestAnimationFrame(frame);},!!process.env.NOK_WALK_TRACE);
  // Same controlled keyboard input on both profiles to compare the same scene.
  await page.keyboard.down("ArrowRight");await page.waitForTimeout(820);await page.keyboard.up("ArrowRight");
  assert.notEqual(await pos(),start,"player must actually move");
  await page.keyboard.down("ArrowLeft");await page.waitForTimeout(820);await page.keyboard.up("ArrowLeft");
  const movement=await page.evaluate(()=>{cancelAnimationFrame(window.walkRaf);performance.mark("walk-end");
    const ds=window.framesSeen.sort((a,b)=>a-b);return {frames:ds.length,p95:ds[Math.floor(ds.length*.95)],maxGap:Math.round(ds.at(-1)),slowPct:100*ds.filter(v=>v>25).length/ds.length};});
  const b=await metrics(), clicks={};
  for(const [selector,key,close] of [["#open-settings","open-settings","#close-panel"],['#quickbar [data-open="board"]',"board","#close-board"]]){
    const samples=[];
    for(let i=0;i<3;i++){
      await page.evaluate(k=>delete window.uiTimings[k],key);
      if(!i)await page.evaluate(k=>performance.mark(k+"-pre"),key);
      await page.locator(selector).click();await page.waitForFunction(k=>window.uiTimings[k]!=null,key);
      if(!i)await page.evaluate(k=>performance.mark(k+"-post"),key);
      if (!i && process.env.NOK_PERF_DIAGNOSTICS) console.error(key, await page.evaluate(()=>({
        visibleViews:[...document.querySelectorAll(".panel-view")].filter(el=>el.getClientRects().length).map(el=>el.id),
        mountedCells:document.querySelectorAll(".world-build-plot").length, mountedRows:document.querySelectorAll(".board-task-row,.week-task-card").length,
        resources:performance.getEntriesByType("resource").filter(r=>r.startTime>performance.getEntriesByName("walk-end")[0].startTime).map(r=>r.name.split("/").pop()).slice(-15)
      })));
      samples.push(await page.evaluate(k=>window.uiTimings[k],key));
      if(key==="open-settings" && i===2){
        const audio=page.locator(".settings-sound-card .settings-accordion-toggle");
        await audio.click();await page.waitForFunction(()=>window.uiTimings.audio!=null);
        assert.equal(await audio.getAttribute("aria-expanded"),"true");
        clicks.audio=[round(await page.evaluate(()=>window.uiTimings.audio))];
      }
      await page.locator(close).click();await page.waitForTimeout(120);
    }
    clicks[key]=samples.map(round);
  }
  const endTrace=new Promise(r=>c.once("Tracing.tracingComplete",r));await c.send("Tracing.end");await endTrace;
  if(process.env.NOK_WALK_TRACE){
    const gap=trace.find(e=>e.name==="frame-gap-start"),end=trace.find(e=>e.name==="frame-gap-end");
    if(gap&&end) console.error("Walking gap (ms), overlapping main-thread events:",round((end.ts-gap.ts)/1000),
      trace.filter(e=>e.tid===gap.tid&&e.dur>500&&e.ts+e.dur>gap.ts&&e.ts<end.ts).map(e=>[e.name,round(e.dur/1000)]).sort((a,b)=>b[1]-a[1]).slice(0,14));
  }
  const phase=(lo,hi)=>{
    const begin=lo?trace.find(e=>e.name===lo)?.ts:-Infinity,end=trace.find(e=>e.name===hi)?.ts;
    const ev=trace.filter(e=>e.dur&&e.ts>=begin&&e.ts<end);
    if(process.env.NOK_PERF_DIAGNOSTICS && lo==="open-settings-pre"){
      const slow=ev.filter(e=>e.name==="Layout").sort((x,y)=>y.dur-x.dur).slice(0,3);
      console.error("Cold settings layouts",JSON.stringify(slow.map(e=>({ms:round(e.dur/1000),data:e.args}))).slice(0,2000));
      const l=slow[0]; if(l){const breakdown={};for(const e of ev.filter(e=>e.tid===l.tid&&e.ts>=l.ts&&e.ts<l.ts+l.dur))breakdown[e.name]=(breakdown[e.name]||0)+e.dur/1000;
      console.error("Inside layout",Object.entries(breakdown).sort((a,b)=>b[1]-a[1]).slice(0,16));}
    }
    const time=names=>round(ev.filter(e=>names.includes(e.name)).reduce((n,e)=>n+e.dur/1000,0));
    return {decode:time(["Decode Image"]),raster:time(["RasterTask"]),paint:time(["Paint"]),script:time(["EvaluateScript"]),layout:time(["Layout"]),recalc:time(["UpdateLayoutTree"])};
  };
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({profile,run,chrome:browser.version(),boot:{...boot,lcp:round(boot.lcp),dcl:round(boot.dcl)},entry:round(entry),world,
    walk:{...movement,p95:round(movement.p95),slowPct:round(movement.slowPct),...diff(a,b)},clicks,clickMedian:Object.fromEntries(Object.entries(clicks).map(([k,v])=>[k,med(v)])),
    coverCpu:phase(null,"enter"),entryCpu:phase("enter","world-painted"),walkCpu:phase("walking","walk-end"),
    coldSettingsCpu:phase("open-settings-pre","open-settings-post"),coldBoardCpu:phase("board-pre","board-post")}));
  await context.close();
}}finally{await browser.close();server.close();}
