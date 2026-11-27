import {dayKey,dueOn,localDate,localEvents,moveDay,validDay,validTime,weekday,weekdays,weekKey} from "./dates.js";

const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pretty=(day,options)=>localDate(day).toLocaleDateString("es-AR",options);
const option=(v,t)=>'<option value="'+esc(v)+'">'+esc(t)+'</option>';
const note=t=>'<p class="day-note">'+esc(t)+'</p>';
const hour=n=>String(n).padStart(2,"0")+":00";

export function mountPlanner(api){
  const rail=document.querySelector("#day-rail"),sheet=document.querySelector("#day-sheet"),
    editor=document.querySelector("#day-editor"),launch=document.querySelector("#day-launch"),
    compact=matchMedia("(max-width:1023px), (orientation:portrait)");
  let day=dayKey(new Date()),lastToday=day,view="day",googleRows=[],feedback="",request,stamp=0,busy=false;
  rail.innerHTML='<header><small>CUADERNO DEL CAMPAMENTO</small><div><h1>Mi día</h1><button data-ui-action="close" data-ui-glyph type="button" data-do="close" aria-label="Cerrar Mi día">×</button></div></header>'+
    '<nav aria-label="Vistas del planificador"><button data-do="day">Día</button><button data-do="week">Semana y roles</button></nav>'+
    '<div class="day-date"><button data-do="prev" aria-label="Fecha anterior">‹</button><input type="date" aria-label="Fecha del planificador"><button data-do="next" aria-label="Fecha siguiente">›</button><button data-do="today">Hoy</button></div>'+
    '<div class="day-content"></div><footer><button data-do="google"></button><button data-do="unlink" aria-label="Desconectar Calendar de esta sesión">Desconectar</button><small data-google-note></small></footer>'+
    '<p class="day-feedback" role="status" aria-live="polite"></p>';
  const content=rail.querySelector(".day-content"),picker=rail.querySelector("input[type=date]"),
    status=rail.querySelector(".day-feedback"),gbtn=rail.querySelector('[data-do="google"]');
  function say(msg){status.textContent=msg;}
  function footer(){
    const service=api.calendar;
    gbtn.textContent=busy?"Leyendo Calendar…":service?.connected?"Actualizar Calendar":"Vincular Google Calendar";
    gbtn.disabled=busy || !service;
    rail.querySelector('[data-do="unlink"]').hidden=!service?.connected;
    rail.querySelector("[data-google-note]").textContent=feedback || (service?.connected?"Calendario principal · Solo lectura":service?"Opcional · Solo lectura":"Disponible al iniciar sesión con Google.");
  }
  async function sync(connect=false){
    const seq=++stamp;request?.abort();request=new AbortController();
    if(!api.calendar || !api.editable()){busy=false;footer();return;}
    if(!connect && !api.calendar.connected){busy=false;footer();return;}
    busy=true;feedback="";footer();
    try{
      if(connect && !api.calendar.connected)await api.calendar.connect();
      if(seq!==stamp)return;
      const rows=await api.calendar.list(day,request.signal);
      if(seq===stamp)googleRows=rows;
    }catch(e){
      if(seq!==stamp)return;
      googleRows=[];
      feedback=e.code?.startsWith("auth/")?"No se vinculó Calendar. Permití la ventana de Google y elegí la misma cuenta.":e.message;
    }finally{if(seq===stamp){busy=false;refresh();}}
  }
  function setDate(next){
    if(!validDay(next)){picker.value=day;return;}
    day=next;googleRows=[];feedback="";say("");content.scrollTop=0;refresh(true);void sync();
  }
  const roleFor=(t,roles)=>roles.find(r=>r.id===t.workRoleId)?.title;
  function taskChip(t,roles){
    const role=roleFor(t,roles);
    return '<button type="button" draggable="true" class="day-task" data-task="'+esc(t.id)+'"><strong>'+esc(t.title)+'</strong>'+
      (role?'<small>'+esc(role)+'</small>':'')+'</button>';
  }
  function dutyRow(r,d,weekly){
    const checked=d.completed.includes(weekKey(day));
    return '<div class="day-duty"><label><input type="checkbox" data-check="'+esc(d.id)+'" data-role="'+esc(r.id)+'" '+(checked?"checked":"")+'><span><b>'+esc(d.title)+'</b><small>'+esc(weekly?weekdays[d.weekday]:r.title)+'</small></span></label>'+
      (weekly?'<button data-ui-action="edit" data-ui-glyph data-edit-duty="'+esc(d.id)+'" data-role="'+esc(r.id)+'" aria-label="Editar responsabilidad: '+esc(d.title)+'">Editar</button>':'')+'</div>';
  }
  function paintDay(){
    const roles=api.roles(),tasks=api.tasks().filter(t=>dueOn(t,day,dayKey(new Date()))),
      events=[...localEvents(day,api.events(),api.birthdays()),...googleRows].sort((a,b)=>a.time.localeCompare(b.time)),
      loose=tasks.filter(t=>!validTime(t.scheduledTime)),timed=tasks.filter(t=>validTime(t.scheduledTime)),
      duties=roles.flatMap(r=>r.duties.filter(d=>d.weekday===weekday(day)).map(d=>dutyRow(r,d,false)));
    const eventList=events.map(e=>'<li><time>'+esc(e.time?(e.time+(e.until?"–"+e.until:"")):"Todo el día")+'</time><span>'+esc(e.title)+'<small>'+esc(e.source)+'</small></span></li>').join("");
    const agenda='<section><h3>Eventos</h3>'+(eventList?'<ul class="day-events">'+eventList+'</ul>':note("Sin eventos para este día."))+'</section>';
    const slots=Array.from({length:24},(_,n)=>{
      const hh=hour(n),matches=timed.filter(t=>+t.scheduledTime.slice(0,2)===n).sort((a,b)=>a.scheduledTime.localeCompare(b.scheduledTime));
      const eventChips=events.filter(e=>e.time && +e.time.slice(0,2)===n).map(e=>'<span class="day-event-chip">'+esc(e.time+" · "+e.title)+'</span>').join("");
      return '<div class="day-slot'+(!eventChips&&!matches.length?" day-empty":"")+'" data-hour="'+hh+'"><time>'+hh+'</time><div>'+eventChips+
        matches.map(t=>'<div class="day-timed"><small>'+esc(t.scheduledTime)+'</small>'+taskChip(t,roles)+'</div>').join("")+'</div></div>';
    }).join("");
    const routines=api.routines(weekday(day));
    return '<h2>'+esc(pretty(day,{weekday:"long",day:"numeric",month:"short"}))+'</h2>'+agenda+
      '<section><div class="day-heading"><h3>Tareas sin horario</h3><button data-do="schedule">+ Tarea</button></div><div class="day-loose" data-hour="">'+(loose.map(t=>taskChip(t,roles)).join("")||note("No hay tareas sin horario."))+'</div></section>'+
      (duties.length?'<section><h3>Mis responsabilidades</h3>'+duties.join("")+'</section>':'')+
      (routines.length?'<section><h3>Rutinas del Tablón</h3><ul>'+routines.map(r=>'<li>'+esc(r.text)+'</li>').join("")+'</ul></section>':'')+
      '<section><h3>Por hora</h3><p class="day-drag-tip">Arrastrá una tarea a su hora o tocala para editarla.</p>'+
      (!timed.length&&!events.some(e=>e.time)?'<p class="day-compact-empty">Sin horarios asignados.</p>':'')+
      '<div class="day-hours" tabindex="0" aria-label="Horarios del día">'+slots+'</div></section>';
  }
  function paintWeek(){
    const start=weekKey(day),end=moveDay(start,6),roles=api.roles(),tasks=api.tasks();
    const roleCards=roles.map(r=>{
      const duties=[...r.duties].sort((a,b)=>a.weekday-b.weekday);
      const mine=tasks.filter(t=>t.workRoleId===r.id && t.scheduledDate>=start && t.scheduledDate<=end);
      return '<section class="day-role"><div class="day-heading"><h3>'+esc(r.title)+'</h3><button data-ui-action="edit" data-ui-glyph data-edit-role="'+esc(r.id)+'" aria-label="Renombrar '+esc(r.title)+'">Editar</button></div>'+
        (duties.length?duties.map(d=>dutyRow(r,d,true)).join(""):note("Todavía no hay responsabilidades."))+
        '<button data-add-duty="'+esc(r.id)+'">+ Responsabilidad</button>'+
        (mine.length?'<h4>Tareas de esta semana</h4>'+mine.map(t=>'<div><small>'+esc(weekdays[weekday(t.scheduledDate)])+'</small>'+taskChip(t,roles)+'</div>').join(""):'')+'</section>';
    }).join("");
    const days=weekdays.map((name,n)=>{const key=moveDay(start,n),count=tasks.filter(t=>dueOn(t,key,dayKey(new Date()))).length+api.routines(n).length+roles.reduce((s,r)=>s+r.duties.filter(d=>d.weekday===n).length,0);
      return '<button data-date="'+key+'" aria-label="'+name+', '+count+' tareas"><span>'+name.slice(0,2)+'</span><b>'+count+'</b></button>';}).join("");
    return '<h2>Semana del '+esc(pretty(start,{day:"numeric",month:"short"}))+'</h2><div class="day-weekdays">'+days+'</div><div class="day-heading"><h3>Mis roles</h3><button data-do="role">+ Rol</button></div>'+
      note("Separá lo que te toca hacer en cada rol. Las casillas cuentan solo para esta semana.")+
      (roleCards||note("Por ejemplo: Dirección o Producción. Creá tu primer rol para agregar sus responsabilidades."));
  }
  function refresh(reset=false){
    picker.value=day;
    rail.querySelectorAll("nav button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.do===view)));
    footer();
    if(compact.matches&&!sheet.open)return;
    const previous=content.querySelector(".day-hours")?.scrollTop,old=content.scrollTop;
    const active=document.activeElement,focusKey=active?.dataset?.check;
    const markup=view==="day"?paintDay():paintWeek();
    if(content._markup===markup && !reset)return;
    content.innerHTML=markup;content._markup=markup;content.scrollTop=reset?0:old;
    if(focusKey)Array.from(content.querySelectorAll("[data-check]")).find(el=>el.dataset.check===focusKey)?.focus({preventScroll:true});
    const hours=content.querySelector(".day-hours");
    if(hours&&!compact.matches){
      const first=hours.querySelector(".day-slot:not(.day-empty)") || hours.querySelector('[data-hour="08:00"]');
      hours.scrollTop=reset||previous==null?first.offsetTop:previous;
    }
  }
  function layout(){
    if(!compact.matches && sheet.open)sheet.close();
    if(compact.matches)sheet.append(rail);else sheet.before(rail);
    rail.hidden=false;launch.hidden=!compact.matches;document.body.classList.add("day-ready");refresh(true);
  }
  const field=(label,html)=>'<label>'+label+html+'</label>';
  function edit(kind,{task,role,duty}={}){
    if(!api.editable())return;
    const roles=api.roles(),tasks=api.tasks(),formTitle=kind==="task"?"Programar tarea":kind==="role"?(role?"Renombrar rol":"Nuevo rol"):(duty?"Editar responsabilidad":"Nueva responsabilidad");
    let fields="";
    if(kind==="task")fields=field("Tarea",'<select name="id">'+option("","Crear una tarea…")+tasks.map(t=>option(t.id,t.title)).join("")+'</select>')+
      field("Nombre",'<input name="title" maxlength="120" required>')+
      field("Día",'<input type="date" name="date" required>')+
      field("Hora (opcional)",'<input type="time" name="time">')+
      field("Rol (opcional)",'<select name="role">'+option("","Sin rol")+roles.map(r=>option(r.id,r.title)).join("")+'</select>');
    else fields=field(kind==="role"?"Nombre del rol":"Qué te toca hacer",'<input name="title" required maxlength="100" value="'+esc(duty?.title || (kind==="role"?role?.title:"") || "")+'">')+
      (kind==="duty"?field("Se repite cada",'<select name="weekday">'+weekdays.map((w,i)=>option(i,w)).join("")+'</select>'):"");
    editor.innerHTML='<form><header><h2 id="day-editor-title">'+formTitle+'</h2><button data-ui-action="close" data-ui-glyph type="button" data-cancel aria-label="Cerrar editor">×</button></header>'+fields+
      '<p role="alert"></p><footer>'+(duty?'<button data-ui-action="delete" type="button" data-remove>Eliminar</button>':'')+'<button type="button" data-cancel>Cancelar</button><button type="submit">Guardar</button></footer></form>';
    const form=editor.querySelector("form"),f=form.elements;
    if(kind==="task"){
      const selectTask=(selected,initial)=>{
        f.title.required=!selected;f.title.parentElement.hidden=!!selected;
        f.date.value=initial&&selected?.scheduledDate?selected.scheduledDate:day;
        f.time.value=validTime(selected?.scheduledTime)?selected.scheduledTime:"";f.role.value=selected?.workRoleId||"";
      };
      f.id.value=task?.id??"";selectTask(task,true);
      f.id.onchange=()=>selectTask(tasks.find(t=>String(t.id)===f.id.value),false);
    }else if(kind==="duty")f.weekday.value=duty?.weekday??weekday(day);
    form.querySelectorAll("[data-cancel]").forEach(b=>b.onclick=()=>editor.close());
    if(duty)form.querySelector("[data-remove]").onclick=()=>{
      if(!confirm("¿Quitar esta responsabilidad semanal y su registro de cumplimiento?"))return;
      try{api.changeRole({kind:"remove-duty",roleId:role.id,dutyId:duty.id});editor.close();refresh();say("Responsabilidad eliminada.");}catch(e){form.querySelector("[role=alert]").textContent=e.message;}
    };
    form.onsubmit=e=>{
      e.preventDefault();
      try{
        if(kind==="task")api.schedule({id:Number(f.id.value)||null,title:f.title.value,day:f.date.value,time:f.time.value,roleId:f.role.value});
        else api.changeRole({kind,title:f.title.value,roleId:role?.id,dutyId:duty?.id,weekday:Number(f.weekday?.value)});
        editor.close();
        if(kind==="task"){setDate(f.date.value);say("Tarea programada.");}else{refresh();say("Guardado.");}
      }catch(err){form.querySelector("[role=alert]").textContent=err.message;}
    };
    editor.showModal();
  }
  launch.onclick=()=>{if(api.editable()){sheet.showModal();refresh(true);}};
  picker.onchange=()=>setDate(picker.value);
  rail.addEventListener("click",e=>{
    const b=e.target.closest("button");if(!b || !api.editable())return;
    const d=b.dataset,roles=api.roles();
    if(d.do==="close"){sheet.close();return;}
    if(d.do==="day"||d.do==="week"){view=d.do;refresh(true);}
    else if(d.do==="prev"||d.do==="next")setDate(moveDay(day,(view==="day"?1:7)*(d.do==="prev"?-1:1)));
    else if(d.do==="today")setDate(dayKey(new Date()));
    else if(d.date){view="day";setDate(d.date);}
    else if(d.do==="google")void sync(true);
    else if(d.do==="unlink"){stamp++;request?.abort();busy=false;api.calendar?.disconnect();googleRows=[];feedback="";refresh();}
    else if(d.do==="schedule"||d.task)edit("task",{task:api.tasks().find(t=>String(t.id)===d.task)});
    else if(d.do==="role"||d.editRole)edit("role",{role:roles.find(r=>r.id===d.editRole)});
    else if(d.addDuty||d.editDuty){const role=roles.find(r=>r.id===(d.addDuty||d.role));if(role)edit("duty",{role,duty:role.duties.find(x=>x.id===d.editDuty)});}
  });
  rail.addEventListener("change",e=>{
    const el=e.target;if(!el.dataset.check)return;
    try{api.changeRole({kind:"check",roleId:el.dataset.role,dutyId:el.dataset.check,day,checked:el.checked});refresh();}
    catch(err){el.checked=!el.checked;say(err.message);}
  });
  rail.addEventListener("dragstart",e=>{const t=e.target.closest("[data-task]");if(t){e.dataTransfer.setData("text/task-id",t.dataset.task);e.dataTransfer.effectAllowed="move";}});
  const dropZone=e=>e.dataTransfer.types.includes("text/task-id") && e.target.closest("[data-hour]");
  rail.addEventListener("dragover",e=>{const zone=dropZone(e);if(zone && api.editable()){e.preventDefault();e.dataTransfer.dropEffect="move";zone.classList.add("day-over");}});
  rail.addEventListener("dragleave",e=>e.target.closest("[data-hour]")?.classList.remove("day-over"));
  rail.addEventListener("drop",e=>{
    const zone=dropZone(e);if(!zone)return;e.preventDefault();zone.classList.remove("day-over");
    try{api.schedule({id:Number(e.dataTransfer.getData("text/task-id")),day,time:zone.dataset.hour});say("Horario actualizado.");}catch(err){say(err.message);}
  });
  function tick(){
    if(document.hidden || !api.editable())return;
    const now=dayKey(new Date());
    if(lastToday!==now){const follow=day===lastToday;lastToday=now;if(follow){setDate(now);return;}}
    if(api.calendar?.connected && !busy && (!compact.matches || sheet.open))void sync();
  }
  layout();compact.addEventListener("change",layout);
  document.addEventListener("visibilitychange",tick);setInterval(tick,60000);
  return {refresh,modalOpen:()=>sheet.open||editor.open,closeModal:()=>{
    const modal=editor.open?editor:sheet.open?sheet:null;if(modal)modal.close();return !!modal;
  }};
}
