import test from "node:test";
import assert from "node:assert/strict";
import {localRequest,eventDraft,interpret} from "../assistant/requests.js";
import {orderedSlots,boardGroups,suggestedOrder,pendingByPriority} from "../assistant/board.js";
const ref=new Date(2026,11,31,12);
test("Pedidos en español y cambios de mes/año; no inventar datos faltantes",()=>{
  assert.deepEqual(localRequest("¿Me agendás dentista mañana a las tres de la tarde?",ref),{kind:"event",title:"dentista",date:"2027-01-01",time:"15:00"});
  assert.equal(eventDraft("Agendá dentista pasado mañana a las 9",ref).date,"2027-01-02");
  assert.equal(eventDraft("Agendá dentista mañana",ref).time,"");
  assert.equal(eventDraft("Agendá dentista a las 17",ref).date,"");
  assert.equal(eventDraft("Agendá para mañana a las 15",ref).title,"");
  assert.equal(eventDraft("Agendá dentista el 31/02/2027",ref).date,"");
  assert.equal(localRequest("Pasá comprar pan a hoy",ref).kind,"today");
  assert.equal(localRequest("Poné comprar pan como prioridad alta",ref).kind,"priority");
  assert.equal(localRequest("Borrá mis reuniones",ref).kind,"unsupported");
  assert.deepEqual(localRequest("Creá una tarea para hoy: llamar al taller",ref),{kind:"task",title:"llamar al taller",isToday:true});
  assert.equal(localRequest("Sacale la prioridad a llamar al taller",ref).level,"low");
});
test("Ordenar unas tareas no mueve las demás ni mezcla prioridad, secciones o tareas hechas",()=>{
  const tasks=["Zeta","Beta","Alfa","Urgente","Mochila","Lista"].map((title,i)=>({
    id:i+1,title,priority:i===3?"high":"low",isToday:i<4,status:i===5?"done":"todo",createdAt:new Date(2026,1,i+1).toISOString()
  }));
  const before=structuredClone(tasks),base=pendingByPriority(tasks);
  const groups=boardGroups(base,"2026-11-27",()=>"");
  assert.deepEqual(groups.today.map(t=>t.id),[4,1,2,3]);
  const chosen=suggestedOrder(groups.today.filter(t=>[1,3].includes(t.id)),"name").map(t=>t.id);
  const saved={today:orderedSlots(groups.today,chosen).map(t=>t.id)};
  const reload=boardGroups(base,"2026-11-27",()=>"",saved);
  assert.deepEqual(reload.today.map(t=>t.id),[4,3,2,1]);
  assert.deepEqual(reload.backlog.map(t=>t.id),[5]);
  assert.deepEqual(tasks,before);
});
test("IA opcional: sin descargas, sin ejecución de acciones ni herramientas arbitrarias",async()=>{
  const signal=new AbortController().signal;
  const text="Tengo un compromiso con Ana mañana a las 15";
  let creates=0,destroyed=0,output='{"kind":"event","title":"Compromiso con Ana"}';
  const model={availability:async()=>"downloadable",create:async()=>{creates++;return{prompt:async()=>output,destroy:()=>destroyed++};}};
  assert.equal((await interpret(text,signal,model)).kind,"unknown");assert.equal(creates,0);
  model.availability=async()=>"available";
  assert.equal((await interpret(text,signal,model)).kind,"event");
  output='{"kind":"delete","title":"todo"}';assert.equal((await interpret(text,signal,model)).kind,"unknown");
  assert.equal(destroyed,2);
});
