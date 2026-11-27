import test from "node:test";
import assert from "node:assert/strict";
import {validDay,validTime,moveDay,weekKey,dueOn,localEvents} from "../planner/dates.js";
import {fetchGoogleDay} from "../planner/google.js";
import {changeRoles} from "../planner/roles.js";
test("Fecha local y semana cruzan meses/años; no se arrastran tareas de ayer a hoy",()=>{
  assert.equal(weekKey("2027-01-01"),"2026-12-28");assert.equal(moveDay("2027-01-01",-1),"2026-12-31");
  assert.equal(validDay("2027-02-29"),false);assert.equal(validTime("24:00"),false);
  assert.equal(dueOn({scheduledDate:"2026-12-31",isToday:true},"2027-01-01","2027-01-01"),false);
  assert.equal(dueOn({isToday:true},"2027-01-01","2027-01-01"),true);
  assert.equal(dueOn({scheduledDate:"2027-01-01",status:"done"},"2027-01-01","2027-01-01"),false);
  assert.deepEqual(localEvents("2027-02-01",[{title:"NOK",date:"2027-02-01T11:30"}],[{name:"Sol",date:"1996-02-01"}]).map(r=>r.time),["11:30",""]);
});
test("Responsabilidades por rol y por semana: completar, editar y volver atrás no duplica misiones",()=>{
  let roles=changeRoles([],{kind:"role",title:"Dirección"},()=>"R");
  const change=a=>{roles=changeRoles(roles,{roleId:"R",...a},()=>"D");};
  change({kind:"duty",title:"Ver cierres",weekday:0});const previous=structuredClone(roles);
  change({kind:"check",dutyId:"D",day:"2027-01-01",checked:true});
  assert.deepEqual(previous[0].duties[0].completed,[]);
  assert.deepEqual(roles[0].duties[0].completed,["2026-12-28"]);
  change({kind:"duty",dutyId:"D",title:"Revisar cierres",weekday:1});
  change({kind:"check",dutyId:"D",day:"2027-01-04",checked:true});
  change({kind:"check",dutyId:"D",day:"2027-01-05",checked:false});
  assert.deepEqual(roles[0].duties[0].completed,["2026-12-28"]);assert.equal(roles[0].duties.length,1);
  assert.throws(()=>changeRoles(roles,{kind:"role",title:"dirección"}));
});
test("Calendar pagina en modo de lectura y recorta eventos al día local, sin filtrar títulos al guardado",async()=>{
  const day="2026-11-27",before=new Date("2026-11-26T23:55:00").toISOString(),after=new Date("2026-11-27T01:15:00").toISOString();
  let pages=0;
  const rows=await fetchGoogleDay("fake",day,undefined,async(url,opts)=>{
    assert.equal(url.pathname,"/calendar/v3/calendars/primary/events");assert.equal(opts.cache,"no-store");
    assert.equal(opts.headers.Authorization,"Bearer fake");assert.equal(url.searchParams.get("timeMin"),new Date(day+"T00:00:00").toISOString());
    if(!pages++)return Response.json({items:[{summary:"Ferias",start:{date:"2026-11-25"},end:{date:"2026-11-28"}},{summary:"Ayer",start:{date:"2026-11-26"},end:{date:day}}],nextPageToken:"two"});
    assert.equal(url.searchParams.get("pageToken"),"two");
    return Response.json({items:[{summary:"Turno",start:{dateTime:before},end:{dateTime:after}},{status:"cancelled"}]});
  });
  assert.deepEqual(rows.map(e=>[e.title,e.time,e.until]),[["Ferias","",""],["Turno","00:00","01:15"]]);
  await assert.rejects(fetchGoogleDay("fake",day,undefined,async()=>new Response(null,{status:401})),{status:401});
  await assert.rejects(fetchGoogleDay("fake",day,undefined,async()=>new Response(null,{status:403})),{status:403});
});
