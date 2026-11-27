// Reorder only the selected slots, within their existing priority tier.
// New, unselected and completed tasks never have to be rewritten.
export function orderedSlots(rows, ids) {
  if (!Array.isArray(ids) || !ids.length) return rows;
  const rank = new Map(ids.map((id, i) => [id, i]));
  const tiers = new Map();
  for (const row of rows) {
    if (!rank.has(row.id)) continue;
    const key = row.priority === "high";
    if (!tiers.has(key)) tiers.set(key, {next:0, rows:[]});
    tiers.get(key).rows.push(row);
  }
  for (const tier of tiers.values()) tier.rows.sort((a,b)=>rank.get(a.id)-rank.get(b.id));
  return rows.map(row => {
    if (!rank.has(row.id)) return row;
    const tier=tiers.get(row.priority==="high");
    return tier.rows[tier.next++];
  });
}

export function boardGroups(ordered, day, trail, preferences={}, includeBacklog=true) {
  const today = task => task.scheduledDate ? task.scheduledDate === day : task.isToday;
  const backlog = includeBacklog ? ordered.filter(t=>!today(t) && !t.isQuest).sort((a,b)=>
    Number(b.priority==="high")-Number(a.priority==="high") ||
    trail(a).localeCompare(trail(b),"es") || new Date(a.createdAt)-new Date(b.createdAt)) : [];
  return {
    today: orderedSlots(ordered.filter(today), preferences?.today),
    backlog: orderedSlots(backlog, preferences?.backlog)
  };
}
export function pendingByPriority(tasks) {
  return tasks.filter(t=>t.status!=="done").sort((a,b)=>Number(b.priority==="high")-Number(a.priority==="high") || new Date(a.createdAt)-new Date(b.createdAt));
}
export function suggestedOrder(rows, by) {
  return [...rows].sort((a,b)=>Number(b.priority==="high")-Number(a.priority==="high") ||
    (by==="date" ? (a.scheduledDate||"9999").localeCompare(b.scheduledDate||"9999") : 0) ||
    a.title.localeCompare(b.title,"es",{sensitivity:"base",numeric:true}));
}
