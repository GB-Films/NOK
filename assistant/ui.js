import {eventDraft,fold,interpret,localRequest} from "./requests.js";
import {suggestedOrder} from "./board.js";

export function mountAssistant(dialog,api) {
  dialog.innerHTML=`
    <header class="guide-head"><div><small>CAMPAMENTO NOK</small><h2 id="guide-title">Asistente</h2></div><button data-ui-action="close" data-ui-glyph type="button" data-close aria-label="Cerrar asistente">×</button></header>
    <div class="guide-page">
      <p>¿Qué necesitás hacer? Escribime o dictá tu pedido. Vos confirmás los cambios.</p>
      <div class="guide-examples" aria-label="Ejemplos de pedidos">
        <button type="button">Ordená mis tareas por fecha</button><button type="button">Agendá una reunión mañana a las 15</button>
      </div>
      <form data-request><label for="guide-input">Tu pedido</label><textarea id="guide-input" rows="2" maxlength="600" placeholder="Por ejemplo: pasá comprar materiales a hoy" required></textarea>
        <div class="guide-actions"><button type="button" data-mic>Dictar</button><button class="guide-primary" type="submit">Preparar</button></div>
        <small data-voice-note></small></form>
      <p class="guide-utterance" data-utterance hidden></p>
      <p class="guide-reply" data-reply role="status" aria-live="polite"></p>
      <form data-review hidden><h3>Revisá antes de guardar</h3><div data-fields></div>
        <div class="guide-actions"><button type="button" data-cancel>Descartar</button><button class="guide-primary" type="submit">Confirmar</button></div></form>
      <button type="button" data-result hidden></button>
    </div>`;
  const $=s=>dialog.querySelector(s), input=$("#guide-input"), request=$("[data-request]"), review=$("[data-review]"),
    fields=$("[data-fields]"), reply=$("[data-reply]"), result=$("[data-result]"), mic=$("[data-mic]");
  const Speech=globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
  mic.hidden=!Speech;
  $("[data-voice-note]").textContent=Speech?"Al dictar, tu navegador puede enviar el audio a su servicio de voz.":"El dictado no está disponible en este navegador. Podés escribir el pedido.";
  let draft,controller,speech,destination;
  function node(tag,text) {const el=document.createElement(tag); if(text!=null)el.textContent=text;return el;}
  function field(caption,el){const label=node("label",caption);label.append(el);fields.append(label);return el;}
  function select(caption,opts,value){const el=node("select");for(const [v,t] of opts)el.add(new Option(t,v));el.value=value;return field(caption,el);}
  function clear(){draft=null;fields.replaceChildren();review.hidden=true;result.hidden=true;destination=null;}
  function stopVoice(){
    if(speech){const r=speech;speech=null;r.abort();}
    mic.textContent="Dictar";mic.setAttribute("aria-pressed","false");
  }
  function cancelPending(){controller?.abort();controller=null;stopVoice();}
  function reset(){cancelPending();clear();input.value="";reply.textContent="";$("[data-utterance]").textContent="";$("[data-utterance]").hidden=true;}
  function eventFields(data){
    draft=data;
    for(const [name,title,type] of [["title","Nombre del evento","text"],["date","Fecha","date"],["time","Hora local","time"]]){
      const el=node("input");el.type=type;el.required=true;el.name=name;el.value=data[name]||"";if(name==="title")el.maxLength=120;
      field(title,el);el.addEventListener("input",()=>{data[name]=el.value;});
    }
    reply.textContent=!data.title?"¿Cómo se llama el evento?":!data.date?"¿Qué día lo agendo?":!data.time?"¿A qué hora? Completala abajo o respondeme por escrito.":"Voy a agregar este evento a tu Agenda.";
  }
  function taskFields(data){
    const groups=api.rows(), all=[...groups.today,...groups.backlog];
    if(!all.length){reply.textContent="No hay tareas pendientes en el tablón.";return;}
    draft=data; const sort=data.kind==="sort";
    const phrase=fold(data.query||"");
    const matches=t=>(fold(t.title) && phrase.includes(fold(t.title))) || (t.project && phrase.includes(fold(t.project)));
    data.section ||= (sort ? (groups.today.some(matches)?"today":groups.backlog.some(matches)?"backlog":groups.today.length?"today":"backlog") : "all");
    const scope=select("Sección",sort?[["today","Misiones de hoy"],["backlog","Mochila"]]:[["all","Todo el tablón"],["today","Misiones de hoy"],["backlog","Mochila"]],data.section);
    const order=sort?select("Orden", [["date","Fecha más próxima primero"],["name","Nombre, de A a Z"]],data.by):null;
    const list=node("fieldset"), legend=node("legend","Tareas incluidas");list.className="guide-tasks";fields.append(list);
    function draw(keep){
      data.section=scope.value;if(order)data.by=order.value;
      let rows=data.section==="all"?all:groups[data.section];
      if(data.kind==="today"){const inbox=new Set(groups.backlog.map(t=>t.id));rows=rows.filter(t=>inbox.has(t.id));}
      if(data.kind==="priority")rows=rows.filter(t=>(t.priority==="high")!==(data.level!=="low"));
      if(sort)rows=suggestedOrder(rows,data.by);
      list.replaceChildren(legend);
      const hasMatch=rows.some(matches), subset=/\b(algunas?|solo|solamente|unicamente|proyecto)\b/.test(phrase);
      data.ids=new Set();
      for(const t of rows){
        const label=node("label"),box=node("input");box.type="checkbox";box.checked=keep?keep.has(t.id):matches(t)||(sort&&!hasMatch&&!subset);
        if(box.checked)data.ids.add(t.id);
        box.addEventListener("change",()=>{if(box.checked)data.ids.add(t.id);else data.ids.delete(t.id);});
        label.append(box,node("span",t.title),node("small",[t.priority==="high"?"Alta":"",t.project,t.scheduledDate].filter(Boolean).join(" · ")));list.append(label);
      }
      if(!rows.length)list.append(node("p","No hay tareas para esta acción en esta sección."));
      data.rows=rows;
    }
    scope.addEventListener("change",()=>draw(null));order?.addEventListener("change",()=>draw(data.ids));draw(null);
    reply.textContent=sort?"Las marcadas se reordenan dentro de su sección. Las de prioridad alta siguen primero; las que desmarques conservan su lugar.":
      data.kind==="today"?"Elegí qué tareas pasar a Hoy. Se reemplazará su fecha programada por la de hoy.":"Elegí qué tareas marcar con prioridad "+(data.level==="low"?"normal.":"alta.");
  }
  async function prepare(){
    const text=input.value.trim();if(!text)return;
    const previous=draft?.kind==="event"?{...draft}:null;
    cancelPending();clear();const job=new AbortController();controller=job;
    $("[data-utterance]").textContent="Vos: "+text;$("[data-utterance]").hidden=false;reply.textContent="Leyendo tu pedido…";
    try {
      let data=localRequest(text);
      if(data.kind==="unknown" && previous){
        const next=eventDraft(text);
        if(next.date||next.time) data={...previous,title:previous.title||next.title,date:next.date||previous.date,time:next.time||previous.time};
        else if(!previous.title) data={...previous,title:text.slice(0,120)};
      }
      if(data.kind==="unknown")data=await interpret(text,job.signal);
      if(job.signal.aborted || !dialog.open)return;
      if(data.kind==="event")eventFields(data);
      else if(data.kind==="task"){
        draft=data;const name=node("input");name.required=true;name.maxLength=120;name.value=data.title;field("Nombre de la tarea",name);
        name.addEventListener("input",()=>{data.title=name.value;});
        const where=select("Guardar en",[["backlog","Mochila"],["today","Misiones de hoy"]],data.isToday?"today":"backlog");
        where.addEventListener("change",()=>{data.isToday=where.value==="today";});
        reply.textContent="Voy a crear una tarea de prioridad normal.";
      }
      else if(["sort","today","priority"].includes(data.kind))taskFields({...data,query:text});
      else {reply.textContent="Puedo agendar un evento, crear una tarea, ordenar el tablón, pasar tareas a Hoy o cambiar su prioridad. Pedime una cosa por vez.";return;}
      review.hidden=!draft; input.value="";
      if(draft)review.scrollIntoView({block:"nearest"});
    } catch { if(!job.signal.aborted)reply.textContent="No pude preparar ese pedido. Probá con el nombre de la tarea o la fecha del evento."; }
  }
  request.addEventListener("submit",e=>{e.preventDefault();void prepare();});
  dialog.querySelectorAll(".guide-examples button").forEach(b=>b.addEventListener("click",()=>{input.value=b.textContent;void prepare();}));
  review.addEventListener("submit",e=>{
    e.preventDefault();if(!draft)return;
    const d=draft;
    if(d.ids && !d.ids.size){reply.textContent="Marcá al menos una tarea antes de confirmar.";return;}
    try{
      const action=d.kind==="event"?{kind:d.kind,title:d.title.trim(),date:d.date,time:d.time}:
        d.kind==="task"?{kind:"task",title:d.title.trim(),isToday:d.isToday}:
        {kind:d.kind,section:d.section,level:d.level,ids:d.rows.filter(t=>d.ids.has(t.id)).map(t=>t.id)};
      const summary=api.apply(action);clear();reply.textContent=summary;
      destination=action.kind==="event"?"agenda":"board";result.textContent=destination==="agenda"?"Ver en la Agenda":"Ver en el Tablón";result.hidden=false;
    }catch(err){reply.textContent=err.message;}
  });
  function closeGuide(){reset();dialog.close();}
  result.addEventListener("click",()=>{const panel=destination;closeGuide();if(panel)api.open(panel);});
  $("[data-close]").addEventListener("click",closeGuide);
  $("[data-cancel]").addEventListener("click",()=>{reset();reply.textContent="Descartado. No cambié nada.";input.focus();});
  dialog.addEventListener("cancel",reset);
  dialog.addEventListener("close",()=>{if(!dialog.open)reset();});
  mic.addEventListener("click",()=>{
    if(speech){speech.stop();return;}if(!Speech)return;
    const r=new Speech();speech=r;r.lang="es-AR";r.interimResults=false;r.continuous=false;
    r.onresult=e=>{if(speech!==r||!dialog.open)return;input.value=(input.value+" "+e.results[0][0].transcript).trim().slice(0,600);reply.textContent="Revisá el dictado y tocá Preparar.";};
    r.onerror=e=>{if(speech===r)reply.textContent=e.error==="not-allowed"?"No se habilitó el micrófono. Podés escribir.":"No pude escuchar el pedido. Podés volver a dictarlo o escribir.";};
    r.onend=()=>{if(speech===r){speech=null;mic.textContent="Dictar";mic.setAttribute("aria-pressed","false");}};
    try{r.start();mic.textContent="Terminar dictado";mic.setAttribute("aria-pressed","true");reply.textContent="Te escucho…";}catch{stopVoice();reply.textContent="El micrófono no está disponible. Podés escribir.";}
  });
}
