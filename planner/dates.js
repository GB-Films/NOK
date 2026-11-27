const pad = n => String(n).padStart(2, "0");
export const dayKey = d => [d.getFullYear(),pad(d.getMonth()+1),pad(d.getDate())].join("-");
export const localDate = key => new Date(key+"T12:00:00");
export const validDay = key => /^\d{4}-\d{2}-\d{2}$/.test(key) && dayKey(localDate(key))===key;
export const validTime = value => /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
export function moveDay(key,n){
  const d=localDate(key);d.setDate(d.getDate()+n);return dayKey(d);
}
export const weekday = key => (localDate(key).getDay()+6)%7;
export const weekKey = key => moveDay(key,-weekday(key));
export const weekdays = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
export function dueOn(task,day,today){
  return task.status!=="done" && (task.scheduledDate ? task.scheduledDate===day : task.isToday && day===today);
}
export function localEvents(day,events,birthdays){
  return [...events.filter(e=>e.date?.slice(0,10)===day).map(e=>({title:e.title,time:e.date.slice(11,16),source:"NOK"})),
    ...birthdays.filter(b=>b.date?.slice(5,10)===day.slice(5)).map(b=>({title:"Cumple de "+b.name,time:"",source:"NOK"}))];
}
