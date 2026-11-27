import assert from "node:assert/strict";
import {join} from "node:path";

export async function verifyGuide(page){
  const launch=page.locator("#open-assistant"), dialog=page.locator("#camp-assistant"), input=dialog.getByLabel("Tu pedido");
  const ask=async text=>{await input.fill(text);await dialog.getByRole("button",{name:"Preparar",exact:true}).click();};
  const saved=key=>page.evaluate(k=>JSON.parse(window.nokGameStorage.getItem(k)||"[]"),key);
  const events="nok-desktop-events-v1";
  assert.equal(await page.evaluate(()=>performance.getEntriesByType("resource").some(r=>r.name.includes("/assistant.js"))),false);
  // Deterministic voice lifecycle without microphone access or sending any audio.
  await page.evaluate(()=>{window.SpeechRecognition=class{
    start(){window.qaMic=this;} stop(){this.onend?.();} abort(){window.qaMic=null; this.onend?.();}
  };});
  const hit=await launch.boundingBox(), gear=await page.locator("#open-settings").boundingBox();
  assert.ok(hit && gear && (hit.x+hit.width<=gear.x || gear.x+gear.width<=hit.x || hit.y+hit.height<=gear.y || gear.y+gear.height<=hit.y));
  await launch.click();await dialog.getByRole("button",{name:"Dictar",exact:true}).click();
  await page.evaluate(()=>{window.qaMic.onresult({results:[[{transcript:"Agendá dentista mañana"}]]});});
  assert.equal(await input.inputValue(),"Agendá dentista mañana");
  assert.equal(await dialog.locator("[data-review]").isVisible(),false);
  await dialog.getByRole("button",{name:"Cerrar asistente"}).click();
  assert.equal(await page.evaluate(()=>window.qaMic),null);
  await launch.click();await ask("Agendá dentista mañana");
  assert.equal(await dialog.getByLabel("Hora local").inputValue(),"");
  assert.equal((await saved(events)).length,0);
  await dialog.getByRole("button",{name:"Descartar"}).click();
  await ask("Agendá dentista mañana");await ask("a las cinco de la tarde");
  assert.equal(await dialog.getByLabel("Nombre del evento").inputValue(),"dentista");
  assert.equal(await dialog.getByLabel("Hora local").inputValue(),"17:00");
  if(process.env.NOK_GUIDE_SHOTS)await page.screenshot({path:join(process.env.NOK_GUIDE_SHOTS,"guia-"+page.viewportSize().width+".png")});
  const date=await dialog.getByLabel("Fecha",{exact:true}).inputValue();
  await dialog.getByRole("button",{name:"Confirmar"}).click();
  const list=await saved(events);assert.equal(list.length,1);assert.equal(list[0].date,date+"T17:00");
  await dialog.getByRole("button",{name:"Ver en la Agenda"}).click();
  assert.equal(await page.locator("#agenda-view").getByText("dentista",{exact:true}).first().isVisible(),true);
  await page.locator("#close-panel").click();

  await page.locator('#quickbar [data-open="board"]').click();
  for(const name of ["Zeta QA","Alfa QA"]){
    await page.locator("#board-quick-title").fill(name);await page.locator("#board-quick-title").press("Enter");
  }
  await page.locator("#close-board").click();await launch.click();await ask("Ordená algunas tareas de hoy por nombre");
  assert.equal(await dialog.getByRole("checkbox",{name:/Alfa QA/}).isChecked(),false);
  await ask("Ordená mis tareas de hoy por nombre");
  assert.ok(await dialog.getByRole("checkbox",{name:/Alfa QA/}).isChecked());
  await dialog.getByRole("button",{name:"Confirmar"}).click();await dialog.getByRole("button",{name:"Ver en el Tablón"}).click();
  const ordered=await page.locator("#board-important-list .board-task-row strong").allTextContents();
  assert.ok(ordered.indexOf("Alfa QA")>=0 && ordered.indexOf("Alfa QA")<ordered.indexOf("Zeta QA"));
  await page.locator("#close-board").click();await launch.click();await ask("Dale prioridad alta a Zeta QA");
  assert.ok(await dialog.getByRole("checkbox",{name:/Zeta QA/}).isChecked());
  assert.equal(await dialog.getByRole("checkbox",{name:/Alfa QA/}).isChecked(),false);
  await dialog.getByRole("button",{name:"Confirmar"}).click();
  const tasks=await saved("nok-desktop-tasks-v1");assert.equal(tasks.find(t=>t.title==="Zeta QA").priority,"high");
  await ask("Creá una tarea: comprar materiales");
  await dialog.getByRole("button",{name:"Confirmar"}).click();
  assert.equal((await saved("nok-desktop-tasks-v1")).find(t=>t.title==="comprar materiales").isToday,false);
  await ask("Pasá comprar materiales a hoy");await dialog.getByRole("button",{name:"Confirmar"}).click();
  assert.equal((await saved("nok-desktop-tasks-v1")).find(t=>t.title==="comprar materiales").isToday,true);
  await page.keyboard.press("Escape");assert.equal(await dialog.isVisible(),false);
}
