import assert from "node:assert/strict";
import {join} from "node:path";

// All changes here are made inside the temporary, non-saving guest world.
export async function verifyPortals(page,mobile){
  const pick=s=>page.locator(s),close=pick("#close-creativity");
  const style=b=>b.evaluate(el=>[getComputedStyle(el).backgroundColor,getComputedStyle(el,"::before").maskImage.match(/[^/]+\.svg/)?.[0]]);
  const capture=async name=>{if(process.env.NOK_GUIDE_SHOTS){await pick("#toast").waitFor({state:"hidden",timeout:9000});await page.screenshot({path:join(process.env.NOK_GUIDE_SHOTS,name+"-"+page.viewportSize().width+".png")});}};
  const fit=async()=>{
    const portal=await pick("#side-panel").boundingBox(),stage=await pick(".app-shell").boundingBox();
    assert.ok(Math.abs(portal.x-stage.x)<2 && Math.abs(portal.width-stage.width)<2 && Math.abs(portal.height-stage.height)<2,JSON.stringify({portal,stage}));
  };
  const gear=await style(pick("#open-settings"));assert.equal(gear[1],"gear.svg");
  await pick('#quickbar [data-open="creativity"]').click();await fit();
  assert.equal(await pick("#creativity-view .book-right-page").isVisible(),false);
  assert.equal((await style(close))[1],"cross.svg");
  for(const name of ["Cuaderno de prueba","Escenas de un día largo en el campamento"]){
    await pick("#new-writing-title").fill(name);await pick("#new-writing-form button").click();
    assert.equal(await pick(".book-left-page").isVisible(),false);await pick("#writing-content").fill("Un borrador intacto.");
    if(name==="Cuaderno de prueba")await capture("editor");
    assert.equal((await style(pick("#copy-writing-document")))[1],"duplicate.svg");
    await pick("#writing-back-library").click();
  }
  const rows=pick("#writing-project-list>article"),first=rows.first();
  const del=first.locator("[data-writing-delete]"),dupe=first.locator("[data-writing-duplicate]");
  const red=await style(del);assert.equal(red[1],"cross.svg");assert.notEqual(red[0],(await style(close))[0]);assert.equal((await style(dupe))[1],"duplicate.svg");
  for(const row of await rows.all()){
    const [box,open,copy,remove]=await Promise.all([row,...["[data-writing-id]","[data-writing-duplicate]","[data-writing-delete]"].map(s=>row.locator(s))].map(el=>el.boundingBox()));
    assert.ok(open.x+open.width<=copy.x+1 && copy.x+copy.width<=remove.x+1 && remove.x+remove.width<=box.x+box.width+1 && remove.y+remove.height<=box.y+box.height+1);
    assert.ok(copy.width>=(mobile?44:34));
  }
  await capture("creatividad");
  await dupe.click();assert.equal(await rows.count(),3);if(await pick("#writing-back-library").isVisible())await pick("#writing-back-library").click();
  await del.click();await pick("#cancel-writing-delete").click();assert.equal(await rows.count(),3);
  await del.click();await pick("#confirm-writing-delete").click();assert.equal(await rows.count(),2);
  await first.locator("[data-writing-id]").click();assert.equal(await pick("#writing-content").inputValue(),"Un borrador intacto.");
  await close.click();
  await pick('#quickbar [data-open="board"]').click();
  const boardDel=pick("#board-important-list [data-task-action=delete]").first();
  assert.deepEqual(await style(boardDel),red);
  assert.equal((await style(pick("#board-important-list [data-task-action=done]").first()))[1],"tick.svg");await pick("#close-board").click();

  // Use the mapped portal's regular keyboard activation even when it lies outside the mobile camera.
  const bank=pick('#world [data-open="finance"]');await bank.focus();await bank.press("Enter");await fit();
  assert.equal(await pick(".coffer-content").isVisible(),false);
  await pick("#vault-master-password").fill("solo-prueba-qa");await pick("#vault-master-confirm").fill("solo-prueba-qa");await pick("#vault-master-submit").click();
  await pick("#coffer-inventory-home").waitFor();await capture("cofre");
  await pick('[data-coffer-open="finance"]').click();await pick("#finance-name").fill("Prueba");await pick("#finance-amount").fill("100");
  await pick("#finance-form button").click();assert.deepEqual(await style(pick("[data-finance-delete]").first()),red);
  await pick("#close-panel").click();await bank.focus();await bank.press("Enter");
  assert.equal(await pick(".coffer-content").isVisible(),false);assert.equal(await pick("#password-vault-gate").isVisible(),true);
  await pick("#close-panel").click();
  for(const type of ["hub","agenda","projects","lists","puzzle","settings","profile"]){
    const open=type==="profile"?pick("#open-profile"):type==="settings"?pick("#open-settings"):pick('#world [data-open="'+type+'"]');
    await open.focus();await open.press("Enter");
    const dismiss=pick("#close-panel");await dismiss.waitFor();
    await pick("#side-panel").evaluate(async el=>Promise.allSettled([...el.getAnimations(),...el.parentElement.getAnimations()].filter(a=>Number.isFinite(a.effect.getTiming().iterations)).map(a=>a.finished)));
    assert.deepEqual(await style(dismiss),await style(pick("#close-creativity")));
    const b=await dismiss.boundingBox(),v=page.viewportSize();
    assert.ok(b.x>=0 && b.y>=0 && b.x+b.width<=v.width+1 && b.y+b.height<=v.height+1,"Cerrar dentro de "+type+" "+JSON.stringify(b));
    await dismiss.click();
  }
}
