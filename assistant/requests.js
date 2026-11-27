import {parse} from "chrono-node/es";

export const fold = value => String(value).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
const pad = n=>String(n).padStart(2,"0");
const dayOf = d=>[d.getFullYear(),pad(d.getMonth()+1),pad(d.getDate())].join("-");
const hours = "cero una dos tres cuatro cinco seis siete ocho nueve diez once doce".split(" ");
const eventPrefix = /^(?:(?:por favor|pod[eé]s|podr[ií]as|quiero que|necesito que|me)\b[,\s]*)*(?:agend|program|anot|reserv|cre|agreg|record)[\p{L}]*\s*/iu;
const eventNoun = /^(?:(?:un[ao]?|el|la)\s+)?(?:evento|cita)\b\s*(?:llamad[oa]\s+|para\s+|de\s+|:\s*)?/iu;
export function eventDraft(input, ref=new Date()) {
  // Normalize common spoken Argentine times before parsing. Never fill an
  // unspecified day or time from the parser's default reference time.
  let text=input.trim().replace(/[¿?¡!]/g,"").replace(/pasado mañana/giu,()=>{
    const d=new Date(ref); d.setDate(d.getDate()+2); return d.toLocaleDateString("es-AR");
  }).replace(/(a la[s]?\s+)(una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce)\b/giu,
    (_,prefix,word)=>prefix+hours.indexOf(fold(word)))
    .replace(/(\d{1,2})(?::(\d{2}))?\s+de la (mañana|tarde|noche)\b/giu,(_,h,m,period)=>{
      if(+h<1 || +h>12) return _;
      return pad(+h%12+(period.toLowerCase()==="mañana"?0:12))+":"+(m||"00");
    });
  const found=parse(text,ref,{forwardDate:true});
  let date="",time="", days=0,times=0;
  for(const match of found){
    const c=match.start, d=c.date();
    if(c.isCertain("day") || c.isCertain("weekday")){date=dayOf(d); days++;}
    if(c.isCertain("hour")){time=pad(d.getHours())+":"+pad(d.getMinutes());times++;}
  }
  for(const m of [...found].reverse()) text=text.slice(0,m.index)+" "+text.slice(m.index+m.text.length);
  const title=text.trim().replace(eventPrefix,"").trim().replace(eventNoun,"").trim()
    .replace(/^(?:para|el|a)(?:\s+|$)/iu,"").replace(/\s+(?:para|el|a|a las)\s*$/iu,"")
    .replace(/\s{2,}/g," ").replace(/^[\s,:;"“”]+|[\s,:;."“”]+$/g,"").trim();
  return {kind:"event", title:title.replace(/^(?:una?|la)\s+/iu,""),date:days===1?date:"",time:times===1?time:""};
}

export function localRequest(text,ref=new Date()) {
  const s=fold(text);
  if(/\b(?:borr\w*|elimin\w*|cancel\w*|no|contrase[nñ]a\w*|finanza\w*)\b/u.test(s) ||
     /\by\s+(?:despues\s+)?(?:agend|program|prioriz|orden|organiz|pasam)/.test(s)) return {kind:"unsupported"};
  if(/\b(?:cre\w*|anot\w*|agreg\w*|sum\w*)\s+(?:(?:una?|la|otra|nueva)\s+)*(?:tarea|mision)\b/.test(s)){
    if(/\b(?:manana|lunes|martes|miercoles|jueves|viernes|sabado|domingo|cada|semanal)\b|\d{1,2}\/\d{1,2}/.test(s)) return {kind:"unsupported"};
    const title=text.replace(/^.*?\b(?:tarea|misi[oó]n)\s*/iu,"").replace(/(?:\b(?:para )?hoy\b|\ben (?:la |mi )?mochila\b)/giu,"").replace(/^[\s,:"“]+|[\s."”]+$/g,"");
    return {kind:"task",title,isToday:/\bhoy\b/.test(s)};
  }
  if(/\b(?:orden\w*|organiz\w*|acomod\w*|clasific\w*)\b/.test(s) && !/\b(?:evento|reuniones|agenda|cumpleanos)\b/.test(s))
    return {kind:"sort",by:/alfab|nombre|a la z|a-z/.test(s)?"name":"date",section:/mochila/.test(s)?"backlog":/\bhoy\b/.test(s)?"today":""};
  if(/\b(?:prioriz\w*|prioridad|urgente)\b/.test(s) && !/\b(?:agenda\w*|evento|cita)\b/.test(s))
    return {kind:"priority",query:text,level:/\b(?:normal|baja|quita\w*|saca\w*)\b/.test(s)?"low":"high"};
  if(/\bhoy\b/.test(s) && /\b(?:pas\w*|mov\w*|pone\w*|pon\w*|llev\w*|sum\w*)\b/.test(s))
    return {kind:"today",query:text};
  if(eventPrefix.test(text.trim().replace(/^[¿¡]/,"")) && /\b(?:agend\w*|program\w*|reunion|cita|evento|turno)\b/.test(s) && !/\b(?:alarma|tarea|proyecto|lista|cada|semanal)\b/.test(s))
    return eventDraft(text,ref);
  return {kind:"unknown"};
}

// Optional, on-device model for less formulaic requests. No download, API key,
// private-world context, tool execution, or external AI service.
export async function interpret(text,signal,model=globalThis.LanguageModel) {
  const ref=new Date(), direct=localRequest(text,ref);
  if (direct.kind!=="unknown" || !model) return direct;
  const options={expectedInputs:[{type:"text",languages:["es"]}],expectedOutputs:[{type:"text",languages:["es"]}]};
  let session;
  try {
    if(await model.availability(options)!=="available" || signal.aborted) return direct;
    session=await model.create({...options,signal,initialPrompts:[{role:"system",content:"Clasificá el pedido del jugador. Solo: event (crear un evento puntual), task (crear una tarea en la Mochila o para hoy), sort (ordenar tareas pendientes), priority (marcar prioridad alta), today (pasar tareas a hoy) o unknown. Si pide otra operación, niega la acción o hace varios pedidos, usá unknown. En title copiá solo el nombre explícito del evento o tarea, sin día ni hora. No inventes datos."}]});
    const raw=await session.prompt(text,{signal,responseConstraint:{type:"object",properties:{kind:{type:"string",enum:["event","task","sort","priority","today","unknown"]},title:{type:"string"}},required:["kind","title"],additionalProperties:false}});
    const result=JSON.parse(raw);
    if(result.kind==="event") return {...eventDraft(text,ref),title:typeof result.title==="string"?result.title.slice(0,120):""};
    if(result.kind==="task") return {kind:"task",title:typeof result.title==="string"?result.title.slice(0,120):"",isToday:/\bhoy\b/.test(fold(text))};
    if(result.kind==="sort") return {kind:"sort",by:/alfab|nombre/.test(fold(text))?"name":"date",section:""};
    if(["priority","today"].includes(result.kind)) return {kind:result.kind,query:text};
  } catch { /* Missing language, disabled model or cancellation: keep the local path. */ }
  finally { session?.destroy(); }
  return direct;
}
