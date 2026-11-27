import {validDay,weekKey} from "./dates.js";

export function changeRoles(list,action,makeId=()=>crypto.randomUUID()){
  const next=structuredClone(list),role=next.find(r=>r.id===action.roleId);
  const name=String(action.title||"").trim();
  const title=()=>{if(!name || name.length>100)throw Error("Escribí un nombre de hasta 100 caracteres.");return name;};
  if(action.kind==="role"){
    title();
    if(next.some(r=>r!==role && r.title.toLocaleLowerCase("es")===name.toLocaleLowerCase("es")))throw Error("Ya existe un rol con ese nombre.");
    if(role)role.title=name;else next.push({id:makeId(),title:name,duties:[]});
  }else{
    if(!role)throw Error("Ese rol ya no está disponible.");
    const duty=role.duties.find(d=>d.id===action.dutyId);
    if(action.kind==="duty"){
      title();
      if(!Number.isInteger(action.weekday)||action.weekday<0||action.weekday>6)throw Error("Elegí un día de la semana.");
      if(duty)Object.assign(duty,{title:name,weekday:action.weekday});
      else role.duties.push({id:makeId(),title:name,weekday:action.weekday,completed:[]});
    }else if(action.kind==="check" && duty && validDay(action.day)){
      const week=weekKey(action.day),done=new Set(duty.completed);
      if(action.checked)done.add(week);else done.delete(week);
      duty.completed=[...done].sort();
    }else if(action.kind==="remove-duty" && duty)role.duties=role.duties.filter(d=>d!==duty);
    else throw Error("No se pudo aplicar el cambio.");
  }
  return next;
}
