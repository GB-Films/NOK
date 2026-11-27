import assert from "node:assert/strict";
import {join} from "node:path";
import {moveDay,weekday} from "../planner/dates.js";

export async function verifyPlanner(page,mobile){
  const rail=page.locator("#day-rail"),sheet=page.locator("#day-sheet"),editor=page.locator("#day-editor"),launch=page.locator("#day-launch");
  const inside=(name)=>rail.getByRole("button",{name,exact:true});
  const date=rail.getByLabel("Fecha del planificador");
  assert.equal(await launch.isVisible(),mobile);
  if(mobile){assert.equal(await rail.isVisible(),false);await launch.click();}
  assert.equal(await rail.isVisible(),true);assert.ok(await inside("Vincular Google Calendar").isDisabled());
  const today=await date.inputValue(),tomorrow=moveDay(today,1);
  await inside("Semana y roles").click();await inside("+ Rol").click();
  await editor.getByLabel("Nombre del rol").fill("Producción QA");await editor.getByRole("button",{name:"Guardar"}).click();
  await inside("+ Responsabilidad").click();await editor.getByLabel("Qué te toca hacer").fill("Revisar entregas");
  await editor.getByLabel("Se repite cada").selectOption(String(weekday(today)));await editor.getByRole("button",{name:"Guardar"}).click();
  const check=rail.getByRole("checkbox",{name:/Revisar entregas/});
  await check.check();await inside("Fecha siguiente").click();assert.equal(await check.isChecked(),false);
  await inside("Fecha anterior").click();assert.ok(await check.isChecked());
  await inside("Día").click();assert.ok(await check.isChecked());
  await inside("+ Tarea").click();await editor.getByLabel("Nombre",{exact:true}).fill("Entrega QA");
  await editor.getByLabel("Hora (opcional)").fill("09:20");await editor.getByLabel("Rol (opcional)").selectOption({label:"Producción QA"});
  await editor.getByRole("button",{name:"Guardar"}).click();
  const chip=rail.getByRole("button",{name:/Entrega QA/});await chip.waitFor();
  assert.ok(await rail.locator('[data-hour="09:00"]').getByText("09:20").isVisible());
  if(!mobile){
    await page.locator('#quickbar [data-open="board"]').click();
    const stage=await page.locator(".app-shell").boundingBox(),r=await rail.boundingBox();
    assert.ok(stage.x>=r.x+r.width-1,JSON.stringify({stage,r}));
    assert.ok(await rail.evaluate(el=>el.contains(document.elementFromPoint(20,100))));
    const board=page.locator("#board-important-list .board-task-row").filter({hasText:"Alfa QA"});
    await board.dragTo(rail.locator('[data-hour="10:00"]'));
    await rail.locator('[data-hour="10:00"]').getByRole("button",{name:"Alfa QA"}).waitFor();
    await page.locator("#close-board").click();
  }else assert.equal(await rail.locator(".day-empty:visible").count(),0);
  if(!mobile)assert.equal(await page.locator(".app-shell").evaluate(el=>el.scrollLeft),0);
  if(process.env.NOK_GUIDE_SHOTS){
    await rail.locator(".day-content").evaluate(el=>el.scrollTop=0);
    await page.screenshot({path:join(process.env.NOK_GUIDE_SHOTS,"agenda-"+page.viewportSize().width+".png")});
  }
  await chip.click();await editor.getByLabel("Día",{exact:true}).fill(tomorrow);await editor.getByRole("button",{name:"Guardar"}).click();
  assert.equal(await date.inputValue(),tomorrow);
  assert.equal(await rail.locator(".day-events li").filter({hasText:"dentista"}).count(),1);
  await inside("Hoy").click();assert.equal(await chip.count(),0);
  const state=await page.evaluate(()=>JSON.parse(window.nokGameStorage.getItem("nok-desktop-tasks-v1")).filter(t=>t.title==="Entrega QA"));
  assert.equal(state.length,1);assert.equal(state[0].scheduledDate,tomorrow);assert.equal(state[0].scheduledTime,"09:20");assert.ok(state[0].workRoleId);
  if(mobile){await inside("Cerrar Mi día").click();assert.equal(await sheet.isVisible(),false);}
}
