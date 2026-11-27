// Shared by the entrance and the game so preload, seasons and lighting agree.
export function applyWorldLight(el, rewards, date = new Date()) {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  const south = /Buenos_Aires|Argentina|Montevideo|Santiago|Asuncion|Sao_Paulo|Australia|Auckland|Africa\/(Johannesburg|Windhoek)|Antarctica/i.test(zone);
  const quarter = Math.floor(((date.getMonth()+1)%12)/3);
  el.dataset.season = rewards.includes("season-cycle")
    ? (south ? ["summer","autumn","winter","spring"] : ["winter","spring","summer","autumn"])[quarter]
    : "base";
  el.dataset.hemisphere = south ? "south" : "north";
  const night = date.getHours() >= 19 || date.getHours() < 7;
  el.classList.toggle("night-mode",night);
  el.classList.toggle("day-mode",!night);
}

export function preloadSavedTerrain(storage) {
  // Only after entering: don't download every map or wait for it to enter the game.
  const read = key => { try { return JSON.parse(storage.getItem(key)) || {}; } catch { return {}; } };
  const settings = read("nok-settings-v1"), progress = read("nok-progress-v1");
  const rewards = Array.isArray(progress.unlockedRewards) ? progress.unlockedRewards : [];
  const world = document.querySelector("#world");
  world.classList.toggle("earth-mode",settings.worldTheme==="earth" && rewards.includes("map-coast"));
  applyWorldLight(world,rewards);
  const image = getComputedStyle(world.querySelector(".world-art")).backgroundImage.match(/^url\("([^"]+)"\)$/);
  if (!image) return;
  const link = document.createElement("link");
  link.rel = "preload"; link.as = "image"; link.fetchPriority = "high"; link.href = image[1];
  document.head.append(link);
}
