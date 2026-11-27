import {dayKey,moveDay,validDay} from "./dates.js";

// Only event titles and times for the selected local day; never exported to the world save.
export async function fetchGoogleDay(token,day,signal,request=fetch){
  if(!validDay(day)) throw Error("La fecha no es válida.");
  const begin=new Date(day+"T00:00:00"),end=new Date(moveDay(day,1)+"T00:00:00");
  const url=new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
  url.search=new URLSearchParams({timeMin:begin.toISOString(),timeMax:end.toISOString(),timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone,singleEvents:"true",orderBy:"startTime",fields:"nextPageToken,items(status,summary,start,end)",maxResults:"250"});
  const rows=[];
  do{
    const response=await request(url,{headers:{Authorization:"Bearer "+token},signal,cache:"no-store",credentials:"omit",redirect:"error"});
    if(!response.ok)throw Object.assign(Error(response.status===401?"La conexión venció. Volvé a conectar Calendar.":response.status===403?"Google no habilitó la lectura. Revisá el permiso y que Calendar esté habilitado para NOK.":"No pudimos leer Calendar. Reintentá cuando tengas conexión."),{status:response.status});
    const {items=[],nextPageToken}=await response.json();
    for(const e of items){
      if(e.status==="cancelled" || !e.start)continue;
      let time="",until="";
      if(e.start.date){if(e.start.date>day || e.end?.date<=day)continue;}
      else{
        const from=new Date(e.start.dateTime),to=new Date(e.end?.dateTime);
        if(!(from<end && to>begin))continue;
        const fmt=d=>d.toTimeString().slice(0,5);
        time=from<begin?"00:00":fmt(from);until=dayKey(to)===day?fmt(to):"24:00";
      }
      rows.push({title:e.summary || "Ocupado",time,until,source:"Google"});
    }
    if(!nextPageToken)break;
    url.searchParams.set("pageToken",nextPageToken);
  }while(true);
  return rows;
}
