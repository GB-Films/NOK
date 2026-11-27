import { applyWorldLight } from "../account/terrain.js";
// One in-memory storage instance for this signed-in world (or this guest visit).
(function (localStorage) {
const TASKS_KEY = "nok-desktop-tasks-v1";
const PROFILE_KEY = "nok-desktop-profile-v1";
const FINANCE_KEY = "nok-desktop-finance-v1";
const PASSWORD_VAULT_KEY = "nok-password-vault-v1";
const COFFER_NOTES_KEY = "nok-coffer-notes-v1";
const PASSWORD_VAULT_ITERATIONS = 250_000;
const BIRTHDAYS_KEY = "nok-desktop-birthdays-v1";
const BIRTHDAY_ALERTS_KEY = "nok-birthday-alerts-v1";
const EVENT_ALERTS_KEY = "nok-event-alerts-v1";
const EVENT_SNOOZES_KEY = "nok-event-snoozes-v1";
const BIRTHDAY_EVENING_HOUR = 20;
const WRITING_KEY = "nok-desktop-writing-v1";
const WRITING_PAGE_BREAK = "\f";
const SCREENPLAY_CHARACTER_INDENT = "                    ";
const SCREENPLAY_DIALOGUE_INDENT = "          ";
const SCREENPLAY_BLOCKS = new Set([
  "scene",
  "action",
  "character",
  "dialogue",
  "parenthetical",
  "transition",
]);
const EVENTS_KEY = "nok-desktop-events-v1";
const PROJECTS_KEY = "nok-desktop-projects-v1";
const PROJECT_RENAMES_KEY = "nok-desktop-project-renames-v1";
const DELETED_PROJECT_SENTINEL = "__NOK_PROJECT_DELETED__";
const MISSION_BACKPACK_AREA = "personal";
const MISSION_BACKPACK_PROJECT = "Mochila de misiones";
const PLAYER_POSITION_KEY = "nok-player-position-v1";
const WORLD_LAYOUT_KEY = "nok-world-layout-v1";
const SETTINGS_KEY = "nok-settings-v1";
const HUB_ALARMS_KEY = "nok-hub-alarms-v1";
const QUICK_LISTS_KEY = "nok-quick-lists-v1";
const DRAWINGS_KEY = "nok-drawings-v1";
const QUICK_LIST_TYPE_META = Object.freeze({
  checklist: { label: "CHECKLIST", icon: "./art/ui/lists-type-checklist.webp", hint: "Tachá y reutilizá" },
  ranking: { label: "RANKING", icon: "./art/ui/lists-type-ranking.webp", hint: "Ordená del 1° para abajo" },
  notes: { label: "NOTAS", icon: "./art/ui/lists-type-notes.webp", hint: "Una hoja libre" },
});
const UNDERGROUND_ITEMS_KEY = "nok-underground-items-v1";
const DAILY_PLAN_KEY = "nok-daily-plan-v1";
const PROGRESS_KEY = "nok-progress-v1";
const PUZZLE_PROGRESS_KEY = "nok-puzzle-progress-v1";
const LEARNING_PROGRESS_KEY = "nok-learning-progress-v1";
const DAILY_CLEAR_KEY = "nok-daily-clear-v1";
const MOBILE_CLOUD_RECOVERY_KEY = "nok-mobile-cloud-recovery-1.12.9";
const COLLAPSED_WORLD_RECOVERY_KEY = "nok-collapsed-world-recovery-1.12.36";
const CLOUD_SYNCED_KEYS = Object.freeze([
  TASKS_KEY,
  PROFILE_KEY,
  FINANCE_KEY,
  PASSWORD_VAULT_KEY,
  COFFER_NOTES_KEY,
  BIRTHDAYS_KEY,
  WRITING_KEY,
  EVENTS_KEY,
  PROJECTS_KEY,
  PROJECT_RENAMES_KEY,
  WORLD_LAYOUT_KEY,
  SETTINGS_KEY,
  HUB_ALARMS_KEY,
  QUICK_LISTS_KEY,
  DRAWINGS_KEY,
  UNDERGROUND_ITEMS_KEY,
  DAILY_PLAN_KEY,
  PUZZLE_PROGRESS_KEY,
  LEARNING_PROGRESS_KEY,
  PROGRESS_KEY,
]);

const ACHIEVEMENT_DEFINITIONS = Object.freeze([
  { id: "created-10", metric: "created", target: 10, coins: 10, art: "./art/ui/achievements/created-10.webp", title: "PRIMERAS PÁGINAS", copy: "Crear 10 misiones." },
  { id: "created-100", metric: "created", target: 100, coins: 30, art: "./art/ui/achievements/created-100.webp", title: "MENTE INQUIETA", copy: "Crear 100 misiones." },
  { id: "created-500", metric: "created", target: 500, coins: 75, art: "./art/ui/achievements/created-500.webp", title: "CARTÓGRAFO DE TU VIDA", copy: "Crear 500 misiones." },
  { id: "created-1000", metric: "created", target: 1000, coins: 150, art: "./art/ui/achievements/created-1000.webp", title: "MIL AVENTURAS", copy: "Crear 1000 misiones." },
  { id: "completed-10", metric: "completed", target: 10, coins: 15, art: "./art/ui/achievements/completed-10.webp", title: "EN MARCHA", copy: "Completar 10 misiones." },
  { id: "completed-50", metric: "completed", target: 50, coins: 30, art: "./art/ui/achievements/completed-50.webp", title: "HÉROE COTIDIANO", copy: "Completar 50 misiones." },
  { id: "completed-100", metric: "completed", target: 100, coins: 60, art: "./art/ui/achievements/completed-100.webp", title: "CENTENAR DE VICTORIAS", copy: "Completar 100 misiones." },
  { id: "completed-500", metric: "completed", target: 500, coins: 125, art: "./art/ui/achievements/completed-500.webp", title: "LEYENDA CONSTANTE", copy: "Completar 500 misiones." },
  { id: "completed-1000", metric: "completed", target: 1000, coins: 250, art: "./art/ui/achievements/completed-1000.webp", title: "MAESTRO DE MISIONES", copy: "Completar 1000 misiones." },
  { id: "streak-7", metric: "streak", target: 7, coins: 25, art: "./art/ui/achievements/streak-7.webp", title: "UNA SEMANA EN LLAMAS", copy: "Mantener una racha de 7 días." },
  { id: "streak-30", metric: "streak", target: 30, coins: 75, art: "./art/ui/achievements/streak-30.webp", title: "RITUAL DEL MES", copy: "Mantener una racha de 30 días." },
  { id: "streak-100", metric: "streak", target: 100, coins: 200, art: "./art/ui/achievements/streak-100.webp", title: "FUEGO ETERNO", copy: "Mantener una racha de 100 días." },
]);

const REWARD_DEFINITIONS = Object.freeze([
  { id: "drawing-portal", cost: 80, art: "./art/ui/rewards/drawing-portal.webp", title: "PORTAL DE DIBUJO", copy: "Desbloquea el acceso al taller de dibujo libre." },
  { id: "underground-access", cost: 90, art: "./art/ui/rewards/underground-access.webp", title: "ACCESO AL SÓTANO", copy: "Abre la escotilla hacia la caverna de respaldo." },
  { id: "night-map", cost: 100, art: "./art/ui/rewards/night-map.webp", title: "MAPA NOCTURNO", copy: "Desbloquea el aspecto nocturno especial de tu mundo." },
  { id: "season-cycle", cost: 140, art: "./art/ui/rewards/season-cycle.webp", title: "LAS CUATRO ESTACIONES", copy: "El mapa cambia entre verano, otoño, invierno y primavera según tu ubicación." },
  { id: "map-coast", cost: 180, art: "./art/ui/rewards/map-coast.webp", title: "NUEVO MAPA", copy: "Desbloquea Costa Serena como un nuevo mundo explorable." },
  { id: "wizard-avatar", cost: 160, art: "./art/ui/rewards/wizard-avatar.webp", title: "AVENTURERO MAGO", copy: "Suma un personaje mago a tu colección de identidades." },
  { id: "avatar-freedom", cost: 100, art: "./art/ui/rewards/wizard-avatar.webp", title: "IDENTIDAD LIBRE", copy: "Elegí cualquier edad, sexo y color de pelo para tu personaje." },
]);
const PROGRESS_ART_VERSION = "20260815-1";
const PROGRESS_ARTWORK = Object.freeze([
  ...ACHIEVEMENT_DEFINITIONS.map((achievement) => achievement.art),
  ...REWARD_DEFINITIONS.map((reward) => reward.art),
]);
const progressArtworkPreloads = [];

function progressArtworkUrl(path, retry = 0) {
  const url = new URL(path, document.baseURI);
  url.searchParams.set("nok-art", retry ? `${PROGRESS_ART_VERSION}-${retry}` : PROGRESS_ART_VERSION);
  return url.href;
}

function preloadProgressArtwork() {
  for (const path of new Set(PROGRESS_ARTWORK)) {
    const image = new Image();
    image.decoding = "async";
    image.src = progressArtworkUrl(path);
    progressArtworkPreloads.push(image);
  }
}


document.addEventListener("error", (event) => {
  const image = event.target;
  if (!(image instanceof HTMLImageElement) || !image.dataset.progressArtwork) return;
  const retry = Number(image.dataset.progressArtworkRetry || 0);
  if (retry >= 2) return;
  image.dataset.progressArtworkRetry = String(retry + 1);
  window.setTimeout(() => {
    image.src = progressArtworkUrl(image.dataset.progressArtwork, retry + 1);
  }, 180);
}, true);
const MENTAL_PUZZLES = Object.freeze([
  {
    question: "En una carrera adelantás a la persona que va segunda. ¿En qué puesto quedás?",
    hint: "No pasaste a quien iba primero.",
    answers: ["segundo", "2", "segundo puesto"],
    explanation: "Quedás segundo: ocupás el lugar de la persona que acabás de adelantar.",
  },
  {
    question: "Dos padres y dos hijos comen tres manzanas. Cada uno come una. ¿Cómo puede ser?",
    hint: "No necesariamente son cuatro personas.",
    answers: ["tres personas", "3 personas", "abuelo padre e hijo", "abuelo padre hijo"],
    explanation: "Son tres personas: un abuelo, su hijo y su nieto. El padre también es hijo.",
  },
  {
    question: "¿Cuántos meses del año tienen 28 días?",
    hint: "La pregunta no dice 'exactamente 28'.",
    answers: ["todos", "12", "doce", "todos los meses"],
    explanation: "Los doce meses tienen, como mínimo, 28 días.",
  },
  {
    question: "Completá la serie: 2, 3, 5, 9, 17, ...",
    hint: "Cada salto duplica al anterior.",
    answers: ["33", "treinta y tres"],
    explanation: "Se suma 1, 2, 4, 8 y luego 16. Por eso sigue 33.",
  },
  {
    question: "Cinco máquinas hacen cinco piezas en cinco minutos. ¿Cuánto tardan cien máquinas en hacer cien piezas?",
    hint: "Cada máquina trabaja al mismo tiempo.",
    answers: ["5 minutos", "cinco minutos", "5"],
    explanation: "Cinco minutos. Cada máquina produce una pieza en ese tiempo.",
  },
  {
    question: "Un granjero tiene 17 ovejas. Todas menos 9 se escapan. ¿Cuántas quedan?",
    hint: "Leé con atención 'todas menos'.",
    answers: ["9", "nueve", "9 ovejas", "nueve ovejas"],
    explanation: "Quedan 9: esas son justamente las que no se escaparon.",
  },
  {
    question: "¿Qué pesa más: un kilo de hierro o un kilo de plumas?",
    hint: "La unidad ya fija el peso.",
    answers: ["igual", "lo mismo", "pesan igual", "ninguno"],
    explanation: "Pesan exactamente lo mismo: un kilo.",
  },
  {
    question: "Tengo agujas y números, pero no sé coser ni contar. ¿Qué soy?",
    hint: "Lo mirás varias veces por día.",
    answers: ["reloj", "un reloj"],
    explanation: "Un reloj: tiene agujas y números para mostrar la hora.",
  },
  {
    question: "Si ayer fuese mañana, hoy sería viernes. ¿Qué día es hoy?",
    hint: "Mover ayer a mañana desplaza la referencia dos días.",
    answers: ["domingo", "es domingo"],
    explanation: "Es domingo. Al desplazar la referencia dos días hacia atrás, ese 'hoy' hipotético sería viernes.",
  },
  {
    question: "Hay tres interruptores y una lámpara en otra habitación. Solo podés entrar una vez. ¿Cómo descubrís cuál la enciende?",
    hint: "La lámpara también puede darte información por su temperatura.",
    answers: ["calor", "temperatura", "tocando la lampara", "tocar la lampara"],
    explanation: "Encendé uno unos minutos, apagalo y encendé otro. Al entrar: encendida = segundo; apagada y caliente = primero; fría = tercero.",
  },
]);
const DEFAULT_SETTINGS = Object.freeze({
  worldName: "Mi mundo NOK",
  avatarStyle: "adventurer",
  characterGender: "male",
  characterHair: "brown",
  characterAgeOverride: "",
  characterSetupComplete: false,
  worldTheme: "fantasy",
  volume: 70,
  musicEnabled: true,
  soundEffectsEnabled: true,
  keyboardMovement: true,
  touchJoystickEnabled: false,
  shortcutsEnabled: true,
  reducedMotion: false,
  showHomeReminders: true,
  strictFocusMode: true,
  quickAccess: ["focus", "board", "projects", "archive", "creativity"],
  worldPropPositions: {
    spouse: { x: 24, y: 31 },
    ocarina: { x: 56, y: 48 },
    hatch: { x: 12.5, y: 84 },
    house: { x: 18, y: 38 },
  },
});

function normalizeWorldPropPositions(value) {
  const source = value && typeof value === "object" ? value : {};
  const fallback = DEFAULT_SETTINGS.worldPropPositions;
  return Object.fromEntries(Object.keys(fallback).map((id) => {
    const position = source[id] && typeof source[id] === "object" ? source[id] : {};
    // The house is no longer displayed on the web. Keep its stored coordinates.
    if (id === "house") return [id, source[id] ?? fallback[id]];
    return [id, {
      x: Math.min(97, Math.max(3, Number(position.x ?? fallback[id].x) || fallback[id].x)),
      y: Math.min(94, Math.max(8, Number(position.y ?? fallback[id].y) || fallback[id].y)),
    }];
  }));
}
const PLAYER_SPAWN = Object.freeze({ x: 52.2, y: 67 });
const PET_NPC_STARTS = Object.freeze({
  dog: { x: 43, y: 69 },
  cat: { x: 67, y: 74 },
  rabbit: { x: 76, y: 66 },
});
const PET_SLEEP_DURATION_MS = 15 * 60 * 1000;
const PET_WALK_DURATION_MS = 10 * 60 * 1000;
const PET_INITIAL_ACTIVE_DURATION_MS = Object.freeze({
  dog: 7 * 60 * 1000,
  cat: 10 * 60 * 1000,
  rabbit: 4 * 60 * 1000,
});
const PET_WALK_SPEED = Object.freeze({ dog: 2.05, cat: 2.25, rabbit: 2.55 });
const PET_COLLISION_X = 2.1;
const PET_COLLISION_Y = 2.25;
const PET_PATH_GRID_STEP = 1;
const PET_FRAME_DURATION_MS = Object.freeze({ dog: 205, cat: 185, rabbit: 145 });
// The position stored for the player is the point between their feet.  Keep
// the collision capsule deliberately smaller than the artwork: the head and
// backpack may overlap scenery visually, just like in a top-down RPG, while
// the feet are what actually determine whether a path is open.
const PLAYER_COLLISION_X = 0.52;
const PLAYER_COLLISION_Y = 0.68;
const PLAYER_MOVEMENT_SUBSTEP = 0.18;
const PLAYER_DIRECTIONS = Object.freeze({ down: 0, left: 1, right: 2, up: 3 });
const CHARACTER_HAIR_OPTIONS = Object.freeze([
  { id: "brown", label: "CASTAÑO" },
  { id: "black", label: "NEGRO" },
  { id: "blonde", label: "RUBIO" },
  { id: "red", label: "PELIRROJO" },
]);
const CHARACTER_AGE_OPTIONS = Object.freeze([
  { id: "teen", label: "ADOLESCENTE", range: "12–18" },
  { id: "young", label: "JOVEN ADULTO", range: "19–35" },
  { id: "adult", label: "ADULTO", range: "36–65" },
  { id: "elder", label: "ADULTO MAYOR", range: "66–99" },
]);
const WORLD_BOUNDS = Object.freeze({
  fantasy: { minX: 5, maxX: 95, minY: 10, maxY: 93 },
  earth: { minX: 5, maxX: 95, minY: 14, maxY: 92 },
});
const WORLD_GRID = Object.freeze({ columns: 32, rows: 20 });
const WORLD_GRID_STEP = 0.5;
const MAX_WORLD_MODULES = 9;
const MAX_PORTAL_TITLE_LENGTH = 12;
const WORLD_BUILD_PLOTS = Object.freeze(Array.from(
  { length: 59 * 37 },
  (_, index) => ({
    x: 0.5 + (index % 59) * WORLD_GRID_STEP,
    y: Math.floor(index / 59) * WORLD_GRID_STEP,
  }),
));
const WORLD_MODULE_SPACING = Object.freeze({ x: 8.25, y: 10.5 });
const WORLD_BUILD_BLOCKERS = Object.freeze({
  fantasy: [
    { x: 0, y: 0, width: 13, height: 48 },
    { x: 13, y: 0, width: 67, height: 12 },
    { x: 87, y: 0, width: 13, height: 66 },
    { x: 80, y: 16, width: 12, height: 31 },
    { x: 40, y: 22, width: 21, height: 39 },
    { x: 0, y: 48, width: 15, height: 52 },
    { x: 37, y: 72, width: 32, height: 28 },
    { x: 81, y: 61, width: 19, height: 39 },
  ],
  earth: [
    { x: 0, y: 0, width: 35, height: 42 },
    { x: 7, y: 29, width: 19, height: 22 },
    { x: 72, y: 0, width: 28, height: 42 },
    { x: 41, y: 20, width: 21, height: 49 },
    { x: 0, y: 48, width: 20, height: 52 },
    { x: 80, y: 46, width: 20, height: 54 },
    { x: 25, y: 68, width: 24, height: 32 },
    { x: 58, y: 66, width: 28, height: 34 },
  ],
});
const PET_SCENERY_BLOCKERS = Object.freeze({
  fantasy: WORLD_BUILD_BLOCKERS.fantasy.filter((_, index) => index !== 4),
  earth: WORLD_BUILD_BLOCKERS.earth.filter((_, index) => index !== 3),
});
const PORTAL_COLOR_PALETTE = Object.freeze({
  red: "#f04444",
  orange: "#ff7417",
  yellow: "#ffd83d",
  blue: "#286cff",
  green: "#35d56a",
  violet: "#8147e8",
  white: "#fff4d6",
  black: "#151820",
  gray: "#8c959d",
  cyan: "#35dce8",
  pink: "#ff5caa",
});
const WORLD_MODULE_DEFINITIONS = Object.freeze([
  { id: "hub", label: "HUB", panel: "hub", icon: "./art/hotbar/hub-tools.webp", color: PORTAL_COLOR_PALETTE.orange, asset: "./art/portal-hub.webp", nightAsset: "./art/portal-hub-night.webp", artScale: "130%", titleTop: "13px", titleLeft: "54%", titleWidth: "82px", description: "Alarmas, temporizadores y calculadora para tener todo a mano.", defaultPlot: { x: 7, y: 2 } },
  { id: "focus", label: "ENFOQUE", panel: "mission", icon: "./art/hotbar/ahora-sword.webp", color: PORTAL_COLOR_PALETTE.blue, asset: "./art/portal-focus.webp", nightAsset: "./art/portal-focus-night.webp", artScale: "134%", titleTop: "19px", titleLeft: "50%", titleWidth: "88px", description: "Elige una misión y protege cinco minutos para avanzar sin distracciones.", defaultPlot: { x: 15, y: 2 } },
  { id: "creativity", label: "CREATIVIDAD", panel: "creativity", icon: "./art/hotbar/creativity-palette.webp", color: PORTAL_COLOR_PALETTE.yellow, asset: "./art/portal-creativity.webp", nightAsset: "./art/portal-creativity-night.webp", artScale: "114%", titleTop: "20px", titleLeft: "43%", titleWidth: "70px", description: "Escritura larga, guiones e ideas con sesiones de concentración.", defaultPlot: { x: 23, y: 2 } },
  { id: "archive", label: "ARCHIVO", panel: "agenda", icon: "./art/hotbar/archivo-notebook.webp", color: PORTAL_COLOR_PALETTE.violet, asset: "./art/portal-archive.webp?v=20260810", nightAsset: "./art/portal-archive-night.webp?v=20260810", artScale: "140%", titleTop: "4px", titleLeft: "55%", titleWidth: "84px", description: "Agenda, cumpleaños, calendario y rutinas del plan diario.", defaultPlot: { x: 7, y: 7 } },
  { id: "projects", label: "PROYECTOS", panel: "projects", icon: "./art/hotbar/proyectos-diamond.webp", color: PORTAL_COLOR_PALETTE.cyan, asset: "./art/portal-projects.webp", nightAsset: "./art/portal-projects-night.webp", artScale: "130%", titleTop: "11px", titleLeft: "53%", titleWidth: "80px", description: "Organiza ámbitos, proyectos, quests y todas sus misiones.", defaultPlot: { x: 23, y: 7 } },
  { id: "finance", label: "FINANZAS", panel: "finance", icon: "./art/hotbar/finance-coin.webp", color: PORTAL_COLOR_PALETTE.green, asset: "./art/portal-finance.webp", nightAsset: "./art/portal-finance-night.webp", artScale: "136%", titleTop: "5px", titleLeft: "52%", titleWidth: "88px", description: "Dinero, bienes, deudas, contraseñas y pergaminos importantes.", defaultPlot: { x: 6, y: 13 } },
  { id: "learning", label: "APRENDIZAJE", panel: "puzzle", icon: "./art/hotbar/learning-book.webp", color: PORTAL_COLOR_PALETTE.red, asset: "./art/portal-learning.webp", nightAsset: "./art/portal-learning-night.webp", artScale: "132%", titleTop: "17px", titleLeft: "50%", titleWidth: "86px", description: "Datos, acertijos, cultura general y desafíos de memoria diarios.", defaultPlot: { x: 22, y: 13 } },
  { id: "lists", label: "LISTAS", panel: "lists", icon: "./art/hotbar/lists-scroll.webp", color: PORTAL_COLOR_PALETTE.pink, asset: "./art/portal-lists.webp", nightAsset: "./art/portal-lists-night.webp", artScale: "128%", titleTop: "10px", titleLeft: "51%", titleWidth: "86px", description: "Checklists, rankings y notas rápidas que puedes reutilizar.", defaultPlot: { x: 13, y: 11 } },
  { id: "drawing", label: "DIBUJO", panel: "drawing", icon: "./art/hotbar/drawing-tablet.webp", color: "#6b1735", asset: "./art/portal-drawing.webp", nightAsset: "./art/portal-drawing-night.webp", artScale: "126%", titleTop: "9px", titleLeft: "50%", titleWidth: "84px", description: "Un lienzo libre para dibujar y guardar ideas visuales.", defaultPlot: { x: 17, y: 15 }, rewardId: "drawing-portal" },
]);
const RANDOM_FACTS = Object.freeze([
  "Los pulpos tienen tres corazones y su sangre es azul.",
  "La Antártida es el desierto más grande del planeta.",
  "La luz de la Luna tarda cerca de 1,3 segundos en llegar a la Tierra.",
  "Los tiburones existen desde antes que los primeros árboles.",
  "Un cuerpo humano adulto suele tener 206 huesos.",
  "Venus gira en sentido contrario a la mayoría de los planetas.",
  "La escritura más antigua conocida surgió en Mesopotamia hace más de 5.000 años.",
  "El océano Pacífico ocupa más superficie que todas las masas terrestres juntas.",
  "Las abejas comunican la ubicación de flores mediante una danza.",
  "La montaña más alta medida desde su base es Mauna Kea, gran parte bajo el océano.",
]);
const DAILY_CULTURE_QUESTIONS = Object.freeze([
  { question: "¿Qué civilización construyó Machu Picchu?", answer: "La civilización inca." },
  { question: "¿Quién pintó Las meninas?", answer: "Diego Velázquez." },
  { question: "¿Cuál es la capital de Mongolia?", answer: "Ulán Bator." },
  { question: "¿Qué elemento químico usa el símbolo Au?", answer: "El oro." },
  { question: "¿Quién escribió la novela 1984?", answer: "George Orwell." },
  { question: "¿Cuál es el océano más grande del mundo?", answer: "El océano Pacífico." },
  { question: "¿En qué región nació el tango?", answer: "En el Río de la Plata, especialmente Buenos Aires y Montevideo." },
  { question: "¿Qué sinfonía de Beethoven incluye la Oda a la alegría?", answer: "La Novena Sinfonía." },
  { question: "¿Qué planeta es famoso por su sistema de anillos?", answer: "Saturno." },
  { question: "¿En qué idioma fue escrito originalmente Don Quijote?", answer: "En español." },
]);

const LEARNING_DIFFICULTIES = Object.freeze({
  easy: { label: "FÁCIL", index: 0, puzzleIndexes: [0, 1, 2] },
  medium: { label: "MEDIO", index: 1, puzzleIndexes: [3, 4, 5, 6] },
  hard: { label: "DIFÍCIL", index: 2, puzzleIndexes: [7, 8, 9] },
});

const MEMORY_CHALLENGES = Object.freeze({
  easy: [
    { sequence: "LUNA   LLAVE   PAN", question: "Escribí las tres palabras en el mismo orden.", answers: ["luna llave pan"] },
    { sequence: "ROJO   4   GATO", question: "Repetí la secuencia completa.", answers: ["rojo 4 gato", "rojo cuatro gato"] },
    { sequence: "SOL   TAZA   8", question: "¿Qué tres elementos viste y en qué orden?", answers: ["sol taza 8", "sol taza ocho"] },
  ],
  medium: [
    { sequence: "BOSQUE   7   AZUL   RELOJ   2", question: "Escribí los cinco elementos en orden.", answers: ["bosque 7 azul reloj 2", "bosque siete azul reloj dos"] },
    { sequence: "13   PLUMA   NORTE   LIMÓN   LLAVE", question: "Repetí la secuencia sin mirar.", answers: ["13 pluma norte limon llave", "trece pluma norte limon llave"] },
    { sequence: "BARCO   5   COBRE   NUBE   9", question: "¿Cuál era la secuencia completa?", answers: ["barco 5 cobre nube 9", "barco cinco cobre nube nueve"] },
  ],
  hard: [
    { sequence: "VIENTO   18   JADE   SUR   FARO   6   CUERDA", question: "Escribí los siete elementos en el orden exacto.", answers: ["viento 18 jade sur faro 6 cuerda", "viento dieciocho jade sur faro seis cuerda"] },
    { sequence: "31   ROBLE   ESTE   CAMPANA   4   VIOLETA   PUENTE", question: "Repetí toda la secuencia sin cambiar el orden.", answers: ["31 roble este campana 4 violeta puente", "treinta y uno roble este campana cuatro violeta puente"] },
    { sequence: "CRISTAL   12   OESTE   TINTA   27   CUERVO   MAPA", question: "¿Qué siete elementos aparecieron?", answers: ["cristal 12 oeste tinta 27 cuervo mapa", "cristal doce oeste tinta veintisiete cuervo mapa"] },
  ],
});

function dailyContentIndex(length, salt = 0, date = new Date()) {
  const seed = date.getFullYear() * 372 + (date.getMonth() + 1) * 31 + date.getDate() + salt;
  return Math.abs(seed) % length;
}

const QUICK_ACCESS_DEFINITIONS = Object.freeze([
  { id: "focus", label: "ENFOQUE", panel: "mission", icon: "./art/hotbar/ahora-sword.webp", color: "#416d9d" },
  { id: "board", label: "TABLÓN", panel: "board", icon: "./art/hotbar/tablon-alert.webp", color: "#a9583f", always: true },
  { id: "projects", label: "PROYECTOS", panel: "projects", icon: "./art/hotbar/proyectos-diamond.webp", color: "#347d72" },
  { id: "archive", label: "ARCHIVO", panel: "agenda", icon: "./art/hotbar/archivo-notebook.webp", color: "#76548c" },
  { id: "hub", label: "HUB", panel: "hub", icon: "./art/hotbar/hub-tools.webp", color: "#8a5936" },
  { id: "creativity", label: "CREATIVIDAD", panel: "creativity", icon: "./art/hotbar/creativity-palette.webp", color: "#9b6840" },
  { id: "finance", label: "FINANZAS", panel: "finance", icon: "./art/hotbar/finance-coin.webp", color: "#5e713d" },
  { id: "learning", label: "APRENDIZAJE", panel: "puzzle", icon: "./art/hotbar/learning-book.webp", color: "#8b4141" },
  { id: "lists", label: "LISTAS", panel: "lists", icon: "./art/hotbar/lists-scroll.webp", color: "#7a5a70" },
  { id: "drawing", label: "DIBUJO", panel: "drawing", icon: "./art/hotbar/drawing-tablet.webp", color: "#6b1735" },
  { id: "task", label: "TAREA", panel: "task", icon: "./art/hotbar/tarea-pencil.webp", color: "#98404e", always: true },
]);
const MAX_QUICK_ACCESS = 5;
const PARTNER_APPEARANCES = Object.freeze(["blonde", "dark", "redhead", "chestnut"]);
const PET_APPEARANCES = Object.freeze({
  Perro: ["dog-gray", "dog-golden", "dog-black", "dog-spotted"],
  Gato: ["cat-calico", "cat-black", "cat-orange", "cat-gray"],
  Conejo: ["rabbit-white", "rabbit-brown", "rabbit-black", "rabbit-spotted"],
});
const PET_APPEARANCE_LABELS = Object.freeze({
  "dog-gray":"GRIS", "dog-golden":"DORADO", "dog-black":"NEGRO", "dog-spotted":"MANCHADO",
  "cat-calico":"CALICÓ", "cat-black":"NEGRO", "cat-orange":"NARANJA", "cat-gray":"GRIS",
  "rabbit-white":"BLANCO", "rabbit-brown":"MARRÓN", "rabbit-black":"NEGRO", "rabbit-spotted":"MANCHADO",
});

function normalizedPetSpecies(value) {
  if (/conejo|rabbit/i.test(value)) return "Conejo";
  if (/perro|dog/i.test(value)) return "Perro";
  return "Gato";
}

function defaultPetAppearance(species) {
  return PET_APPEARANCES[normalizedPetSpecies(species)][0];
}

function portalTitleFontSize(title) {
  const length = Array.from(String(title || "").trim()).length;
  if (length <= 7) return "8px";
  if (length <= 9) return "7px";
  if (length <= 10) return "6.25px";
  return "5.5px";
}
const WORLD_COLLISIONS = Object.freeze({
  fantasy: [
    { type: "rect", x: 45.3, y: 27.2, width: 13, height: 13.8 },
    { type: "circle", x: 52, y: 49.5, radius: 4.2 },
    { type: "rect", x: 45.4, y: 51.5, width: 4.2, height: 7.2 },
    { type: "rect", x: 55.2, y: 51.3, width: 4.1, height: 7.4 },
    { type: "circle", x: 50.5, y: 84.7, radius: 7.2 },
  ],
  earth: [
    { type: "rect", x: 4.5, y: 8, width: 27.5, height: 29 },
    { type: "rect", x: 44.5, y: 12.5, width: 12.5, height: 14.5 },
    { type: "circle", x: 58.4, y: 20.2, radius: 3.2 },
    { type: "rect", x: 65.2, y: 16.5, width: 12.5, height: 22 },
    { type: "rect", x: 79, y: 19, width: 13, height: 17 },
    { type: "rect", x: 30.5, y: 23.5, width: 10.5, height: 15 },
    { type: "rect", x: 46, y: 29, width: 14.5, height: 20 },
    { type: "rect", x: 21, y: 43, width: 13.5, height: 22 },
    { type: "rect", x: 68.5, y: 44.5, width: 16.5, height: 19 },
    { type: "circle", x: 52.5, y: 58.7, radius: 5.4 },
    { type: "rect", x: 43.8, y: 60, width: 5.2, height: 9 },
    { type: "rect", x: 56.5, y: 60.2, width: 5.2, height: 9 },
    { type: "rect", x: 6.2, y: 70.5, width: 16.5, height: 17 },
    { type: "rect", x: 31.2, y: 73, width: 14, height: 13.5 },
    { type: "rect", x: 64.2, y: 73.5, width: 20, height: 18.5 },
    { type: "rect", x: 84, y: 67, width: 8.5, height: 26 },
  ],
});

const workProjects = [
  ["Granberta", "GB", "Contenido, redes e imagen como influencer.", "#f4a261"],
  ["Bani VFX", "BV", "Postproducción y entregas audiovisuales.", "#55b6b0"],
  ["Totem Rental", "TR", "Alquiler de objetos y equipo audiovisual.", "#e9c46a"],
  ["Xetup", "XT", "Videojuegos · Bumper Balls en desarrollo.", "#8c7ae6"],
  ["GB Films", "GF", "Películas, comerciales y producción profesional.", "#e76f51"],
  ["Bani LABS", "BL", "Software, producto y experimentos.", "#65c466"],
];

const personalProjects = [
  [MISSION_BACKPACK_PROJECT, "MM", "Destino inicial de las misiones antes de asignarlas a un proyecto específico.", "#e9c46a"],
  ["María", "M♥", "Pareja · misión especial: casamiento.", "#ef6f8f"],
  ["Personal", "YO", "Tareas, gestiones y cuestiones personales.", "#9b78b5"],
  ["Amigos", "AM", "Planes, encuentros y gente querida.", "#6ca6c1"],
  ["Familia", "FA", "Tiempo compartido y asuntos familiares.", "#f4a261"],
  ["Fútbol", "FT", "Partidos, entrenamiento y cancha.", "#62b36f"],
  ["Videojuegos", "VG", "Jugar, descubrir y terminar campañas.", "#8c7ae6"],
  ["Acertijos / juegos", "AJ", "Desafíos mentales, ideas y juegos.", "#d4a72c"],
  ["Archivo de vida", "AV", "Ordenar fotos, videos y recuerdos.", "#55b6b0"],
];

let tasks = readStoredTasks();
let profile = readStoredProfile();
const PROFILE_PASSPORT_PAGES = ["player", "partner", "pets", "home", "work"];
let activeProfilePassportPage = "player";
let profileAutosaveTimer = 0;
let progressState = normalizeProgressState(readJson(PROGRESS_KEY, null));
const achievementQueue = [];
let activeAchievement = null;
let activeRewardCelebration = null;
let activityTab = "stats";
let petWizardDraft = null;
let petWizardEditingId = null;
let financeEntries = readJson(FINANCE_KEY, []);
let cofferNotes = readJson(COFFER_NOTES_KEY, []).filter(
  (note) =>
    note &&
    typeof note.id === "string" &&
    typeof note.title === "string" &&
    typeof note.content === "string",
);
let birthdays = readJson(BIRTHDAYS_KEY, []);
let writingProjects = readJson(WRITING_KEY, []);
let importantEvents = readJson(EVENTS_KEY, []).map(normalizeImportantEvent);
let customProjects = readJson(PROJECTS_KEY, []).filter(
  (project) =>
    project &&
    typeof project.name === "string" &&
    (project.area === "laboral" || project.area === "personal"),
);
let projectRenames = readJson(PROJECT_RENAMES_KEY, {});
const storedWorldTheme = readJson(SETTINGS_KEY, {}).worldTheme === "earth" ? "earth" : "fantasy";
let cachedCollisionScene = null;
let worldLayout = normalizeWorldLayout(
  readJson(WORLD_LAYOUT_KEY, null),
  true,
  storedWorldTheme,
);
localStorage.setItem(WORLD_LAYOUT_KEY, JSON.stringify(worldLayout));
let activeWritingId = writingProjects[0]?.id ?? null;
let activeWritingPage = 0;
let writingEditorOpen = false;
let writingHistory = {
  projectId: activeWritingId,
  undo: [],
  redo: [],
  lastGroup: null,
  lastRecordedAt: 0,
};
let calendarCursor = new Date();
let playerPosition = readJson(PLAYER_POSITION_KEY, PLAYER_SPAWN);
playerPosition = {
  x:
    typeof playerPosition.x === "number"
      ? Math.min(97, Math.max(3, playerPosition.x))
      : PLAYER_SPAWN.x,
  y:
    typeof playerPosition.y === "number"
      ? Math.min(94, Math.max(8, playerPosition.y))
      : PLAYER_SPAWN.y,
};
let settings = readStoredSettings();
let projectTaskDraggingId = null;
let suppressTaskCardOpenUntil = 0;
worldLayout = sanitizeWorldLayout(worldLayout, settings.worldTheme);
localStorage.setItem(WORLD_LAYOUT_KEY, JSON.stringify(worldLayout));
playerPosition = nearestWalkablePosition(playerPosition, settings.worldTheme);
let activeTaskTab = "todo";
let activeProjectTab = "laboral";
let projectFilter = "";
let questStack = [];
let newTaskParentId = null;
let missionTaskId = null;
const MISSION_FOCUS_DURATION_SECONDS = 5 * 60;
let missionFocusEndsAt = 0;
let missionFocusTimer = null;
let missionFocusReviewOpen = false;
let toastTimer = null;
let completionCelebrationTimer = null;
let achievementCelebrationTimer = null;
let activeBirthdayAlert = null;
const birthdayAlertQueue = [];
const birthdayAlertScheduledKeys = new Set();
let writingAutosaveTimer = null;
let scriptContextSelection = null;
let pendingWritingDeleteId = null;
let editingEventId = null;
let editingBirthdayId = null;
let eventChecklistDraft = [];
let selectedProjectColor = "#6ca6c1";
let renameTarget = null;
let projectDeleteTarget = null;
let editingTaskId = null;
let editingTaskFormId = null;
let boardMode = "today";
let boardMobileSection = "today";
const singleBoardColumn = window.matchMedia("(max-width:760px), (orientation:portrait)");
let boardMotivationExpanded = false;
let passwordVaultEntries = [];
let passwordVaultMaster = "";
let passwordVaultAttempt = 0;
let visiblePasswordIds = new Set();
let activeCofferTab = "home";
let activeHubTab = "home";
let musicEngine = null;
let soundEngine = null;
let cloudSync = null;
let cloudUiState = null;
let activePairingCode = "";
let focusSeconds = 10 * 60;
let focusDuration = 10 * 60;
let focusRunning = false;
let focusTimerInterval = null;
let hubAlarms = readJson(HUB_ALARMS_KEY, []).filter(
  (alarm) => alarm && typeof alarm.id === "string" && typeof alarm.time === "string",
);
let quickLists = normalizeQuickLists(readJson(QUICK_LISTS_KEY, []));
let drawingIdeas = normalizeDrawings(readJson(DRAWINGS_KEY, []));
let activeDrawingId = null;
let drawingTool = "brush";
let drawingColor = "#173e31";
let drawingSize = 12;
let drawingPointer = null;
let drawingHistory = [];
let drawingHistoryIndex = -1;
const UNDERGROUND_CATEGORY_LABELS = Object.freeze({
  note: "NOTA",
  reference: "REFERENCIA",
  memory: "RECUERDO",
  misc: "OTROS",
});
function normalizeUndergroundItems(value) {
  return (Array.isArray(value) ? value : [])
    .filter((item) => item && typeof item.id === "string" && typeof item.title === "string")
    .map((item) => ({
      id: item.id,
      title: item.title.trim().slice(0, 100),
      details: typeof item.details === "string" ? item.details.trim().slice(0, 1200) : "",
      category: Object.hasOwn(UNDERGROUND_CATEGORY_LABELS, item.category) ? item.category : "note",
      createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
      updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : new Date().toISOString(),
    }))
    .filter((item) => item.title);
}
let undergroundItems = normalizeUndergroundItems(readJson(UNDERGROUND_ITEMS_KEY, []));
let editingUndergroundId = null;
const DAILY_PLAN_DAYS = Object.freeze([
  ["monday", "LUNES"],
  ["tuesday", "MARTES"],
  ["wednesday", "MIÉRCOLES"],
  ["thursday", "JUEVES"],
  ["friday", "VIERNES"],
  ["saturday", "SÁBADO"],
  ["sunday", "DOMINGO"],
]);
function normalizeDailyPlan(value) {
  const source = value && typeof value === "object" ? value : {};
  return Object.fromEntries(
    DAILY_PLAN_DAYS.map(([key]) => [
      key,
      Array.isArray(source[key])
        ? source[key]
            .filter((item) => item && typeof item.text === "string")
            .map((item) => ({
              id: typeof item.id === "string" ? item.id : `plan-${Date.now()}-${Math.random()}`,
              text: item.text.trim().slice(0, 140),
            }))
            .filter((item) => item.text)
        : [],
    ]),
  );
}
let dailyPlan = normalizeDailyPlan(readJson(DAILY_PLAN_KEY, {}));
let activeQuickListId = quickLists[0]?.id ?? null;
let quickListDeleteArmedId = null;
let quickListCreateType = "checklist";
let editingQuickListItemId = null;
let draggedRankingItemId = null;
let hubTimerSeconds = 10 * 60;
let hubTimerDuration = 10 * 60;
let hubTimerRunning = false;
let hubTimeMode = "timer";
let hubStopwatchMilliseconds = 0;
let hubStopwatchRunning = false;
let hubStopwatchStartedAt = 0;
let hubStopwatchLaps = [];
let puzzleIndex = (() => {
  return dailyContentIndex(MENTAL_PUZZLES.length);
})();
let learningDifficulty = null;
let lockedLearningDifficulty = null;
let activeLearningBlock = null;
let learningProgress = {};
let memoryStudySeconds = 10;
let memoryStudyRunning = false;
let puzzleSeconds = 5 * 60;
let puzzleRunning = false;
let puzzleSolved = false;
let playerDirection = "down";
let playerFrame = 0;
let playerPositionSaveTimer = null;
let playerAnimationFrame = null;
let playerLastFrameTime = performance.now();
let playerLastSpriteFrame = -1;
let playerWalkAnimationMs = 0;
let petNpcAnimationFrame = null;
let petNpcLastFrameTime = performance.now();
let petNpcStates = null;
let petActors = [];
let worldWidth = 0, worldHeight = 0;
const pressedMovementKeys = new Set();
const isMobileRuntime = document.documentElement.classList.contains(
  "mobile-runtime",
);
let mobileWorldPanX = 0;
let mobileWorldPointerId = null;
let mobileWorldPointerStartX = 0;
let mobileWorldPointerStartY = 0;
let mobileWorldPanStartX = 0;
let mobileWorldDragged = false;
let mobileWorldTapButton = null;
let mobileWorldTapHandled = false;
let mobileJoystickPointerId = null;
let mobileJoystickDirections = [];
let worldBuildMode = false;
let undergroundWorldOpen = false;
enforceRewardEntitlements();
localStorage.setItem(WORLD_LAYOUT_KEY, JSON.stringify(worldLayout));
localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
let campPlayerPosition = null;
let selectedWorldModuleId = null;
let worldModuleDetailId = null;
let moduleDragState = null;
let worldPropDragState = null;
let characterSetupStep = 1;
let characterSetupGender = "male";
let characterSetupHair = "brown";

const elements = {
  characterSetup: document.querySelector("#character-setup"),
  closeCharacterSetup: document.querySelector("#close-character-setup"),
  characterSetupKicker: document.querySelector("#character-setup-kicker"),
  characterSetupTitle: document.querySelector("#character-setup-title"),
  characterSetupName: document.querySelector("#character-setup-name"),
  characterSetupBirth: document.querySelector("#character-setup-birth"),
  characterNameNext: document.querySelector("#character-name-next"),
  characterBirthNext: document.querySelector("#character-birth-next"),
  characterBirthPreview: document.querySelector("#character-birth-preview"),
  characterAgeResult: document.querySelector("#character-age-result"),
  characterAgeLabel: document.querySelector("#character-age-label"),
  characterAgeCopy: document.querySelector("#character-age-copy"),
  finishCharacterSetup: document.querySelector("#finish-character-setup"),
  characterSettingsContent: document.querySelector("#character-settings-content"),
  world: document.querySelector("#world"),
  quickbar: document.querySelector("#quickbar"),
  minimizeGame: document.querySelector("#minimize-game"),
  closeGame: document.querySelector("#close-game"),
  exitConfirm: document.querySelector("#exit-confirm"),
  confirmExit: document.querySelector("#confirm-exit"),
  cancelExit: document.querySelector("#cancel-exit"),
  birthdayAlert: document.querySelector("#birthday-alert"),
  birthdayAlertCard: document.querySelector("#birthday-alert-card"),
  birthdayAlertIcon: document.querySelector("#birthday-alert-icon"),
  birthdayAlertKicker: document.querySelector("#birthday-alert-kicker"),
  birthdayAlertTitle: document.querySelector("#birthday-alert-title"),
  birthdayAlertCopy: document.querySelector("#birthday-alert-copy"),
  birthdayAlertNote: document.querySelector("#birthday-alert-note"),
  eventAlertChecklist: document.querySelector("#event-alert-checklist"),
  closeBirthdayAlert: document.querySelector("#close-birthday-alert"),
  confirmBirthdayAlert: document.querySelector("#confirm-birthday-alert"),
  snoozeEventAlert: document.querySelector("#snooze-event-alert"),
  openBirthdayArchive: document.querySelector("#open-birthday-archive"),
  completionCelebration: document.querySelector("#completion-celebration"),
  completionTaskTitle: document.querySelector("#completion-task-title"),
  completionXpReward: document.querySelector("#completion-xp-reward"),
  closeCompletionCelebration: document.querySelector(
    "#close-completion-celebration",
  ),
  openStreakHistory: document.querySelector("#open-streak-history"),
  openTodayHistory: document.querySelector("#open-today-history"),
  openCoinRewards: document.querySelector("#open-coin-rewards"),
  hudCoinBalance: document.querySelector("#hud-coin-balance"),
  openSettings: document.querySelector("#open-settings"),
  activityPanel: document.querySelector("#activity-panel"),
  activityEyebrow: document.querySelector("#activity-eyebrow"),
  activityTitle: document.querySelector("#activity-title"),
  activityContent: document.querySelector("#activity-content"),
  closeActivity: document.querySelector("#close-activity"),
  progressCoinBalance: document.querySelector("#progress-coin-balance"),
  progressTabs: document.querySelectorAll("[data-progress-tab]"),
  achievementCelebration: document.querySelector("#achievement-celebration"),
  achievementCelebrationEyebrow: document.querySelector("#achievement-celebration-eyebrow"),
  achievementCelebrationTitle: document.querySelector("#achievement-celebration-title"),
  achievementMedal: document.querySelector("#achievement-medal"),
  achievementCelebrationName: document.querySelector("#achievement-celebration-name"),
  achievementCelebrationCopy: document.querySelector("#achievement-celebration-copy"),
  achievementCoinReward: document.querySelector("#achievement-coin-reward"),
  achievementCoinRewardBox: document.querySelector("#achievement-coin-reward-box"),
  closeAchievementCelebration: document.querySelector("#close-achievement-celebration"),
  achievementContinue: document.querySelector("#achievement-continue"),
  musicOcarina: document.querySelector("#music-ocarina"),
  musicLabel: document.querySelector("#music-label"),
  movablePlayer: document.querySelector("#movable-player"),
  playerSpriteImage: document.querySelector("#player-sprite-image"),
  petNpcLayer: document.querySelector("#pet-npc-layer"),
  spouseNpc: document.querySelector("#spouse-npc"),
  spouseNpcName: document.querySelector("#spouse-npc-name"),
  collisionLayer: document.querySelector("#collision-layer"),
  worldGrid: document.querySelector("#world-grid"),
  worldModuleLayer: document.querySelector("#world-module-layer"),
  worldBuildToggle: document.querySelector("#world-build-toggle"),
  worldBuilderPanel: document.querySelector("#world-builder-panel"),
  worldModuleInventory: document.querySelector("#world-module-inventory"),
  worldModuleDetailBackdrop: document.querySelector("#world-module-detail-backdrop"),
  worldModuleDetailClose: document.querySelector("#world-module-detail-close"),
  worldModuleDetailIcon: document.querySelector("#world-module-detail-icon"),
  worldModuleDescription: document.querySelector("#world-module-description"),
  worldModuleOpenCount: document.querySelector("#world-module-open-count"),
  worldModuleOpenLabel: document.querySelector("#world-module-open-label"),
  worldModuleDetailMove: document.querySelector("#world-module-detail-move"),
  selectedWorldModuleName: document.querySelector("#selected-world-module-name"),
  worldModuleTitle: document.querySelector("#world-module-title"),
  worldModuleRemove: document.querySelector("#world-module-remove"),
  worldModuleCount: document.querySelector("#world-module-count"),
  panelBackdrop: document.querySelector("#panel-backdrop"),
  sidePanel: document.querySelector("#side-panel"),
  panelHeader: document.querySelector("#panel-header"),
  panelEyebrow: document.querySelector("#panel-eyebrow"),
  panelTitle: document.querySelector("#panel-title"),
  panelClose: document.querySelector("#close-panel"),
  missionView: document.querySelector("#mission-view"),
  missionContent: document.querySelector("#mission-content"),
  boardView: document.querySelector("#board-view"),
  boardImportantList: document.querySelector("#board-important-list"),
  boardLooseList: document.querySelector("#board-loose-list"),
  boardTodayDropZone: document.querySelector("#board-today-drop-zone"),
  boardBacklogDropZone: document.querySelector("#board-backlog-drop-zone"),
  boardDebtAlert: document.querySelector("#board-debt-alert"),
  boardEventAlert: document.querySelector("#board-event-alert"),
  boardQuickForm: document.querySelector("#board-quick-form"),
  boardQuickTitle: document.querySelector("#board-quick-title"),
  boardHeadingTitle: document.querySelector("#board-heading-title"),
  boardTodayMode: document.querySelector("#board-today-mode"),
  boardWeekMode: document.querySelector("#board-week-mode"),
  boardTodayView: document.querySelector("#board-today-view"),
  boardWeekView: document.querySelector("#board-week-view"),
  weekBacklog: document.querySelector("#week-backlog"),
  weekDaysGrid: document.querySelector("#week-days-grid"),
  motivationNote: document.querySelector("#motivation-note"),
  birthdayList: document.querySelector("#birthday-list"),
  birthdayForm: document.querySelector("#birthday-form"),
  birthdayName: document.querySelector("#birthday-name"),
  birthdayDate: document.querySelector("#birthday-date"),
  tasksView: document.querySelector("#tasks-view"),
  projectsView: document.querySelector("#projects-view"),
  profileView: document.querySelector("#profile-view"),
  settingsView: document.querySelector("#settings-view"),
  hubView: document.querySelector("#hub-view"),
  listsView: document.querySelector("#lists-view"),
  drawingView: document.querySelector("#drawing-view"),
  drawingCanvas: document.querySelector("#drawing-canvas"),
  drawingTitle: document.querySelector("#drawing-title"),
  drawingThumbnails: document.querySelector("#drawing-thumbnails"),
  drawingNew: document.querySelector("#drawing-new"),
  drawingSave: document.querySelector("#drawing-save"),
  drawingDelete: document.querySelector("#drawing-delete"),
  drawingUndo: document.querySelector("#drawing-undo"),
  drawingRedo: document.querySelector("#drawing-redo"),
  drawingClear: document.querySelector("#drawing-clear"),
  drawingExport: document.querySelector("#drawing-export"),
  drawingColor: document.querySelector("#drawing-color"),
  drawingSize: document.querySelector("#drawing-size"),
  drawingColors: document.querySelector("#drawing-colors"),
  undergroundHatch: document.querySelector("#underground-hatch"),
  undergroundWorldScene: document.querySelector("#underground-world-scene"),
  undergroundLadderAccess: document.querySelector("#underground-ladder-access"),
  undergroundView: document.querySelector("#underground-view"),
  undergroundForm: document.querySelector("#underground-form"),
  undergroundTitle: document.querySelector("#underground-title"),
  undergroundDetails: document.querySelector("#underground-details"),
  undergroundCategory: document.querySelector("#underground-category"),
  undergroundSearch: document.querySelector("#underground-search"),
  undergroundList: document.querySelector("#underground-list"),
  undergroundCount: document.querySelector("#underground-count"),
  undergroundFormKicker: document.querySelector("#underground-form-kicker"),
  undergroundFormTitle: document.querySelector("#underground-form-title"),
  undergroundSave: document.querySelector("#underground-save"),
  undergroundCancel: document.querySelector("#underground-cancel"),
  quickListCreateForm: document.querySelector("#quick-list-create-form"),
  quickListTypePicker: document.querySelector("#quick-list-type-picker"),
  quickListTitle: document.querySelector("#quick-list-title"),
  quickListTabs: document.querySelector("#quick-list-tabs"),
  quickListSheet: document.querySelector("#quick-list-sheet"),
  hubHomeView: document.querySelector("#hub-home-view"),
  hubAlarmsView: document.querySelector("#hub-alarms-view"),
  hubCalculatorView: document.querySelector("#hub-calculator-view"),
  hubCurrentTime: document.querySelector("#hub-current-time"),
  hubAlarmNavCount: document.querySelector("#hub-alarm-nav-count"),
  hubAlarmHomeCount: document.querySelector("#hub-alarm-home-count"),
  hubTimerNavState: document.querySelector("#hub-timer-nav-state"),
  hubTimerHomeTime: document.querySelector("#hub-timer-home-time"),
  hubAlarmForm: document.querySelector("#hub-alarm-form"),
  hubAlarmLabel: document.querySelector("#hub-alarm-label"),
  hubAlarmTime: document.querySelector("#hub-alarm-time"),
  hubAlarmList: document.querySelector("#hub-alarm-list"),
  hubTimerCard: document.querySelector("#hub-timer-card"),
  hubTimerFace: document.querySelector("#hub-timer-face"),
  hubTimerStatus: document.querySelector("#hub-timer-status"),
  hubTimerDisplay: document.querySelector("#hub-timer-display"),
  hubCustomMinutes: document.querySelector("#hub-custom-minutes"),
  hubUseCustom: document.querySelector("#hub-use-custom"),
  hubTimerStart: document.querySelector("#hub-timer-start"),
  hubTimerReset: document.querySelector("#hub-timer-reset"),
  hubStopwatchFace: document.querySelector("#hub-stopwatch-face"),
  hubStopwatchStatus: document.querySelector("#hub-stopwatch-status"),
  hubStopwatchDisplay: document.querySelector("#hub-stopwatch-display"),
  hubStopwatchStart: document.querySelector("#hub-stopwatch-start"),
  hubStopwatchLap: document.querySelector("#hub-stopwatch-lap"),
  hubStopwatchReset: document.querySelector("#hub-stopwatch-reset"),
  hubStopwatchLaps: document.querySelector("#hub-stopwatch-laps"),
  calculatorForm: document.querySelector("#calculator-form"),
  calculatorExpression: document.querySelector("#calculator-expression"),
  calculatorResult: document.querySelector("#calculator-result"),
  calculatorClear: document.querySelector("#calculator-clear"),
  calculatorBackspace: document.querySelector("#calculator-backspace"),
  puzzleView: document.querySelector("#puzzle-view"),
  learningAcademy: document.querySelector("#learning-academy"),
  learningHub: document.querySelector("#learning-hub"),
  learningDifficulty: document.querySelector("#learning-difficulty"),
  learningBlockGrid: document.querySelector("#learning-block-grid"),
  learningReadyState: document.querySelector("#learning-ready-state"),
  learningSession: document.querySelector("#learning-session"),
  learningBack: document.querySelector("#learning-back"),
  learningLockedDifficulty: document.querySelector("#learning-locked-difficulty"),
  learningFactSession: document.querySelector("#learning-fact-session"),
  learningRiddleSession: document.querySelector("#learning-riddle-session"),
  learningCultureSession: document.querySelector("#learning-culture-session"),
  learningMemorySession: document.querySelector("#learning-memory-session"),
  learningFactComplete: document.querySelector("#learning-fact-complete"),
  dailyRandomFact: document.querySelector("#daily-random-fact"),
  puzzleClock: document.querySelector("#puzzle-clock"),
  puzzleQuestion: document.querySelector("#puzzle-question"),
  puzzleHint: document.querySelector("#puzzle-hint"),
  puzzleAnswer: document.querySelector("#puzzle-answer"),
  puzzleCheck: document.querySelector("#puzzle-check"),
  puzzleFeedback: document.querySelector("#puzzle-feedback"),
  puzzleSolution: document.querySelector("#puzzle-solution"),
  puzzleExplanation: document.querySelector("#puzzle-explanation"),
  puzzleShowHint: document.querySelector("#puzzle-show-hint"),
  puzzleShowSolution: document.querySelector("#puzzle-show-solution"),
  dailyCultureQuestion: document.querySelector("#daily-culture-question"),
  dailyCultureAnswer: document.querySelector("#daily-culture-answer"),
  cultureAnswerInput: document.querySelector("#culture-answer-input"),
  cultureCheck: document.querySelector("#culture-check"),
  cultureFeedback: document.querySelector("#culture-feedback"),
  revealDailyCulture: document.querySelector("#reveal-daily-culture"),
  memoryStudy: document.querySelector("#memory-study"),
  memoryTest: document.querySelector("#memory-test"),
  memorySequence: document.querySelector("#memory-sequence"),
  memoryCountdown: document.querySelector("#memory-countdown"),
  memoryQuestion: document.querySelector("#memory-question"),
  memoryAnswer: document.querySelector("#memory-answer"),
  memoryCheck: document.querySelector("#memory-check"),
  memoryFeedback: document.querySelector("#memory-feedback"),
  hubAlert: document.querySelector("#hub-alert"),
  hubAlertTitle: document.querySelector("#hub-alert-title"),
  hubAlertMessage: document.querySelector("#hub-alert-message"),
  closeHubAlert: document.querySelector("#close-hub-alert"),
  settingsWorldName: document.querySelector("#settings-world-name"),
  cloudSyncBadge: document.querySelector("#cloud-sync-badge"),
  cloudSyncDisconnected: document.querySelector("#cloud-sync-disconnected"),
  cloudSyncConnected: document.querySelector("#cloud-sync-connected"),
  cloudCreateWorld: document.querySelector("#cloud-create-world"),
  cloudWorldCodeInput: document.querySelector("#cloud-world-code-input"),
  cloudConnectWorld: document.querySelector("#cloud-connect-world"),
  cloudStatusLight: document.querySelector("#cloud-status-light"),
  cloudSyncStatus: document.querySelector("#cloud-sync-status"),
  cloudSyncDetail: document.querySelector("#cloud-sync-detail"),
  cloudLastSync: document.querySelector("#cloud-last-sync"),
  cloudWorldCodeOutput: document.querySelector("#cloud-world-code-output"),
  cloudToggleCode: document.querySelector("#cloud-toggle-code"),
  cloudCopyCode: document.querySelector("#cloud-copy-code"),
  cloudSyncNow: document.querySelector("#cloud-sync-now"),
  cloudDownloadWorld: document.querySelector("#cloud-download-world"),
  cloudUploadWorld: document.querySelector("#cloud-upload-world"),
  cloudDeviceSummary: document.querySelector("#cloud-device-summary"),
  cloudDisconnect: document.querySelector("#cloud-disconnect"),
  cloudDeleteCopy: document.querySelector("#cloud-delete-copy"),
  settingsVolume: document.querySelector("#settings-volume"),
  settingsVolumeValue: document.querySelector("#settings-volume-value"),
  settingsMusicEnabled: document.querySelector("#settings-music-enabled"),
  settingsSoundEffectsEnabled: document.querySelector(
    "#settings-sound-effects-enabled",
  ),
  settingsKeyboardMovement: document.querySelector(
    "#settings-keyboard-movement",
  ),
  settingsTouchJoystick: document.querySelector("#settings-touch-joystick"),
  mobileJoystick: document.querySelector("#mobile-joystick"),
  mobileJoystickBase: document.querySelector("#mobile-joystick-base"),
  mobileJoystickKnob: document.querySelector("#mobile-joystick-knob"),
  settingsShortcutsEnabled: document.querySelector(
    "#settings-shortcuts-enabled",
  ),
  settingsQuickAccessPicker: document.querySelector("#settings-quick-access-picker"),
  settingsQuickAccessCount: document.querySelector("#settings-quick-access-count"),
  settingsReducedMotion: document.querySelector("#settings-reduced-motion"),
  settingsHomeReminders: document.querySelector("#settings-home-reminders"),
  settingsStrictFocusMode: document.querySelector("#settings-strict-focus-mode"),
  resetSettings: document.querySelector("#reset-settings"),
  profileContent: document.querySelector("#profile-content"),
  passportPageButtons: document.querySelectorAll("[data-passport-page]"),
  profileAutosaveStatus: document.querySelector("#profile-autosave-status"),
  passportPagePrevious: document.querySelector("#passport-page-previous"),
  passportPageNext: document.querySelector("#passport-page-next"),
  passportPageIndicator: document.querySelector("#passport-page-indicator"),
  profileForm: document.querySelector("#profile-form"),
  profileHeroName: document.querySelector("#profile-hero-name"),
  profileAgeCopy: document.querySelector("#profile-age-copy"),
  profileLevelValue: document.querySelector("#profile-level-value"),
  profileName: document.querySelector("#profile-name"),
  profileBirthDate: document.querySelector("#profile-birth-date"),
  profileDocument: document.querySelector("#profile-document"),
  profileEmail: document.querySelector("#profile-email"),
  profileMarried: document.querySelector("#profile-married"),
  profileSpouseName: document.querySelector("#profile-spouse-name"),
  profileSpouseBirthDate: document.querySelector("#profile-spouse-birth-date"),
  profileDatingStartDate: document.querySelector("#profile-dating-start-date"),
  profileWeddingDate: document.querySelector("#profile-wedding-date"),
  profileHomeName: document.querySelector("#profile-home-name"),
  profileHomeType: document.querySelector("#profile-home-type"),
  profileHomeAddress: document.querySelector("#profile-home-address"),
  profileHomeCity: document.querySelector("#profile-home-city"),
  profileHomeRegion: document.querySelector("#profile-home-region"),
  profileHomeCountry: document.querySelector("#profile-home-country"),
  profileHomePostalCode: document.querySelector("#profile-home-postal-code"),
  profileHomeSinceDate: document.querySelector("#profile-home-since-date"),
  profileHomeDetails: document.querySelector("#profile-home-details"),
  profileWorkEnabled: document.querySelector("#profile-work-enabled"),
  profileWorkFields: document.querySelector("#profile-work-fields"),
  profileWorkEmpty: document.querySelector("#profile-work-empty"),
  profileWorkIcon: document.querySelector("#profile-work-icon"),
  profileWorkLabel: document.querySelector("#profile-work-label"),
  profileWorkCompany: document.querySelector("#profile-work-company"),
  profileWorkRole: document.querySelector("#profile-work-role"),
  profileWorkStartDate: document.querySelector("#profile-work-start-date"),
  profileWorkDetails: document.querySelector("#profile-work-details"),
  profileDatingElapsed: document.querySelector("#profile-dating-elapsed"),
  profileWeddingElapsed: document.querySelector("#profile-wedding-elapsed"),
  spouseField: document.querySelector("#spouse-field"),
  marriedIcon: document.querySelector("#married-icon"),
  marriedLabel: document.querySelector("#married-label"),
  addPet: document.querySelector("#add-pet"),
  petList: document.querySelector("#pet-list"),
  profilePartnerPhoto: document.querySelector("#profile-partner-photo"),
  profileCoupleCaption: document.querySelector("#profile-couple-caption"),
  changePartnerPortrait: document.querySelector("#change-partner-portrait"),
  partnerWizard: document.querySelector("#partner-wizard"),
  closePartnerWizard: document.querySelector("#close-partner-wizard"),
  confirmPartnerWizard: document.querySelector("#confirm-partner-wizard"),
  partnerWizardName: document.querySelector("#partner-wizard-name"),
  partnerWizardBirth: document.querySelector("#partner-wizard-birth"),
  partnerWizardDating: document.querySelector("#partner-wizard-dating"),
  partnerWizardWedding: document.querySelector("#partner-wizard-wedding"),
  partnerWizardPreview: document.querySelector("#partner-wizard-preview"),
  partnerWizardCaption: document.querySelector("#partner-wizard-caption"),
  partnerOptionGrid: document.querySelector("#partner-option-grid"),
  petWizard: document.querySelector("#pet-wizard"),
  closePetWizard: document.querySelector("#close-pet-wizard"),
  confirmPetWizard: document.querySelector("#confirm-pet-wizard"),
  petWizardName: document.querySelector("#pet-wizard-name"),
  petWizardBirth: document.querySelector("#pet-wizard-birth"),
  petWizardPreview: document.querySelector("#pet-wizard-preview"),
  petSpeciesPicker: document.querySelector("#pet-species-picker"),
  petOptionGrid: document.querySelector("#pet-option-grid"),
  financeView: document.querySelector("#finance-view"),
  creativityView: document.querySelector("#creativity-view"),
  creativityContent: document.querySelector("#creativity-view .creativity-content"),
  agendaView: document.querySelector("#agenda-view"),
  calendarView: document.querySelector("#calendar-view"),
  calendarTitle: document.querySelector("#calendar-title"),
  calendarGrid: document.querySelector("#calendar-grid"),
  persistentReminder: document.querySelector("#persistent-reminder"),
  eventReminder: document.querySelector("#event-reminder"),
  eventReminderDays: document.querySelector("#event-reminder-days"),
  eventReminderUnit: document.querySelector("#event-reminder-unit"),
  eventReminderTitle: document.querySelector("#event-reminder-title"),
  birthdayReminder: document.querySelector("#birthday-reminder"),
  birthdayReminderDays: document.querySelector("#birthday-reminder-days"),
  birthdayReminderUnit: document.querySelector("#birthday-reminder-unit"),
  birthdayReminderTitle: document.querySelector("#birthday-reminder-title"),
  agendaNextReminder: document.querySelector("#agenda-next-reminder"),
  eventForm: document.querySelector("#event-form"),
  openEventForm: document.querySelector("#open-event-form"),
  openBirthdayForm: document.querySelector("#open-birthday-form"),
  eventTitle: document.querySelector("#event-title"),
  eventDate: document.querySelector("#event-date"),
  eventNotes: document.querySelector("#event-notes"),
  eventChecklistInput: document.querySelector("#event-checklist-input"),
  eventChecklistAdd: document.querySelector("#event-checklist-add"),
  eventChecklistCount: document.querySelector("#event-checklist-count"),
  eventChecklistItems: document.querySelector("#event-checklist-items"),
  eventList: document.querySelector("#event-list"),
  agendaEventCount: document.querySelector("#agenda-event-count"),
  pastEvents: document.querySelector("#past-events"),
  pastEventsSummary: document.querySelector("#past-events-summary"),
  pastEventList: document.querySelector("#past-event-list"),
  agendaBirthdayForm: document.querySelector("#agenda-birthday-form"),
  agendaBirthdayName: document.querySelector("#agenda-birthday-name"),
  agendaBirthdayDate: document.querySelector("#agenda-birthday-date"),
  agendaBirthdayNotes: document.querySelector("#agenda-birthday-notes"),
  agendaBirthdayList: document.querySelector("#agenda-birthday-list"),
  agendaBirthdayCount: document.querySelector("#agenda-birthday-count"),
  eventSubmitLabel: document.querySelector("#event-submit-label"),
  cancelEventEdit: document.querySelector("#cancel-event-edit"),
  birthdaySubmitLabel: document.querySelector("#birthday-submit-label"),
  cancelBirthdayEdit: document.querySelector("#cancel-birthday-edit"),
  newWritingForm: document.querySelector("#new-writing-form"),
  newWritingTitle: document.querySelector("#new-writing-title"),
  writingProjectList: document.querySelector("#writing-project-list"),
  writingEditor: document.querySelector("#writing-editor"),
  writingBackLibrary: document.querySelector("#writing-back-library"),
  writingTitle: document.querySelector("#writing-title"),
  writingContent: document.querySelector("#writing-content"),
  scriptContextMenu: document.querySelector("#script-context-menu"),
  writingWordCount: document.querySelector("#writing-word-count"),
  writingPrevPage: document.querySelector("#writing-prev-page"),
  writingNextPage: document.querySelector("#writing-next-page"),
  copyWritingDocument: document.querySelector("#copy-writing-document"),
  writingPageCurrent: document.querySelector("#writing-page-current"),
  writingPageTotal: document.querySelector("#writing-page-total"),
  emptyWriting: document.querySelector("#empty-writing"),
  closeCreativity: document.querySelector("#close-creativity"),
  focusTimer: document.querySelector("#focus-timer"),
  focusTime: document.querySelector("#focus-time"),
  focusStatus: document.querySelector("#focus-status"),
  focusStart: document.querySelector("#focus-start"),
  focusReset: document.querySelector("#focus-reset"),
  writingSessionMini: document.querySelector("#writing-session-mini"),
  taskList: document.querySelector("#task-list"),
  projectGrid: document.querySelector("#project-grid"),
  workProjectCount: document.querySelector("#work-project-count"),
  personalProjectCount: document.querySelector("#personal-project-count"),
  toggleProjectForm: document.querySelector("#toggle-project-form"),
  newProjectForm: document.querySelector("#new-project-form"),
  newProjectAreaLabel: document.querySelector("#new-project-area-label"),
  newProjectName: document.querySelector("#new-project-name"),
  newProjectCode: document.querySelector("#new-project-code"),
  newProjectDescription: document.querySelector("#new-project-description"),
  projectColorPicker: document.querySelector("#project-color-picker"),
  filterChip: document.querySelector("#filter-chip"),
  questBreadcrumb: document.querySelector("#quest-breadcrumb"),
  backProjects: document.querySelector("#back-projects"),
  quickTaskForm: document.querySelector("#quick-task-form"),
  quickTaskTitle: document.querySelector("#quick-task-title"),
  quickTaskContext: document.querySelector("#quick-task-context"),
  financeForm: document.querySelector("#finance-form"),
  financeType: document.querySelector("#finance-type"),
  financeName: document.querySelector("#finance-name"),
  financeAmount: document.querySelector("#finance-amount"),
  financeNotes: document.querySelector("#finance-notes"),
  financeList: document.querySelector("#finance-list"),
  cofferHomeTab: document.querySelector("#coffer-home-tab"),
  cofferFinanceTab: document.querySelector("#coffer-finance-tab"),
  cofferPasswordTab: document.querySelector("#coffer-password-tab"),
  cofferNotesTab: document.querySelector("#coffer-notes-tab"),
  cofferInventoryHome: document.querySelector("#coffer-inventory-home"),
  cofferInventoryCount: document.querySelector("#coffer-inventory-count"),
  cofferFinanceCount: document.querySelector("#coffer-finance-count"),
  cofferNotesCount: document.querySelector("#coffer-notes-count"),
  financeMoneySection: document.querySelector("#finance-money-section"),
  passwordVaultSection: document.querySelector("#password-vault-section"),
  cofferNotesSection: document.querySelector("#coffer-notes-section"),
  cofferNoteForm: document.querySelector("#coffer-note-form"),
  cofferNoteEditId: document.querySelector("#coffer-note-edit-id"),
  cofferNoteTitle: document.querySelector("#coffer-note-title"),
  cofferNoteContent: document.querySelector("#coffer-note-content"),
  cofferNoteEyebrow: document.querySelector("#coffer-note-eyebrow"),
  cancelCofferNoteEdit: document.querySelector("#cancel-coffer-note-edit"),
  saveCofferNote: document.querySelector("#save-coffer-note"),
  cofferNoteLedgerCount: document.querySelector("#coffer-note-ledger-count"),
  cofferNoteList: document.querySelector("#coffer-note-list"),
  passwordVaultGate: document.querySelector("#password-vault-gate"),
  passwordVaultContent: document.querySelector("#password-vault-content"),
  vaultGateTitle: document.querySelector("#vault-gate-title"),
  vaultMasterForm: document.querySelector("#vault-master-form"),
  vaultMasterPassword: document.querySelector("#vault-master-password"),
  vaultMasterConfirm: document.querySelector("#vault-master-confirm"),
  vaultMasterConfirmField: document.querySelector("#vault-master-confirm-field"),
  vaultMasterSubmit: document.querySelector("#vault-master-submit"),
  vaultError: document.querySelector("#vault-error"),
  lockPasswordVault: document.querySelector("#lock-password-vault"),
  deletePasswordVault: document.querySelector("#delete-password-vault"),
  vaultDeleteConfirm: document.querySelector("#vault-delete-confirm"),
  cancelDeletePasswordVault: document.querySelector(
    "#cancel-delete-password-vault",
  ),
  confirmDeletePasswordVault: document.querySelector(
    "#confirm-delete-password-vault",
  ),
  passwordCount: document.querySelector("#password-count"),
  passwordLedgerCount: document.querySelector("#password-ledger-count"),
  passwordEntryForm: document.querySelector("#password-entry-form"),
  passwordEditId: document.querySelector("#password-edit-id"),
  passwordService: document.querySelector("#password-service"),
  passwordUsername: document.querySelector("#password-username"),
  passwordSecret: document.querySelector("#password-secret"),
  passwordUrl: document.querySelector("#password-url"),
  passwordNotes: document.querySelector("#password-notes"),
  passwordFormEyebrow: document.querySelector("#password-form-eyebrow"),
  passwordFormTitle: document.querySelector("#password-form-title"),
  savePasswordEntry: document.querySelector("#save-password-entry"),
  cancelPasswordEdit: document.querySelector("#cancel-password-edit"),
  toggleFormPassword: document.querySelector("#toggle-form-password"),
  generatePassword: document.querySelector("#generate-password"),
  passwordList: document.querySelector("#password-list"),
  modal: document.querySelector("#task-modal"),
  renameModal: document.querySelector("#rename-modal"),
  renameForm: document.querySelector("#rename-form"),
  renameTitle: document.querySelector("#rename-title"),
  renameInput: document.querySelector("#rename-input"),
  deleteProjectFromRename: document.querySelector("#delete-project-from-rename"),
  projectDeleteConfirm: document.querySelector("#project-delete-confirm"),
  projectDeleteName: document.querySelector("#project-delete-name"),
  cancelProjectDelete: document.querySelector("#cancel-project-delete"),
  confirmProjectDelete: document.querySelector("#confirm-project-delete"),
  writingDeleteConfirm: document.querySelector("#writing-delete-confirm"),
  writingDeleteProjectTitle: document.querySelector("#writing-delete-project-title"),
  cancelWritingDelete: document.querySelector("#cancel-writing-delete"),
  confirmWritingDelete: document.querySelector("#confirm-writing-delete"),
  form: document.querySelector("#task-form"),
  taskTitle: document.querySelector("#task-title"),
  taskDetails: document.querySelector("#task-details"),
  taskDetailCreated: document.querySelector("#task-detail-created"),
  taskDetailCreatedValue: document.querySelector("#task-detail-created-value"),
  taskArea: document.querySelector("#task-area"),
  taskProject: document.querySelector("#task-project"),
  taskPriorityHigh: document.querySelector("#task-priority-high"),
  taskModalEyebrow: document.querySelector("#task-modal-eyebrow"),
  taskModalTitle: document.querySelector("#task-modal-title"),
  taskSubmitLabel: document.querySelector("#task-submit-label"),
  taskFormDelete: document.querySelector("#task-form-delete"),
  toast: document.querySelector("#toast"),
};

seedProgressFromLegacyTasks();

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function markCloudChange() {
  cloudSync?.markLocalChange();
}

function formatCloudSyncTime(value) {
  if (!value) return "TODAVÍA SIN SINCRONIZAR";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "TODAVÍA SIN SINCRONIZAR";
  return `ÚLTIMA COPIA ${new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)}`.toUpperCase();
}

function normalizeProgressState(value) {
  const source = value && typeof value === "object" ? value : {};
  const history = Array.isArray(source.completionHistory)
    ? source.completionHistory
        .filter(
          (entry) =>
            entry &&
            typeof entry.id === "string" &&
            typeof entry.title === "string" &&
            typeof entry.completedAt === "string",
        )
        .slice(-5000)
    : [];
  return {
    version: 2,
    totalTasksCreated: Math.max(0, Number(source.totalTasksCreated) || 0),
    completionHistory: history,
    bestStreak: Math.max(0, Number(source.bestStreak) || 0),
    claimedAchievements: Array.isArray(source.claimedAchievements)
      ? [...new Set(source.claimedAchievements.filter((id) => typeof id === "string"))]
      : [],
    currency: Math.max(0, Number(source.currency) || 0),
    unlockedRewards: Array.isArray(source.unlockedRewards)
      ? [...new Set(source.unlockedRewards.filter((id) => typeof id === "string"))]
      : [],
  };
}

function progressMetric(metric) {
  if (metric === "created") return progressState.totalTasksCreated;
  if (metric === "completed") return progressState.completionHistory.length;
  if (metric === "streak") return progressBestStreak();
  return 0;
}

function completionDayKeys() {
  return [...new Set(progressState.completionHistory
    .map((entry) => todayKey(new Date(entry.completedAt)))
    .filter(Boolean))].sort();
}

function longestCompletionStreak() {
  const keys = completionDayKeys();
  let best = 0;
  let current = 0;
  let previous = null;
  for (const key of keys) {
    const stamp = Date.parse(`${key}T12:00:00Z`);
    if (!Number.isFinite(stamp)) continue;
    current = previous !== null && stamp - previous === 86_400_000 ? current + 1 : 1;
    best = Math.max(best, current);
    previous = stamp;
  }
  return best;
}

function progressBestStreak() {
  return Math.max(
    Number(progressState.bestStreak) || 0,
    Number(profile.streak) || 0,
    longestCompletionStreak(),
  );
}

function updateBestStreak() {
  const next = progressBestStreak();
  if (next <= progressState.bestStreak) return false;
  progressState.bestStreak = next;
  return true;
}

function persistProgress() {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressState));
  markCloudChange();
}

function recordTaskCreated(amount = 1) {
  progressState.totalTasksCreated += Math.max(0, Number(amount) || 0);
  unlockEarnedAchievements();
  persistProgress();
  if (
    achievementQueue.length &&
    elements.completionCelebration.classList.contains("hidden")
  ) {
    showNextAchievementCelebration();
  }
}

function recordTaskCompletion(task) {
  const completedAt = task.completedAt || new Date().toISOString();
  progressState.completionHistory.push({
    id: `${task.id}-${completedAt}-${crypto.randomUUID?.() || Date.now()}`,
    taskId: task.id,
    title: task.title,
    project: task.project || "Tarea suelta",
    completedAt,
    xpReward: Number(task.xpReward) || 0,
  });
  progressState.completionHistory = progressState.completionHistory.slice(-5000);
  updateBestStreak();
  unlockEarnedAchievements();
  persistProgress();
}

function unlockEarnedAchievements({ silent = false } = {}) {
  const claimed = new Set(progressState.claimedAchievements);
  const unlocked = ACHIEVEMENT_DEFINITIONS.filter(
    (achievement) =>
      !claimed.has(achievement.id) &&
      progressMetric(achievement.metric) >= achievement.target,
  );
  if (!unlocked.length) return [];
  for (const achievement of unlocked) {
    claimed.add(achievement.id);
    progressState.currency += achievement.coins;
    if (!silent) achievementQueue.push(achievement);
  }
  progressState.claimedAchievements = [...claimed];
  return unlocked;
}

function seedProgressFromLegacyTasks() {
  let changed = false;
  if (progressState.totalTasksCreated < tasks.length) {
    progressState.totalTasksCreated = tasks.length;
    changed = true;
  }
  if (!progressState.completionHistory.length) {
    const legacyCompleted = tasks
      .filter((task) => task.completedAt)
      .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
    if (legacyCompleted.length) {
      progressState.completionHistory = legacyCompleted.map((task) => ({
        id: `legacy-${task.id}-${task.completedAt}`,
        taskId: task.id,
        title: task.title,
        project: task.project || "Tarea suelta",
        completedAt: task.completedAt,
        xpReward: Number(task.xpReward) || 0,
      }));
      changed = true;
    }
  }
  if (unlockEarnedAchievements({ silent: true }).length) changed = true;
  if (updateBestStreak()) changed = true;
  if (changed) localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressState));
}

function readStoredTasks() {
  const stored = readJson(TASKS_KEY, []);
  let migrated = false;
  const normalized = (Array.isArray(stored) ? stored : []).map((task, index) => {
    const needsDestination =
      task.area === "general" || !String(task.project || "").trim();
    if (needsDestination) migrated = true;
    return {
      ...task,
      area: needsDestination ? MISSION_BACKPACK_AREA : task.area,
      project: needsDestination ? MISSION_BACKPACK_PROJECT : task.project,
      status: task.status === "progress" ? "todo" : task.status,
      parentId: task.parentId ?? null,
      isQuest: Boolean(task.isQuest),
      isToday: Boolean(task.isToday),
      scheduledDate: task.scheduledDate || (task.isToday ? todayKey() : ""),
      sortOrder: Number.isFinite(Number(task.sortOrder))
        ? Number(task.sortOrder)
        : index + 1,
      createdAt: task.createdAt || new Date().toISOString(),
    };
  });
  if (migrated) localStorage.setItem(TASKS_KEY, JSON.stringify(normalized));
  return normalized;
}

function readStoredProfile() {
  const stored = readJson(PROFILE_KEY, {});
  const nextProfile = {
    xp: 0,
    level: 1,
    streak: 0,
    lastActive: null,
    name: "",
    birthDate: "",
    document: "",
    email: "",
    married: false,
    spouseName: "",
    spouseBirthDate: "",
    datingStartDate: "",
    weddingDate: "",
    spouseAppearance: "dark",
    pets: [],
    homeName: "",
    homeType: "",
    homeAddress: "",
    homeCity: "",
    homeRegion: "",
    homeCountry: "",
    homePostalCode: "",
    homeSinceDate: "",
    homeDetails: "",
    workEnabled: false,
    workCompany: "",
    workRole: "",
    workStartDate: "",
    workDetails: "",
    ...(stored && typeof stored === "object" ? stored : {}),
  };
  nextProfile.pets = Array.isArray(nextProfile.pets)
    ? nextProfile.pets.map((pet) => ({
      ...pet,
      birthDate: String(pet.birthDate || ""),
      species: normalizedPetSpecies(pet.species),
      appearance: String(pet.appearance || defaultPetAppearance(pet.species)),
      }))
    : [];
  return nextProfile;
}

function readStoredSettings() {
  const stored = readJson(SETTINGS_KEY, {});
  const nextSettings = {
    ...DEFAULT_SETTINGS,
    ...(stored && typeof stored === "object" ? stored : {}),
  };
  nextSettings.volume = Math.min(100, Math.max(0, Number(nextSettings.volume) || 0));
  nextSettings.worldName =
    String(nextSettings.worldName || "Mi mundo NOK").trim().slice(0, 40) ||
    "Mi mundo NOK";
  nextSettings.avatarStyle =
    nextSettings.avatarStyle === "adventurer-female"
      ? "adventurer-female"
      : "adventurer";
  nextSettings.characterGender =
    nextSettings.characterGender === "female" || nextSettings.avatarStyle === "adventurer-female"
      ? "female"
      : "male";
  nextSettings.characterHair = ["brown", "black", "blonde", "red"].includes(nextSettings.characterHair)
    ? nextSettings.characterHair
    : "brown";
  nextSettings.characterAgeOverride = ["teen", "young", "adult", "elder"].includes(nextSettings.characterAgeOverride)
    ? nextSettings.characterAgeOverride
    : "";
  nextSettings.characterSetupComplete = nextSettings.characterSetupComplete === true;
  nextSettings.avatarStyle = nextSettings.characterGender === "female" ? "adventurer-female" : "adventurer";
  nextSettings.worldTheme = nextSettings.worldTheme === "earth" ? "earth" : "fantasy";
  for (const key of [
    "musicEnabled",
    "soundEffectsEnabled",
    "keyboardMovement",
    "touchJoystickEnabled",
    "shortcutsEnabled",
    "reducedMotion",
    "showHomeReminders",
    "strictFocusMode",
  ]) {
    nextSettings[key] = Boolean(nextSettings[key]);
  }
  const storedQuickAccess = Array.isArray(nextSettings.quickAccess)
    ? nextSettings.quickAccess
    : DEFAULT_SETTINGS.quickAccess;
  nextSettings.quickAccess = [...new Set(storedQuickAccess)]
    .filter((id) => QUICK_ACCESS_DEFINITIONS.some((definition) => definition.id === id))
    .slice(0, MAX_QUICK_ACCESS);
  nextSettings.worldPropPositions = normalizeWorldPropPositions(nextSettings.worldPropPositions);
  return nextSettings;
}

function normalizeQuickLists(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (list) =>
        list &&
        typeof list.id === "string" &&
        typeof list.title === "string" &&
        Array.isArray(list.items),
    )
    .map((list) => ({
      ...list,
      title: String(list.title).trim().slice(0, 80) || "Lista sin nombre",
      type: ["checklist", "ranking", "notes"].includes(String(list.type))
        ? String(list.type)
        : "checklist",
      note: typeof list.note === "string" ? list.note.slice(0, 20000) : "",
      items: list.items
        .filter(
          (item) =>
            item &&
            typeof item.id === "string" &&
            typeof item.text === "string",
        )
        .map((item) => ({
          ...item,
          text: String(item.text).trim().slice(0, 160),
          checked: Boolean(item.checked),
        })),
    }));
}

function quickListId(prefix) {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeDrawings(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((idea) => idea && typeof idea.id === "string" && typeof idea.title === "string" && typeof idea.image === "string" && idea.image.startsWith("data:image/"))
    .map((idea) => ({
      ...idea,
      title: idea.title.trim().slice(0, 80) || "Idea sin nombre",
      createdAt: typeof idea.createdAt === "string" ? idea.createdAt : new Date().toISOString(),
      updatedAt: typeof idea.updatedAt === "string" ? idea.updatedAt : new Date().toISOString(),
    }))
    .slice(0, 30);
}

function drawingId() {
  if (globalThis.crypto?.randomUUID) return `drawing-${crypto.randomUUID()}`;
  return `drawing-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isNativeMobileApp() { return false; }

function renderCloudSync(status = cloudUiState) {
  if (!cloudSync) return;
  cloudUiState = status || {
    ...cloudSync.publicState,
    state: cloudSync.connected ? "waiting" : "disconnected",
    detail: cloudSync.connected
      ? "La nube está lista."
      : "Esta partida vive solamente en este dispositivo.",
  };
  const state = cloudUiState.state || "waiting";
  const connected = Boolean(cloudUiState.connected);
  const labels = {
    unavailable: "SERVICIO NO CONFIGURADO",
    disconnected: "SOLO ESTE DISPOSITIVO",
    waiting: "NUBE LISTA",
    pending: "CAMBIOS PENDIENTES",
    syncing: "SINCRONIZANDO…",
    synced: "MUNDO SINCRONIZADO",
    offline: "MODO SIN CONEXIÓN",
    error: "REVISAR SINCRONIZACIÓN",
  };

  elements.cloudSyncDisconnected.classList.toggle("hidden", connected);
  elements.cloudSyncConnected.classList.toggle("hidden", !connected);
  elements.cloudSyncBadge.classList.toggle("connected", connected);
  elements.cloudSyncBadge.textContent = connected ? "NUBE ACTIVA" : labels[state];
  elements.cloudSyncStatus.textContent = labels[state] || "NUBE LISTA";
  elements.cloudSyncDetail.textContent = cloudUiState.detail || "Esperando cambios.";
  elements.cloudStatusLight.className = `cloud-status-light ${state}`;
  elements.cloudLastSync.textContent = formatCloudSyncTime(cloudUiState.lastSyncAt);
  elements.cloudWorldCodeOutput.value = activePairingCode;

  const endpointReady = Boolean(cloudUiState.endpointReady);
  elements.cloudCreateWorld.disabled = !endpointReady || state === "syncing";
  elements.cloudConnectWorld.disabled = !endpointReady || state === "syncing";
  elements.cloudSyncNow.disabled = state === "syncing";
  elements.cloudDownloadWorld.disabled = state === "syncing";
  elements.cloudUploadWorld.disabled = state === "syncing";
  elements.cloudCopyCode.disabled = !activePairingCode;
  const worldId = String(cloudUiState.code || "").split(".")[1] || "";
  const worldFingerprint = worldId.slice(0, 6).toUpperCase() || "------";
  elements.cloudDeviceSummary.textContent = connected
    ? `WEB · MUNDO ${worldFingerprint} · ÚLTIMA VERSIÓN APLICADA V${cloudUiState.version || 0} · ${tasks.length} MISIONES · ${profile.name || "SIN PERSONAJE"} NIVEL ${profile.level || 1}`
    : "";
}

function recoverWorldCollapsedByLegacySync() {
  if (localStorage.getItem(COLLAPSED_WORLD_RECOVERY_KEY)) return false;
  const storedLayout = normalizeWorldLayout(
    readJson(WORLD_LAYOUT_KEY, null),
    false,
    settings.worldTheme,
  );
  const placedCount = storedLayout.modules.filter((module) => module.placed).length;
  const establishedWorld = tasks.length >= 5 || Number(profile.level || 1) >= 5;
  if (placedCount > 1 || !establishedWorld) {
    localStorage.setItem(
      COLLAPSED_WORLD_RECOVERY_KEY,
      JSON.stringify({ checkedAt: new Date().toISOString(), recovered: false }),
    );
    return false;
  }

  const recoveredLayout = normalizeWorldLayout(null, true, settings.worldTheme);
  for (const recoveredModule of recoveredLayout.modules) {
    const previous = storedLayout.modules.find((module) => module.id === recoveredModule.id);
    if (previous?.title) recoveredModule.title = previous.title;
  }
  worldLayout = sanitizeWorldLayout(recoveredLayout, settings.worldTheme);
  localStorage.setItem(WORLD_LAYOUT_KEY, JSON.stringify(worldLayout));

  const storedSettings = readJson(SETTINGS_KEY, {});
  if (!Array.isArray(storedSettings.quickAccess) || storedSettings.quickAccess.length <= 1) {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ ...storedSettings, quickAccess: [...DEFAULT_SETTINGS.quickAccess] }),
    );
    settings = readStoredSettings();
  }
  localStorage.setItem(
    COLLAPSED_WORLD_RECOVERY_KEY,
    JSON.stringify({ checkedAt: new Date().toISOString(), recovered: true }),
  );
  applySettings();
  renderWorldBuilder();
  cloudSync?.markLocalChange();
  showToast("Recuperamos los portales y accesos que había borrado la versión anterior.");
  return true;
}

function initializeCloudSync() {
  if (!window.NokCloudSync) return;
  const cloudConfig = window.NOK_CLOUD_CONFIG || {};
  cloudSync = new window.NokCloudSync({
    endpoint: cloudConfig.endpoint,
    siteAuthorization: cloudConfig.siteAuthorization,
    keys: CLOUD_SYNCED_KEYS,
    onStatus: renderCloudSync,
    onRemoteApplied: applyCloudStateToRuntime,
  });
  renderCloudSync();
  const bootstrapWorldCode = String(cloudConfig.bootstrapWorldCode || "").trim();
  // The bundled world is only a first-run recovery path. Once the player
  // explicitly links a phone with a six-character code, never replace that
  // chosen world on the next launch.
  if (isNativeMobileApp() && bootstrapWorldCode && !cloudSync.code) {
    window.setTimeout(async () => {
      try {
        const linked = await cloudSync.connectExisting(bootstrapWorldCode);
        if (linked) {
          localStorage.setItem(MOBILE_CLOUD_RECOVERY_KEY, new Date().toISOString());
        }
      } catch (error) {
        showToast(error instanceof Error ? error.message : "No se pudo abrir el mundo de la PC.");
        renderCloudSync();
      }
    }, 100);
    return;
  }
  cloudSync.start();
  recoverWorldCollapsedByLegacySync();
  if (
    isNativeMobileApp() &&
    cloudSync.connected &&
    !localStorage.getItem(MOBILE_CLOUD_RECOVERY_KEY)
  ) {
    window.setTimeout(async () => {
      // Nunca reemplazamos a ciegas la partida local: la recuperación inicial
      // usa el mismo conciliador de versiones que cualquier sincronización.
      const restored = await cloudSync.sync();
      if (restored) {
        localStorage.setItem(MOBILE_CLOUD_RECOVERY_KEY, new Date().toISOString());
      }
    }, 1_000);
  }
}

function bytesToBase64(bytes) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return window.btoa(binary);
}

function base64ToBytes(value) {
  const binary = window.atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function derivePasswordVaultKey(password, salt) {
  const material = await window.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: PASSWORD_VAULT_ITERATIONS,
      hash: "SHA-256",
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function encryptPasswordVault(entries, password) {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await derivePasswordVaultKey(password, salt);
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(JSON.stringify(entries)),
  );
  return JSON.stringify({
    version: 1,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(encrypted)),
  });
}

async function decryptPasswordVault(payload, password) {
  const parsed = JSON.parse(payload);
  if (
    parsed.version !== 1 ||
    !parsed.salt ||
    !parsed.iv ||
    !parsed.ciphertext
  ) {
    throw new Error("Formato de bóveda inválido.");
  }
  const salt = base64ToBytes(parsed.salt);
  const iv = base64ToBytes(parsed.iv);
  const key = await derivePasswordVaultKey(password, salt);
  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    base64ToBytes(parsed.ciphertext),
  );
  const entries = JSON.parse(new TextDecoder().decode(decrypted));
  if (!Array.isArray(entries)) throw new Error("Contenido de bóveda inválido.");
  return entries;
}

function generateStrongPassword(length = 20) {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*+-_";
  const limit = Math.floor(0x100000000 / alphabet.length) * alphabet.length;
  let result = "";
  while (result.length < length) {
    const values = window.crypto.getRandomValues(new Uint32Array(length));
    for (const value of values) {
      if (value >= limit) continue;
      result += alphabet[value % alphabet.length];
      if (result.length === length) break;
    }
  }
  return result;
}

function ageFromBirthDate(value) {
  if (!value) return null;
  const [year, month, day] = String(value).split("-").map(Number);
  if (!year || !month || !day) return null;
  const today = new Date();
  let age = today.getFullYear() - year;
  if (
    today.getMonth() + 1 < month ||
    (today.getMonth() + 1 === month && today.getDate() < day)
  ) {
    age -= 1;
  }
  return age >= 0 && age <= 130 ? age : null;
}

function save() {
  profile.level = ageFromBirthDate(profile.birthDate) ?? profile.level;
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  localStorage.setItem(FINANCE_KEY, JSON.stringify(financeEntries));
  localStorage.setItem(COFFER_NOTES_KEY, JSON.stringify(cofferNotes));
  localStorage.setItem(BIRTHDAYS_KEY, JSON.stringify(birthdays));
  localStorage.setItem(WRITING_KEY, JSON.stringify(writingProjects));
  localStorage.setItem(EVENTS_KEY, JSON.stringify(importantEvents));
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(customProjects));
  localStorage.setItem(PROJECT_RENAMES_KEY, JSON.stringify(projectRenames));
  localStorage.setItem(HUB_ALARMS_KEY, JSON.stringify(hubAlarms));
  localStorage.setItem(QUICK_LISTS_KEY, JSON.stringify(quickLists));
  localStorage.setItem(DRAWINGS_KEY, JSON.stringify(drawingIdeas));
  localStorage.setItem(UNDERGROUND_ITEMS_KEY, JSON.stringify(undergroundItems));
  localStorage.setItem(DAILY_PLAN_KEY, JSON.stringify(dailyPlan));
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressState));
  markCloudChange();
  renderHud();
  renderReminder();
}

function characterAgeGroupFromAge(age) {
  if (age !== null && age >= 12 && age <= 18) return "teen";
  if (age !== null && age >= 19 && age <= 35) return "young";
  if (age !== null && age >= 36 && age <= 65) return "adult";
  if (age !== null && age >= 66 && age <= 99) return "elder";
  return "young";
}

function avatarCustomizationUnlocked() {
  return progressState.unlockedRewards.includes("avatar-freedom") ||
    progressState.unlockedRewards.includes("avatar-explorer");
}

function activeCharacterAgeGroup() {
  const automatic = characterAgeGroupFromAge(ageFromBirthDate(profile.birthDate));
  return avatarCustomizationUnlocked() && settings.characterAgeOverride
    ? settings.characterAgeOverride
    : automatic;
}

function characterAtlasPath(gender = settings.characterGender, hair = settings.characterHair) {
  const suffix = hair === "brown" ? "" : `-${hair}`;
  return `./art/player-age-${gender}${suffix}.webp`;
}

function characterAtlasCell(ageGroup, direction = "down", frame = 0) {
  const baseColumn = ageGroup === "young" || ageGroup === "elder" ? 4 : 0;
  const baseRow = ageGroup === "adult" || ageGroup === "elder" ? 4 : 0;
  const column = baseColumn + Math.max(0, Math.min(3, frame));
  const row = baseRow + PLAYER_DIRECTIONS[direction];
  return `${(column * 100) / 7}% ${(row * 100) / 7}%`;
}

function applyCharacterPreview(element, gender = settings.characterGender, hair = settings.characterHair, ageGroup = activeCharacterAgeGroup()) {
  if (!element) return;
  element.style.backgroundImage = `url(${characterAtlasPath(gender, hair)})`;
  element.style.backgroundSize = "800% 800%";
  element.style.backgroundPosition = characterAtlasCell(ageGroup, "down", 0);
}

function relationshipElapsed(value) {
  if (!value) return "FECHA PENDIENTE";
  const start = new Date(`${value}T12:00:00`);
  const now = new Date();
  if (Number.isNaN(start.getTime()) || start > now) return "FECHA PENDIENTE";
  let months = (now.getFullYear() - start.getFullYear()) * 12;
  months += now.getMonth() - start.getMonth();
  if (now.getDate() < start.getDate()) months -= 1;
  months = Math.max(0, months);
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years && rest) return `${years} AÑOS Y ${rest} MESES`;
  if (years) return `${years} ${years === 1 ? "AÑO" : "AÑOS"}`;
  return `${rest} ${rest === 1 ? "MES" : "MESES"}`;
}

function applyCloudStateToRuntime(payload = {}) {
  const changedKeys = new Set(
    Array.isArray(payload.changedKeys) ? payload.changedKeys : CLOUD_SYNCED_KEYS,
  );
  if (!changedKeys.size) return;

  if (changedKeys.has(SETTINGS_KEY)) settings = readStoredSettings();
  if (changedKeys.has(PROFILE_KEY)) profile = readStoredProfile();
  if (changedKeys.has(TASKS_KEY)) {
    tasks = readStoredTasks();
    const taskIds = new Set(tasks.map((task) => task.id));
    questStack = questStack.filter((id) => taskIds.has(id));
    if (missionTaskId !== null && !taskIds.has(missionTaskId)) missionTaskId = null;
  }
  if (changedKeys.has(FINANCE_KEY)) {
    const stored = readJson(FINANCE_KEY, []);
    financeEntries = Array.isArray(stored) ? stored : [];
  }
  if (changedKeys.has(COFFER_NOTES_KEY)) {
    cofferNotes = readJson(COFFER_NOTES_KEY, []).filter(
      (note) =>
        note &&
        typeof note.id === "string" &&
        typeof note.title === "string" &&
        typeof note.content === "string",
    );
  }
  if (changedKeys.has(BIRTHDAYS_KEY)) {
    const stored = readJson(BIRTHDAYS_KEY, []);
    birthdays = Array.isArray(stored) ? stored : [];
  }
  if (changedKeys.has(EVENTS_KEY)) {
    const stored = readJson(EVENTS_KEY, []);
    importantEvents = Array.isArray(stored) ? stored.map(normalizeImportantEvent) : [];
  }
  if (changedKeys.has(WRITING_KEY)) {
    const stored = readJson(WRITING_KEY, []);
    writingProjects = Array.isArray(stored) ? stored : [];
    if (!writingProjects.some((project) => project.id === activeWritingId)) {
      activeWritingId = writingProjects[0]?.id ?? null;
      activeWritingPage = 0;
      resetWritingHistory(activeWritingId);
    }
  }
  if (changedKeys.has(PROJECTS_KEY)) {
    customProjects = readJson(PROJECTS_KEY, []).filter(
      (project) =>
        project &&
        typeof project.name === "string" &&
        (project.area === "laboral" || project.area === "personal"),
    );
  }
  if (changedKeys.has(PROJECT_RENAMES_KEY)) {
    const stored = readJson(PROJECT_RENAMES_KEY, {});
    projectRenames = stored && typeof stored === "object" ? stored : {};
  }
  if (changedKeys.has(HUB_ALARMS_KEY)) {
    hubAlarms = readJson(HUB_ALARMS_KEY, []).filter(
      (alarm) => alarm && typeof alarm.id === "string" && typeof alarm.time === "string",
    );
  }
  if (changedKeys.has(QUICK_LISTS_KEY)) {
    quickLists = normalizeQuickLists(readJson(QUICK_LISTS_KEY, []));
    if (!quickLists.some((list) => list.id === activeQuickListId)) {
      activeQuickListId = quickLists[0]?.id ?? null;
    }
  }
  if (changedKeys.has(DRAWINGS_KEY)) {
    drawingIdeas = normalizeDrawings(readJson(DRAWINGS_KEY, []));
    if (!drawingIdeas.some((idea) => idea.id === activeDrawingId)) activeDrawingId = null;
  }
  if (changedKeys.has(UNDERGROUND_ITEMS_KEY)) {
    undergroundItems = normalizeUndergroundItems(readJson(UNDERGROUND_ITEMS_KEY, []));
    if (editingUndergroundId && !undergroundItems.some((item) => item.id === editingUndergroundId)) {
      resetUndergroundForm();
    }
  }
  if (changedKeys.has(DAILY_PLAN_KEY)) {
    dailyPlan = normalizeDailyPlan(readJson(DAILY_PLAN_KEY, {}));
  }
  if (changedKeys.has(PROGRESS_KEY)) {
    progressState = normalizeProgressState(readJson(PROGRESS_KEY, null));
    seedProgressFromLegacyTasks();
    enforceRewardEntitlements();
    localStorage.setItem(WORLD_LAYOUT_KEY, JSON.stringify(worldLayout));
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    applySettings();
    applyTimeOfDay();
    renderHud();
    if (!elements.activityPanel.classList.contains("hidden")) renderProgressPanel();
  }
  if (changedKeys.has(WORLD_LAYOUT_KEY) || changedKeys.has(SETTINGS_KEY)) {
    worldLayout = sanitizeWorldLayout(
      normalizeWorldLayout(
        readJson(WORLD_LAYOUT_KEY, null),
        true,
        settings.worldTheme,
      ),
      settings.worldTheme,
    );
    playerPosition = nearestWalkablePosition(playerPosition, settings.worldTheme);
  }

  if (changedKeys.has(PASSWORD_VAULT_KEY)) lockPasswordVault();
  if (changedKeys.has(SETTINGS_KEY) || changedKeys.has(WORLD_LAYOUT_KEY)) applySettings();
  if (changedKeys.has(PROFILE_KEY)) {
    renderHud();
    renderProfile();
    renderWorldCompanions();
  }
  if (
    changedKeys.has(TASKS_KEY) ||
    changedKeys.has(PROJECTS_KEY) ||
    changedKeys.has(PROJECT_RENAMES_KEY)
  ) {
    updateTaskProjectOptions();
    renderTasks();
    renderProjects();
    renderMission();
    renderBoard();
  }
  if (changedKeys.has(FINANCE_KEY)) {
    renderFinance();
    renderCofferHome();
    renderBoard();
  }
  if (changedKeys.has(COFFER_NOTES_KEY)) renderCofferNotes();
  if (changedKeys.has(BIRTHDAYS_KEY) || changedKeys.has(EVENTS_KEY)) {
    renderAgenda();
    renderCalendar();
    renderReminder();
    renderBoard();
  }
  if (changedKeys.has(WRITING_KEY)) renderWriting();
  if (changedKeys.has(HUB_ALARMS_KEY)) renderHub();
  if (changedKeys.has(QUICK_LISTS_KEY)) renderQuickLists();
  if (changedKeys.has(UNDERGROUND_ITEMS_KEY)) renderUnderground();
  if (changedKeys.has(DAILY_PLAN_KEY)) renderBoard();
  if (changedKeys.has(PUZZLE_PROGRESS_KEY)) renderPuzzle();
  if (changedKeys.has(LEARNING_PROGRESS_KEY)) {
    learningProgress = readLearningProgress();
    renderLearningHub();
  }
  renderCloudSync();
}

function customProjectTuples(area) {
  return customProjects
    .filter((project) => project.area === area)
    .map((project) => [
      project.name,
      project.code,
      project.description,
      project.accent,
    ]);
}

function workProjectList() {
  return [
    ...workProjects
      .filter(
        (project) =>
          projectRenames[project[0]] !== DELETED_PROJECT_SENTINEL,
      )
      .map((project) => [
        projectRenames[project[0]] || project[0],
        project[1],
        project[2],
        project[3],
        null,
        project[0],
      ]),
    ...customProjectTuples("laboral").map((project) => [
      ...project,
      customProjects.find((item) => item.name === project[0])?.id ?? null,
      null,
    ]),
  ];
}

function personalProjectList() {
  return [
    ...personalProjects
      .filter(
        (project) =>
          project[0] === MISSION_BACKPACK_PROJECT ||
          projectRenames[project[0]] !== DELETED_PROJECT_SENTINEL,
      )
      .map((project) => [
        project[0] === MISSION_BACKPACK_PROJECT
          ? project[0]
          : projectRenames[project[0]] || project[0],
        project[1],
        project[2],
        project[3],
        null,
        project[0],
      ]),
    ...customProjectTuples("personal").map((project) => [
      ...project,
      customProjects.find((item) => item.name === project[0])?.id ?? null,
      null,
    ]),
  ];
}

function allProjectList() {
  return [...workProjectList(), ...personalProjectList()];
}

function isPersonalProject(name) {
  return personalProjectList().some(([projectName]) => projectName === name);
}

function normalizeWorldLayout(stored, placeDefaults = false, theme = "fantasy") {
  const source = Array.isArray(stored?.modules) ? stored.modules : [];
  const layout = {
    version: 3,
    modules: WORLD_MODULE_DEFINITIONS.map((definition) => {
      const saved = source.find((item) => item?.id === definition.id);
      const migratedPlot = saved?.plot && stored?.version === 2
        ? { ...definition.defaultPlot }
        : saved?.plot;
      const validPlot = WORLD_BUILD_PLOTS.some(
        (plot) => plot.x === migratedPlot?.x && plot.y === migratedPlot?.y,
      );
      return {
        id: definition.id,
        placed: saved ? Boolean(saved.placed && validPlot) : Boolean(placeDefaults),
        plot: validPlot ? { x: migratedPlot.x, y: migratedPlot.y } : { ...definition.defaultPlot },
        color: definition.color,
        title: String(saved?.title || definition.label).trim().slice(0, MAX_PORTAL_TITLE_LENGTH) || definition.label,
        openCount: Math.max(0, Math.trunc(Number(saved?.openCount) || 0)),
      };
    }),
  };
  return sanitizeWorldLayout(layout, theme);
}

function worldModuleDefinition(id) {
  return WORLD_MODULE_DEFINITIONS.find((definition) => definition.id === id);
}

function worldModuleState(id) {
  return worldLayout.modules.find((module) => module.id === id);
}

function rewardUnlocked(rewardId) {
  return !rewardId || progressState.unlockedRewards.includes(rewardId);
}

function worldModuleUnlocked(id) {
  return rewardUnlocked(worldModuleDefinition(id)?.rewardId);
}

function enforceRewardEntitlements() {
  cachedCollisionScene = null;
  for (const portalModule of worldLayout.modules) {
    if (!worldModuleUnlocked(portalModule.id)) portalModule.placed = false;
  }
  settings.quickAccess = settings.quickAccess.filter((id) => {
    const definition = worldModuleDefinition(id);
    return !definition || worldModuleUnlocked(id);
  });
  if (!rewardUnlocked("map-coast") && settings.worldTheme === "earth") {
    settings.worldTheme = "fantasy";
  }
  if (!rewardUnlocked("underground-access") && undergroundWorldOpen) {
    undergroundWorldOpen = false;
  }
}

function quickAccessDefinition(id) {
  return QUICK_ACCESS_DEFINITIONS.find((definition) => definition.id === id);
}

function isQuickAccessAvailable(id) {
  const definition = quickAccessDefinition(id);
  if (!definition) return false;
  if (definition.always) return true;
  return worldModuleUnlocked(id) && Boolean(worldModuleState(id)?.placed);
}

function activeQuickAccessIds() {
  return settings.quickAccess
    .filter((id) => isQuickAccessAvailable(id))
    .slice(0, MAX_QUICK_ACCESS);
}

function renderQuickAccessBar() {
  if (!elements.quickbar) return;
  const ids = activeQuickAccessIds();
  elements.quickbar.classList.toggle("hidden", worldBuildMode || ids.length === 0);
  elements.quickbar.style.setProperty("--quickbar-count", String(Math.max(1, ids.length)));
  elements.quickbar.innerHTML = ids.map((id, index) => {
    const definition = quickAccessDefinition(id);
    return `<button type="button" data-open="${definition.panel}" data-quick-access="${id}"
      data-label="Abrir ${escapeHtml(definition.label)}" aria-label="${index + 1}. Abrir ${escapeHtml(definition.label)}">
      <span class="hotbar-key">${index + 1}</span>
      <span class="quick-icon" aria-hidden="true" style="background-color:${definition.color};background-image:url('${definition.icon}')"></span>
      <span class="hotbar-label">${escapeHtml(definition.label)}</span>
    </button>`;
  }).join("");
}

function renderQuickAccessPicker() {
  if (!elements.settingsQuickAccessPicker) return;
  const selectedIds = activeQuickAccessIds();
  elements.settingsQuickAccessCount.textContent = `${selectedIds.length} / ${MAX_QUICK_ACCESS}`;
  elements.settingsQuickAccessPicker.innerHTML = QUICK_ACCESS_DEFINITIONS.map((definition) => {
    const selectedIndex = selectedIds.indexOf(definition.id);
    const selected = selectedIndex >= 0;
    const available = isQuickAccessAvailable(definition.id);
    const status = available
      ? selected
        ? `POSICIÓN ${selectedIndex + 1}`
        : "AGREGAR"
      : "PORTAL NO CONSTRUIDO";
    return `<article class="quick-access-choice${selected ? " selected" : ""}${available ? "" : " unavailable"}">
      <button type="button" class="quick-access-choice-main" data-quick-access-toggle="${definition.id}"
        ${available ? "" : "disabled"} aria-pressed="${selected}">
        <span class="quick-access-choice-icon" style="background-color:${definition.color}">
          <img src="${definition.icon}" alt="" />
        </span>
        <span><strong>${escapeHtml(definition.label)}</strong><small>${status}</small></span>
        <b>${selected ? selectedIndex + 1 : available ? "+" : "×"}</b>
      </button>
      ${selected ? `<div class="quick-access-order" aria-label="Mover ${escapeHtml(definition.label)}">
        <button type="button" data-quick-access-move="up" data-quick-access-id="${definition.id}" ${selectedIndex === 0 ? "disabled" : ""}>◀</button>
        <button type="button" data-quick-access-move="down" data-quick-access-id="${definition.id}" ${selectedIndex === selectedIds.length - 1 ? "disabled" : ""}>▶</button>
      </div>` : ""}
    </article>`;
  }).join("");
}

function updateQuickAccess(nextIds, message = "Accesos rápidos actualizados.") {
  settings.quickAccess = [...new Set(nextIds)]
    .filter((id) => isQuickAccessAvailable(id))
    .slice(0, MAX_QUICK_ACCESS);
  persistSettings(message);
}

function toggleQuickAccess(id) {
  if (!isQuickAccessAvailable(id)) {
    showToast("Primero tenés que construir ese portal.");
    return;
  }
  const selected = activeQuickAccessIds();
  if (selected.includes(id)) {
    updateQuickAccess(selected.filter((item) => item !== id));
    return;
  }
  if (selected.length >= MAX_QUICK_ACCESS) {
    showToast("Podés elegir hasta cinco accesos rápidos.");
    return;
  }
  updateQuickAccess([...selected, id]);
}

function moveQuickAccess(id, direction) {
  const selected = activeQuickAccessIds();
  const index = selected.indexOf(id);
  const nextIndex = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || nextIndex < 0 || nextIndex >= selected.length) return;
  [selected[index], selected[nextIndex]] = [selected[nextIndex], selected[index]];
  updateQuickAccess(selected, "Orden de accesos actualizado.");
}

function plotToWorldPosition(plot) {
  return {
    x: ((plot.x + 1) / WORLD_GRID.columns) * 100,
    y: ((plot.y + 2) / WORLD_GRID.rows) * 100,
  };
}

const WORLD_DEPTH_BASE = 100;
const WORLD_DEPTH_SCALE = 10;
const WORLD_UNDERGROUND_DEPTH = 2001;

function worldDepthIndex(y, foregroundOffset = 0) {
  const groundY = Math.max(0, Math.min(100, Number(y) || 0));
  return WORLD_DEPTH_BASE + Math.round(groundY * WORLD_DEPTH_SCALE) + foregroundOffset;
}

function setWorldActorDepth(element, groundY) {
  if (!element) return;
  element.style.zIndex = String(worldDepthIndex(groundY, 1));
}

function isWorldPlotClearOfScenery(plot, theme = "fantasy") {
  const position = plotToWorldPosition(plot);
  if (position.x < 5 || position.x > 95 || position.y < 11.5 || position.y > 92.5) {
    return false;
  }
  return !WORLD_BUILD_BLOCKERS[theme].some(
    (blocker) =>
      position.x >= blocker.x &&
      position.x <= blocker.x + blocker.width &&
      position.y >= blocker.y &&
      position.y <= blocker.y + blocker.height,
  );
}

function worldPlotsOverlap(first, second) {
  const a = plotToWorldPosition(first);
  const b = plotToWorldPosition(second);
  return (
    Math.abs(a.x - b.x) < WORLD_MODULE_SPACING.x &&
    Math.abs(a.y - b.y) < WORLD_MODULE_SPACING.y
  );
}

function worldPlotOverlapsModules(plot, modules, ignoredModuleId = null) {
  return modules.some(
    (module) =>
      module.id !== ignoredModuleId &&
      module.placed &&
      worldPlotsOverlap(plot, module.plot),
  );
}

function nearestAvailableWorldPlot(desired, theme, modules, ignoredModuleId = null) {
  const desiredPosition = plotToWorldPosition(desired);
  return WORLD_BUILD_PLOTS
    .filter(
      (plot) =>
        isWorldPlotClearOfScenery(plot, theme) &&
        !worldPlotOverlapsModules(plot, modules, ignoredModuleId),
    )
    .sort((first, second) => {
      const firstPosition = plotToWorldPosition(first);
      const secondPosition = plotToWorldPosition(second);
      return (
        Math.hypot(firstPosition.x - desiredPosition.x, firstPosition.y - desiredPosition.y) -
        Math.hypot(secondPosition.x - desiredPosition.x, secondPosition.y - desiredPosition.y)
      );
    })[0] || null;
}

function sanitizeWorldLayout(layout, theme = "fantasy") {
  const resolved = [];
  for (const portalModule of layout.modules) {
    if (!worldModuleUnlocked(portalModule.id)) {
      resolved.push({ ...portalModule, placed: false });
      continue;
    }
    if (!portalModule.placed) {
      resolved.push(portalModule);
      continue;
    }
    const safe =
      isWorldPlotClearOfScenery(portalModule.plot, theme) &&
      !worldPlotOverlapsModules(portalModule.plot, resolved, portalModule.id);
    const definition = worldModuleDefinition(portalModule.id);
    const plot = safe
      ? portalModule.plot
      : nearestAvailableWorldPlot(definition.defaultPlot, theme, resolved, portalModule.id);
    resolved.push(plot ? { ...portalModule, plot: { ...plot } } : { ...portalModule, placed: false });
  }
  return { version: 3, modules: resolved };
}

function moduleBlockers() {
  return worldLayout.modules
    .filter((module) => module.placed && worldModuleUnlocked(module.id))
    .map((module) => {
      const position = plotToWorldPosition(module.plot);
      return {
        type: "rect",
        // A portal illustration is intentionally much wider than the stone
        // doorway because it also contains flowers, books and work tables.
        // Only the solid stone base blocks the player's feet; using the full
        // artwork here made the clear corridors between portals impassable.
        x: position.x - 3.25,
        y: position.y - 7.7,
        width: 6.5,
        height: 9.15,
      };
    });
}

function collisionScene(theme) {
  // Routes test many neighbouring cells; scenery is shared until portals or terrain change.
  if (cachedCollisionScene?.layout !== worldLayout || cachedCollisionScene.theme !== theme) {
    const player = [...WORLD_COLLISIONS[theme], ...moduleBlockers()];
    cachedCollisionScene = { layout: worldLayout, theme, player,
      pet: [...player, ...PET_SCENERY_BLOCKERS[theme].map(shape => ({type:"rect", ...shape}))] };
  }
  return cachedCollisionScene;
}

function occupiedWorldPlot(plot, ignoredModuleId = null) {
  return worldPlotOverlapsModules(plot, worldLayout.modules, ignoredModuleId);
}

function firstFreeWorldPlot(moduleId = null) {
  return WORLD_BUILD_PLOTS.find(
    (plot) =>
      isWorldPlotClearOfScenery(plot, settings.worldTheme) &&
      !occupiedWorldPlot(plot, moduleId),
  ) || null;
}

function saveWorldLayout() {
  cachedCollisionScene = null;
  localStorage.setItem(WORLD_LAYOUT_KEY, JSON.stringify(worldLayout));
  markCloudChange();
  renderCollisionLayer();
  renderQuickAccessBar();
  renderQuickAccessPicker();
}

function renderWorldGrid() {
  if (!elements.worldGrid) return;
  if (!worldBuildMode) {
    if (elements.worldGrid.firstChild) elements.worldGrid.replaceChildren();
    return;
  }
  elements.worldGrid.innerHTML = WORLD_BUILD_PLOTS
    .filter((plot) => isWorldPlotClearOfScenery(plot, settings.worldTheme))
    .map((plot) => {
    const occupied = occupiedWorldPlot(plot);
    const position = plotToWorldPosition(plot);
    return `<i class="world-build-plot${occupied ? " occupied" : ""}" data-plot-x="${plot.x}" data-plot-y="${plot.y}" style="left:${position.x}%;top:${position.y}%"></i>`;
  }).join("");
}

function renderWorldModules() {
  if (!elements.worldModuleLayer) return;
  elements.worldModuleLayer.innerHTML = worldLayout.modules
    .filter((module) => module.placed && worldModuleUnlocked(module.id))
    .map((module) => {
      const definition = worldModuleDefinition(module.id);
      const position = plotToWorldPosition(module.plot);
      const selected = worldBuildMode && selectedWorldModuleId === module.id;
      const openAttribute = worldBuildMode ? "" : ` data-open="${definition.panel}"`;
      return `
        <button class="world-module${selected ? " selected" : ""}" type="button"
          data-world-module="${module.id}"${openAttribute}
          style="left:${position.x}%;top:${position.y}%;z-index:${worldDepthIndex(position.y)};--portal-module-art:url('${definition.asset}');--portal-module-night-art:url('${definition.nightAsset}');--portal-art-scale:${definition.artScale};--portal-title-top:${definition.titleTop};--portal-title-left:${definition.titleLeft};--portal-title-width:${definition.titleWidth};--portal-title-size:${portalTitleFontSize(module.title)}"
          aria-label="${worldBuildMode ? "Mover" : "Abrir"} ${escapeHtml(module.title)}">
          <span class="portal-frame-art" aria-hidden="true"></span>
          <small class="portal-module-sign">${escapeHtml(module.title)}</small>
        </button>`;
    })
    .join("");
  renderWorldGrid();
}

function renderWorldBuilder() {
  if (!elements.worldModuleInventory) return;
  const placedCount = worldLayout.modules.filter((module) => module.placed && worldModuleUnlocked(module.id)).length;
  if (elements.worldModuleCount) {
    elements.worldModuleCount.textContent = `${placedCount}/${MAX_WORLD_MODULES}`;
  }
  elements.worldModuleInventory.innerHTML = WORLD_MODULE_DEFINITIONS.map((definition) => {
    const portalModule = worldModuleState(definition.id);
    const selected = selectedWorldModuleId === portalModule.id;
    const unlocked = worldModuleUnlocked(definition.id);
    const reward = definition.rewardId && REWARD_DEFINITIONS.find((item) => item.id === definition.rewardId);
    return `<button type="button" class="world-module-inventory-item${selected ? " selected" : ""}${unlocked ? "" : " locked"}${portalModule.placed ? " placed" : " unplaced"}" title="${escapeHtml(portalModule.title)}" data-module-details="${portalModule.id}" ${unlocked ? "" : "disabled"} aria-label="${unlocked ? `Abrir ficha de ${escapeHtml(portalModule.title)}` : `${escapeHtml(portalModule.title)} bloqueado`}">
      <span class="world-module-inventory-icon" aria-hidden="true" style="--module-color:${portalModule.color};background-image:url('${definition.icon}')"></span>
      ${unlocked && !portalModule.placed ? `<small class="world-module-inventory-status">CONSTRUIR</small>` : !unlocked ? `<small class="world-module-lock">🔒 ${reward?.cost || ""}</small>` : ""}
    </button>`;
  }).join("");
  renderWorldModuleDetails();
}

function renderWorldModuleDetails() {
  const portalModule = worldModuleDetailId && worldModuleState(worldModuleDetailId);
  elements.worldModuleDetailBackdrop?.classList.toggle("hidden", !portalModule);
  if (!portalModule) return;
  const definition = worldModuleDefinition(portalModule.id);
  elements.selectedWorldModuleName.textContent = portalModule.title;
  elements.worldModuleDescription.textContent = definition.description;
  elements.worldModuleTitle.value = portalModule.title;
  elements.worldModuleRemove.disabled = !portalModule.placed;
  elements.worldModuleDetailMove.classList.toggle("hidden", portalModule.placed);
  elements.worldModuleDetailMove.textContent = "CONSTRUIR EN EL MAPA";
  elements.worldModuleOpenCount.textContent = String(portalModule.openCount || 0);
  elements.worldModuleOpenLabel.textContent = portalModule.openCount === 1 ? "VEZ ABIERTO" : "VECES ABIERTO";
  elements.worldModuleDetailIcon.style.setProperty("--module-color", portalModule.color);
  elements.worldModuleDetailIcon.style.backgroundImage = `url('${definition.icon}')`;
}

function openWorldModuleDetails(id) {
  if (!worldModuleUnlocked(id)) return;
  worldModuleDetailId = id;
  renderWorldModuleDetails();
}

function closeWorldModuleDetails() {
  worldModuleDetailId = null;
  renderWorldModuleDetails();
}

function selectWorldModule(id) {
  selectedWorldModuleId = worldModuleState(id) && worldModuleUnlocked(id) ? id : null;
  renderWorldModules();
  renderWorldBuilder();
}

function placeWorldModule(id, plot) {
  const portalModule = worldModuleState(id);
  if (!portalModule || !plot) return false;
  if (!worldModuleUnlocked(id)) {
    showToast("Desbloqueá esta recompensa en el Salón de logros.");
    return false;
  }
  if (!isWorldPlotClearOfScenery(plot, settings.worldTheme)) {
    showToast("Ese lugar tiene árboles u objetos. Elegí otro claro.");
    return false;
  }
  if (occupiedWorldPlot(plot, id)) {
    showToast("Dejá un poco de espacio entre los portales.");
    return false;
  }
  if (!portalModule.placed && worldLayout.modules.filter((item) => item.placed).length >= MAX_WORLD_MODULES) {
    showToast(`El mundo admite hasta ${MAX_WORLD_MODULES} módulos.`);
    return false;
  }
  portalModule.placed = true;
  portalModule.plot = { x: plot.x, y: plot.y };
  saveWorldLayout();
  renderWorldModules();
  renderWorldBuilder();
  const safePlayerPosition = nearestWalkablePosition(playerPosition, settings.worldTheme);
  if (safePlayerPosition.x !== playerPosition.x || safePlayerPosition.y !== playerPosition.y) {
    setPlayerPosition(safePlayerPosition.x, safePlayerPosition.y);
  }
  return true;
}

function renameWorldModule(id, title) {
  const portalModule = worldModuleState(id);
  if (!portalModule) return;
  const fallback = worldModuleDefinition(id).label;
  portalModule.title = String(title || "").slice(0, MAX_PORTAL_TITLE_LENGTH) || fallback;
  saveWorldLayout();
  renderWorldModules();
}

function removeWorldModule(id) {
  const portalModule = worldModuleState(id);
  if (!portalModule || !portalModule.placed) return;
  portalModule.placed = false;
  if (settings.quickAccess.includes(id)) {
    settings.quickAccess = settings.quickAccess.filter((item) => item !== id);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    markCloudChange();
  }
  saveWorldLayout();
  if (worldModuleDetailId === id) closeWorldModuleDetails();
  if (selectedWorldModuleId === id) selectedWorldModuleId = null;
  renderWorldModules();
  renderWorldBuilder();
}

function setWorldBuildMode(enabled) {
  worldBuildMode = Boolean(enabled);
  moduleDragState = null;
  worldPropDragState = null;
  elements.world.classList.toggle("build-mode", worldBuildMode);
  elements.worldBuilderPanel.classList.toggle("hidden", !worldBuildMode);
  elements.worldBuildToggle.classList.toggle("active", worldBuildMode);
  elements.worldBuildToggle.setAttribute("aria-pressed", String(worldBuildMode));
  elements.worldBuildToggle.setAttribute(
    "aria-label",
    worldBuildMode ? "Cerrar modo construcción" : "Construir y mover portales",
  );
  elements.worldBuildToggle.title = worldBuildMode
    ? "Terminar construcción"
    : "Construir y mover portales";
  const buildLabel = elements.worldBuildToggle.querySelector("small");
  if (buildLabel) buildLabel.textContent = worldBuildMode ? "TERMINAR" : "CONSTRUIR";
  if (!worldBuildMode) {
    selectedWorldModuleId = null;
    closeWorldModuleDetails();
  }
  renderWorldModules();
  renderWorldBuilder();
  renderQuickAccessBar();
}

function beginWorldPropDrag(event, element, id) {
  if (!worldBuildMode || !element || !settings.worldPropPositions[id]) return;
  event.preventDefault();
  event.stopPropagation();
  const bounds = elements.world.getBoundingClientRect();
  const position = settings.worldPropPositions[id];
  worldPropDragState = {
    id,
    element,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    offsetX: event.clientX - (bounds.left + (position.x / 100) * bounds.width),
    offsetY: event.clientY - (bounds.top + (position.y / 100) * bounds.height),
    x: position.x,
    y: position.y,
  };
  element.classList.add("dragging");
  element.setPointerCapture?.(event.pointerId);
}

function moveWorldPropDrag(event) {
  if (!worldPropDragState || event.pointerId !== worldPropDragState.pointerId) return;
  event.preventDefault();
  const bounds = elements.world.getBoundingClientRect();
  const anchorX = event.clientX - worldPropDragState.offsetX;
  const anchorY = event.clientY - worldPropDragState.offsetY;
  worldPropDragState.x = Math.min(97, Math.max(3, ((anchorX - bounds.left) / bounds.width) * 100));
  worldPropDragState.y = Math.min(94, Math.max(8, ((anchorY - bounds.top) / bounds.height) * 100));
  worldPropDragState.element.style.left = `${worldPropDragState.x}%`;
  worldPropDragState.element.style.top = `${worldPropDragState.y}%`;
}

function finishWorldPropDrag(event) {
  if (!worldPropDragState || event.pointerId !== worldPropDragState.pointerId) return;
  const drag = worldPropDragState;
  worldPropDragState = null;
  drag.element.releasePointerCapture?.(event.pointerId);
  drag.element.classList.remove("dragging");
  settings.worldPropPositions[drag.id] = { x: drag.x, y: drag.y };
  persistSettings("");
}

function nearestWorldPlotFromPointer(clientX, clientY, moduleId) {
  const bounds = elements.world.getBoundingClientRect();
  const point = {
    x: ((clientX - bounds.left) / bounds.width) * 100,
    y: ((clientY - bounds.top) / bounds.height) * 100,
  };
  let closest = null;
  let distance = Number.POSITIVE_INFINITY;
  for (const plot of WORLD_BUILD_PLOTS) {
    if (!isWorldPlotClearOfScenery(plot, settings.worldTheme)) continue;
    if (occupiedWorldPlot(plot, moduleId)) continue;
    const position = plotToWorldPosition(plot);
    const currentDistance = Math.hypot(position.x - point.x, position.y - point.y);
    if (currentDistance < distance) {
      closest = plot;
      distance = currentDistance;
    }
  }
  return closest;
}

function isPlayerPositionBlocked(x, y, theme = settings.worldTheme) {
  const bounds = WORLD_BOUNDS[theme];
  if (
    x < bounds.minX ||
    x > bounds.maxX ||
    y < bounds.minY ||
    y > bounds.maxY
  ) {
    return true;
  }
  return collisionScene(theme).player.some((shape) => {
    if (shape.type === "rect") {
      return (
        x >= shape.x - PLAYER_COLLISION_X &&
        x <= shape.x + shape.width + PLAYER_COLLISION_X &&
        y >= shape.y - PLAYER_COLLISION_Y &&
        y <= shape.y + shape.height + PLAYER_COLLISION_Y
      );
    }
    const normalizedX =
      (x - shape.x) / (shape.radius + PLAYER_COLLISION_X);
    const normalizedY =
      (y - shape.y) / (shape.radius + PLAYER_COLLISION_Y);
    return normalizedX * normalizedX + normalizedY * normalizedY <= 1;
  });
}

function nearestWalkablePosition(position, theme = settings.worldTheme) {
  const bounds = WORLD_BOUNDS[theme];
  const origin = {
    x: Math.min(bounds.maxX, Math.max(bounds.minX, position.x)),
    y: Math.min(bounds.maxY, Math.max(bounds.minY, position.y)),
  };
  if (!isPlayerPositionBlocked(origin.x, origin.y, theme)) return origin;
  for (const radius of [2, 4, 6, 9, 13, 18, 24]) {
    for (let step = 0; step < 24; step += 1) {
      const angle = (Math.PI * 2 * step) / 24;
      const candidate = {
        x: Math.min(
          bounds.maxX,
          Math.max(bounds.minX, origin.x + Math.cos(angle) * radius),
        ),
        y: Math.min(
          bounds.maxY,
          Math.max(bounds.minY, origin.y + Math.sin(angle) * radius),
        ),
      };
      if (!isPlayerPositionBlocked(candidate.x, candidate.y, theme)) {
        return candidate;
      }
    }
  }
  return { ...PLAYER_SPAWN };
}

function resolvePlayerMovement(current, deltaX, deltaY, theme) {
  const origin = isPlayerPositionBlocked(current.x, current.y, theme)
    ? nearestWalkablePosition(current, theme)
    : current;
  const distance = Math.max(Math.abs(deltaX), Math.abs(deltaY));
  const steps = Math.max(1, Math.ceil(distance / PLAYER_MOVEMENT_SUBSTEP));
  const stepX = deltaX / steps;
  const stepY = deltaY / steps;
  let next = { ...origin };

  for (let index = 0; index < steps; index += 1) {
    const diagonal = { x: next.x + stepX, y: next.y + stepY };
    if (!isPlayerPositionBlocked(diagonal.x, diagonal.y, theme)) {
      next = diagonal;
      continue;
    }

    // When a diagonal meets the corner of an obstacle, slide along its edge.
    // Trying the dominant axis first keeps cardinal movement exact and avoids
    // the sticky corners that previously trapped the player near portals.
    const xCandidate = { x: next.x + stepX, y: next.y };
    const yCandidate = { x: next.x, y: next.y + stepY };
    const xOpen = !isPlayerPositionBlocked(xCandidate.x, xCandidate.y, theme);
    const yOpen = !isPlayerPositionBlocked(yCandidate.x, yCandidate.y, theme);
    if (Math.abs(stepX) >= Math.abs(stepY)) {
      if (xOpen) next = xCandidate;
      else if (yOpen) next = yCandidate;
    } else if (yOpen) {
      next = yCandidate;
    } else if (xOpen) {
      next = xCandidate;
    }
  }
  return next;
}

function isPetPositionBlocked(x, y, theme = settings.worldTheme) {
  const bounds = WORLD_BOUNDS[theme];
  if (x < bounds.minX || x > bounds.maxX || y < bounds.minY || y > bounds.maxY) {
    return true;
  }
  return collisionScene(theme).pet.some((shape) => {
    if (shape.type === "rect") {
      return (
        x >= shape.x - PET_COLLISION_X &&
        x <= shape.x + shape.width + PET_COLLISION_X &&
        y >= shape.y - PET_COLLISION_Y &&
        y <= shape.y + shape.height + PET_COLLISION_Y
      );
    }
    const normalizedX = (x - shape.x) / (shape.radius + PET_COLLISION_X);
    const normalizedY = (y - shape.y) / (shape.radius + PET_COLLISION_Y);
    return normalizedX * normalizedX + normalizedY * normalizedY <= 1;
  });
}

function nearestPetWalkablePosition(position, theme = settings.worldTheme) {
  const bounds = WORLD_BOUNDS[theme];
  const origin = {
    x: Math.min(bounds.maxX, Math.max(bounds.minX, position.x)),
    y: Math.min(bounds.maxY, Math.max(bounds.minY, position.y)),
  };
  if (!isPetPositionBlocked(origin.x, origin.y, theme)) return origin;
  for (const radius of [1.5, 3, 5, 7, 10, 14, 20, 26]) {
    for (let step = 0; step < 32; step += 1) {
      const angle = (Math.PI * 2 * step) / 32;
      const candidate = {
        x: Math.min(bounds.maxX, Math.max(bounds.minX, origin.x + Math.cos(angle) * radius)),
        y: Math.min(bounds.maxY, Math.max(bounds.minY, origin.y + Math.sin(angle) * radius)),
      };
      if (!isPetPositionBlocked(candidate.x, candidate.y, theme)) return candidate;
    }
  }
  return { x: 34, y: 65 };
}

function resolvePetMovement(current, deltaX, deltaY, theme) {
  const origin = isPetPositionBlocked(current.x, current.y, theme)
    ? nearestPetWalkablePosition(current, theme)
    : current;
  let next = origin;
  const xCandidate = { x: origin.x + deltaX, y: origin.y };
  if (!isPetPositionBlocked(xCandidate.x, xCandidate.y, theme)) next = xCandidate;
  const yCandidate = { x: next.x, y: origin.y + deltaY };
  if (!isPetPositionBlocked(yCandidate.x, yCandidate.y, theme)) next = yCandidate;
  return next;
}

function resolveUndergroundMovement(current, deltaX, deltaY) {
  return {
    x: Math.min(93, Math.max(7, current.x + deltaX)),
    y: Math.min(91, Math.max(24, current.y + deltaY)),
  };
}

function petPathNode(position, theme) {
  const bounds = WORLD_BOUNDS[theme];
  return {
    x: Math.min(bounds.maxX, Math.max(bounds.minX, Math.round(position.x / PET_PATH_GRID_STEP) * PET_PATH_GRID_STEP)),
    y: Math.min(bounds.maxY, Math.max(bounds.minY, Math.round(position.y / PET_PATH_GRID_STEP) * PET_PATH_GRID_STEP)),
  };
}

function nearestPetPathNode(position, theme) {
  const origin = petPathNode(position, theme);
  if (!isPetPositionBlocked(origin.x, origin.y, theme)) return origin;
  for (let ring = 1; ring <= 24; ring += 1) {
    for (let horizontal = -ring; horizontal <= ring; horizontal += 1) {
      for (const vertical of [-ring, ring]) {
        const candidate = petPathNode({
          x: origin.x + horizontal * PET_PATH_GRID_STEP,
          y: origin.y + vertical * PET_PATH_GRID_STEP,
        }, theme);
        if (!isPetPositionBlocked(candidate.x, candidate.y, theme)) return candidate;
      }
    }
    for (let vertical = -ring + 1; vertical < ring; vertical += 1) {
      for (const horizontal of [-ring, ring]) {
        const candidate = petPathNode({
          x: origin.x + horizontal * PET_PATH_GRID_STEP,
          y: origin.y + vertical * PET_PATH_GRID_STEP,
        }, theme);
        if (!isPetPositionBlocked(candidate.x, candidate.y, theme)) return candidate;
      }
    }
  }
  return origin;
}

function findPetNpcPath(start, destination, theme = settings.worldTheme) {
  const first = nearestPetPathNode(start, theme);
  const goal = nearestPetPathNode(destination, theme);
  const key = (point) => `${point.x.toFixed(2)}:${point.y.toFixed(2)}`;
  const startKey = key(first);
  const goalKey = key(goal);
  const queue = [first];
  const visited = new Set([startKey]);
  const previous = new Map();
  const nodes = new Map([[startKey, first]]);
  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [1, -1], [-1, 1], [1, 1],
  ];

  for (let cursor = 0; cursor < queue.length && cursor < 2600; cursor += 1) {
    const current = queue[cursor];
    const currentKey = key(current);
    if (currentKey === goalKey) {
      const path = [];
      let pathKey = goalKey;
      while (pathKey !== startKey) {
        path.unshift(nodes.get(pathKey));
        pathKey = previous.get(pathKey);
        if (!pathKey) return [];
      }
      return path;
    }
    for (const [horizontal, vertical] of directions) {
      const next = {
        x: current.x + horizontal * PET_PATH_GRID_STEP,
        y: current.y + vertical * PET_PATH_GRID_STEP,
      };
      if (isPetPositionBlocked(next.x, next.y, theme)) continue;
      if (
        horizontal && vertical &&
        (isPetPositionBlocked(current.x + horizontal * PET_PATH_GRID_STEP, current.y, theme) ||
          isPetPositionBlocked(current.x, current.y + vertical * PET_PATH_GRID_STEP, theme))
      ) continue;
      const nextKey = key(next);
      if (visited.has(nextKey)) continue;
      visited.add(nextKey);
      previous.set(nextKey, currentKey);
      nodes.set(nextKey, next);
      queue.push(next);
    }
  }
  return [];
}

function randomPetNpcTarget(current, theme = settings.worldTheme) {
  const bounds = WORLD_BOUNDS[theme];
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const candidate = {
      x: Math.min(bounds.maxX, Math.max(bounds.minX, current.x + (Math.random() * 2 - 1) * 18)),
      y: Math.min(bounds.maxY, Math.max(bounds.minY, current.y + (Math.random() * 2 - 1) * 12)),
    };
    if (!isPetPositionBlocked(candidate.x, candidate.y, theme)) return candidate;
  }
  return nearestPetWalkablePosition(current, theme);
}

function planPetNpcRoute(npc, theme = settings.worldTheme) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const target = randomPetNpcTarget(npc.position, theme);
    const path = findPetNpcPath(npc.position, target, theme);
    if (path.length) {
      npc.target = target;
      npc.path = path;
      npc.pathIndex = 0;
      npc.stuckFor = 0;
      return;
    }
  }
  npc.target = { ...npc.position };
  npc.path = [];
  npc.pathIndex = 0;
}

function petNpcKind(species) {
  if (/conejo|rabbit/i.test(species)) return "rabbit";
  if (/perro|dog/i.test(species)) return "dog";
  return "cat";
}

function petNpcKey(pet, index) {
  return String(pet?.id || `${petNpcKind(pet?.species)}-${index}`);
}

function visibleWorldPets() {
  return (Array.isArray(profile.pets) ? profile.pets : [])
    .filter((pet) => String(pet?.name || "").trim())
    .slice(0, 12);
}

function createPetNpcState(kind, theme = settings.worldTheme, companionIndex = 0) {
  const base = PET_NPC_STARTS[kind];
  const position = nearestPetWalkablePosition({
    x: base.x + (companionIndex % 4) * 3.2,
    y: base.y + Math.floor(companionIndex / 4) * 3,
  }, theme);
  const npc = {
    kind,
    position,
    target: { ...position },
    path: [],
    pathIndex: 0,
    stuckFor: 0,
    mode: kind === "rabbit" ? "hopping" : "walking",
    modeUntil: performance.now() + PET_INITIAL_ACTIVE_DURATION_MS[kind],
    facingLeft: kind === "cat",
    sleepAnchor: null,
  };
  planPetNpcRoute(npc, theme);
  return npc;
}

function ensurePetNpcStates() {
  if (!petNpcStates) petNpcStates = {};
  const activeKeys = new Set();
  visibleWorldPets().forEach((pet, index) => {
    const key = petNpcKey(pet, index);
    const kind = petNpcKind(pet.species);
    activeKeys.add(key);
    if (!petNpcStates[key] || petNpcStates[key].kind !== kind) {
      petNpcStates[key] = createPetNpcState(kind, settings.worldTheme, index);
    }
  });
  Object.keys(petNpcStates).forEach((key) => {
    if (!activeKeys.has(key)) delete petNpcStates[key];
  });
  return petNpcStates;
}

function advancePetNpc(npc, time, deltaSeconds, theme = settings.worldTheme) {
  if (npc.mode === "sleeping") {
    // Sleeping is a visual animation only. Keep one immutable ground anchor so
    // route corrections or stale path state cannot make the pet slide in place.
    if (!npc.sleepAnchor) npc.sleepAnchor = { ...npc.position };
    if (isPetPositionBlocked(npc.sleepAnchor.x, npc.sleepAnchor.y, theme)) {
      npc.sleepAnchor = nearestPetWalkablePosition(npc.sleepAnchor, theme);
    }
    npc.position = { ...npc.sleepAnchor };
    if (time >= npc.modeUntil) {
      npc.mode = npc.kind === "rabbit" ? "hopping" : "walking";
      npc.modeUntil = time + PET_WALK_DURATION_MS;
      npc.sleepAnchor = null;
      planPetNpcRoute(npc, theme);
    }
    return { row: 3, frame: Math.floor(time / 900) % 4 };
  }

  if (isPetPositionBlocked(npc.position.x, npc.position.y, theme)) {
    npc.position = nearestPetWalkablePosition(npc.position, theme);
    planPetNpcRoute(npc, theme);
  }

  if (time >= npc.modeUntil) {
    npc.mode = "sleeping";
    npc.modeUntil = time + PET_SLEEP_DURATION_MS;
    npc.sleepAnchor = { ...npc.position };
    npc.path = [];
    npc.pathIndex = 0;
    return { row: 3, frame: 0 };
  }

  if (!npc.path.length || npc.pathIndex >= npc.path.length) {
    planPetNpcRoute(npc, theme);
    return { row: 2, frame: Math.floor(time / 850) % 4 };
  }
  let waypoint = npc.path[npc.pathIndex];
  let deltaX = waypoint.x - npc.position.x;
  let deltaY = waypoint.y - npc.position.y;
  const distance = Math.hypot(deltaX, deltaY);
  if (distance < 0.14) {
    npc.pathIndex += 1;
    if (npc.pathIndex >= npc.path.length) {
      planPetNpcRoute(npc, theme);
      return { row: 2, frame: Math.floor(time / 850) % 4 };
    }
    waypoint = npc.path[npc.pathIndex];
    deltaX = waypoint.x - npc.position.x;
    deltaY = waypoint.y - npc.position.y;
  }

  const nextDistance = Math.max(0.001, Math.hypot(deltaX, deltaY));
  const unitX = deltaX / nextDistance;
  const unitY = deltaY / nextDistance;
  const speed = PET_WALK_SPEED[npc.kind];
  const next = resolvePetMovement(
    npc.position,
    unitX * speed * deltaSeconds,
    unitY * speed * 1.65 * deltaSeconds,
    theme,
  );
  const moved =
    Math.abs(next.x - npc.position.x) > 0.0001 ||
    Math.abs(next.y - npc.position.y) > 0.0001;
  if (moved) {
    npc.position = next;
    npc.stuckFor = 0;
    if (Math.abs(deltaX) > 0.08) npc.facingLeft = deltaX < 0;
  } else {
    npc.stuckFor += deltaSeconds;
    if (npc.stuckFor >= 0.35) planPetNpcRoute(npc, theme);
  }
  const row = Math.abs(deltaY) > Math.abs(deltaX) * 1.25 && deltaY > 0 ? 1 : 0;
  return { row, frame: Math.floor(time / PET_FRAME_DURATION_MS[npc.kind]) % 4 };
}

function positionActor(element, position) {
  element.style.translate = `${worldWidth * position.x / 100}px ${worldHeight * position.y / 100}px`;
}

function renderPetNpc(element, sprite, npc, visual) {
  positionActor(element, npc.position);
  setWorldActorDepth(element, npc.position.y);
  if (element.dataset.mode !== npc.mode) element.dataset.mode = npc.mode;
  sprite.style.backgroundPosition = `${(visual.frame * 100) / 3}% ${(visual.row * 100) / 3}%`;
  sprite.style.transform = `scaleX(${npc.facingLeft ? -1 : 1})`;
}

function runPetNpcMovementFrame(time) {
  const deltaSeconds = Math.min((time - petNpcLastFrameTime) / 1000, 0.05);
  petNpcLastFrameTime = time;
  if (!undergroundWorldOpen && elements.panelBackdrop.classList.contains("hidden")) {
    for (const {element,sprite,npc} of petActors) {
      renderPetNpc(element, sprite, npc, advancePetNpc(npc, time, deltaSeconds));
    }
  }
  petNpcAnimationFrame = window.requestAnimationFrame(runPetNpcMovementFrame);
}

function renderCollisionLayer() {
  elements.collisionLayer.innerHTML = collisionScene(settings.worldTheme).player
    .map((shape) => {
      if (shape.type === "rect") {
        return `<i class="collision-shape collision-rect" style="left:${shape.x}%;top:${shape.y}%;width:${shape.width}%;height:${shape.height}%"></i>`;
      }
      return `<i class="collision-shape collision-circle" style="left:${shape.x - shape.radius}%;top:${shape.y - shape.radius}%;width:${shape.radius * 2}%;height:${shape.radius * 2}%"></i>`;
    })
    .join("");
}

function renderPlayer() {
  positionActor(elements.movablePlayer, playerPosition);
  elements.movablePlayer.style.zIndex = String(
    undergroundWorldOpen
      ? WORLD_UNDERGROUND_DEPTH
      : worldDepthIndex(playerPosition.y, 1),
  );
  elements.playerSpriteImage.style.backgroundPosition = characterAtlasCell(
    activeCharacterAgeGroup(),
    playerDirection,
    playerFrame,
  );
}

function isPortraitMobileMap() {
  return isMobileRuntime && window.matchMedia("(orientation: portrait)").matches;
}

function mobileWorldPanLimit() {
  if (!isPortraitMobileMap()) return 0;
  return Math.max(0, (worldWidth - window.innerWidth) / 2);
}

function setMobileWorldPan(value) {
  const limit = mobileWorldPanLimit();
  const next = Math.max(-limit, Math.min(limit, Number(value) || 0));
  if (next === mobileWorldPanX) return;
  mobileWorldPanX = next;
  // Pan the map's layer, not an inherited style on every actor and portal.
  elements.world.style.translate = next ? `${next}px 0` : "";
}

function keepPlayerInMobileCamera() {
  if (!isPortraitMobileMap() || mobileWorldPointerId !== null) return;
  if (!worldWidth) return;
  // The portrait map is centered at 50vw and translated by panX.
  const playerScreenX = (window.innerWidth - worldWidth) / 2 + mobileWorldPanX + worldWidth * playerPosition.x / 100;
  const safeLeft = window.innerWidth * 0.24;
  const safeRight = window.innerWidth * 0.76;
  if (playerScreenX < safeLeft) {
    setMobileWorldPan(mobileWorldPanX + safeLeft - playerScreenX);
  } else if (playerScreenX > safeRight) {
    setMobileWorldPan(mobileWorldPanX - (playerScreenX - safeRight));
  }
}

function queuePlayerPositionSave() {
  window.clearTimeout(playerPositionSaveTimer);
  playerPositionSaveTimer = window.setTimeout(() => {
    localStorage.setItem(PLAYER_POSITION_KEY, JSON.stringify(playerPosition));
    markCloudChange();
  }, 220);
}

function setPlayerPosition(x, y) {
  playerPosition = { x, y };
  if (!undergroundWorldOpen) queuePlayerPositionSave();
  renderPlayer();
  keepPlayerInMobileCamera();
}

function canPlayerMove() {
  return (
    !worldBuildMode &&
    elements.characterSetup.classList.contains("hidden") &&
    elements.panelBackdrop.classList.contains("hidden") &&
    elements.modal.classList.contains("hidden") &&
    elements.activityPanel.classList.contains("hidden") &&
    elements.exitConfirm.classList.contains("hidden") &&
    elements.completionCelebration.classList.contains("hidden") &&
    elements.birthdayAlert.classList.contains("hidden")
  );
}

function runPlayerMovementFrame(time) {
  // A capped frame delta prevents a delayed frame from becoming a visible
  // teleport. On a normal 60/120 Hz display this preserves the exact speed.
  const deltaSeconds = Math.min(
    Math.max((time - playerLastFrameTime) / 1000, 0),
    1 / 30,
  );
  playerLastFrameTime = time;
  const axisX =
    Number(pressedMovementKeys.has("arrowright") || pressedMovementKeys.has("d")) -
    Number(pressedMovementKeys.has("arrowleft") || pressedMovementKeys.has("a"));
  const axisY =
    Number(pressedMovementKeys.has("arrowdown") || pressedMovementKeys.has("s")) -
    Number(pressedMovementKeys.has("arrowup") || pressedMovementKeys.has("w"));
  if (!canPlayerMove()) pressedMovementKeys.clear();
  const xSpeed = 9.6;
  const ySpeed = 17;
  const magnitude = Math.hypot(axisX, axisY);
  if (magnitude > 0 && canPlayerMove()) {
    const unitX = axisX / magnitude;
    const unitY = axisY / magnitude;
    playerDirection =
      Math.abs(unitX) > Math.abs(unitY)
        ? unitX < 0
          ? "left"
          : "right"
        : unitY < 0
          ? "up"
          : "down";
    const next = undergroundWorldOpen
      ? resolveUndergroundMovement(
          playerPosition,
          unitX * xSpeed * deltaSeconds,
          unitY * ySpeed * deltaSeconds,
        )
      : resolvePlayerMovement(
          playerPosition,
          unitX * xSpeed * deltaSeconds,
          unitY * ySpeed * deltaSeconds,
          settings.worldTheme,
        );
    const moved =
      Math.abs(next.x - playerPosition.x) > 0.0001 ||
      Math.abs(next.y - playerPosition.y) > 0.0001;
    if (moved) setPlayerPosition(next.x, next.y);
    playerWalkAnimationMs += deltaSeconds * 1000;
    const spriteFrame = Math.floor(playerWalkAnimationMs / 115) % 4;
    if (spriteFrame !== playerLastSpriteFrame) {
      playerLastSpriteFrame = spriteFrame;
      playerFrame = spriteFrame;
      renderPlayer();
    }
  } else {
    playerWalkAnimationMs = 0;
    if (playerLastSpriteFrame !== 0) {
      playerLastSpriteFrame = 0;
      playerFrame = 0;
      renderPlayer();
    }
  }
  playerAnimationFrame = window.requestAnimationFrame(runPlayerMovementFrame);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function projectCode(name, requested) {
  const cleaned = String(requested || "").trim().toUpperCase().slice(0, 3);
  if (cleaned) return cleaned;
  return (
    String(name)
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 3) || "PR"
  );
}

function formatShortDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--/--/----";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function money(value) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

function nextBirthday(value) {
  const [, monthText, dayText] = String(value).split("-");
  const month = Number(monthText);
  const day = Number(dayText);
  if (!month || !day) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let date = new Date(now.getFullYear(), month - 1, day);
  if (date < today) date = new Date(now.getFullYear() + 1, month - 1, day);
  const days = Math.round((date.getTime() - today.getTime()) / 86_400_000);
  return {
    date,
    days,
    label: new Intl.DateTimeFormat("es-AR", {
      day: "numeric",
      month: "short",
    })
      .format(date)
      .replace(".", "")
      .toUpperCase(),
  };
}

function eventTiming(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startEvent = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const days = Math.round(
    (startEvent.getTime() - startToday.getTime()) / 86_400_000,
  );
  return {
    date,
    days,
    label: new Intl.DateTimeFormat("es-AR", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
      .format(date)
      .replaceAll(".", "")
      .toUpperCase(),
  };
}

function daysAwayLabel(days) {
  if (days === 0) return "HOY";
  if (days === 1) return "MAÑANA";
  return `EN ${days} DÍAS`;
}

function upcomingEventRecords() {
  return importantEvents
    .map((event) => ({ ...event, timing: eventTiming(event.date) }))
    .filter((event) => event.timing && event.timing.days >= 0)
    .sort((a, b) => a.timing.date.getTime() - b.timing.date.getTime());
}

function upcomingBirthdayRecords() {
  return allBirthdayRecords()
    .map((birthday) => ({ ...birthday, next: nextBirthday(birthday.date) }))
    .filter((birthday) => birthday.next)
    .sort((a, b) => a.next.days - b.next.days);
}

function nextReminder() {
  const event = upcomingEventRecords()[0];
  const birthday = upcomingBirthdayRecords()[0];
  if (!event && !birthday) return null;
  if (!birthday || (event && event.timing.days <= birthday.next.days)) {
    return {
      kind: "EVENTO",
      title: event.title,
      timing: daysAwayLabel(event.timing.days),
    };
  }
  return {
    kind: "CUMPLEAÑOS",
    title: birthday.name,
    timing: daysAwayLabel(birthday.next.days),
  };
}

function stableProfileBirthdayId(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return -Math.max(1, hash >>> 0);
}

function profileBirthdayRecords() {
  const records = [];
  const spouseName = String(profile.spouseName || "").trim();
  if (profile.married && spouseName && profile.spouseBirthDate) {
    records.push({
      id: stableProfileBirthdayId(`spouse:${spouseName}:${profile.spouseBirthDate}`),
      name: spouseName,
      date: profile.spouseBirthDate,
      notes: "Cumpleaños cargado desde el perfil de tu pareja.",
      createdAt: "",
      profileSource: "spouse",
    });
  }
  (Array.isArray(profile.pets) ? profile.pets : []).forEach((pet) => {
    const name = String(pet.name || "").trim();
    if (!name || !pet.birthDate) return;
    records.push({
      id: stableProfileBirthdayId(`pet:${pet.id}:${pet.birthDate}`),
      name,
      date: pet.birthDate,
      notes: `Cumpleaños de ${String(pet.species || "").trim() || "tu mascota"}, cargado desde el perfil.`,
      createdAt: "",
      profileSource: "pet",
    });
  });
  return records;
}

function allBirthdayRecords() {
  const manualKeys = new Set(
    birthdays.map(
      (birthday) =>
        `${String(birthday.name || "").trim().toLocaleLowerCase()}:${String(birthday.date || "").slice(5)}`,
    ),
  );
  return [
    ...birthdays,
    ...profileBirthdayRecords().filter(
      (birthday) =>
        !manualKeys.has(
          `${birthday.name.trim().toLocaleLowerCase()}:${birthday.date.slice(5)}`,
        ),
    ),
  ];
}

function nextHomeReminders() {
  const event = upcomingEventRecords()[0];
  const birthday = upcomingBirthdayRecords()[0];
  return {
    event: event ? { title: event.title, days: event.timing.days } : null,
    birthday: birthday
      ? { title: birthday.name, days: birthday.next.days }
      : null,
  };
}

function reminderDayParts(days) {
  if (days === 0) return { value: "HOY", unit: "" };
  return { value: String(days), unit: days === 1 ? "DÍA" : "DÍAS" };
}

function todayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function birthdayMatchesDate(value, date = new Date()) {
  const [, monthText, dayText] = String(value).split("-");
  return (
    Number(monthText) === date.getMonth() + 1 &&
    Number(dayText) === date.getDate()
  );
}

function birthdayAlertKey(birthday, phase, date = new Date()) {
  return `${todayKey(date)}:${phase}:${birthday.id}`;
}

function eventMatchesDate(value, date = new Date()) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
  if (!match) return false;
  return (
    Number(match[1]) === date.getFullYear() &&
    Number(match[2]) === date.getMonth() + 1 &&
    Number(match[3]) === date.getDate()
  );
}

function eventAlertKey(event, date = new Date()) {
  return `${todayKey(date)}:event:${event.id}`;
}

function alertStorageKey(alert) {
  return alert.kind === "event" ? EVENT_ALERTS_KEY : BIRTHDAY_ALERTS_KEY;
}

function markBirthdayAlertSeen(alert) {
  try {
    const storageKey = alertStorageKey(alert);
    const saved = readJson(storageKey, []);
    const keys = [
      ...new Set([...(Array.isArray(saved) ? saved : []), alert.key]),
    ].slice(-120);
    localStorage.setItem(storageKey, JSON.stringify(keys));
  } catch {
    // The alert remains visible even when its history cannot be persisted.
  }
}

function readEventSnoozes() {
  const saved = readJson(EVENT_SNOOZES_KEY, {});
  return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
}

function writeEventSnooze(alertKey, until) {
  try {
    const snoozes = readEventSnoozes();
    if (until === null) delete snoozes[alertKey];
    else snoozes[alertKey] = until;
    localStorage.setItem(EVENT_SNOOZES_KEY, JSON.stringify(snoozes));
  } catch {
    // El recordatorio sigue funcionando durante esta sesión aunque falle storage.
  }
}

function forgetBirthdayAlertSeen(alert) {
  try {
    const storageKey = alertStorageKey(alert);
    const saved = readJson(storageKey, []);
    const keys = (Array.isArray(saved) ? saved : []).filter(
      (key) => key !== alert.key,
    );
    localStorage.setItem(storageKey, JSON.stringify(keys));
  } catch {
    // El aplazamiento en memoria sigue siendo suficiente para la sesión actual.
  }
}

function activateBirthdayAlert(alert) {
  activeBirthdayAlert = alert;
  markBirthdayAlertSeen(alert);
  const isEvent = alert.kind === "event";
  const evening = !isEvent && alert.phase === "evening";
  elements.birthdayAlert.classList.toggle("evening", evening);
  elements.birthdayAlertCard.classList.toggle("evening", evening);
  elements.birthdayAlertIcon.textContent = isEvent ? "◷" : "🎂";
  elements.birthdayAlertKicker.textContent = isEvent
    ? "EVENTO IMPORTANTE DE HOY"
    : evening
      ? "RECORDATORIO NOCTURNO"
      : "CUMPLEAÑOS DE HOY";
  elements.birthdayAlertTitle.textContent = isEvent
    ? `¡HOY TENÉS ${alert.event.title}!`
    : evening
      ? `¿TE ACORDASTE DE SALUDAR A ${alert.birthday.name}?`
      : ageFromBirthDate(alert.birthday.date) !== null
        ? `¡${alert.birthday.name} CUMPLE ${ageFromBirthDate(alert.birthday.date)} AÑOS HOY!`
        : `¡HOY CUMPLE ${alert.birthday.name}!`;
  elements.birthdayAlertCopy.textContent = isEvent
    ? "NOK te lo recuerda para que puedas prepararte y llegar a tiempo."
    : evening
      ? `${ageFromBirthDate(alert.birthday.date) !== null ? `Hoy cumplió ${ageFromBirthDate(alert.birthday.date)} años. ` : ""}El día está terminando. Si todavía no lo hiciste, este es el momento de mandarle un mensaje.`
      : `${ageFromBirthDate(alert.birthday.date) !== null ? `Hoy cumple ${ageFromBirthDate(alert.birthday.date)} años. ` : ""}No dejes que se te pase. Un saludo corto puede hacer que su día sea mucho mejor.`;
  const notes = isEvent ? alert.event.notes : alert.birthday.notes;
  elements.birthdayAlertNote.textContent = notes || "";
  elements.birthdayAlertNote.classList.toggle(
    "hidden",
    !notes,
  );
  const pendingEventItems = isEvent
    ? normalizeEventChecklist(alert.event.checklist).filter((item) => !item.done)
    : [];
  elements.eventAlertChecklist.innerHTML = pendingEventItems.length
    ? `<strong>NO TE OLVIDES DE:</strong><ul>${pendingEventItems
        .slice(0, 6)
        .map((item) => `<li>${escapeHtml(item.text)}</li>`)
        .join("")}</ul>`
    : "";
  elements.eventAlertChecklist.classList.toggle("hidden", !pendingEventItems.length);
  elements.confirmBirthdayAlert.textContent =
    evening ? "SÍ, VOY A SALUDARLO" : "LO TENGO PRESENTE";
  elements.snoozeEventAlert.classList.toggle("hidden", !isEvent);
  elements.birthdayAlert.classList.remove("hidden");
  window.setTimeout(() => elements.confirmBirthdayAlert.focus(), 30);
}

function enqueueBirthdayAlerts(alerts) {
  alerts.forEach((alert) => {
    if (alert.kind === "event") {
      const snoozedUntil = Number(readEventSnoozes()[alert.key]) || 0;
      if (snoozedUntil > Date.now()) return;
      if (snoozedUntil) writeEventSnooze(alert.key, null);
    }
    const savedAlertKeys = readJson(alertStorageKey(alert), []);
    const seen = new Set(Array.isArray(savedAlertKeys) ? savedAlertKeys : []);
    if (seen.has(alert.key) || birthdayAlertScheduledKeys.has(alert.key)) return;
    birthdayAlertScheduledKeys.add(alert.key);
    birthdayAlertQueue.push(alert);
  });
  if (!activeBirthdayAlert && birthdayAlertQueue.length > 0) {
    activateBirthdayAlert(birthdayAlertQueue.shift());
  }
}

function checkBirthdayAlerts(now = new Date()) {
  const todayBirthdays = allBirthdayRecords().filter((birthday) =>
    birthdayMatchesDate(birthday.date, now),
  );
  if (todayBirthdays.length === 0) return;
  const phases = ["opening"];
  if (now.getHours() >= BIRTHDAY_EVENING_HOUR) phases.push("evening");
  enqueueBirthdayAlerts(
    phases.flatMap((phase) =>
      todayBirthdays.map((birthday) => ({
        key: birthdayAlertKey(birthday, phase, now),
        kind: "birthday",
        phase,
        birthday,
      })),
    ),
  );
}

function checkEventAlerts(now = new Date()) {
  enqueueBirthdayAlerts(
    importantEvents
      .filter((event) => eventMatchesDate(event.date, now))
      .map((event) => ({
        key: eventAlertKey(event, now),
        kind: "event",
        phase: "opening",
        event,
      })),
  );
}

function closeBirthdayAlert() {
  const next = birthdayAlertQueue.shift();
  if (next) {
    activateBirthdayAlert(next);
    return;
  }
  activeBirthdayAlert = null;
  elements.birthdayAlert.classList.add("hidden");
}

function snoozeActiveEventAlert() {
  const alert = activeBirthdayAlert;
  if (!alert || alert.kind !== "event") return;
  writeEventSnooze(alert.key, Date.now() + 60 * 60 * 1000);
  forgetBirthdayAlertSeen(alert);
  birthdayAlertScheduledKeys.delete(alert.key);
  closeBirthdayAlert();
  showToast("Te lo voy a recordar nuevamente dentro de 1 hora.");
}

function currentWeekDays(now = new Date()) {
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = monday.getDay();
  monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return {
      key: todayKey(date),
      label: new Intl.DateTimeFormat("es-AR", { weekday: "short" })
        .format(date)
        .replace(".", "")
        .toUpperCase(),
      day: String(date.getDate()).padStart(2, "0"),
    };
  });
}

const motivationalPhrases = [
  "Un paso chico también mueve la aventura.",
  "Hecho es mejor que perfecto.",
  "Tu yo de mañana agradece lo que empezás hoy.",
  "Primero la misión; después, la recompensa.",
  "Cinco minutos alcanzan para destrabar el mapa.",
  "La constancia gana experiencia en silencio.",
  "Elegí una cosa. Terminala. Sumá XP.",
  "No necesitás ganas para dar el primer paso.",
  "Hoy solo tenés que avanzar una casilla.",
  "La cabeza se calma cuando la misión queda escrita.",
];

function dailyMotivation(date = new Date()) {
  const seed = Number(todayKey(date).replaceAll("-", ""));
  return motivationalPhrases[seed % motivationalPhrases.length];
}

function normalizeEventChecklist(value) {
  return (Array.isArray(value) ? value : [])
    .map((item, index) => {
      const text = String(item?.text || "").trim().slice(0, 180);
      if (!text) return null;
      const numericId = Number(item?.id);
      return {
        id: Number.isFinite(numericId) ? numericId : Date.now() + index,
        text,
        done: Boolean(item?.done),
      };
    })
    .filter(Boolean)
    .slice(0, 80);
}

function normalizeImportantEvent(event) {
  return {
    ...event,
    taskId: null,
    checklist: normalizeEventChecklist(event?.checklist),
  };
}

function applyTimeOfDay() {
  applyWorldLight(elements.world, progressState.unlockedRewards);
}

function setMusicPlayingState(playing) {
  elements.musicOcarina.classList.toggle("playing", playing);
  elements.musicOcarina.setAttribute("aria-pressed", String(playing));
  elements.musicOcarina.setAttribute(
    "aria-label",
    playing
      ? "Pausar música de concentración"
      : "Reproducir música de concentración",
  );
  elements.musicLabel.textContent = playing ? "PAUSAR" : "MÚSICA";
}

function buttonSoundKind(button) {
  const descriptor = [
    button.id,
    button.className,
    button.getAttribute("aria-label"),
    button.textContent,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("es");
  if (/eliminar|borrar|salir|delete|danger|remove|exit-confirm-yes/.test(descriptor)) {
    return "danger";
  }
  if (
    /cumpl|guardar|agregar|crear|confirm|continuar|empezar|sumar|clavar|primary|complete/.test(
      descriptor,
    )
  ) {
    return "confirm";
  }
  return "tap";
}

function renderCharacterSettings() {
  const unlocked = avatarCustomizationUnlocked();
  const ageGroup = activeCharacterAgeGroup();
  const ageLabel = CHARACTER_AGE_OPTIONS.find((item) => item.id === ageGroup)?.label || "JOVEN ADULTO";
  const hairLabel = CHARACTER_HAIR_OPTIONS.find((item) => item.id === settings.characterHair)?.label || "CASTAÑO";
  elements.characterSettingsContent.innerHTML = `
    <div class="character-settings-summary">
      <span class="setup-character-preview" data-character-current-preview aria-hidden="true"></span>
      <div><strong>${ageLabel}</strong><small>${settings.characterGender === "female" ? "MUJER" : "VARÓN"} · ${hairLabel}</small>${unlocked ? "" : "<em>Se adapta automáticamente a tu fecha de nacimiento.</em>"}</div>
    </div>
    ${unlocked ? `
      <div class="character-free-controls">
        <div>${["male", "female"].map((gender) => `<button type="button" data-settings-character-gender="${gender}" class="${settings.characterGender === gender ? "active" : ""}">${gender === "male" ? "VARÓN" : "MUJER"}</button>`).join("")}</div>
        <div>${CHARACTER_AGE_OPTIONS.map((age) => `<button type="button" data-settings-character-age="${age.id}" class="${ageGroup === age.id ? "active" : ""}">${age.label}</button>`).join("")}</div>
        <div>${CHARACTER_HAIR_OPTIONS.map((hair) => `<button type="button" data-settings-character-hair="${hair.id}" class="${settings.characterHair === hair.id ? "active" : ""}">${hair.label}</button>`).join("")}</div>
      </div>` : '<button class="character-reward-lock" type="button" data-open-character-rewards><svg class="cfg-icon" aria-hidden="true"><use href="#cfg-lock"/></svg> DESBLOQUEAR IDENTIDAD LIBRE EN RECOMPENSAS</button>'}
  `;
  applyCharacterPreview(elements.characterSettingsContent.querySelector("[data-character-current-preview]"));
}

function initializeSettingsAccordions() {
  const definitions = [
    [".settings-world-card", "world", "Mundo y personaje", true],
    [".nok-account-settings", "cloud", "Mi cuenta y guardado", false],
    [".settings-sound-card", "audio", "Audio", false],
    [".settings-controls-card", "controls", "Controles", false],
    [".settings-shortcuts-card", "keys", "Atajos de teclado", false],
    [".settings-quick-access-card", "quick", "Accesos rápidos", false],
    [".settings-visual-card", "visual", "Interfaz y accesibilidad", false],
  ];

  definitions.forEach(([selector, icon, title, startsOpen]) => {
    const section = elements.settingsView?.querySelector(selector);
    if (!section || section.dataset.settingsAccordionReady === "true") return;

    const body = document.createElement("div");
    body.className = "settings-accordion-body";
    while (section.firstChild) body.append(section.firstChild);

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "settings-accordion-toggle";
    toggle.setAttribute("aria-expanded", String(startsOpen));
    toggle.innerHTML = `
      <span class="settings-accordion-icon" aria-hidden="true"><svg class="cfg-icon"><use href="#cfg-${icon}"/></svg></span>
      <strong>${title}</strong>
      <span class="settings-accordion-caret" aria-hidden="true"></span>
    `;

    section.classList.add("settings-accordion");
    section.classList.toggle("settings-collapsed", !startsOpen);
    section.dataset.settingsAccordionReady = "true";
    section.append(toggle, body);

    toggle.addEventListener("click", () => {
      const collapsed = section.classList.toggle("settings-collapsed");
      toggle.setAttribute("aria-expanded", String(!collapsed));
    });
  });
}

function renderSettings() {
  elements.settingsWorldName.value = settings.worldName;
  elements.settingsVolume.value = String(settings.volume);
  elements.settingsVolumeValue.textContent = `${settings.volume}%`;
  elements.settingsMusicEnabled.checked = settings.musicEnabled;
  elements.settingsSoundEffectsEnabled.checked = settings.soundEffectsEnabled;
  elements.settingsKeyboardMovement.checked = settings.keyboardMovement;
  elements.settingsTouchJoystick.checked = settings.touchJoystickEnabled;
  elements.settingsShortcutsEnabled.checked = settings.shortcutsEnabled;
  elements.settingsReducedMotion.checked = settings.reducedMotion;
  elements.settingsHomeReminders.checked = settings.showHomeReminders;
  elements.settingsStrictFocusMode.checked = settings.strictFocusMode;
  renderQuickAccessBar();
  renderQuickAccessPicker();
  document.querySelectorAll("[data-world-theme]").forEach((button) => {
    const active = button.dataset.worldTheme === settings.worldTheme;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  renderCharacterSettings();
}

function applySettings() {
  enforceRewardEntitlements();
  document.querySelector(".app-shell").classList.toggle(
    "reduced-motion",
    settings.reducedMotion,
  );
  document.querySelector(".app-shell").classList.toggle(
    "avatar-female",
    settings.avatarStyle === "adventurer-female",
  );
  elements.world.classList.toggle("earth-mode", settings.worldTheme === "earth");
  elements.playerSpriteImage.style.backgroundImage = `url(${characterAtlasPath()})`;
  elements.playerSpriteImage.style.backgroundSize = "800% 800%";
  document.querySelectorAll(".generated-avatar").forEach((avatar) => applyCharacterPreview(avatar));
  musicEngine?.setVolume(settings.volume / 100);
  soundEngine?.setVolume(settings.volume / 100);
  if (!settings.musicEnabled) void musicEngine?.pause();
  if (!settings.keyboardMovement) pressedMovementKeys.clear();
  elements.mobileJoystick.classList.toggle(
    "is-enabled",
    isMobileRuntime && settings.touchJoystickEnabled,
  );
  elements.undergroundHatch?.classList.toggle("hidden", !rewardUnlocked("underground-access") || undergroundWorldOpen);
  renderWorldBuildProps();
  if (!settings.touchJoystickEnabled) resetMobileJoystick();
  const safePosition = nearestWalkablePosition(
    playerPosition,
    settings.worldTheme,
  );
  if (
    safePosition.x !== playerPosition.x ||
    safePosition.y !== playerPosition.y
  ) {
    setPlayerPosition(safePosition.x, safePosition.y);
  }
  if (petNpcStates) {
    for (const npc of Object.values(petNpcStates)) {
      npc.position = nearestPetWalkablePosition(
        npc.position,
        settings.worldTheme,
      );
      planPetNpcRoute(npc, settings.worldTheme);
    }
  }
  renderWorldModules();
  renderCollisionLayer();
  renderPlayer();
  renderSettings();
  renderReminder();
}

function persistSettings(message = "Ajustes guardados.") {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  markCloudChange();
  applySettings();
  if (message) showToast(message);
}

async function toggleCampMusic() {
  if (!settings.musicEnabled) {
    openPanel("settings");
    showToast("Activá la música desde Ajustes para usar la ocarina.");
    return;
  }
  if (!musicEngine) {
    musicEngine = new window.NokMusicEngine(setMusicPlayingState);
    musicEngine.setVolume(settings.volume / 100);
  }
  try {
    const playing = await musicEngine.toggle();
    showToast(
      playing
        ? "♪ Suena “El claro de NOK”."
        : "La ocarina quedó en pausa.",
    );
  } catch {
    setMusicPlayingState(false);
    showToast("No se pudo iniciar la música en este dispositivo.");
  }
}

function yesterdayKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return todayKey(date);
}

function completionTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function taskTrail(task) {
  const parent =
    task.parentId === null || task.parentId === undefined
      ? null
      : tasks.find((candidate) => candidate.id === task.parentId) || null;
  const parts = [task.project, parent?.title].filter(Boolean);
  return `${task.isQuest ? "QUEST · " : ""}${
    parts.join(" › ") || "TAREA SUELTA"
  }`;
}

function completedTasksOn(dateKey) {
  return tasks
    .filter(
      (task) =>
        task.completedAt &&
        todayKey(new Date(task.completedAt)) === dateKey,
    )
    .sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    );
}

function recentCompletionDays() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const key = todayKey(date);
    return {
      key,
      label: new Intl.DateTimeFormat("es-AR", { weekday: "short" })
        .format(date)
        .replace(".", "")
        .toUpperCase(),
      dateLabel: new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "2-digit",
      }).format(date),
      completed: completedTasksOn(key),
    };
  });
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = `✦ ${message}`;
  elements.toast.classList.remove("hidden");
  toastTimer = window.setTimeout(() => {
    elements.toast.classList.add("hidden");
  }, 3000);
}

function showCompletionCelebration(task, dailyClear = false) {
  window.clearTimeout(toastTimer);
  window.clearTimeout(completionCelebrationTimer);
  elements.toast.classList.add("hidden");
  const card = elements.completionCelebration.querySelector(
    ".completion-celebration-card",
  );
  card.classList.toggle("daily-clear-achievement", dailyClear);
  elements.completionCelebration.querySelector("#completion-medal").textContent =
    dailyClear ? "★" : "✓";
  elements.completionCelebration.querySelector("#completion-kicker").textContent =
    dailyClear ? "LOGRO ESPECIAL DESBLOQUEADO" : "AVENTURA EN PROGRESO";
  elements.completionCelebration.querySelector(
    "#completion-celebration-title",
  ).textContent = dailyClear ? "¡DÍA CONQUISTADO!" : "¡MISIÓN CUMPLIDA!";
  elements.completionTaskTitle.textContent = dailyClear
    ? "Completaste todas las misiones que elegiste para hoy."
    : task.title;
  elements.completionXpReward.textContent = dailyClear
    ? "JORNADA COMPLETA"
    : `+${task.xpReward} XP`;
  elements.completionCelebration.querySelector("#completion-copy").textContent =
    dailyClear
      ? "No quedó ninguna misión pendiente. Cerraste el día como un verdadero aventurero."
      : "Lo hiciste. Cada misión terminada hace crecer tu mundo.";
  elements.closeCompletionCelebration.textContent = dailyClear
    ? "CELEBRAR Y CONTINUAR"
    : "CONTINUAR AVENTURA";
  elements.completionCelebration.classList.remove("is-closing");
  elements.completionCelebration.classList.remove("hidden");
  completionCelebrationTimer = window.setTimeout(() => {
    if (dailyClear) {
      completionCelebrationTimer = window.setTimeout(() => {
        elements.completionCelebration.classList.add("is-closing");
        completionCelebrationTimer = window.setTimeout(
          closeCompletionCelebration,
          180,
        );
      }, 3000);
      return;
    }
    elements.completionCelebration.classList.add("is-closing");
    completionCelebrationTimer = window.setTimeout(
      closeCompletionCelebration,
      180,
    );
  }, 3000);
  window.setTimeout(() => elements.closeCompletionCelebration.focus(), 30);
}

function closeCompletionCelebration() {
  window.clearTimeout(completionCelebrationTimer);
  elements.completionCelebration.classList.add("hidden");
  elements.completionCelebration.classList.remove("is-closing");
  if (achievementQueue.length) window.setTimeout(showNextAchievementCelebration, 120);
}

function openExitConfirm() {
  elements.exitConfirm.classList.remove("hidden");
  window.setTimeout(() => elements.cancelExit.focus(), 30);
}

function closeExitConfirm() {
  elements.exitConfirm.classList.add("hidden");
}

function confirmGameExit() {
  if (isMobileRuntime) {
    window.Capacitor?.Plugins?.App?.exitApp?.();
    return;
  }
  window.nokWindow?.close();
}

function renderHud() {
  const xpInLevel = profile.xp % 120;
  const age = ageFromBirthDate(profile.birthDate);
  if (age !== null) profile.level = age;
  const playerName = String(profile.name || "").trim() || "JUGADOR 1";
  const completedToday = completedTasksOn(todayKey()).length;
  document.querySelector("#level-label").textContent = `NIVEL ${profile.level}`;
  document.querySelector("#player-name-label").textContent = playerName;
  document.querySelector("#map-player-name").textContent = playerName;
  document.querySelector("#xp-label").textContent = `XP ${xpInLevel}/120`;
  document.querySelector("#xp-fill").style.width = `${Math.min(100, (xpInLevel / 120) * 100)}%`;
  document.querySelector("#streak-label").textContent = profile.streak;
  document.querySelector("#today-done-label").textContent = completedToday;
  elements.hudCoinBalance.textContent = progressState.currency;
  document.querySelector("#today-label").textContent = new Intl.DateTimeFormat(
    "es-AR",
    { weekday: "short", day: "numeric", month: "short" },
  )
    .format(new Date())
    .replaceAll(".", "")
    .toUpperCase();
}

function closeActivityPanel() {
  elements.activityPanel.classList.add("hidden");
}

function openActivityPanel(kind) {
  activityTab = kind === "today"
    ? "history"
    : kind === "coins"
      ? "rewards"
      : kind === "streak"
        ? "streak"
        : "stats";
  renderProgressPanel();
  elements.activityPanel.classList.remove("hidden");
  window.setTimeout(() => elements.closeActivity.focus(), 30);
}

function progressHistoryByDay() {
  const days = new Map();
  for (const entry of progressState.completionHistory) {
    const key = todayKey(new Date(entry.completedAt));
    const current = days.get(key) || [];
    current.push(entry);
    days.set(key, current);
  }
  return [...days.entries()].sort(([left], [right]) => right.localeCompare(left));
}

function progressHistoryTotals() {
  const months = new Map();
  const years = new Map();
  for (const entry of progressState.completionHistory) {
    const date = new Date(entry.completedAt);
    if (Number.isNaN(date.getTime())) continue;
    const year = String(date.getFullYear());
    const month = `${year}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    months.set(month, (months.get(month) || 0) + 1);
    years.set(year, (years.get(year) || 0) + 1);
  }
  return {
    months: [...months.entries()].sort(([left], [right]) => right.localeCompare(left)),
    years: [...years.entries()].sort(([left], [right]) => right.localeCompare(left)),
  };
}

function progressMonthLabel(key) {
  const [year, month] = key.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" })
    .format(date)
    .toUpperCase();
}

function nokCoinMarkup(className = "inline-nok-coin") {
  return `<img class="${className}" src="./art/ui/hud/nok-coin.webp" alt="" aria-hidden="true" />`;
}

function progressDayLabel(key) {
  const date = new Date(`${key}T12:00:00`);
  if (Number.isNaN(date.getTime())) return key;
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date).toUpperCase();
}

function renderProgressPanel() {
  elements.activityEyebrow.textContent = "CRÓNICA DEL AVENTURERO";
  elements.activityTitle.textContent = "Salón de logros";
  elements.progressCoinBalance.textContent = progressState.currency;
  elements.progressTabs.forEach((button) => {
    button.classList.toggle("active", button.dataset.progressTab === activityTab);
  });

  const historyByDay = progressHistoryByDay();
  const historyTotals = progressHistoryTotals();
  const completed = progressState.completionHistory.length;
  const created = progressState.totalTasksCreated;
  const bestStreak = progressBestStreak();
  const bestDay = historyByDay.reduce(
    (best, [key, entries]) =>
      entries.length > best.count ? { key, count: entries.length } : best,
    { key: "", count: 0 },
  );

  if (activityTab === "stats") {
    const days = recentCompletionDays();
    const ledgerCounts = new Map(historyByDay.map(([key, entries]) => [key, entries.length]));
    const week = days.map((day) => ({ ...day, count: ledgerCounts.get(day.key) || 0 }));
    const maxCount = Math.max(1, ...week.map((day) => day.count));
    elements.activityContent.innerHTML = `
      <section class="progress-stat-grid">
        <article><img src="./art/ui/achievements/created-100.webp" alt="" aria-hidden="true" /><strong>${created}</strong><small>MISIONES CREADAS</small></article>
        <article><img src="./art/ui/achievements/completed-100.webp" alt="" aria-hidden="true" /><strong>${completed}</strong><small>MISIONES COMPLETADAS</small></article>
        <article><img src="./art/ui/achievements/streak-30.webp" alt="" aria-hidden="true" /><strong>${bestStreak}</strong><small>MAYOR RACHA</small></article>
        <article><span>◆</span><strong>${historyByDay.length}</strong><small>DÍAS CON VICTORIAS</small></article>
      </section>
      <section class="progress-dashboard-grid">
        <article class="progress-week-card">
          <header><div><span class="eyebrow">ÚLTIMOS SIETE DÍAS</span><h3>Ritmo de aventura</h3></div><strong>${week.reduce((sum, day) => sum + day.count, 0)} HECHAS</strong></header>
          <div class="activity-week-grid" aria-label="Últimos siete días">
            ${week.map((day) => `<article class="${day.count ? "active" : ""}"><span>${day.label}</span><div class="activity-bar-shell"><i style="height:${Math.max(day.count ? 20 : 4, Math.round(day.count / maxCount * 100))}%"></i></div><strong>${day.count}</strong><small>${day.dateLabel}</small></article>`).join("")}
          </div>
        </article>
        <article class="progress-best-card">
          <span class="eyebrow">MARCA PERSONAL</span><div class="progress-trophy">★</div><strong>${bestDay.count}</strong>
          <h3>${bestDay.count === 1 ? "MISIÓN EN TU MEJOR DÍA" : "MISIONES EN TU MEJOR DÍA"}</h3>
          <small>${bestDay.key ? progressDayLabel(bestDay.key) : "TU PRIMERA MARCA ESTÁ ESPERANDO"}</small>
        </article>
      </section>
      <button class="progress-history-shortcut" type="button" data-progress-go="history">VER TODO EL REGISTRO DE MISIONES →</button>`;
    return;
  }

  if (activityTab === "streak") {
    const currentStreak = Number(profile.streak) || 0;
    const keys = completionDayKeys().slice(-35).reverse();
    const recentDates = Array.from({ length: 35 }, (_, index) => {
      const date = new Date();
      date.setHours(12, 0, 0, 0);
      date.setDate(date.getDate() - index);
      const key = todayKey(date);
      return {
        key,
        active: keys.includes(key),
        label: new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit" }).format(date),
      };
    }).reverse();
    elements.activityContent.innerHTML = `
      <section class="streak-overview">
        <article class="streak-current-card"><img src="./art/ui/hud/streak-fire.webp" alt="" /><span class="eyebrow">RACHA ACTUAL</span><strong>${currentStreak}</strong><small>${currentStreak === 1 ? "DÍA SEGUIDO" : "DÍAS SEGUIDOS"}</small></article>
        <article class="streak-record-card"><img src="./art/ui/achievements/streak-100.webp" alt="" /><span class="eyebrow">RÉCORD PERSONAL</span><strong>${bestStreak}</strong><small>MAYOR RACHA CONSEGUIDA</small></article>
        <div class="streak-explanation"><span class="eyebrow">CÓMO CONTINÚA</span><h3>Completá al menos una misión por día</h3><p>Cada jornada activa mantiene encendido el fuego. Si un día no completás ninguna misión, la racha actual vuelve a empezar, pero tu récord queda guardado para siempre.</p></div>
      </section>
      <section class="streak-calendar-card"><header><div><span class="eyebrow">ÚLTIMOS 35 DÍAS</span><h3>Camino de constancia</h3></div><strong>${keys.length} DÍAS ACTIVOS</strong></header><div class="streak-calendar-grid">${recentDates.map((day) => `<span class="${day.active ? "active" : ""}" title="${day.label}">${day.active ? "✦" : ""}<small>${day.label}</small></span>`).join("")}</div></section>`;
    return;
  }

  if (activityTab === "history") {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const currentYear = String(now.getFullYear());
    const monthTotal = historyTotals.months.find(([key]) => key === currentMonth)?.[1] || 0;
    const yearTotal = historyTotals.years.find(([key]) => key === currentYear)?.[1] || 0;
    elements.activityContent.innerHTML = `
      <section class="progress-section-heading"><div><span class="eyebrow">DIARIO PERMANENTE</span><h3>Misiones completadas a lo largo del tiempo</h3></div><strong>${completed} REGISTROS</strong></section>
      <section class="history-period-summary"><article><span>ESTE MES</span><strong>${monthTotal}</strong><small>${progressMonthLabel(currentMonth)}</small></article><article><span>ESTE AÑO</span><strong>${yearTotal}</strong><small>${currentYear}</small></article><div class="history-period-ledger"><div><span class="eyebrow">POR MES</span>${historyTotals.months.slice(0, 12).map(([key, count]) => `<b>${progressMonthLabel(key)} <strong>${count}</strong></b>`).join("") || "<small>SIN REGISTROS</small>"}</div><div><span class="eyebrow">POR AÑO</span>${historyTotals.years.map(([key, count]) => `<b>${key} <strong>${count}</strong></b>`).join("") || "<small>SIN REGISTROS</small>"}</div></div></section>
      <div class="progress-history-list">
        ${historyByDay.length ? historyByDay.map(([key, entries]) => `
          <section class="progress-history-day"><header><strong>${progressDayLabel(key)}</strong><span>${entries.length} ${entries.length === 1 ? "MISIÓN" : "MISIONES"}</span></header>
            ${entries.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)).map((entry) => `<article><span class="progress-history-check">✓</span><div><strong>${escapeHtml(entry.title)}</strong><small>${escapeHtml(entry.project || "Tarea suelta")}</small></div><time>${completionTime(entry.completedAt)}</time></article>`).join("")}
          </section>`).join("") : `<div class="activity-empty"><span>◇</span><strong>Tu crónica todavía está en blanco.</strong><small>Cuando completes una misión, va a quedar guardada acá para siempre.</small></div>`}
      </div>`;
    return;
  }

  if (activityTab === "achievements") {
    const claimed = new Set(progressState.claimedAchievements);
    elements.activityContent.innerHTML = `
      <section class="progress-section-heading"><div><span class="eyebrow">CAMINO DE HAZAÑAS</span><h3>Logros y próximas metas</h3></div><strong>${claimed.size} / ${ACHIEVEMENT_DEFINITIONS.length}</strong></section>
      <div class="achievement-grid">${ACHIEVEMENT_DEFINITIONS.map((achievement) => {
        const value = progressMetric(achievement.metric);
        const done = claimed.has(achievement.id);
        const progress = Math.min(100, Math.round(value / achievement.target * 100));
        const missing = Math.max(0, achievement.target - value);
        return `<article class="achievement-card ${done ? "unlocked" : ""}"><div class="achievement-card-icon"><img src="${progressArtworkUrl(achievement.art)}" data-progress-artwork="${achievement.art}" width="256" height="256" loading="eager" decoding="async" alt="Ilustración del logro ${achievement.title.toLowerCase()}" /></div><div class="achievement-card-copy"><span class="eyebrow">${done ? "LOGRO CONSEGUIDO" : `FALTAN ${missing}`}</span><h4>${achievement.title}</h4><p>${achievement.copy}</p><div class="achievement-progress"><i style="width:${progress}%"></i></div><small>${Math.min(value, achievement.target)} / ${achievement.target}</small></div><strong class="achievement-card-reward">${nokCoinMarkup()} ${achievement.coins}</strong></article>`;
      }).join("")}</div>`;
    return;
  }

  const unlocked = new Set(progressState.unlockedRewards);
  elements.activityContent.innerHTML = `
    <section class="progress-section-heading"><div><span class="eyebrow">BAZAR DE RECOMPENSAS</span><h3>Convertí tu constancia en nuevas posibilidades</h3></div><strong class="progress-heading-coins">${nokCoinMarkup()} ${progressState.currency}</strong></section>
    <div class="reward-grid">${REWARD_DEFINITIONS.map((reward) => {
      const owned = unlocked.has(reward.id) || (reward.id === "avatar-freedom" && avatarCustomizationUnlocked());
      const affordable = progressState.currency >= reward.cost;
      return `<article class="reward-card ${owned ? "unlocked" : ""}"><div class="reward-art"><img src="${progressArtworkUrl(reward.art)}" data-progress-artwork="${reward.art}" width="256" height="256" loading="eager" decoding="async" alt="Ilustración de ${reward.title.toLowerCase()}" /></div><span class="eyebrow">${owned ? "DESBLOQUEADO" : "RECOMPENSA"}</span><h4>${reward.title}</h4><p>${reward.copy}</p><button type="button" data-buy-reward="${reward.id}" ${owned || !affordable ? "disabled" : ""}>${owned ? "✓ EN TU COLECCIÓN" : `${nokCoinMarkup()} ${reward.cost} · DESBLOQUEAR`}</button>${!owned && !affordable ? `<small>TE FALTAN ${reward.cost - progressState.currency} MONEDAS</small>` : ""}</article>`;
    }).join("")}</div><p class="reward-footnote">Las recompensas quedan vinculadas a tu mundo y se sincronizan con tus dispositivos.</p>`;
}

function buyProgressReward(rewardId) {
  const reward = REWARD_DEFINITIONS.find((item) => item.id === rewardId);
  if (!reward || progressState.unlockedRewards.includes(reward.id) || (reward.id === "avatar-freedom" && avatarCustomizationUnlocked())) return;
  if (progressState.currency < reward.cost) {
    showToast(`Te faltan ${reward.cost - progressState.currency} monedas NOK.`);
    return;
  }
  progressState.currency -= reward.cost;
  progressState.unlockedRewards.push(reward.id);
  enforceRewardEntitlements();
  persistProgress();
  renderHud();
  applyTimeOfDay();
  applySettings();
  renderProgressPanel();
  showRewardCelebration(reward);
}

function showRewardCelebration(reward) {
  activeRewardCelebration = reward;
  elements.achievementCelebrationEyebrow.textContent = "NUEVA RECOMPENSA DESBLOQUEADA";
  elements.achievementCelebrationTitle.textContent = "¡TU MUNDO CRECIÓ!";
  elements.achievementMedal.src = progressArtworkUrl(reward.art);
  elements.achievementCelebrationName.textContent = reward.title;
  elements.achievementCelebrationCopy.textContent = reward.copy;
  elements.achievementCoinRewardBox.classList.add("hidden");
  elements.achievementContinue.textContent = "CONTINUAR LA AVENTURA";
  elements.achievementCelebration.classList.add("reward-unlocked");
  elements.achievementCelebration.classList.remove("hidden");
  window.clearTimeout(achievementCelebrationTimer);
  achievementCelebrationTimer = window.setTimeout(closeAchievementCelebration, 6000);
  window.setTimeout(() => elements.achievementContinue.focus(), 30);
}

function showNextAchievementCelebration() {
  if (activeAchievement || activeRewardCelebration || !achievementQueue.length) return;
  activeAchievement = achievementQueue.shift();
  elements.achievementCelebrationEyebrow.textContent = "NUEVO LOGRO DESBLOQUEADO";
  elements.achievementCelebrationTitle.textContent = "¡LOGRO CONSEGUIDO!";
  elements.achievementMedal.src = progressArtworkUrl(activeAchievement.art);
  elements.achievementCelebrationName.textContent = activeAchievement.title;
  elements.achievementCelebrationCopy.textContent = activeAchievement.copy;
  elements.achievementCoinReward.textContent = `+${activeAchievement.coins} MONEDAS NOK`;
  elements.achievementCoinRewardBox.classList.remove("hidden");
  elements.achievementContinue.textContent = "GUARDAR RECOMPENSA";
  elements.achievementCelebration.classList.remove("reward-unlocked");
  elements.achievementCelebration.classList.remove("hidden");
  window.clearTimeout(achievementCelebrationTimer);
  achievementCelebrationTimer = window.setTimeout(closeAchievementCelebration, 6000);
  window.setTimeout(() => elements.achievementContinue.focus(), 30);
}

function closeAchievementCelebration() {
  window.clearTimeout(achievementCelebrationTimer);
  elements.achievementCelebration.classList.add("hidden");
  activeAchievement = null;
  activeRewardCelebration = null;
  if (achievementQueue.length) window.setTimeout(showNextAchievementCelebration, 120);
}

function renderProfilePreview() {
  const name = elements.profileName.value.trim() || "JUGADOR 1";
  const age = ageFromBirthDate(elements.profileBirthDate.value);
  elements.profileHeroName.textContent = name;
  elements.profileLevelValue.textContent = age ?? profile.level;
  elements.profileAgeCopy.textContent =
    age === null
      ? "Completá tu fecha de nacimiento para sincronizar tu nivel."
      : `NIVEL ${age} · ${age} AÑOS DE AVENTURA`;
  elements.spouseField.classList.toggle(
    "hidden",
    !elements.profileMarried.checked,
  );
  elements.marriedIcon.textContent = elements.profileMarried.checked ? "♥" : "◇";
  elements.marriedLabel.textContent = elements.profileMarried.checked
    ? "ESTOY CASADO/A"
    : "NO ESTOY CASADO/A";
  elements.profileDatingElapsed.textContent = `${relationshipElapsed(
    elements.profileDatingStartDate.value,
  )} JUNTOS`;
  elements.profileWeddingElapsed.textContent = `${relationshipElapsed(
    elements.profileWeddingDate.value,
  )} DE CASADOS`;
  const appearance = PARTNER_APPEARANCES.includes(profile.spouseAppearance)
    ? profile.spouseAppearance
    : "dark";
  elements.profilePartnerPhoto.className = `partner-photo partner-${appearance}`;
  elements.profileCoupleCaption.textContent = `${name} + ${elements.profileSpouseName.value.trim() || "TU PAREJA"}`;
}

function renderPets() {
  elements.petList.innerHTML = profile.pets.length
    ? profile.pets
        .map(
          (pet) => `
            <article class="pet-summary-card" data-pet-id="${escapeHtml(pet.id)}">
              <button type="button" class="pet-photo pet-${escapeHtml(pet.appearance || defaultPetAppearance(pet.species))}" data-pet-edit="${escapeHtml(pet.id)}" aria-label="Abrir la ficha de ${escapeHtml(pet.name || "mascota")}"></button>
              <button type="button" class="pet-summary-copy" data-pet-edit="${escapeHtml(pet.id)}">
                <small>${escapeHtml(pet.species || "MASCOTA")}</small>
                <strong>${escapeHtml(pet.name || "MASCOTA")}</strong>
                <span>${pet.birthDate ? `NACIÓ EL ${formatShortDate(pet.birthDate)}` : "SIN FECHA DE NACIMIENTO"}</span>
                <em>TOCÁ PARA ABRIR SU FICHA</em>
              </button>
              <button
                type="button"
                class="pet-summary-remove"
                data-pet-delete="${escapeHtml(pet.id)}"
                aria-label="Eliminar mascota"
              >×</button>
            </article>
          `,
        )
        .join("")
    : `
        <div class="profile-empty">
          <span>♣</span>
          <p>Podés agregar todas las mascotas que formen parte de tu vida.</p>
        </div>
      `;
}

function readPetsFromForm() {
  return profile.pets.slice(0, 12);
}

function setPartnerAppearance(appearance) {
  profile.spouseAppearance = PARTNER_APPEARANCES.includes(appearance) ? appearance : "dark";
  elements.partnerWizardPreview.className = `partner-photo partner-${profile.spouseAppearance}`;
  elements.partnerOptionGrid.querySelectorAll("[data-partner-appearance]").forEach((button) => {
    button.classList.toggle("selected", button.dataset.partnerAppearance === profile.spouseAppearance);
  });
}

function openPartnerWizard() {
  elements.partnerWizardName.value = elements.profileSpouseName.value || profile.spouseName || "";
  elements.partnerWizardBirth.value = elements.profileSpouseBirthDate.value || profile.spouseBirthDate || "";
  elements.partnerWizardDating.value = elements.profileDatingStartDate.value || profile.datingStartDate || "";
  elements.partnerWizardWedding.value = elements.profileWeddingDate.value || profile.weddingDate || "";
  elements.partnerWizardBirth.max = todayKey();
  elements.partnerWizardDating.max = todayKey();
  elements.partnerWizardWedding.max = todayKey();
  elements.partnerWizardCaption.textContent = `${elements.profileName.value.trim() || "VOS"} + ${elements.partnerWizardName.value.trim() || "TU PAREJA"}`;
  setPartnerAppearance(profile.spouseAppearance || "dark");
  elements.partnerWizard.classList.remove("hidden");
  window.setTimeout(() => elements.partnerWizardName.focus(), 30);
}

function confirmPartnerWizard() {
  const name = elements.partnerWizardName.value.trim();
  if (!name) {
    showToast("Poné el nombre de tu pareja para continuar.");
    return;
  }
  profile.married = true;
  profile.spouseName = name;
  profile.spouseBirthDate = elements.partnerWizardBirth.value;
  profile.datingStartDate = elements.partnerWizardDating.value;
  profile.weddingDate = elements.partnerWizardWedding.value;
  elements.profileMarried.checked = true;
  elements.profileSpouseName.value = name;
  elements.profileSpouseBirthDate.value = profile.spouseBirthDate;
  elements.profileDatingStartDate.value = profile.datingStartDate;
  elements.profileWeddingDate.value = profile.weddingDate;
  elements.partnerWizard.classList.add("hidden");
  save();
  renderProfile();
  renderAgenda();
  showToast(`¡${name} se sumó a tu aventura!`);
}

function renderPetWizardOptions() {
  const species = normalizedPetSpecies(petWizardDraft.species);
  if (!PET_APPEARANCES[species].includes(petWizardDraft.appearance)) {
    petWizardDraft.appearance = defaultPetAppearance(species);
  }
  elements.petWizardPreview.className = `pet-photo pet-${petWizardDraft.appearance}`;
  elements.petSpeciesPicker.querySelectorAll("[data-pet-species]").forEach((button) => {
    button.classList.toggle("selected", button.dataset.petSpecies === species);
  });
  elements.petOptionGrid.innerHTML = `<legend>ELEGÍ SU COLOR</legend>${PET_APPEARANCES[species].map((appearance) => `
    <button type="button" data-pet-appearance="${appearance}" class="${appearance === petWizardDraft.appearance ? "selected" : ""}">
      <span class="pet-photo pet-${appearance}"></span><strong>${PET_APPEARANCE_LABELS[appearance]}</strong>
    </button>`).join("")}`;
}

function openPetWizard(pet = null) {
  const species = normalizedPetSpecies(pet?.species || "Gato");
  petWizardEditingId = pet?.id || null;
  petWizardDraft = {
    id: pet?.id || `pet-${Date.now()}-${profile.pets.length}`,
    name: pet?.name || "",
    species,
    birthDate: pet?.birthDate || "",
    appearance: pet?.appearance || defaultPetAppearance(species),
  };
  elements.petWizardName.value = petWizardDraft.name;
  elements.petWizardBirth.value = petWizardDraft.birthDate;
  elements.petWizardBirth.max = todayKey();
  renderPetWizardOptions();
  elements.petWizard.classList.remove("hidden");
  window.setTimeout(() => elements.petWizardName.focus(), 30);
}

function confirmPetWizard() {
  const name = elements.petWizardName.value.trim();
  if (!name) {
    showToast("Ponéle un nombre a tu nuevo compañero.");
    return;
  }
  petWizardDraft.name = name;
  petWizardDraft.birthDate = elements.petWizardBirth.value;
  profile.pets = petWizardEditingId
    ? profile.pets.map((pet) => pet.id === petWizardEditingId ? petWizardDraft : pet)
    : [...profile.pets, petWizardDraft];
  elements.petWizard.classList.add("hidden");
  save();
  renderProfile();
  renderAgenda();
  showToast(`${name} ya forma parte de tu mundo.`);
}

function renderWorldCompanions() {
  const spouseName = String(profile.spouseName || "").trim();
  elements.petNpcLayer.innerHTML = visibleWorldPets()
    .map((pet, index) => {
      const kind = petNpcKind(pet.species);
      const key = petNpcKey(pet, index);
      const appearance = pet.appearance || defaultPetAppearance(pet.species);
      return `<div class="world-npc pet-npc ${kind}-npc" data-pet-npc-key="${escapeHtml(key)}" data-appearance="${escapeHtml(appearance)}" aria-label="${escapeHtml(pet.name)}, ${normalizedPetSpecies(pet.species).toLowerCase()} recorriendo el mundo"><i class="pet-npc-sprite" aria-hidden="true"></i></div>`;
    })
    .join("");
  const states = ensurePetNpcStates();
  petActors = [...elements.petNpcLayer.children].map(element => ({
    element, sprite: element.firstElementChild, npc: states[element.dataset.petNpcKey]
  }));
  elements.spouseNpc.classList.toggle("hidden", !(profile.married && spouseName));
  setWorldActorDepth(elements.spouseNpc, 31);
  elements.spouseNpc.dataset.appearance = profile.spouseAppearance || "dark";
  elements.spouseNpcName.textContent = (spouseName || "PAREJA").toUpperCase();
  elements.spouseNpc.setAttribute(
    "aria-label",
    `${spouseName} disfrutando del picnic y leyendo`,
  );
  renderWorldBuildProps();
}

function renderWorldBuildProps() {
  const positions = settings.worldPropPositions;
  if (!positions) return;
  const targets = {
    spouse: elements.spouseNpc,
    ocarina: elements.musicOcarina,
    hatch: elements.undergroundHatch,
  };
  for (const [id, element] of Object.entries(targets)) {
    const position = positions[id];
    if (!element || !position) continue;
    element.style.left = `${position.x}%`;
    element.style.top = `${position.y}%`;
  }
}

function setProfileAutosaveStatus(label, saving = false) {
  if (!elements.profileAutosaveStatus) return;
  elements.profileAutosaveStatus.innerHTML = `<span aria-hidden="true">◆</span> ${label}`;
  elements.profileAutosaveStatus.classList.toggle("saving", saving);
}

function setProfilePassportPage(page) {
  activeProfilePassportPage = PROFILE_PASSPORT_PAGES.includes(page) ? page : "player";
  PROFILE_PASSPORT_PAGES.forEach((candidate) => {
    elements.profileContent.classList.toggle(
      `passport-page-${candidate}`,
      activeProfilePassportPage === candidate,
    );
  });
  elements.passportPageButtons.forEach((button) => {
    const active = button.dataset.passportPage === activeProfilePassportPage;
    button.classList.toggle("active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  const index = PROFILE_PASSPORT_PAGES.indexOf(activeProfilePassportPage);
  elements.passportPageIndicator.textContent = `HOJA ${index + 1} / ${PROFILE_PASSPORT_PAGES.length}`;
  elements.passportPagePrevious.disabled = index === 0;
  elements.passportPageNext.disabled = index === PROFILE_PASSPORT_PAGES.length - 1;
}

function renderWorkProfile() {
  const enabled = Boolean(elements.profileWorkEnabled.checked);
  elements.profileWorkFields.classList.toggle("hidden", !enabled);
  elements.profileWorkEmpty.classList.toggle("hidden", enabled);
  elements.profileWorkIcon.textContent = enabled ? "▣" : "+";
  elements.profileWorkLabel.textContent = enabled
    ? "TENGO UN TRABAJO O EMPRENDIMIENTO"
    : "SUMAR MI TRABAJO AL PASAPORTE";
}

function readProfileFromForm() {
  profile.name = elements.profileName.value.trim();
  profile.birthDate = elements.profileBirthDate.value;
  profile.document = elements.profileDocument.value.trim();
  profile.email = elements.profileEmail.value.trim();
  profile.married = elements.profileMarried.checked;
  profile.spouseName = profile.married ? elements.profileSpouseName.value.trim() : "";
  profile.spouseBirthDate = profile.married ? elements.profileSpouseBirthDate.value : "";
  profile.datingStartDate = profile.married ? elements.profileDatingStartDate.value : "";
  profile.weddingDate = profile.married ? elements.profileWeddingDate.value : "";
  profile.spouseAppearance = profile.married ? (profile.spouseAppearance || "dark") : "dark";
  profile.pets = readPetsFromForm().filter((pet) => pet.name || pet.species).slice(0, 12);
  profile.homeName = elements.profileHomeName.value.trim();
  profile.homeType = elements.profileHomeType.value.trim();
  profile.homeAddress = elements.profileHomeAddress.value.trim();
  profile.homeCity = elements.profileHomeCity.value.trim();
  profile.homeRegion = elements.profileHomeRegion.value.trim();
  profile.homeCountry = elements.profileHomeCountry.value.trim();
  profile.homePostalCode = elements.profileHomePostalCode.value.trim();
  profile.homeSinceDate = elements.profileHomeSinceDate.value;
  profile.homeDetails = elements.profileHomeDetails.value.trim();
  profile.workEnabled = elements.profileWorkEnabled.checked;
  profile.workCompany = profile.workEnabled ? elements.profileWorkCompany.value.trim() : "";
  profile.workRole = profile.workEnabled ? elements.profileWorkRole.value.trim() : "";
  profile.workStartDate = profile.workEnabled ? elements.profileWorkStartDate.value : "";
  profile.workDetails = profile.workEnabled ? elements.profileWorkDetails.value.trim() : "";
  profile.level = ageFromBirthDate(profile.birthDate) ?? Math.floor(profile.xp / 120) + 1;
}

function saveProfileAutomatically() {
  readProfileFromForm();
  save();
  renderProfilePreview();
  renderWorldCompanions();
  renderAgenda();
  checkBirthdayAlerts();
  setProfileAutosaveStatus("GUARDADO AUTOMÁTICO");
}

function scheduleProfileAutosave() {
  window.clearTimeout(profileAutosaveTimer);
  setProfileAutosaveStatus("GUARDANDO…", true);
  profileAutosaveTimer = window.setTimeout(saveProfileAutomatically, 550);
}

function renderProfile() {
  elements.profileName.value = profile.name || "";
  elements.profileBirthDate.value = profile.birthDate || "";
  elements.profileBirthDate.max = todayKey();
  elements.profileDocument.value = profile.document || "";
  elements.profileEmail.value = profile.email || "";
  elements.profileMarried.checked = Boolean(profile.married);
  elements.profileSpouseName.value = profile.spouseName || "";
  elements.profileSpouseBirthDate.value = profile.spouseBirthDate || "";
  elements.profileSpouseBirthDate.max = todayKey();
  elements.profileDatingStartDate.value = profile.datingStartDate || "";
  elements.profileDatingStartDate.max = todayKey();
  elements.profileWeddingDate.value = profile.weddingDate || "";
  elements.profileWeddingDate.max = todayKey();
  elements.profileHomeName.value = profile.homeName || "";
  elements.profileHomeType.value = profile.homeType || "";
  elements.profileHomeAddress.value = profile.homeAddress || "";
  elements.profileHomeCity.value = profile.homeCity || "";
  elements.profileHomeRegion.value = profile.homeRegion || "";
  elements.profileHomeCountry.value = profile.homeCountry || "";
  elements.profileHomePostalCode.value = profile.homePostalCode || "";
  elements.profileHomeSinceDate.value = profile.homeSinceDate || "";
  elements.profileHomeSinceDate.max = todayKey();
  elements.profileHomeDetails.value = profile.homeDetails || "";
  elements.profileWorkEnabled.checked = Boolean(profile.workEnabled);
  elements.profileWorkCompany.value = profile.workCompany || "";
  elements.profileWorkRole.value = profile.workRole || "";
  elements.profileWorkStartDate.value = profile.workStartDate || "";
  elements.profileWorkStartDate.max = todayKey();
  elements.profileWorkDetails.value = profile.workDetails || "";
  renderWorkProfile();
  renderPets();
  renderProfilePreview();
  renderWorldCompanions();
  setProfileAutosaveStatus("GUARDADO AUTOMÁTICO");
}

function renderReminder() {
  const reminders = nextHomeReminders();
  const visible = Boolean(
    settings.showHomeReminders && (reminders.event || reminders.birthday),
  );
  elements.persistentReminder.classList.toggle("hidden", !visible);
  elements.eventReminder.classList.toggle("hidden", !reminders.event);
  elements.birthdayReminder.classList.toggle("hidden", !reminders.birthday);
  if (reminders.event) {
    const day = reminderDayParts(reminders.event.days);
    elements.eventReminderDays.textContent = day.value;
    elements.eventReminderUnit.textContent = day.unit;
    elements.eventReminderTitle.textContent = reminders.event.title;
    elements.eventReminderTitle.title = reminders.event.title;
  }
  if (reminders.birthday) {
    const day = reminderDayParts(reminders.birthday.days);
    elements.birthdayReminderDays.textContent = day.value;
    elements.birthdayReminderUnit.textContent = day.unit;
    elements.birthdayReminderTitle.textContent = reminders.birthday.title;
    elements.birthdayReminderTitle.title = reminders.birthday.title;
  }
}

function setPanelView(view) {
  for (const panel of [
    elements.boardView,
    elements.missionView,
    elements.tasksView,
    elements.projectsView,
    elements.profileView,
    elements.settingsView,
    elements.hubView,
    elements.listsView,
    elements.drawingView,
    elements.undergroundView,
    elements.puzzleView,
    elements.financeView,
    elements.creativityView,
    elements.agendaView,
    elements.calendarView,
  ]) {
    panel.classList.add("hidden");
  }
  view.classList.remove("hidden");
}

function setQuickbarActive(type) {
  const activeType =
    type === "tasks"
      ? "projects"
      : type === "calendar"
        ? "agenda"
        : type;
  document.querySelectorAll(".quickbar button").forEach((button) => {
    const matchesPanel = button.dataset.open === activeType;
    const matchesNew = activeType === "new" && button.hasAttribute("data-new-task");
    button.classList.toggle("active", matchesPanel || matchesNew);
  });
}

function openPanel(type) {
  if (isMissionFocusLocked() && type !== "mission") return;
  if (type !== "finance" && !elements.financeView.classList.contains("hidden")) lockPasswordVault();
  if (type === "drawing" && !rewardUnlocked("drawing-portal")) {
    showToast("Desbloqueá el Portal de dibujo en el Salón de logros.");
    return;
  }
  if (
    type !== "creativity" &&
    !elements.creativityView.classList.contains("hidden")
  ) {
    persistActiveWritingDraft();
  }
  setQuickbarActive(type);
  elements.panelBackdrop.classList.remove("hidden");
  elements.panelBackdrop.classList.toggle("board-mode", type === "board");
  elements.panelBackdrop.classList.toggle("mission-mode", type === "mission");
  elements.panelBackdrop.classList.toggle("finance-mode", type === "finance");
  elements.panelBackdrop.classList.toggle("creativity-mode", type === "creativity");
  elements.panelBackdrop.classList.toggle("hub-mode", type === "hub");
  elements.panelBackdrop.classList.toggle("lists-mode", type === "lists");
  elements.panelBackdrop.classList.toggle("drawing-mode", type === "drawing");
  elements.panelBackdrop.classList.toggle("underground-mode", type === "underground");
  elements.panelBackdrop.classList.toggle("profile-mode", type === "profile");
  elements.panelBackdrop.classList.toggle(
    "archive-mode",
    type === "agenda" || type === "calendar",
  );
  elements.panelHeader.classList.toggle(
    "hidden",
    type === "board" || type === "creativity",
  );
  elements.sidePanel.className =
    type === "board" ? "notice-board-panel" : "side-panel pixel-box";
  if (type === "tasks") elements.sidePanel.classList.add("project-task-panel");
  if (type === "projects") elements.sidePanel.classList.add("projects-panel");
  if (type === "mission") elements.sidePanel.classList.add("mission-panel");
  if (type === "profile") elements.sidePanel.classList.add("profile-panel");
  if (type === "settings") elements.sidePanel.classList.add("settings-panel");
  if (type === "finance") elements.sidePanel.classList.add("finance-panel");
  if (type === "hub") elements.sidePanel.classList.add("hub-panel");
  if (type === "lists") elements.sidePanel.classList.add("lists-panel");
  if (type === "drawing") elements.sidePanel.classList.add("drawing-panel");
  if (type === "underground") elements.sidePanel.classList.add("underground-panel");
  if (type === "puzzle") elements.sidePanel.classList.add("puzzle-panel");
  if (type === "creativity") elements.sidePanel.classList.add("creativity-panel");
  if (type === "agenda") elements.sidePanel.classList.add("agenda-panel");
  if (type === "calendar") elements.sidePanel.classList.add("calendar-panel");
  if (type === "agenda" || type === "calendar") {
    elements.sidePanel.classList.add("archive-panel");
  }

  if (type === "board") {
    boardMode = "today";
    boardMobileSection = "today";
    boardMotivationExpanded = false;
    projectFilter = "";
    questStack = [];
    setPanelView(elements.boardView);
    renderBoard();
  } else if (type === "mission") {
    const available = actionableTasks();
    missionTaskId = available.length
      ? available[Math.floor(Math.random() * available.length)].id
      : null;
    missionFocusReviewOpen = false;
    startMissionFocus(Boolean(missionTaskId));
    elements.panelEyebrow.textContent = "MISIÓN IMPORTANTE";
    elements.panelTitle.textContent = "¿Qué hago ahora?";
    setPanelView(elements.missionView);
    renderMission();
  } else if (type === "projects") {
    elements.panelEyebrow.textContent = "MAPA DE TU VIDA";
    elements.panelTitle.textContent = "Proyectos";
    setPanelView(elements.projectsView);
    renderProjects();
  } else if (type === "profile") {
    elements.panelEyebrow.textContent = "IDENTIDAD DEL AVENTURERO";
    elements.panelTitle.textContent = "Ficha del jugador";
    setPanelView(elements.profileView);
    renderProfile();
    setProfilePassportPage("player");
  } else if (type === "settings") {
    elements.panelEyebrow.textContent = "CONFIGURACIÓN DEL CAMPAMENTO";
    elements.panelTitle.textContent = "Ajustes";
    setPanelView(elements.settingsView);
    initializeSettingsAccordions();
    renderSettings();
  } else if (type === "finance") {
    elements.panelEyebrow.textContent = "COFRE DEL JUGADOR";
    elements.panelTitle.textContent = "Cofre personal";
    setPanelView(elements.financeView);
    lockPasswordVault();
    setCofferTab("home");
    renderFinance();
  } else if (type === "hub") {
    elements.panelEyebrow.textContent = "MESA DE HERRAMIENTAS";
    elements.panelTitle.textContent = "HUB";
    setPanelView(elements.hubView);
    setHubTab("home");
    renderHub();
  } else if (type === "lists") {
    elements.panelEyebrow.textContent = "ARCHIVO DE LISTAS";
    elements.panelTitle.textContent = "Listas rápidas";
    setPanelView(elements.listsView);
    quickListDeleteArmedId = null;
    renderQuickLists();
  } else if (type === "drawing") {
    elements.panelEyebrow.textContent = "TALLER VISUAL";
    elements.panelTitle.textContent = "Estudio de dibujo";
    setPanelView(elements.drawingView);
    renderDrawings();
    requestAnimationFrame(() => loadDrawingCanvas(activeDrawingId ? drawingIdeas.find((idea) => idea.id === activeDrawingId)?.image : null));
  } else if (type === "underground") {
    elements.panelEyebrow.textContent = "BAJO EL CAMPAMENTO";
    elements.panelTitle.textContent = "Caverna de respaldo";
    setPanelView(elements.undergroundView);
    renderUnderground();
  } else if (type === "puzzle") {
    elements.panelEyebrow.textContent = "ACADEMIA DEL CAMPAMENTO";
    elements.panelTitle.textContent = "Aprendizaje diario";
    setPanelView(elements.puzzleView);
    openLearningAcademy();
  } else if (type === "creativity") {
    elements.panelEyebrow.textContent = "ARCHIVO CREATIVO";
    elements.panelTitle.textContent = "Biblioteca de ideas";
    setPanelView(elements.creativityView);
    writingEditorOpen = false;
    renderWriting();
  } else if (type === "agenda") {
    elements.panelEyebrow.textContent = "ARCHIVO DEL TIEMPO";
    elements.panelTitle.textContent = "Agenda y cumpleaños";
    setPanelView(elements.agendaView);
    renderAgenda();
  } else if (type === "calendar") {
    elements.panelEyebrow.textContent = "ARCHIVO DEL TIEMPO";
    elements.panelTitle.textContent = "Calendario";
    setPanelView(elements.calendarView);
    renderCalendar();
  } else {
    elements.panelEyebrow.textContent = currentQuest()
      ? "QUEST EN CURSO"
      : "MISIONES DEL PROYECTO";
    elements.panelTitle.textContent =
      currentQuest()?.title || projectFilter || "Tareas";
    setPanelView(elements.tasksView);
    renderTasks();
  }
}

function enterUndergroundWorld() {
  if (!rewardUnlocked("underground-access")) {
    showToast("Desbloqueá el acceso al sótano en el Salón de logros.");
    return;
  }
  setWorldBuildMode(false);
  campPlayerPosition = { ...playerPosition };
  undergroundWorldOpen = true;
  setPlayerPosition(50, 76);
  playerDirection = "up";
  renderPlayer();
  elements.world.classList.add("underground-world-open");
  elements.undergroundWorldScene?.classList.remove("hidden");
  elements.undergroundHatch?.classList.add("hidden");
  document.querySelector(".quickbar")?.classList.add("underground-hidden");
  document.querySelector(".persistent-reminder-stack")?.classList.add("underground-hidden");
}

function leaveUndergroundWorld() {
  undergroundWorldOpen = false;
  const returnPosition = campPlayerPosition || PLAYER_SPAWN;
  campPlayerPosition = null;
  setPlayerPosition(returnPosition.x, returnPosition.y);
  playerDirection = "down";
  renderPlayer();
  elements.world.classList.remove("underground-world-open");
  elements.undergroundWorldScene?.classList.add("hidden");
  elements.undergroundHatch?.classList.remove("hidden");
  document.querySelector(".quickbar")?.classList.remove("underground-hidden");
  document.querySelector(".persistent-reminder-stack")?.classList.remove("underground-hidden");
}

function closePanel() {
  if (isMissionFocusLocked()) return;
  closeScriptContextMenu();
  if (!elements.creativityView.classList.contains("hidden")) {
    persistActiveWritingDraft();
  }
  if (!elements.financeView.classList.contains("hidden")) {
    lockPasswordVault();
  }
  elements.panelBackdrop.classList.add("hidden");
  setQuickbarActive(null);
}

function actionableTasks() {
  return tasks.filter((task) => {
    if (task.status === "done") return false;
    const unfinishedChildren = tasks.some(
      (child) => child.parentId === task.id && child.status !== "done",
    );
    return !task.isQuest || !unfinishedChildren;
  });
}

function recommendedTask() {
  const active = actionableTasks();
  return tasks.find((task) => task.id === missionTaskId && task.status !== "done") || active[0] || null;
}

function missionFocusSecondsLeft() {
  return Math.max(0, Math.ceil((missionFocusEndsAt - Date.now()) / 1000));
}

function isMissionFocusLocked() {
  return (
    !elements.panelBackdrop?.classList.contains("hidden") &&
    elements.panelBackdrop?.classList.contains("mission-mode") &&
    missionFocusSecondsLeft() > 0
  );
}

function formatMissionFocusTime(seconds) {
  const safe = Math.max(0, Number(seconds) || 0);
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

function setNativeMissionFocusLock(enabled) {
  window.nokWindow?.setFocusLock?.(Boolean(enabled && settings.strictFocusMode));
}

function emergencyExitMissionFocus() {
  if (missionFocusTimer) window.clearInterval(missionFocusTimer);
  missionFocusTimer = null;
  missionFocusEndsAt = 0;
  missionFocusReviewOpen = false;
  setNativeMissionFocusLock(false);
  renderMission();
  showToast("Salida de emergencia activada. El modo enfoque fue liberado.");
}

function startMissionFocus(hasTask) {
  if (missionFocusTimer) window.clearInterval(missionFocusTimer);
  missionFocusTimer = null;
  missionFocusReviewOpen = false;
  missionFocusEndsAt = hasTask
    ? Date.now() + MISSION_FOCUS_DURATION_SECONDS * 1000
    : 0;
  setNativeMissionFocusLock(Boolean(hasTask));
  if (!hasTask) return;
  missionFocusTimer = window.setInterval(() => {
    const secondsLeft = missionFocusSecondsLeft();
    if (secondsLeft > 0) {
      const clock = elements.missionContent.querySelector(".mission-focus-clock");
      const progressBar = elements.missionContent.querySelector(".mission-focus-progress i");
      if (clock) clock.textContent = formatMissionFocusTime(secondsLeft);
      if (progressBar) {
        const elapsed = MISSION_FOCUS_DURATION_SECONDS - secondsLeft;
        progressBar.style.width = `${Math.max(0, Math.min(100, (elapsed / MISSION_FOCUS_DURATION_SECONDS) * 100))}%`;
      }
      return;
    }
    window.clearInterval(missionFocusTimer);
    missionFocusTimer = null;
    missionFocusEndsAt = 0;
    missionFocusReviewOpen = true;
    setNativeMissionFocusLock(false);
    renderMission();
    showToast("Cinco minutos de enfoque completados. Ya podés cerrar o completar la misión.");
    if (settings.soundEffectsEnabled && settings.volume > 0) {
      if (!soundEngine) soundEngine = new window.NokSoundEngine();
      soundEngine.setVolume(settings.volume / 100);
      void soundEngine.play("confirm").catch(() => {});
    }
  }, 250);
}

function missionFocusSteps(task) {
  return tasks
    .filter((candidate) => candidate.parentId === task.id)
    .sort((a, b) => (Number(a.sortOrder) || a.id) - (Number(b.sortOrder) || b.id));
}

function addMissionFocusStep(title) {
  const parent = recommendedTask();
  const stepTitle = String(title || "").trim();
  if (!parent || !stepTitle) return;
  parent.isQuest = true;
  tasks.unshift({
    id: Date.now(),
    title: stepTitle,
    details: "",
    area: parent.area,
    project: parent.project,
    priority: "low",
    status: "todo",
    parentId: parent.id,
    isQuest: false,
    isToday: Boolean(parent.isToday),
    scheduledDate: parent.scheduledDate || "",
    xpReward: 20,
    sortOrder: Date.now(),
    createdAt: new Date().toISOString(),
    completedAt: null,
  });
  recordTaskCreated();
  save();
  renderMission();
  elements.missionContent.querySelector("[data-focus-step-input]")?.focus();
}

function toggleMissionFocusStep(id) {
  const step = tasks.find((task) => task.id === id);
  if (!step) return;
  step.status = step.status === "done" ? "todo" : "done";
  step.completedAt = step.status === "done" ? new Date().toISOString() : null;
  save();
  renderMission();
}

function renderMission() {
  const task = recommendedTask();
  const secondsLeft = missionFocusSecondsLeft();
  const locked = Boolean(task) && secondsLeft > 0;
  elements.panelBackdrop.classList.toggle("mission-focus-lock", locked);
  elements.sidePanel.classList.toggle("mission-focus-locked", locked);
  elements.panelClose.classList.toggle("hidden", locked);
  if (!task) {
    elements.missionContent.innerHTML = `
      <div class="mission-orbit"><span>?</span></div>
      <h2>Tu primera misión es vaciar la cabeza.</h2>
      <p>Anotá eso que viene dando vueltas. Después elegimos un próximo paso chico y concreto.</p>
      <button class="primary-action" data-new-task>+ ANOTAR PRIMERA IDEA</button>
    `;
    return;
  }

  if (locked) {
    const elapsed = MISSION_FOCUS_DURATION_SECONDS - secondsLeft;
    const progress = Math.max(
      0,
      Math.min(100, (elapsed / MISSION_FOCUS_DURATION_SECONDS) * 100),
    );
    const focusSteps = missionFocusSteps(task);
    elements.missionContent.innerHTML = `
      <div class="mission-focus-session" role="timer" aria-live="polite">
        <span class="mission-focus-kicker">MODO ENFOQUE · 5 MINUTOS</span>
        <h2>${escapeHtml(task.title)}</h2>
        <div class="mission-focus-context">
          <span>${task.area === "laboral" ? "TRABAJO" : "PERSONAL"}</span>
          <strong>${escapeHtml(task.project)}</strong>
        </div>
        <strong class="mission-focus-clock">${formatMissionFocusTime(secondsLeft)}</strong>
        <div class="mission-focus-progress" aria-hidden="true"><i style="width:${progress}%"></i></div>
        <p>Avanzá un solo paso de esta misión. El resto del mundo queda en pausa.</p>
        <section class="mission-focus-breakdown">
          <div class="mission-focus-breakdown-heading">
            <strong>PASOS PARA AVANZAR</strong>
            <small>${focusSteps.filter((step) => step.status !== "done").length} PENDIENTES</small>
          </div>
          <div class="mission-focus-step-list">
            ${focusSteps.map((step) => `
              <button type="button" class="${step.status === "done" ? "done" : ""}" data-focus-step-toggle="${step.id}">
                <i aria-hidden="true">${step.status === "done" ? "✓" : ""}</i>
                <span>${escapeHtml(step.title)}</span>
              </button>
            `).join("")}
          </div>
          <form data-focus-step-form>
            <input data-focus-step-input maxlength="120" placeholder="Anotá un paso concreto para esta misión…" aria-label="Nuevo paso para esta misión" />
            <button type="submit">+ AGREGAR</button>
          </form>
        </section>
        <small>Cuando el reloj llegue a cero vas a decidir cómo continúa esta misión.</small>
      </div>
    `;
    return;
  }

  if (missionFocusReviewOpen) {
    elements.missionContent.innerHTML = `
      <div class="mission-focus-review">
        <span class="mission-focus-finished">✦ SESIÓN DE ENFOQUE COMPLETADA</span>
        <div class="mission-orbit" aria-hidden="true"><span>✓</span></div>
        <span class="quest-kicker">${escapeHtml(task.project)}</span>
        <h2>¿Completaste la misión?</h2>
        <p>${escapeHtml(task.title)}</p>
        <div class="mission-focus-review-actions">
          <button type="button" class="mission-focus-review-complete" data-focus-result="complete">✓ SÍ, MISIÓN CUMPLIDA</button>
          <button type="button" data-focus-result="later">CONTINÚA MÁS ADELANTE</button>
        </div>
      </div>
    `;
    return;
  }

  const details = task.details
    ? `<p>${escapeHtml(task.details)}</p>`
    : "";
  elements.missionContent.innerHTML = `
    <span class="mission-focus-finished">✦ 5 MINUTOS DE ENFOQUE COMPLETADOS</span>
    <div class="mission-orbit"><span>!</span></div>
    <span class="quest-kicker">MISIÓN RECOMENDADA</span>
    <h2>${escapeHtml(task.title)}</h2>
    ${details}
    <div class="mission-actions">
      <button class="mission-complete-action" data-task-action="done"
        data-task-id="${task.id}">✓ MARCAR CUMPLIDA</button>
      <div class="mission-secondary-actions">
        <button class="${task.isToday ? "today-active" : ""}" data-task-action="today"
          data-task-id="${task.id}">${task.isToday ? "✓ EN HOY" : "+ SUMAR A HOY"}</button>
        <button data-task-action="edit" data-task-id="${task.id}">✎ EDITAR / MOVER</button>
        <button class="delete-task" data-task-action="delete"
          data-task-id="${task.id}">ELIMINAR</button>
      </div>
    </div>
  `;
}

function renderBoard() {
  const open = tasks.filter((task) => task.status !== "done");
  const ordered = [...open].sort((a, b) => {
    const score = (task) => (task.priority === "high" ? 0 : 1);
    return (
      score(a) - score(b) ||
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  });
  const dateKey = todayKey();
  const oneColumn = isMobileRuntime && singleBoardColumn.matches;
  const showImportant = boardMode === "today" && (!oneColumn || boardMobileSection === "today");
  const showBacklog = boardMode === "today" && (!oneColumn || boardMobileSection === "backlog");
  const important = ordered
    .filter((task) => task.isToday || task.scheduledDate === dateKey);
  const importantIds = new Set(important.map((task) => task.id));
  const loose = !showBacklog ? [] : ordered
    .filter((task) => !task.isQuest && !importantIds.has(task.id))
    .sort((a, b) => {
      return (
        (a.priority === "high" ? 0 : 1) -
          (b.priority === "high" ? 0 : 1) ||
        taskTrail(a).localeCompare(taskTrail(b), "es") ||
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });

  const card = (task, showContext = false) => `
    <article class="board-task-row task-clickable board-task-draggable${task.priority === "high" ? " high-priority-task" : ""}"
      data-task-card="${task.id}" data-board-task="${task.id}"
      draggable="${editingTaskId !== task.id}">
      <div>
        ${
          editingTaskId === task.id
            ? `<input class="board-title-inline" data-inline-task-title="${task.id}"
                maxlength="120" value="${escapeHtml(task.title)}" aria-label="Editar nombre de la tarea" />`
            : `<strong>${escapeHtml(task.title)}</strong>`
        }
        <small>${
          showContext
            ? `${escapeHtml(taskTrail(task))}`
            : `${escapeHtml(task.project || "TAREA SUELTA")}`
        }</small>
      </div>
      ${showContext ? `<button class="board-today" data-task-action="today"
        data-task-id="${task.id}" aria-label="Sumar ${escapeHtml(task.title)} a hoy">HOY</button>` : ""}
      <button class="board-complete" data-task-action="done"
        data-task-id="${task.id}" aria-label="Completar ${escapeHtml(task.title)}">✓</button>
      <button class="board-delete ui-delete-action" data-task-action="delete"
        data-task-id="${task.id}" aria-label="Eliminar ${escapeHtml(task.title)}">×</button>
    </article>
  `;
  elements.boardImportantList.innerHTML = !showImportant ? "" : important.length
    ? important.map((task) => card(task)).join("")
    : '<p class="wood-empty">Tu día está libre. Escribí una tarea rápida arriba o elegí “+ A HOY” en cualquier misión.</p>';
  elements.boardLooseList.innerHTML = !showBacklog ? "" : loose.length
    ? loose.map((task) => card(task, true)).join("")
    : '<p class="wood-empty">No hay otras tareas pendientes por ahora.</p>';

  const boardEvents = upcomingEventRecords()
    .filter((event) => event.timing.days <= 30)
    .slice(0, 3);
  elements.boardEventAlert.innerHTML = `
    ${
      boardEvents.length
        ? boardEvents
            .map(
              (event) => `
                <article class="board-upcoming-entry" data-board-event="${event.id}"
                  role="button" tabindex="0">
                  <strong>${escapeHtml(event.title)}</strong>
                  <small>${event.timing.label} · ${daysAwayLabel(event.timing.days)}</small>
                </article>
              `,
            )
            .join("")
        : "<small>No hay eventos dentro de los próximos 30 días.</small>"
    }
  `;

  const debts = financeEntries.filter((entry) => entry.type === "debt");
  const debtTotal = debts.reduce(
    (sum, entry) => sum + Number(entry.amount || 0),
    0,
  );
  elements.boardDebtAlert.innerHTML = `
    <div><span>DEUDAS REGISTRADAS</span><strong>${money(debtTotal)}</strong></div>
    ${
      debts.length
        ? debts
            .slice(0, 2)
            .map(
              (entry) =>
                `<small>${escapeHtml(entry.name)}: ${money(Number(entry.amount))}</small>`,
            )
            .join("")
        : "<small>Sin deudas cargadas en el cofre.</small>"
    }
  `;
  elements.boardDebtAlert.classList.toggle("hidden", debtTotal <= 0);

  const upcoming = upcomingBirthdayRecords()
    .filter((birthday) => birthday.next.days <= 30)
    .slice(0, 4);
  elements.birthdayList.innerHTML = upcoming.length
    ? upcoming
        .map(
          (birthday) => `
            <article>
              <div>
                <strong>${escapeHtml(birthday.name)}</strong>
                <small>${birthday.next.label} · ${
                  birthday.next.days === 0
                    ? "HOY"
                    : `EN ${birthday.next.days} DÍAS`
                }</small>
              </div>
            </article>
          `,
        )
        .join("")
    : "<small>No hay cumpleaños dentro de los próximos 30 días.</small>";

  elements.motivationNote.innerHTML = `
    <span>✦ MENSAJE DEL DÍA</span>
    <strong>${escapeHtml(dailyMotivation())}</strong>
  `;
  elements.motivationNote.classList.toggle("expanded", boardMotivationExpanded);
  elements.motivationNote.setAttribute(
    "aria-expanded",
    String(boardMotivationExpanded),
  );
  for (const button of elements.boardView.querySelectorAll(
    "[data-board-mobile-section]",
  )) {
    const active = button.dataset.boardMobileSection === boardMobileSection;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  }
  for (const panel of elements.boardView.querySelectorAll(
    "[data-board-mobile-panel]",
  )) {
    panel.classList.toggle(
      "mobile-board-section-active",
      panel.dataset.boardMobilePanel === boardMobileSection,
    );
  }

  document.querySelector("#board-today").textContent =
    document.querySelector("#today-label").textContent;
  elements.boardHeadingTitle.textContent =
    boardMode === "week" ? "Mapa de la semana" : "Lo que importa hoy";
  elements.boardTodayMode.classList.toggle("active", boardMode === "today");
  elements.boardWeekMode.classList.toggle("active", boardMode === "week");
  elements.boardTodayView.classList.toggle("hidden", boardMode !== "today");
  elements.boardWeekView.classList.toggle("hidden", boardMode !== "week");
  elements.boardView
    .querySelector(".notice-board-surface")
    .classList.toggle("week-surface", boardMode === "week");
  if (boardMode === "week") renderWeekBoard(ordered);
}

function weekTaskCard(task) {
  return `
    <article class="week-task-card task-clickable${task.priority === "high" ? " high-priority-task" : ""}" draggable="true"
      data-week-task="${task.id}" data-task-card="${task.id}">
      <span>
        <strong>${escapeHtml(task.title)}</strong>
        <small>${escapeHtml(task.project || "TAREA SUELTA")}</small>
      </span>
      <button class="week-task-delete" data-task-action="delete"
        data-task-id="${task.id}" aria-label="Eliminar ${escapeHtml(task.title)}">×</button>
    </article>
  `;
}

function renderWeekBoard(openTasks) {
  const days = currentWeekDays();
  const weekKeys = new Set(days.map((day) => day.key));
  const backlog = openTasks.filter(
    (task) => !weekKeys.has(task.scheduledDate || ""),
  );
  elements.weekBacklog.dataset.weekDate = "";
  elements.weekBacklog.innerHTML = `
    <header>
      <div>
        <span>MOCHILA DE MISIONES</span>
        <small>Arrastrá una tarea al día que quieras.</small>
      </div>
      <b>${backlog.length}</b>
    </header>
    <div>${backlog.map(weekTaskCard).join("")}</div>
  `;
  elements.weekDaysGrid.innerHTML = days
    .map((day, dayIndex) => {
      const dayTasks = openTasks.filter(
        (task) => task.scheduledDate === day.key,
      );
      const [planKey, planLabel] = DAILY_PLAN_DAYS[dayIndex];
      const routines = dailyPlan[planKey] || [];
      return `
        <section class="week-day-note ${
          day.key === todayKey() ? "current-day" : ""
        }" data-week-date="${day.key}">
          <header><span>${day.label}</span><b>${day.day}</b></header>
          <div class="week-day-missions">
            ${
              dayTasks.length
                ? dayTasks.map(weekTaskCard).join("")
                : '<small class="week-empty">SOLTÁ ACÁ</small>'
            }
          </div>
          <section class="week-routines">
            <header><span>RUTINAS</span><b>${routines.length}</b></header>
            <form class="week-routine-form" data-daily-plan-form="${planKey}">
              <input name="daily-plan-item" maxlength="140" placeholder="Rutina recurrente…" aria-label="Nueva rutina de ${planLabel}" required />
              <button type="submit" aria-label="Agregar rutina">+</button>
            </form>
            <div class="week-routine-list">
              ${routines.length ? routines.map((item) => `
                <article class="week-routine-item">
                  <span aria-hidden="true">↻</span>
                  <strong>${escapeHtml(item.text)}</strong>
                  <button type="button" data-daily-plan-delete="${escapeHtml(item.id)}" data-daily-plan-key="${planKey}" aria-label="Eliminar ${escapeHtml(item.text)}">×</button>
                </article>
              `).join("") : '<small class="week-routine-empty">SIN RUTINAS</small>'}
            </div>
          </section>
        </section>
      `;
    })
    .join("");
}

function renderAgenda() {
  const upcomingEvents = upcomingEventRecords();
  const upcomingBirthdays = upcomingBirthdayRecords();
  const reminder = nextReminder();
  elements.agendaNextReminder.textContent = reminder
    ? `${reminder.title} · ${reminder.timing}`
    : "No hay fechas próximas registradas";
  elements.agendaEventCount.textContent = upcomingEvents.length;
  elements.agendaBirthdayCount.textContent = allBirthdayRecords().length;

  elements.eventList.innerHTML = upcomingEvents.length
    ? upcomingEvents
        .map(
          (event) => `
            <article class="agenda-entry event-entry-openable" data-event-open="${event.id}">
              <span class="agenda-date-badge">${
                event.timing.days === 0
                  ? "HOY"
                  : String(event.timing.date.getDate()).padStart(2, "0")
              }</span>
              <div>
                <strong>${escapeHtml(event.title)}</strong>
                <small>${event.timing.label} · ${daysAwayLabel(event.timing.days)}</small>
                ${event.notes ? `<p>${escapeHtml(event.notes)}</p>` : ""}
                ${event.checklist?.length ? `<small class="event-entry-checklist-count">${event.checklist.filter((item) => !item.done).length} POR RECORDAR</small>` : ""}
              </div>
              <div class="agenda-entry-actions">
                <button class="ui-edit-action" data-event-edit="${event.id}" aria-label="Editar evento">✎</button>
                <button class="ui-delete-action" data-event-delete="${event.id}" aria-label="Eliminar evento">×</button>
              </div>
            </article>
          `,
        )
        .join("")
    : `
        <div class="agenda-empty">
          <span>◇</span>
          <p>Anotá una fecha para que el juego te avise.</p>
        </div>
      `;

  const pastEvents = importantEvents
    .map((event) => ({ ...event, timing: eventTiming(event.date) }))
    .filter((event) => event.timing && event.timing.days < 0)
    .sort((a, b) => b.timing.date.getTime() - a.timing.date.getTime());
  elements.pastEvents.classList.toggle("hidden", !pastEvents.length);
  elements.pastEventsSummary.textContent =
    `VER HISTORIAL · ${pastEvents.length} EVENTOS`;
  elements.pastEventList.innerHTML = pastEvents
    .map(
      (event) => `
        <article class="event-entry-openable" data-event-open="${event.id}">
          <span>${event.timing.label}</span>
          <strong>${escapeHtml(event.title)}</strong>
          <div class="agenda-entry-actions">
            <button class="ui-edit-action" data-event-edit="${event.id}" aria-label="Editar evento">✎</button>
            <button class="ui-delete-action" data-event-delete="${event.id}" aria-label="Eliminar evento">×</button>
          </div>
        </article>
      `,
    )
    .join("");

  elements.agendaBirthdayList.innerHTML = upcomingBirthdays.length
    ? upcomingBirthdays
        .map(
          (birthday) => `
            <article class="agenda-entry">
              <span class="agenda-date-badge birthday-badge">${String(
                birthday.next.date?.getDate() ?? birthday.next.label.split(" ")[0],
              ).padStart(2, "0")}</span>
              <div>
                <strong>${escapeHtml(birthday.name)}</strong>
                <small>${birthday.next.label} · ${daysAwayLabel(birthday.next.days)}</small>
                ${birthday.notes ? `<p>${escapeHtml(birthday.notes)}</p>` : ""}
              </div>
              ${
                birthday.profileSource
                  ? '<small class="profile-birthday-source">DESDE PERFIL</small>'
                  : `<div class="agenda-entry-actions">
                      <button class="ui-edit-action" data-birthday-edit="${birthday.id}" aria-label="Editar cumpleaños">✎</button>
                      <button class="ui-delete-action" data-birthday-delete="${birthday.id}" aria-label="Eliminar cumpleaños">×</button>
                    </div>`
              }
            </article>
          `,
        )
        .join("")
    : `
        <div class="agenda-empty">
          <span>♡</span>
          <p>Guardá acá a las personas que no querés olvidar.</p>
        </div>
      `;
}

function renderEventChecklistDraft() {
  eventChecklistDraft = normalizeEventChecklist(eventChecklistDraft);
  elements.eventChecklistCount.textContent = eventChecklistDraft.filter((item) => !item.done).length;
  elements.eventChecklistItems.innerHTML = eventChecklistDraft.length
    ? eventChecklistDraft
        .map(
          (item) => `
            <label class="${item.done ? "done" : ""}">
              <input type="checkbox" data-event-check-toggle="${item.id}" ${item.done ? "checked" : ""} />
              <span>${escapeHtml(item.text)}</span>
              <button type="button" data-event-check-delete="${item.id}" aria-label="Eliminar ${escapeHtml(item.text)}">×</button>
            </label>
          `,
        )
        .join("")
    : '<small class="event-checklist-empty">Todavía no anotaste recordatorios para este evento.</small>';
}

function addEventChecklistDraftItem() {
  const text = elements.eventChecklistInput.value.trim();
  if (!text) return;
  eventChecklistDraft.push({ id: Date.now(), text: text.slice(0, 180), done: false });
  elements.eventChecklistInput.value = "";
  renderEventChecklistDraft();
  elements.eventChecklistInput.focus();
}

function cancelEventEdit() {
  editingEventId = null;
  eventChecklistDraft = [];
  elements.eventForm.reset();
  renderEventChecklistDraft();
  elements.eventSubmitLabel.textContent = "+ GUARDAR EVENTO";
  elements.cancelEventEdit.textContent = "CERRAR";
  elements.eventForm.classList.add("hidden");
}

function beginEventEdit(id) {
  const event = importantEvents.find((item) => item.id === id);
  if (!event) return;
  editingEventId = id;
  elements.eventTitle.value = event.title;
  elements.eventDate.value = event.date;
  elements.eventNotes.value = event.notes || "";
  eventChecklistDraft = normalizeEventChecklist(event.checklist);
  renderEventChecklistDraft();
  elements.eventSubmitLabel.textContent = "✓ ACTUALIZAR EVENTO";
  elements.cancelEventEdit.textContent = "CANCELAR";
  elements.eventForm.classList.remove("hidden");
  elements.eventForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function cancelBirthdayEdit() {
  editingBirthdayId = null;
  elements.agendaBirthdayForm.reset();
  elements.birthdaySubmitLabel.textContent = "+ GUARDAR CUMPLEAÑOS";
  elements.cancelBirthdayEdit.textContent = "CERRAR";
  elements.agendaBirthdayForm.classList.add("hidden");
}

function beginBirthdayEdit(id) {
  const birthday = birthdays.find((item) => item.id === id);
  if (!birthday) return;
  editingBirthdayId = id;
  elements.agendaBirthdayName.value = birthday.name;
  elements.agendaBirthdayDate.value = birthday.date;
  elements.agendaBirthdayNotes.value = birthday.notes || "";
  elements.birthdaySubmitLabel.textContent = "✓ ACTUALIZAR CUMPLEAÑOS";
  elements.cancelBirthdayEdit.textContent = "CANCELAR";
  elements.agendaBirthdayForm.classList.remove("hidden");
  elements.agendaBirthdayForm.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function renderCalendar() {
  elements.calendarTitle.textContent = new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
  })
    .format(calendarCursor)
    .toUpperCase();

  const year = calendarCursor.getFullYear();
  const month = calendarCursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - mondayOffset);
  const today = new Date();

  elements.calendarGrid.innerHTML = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + index,
    );
    const events = importantEvents
      .filter((event) => {
        const eventDate = new Date(event.date);
        return (
          eventDate.getFullYear() === date.getFullYear() &&
          eventDate.getMonth() === date.getMonth() &&
          eventDate.getDate() === date.getDate()
        );
      })
      .map((event) => ({
        type: "event",
        title: event.title,
        detail: new Intl.DateTimeFormat("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(event.date)),
      }));
    const birthdayItems = allBirthdayRecords()
      .filter((birthday) => {
        const [, monthText, dayText] = birthday.date.split("-");
        return (
          Number(monthText) === date.getMonth() + 1 &&
          Number(dayText) === date.getDate()
        );
      })
      .map((birthday) => ({
        type: "birthday",
        title: birthday.name,
        detail: "CUMPLEAÑOS",
      }));
    const isToday =
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();
    const className = [
      "calendar-day",
      date.getMonth() === month ? "" : "other-month",
      isToday ? "today" : "",
    ]
      .filter(Boolean)
      .join(" ");
    const items = [...events, ...birthdayItems]
      .map(
        (item) => `
          <div
            class="calendar-item ${item.type}"
            title="${escapeHtml(item.title)} · ${escapeHtml(item.detail)}"
          >
            <strong>${escapeHtml(item.title)}</strong>
            <small>${escapeHtml(item.detail)}</small>
          </div>
        `,
      )
      .join("");

    return `
      <article class="${className}">
        <header>
          <span>${date.getDate()}</span>
          ${isToday ? "<small>HOY</small>" : ""}
        </header>
        <div class="calendar-day-items">${items}</div>
      </article>
    `;
  }).join("");
}

function renderTasks() {
  renderBreadcrumb();
  document.querySelector("#todo-count").textContent = countForStatus("todo");
  document.querySelector("#done-count").textContent = countForStatus("done");

  for (const button of document.querySelectorAll("[data-status]")) {
    button.classList.toggle(
      "active",
      button.dataset.status === activeTaskTab,
    );
  }

  elements.filterChip.classList.add("hidden");

  elements.backProjects.classList.toggle("hidden", !projectFilter);
  if (currentQuest() || projectFilter) {
    elements.quickTaskForm.classList.remove("hidden");
    elements.quickTaskContext.textContent =
      `Escribí y apretá Enter. Queda dentro de ${currentQuest()?.title || projectFilter}.`;
  } else {
    elements.quickTaskForm.classList.add("hidden");
  }

  const visible = tasks
    .filter(
      (task) =>
        task.status === activeTaskTab &&
        task.parentId === (currentQuest()?.id ?? null) &&
        (currentQuest() || !projectFilter || task.project === projectFilter),
    )
    .sort((a, b) => {
      const priorityScore = (task) => (task.priority === "high" ? 0 : 1);
      return (
        priorityScore(a) - priorityScore(b) ||
        (Number.isFinite(Number(a.sortOrder)) ? Number(a.sortOrder) : a.id) -
          (Number.isFinite(Number(b.sortOrder)) ? Number(b.sortOrder) : b.id)
      );
    });

  if (!visible.length) {
    elements.taskList.innerHTML = `
      <div class="empty-list">
        <span class="empty-icon">◇</span>
        <h2>Este proyecto todavía no tiene misiones acá.</h2>
        <p>Una tarea anotada deja de ocupar lugar en tu cabeza.</p>
        <p>Usá la barra de tarea rápida de arriba.</p>
      </div>
    `;
    return;
  }

  elements.taskList.innerHTML = visible
    .map((task) => {
      const details = task.details
        ? `<p>${escapeHtml(task.details)}</p>`
        : "";
      const todayAction = task.status === "done" ? "" : `
        <button class="task-today-icon ${task.isToday ? "today-active" : ""}"
          data-task-action="today" data-task-id="${task.id}"
          aria-label="${task.isToday ? "Quitar de hoy" : "Sumar a hoy"}">HOY</button>`;
      const children = tasks.filter((child) => child.parentId === task.id);
      const finishedChildren = children.filter(
        (child) => child.status === "done",
      ).length;
      const questAction = `<button class="task-breakdown-icon ${task.isQuest ? "quest-active-icon" : ""}" data-task-action="quest"
        data-task-id="${task.id}" aria-label="${task.isQuest ? `Abrir quest ${escapeHtml(task.title)}` : "Desglosar"}"
        title="${task.isQuest ? "Abrir tareas de la Quest" : "Convertir en Quest y desglosar"}">
        <img src="./art/ui/task-breakdown.webp" alt="" /></button>`;
      const titleControl =
        editingTaskId === task.id
          ? `<input class="task-title-inline" data-inline-task-title="${task.id}"
              maxlength="120" value="${escapeHtml(task.title)}" aria-label="Editar nombre de la tarea" />`
          : `<h2>${escapeHtml(task.title)}</h2>`;
      return `
        <article class="task-card task-clickable ${task.isQuest ? "quest-card" : ""}${task.priority === "high" ? " high-priority-task" : ""}"
          draggable="true" data-task-card="${task.id}" data-project-task-drag="${task.id}">
          <div class="task-copy">
            <div class="task-title-row">
              ${titleControl}
              <div class="task-card-top-actions">
                ${questAction}
                ${todayAction}
                <button class="task-edit-icon ui-edit-action" data-task-action="rename"
                  data-task-id="${task.id}" aria-label="Editar nombre de ${escapeHtml(task.title)}"
                  title="Editar nombre aquí">✎</button>
                <button class="task-complete-icon" data-task-action="${task.status === "done" ? "todo" : "done"}"
                  data-task-id="${task.id}" aria-label="${task.status === "done" ? "Reabrir" : "Completar"}">✓</button>
                <button class="task-delete-icon ui-delete-action" data-task-action="delete" data-task-id="${task.id}"
                  aria-label="Eliminar">×</button>
              </div>
            </div>
            ${details}
            ${task.isQuest ? `<span class="quest-progress">${finishedChildren}/${children.length}</span>` : ""}
          </div>
        </article>
      `;
    })
    .join("");
}

function clearProjectTaskDropStyles() {
  for (const card of elements.taskList.querySelectorAll(
    ".task-drop-before, .task-drop-after, .task-drop-inside, .task-drag-source",
  )) {
    card.classList.remove(
      "task-drop-before",
      "task-drop-after",
      "task-drop-inside",
      "task-drag-source",
    );
  }
}

function projectTaskDropPosition(event, targetTask, targetCard) {
  if (targetTask.isQuest) return "inside";
  const bounds = targetCard.getBoundingClientRect();
  return event.clientY < bounds.top + bounds.height / 2 ? "before" : "after";
}

function taskContainsTask(parentId, possibleChildId) {
  let cursor = tasks.find((task) => task.id === possibleChildId) || null;
  const visited = new Set();
  while (cursor && cursor.parentId !== null && !visited.has(cursor.id)) {
    if (cursor.parentId === parentId) return true;
    visited.add(cursor.id);
    cursor = tasks.find((task) => task.id === cursor.parentId) || null;
  }
  return false;
}

function moveProjectTask(draggedId, targetId, position) {
  const dragged = tasks.find((task) => task.id === draggedId);
  const target = tasks.find((task) => task.id === targetId);
  if (!dragged || !target || dragged.id === target.id) return;

  if (position === "inside") {
    if (taskContainsTask(dragged.id, target.id)) {
      showToast("Una Quest no puede guardarse dentro de una subtarea propia.");
      return;
    }
    dragged.parentId = target.id;
    dragged.area = target.area;
    dragged.project = target.project;
    dragged.sortOrder =
      Math.max(
        0,
        ...tasks
          .filter((task) => task.parentId === target.id)
          .map((task) => Number(task.sortOrder) || 0),
      ) + 1;
    save();
    renderTasks();
    showToast(`Misión guardada dentro de la Quest ${target.title}.`);
    return;
  }

  const parentId = target.parentId ?? null;
  const visible = tasks
    .filter(
      (task) =>
        task.status === activeTaskTab &&
        task.parentId === parentId &&
        (currentQuest() || !projectFilter || task.project === projectFilter) &&
        task.id !== dragged.id,
    )
    .sort(
      (a, b) =>
        (Number(a.sortOrder) || a.id) - (Number(b.sortOrder) || b.id),
    );
  const targetIndex = visible.findIndex((task) => task.id === target.id);
  if (targetIndex < 0) return;
  dragged.parentId = parentId;
  dragged.area = target.area;
  dragged.project = target.project;
  visible.splice(targetIndex + (position === "after" ? 1 : 0), 0, dragged);
  visible.forEach((task, index) => {
    task.sortOrder = index + 1;
  });
  save();
  renderTasks();
  showToast("Orden de las misiones actualizado.");
}

function countForStatus(status) {
  return tasks.filter(
    (task) =>
      task.status === status &&
      task.parentId === (currentQuest()?.id ?? null) &&
      (currentQuest() || !projectFilter || task.project === projectFilter),
  ).length;
}

function currentQuest() {
  return questStack.length ? questStack[questStack.length - 1] : null;
}

function renderBreadcrumb() {
  if (!projectFilter && !questStack.length) {
    elements.questBreadcrumb.classList.add("hidden");
    return;
  }

  const rootLabel = projectFilter || "Todas";
  elements.questBreadcrumb.innerHTML = `
    <button data-breadcrumb-index="-1">${escapeHtml(rootLabel)}</button>
    ${questStack
      .map(
        (quest, index) =>
          `<span>›</span><button data-breadcrumb-index="${index}">${escapeHtml(quest.title)}</button>`,
      )
      .join("")}
  `;
  elements.questBreadcrumb.classList.remove("hidden");
}

function renderProjects() {
  for (const button of document.querySelectorAll("[data-project-tab]")) {
    button.classList.toggle(
      "active",
      button.dataset.projectTab === activeProjectTab,
    );
  }
  elements.workProjectCount.textContent = workProjectList().length;
  elements.personalProjectCount.textContent = personalProjectList().length;
  elements.newProjectAreaLabel.textContent =
    activeProjectTab === "laboral"
      ? "Nuevo proyecto laboral"
      : "Nuevo proyecto personal";
  const projects =
    activeProjectTab === "laboral"
      ? workProjectList()
      : personalProjectList();
  elements.projectGrid.innerHTML = projects
    .map(([name, code, description, accent, id, originalName]) => {
      const count = tasks.filter(
        (task) => task.project === name && task.status !== "done",
      ).length;
      return `
        <article class="project-card">
          <button class="project-card-main" data-project="${escapeHtml(name)}">
            <span class="project-badge" style="background-color:${accent}">${code}</span>
            <span class="project-copy">
              <strong>${escapeHtml(name)}</strong>
              <small>${escapeHtml(description)}</small>
              <em>${count} ${count === 1 ? "misión abierta" : "misiones abiertas"}</em>
            </span>
            <span class="project-arrow">›</span>
          </button>
          <button class="project-rename-button"
            data-project-rename="${escapeHtml(name)}"
            data-project-id="${id ?? ""}"
            data-project-original="${escapeHtml(originalName || "")}"
            aria-label="Renombrar ${escapeHtml(name)}">✎</button>
        </article>
      `;
    })
    .join("");
}

function wordCount(value) {
  const normalized = String(value || "").trim();
  return normalized ? normalized.split(/\s+/).length : 0;
}

function nextWritingVersionTitle(sourceTitle) {
  const normalized = String(sourceTitle || "").trim() || "Proyecto creativo";
  const sourceMatch = normalized.match(/^(.*?)(?:\s+V(\d+))$/i);
  const baseTitle = String(sourceMatch?.[1] || normalized).trim();
  let highestVersion = sourceMatch ? Number(sourceMatch[2]) : 1;
  writingProjects.forEach((project) => {
    const match = String(project.title || "").trim().match(/^(.*?)(?:\s+V(\d+))$/i);
    if (!match || match[1].trim().toLocaleLowerCase() !== baseTitle.toLocaleLowerCase()) return;
    highestVersion = Math.max(highestVersion, Number(match[2]));
  });
  return `${baseTitle} V${String(highestVersion + 1).padStart(2, "0")}`;
}

function formatFocusTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const minuteText = String(minutes).padStart(2, "0");
  const secondText = String(seconds).padStart(2, "0");
  return hours > 0
    ? `${String(hours).padStart(2, "0")}:${minuteText}:${secondText}`
    : `${minuteText}:${secondText}`;
}

function localTimeKey(date = new Date()) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function normalizePuzzleAnswer(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function calculateExpression(expression) {
  const sanitized = String(expression || "").replace(/,/g, ".").trim();
  if (!sanitized || sanitized.length > 80) throw new Error("Expresión inválida");
  if (!/^[0-9+\-*/().%\s]+$/.test(sanitized)) {
    throw new Error("Usá solamente números y operaciones básicas");
  }

  let cursor = 0;

  function skipSpaces() {
    while (/\s/.test(sanitized[cursor] || "")) cursor += 1;
  }

  function parseNumber() {
    skipSpaces();
    const match = sanitized
      .slice(cursor)
      .match(/^(?:\d+(?:\.\d*)?|\.\d+)/);
    if (!match) throw new Error("Expresión inválida");
    cursor += match[0].length;
    return Number(match[0]);
  }

  function parsePrimary() {
    skipSpaces();
    if (sanitized[cursor] !== "(") return parseNumber();
    cursor += 1;
    const value = parseSum();
    skipSpaces();
    if (sanitized[cursor] !== ")") throw new Error("Falta cerrar un paréntesis");
    cursor += 1;
    return value;
  }

  function parseUnary() {
    skipSpaces();
    if (sanitized[cursor] === "+") {
      cursor += 1;
      return parseUnary();
    }
    if (sanitized[cursor] === "-") {
      cursor += 1;
      return -parseUnary();
    }
    return parsePrimary();
  }

  function parseProduct() {
    let value = parseUnary();
    while (true) {
      skipSpaces();
      const operator = sanitized[cursor];
      if (operator !== "*" && operator !== "/" && operator !== "%") break;
      cursor += 1;
      const right = parseUnary();
      if (operator === "*") value *= right;
      if (operator === "/") value /= right;
      if (operator === "%") value %= right;
    }
    return value;
  }

  function parseSum() {
    let value = parseProduct();
    while (true) {
      skipSpaces();
      const operator = sanitized[cursor];
      if (operator !== "+" && operator !== "-") break;
      cursor += 1;
      const right = parseProduct();
      value = operator === "+" ? value + right : value - right;
    }
    return value;
  }

  const result = parseSum();
  skipSpaces();
  if (cursor !== sanitized.length || !Number.isFinite(result)) {
    throw new Error("Resultado inválido");
  }
  return Number(result.toFixed(8)).toString();
}

function renderHubAlarms() {
  if (!hubAlarms.length) {
    elements.hubAlarmList.innerHTML = '<p class="hub-empty-copy">Todavía no guardaste alarmas.</p>';
    return;
  }
  elements.hubAlarmList.innerHTML = [...hubAlarms]
    .sort((a, b) => a.time.localeCompare(b.time))
    .map((alarm) => `
      <article class="${alarm.enabled ? "" : "disabled"}">
        <strong>${escapeHtml(alarm.time)}</strong>
        <span>${escapeHtml(alarm.label || "Alarma personal")}</span>
        <button type="button" class="alarm-toggle" data-alarm-toggle="${escapeHtml(alarm.id)}" aria-pressed="${Boolean(alarm.enabled)}">${alarm.enabled ? "ON" : "OFF"}</button>
        <button type="button" class="alarm-delete" data-alarm-delete="${escapeHtml(alarm.id)}" aria-label="Eliminar alarma">×</button>
      </article>
    `)
    .join("");
}

function setHubTab(tab) {
  document.querySelector(".hub-workbench")?.scrollTo(0, 0);
  activeHubTab = tab;
  document.querySelectorAll("[data-hub-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.hubTab === tab);
  });
  elements.hubHomeView.classList.toggle("hidden", tab !== "home");
  elements.hubAlarmsView.classList.toggle("hidden", tab !== "alarms");
  elements.hubTimerCard.classList.toggle("hidden", tab !== "timer");
  elements.hubCalculatorView.classList.toggle("hidden", tab !== "calculator");
  renderHub();
}

function renderHub() {
  elements.hubCurrentTime.textContent = localTimeKey();
  elements.hubTimerDisplay.textContent = formatFocusTime(hubTimerSeconds);
  elements.hubStopwatchDisplay.textContent = formatStopwatchTime(hubStopwatchMilliseconds);
  elements.hubTimerHomeTime.textContent = hubStopwatchRunning
    ? formatStopwatchTime(hubStopwatchMilliseconds)
    : formatFocusTime(hubTimerSeconds);
  elements.hubTimerNavState.textContent = hubTimerRunning || hubStopwatchRunning ? "En marcha" : "Preparado";
  const activeAlarmCount = hubAlarms.filter((alarm) => alarm.enabled).length;
  elements.hubAlarmNavCount.textContent = `${activeAlarmCount} ${activeAlarmCount === 1 ? "activa" : "activas"}`;
  elements.hubAlarmHomeCount.textContent = `${hubAlarms.length} ${hubAlarms.length === 1 ? "guardada" : "guardadas"}`;
  elements.hubTimerCard.classList.toggle("running", hubTimerRunning || hubStopwatchRunning);
  elements.hubTimerFace.classList.toggle("hidden", hubTimeMode !== "timer");
  elements.hubStopwatchFace.classList.toggle("hidden", hubTimeMode !== "stopwatch");
  document.querySelectorAll("[data-hub-time-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.hubTimeMode === hubTimeMode);
  });
  elements.hubTimerStatus.textContent = hubTimerRunning
    ? "BLOQUE EN MARCHA"
    : hubTimerSeconds === 0
      ? "BLOQUE TERMINADO"
      : "PREPARADO";
  elements.hubTimerStart.textContent = hubTimerRunning
    ? "Ⅱ PAUSAR"
    : hubTimerSeconds === 0
      ? "▶ OTRA VEZ"
      : "▶ EMPEZAR";
  elements.hubStopwatchStatus.textContent = hubStopwatchRunning
    ? "CRONÓMETRO EN MARCHA"
    : hubStopwatchMilliseconds > 0
      ? "EN PAUSA"
      : "LISTO PARA MEDIR";
  elements.hubStopwatchStart.textContent = hubStopwatchRunning
    ? "Ⅱ PAUSAR"
    : hubStopwatchMilliseconds > 0
      ? "▶ CONTINUAR"
      : "▶ INICIAR";
  elements.hubStopwatchLap.disabled = hubStopwatchMilliseconds <= 0;
  elements.hubStopwatchReset.disabled = hubStopwatchMilliseconds <= 0 && hubStopwatchLaps.length === 0;
  elements.hubStopwatchLaps.innerHTML = hubStopwatchLaps.length > 0
    ? [...hubStopwatchLaps].reverse().map((lap, reverseIndex) => {
        const lapIndex = hubStopwatchLaps.length - 1 - reverseIndex;
        const previous = lapIndex > 0 ? hubStopwatchLaps[lapIndex - 1] : 0;
        return `<article><span>VUELTA ${String(lapIndex + 1).padStart(2, "0")}</span><strong>${formatStopwatchTime(lap - previous)}</strong><small>${formatStopwatchTime(lap)}</small></article>`;
      }).join("")
    : '<p class="hub-empty-copy">Las vueltas que marques van a quedar registradas acá.</p>';
  document.querySelectorAll("[data-hub-minutes]").forEach((button) => {
    button.classList.toggle(
      "active",
      Number(button.dataset.hubMinutes) * 60 === hubTimerDuration,
    );
  });
  renderHubAlarms();
}

function showHubAlert(title, message) {
  elements.hubAlertTitle.textContent = title;
  elements.hubAlertMessage.textContent = message;
  elements.hubAlert.classList.remove("hidden");
  if (settings.soundEffectsEnabled && settings.volume > 0) {
    if (!soundEngine) soundEngine = new window.NokSoundEngine();
    soundEngine.setVolume(settings.volume / 100);
    void soundEngine.play("alarm").catch(() => {});
  }
  window.setTimeout(() => elements.closeHubAlert.focus(), 30);
}

function chooseHubTimer(minutes) {
  const seconds = Math.max(60, Math.round(minutes * 60));
  hubTimerDuration = seconds;
  hubTimerSeconds = seconds;
  hubTimerRunning = false;
  renderHub();
}

function formatStopwatchTime(totalMilliseconds) {
  const safeMilliseconds = Math.max(0, Math.floor(totalMilliseconds));
  const totalSeconds = Math.floor(safeMilliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((safeMilliseconds % 1000) / 100);
  const base = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${tenths}`;
  return hours > 0 ? `${String(hours).padStart(2, "0")}:${base}` : base;
}

function drawingContext() {
  return elements.drawingCanvas?.getContext("2d", { alpha: false }) || null;
}

function drawingSnapshot(format = "image/webp") {
  return elements.drawingCanvas?.toDataURL(format, format === "image/png" ? undefined : 0.9) || "";
}

function resetDrawingHistory() {
  const snapshot = drawingSnapshot();
  drawingHistory = snapshot ? [snapshot] : [];
  drawingHistoryIndex = snapshot ? 0 : -1;
}

function loadDrawingCanvas(image) {
  const canvas = elements.drawingCanvas;
  const context = drawingContext();
  if (!canvas || !context) return;
  canvas.width = 1200;
  canvas.height = 800;
  context.globalAlpha = 1;
  context.globalCompositeOperation = "source-over";
  context.fillStyle = "#fffdf0";
  context.fillRect(0, 0, canvas.width, canvas.height);
  if (!image) {
    resetDrawingHistory();
    return;
  }
  const source = new Image();
  source.onload = () => {
    context.fillStyle = "#fffdf0";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(source, 0, 0, canvas.width, canvas.height);
    resetDrawingHistory();
  };
  source.src = image;
}

function restoreDrawing(image) {
  const canvas = elements.drawingCanvas;
  const context = drawingContext();
  if (!canvas || !context || !image) return;
  const source = new Image();
  source.onload = () => {
    context.globalAlpha = 1;
    context.globalCompositeOperation = "source-over";
    context.fillStyle = "#fffdf0";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(source, 0, 0, canvas.width, canvas.height);
  };
  source.src = image;
}

function commitDrawingHistory() {
  const snapshot = drawingSnapshot();
  if (!snapshot || snapshot === drawingHistory[drawingHistoryIndex]) return;
  drawingHistory = [...drawingHistory.slice(0, drawingHistoryIndex + 1), snapshot].slice(-24);
  drawingHistoryIndex = drawingHistory.length - 1;
}

function drawingPoint(event) {
  const bounds = elements.drawingCanvas.getBoundingClientRect();
  return {
    x: ((event.clientX - bounds.left) / bounds.width) * elements.drawingCanvas.width,
    y: ((event.clientY - bounds.top) / bounds.height) * elements.drawingCanvas.height,
  };
}

function beginDrawing(event) {
  const context = drawingContext();
  if (!context) return;
  event.preventDefault();
  elements.drawingCanvas.setPointerCapture(event.pointerId);
  const point = drawingPoint(event);
  drawingPointer = { pointerId: event.pointerId, ...point };
  context.globalCompositeOperation = "source-over";
  context.globalAlpha = drawingTool === "marker" ? 0.3 : 1;
  context.strokeStyle = drawingTool === "eraser" ? "#fffdf0" : drawingColor;
  context.lineWidth = drawingSize * (drawingTool === "marker" ? 2.2 : 1);
  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();
  context.moveTo(point.x, point.y);
  context.lineTo(point.x + 0.01, point.y + 0.01);
  context.stroke();
}

function continueDrawing(event) {
  const context = drawingContext();
  if (!context || drawingPointer?.pointerId !== event.pointerId) return;
  event.preventDefault();
  const point = drawingPoint(event);
  const pressure = event.pressure > 0 ? 0.72 + event.pressure * 0.48 : 1;
  context.lineWidth = drawingSize * pressure * (drawingTool === "marker" ? 2.2 : 1);
  context.lineTo(point.x, point.y);
  context.stroke();
}

function endDrawing(event) {
  if (drawingPointer?.pointerId !== event.pointerId) return;
  drawingPointer = null;
  const context = drawingContext();
  if (context) { context.closePath(); context.globalAlpha = 1; }
  commitDrawingHistory();
}

function renderDrawings() {
  if (!elements.drawingThumbnails) return;
  elements.drawingThumbnails.innerHTML = drawingIdeas.length
    ? drawingIdeas.map((idea) => `<button type="button" data-drawing-id="${idea.id}" class="${activeDrawingId === idea.id ? "active" : ""}"><img src="${idea.image}" alt=""><span>${escapeHtml(idea.title)}</span></button>`).join("")
    : "<p>Tu primera hoja está esperando una idea.</p>";
  elements.drawingDelete?.classList.toggle("hidden", !activeDrawingId);
}

function newDrawingIdea() {
  activeDrawingId = null;
  elements.drawingTitle.value = "Idea sin nombre";
  loadDrawingCanvas(null);
  renderDrawings();
}

function saveDrawingIdea() {
  const image = drawingSnapshot();
  if (!image) return;
  const title = elements.drawingTitle.value.trim().slice(0, 80) || "Idea sin nombre";
  const now = new Date().toISOString();
  if (activeDrawingId) {
    drawingIdeas = drawingIdeas.map((idea) => idea.id === activeDrawingId ? { ...idea, title, image, updatedAt: now } : idea);
  } else {
    activeDrawingId = drawingId();
    drawingIdeas.unshift({ id: activeDrawingId, title, image, createdAt: now, updatedAt: now });
  }
  elements.drawingTitle.value = title;
  save();
  renderDrawings();
  showToast("Idea guardada en el estudio de dibujo.");
}

function activeQuickList() {
  return quickLists.find((list) => list.id === activeQuickListId) || null;
}

function renderQuickLists() {
  const visibleLists = quickLists.filter((list) => list.type === quickListCreateType);
  let selected = activeQuickList();
  if (!selected || selected.type !== quickListCreateType) {
    selected = visibleLists[0] || null;
    activeQuickListId = selected?.id ?? null;
  }
  elements.quickListTabs.innerHTML = visibleLists.length
    ? visibleLists
        .map((list) => {
          const done = list.items.filter((item) => item.checked).length;
          const meta = QUICK_LIST_TYPE_META[list.type];
          const summary = list.type === "checklist"
            ? `${done} / ${list.items.length} tachados`
            : list.type === "ranking"
              ? `${list.items.length} ${list.items.length === 1 ? "puesto" : "puestos"}`
              : `${String(list.note || "").trim().length} caracteres`;
          return `<button type="button" class="${list.id === activeQuickListId ? "active" : ""}" data-quick-list-select="${escapeHtml(list.id)}">
            <span class="quick-list-tab-icon" aria-hidden="true"><img src="${meta.icon}" alt="" /></span>
            <span><strong>${escapeHtml(list.title)}</strong><small>${summary}</small></span>
          </button>`;
        })
        .join("")
    : `<p class="quick-lists-empty-library">Todavía no guardaste ${quickListCreateType === "notes" ? "notas" : quickListCreateType === "ranking" ? "rankings" : "checklists"}.</p>`;

  if (!selected) {
    elements.quickListSheet.innerHTML = `<div class="quick-list-welcome">
      <span aria-hidden="true">☷</span>
      <h2>Creá una lista para empezar.</h2>
      <p>${quickListCreateType === "notes" ? "Guardá ideas y apuntes para volver a ellos cuando quieras." : quickListCreateType === "ranking" ? "Ordená tus favoritos y cambiá sus posiciones cuando quieras." : "Tachá pendientes, reiniciá la lista y volvé a usarla."}</p>
    </div>`;
    return;
  }

  const meta = QUICK_LIST_TYPE_META[selected.type];
  const progress = selected.type === "checklist"
    ? `${selected.items.filter((item) => item.checked).length}/${selected.items.length}`
    : selected.type === "ranking"
      ? String(selected.items.length)
      : "NOTA";
  const actions = `${selected.type === "checklist" ? '<button type="button" title="Reiniciar checklist" aria-label="Reiniciar checklist" data-quick-list-action="reset">↺</button>' : ""}
      <button type="button" title="Duplicar lista" aria-label="Duplicar lista" data-quick-list-action="duplicate">▣</button>
      <button type="button" title="${quickListDeleteArmedId === selected.id ? "Confirmar eliminacion" : "Eliminar lista"}" aria-label="${quickListDeleteArmedId === selected.id ? "Confirmar eliminacion" : "Eliminar lista"}" class="quick-list-delete${quickListDeleteArmedId === selected.id ? " armed" : ""}" data-quick-list-action="delete">${quickListDeleteArmedId === selected.id ? "!" : "×"}</button>`;
  const editor = selected.type === "notes"
    ? `<textarea class="quick-list-notes-editor" id="quick-list-notes-editor" maxlength="20000" placeholder="Escribí cualquier cosa que quieras guardar…" aria-label="Contenido de la nota">${escapeHtml(selected.note || "")}</textarea>`
    : `<form class="quick-list-item-form" id="quick-list-item-form">
        <input id="quick-list-item-text" maxlength="160" placeholder="${selected.type === "ranking" ? "Nuevo puesto del ranking…" : "Escribí algo y apretá Enter…"}" aria-label="Nuevo elemento de la lista" />
        <button>+ AGREGAR</button>
      </form>
      <div class="quick-list-items${selected.type === "ranking" ? " ranking-list-items" : ""}" aria-live="polite">
        ${selected.items.length
          ? selected.items.map((item, index) => selected.type === "ranking"
            ? `<article class="ranking-item rank-${index + 1}" draggable="${editingQuickListItemId === item.id ? "false" : "true"}" data-quick-list-edit-row="${escapeHtml(item.id)}" data-ranking-item-id="${escapeHtml(item.id)}">
                <strong class="ranking-order-number" data-ranking-drag-handle="${escapeHtml(item.id)}" role="button" tabindex="0" aria-label="Mover puesto ${index + 1}" title="Arrastrá para reordenar">${index + 1}°</strong>
                ${editingQuickListItemId === item.id ? `<input class="quick-list-inline-editor ranking-item-text" data-quick-list-inline-edit="${escapeHtml(item.id)}" maxlength="160" value="${escapeHtml(item.text)}" />` : `<span class="ranking-item-text">${escapeHtml(item.text)}</span>`}
                <span class="ranking-step-actions"><button type="button" data-ranking-step="up" data-ranking-item="${escapeHtml(item.id)}" ${index === 0 ? "disabled" : ""}>↑</button><button type="button" data-ranking-step="down" data-ranking-item="${escapeHtml(item.id)}" ${index === selected.items.length - 1 ? "disabled" : ""}>↓</button></span>
                <button type="button" class="quick-list-item-delete" data-quick-list-item-delete="${escapeHtml(item.id)}" aria-label="Eliminar ${escapeHtml(item.text)}">×</button>
              </article>`
            : `<article class="${item.checked ? "checked" : ""}" data-quick-list-edit-row="${escapeHtml(item.id)}">
                <button type="button" class="quick-list-check" data-quick-list-toggle="${escapeHtml(item.id)}" aria-pressed="${Boolean(item.checked)}" aria-label="${item.checked ? "Destachar" : "Tachar"} ${escapeHtml(item.text)}">${item.checked ? "✓" : ""}</button>
                ${editingQuickListItemId === item.id ? `<input class="quick-list-inline-editor" data-quick-list-inline-edit="${escapeHtml(item.id)}" maxlength="160" value="${escapeHtml(item.text)}" />` : `<button type="button" class="quick-list-item-text" data-quick-list-edit="${escapeHtml(item.id)}"><small>${String(index + 1).padStart(2, "0")}</small><span>${escapeHtml(item.text)}</span></button>`}
                <button type="button" class="quick-list-item-delete" data-quick-list-item-delete="${escapeHtml(item.id)}" aria-label="Eliminar ${escapeHtml(item.text)}">×</button>
              </article>`).join("")
          : `<div class="quick-list-empty-sheet"><img src="${meta.icon}" alt="" /><strong>${selected.type === "ranking" ? "El podio está esperando." : "Esta hoja está lista."}</strong><p>${selected.type === "ranking" ? "Agregá candidatos y ordenalos arrastrando." : "Sumá todo lo que no querés olvidar."}</p></div>`}
      </div>`;
  elements.quickListSheet.innerHTML = `
    <header class="quick-list-sheet-heading">
      <div>
        <span>${meta.label} REUTILIZABLE</span>
        <input id="active-quick-list-title" value="${escapeHtml(selected.title)}" maxlength="80" aria-label="Nombre de la lista" />
      </div>
      <div class="quick-list-actions" aria-label="Acciones de la lista">${actions}</div>
      <div class="quick-list-progress-seal"><img src="${meta.icon}" alt="" /><small>${progress}</small></div>
    </header>
    ${editor}`;
}

function resetUndergroundForm() {
  editingUndergroundId = null;
  if (!elements.undergroundForm) return;
  elements.undergroundForm.reset();
  elements.undergroundCategory.value = "note";
  elements.undergroundFormKicker.textContent = "NUEVO ARCHIVO";
  elements.undergroundFormTitle.textContent = "Guardar en la caverna";
  elements.undergroundSave.textContent = "GUARDAR EN EL ARCHIVO";
  elements.undergroundCancel.classList.add("hidden");
}

function renderUnderground() {
  if (!elements.undergroundList) return;
  const query = String(elements.undergroundSearch?.value || "").trim().toLocaleLowerCase("es");
  const visible = undergroundItems.filter((item) =>
    !query || `${item.title} ${item.details} ${UNDERGROUND_CATEGORY_LABELS[item.category]}`.toLocaleLowerCase("es").includes(query),
  );
  elements.undergroundCount.textContent = String(undergroundItems.length);
  elements.undergroundList.innerHTML = visible.length
    ? visible.map((item) => `
      <article class="underground-item category-${escapeHtml(item.category)}">
        <div>
          <span>${escapeHtml(UNDERGROUND_CATEGORY_LABELS[item.category])}</span>
          <h4>${escapeHtml(item.title)}</h4>
          ${item.details ? `<p>${escapeHtml(item.details)}</p>` : ""}
        </div>
        <div class="underground-item-actions">
          <button type="button" data-underground-edit="${escapeHtml(item.id)}">EDITAR</button>
          <button type="button" class="danger" data-underground-delete="${escapeHtml(item.id)}">ELIMINAR</button>
        </div>
      </article>`).join("")
    : `<div class="underground-empty-state"><span aria-hidden="true">✦</span><strong>${undergroundItems.length ? "No encontramos ese archivo." : "Los archiveros están vacíos."}</strong><p>${undergroundItems.length ? "Probá con otra búsqueda." : "Guardá la primera cosa que no querés tener dando vueltas."}</p></div>`;
}

function editUndergroundItem(item) {
  editingUndergroundId = item.id;
  elements.undergroundTitle.value = item.title;
  elements.undergroundDetails.value = item.details;
  elements.undergroundCategory.value = item.category;
  elements.undergroundFormKicker.textContent = "EDITANDO ARCHIVO";
  elements.undergroundFormTitle.textContent = "Actualizar registro";
  elements.undergroundSave.textContent = "ACTUALIZAR";
  elements.undergroundCancel.classList.remove("hidden");
  elements.undergroundTitle.focus();
}

function persistUndergroundItems() {
  localStorage.setItem(UNDERGROUND_ITEMS_KEY, JSON.stringify(undergroundItems));
  markCloudChange();
  renderUnderground();
}

function createQuickList(title, type = quickListCreateType) {
  const cleanTitle = String(title || "").trim().slice(0, 80);
  if (!cleanTitle) return;
  const cleanType = Object.hasOwn(QUICK_LIST_TYPE_META, type) ? type : "checklist";
  const now = new Date().toISOString();
  const list = {
    id: quickListId("list"),
    title: cleanTitle,
    type: cleanType,
    note: "",
    items: [],
    createdAt: now,
    updatedAt: now,
  };
  quickLists.unshift(list);
  activeQuickListId = list.id;
  quickListDeleteArmedId = null;
  save();
  renderQuickLists();
  showToast(`Lista “${cleanTitle}” creada.`);
}

function touchQuickList(list) {
  list.updatedAt = new Date().toISOString();
  save();
  renderQuickLists();
}

function duplicateQuickList(list) {
  const now = new Date().toISOString();
  const duplicate = {
    ...list,
    id: quickListId("list"),
    title: `${list.title} · copia`.slice(0, 80),
    items: list.items.map((item) => ({
      ...item,
      id: quickListId("item"),
      checked: false,
      createdAt: now,
    })),
    createdAt: now,
    updatedAt: now,
  };
  quickLists.unshift(duplicate);
  activeQuickListId = duplicate.id;
  quickListDeleteArmedId = null;
  save();
  renderQuickLists();
  showToast("Copia reutilizable creada.");
}

function renderPuzzle() {
  const puzzle = MENTAL_PUZZLES[puzzleIndex];
  elements.puzzleClock.textContent = formatFocusTime(puzzleSeconds);
  elements.puzzleClock.classList.toggle("running", puzzleRunning);
  elements.puzzleQuestion.textContent = puzzle.question;
  elements.puzzleHint.innerHTML = `<strong>PISTA:</strong> ${escapeHtml(puzzle.hint)}`;
  elements.puzzleExplanation.textContent = puzzle.explanation;
}

function resetPuzzle(nextIndex = puzzleIndex, running = true) {
  puzzleIndex = nextIndex;
  puzzleSeconds = 5 * 60;
  puzzleRunning = running;
  puzzleSolved = false;
  elements.puzzleAnswer.value = "";
  elements.puzzleHint.classList.add("hidden");
  elements.puzzleSolution.classList.add("hidden");
  elements.puzzleFeedback.classList.add("hidden");
  elements.puzzleFeedback.classList.remove("success");
  renderPuzzle();
}

function learningProgressKey(block, difficulty = lockedLearningDifficulty || learningDifficulty) {
  return `${difficulty}:${block}`;
}

function readLearningProgress() {
  const progress = readJson(LEARNING_PROGRESS_KEY, {});
  return progress.date === todayKey() && progress.completed && typeof progress.completed === "object"
    ? progress.completed
    : {};
}

function readLearningDifficulty() {
  const progress = readJson(LEARNING_PROGRESS_KEY, {});
  return progress.date === todayKey() && LEARNING_DIFFICULTIES[progress.difficulty]
    ? progress.difficulty
    : null;
}

function completeLearningBlock(block) {
  const difficulty = lockedLearningDifficulty || learningDifficulty;
  if (!difficulty) return;
  learningProgress[learningProgressKey(block, difficulty)] = true;
  localStorage.setItem(
    LEARNING_PROGRESS_KEY,
    JSON.stringify({ date: todayKey(), difficulty, completed: learningProgress }),
  );
  markCloudChange();
  renderLearningHub();
}

function dailyLearningFact(difficulty = lockedLearningDifficulty || learningDifficulty || "medium") {
  const level = LEARNING_DIFFICULTIES[difficulty].index;
  return RANDOM_FACTS[dailyContentIndex(RANDOM_FACTS.length, 17 + level * 11)];
}

function dailyCultureForDifficulty(difficulty = lockedLearningDifficulty || learningDifficulty || "medium") {
  const level = LEARNING_DIFFICULTIES[difficulty].index;
  return DAILY_CULTURE_QUESTIONS[
    dailyContentIndex(DAILY_CULTURE_QUESTIONS.length, 41 + level * 13)
  ];
}

function dailyMemoryForDifficulty(difficulty = lockedLearningDifficulty || learningDifficulty || "medium") {
  const bank = MEMORY_CHALLENGES[difficulty];
  return bank[dailyContentIndex(bank.length, 73)];
}

function renderDailyCulture() {
  const daily = dailyCultureForDifficulty();
  elements.dailyCultureQuestion.textContent = daily.question;
  elements.dailyCultureAnswer.textContent = daily.answer;
}

function renderLearningHub() {
  const difficulty = lockedLearningDifficulty || learningDifficulty;
  elements.learningAcademy.classList.toggle("difficulty-locked", Boolean(difficulty));
  elements.learningAcademy.classList.toggle("difficulty-pending", !difficulty);
  elements.learningDifficulty.querySelectorAll("[data-learning-difficulty]").forEach((button) => {
    button.classList.toggle("active", button.dataset.learningDifficulty === difficulty);
  });
  elements.learningReadyState.textContent = "ELEGÍ UNO PARA CONTINUAR";
  elements.learningBlockGrid.querySelectorAll("[data-learning-block]").forEach((button) => {
    const block = button.dataset.learningBlock;
    const complete = difficulty && learningProgress[learningProgressKey(block, difficulty)];
    button.disabled = !difficulty;
    button.classList.toggle("complete", Boolean(complete));
    button.querySelector("em").textContent = complete
      ? "✓ COMPLETADO"
      : difficulty
        ? "ENTRAR →"
        : "BLOQUEADO";
  });
}

function openLearningAcademy() {
  learningDifficulty = readLearningDifficulty();
  lockedLearningDifficulty = learningDifficulty;
  activeLearningBlock = null;
  learningProgress = readLearningProgress();
  puzzleRunning = false;
  elements.learningHub.classList.remove("hidden");
  elements.learningSession.classList.add("hidden");
  renderLearningHub();
}

function openLearningBlock(block) {
  const difficulty = lockedLearningDifficulty || learningDifficulty;
  if (!difficulty) {
    showToast("Elegí una dificultad antes de entrar.");
    return;
  }
  lockedLearningDifficulty = difficulty;
  activeLearningBlock = block;
  elements.learningHub.classList.add("hidden");
  elements.learningSession.classList.remove("hidden");
  elements.learningLockedDifficulty.textContent = LEARNING_DIFFICULTIES[lockedLearningDifficulty].label;
  [elements.learningFactSession, elements.learningRiddleSession, elements.learningCultureSession, elements.learningMemorySession]
    .forEach((section) => section.classList.add("hidden"));
  if (block === "fact") {
    elements.learningFactSession.classList.remove("hidden");
    elements.dailyRandomFact.textContent = dailyLearningFact();
    elements.learningFactComplete.textContent = learningProgress[learningProgressKey("fact")]
      ? "✓ LEÍDO HOY"
      : "✓ GUARDAR COMO LEÍDO";
  } else if (block === "culture") {
    elements.learningCultureSession.classList.remove("hidden");
    elements.dailyCultureAnswer.classList.add("hidden");
    elements.cultureAnswerInput.value = "";
    elements.cultureFeedback.textContent = "";
    elements.cultureFeedback.classList.add("hidden");
    elements.cultureFeedback.classList.remove("success");
    elements.revealDailyCulture.textContent = "VER RESPUESTA";
    renderDailyCulture();
  } else if (block === "memory") {
    const challenge = dailyMemoryForDifficulty();
    elements.learningMemorySession.classList.remove("hidden");
    elements.memoryStudy.classList.remove("hidden");
    elements.memoryTest.classList.add("hidden");
    memoryStudySeconds = 10;
    memoryStudyRunning = true;
    elements.memoryCountdown.textContent = "00:10";
    elements.memorySequence.textContent = challenge.sequence;
    elements.memoryQuestion.textContent = challenge.question;
    elements.memoryAnswer.value = "";
    elements.memoryFeedback.classList.add("hidden");
  } else {
    const candidates = LEARNING_DIFFICULTIES[lockedLearningDifficulty].puzzleIndexes;
    const level = LEARNING_DIFFICULTIES[lockedLearningDifficulty].index;
    elements.learningRiddleSession.classList.remove("hidden");
    resetPuzzle(candidates[dailyContentIndex(candidates.length, 97 + level * 19)], true);
  }
}

function closeLearningBlock() {
  activeLearningBlock = null;
  puzzleRunning = false;
  memoryStudyRunning = false;
  elements.learningSession.classList.add("hidden");
  elements.learningHub.classList.remove("hidden");
  renderLearningHub();
}

function checkPuzzleAnswer() {
  const answer = normalizePuzzleAnswer(elements.puzzleAnswer.value);
  if (!answer) {
    elements.puzzleFeedback.textContent = "Escribí primero tu respuesta.";
    elements.puzzleFeedback.classList.remove("hidden", "success");
    return;
  }
  const puzzle = MENTAL_PUZZLES[puzzleIndex];
  const correct = puzzle.answers.some((candidate) => normalizePuzzleAnswer(candidate) === answer);
  elements.puzzleFeedback.classList.remove("hidden");
  elements.puzzleFeedback.classList.toggle("success", correct);
  if (!correct) {
    elements.puzzleFeedback.textContent = "Todavía no. Probá mirarlo desde otro ángulo.";
    return;
  }
  puzzleSolved = true;
  puzzleRunning = false;
  elements.puzzleFeedback.textContent = "¡Correcto! Resolviste el desafío mental.";
  elements.puzzleSolution.classList.remove("hidden");
  completeLearningBlock("riddle");
}

function tickHubAndPuzzle() {
  elements.hubCurrentTime.textContent = localTimeKey();
  const now = new Date();
  const dateKey = todayKey(now);
  const timeKey = localTimeKey(now);
  const alarm = hubAlarms.find(
    (item) => item.enabled && item.time === timeKey && item.lastTriggeredDate !== dateKey,
  );
  if (alarm) {
    alarm.lastTriggeredDate = dateKey;
    save();
    renderHubAlarms();
    showHubAlert("¡ALARMA DEL HUB!", alarm.label || `Alarma de las ${alarm.time}`);
  }
  if (hubTimerRunning) {
    hubTimerSeconds = Math.max(0, hubTimerSeconds - 1);
    if (hubTimerSeconds === 0) {
      hubTimerRunning = false;
      showHubAlert("¡TIEMPO CUMPLIDO!", "Terminó tu temporizador. Es momento de cambiar de bloque.");
    }
    renderHub();
  }
  if (puzzleRunning) {
    puzzleSeconds = Math.max(0, puzzleSeconds - 1);
    if (puzzleSeconds === 0) {
      puzzleRunning = false;
      elements.puzzleFeedback.textContent = "Pasaron cinco minutos. Podés pedir una pista o ver la solución.";
      elements.puzzleFeedback.classList.remove("hidden", "success");
    }
    renderPuzzle();
  }
  if (memoryStudyRunning && activeLearningBlock === "memory") {
    memoryStudySeconds = Math.max(0, memoryStudySeconds - 1);
    elements.memoryCountdown.textContent = `00:${String(memoryStudySeconds).padStart(2, "0")}`;
    if (memoryStudySeconds === 0) {
      memoryStudyRunning = false;
      elements.memoryStudy.classList.add("hidden");
      elements.memoryTest.classList.remove("hidden");
      elements.memoryAnswer.focus();
    }
  }
}

function renderFocusTimer() {
  const formatted = formatFocusTime(focusSeconds);
  elements.focusTime.textContent = formatted;
  elements.writingSessionMini.textContent = formatted;
  elements.focusTimer.classList.toggle("running", focusRunning);
  elements.focusStatus.textContent = focusRunning ? "ESCRIBIENDO" : "PREPARADO";
  elements.focusStart.textContent = focusRunning
    ? "❚❚ PAUSAR"
    : focusSeconds === 0
      ? "▶ OTRA SESIÓN"
      : "▶ EMPEZAR";
  document.querySelectorAll("[data-focus-minutes]").forEach((button) => {
    button.classList.toggle(
      "active",
      Number(button.dataset.focusMinutes) * 60 === focusDuration,
    );
  });
}

function chooseFocusDuration(minutes) {
  if (focusTimerInterval) window.clearInterval(focusTimerInterval);
  focusTimerInterval = null;
  focusDuration = minutes * 60;
  focusSeconds = focusDuration;
  focusRunning = false;
  renderFocusTimer();
}

function toggleFocusTimer() {
  if (focusRunning) {
    if (focusTimerInterval) window.clearInterval(focusTimerInterval);
    focusTimerInterval = null;
    focusRunning = false;
    renderFocusTimer();
    return;
  }

  if (focusSeconds === 0) focusSeconds = focusDuration;
  focusRunning = true;
  renderFocusTimer();
  focusTimerInterval = window.setInterval(() => {
    focusSeconds = Math.max(0, focusSeconds - 1);
    if (focusSeconds === 0) {
      window.clearInterval(focusTimerInterval);
      focusTimerInterval = null;
      focusRunning = false;
      showHubAlert(
        "¡SESIÓN CREATIVA TERMINADA!",
        "Terminó tu bloque de escritura. Guardá la idea, descansá un momento o empezá otra sesión.",
      );
    }
    renderFocusTimer();
  }, 1000);
}

function resetFocusTimer() {
  if (focusTimerInterval) window.clearInterval(focusTimerInterval);
  focusTimerInterval = null;
  focusSeconds = focusDuration;
  focusRunning = false;
  renderFocusTimer();
}

async function copyFullWritingDocument() {
  persistActiveWritingDraft();
  const project = activeWritingProject();
  const documentText = String(project?.content || "")
    .replaceAll(WRITING_PAGE_BREAK, "\n\n")
    .trimEnd();
  if (!documentText.trim()) {
    showToast("Todavía no hay texto para copiar.");
    return;
  }
  try {
    await navigator.clipboard.writeText(documentText);
    const pageCount = splitWritingPages(project.content).length;
    showToast(
      `Guion completo copiado · ${pageCount} ${pageCount === 1 ? "hoja" : "hojas"}.`,
    );
  } catch {
    showToast("No se pudo copiar el guion. Volvé a intentarlo.");
  }
}

function splitWritingPages(content = "") {
  const pages = String(content).split(WRITING_PAGE_BREAK);
  return pages.length ? pages : [""];
}

function activeWritingProject() {
  return writingProjects.find((project) => project.id === activeWritingId);
}

function findWritingPageSplit(textarea, value) {
  if (value.length < 2) return null;
  const style = window.getComputedStyle(textarea);
  const pixels = (rawValue) => {
    const parsed = Number.parseFloat(rawValue);
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const fontSize = pixels(style.fontSize) || 14;
  const lineHeight = pixels(style.lineHeight) || fontSize * 1.62;
  const usableHeight = Math.max(
    lineHeight,
    textarea.clientHeight - pixels(style.paddingTop) - pixels(style.paddingBottom),
  );
  const usableWidth = Math.max(
    fontSize * 10,
    textarea.clientWidth - pixels(style.paddingLeft) - pixels(style.paddingRight),
  );
  const letterSpacing = style.letterSpacing === "normal"
    ? 0
    : pixels(style.letterSpacing);
  const glyphWidth = Math.max(1, fontSize * 0.602 + letterSpacing);
  const maxRows = Math.max(3, Math.floor(usableHeight / lineHeight));
  const maxColumns = Math.max(20, Math.floor(usableWidth / glyphWidth));
  let row = 1;
  let column = 0;
  let low = value.length;

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (character === "\n") {
      if (row >= maxRows) {
        low = index + 1;
        break;
      }
      row += 1;
      column = 0;
      continue;
    }
    const width = character === "\t"
      ? Math.max(1, 4 - (column % 4))
      : 1;
    if (column > 0 && column + width > maxColumns) {
      if (row >= maxRows) {
        low = index;
        break;
      }
      row += 1;
      column = 0;
    }
    column += width;
  }

  if (low >= value.length) return null;
  const previousLineBreak = value.lastIndexOf("\n", low - 1);
  const previousSpace = value.lastIndexOf(" ", low - 1);
  const naturalBreak = Math.max(previousLineBreak, previousSpace);
  return naturalBreak >= Math.floor(low * 0.82) ? naturalBreak + 1 : low;
}

function paginateWritingText(textarea, content) {
  if (!content) return [""];
  const pages = [];
  let remaining = content;
  let guard = 0;
  while (remaining && guard < 1000) {
    guard += 1;
    const splitAt = findWritingPageSplit(textarea, remaining);
    if (splitAt === null || splitAt >= remaining.length) {
      pages.push(remaining);
      remaining = "";
    } else {
      pages.push(remaining.slice(0, splitAt));
      remaining = remaining.slice(splitAt);
    }
  }
  if (remaining) pages.push(remaining);
  return pages.length ? pages : [""];
}

function locateWritingCursor(pages, absoluteCursor) {
  let remaining = Math.max(0, absoluteCursor);
  for (let index = 0; index < pages.length; index += 1) {
    if (remaining <= pages[index].length) {
      return { page: index, offset: remaining };
    }
    remaining -= pages[index].length;
  }
  const lastPage = Math.max(0, pages.length - 1);
  return { page: lastPage, offset: pages[lastPage]?.length || 0 };
}

function screenplayBlockTemplate(type, selectedText) {
  const selected = selectedText.trim();
  if (type === "scene") {
    const text = (selected || "INT./EXT. LUGAR - DÍA").toUpperCase();
    return { text, selectionStart: 0, selectionEnd: text.length };
  }
  if (type === "action") {
    const text = selected || "Describí la acción";
    return { text, selectionStart: 0, selectionEnd: text.length };
  }
  if (type === "character") {
    const name = (selected || "PERSONAJE").toUpperCase();
    return {
      text: `${SCREENPLAY_CHARACTER_INDENT}${name}`,
      selectionStart: SCREENPLAY_CHARACTER_INDENT.length,
      selectionEnd: SCREENPLAY_CHARACTER_INDENT.length + name.length,
    };
  }
  if (type === "dialogue") {
    const dialogue = selected || "Escribí el diálogo";
    const text = `${SCREENPLAY_DIALOGUE_INDENT}${dialogue}`;
    return {
      text,
      selectionStart: SCREENPLAY_DIALOGUE_INDENT.length,
      selectionEnd: SCREENPLAY_DIALOGUE_INDENT.length + dialogue.length,
    };
  }
  if (type === "parenthetical") {
    const note = selected || "acotación";
    return {
      text: `              (${note})`,
      selectionStart: 15,
      selectionEnd: 15 + note.length,
    };
  }
  const transition = (selected || "CORTE A:").toUpperCase();
  return {
    text: `                                  ${transition}`,
    selectionStart: 34,
    selectionEnd: 34 + transition.length,
  };
}

function isScreenplayCharacterLine(value, cursor) {
  const lineStart = value.lastIndexOf("\n", Math.max(0, cursor - 1)) + 1;
  const nextLineBreak = value.indexOf("\n", cursor);
  if (nextLineBreak !== -1 && cursor !== nextLineBreak) return false;
  const line = value.slice(lineStart, cursor);
  return line.startsWith(SCREENPLAY_CHARACTER_INDENT) &&
    line[SCREENPLAY_CHARACTER_INDENT.length] !== " " &&
    line.slice(SCREENPLAY_CHARACTER_INDENT.length).trim().length > 0;
}

function updateWritingCount() {
  const project = activeWritingProject();
  const count = wordCount(
    String(project?.content || "").replaceAll(WRITING_PAGE_BREAK, " "),
  );
  elements.writingWordCount.textContent = `${count} PALABRAS`;
}

function emptyWritingHistory(projectId = activeWritingId) {
  return {
    projectId,
    undo: [],
    redo: [],
    lastGroup: null,
    lastRecordedAt: 0,
  };
}

function resetWritingHistory(projectId = activeWritingId) {
  writingHistory = emptyWritingHistory(projectId);
}

function recordWritingHistory(nextContent, group, recordedAt = 0) {
  const project = activeWritingProject();
  if (!project || nextContent === project.content) return;
  if (writingHistory.projectId !== activeWritingId) {
    resetWritingHistory(activeWritingId);
  }
  const mergeTyping =
    group === "typing" &&
    writingHistory.lastGroup === "typing" &&
    recordedAt > 0 &&
    recordedAt - writingHistory.lastRecordedAt < 900;
  if (!mergeTyping) {
    writingHistory.undo.push({
      content: project.content,
      pageIndex: activeWritingPage,
      selectionStart: elements.writingContent.selectionStart || 0,
      selectionEnd:
        elements.writingContent.selectionEnd ||
        elements.writingContent.selectionStart ||
        0,
    });
    if (writingHistory.undo.length > 60) writingHistory.undo.shift();
  }
  writingHistory.redo = [];
  writingHistory.lastGroup = group;
  writingHistory.lastRecordedAt = recordedAt;
}

function restoreWritingHistory(direction) {
  const project = activeWritingProject();
  if (!project) return;
  if (writingHistory.projectId !== activeWritingId) {
    resetWritingHistory(activeWritingId);
    return;
  }
  const source = direction === "undo"
    ? writingHistory.undo
    : writingHistory.redo;
  const target = source.pop();
  if (!target) return;
  const destination = direction === "undo"
    ? writingHistory.redo
    : writingHistory.undo;
  destination.push({
    content: project.content,
    pageIndex: activeWritingPage,
    selectionStart: elements.writingContent.selectionStart || 0,
    selectionEnd:
      elements.writingContent.selectionEnd ||
      elements.writingContent.selectionStart ||
      0,
  });
  if (destination.length > 60) destination.shift();
  writingHistory.lastGroup = null;
  writingHistory.lastRecordedAt = 0;

  project.content = target.content;
  project.updatedAt = new Date().toISOString();
  const restoredPages = splitWritingPages(project.content);
  activeWritingPage = Math.max(
    0,
    Math.min(target.pageIndex, restoredPages.length - 1),
  );
  closeScriptContextMenu();
  renderWritingPage();
  renderWritingProjectList();
  window.requestAnimationFrame(() => {
    elements.writingContent.focus();
    const start = Math.min(
      target.selectionStart,
      elements.writingContent.value.length,
    );
    const end = Math.min(
      target.selectionEnd,
      elements.writingContent.value.length,
    );
    elements.writingContent.setSelectionRange(start, end);
  });
  scheduleWritingAutosave();
}

function renderWritingPage() {
  const project = activeWritingProject();
  if (!project) return;
  const pages = splitWritingPages(project.content);
  activeWritingPage = Math.max(
    0,
    Math.min(activeWritingPage, pages.length - 1),
  );
  elements.writingContent.value = pages[activeWritingPage] || "";
  elements.writingContent.placeholder = activeWritingPage === 0
    ? "Empezá a escribir acá…"
    : "Continuá escribiendo…";
  elements.writingPageCurrent.textContent = String(activeWritingPage + 1);
  elements.writingPageTotal.textContent = String(pages.length);
  elements.writingPrevPage.disabled = activeWritingPage === 0;
  elements.writingNextPage.disabled = activeWritingPage >= pages.length - 1;
  elements.writingContent.maxLength = Math.max(
    1,
    200000 - String(project.content || "").length +
      elements.writingContent.value.length,
  );
  updateWritingCount();
}

function reflowWritingFromPage(
  startPage,
  flowingContent,
  selectionStart,
  selectionEnd = selectionStart,
  historyGroup = null,
  historyRecordedAt = 0,
) {
  const project = activeWritingProject();
  if (!project) return;
  const pages = splitWritingPages(project.content);
  const currentPage = Math.max(
    0,
    Math.min(startPage, pages.length - 1),
  );
  const prefixPages = pages.slice(0, currentPage);
  const reflowedPages = flowingContent || currentPage === 0
    ? paginateWritingText(elements.writingContent, flowingContent)
    : [];
  const nextPages = [...prefixPages, ...reflowedPages];
  if (!nextPages.length) nextPages.push("");

  let targetPage = currentPage;
  let targetStart = selectionStart;
  let targetEnd = selectionEnd;
  if (reflowedPages.length) {
    const startLocation = locateWritingCursor(reflowedPages, selectionStart);
    const endLocation = locateWritingCursor(reflowedPages, selectionEnd);
    targetPage = currentPage + endLocation.page;
    targetEnd = endLocation.offset;
    targetStart = startLocation.page === endLocation.page
      ? startLocation.offset
      : endLocation.offset;
  } else {
    targetPage = Math.max(0, prefixPages.length - 1);
    targetStart = nextPages[targetPage]?.length || 0;
    targetEnd = targetStart;
  }

  const shouldRender =
    targetPage !== activeWritingPage ||
    nextPages.length !== pages.length ||
    nextPages[activeWritingPage] !== elements.writingContent.value;
  const nextContent = nextPages.join(WRITING_PAGE_BREAK).slice(0, 200000);
  if (historyGroup) {
    recordWritingHistory(nextContent, historyGroup, historyRecordedAt);
  }
  activeWritingPage = targetPage;
  project.content = nextContent;
  project.updatedAt = new Date().toISOString();
  if (shouldRender) renderWritingPage();
  else updateWritingCount();
  window.requestAnimationFrame(() => {
    elements.writingContent.focus();
    const boundedStart = Math.min(targetStart, elements.writingContent.value.length);
    const boundedEnd = Math.min(targetEnd, elements.writingContent.value.length);
    elements.writingContent.setSelectionRange(boundedStart, boundedEnd);
  });
  scheduleWritingAutosave();
}

function updateActiveWritingPage(event) {
  const project = activeWritingProject();
  if (!project) return;
  const pages = splitWritingPages(project.content);
  activeWritingPage = Math.max(0, Math.min(activeWritingPage, pages.length - 1));
  const value = elements.writingContent.value;
  const cursor = elements.writingContent.selectionStart ?? value.length;
  const selectionEnd = elements.writingContent.selectionEnd ?? cursor;
  const followingContent = pages.slice(activeWritingPage + 1).join("");
  reflowWritingFromPage(
    activeWritingPage,
    `${value}${followingContent}`,
    cursor,
    selectionEnd,
    event?.type === "input" ? "typing" : null,
    event?.timeStamp || 0,
  );
}

function normalizeWritingPagination() {
  const project = activeWritingProject();
  if (!project) return;
  const pages = splitWritingPages(project.content);
  const flowingContent = pages.join("");
  const normalizedContent = paginateWritingText(
    elements.writingContent,
    flowingContent,
  ).join(WRITING_PAGE_BREAK);
  if (normalizedContent === project.content) return;
  const currentPage = Math.max(
    0,
    Math.min(activeWritingPage, pages.length - 1),
  );
  const prefixLength = pages
    .slice(0, currentPage)
    .reduce((total, page) => total + page.length, 0);
  const selectionStart = prefixLength +
    (elements.writingContent.selectionStart || 0);
  const selectionEnd = prefixLength +
    (elements.writingContent.selectionEnd ||
      elements.writingContent.selectionStart ||
      0);
  reflowWritingFromPage(
    0,
    flowingContent,
    selectionStart,
    selectionEnd,
  );
}

function closeScriptContextMenu() {
  scriptContextSelection = null;
  elements.scriptContextMenu.classList.add("hidden");
}

function openScriptContextMenu(event) {
  event.preventDefault();
  const menuWidth = 210;
  const menuHeight = 300;
  scriptContextSelection = {
    selectionStart: elements.writingContent.selectionStart || 0,
    selectionEnd:
      elements.writingContent.selectionEnd ||
      elements.writingContent.selectionStart ||
      0,
  };
  elements.scriptContextMenu.style.left = `${Math.min(event.clientX, window.innerWidth - menuWidth - 12)}px`;
  elements.scriptContextMenu.style.top = `${Math.min(event.clientY, window.innerHeight - menuHeight - 12)}px`;
  elements.scriptContextMenu.classList.remove("hidden");
}

function insertScreenplayBlock(type) {
  if (!SCREENPLAY_BLOCKS.has(type) || !scriptContextSelection) return;
  const project = activeWritingProject();
  if (!project) return;
  const pages = splitWritingPages(project.content);
  const currentPage = Math.max(0, Math.min(activeWritingPage, pages.length - 1));
  const pageText = pages[currentPage] || "";
  const start = Math.min(scriptContextSelection.selectionStart, pageText.length);
  const end = Math.min(scriptContextSelection.selectionEnd, pageText.length);
  const template = screenplayBlockTemplate(type, pageText.slice(start, end));
  const before = pageText.slice(0, start);
  const after = pageText.slice(end);
  const leadingBreak = start === 0 || before.endsWith("\n") ? "" : "\n";
  const trailingBreak =
    end >= pageText.length ? "\n" : after.startsWith("\n") ? "" : "\n";
  const inserted = `${leadingBreak}${template.text}${trailingBreak}`;
  const nextPageText = `${before}${inserted}${after}`;
  const selectionBase = start + leadingBreak.length;
  const followingContent = pages.slice(currentPage + 1).join("");
  closeScriptContextMenu();
  reflowWritingFromPage(
    currentPage,
    `${nextPageText}${followingContent}`,
    selectionBase + template.selectionStart,
    selectionBase + template.selectionEnd,
    "format",
  );
}

function renderWritingProjectList() {
  elements.writingProjectList.innerHTML = writingProjects
    .map(
      (project, index) => `
        <article class="${project.id === activeWritingId ? "active" : ""}">
          <button type="button" class="writing-project-open" data-writing-id="${project.id}">
            <span class="book-spine book-${index % 4}">${index + 1}</span>
            <span>
              <strong>${escapeHtml(project.title)}</strong>
              <small>${
                wordCount(project.content)
                  ? `${wordCount(project.content)} palabras`
                  : "Libro en blanco"
              }</small>
            </span>
          </button>
          <span class="writing-project-actions">
            <button type="button" class="duplicate-writing-project" data-writing-duplicate="${project.id}" title="Duplicar como nueva version" aria-label="Duplicar ${escapeHtml(project.title)} como nueva version"><span class="writing-action-glyph duplicate-glyph" aria-hidden="true"></span></button>
            <button type="button" class="delete-writing-project" data-writing-delete="${project.id}" title="Eliminar proyecto" aria-label="Eliminar ${escapeHtml(project.title)}"><span class="writing-action-glyph delete-glyph" aria-hidden="true"></span></button>
          </span>
        </article>
      `,
    )
    .join("");
}

function openWritingDeleteConfirm(projectId) {
  const project = writingProjects.find((item) => item.id === projectId);
  if (!project) return;
  pendingWritingDeleteId = projectId;
  elements.writingDeleteProjectTitle.textContent = project.title;
  elements.writingDeleteConfirm.classList.remove("hidden");
  window.setTimeout(() => elements.cancelWritingDelete.focus(), 30);
}

function closeWritingDeleteConfirm() {
  pendingWritingDeleteId = null;
  elements.writingDeleteConfirm.classList.add("hidden");
}

function confirmWritingProjectDelete() {
  const project = writingProjects.find(
    (item) => item.id === pendingWritingDeleteId,
  );
  if (!project) {
    closeWritingDeleteConfirm();
    return;
  }
  const projectId = project.id;
  writingProjects = writingProjects.filter((item) => item.id !== projectId);
  writingEditorOpen = false;
  if (projectId === activeWritingId) {
    activeWritingId = writingProjects[0]?.id ?? null;
    activeWritingPage = 0;
    resetWritingHistory(activeWritingId);
  }
  closeWritingDeleteConfirm();
  save();
  renderWriting();
  showToast(`${project.title} fue eliminado de la biblioteca.`);
}

function persistActiveWritingDraft() {
  window.clearTimeout(writingAutosaveTimer);
  if (
    activeWritingId === null ||
    elements.writingEditor.classList.contains("hidden")
  ) {
    return false;
  }
  const project = writingProjects.find(
    (item) => item.id === activeWritingId,
  );
  if (!project) return false;
  const nextTitle = elements.writingTitle.value.trim();
  const pages = splitWritingPages(project.content);
  pages[activeWritingPage] = elements.writingContent.value;
  if (nextTitle) project.title = nextTitle;
  project.content = pages.join(WRITING_PAGE_BREAK).slice(0, 200000);
  project.updatedAt = new Date().toISOString();
  localStorage.setItem(WRITING_KEY, JSON.stringify(writingProjects));
  markCloudChange();
  renderWritingProjectList();
  return true;
}

function scheduleWritingAutosave() {
  window.clearTimeout(writingAutosaveTimer);
  writingAutosaveTimer = window.setTimeout(() => {
    persistActiveWritingDraft();
  }, 400);
}

function renderWriting() {
  if (
    activeWritingId !== null &&
    !writingProjects.some((project) => project.id === activeWritingId)
  ) {
    activeWritingId = writingProjects[0]?.id ?? null;
    activeWritingPage = 0;
    resetWritingHistory(activeWritingId);
  }

  renderWritingProjectList();
  renderFocusTimer();

  const active = writingProjects.find(
    (project) => project.id === activeWritingId,
  );
  elements.creativityView.classList.toggle(
    "editor-open",
    Boolean(active && writingEditorOpen),
  );
  elements.creativityContent.classList.toggle(
    "editor-open",
    Boolean(active && writingEditorOpen),
  );
  elements.writingEditor.classList.toggle("hidden", !active);
  elements.emptyWriting.classList.toggle("hidden", Boolean(active));
  if (!active) return;

  elements.writingTitle.value = active.title;
  renderWritingPage();
  window.requestAnimationFrame(() => {
    if (
      elements.writingContent.scrollHeight >
      elements.writingContent.clientHeight + 2
    ) {
      updateActiveWritingPage();
    }
  });
}

function renderFinance() {
  const total = (type) =>
    financeEntries
      .filter((entry) => entry.type === type)
      .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const cash = total("cash");
  const income = total("income");
  const assets = total("asset");
  const debts = total("debt");
  document.querySelector("#cash-total").textContent = money(cash);
  document.querySelector("#income-total").textContent = money(income);
  document.querySelector("#asset-total").textContent = money(assets);
  document.querySelector("#debt-total").textContent = money(debts);
  document.querySelector("#net-total").textContent = money(cash + assets - debts);
  document.querySelector("#finance-count").textContent =
    `${financeEntries.length} ${financeEntries.length === 1 ? "REGISTRO" : "REGISTROS"}`;

  if (!financeEntries.length) {
    elements.financeList.innerHTML = `
      <div class="empty-finance">
        <span>◇</span>
        <p>El cofre está vacío. Agregá tu plata, ingresos, activos o deudas.</p>
      </div>
    `;
    return;
  }

  const typeLabel = {
    cash: "PLATA",
    income: "INGRESO FIJO",
    asset: "ACTIVO",
    debt: "DEUDA",
  };
  const typeIcon = { cash: "$", income: "↗", asset: "◆", debt: "!" };
  elements.financeList.innerHTML = financeEntries
    .map(
      (entry) => `
        <article class="finance-entry ${entry.type}">
          <span class="finance-entry-icon">${typeIcon[entry.type]}</span>
          <div>
            <strong>${escapeHtml(entry.name)}</strong>
            <small>${typeLabel[entry.type]}${entry.notes ? ` · ${escapeHtml(entry.notes)}` : ""}</small>
          </div>
          <b>${money(Number(entry.amount))}</b>
          <button data-finance-delete="${entry.id}" aria-label="Eliminar registro">×</button>
        </article>
      `,
    )
    .join("");
}

function renderCofferHome() {
  elements.cofferInventoryCount.textContent =
    `${financeEntries.length + cofferNotes.length} OBJETOS`;
  elements.cofferFinanceCount.textContent =
    `${financeEntries.length} ${financeEntries.length === 1 ? "registro" : "registros"}`;
  elements.cofferNotesCount.textContent =
    `${cofferNotes.length} ${cofferNotes.length === 1 ? "guardado" : "guardados"}`;
}

function clearCofferNoteForm() {
  elements.cofferNoteForm.reset();
  elements.cofferNoteEditId.value = "";
  elements.cofferNoteEyebrow.textContent = "NUEVO PERGAMINO";
  elements.saveCofferNote.textContent = "+ GUARDAR PERGAMINO";
  elements.cancelCofferNoteEdit.classList.add("hidden");
}

function renderCofferNotes() {
  elements.cofferNoteLedgerCount.textContent =
    `${cofferNotes.length} GUARDADOS`;
  if (!cofferNotes.length) {
    elements.cofferNoteList.innerHTML = `
      <div class="empty-finance">
        <span>▤</span>
        <p>Todavía no guardaste información importante.</p>
      </div>
    `;
    return;
  }
  elements.cofferNoteList.innerHTML = cofferNotes
    .map(
      (note) => `
        <article class="coffer-note-card">
          <span class="coffer-note-icon" aria-hidden="true">▤</span>
          <button type="button" class="coffer-note-open" data-coffer-note-edit="${note.id}">
            <strong>${escapeHtml(note.title)}</strong>
            <small>${escapeHtml(note.content)}</small>
          </button>
          <button type="button" class="coffer-note-delete" data-coffer-note-delete="${note.id}" aria-label="Eliminar ${escapeHtml(note.title)}">×</button>
        </article>
      `,
    )
    .join("");
}

function setCofferTab(tab) {
  activeCofferTab = tab;
  elements.cofferHomeTab.classList.toggle("active", tab === "home");
  elements.cofferFinanceTab.classList.toggle("active", tab === "finance");
  elements.cofferPasswordTab.classList.toggle("active", tab === "passwords");
  elements.cofferNotesTab.classList.toggle("active", tab === "notes");
  elements.cofferInventoryHome.classList.toggle("hidden", tab !== "home");
  elements.financeMoneySection.classList.toggle("hidden", tab !== "finance");
  elements.passwordVaultSection.classList.toggle(
    "hidden",
    tab !== "passwords",
  );
  elements.cofferNotesSection.classList.toggle("hidden", tab !== "notes");
  if (tab === "home") renderCofferHome();
  if (tab === "finance") renderFinance();
  if (tab === "passwords") renderPasswordVault();
  if (tab === "notes") renderCofferNotes();
}

function clearPasswordEntryForm() {
  document.querySelector("#password-entry-dialog")?.close();
  elements.passwordEntryForm.reset();
  elements.passwordEditId.value = "";
  elements.passwordSecret.type = "password";
  elements.toggleFormPassword.textContent = "◎";
  elements.toggleFormPassword.setAttribute("aria-label", "Mostrar contraseña");
  elements.passwordFormEyebrow.textContent = "NUEVA LLAVE";
  elements.passwordFormTitle.textContent = "Guardar contraseña";
  elements.savePasswordEntry.textContent = "+ GUARDAR LLAVE";
  elements.cancelPasswordEdit.classList.remove("hidden");
}

function lockPasswordVault() {
  passwordVaultAttempt += 1;
  passwordVaultMaster = "";
  passwordVaultEntries = [];
  visiblePasswordIds = new Set();
  elements.vaultMasterForm.reset();
  elements.vaultDeleteConfirm.classList.add("hidden");
  clearPasswordEntryForm();
  renderPasswordVault();
}

function renderPasswordVault() {
  const vaultExists = Boolean(localStorage.getItem(PASSWORD_VAULT_KEY));
  const unlocked = Boolean(passwordVaultMaster);
  // Gate the complete portal; reuse the existing encrypted vault and key.
  elements.financeView.prepend(elements.passwordVaultGate);
  elements.financeView.querySelector(".coffer-content").classList.toggle("hidden", !unlocked);
  elements.passwordVaultGate.classList.toggle("hidden", unlocked);
  elements.passwordVaultContent.classList.toggle("hidden", !unlocked);
  elements.vaultGateTitle.textContent = vaultExists
    ? "Abrir Finanzas"
    : "Protegé tu cofre";
  elements.vaultMasterConfirmField.classList.toggle("hidden", vaultExists);
  elements.vaultMasterConfirm.required = !vaultExists;
  elements.vaultMasterSubmit.textContent = vaultExists
    ? "ABRIR FINANZAS"
    : "CREAR CLAVE Y ENTRAR";
  elements.vaultError.classList.add("hidden");
  if (!unlocked) return;

  elements.passwordCount.textContent =
    `${passwordVaultEntries.length} GUARDADAS`;
  elements.passwordLedgerCount.textContent =
    `${passwordVaultEntries.length} ${
      passwordVaultEntries.length === 1 ? "REGISTRO" : "REGISTROS"
    }`;

  if (!passwordVaultEntries.length) {
    elements.passwordList.innerHTML = `
      <div class="empty-finance">
        <span>⚿</span>
        <p>Todavía no hay accesos. Tocá + para guardar el primero.</p>
      </div>
    `;
    return;
  }

  elements.passwordList.innerHTML = passwordVaultEntries
    .map((entry) => {
      const visible = visiblePasswordIds.has(entry.id);
      return `
        <article class="password-entry">
          <span class="password-entry-icon" aria-hidden="true">⚿</span>
          <div class="password-entry-main">
            <strong>${escapeHtml(entry.service)}</strong>
            <small>${escapeHtml(entry.username || "Sin usuario guardado")}</small>
            <code>${visible ? escapeHtml(entry.password) : "••••••••••••"}</code>
            ${entry.url ? `<small>${escapeHtml(entry.url)}</small>` : ""}
            ${entry.notes ? `<p>${escapeHtml(entry.notes)}</p>` : ""}
          </div>
          <div class="password-entry-actions">
            ${
              entry.username
                ? `<button type="button" data-password-copy-user="${entry.id}">COPIAR USUARIO</button>`
                : ""
            }
            <button type="button" data-password-copy-secret="${entry.id}">COPIAR CLAVE</button>
            <button type="button" data-password-toggle="${entry.id}">${visible ? "OCULTAR" : "VER"}</button>
            <button type="button" class="ui-edit-action" data-password-edit="${entry.id}" aria-label="Editar ${escapeHtml(entry.service)}">✎</button>
            <button type="button" class="danger-action ui-delete-action" data-password-delete="${entry.id}" aria-label="Eliminar ${escapeHtml(entry.service)}">×</button>
          </div>
        </article>
      `;
    })
    .join("");
}

async function persistPasswordEntries(nextEntries) {
  const payload = await encryptPasswordVault(
    nextEntries,
    passwordVaultMaster,
  );
  localStorage.setItem(PASSWORD_VAULT_KEY, payload);
  markCloudChange();
  passwordVaultEntries = nextEntries;
  renderPasswordVault();
}

function beginPasswordEdit(entry) {
  document.querySelector("#password-entry-dialog").showModal();
  elements.passwordEditId.value = entry.id;
  elements.passwordService.value = entry.service || "";
  elements.passwordUsername.value = entry.username || "";
  elements.passwordSecret.value = entry.password || "";
  elements.passwordUrl.value = entry.url || "";
  elements.passwordNotes.value = entry.notes || "";
  elements.passwordSecret.type = "password";
  elements.toggleFormPassword.textContent = "◎";
  elements.passwordFormEyebrow.textContent = "EDITANDO ACCESO";
  elements.passwordFormTitle.textContent = "Modificar contraseña";
  elements.savePasswordEntry.textContent = "GUARDAR CAMBIOS";
  elements.cancelPasswordEdit.classList.remove("hidden");
  elements.passwordService.focus();
}

async function copyPasswordValue(value, label) {
  try {
    await navigator.clipboard.writeText(value);
    showToast(`${label} copiado.`);
  } catch {
    showToast("No se pudo copiar al portapapeles.");
  }
}

function priorityLabel(priority) {
  return priority === "high" ? "ALTA" : "NORMAL";
}

function statusLabel(status) {
  if (status === "done") return "HECHA";
  return "PENDIENTE";
}

function updateTaskProjectOptions(selected = "") {
  const area = elements.taskArea.value;
  const projects =
    area === "laboral"
      ? workProjectList()
      : personalProjectList();
  const validSelected = projects.some(([name]) => name === selected)
    ? selected
    : projects[0]?.[0] || MISSION_BACKPACK_PROJECT;
  elements.taskProject.innerHTML = projects
      .map(
        ([name]) =>
          `<option value="${escapeHtml(name)}" ${name === validSelected ? "selected" : ""}>${escapeHtml(name)}</option>`,
      )
      .join("");
}

function setTaskFormPriority(priority) {
  if (elements.taskPriorityHigh) {
    elements.taskPriorityHigh.checked = priority === "high";
  }
}

function openNewTask(presetProject = projectFilter) {
  setQuickbarActive("new");
  editingTaskFormId = null;
  const parent = currentQuest();
  newTaskParentId = parent?.id ?? null;
  elements.form.reset();
  elements.taskArea.value = MISSION_BACKPACK_AREA;
  const inheritedProject =
    parent?.project || presetProject || MISSION_BACKPACK_PROJECT;
  if (parent) {
    elements.taskArea.value = parent.area;
  } else if (inheritedProject) {
    elements.taskArea.value = isPersonalProject(inheritedProject)
      ? "personal"
      : "laboral";
  }
  updateTaskProjectOptions(inheritedProject);
  setTaskFormPriority("low");
  elements.taskDetailCreated.classList.add("hidden");
  document.querySelector("#task-is-today").checked = false;
  elements.taskModalEyebrow.textContent = "NUEVA MISIÓN";
  elements.taskModalTitle.textContent = "Sacala de tu cabeza";
  elements.taskSubmitLabel.textContent = "GUARDAR MISIÓN";
  elements.taskFormDelete.classList.add("hidden");
  elements.modal.classList.remove("hidden");
  window.setTimeout(() => elements.taskTitle.focus(), 80);
}

function openTaskEditor(id) {
  const task = tasks.find((item) => item.id === id);
  if (!task) return;
  setQuickbarActive("new");
  editingTaskFormId = task.id;
  newTaskParentId = task.parentId;
  elements.form.reset();
  elements.taskTitle.value = task.title;
  elements.taskDetails.value = task.details || "";
  elements.taskArea.value =
    task.area === "general" ? MISSION_BACKPACK_AREA : task.area;
  updateTaskProjectOptions(task.project || MISSION_BACKPACK_PROJECT);
  setTaskFormPriority(task.priority === "high" ? "high" : "low");
  elements.taskDetailCreatedValue.textContent = formatShortDate(task.createdAt);
  elements.taskDetailCreated.classList.remove("hidden");
  document.querySelector("#task-is-quest").checked = Boolean(task.isQuest);
  document.querySelector("#task-is-today").checked =
    Boolean(task.isToday) || task.scheduledDate === todayKey();
  elements.taskModalEyebrow.textContent = "EDITAR MISIÓN";
  elements.taskModalTitle.textContent = "Mover o ajustar tarea";
  elements.taskSubmitLabel.textContent = "GUARDAR CAMBIOS";
  elements.taskFormDelete.classList.remove("hidden");
  elements.modal.classList.remove("hidden");
  window.setTimeout(() => elements.taskTitle.focus(), 80);
}

function enterTaskQuest(id) {
  const task = tasks.find((item) => item.id === id);
  if (!task) return;
  task.isQuest = true;
  questStack.push(task);
  activeTaskTab = "todo";
  elements.panelTitle.textContent = task.title;
  save();
  renderTasks();
}

function isTaskCardInteractiveTarget(target) {
  return Boolean(target?.closest?.("button, input, textarea, select, a"));
}

function closeNewTask() {
  editingTaskFormId = null;
  elements.modal.classList.add("hidden");
  if (elements.panelBackdrop.classList.contains("hidden")) {
    setQuickbarActive(null);
  } else {
    const activeView = [
      ["board", elements.boardView],
      ["mission", elements.missionView],
      ["tasks", elements.tasksView],
      ["projects", elements.projectsView],
      ["profile", elements.profileView],
      ["settings", elements.settingsView],
      ["finance", elements.financeView],
      ["creativity", elements.creativityView],
      ["agenda", elements.agendaView],
      ["calendar", elements.calendarView],
    ].find(([, view]) => !view.classList.contains("hidden"));
    setQuickbarActive(activeView?.[0] ?? null);
  }
}

function updateTaskStatus(id, status) {
  const task = tasks.find((item) => item.id === id);
  if (!task) return;
  const justCompleted = status === "done" && task.status !== "done";
  const dateKey = todayKey();
  const wasToday = task.isToday || task.scheduledDate === dateKey;
  const pendingTodayBefore = tasks.filter(
    (item) =>
      item.status !== "done" &&
      (item.isToday || item.scheduledDate === dateKey),
  );
  const clearsToday =
    justCompleted &&
    wasToday &&
    pendingTodayBefore.length > 0 &&
    pendingTodayBefore.every((item) => item.id === task.id) &&
    localStorage.getItem(DAILY_CLEAR_KEY) !== dateKey;
  task.status = status;
  task.completedAt = status === "done" ? new Date().toISOString() : null;
  if (status === "done") {
    task.isToday = false;
    task.scheduledDate = "";
  }

  if (justCompleted) {
    profile.xp += task.xpReward;
    profile.level =
      ageFromBirthDate(profile.birthDate) ?? Math.floor(profile.xp / 120) + 1;
    const today = dateKey;
    if (profile.lastActive !== today) {
      profile.streak =
        profile.lastActive === yesterdayKey() ? profile.streak + 1 : 1;
      profile.lastActive = today;
    }
    if (clearsToday) localStorage.setItem(DAILY_CLEAR_KEY, dateKey);
    recordTaskCompletion(task);
    showCompletionCelebration(task, clearsToday);
  }

  save();
  if (!elements.missionView.classList.contains("hidden")) renderMission();
  if (!elements.tasksView.classList.contains("hidden")) renderTasks();
  if (!elements.boardView.classList.contains("hidden")) renderBoard();
}

function setTaskTodayState(id, nextIsToday) {
  const task = tasks.find((item) => item.id === id);
  if (!task || task.status === "done") return;
  const dateKey = todayKey();
  const currentlyToday = task.isToday || task.scheduledDate === dateKey;
  if (currentlyToday === nextIsToday) return;
  task.isToday = nextIsToday;
  task.scheduledDate = nextIsToday
    ? dateKey
    : task.scheduledDate === dateKey
      ? ""
      : task.scheduledDate;
  save();
  if (!elements.missionView.classList.contains("hidden")) renderMission();
  if (!elements.tasksView.classList.contains("hidden")) renderTasks();
  if (!elements.boardView.classList.contains("hidden")) renderBoard();
  showToast(
    nextIsToday
      ? "Misión sumada a Misiones del día."
      : "Misión guardada en la Mochila de Misiones.",
  );
}

function toggleTodayTask(id) {
  const task = tasks.find((item) => item.id === id);
  if (!task || task.status === "done") return;
  const dateKey = todayKey();
  const currentlyToday = task.isToday || task.scheduledDate === dateKey;
  setTaskTodayState(id, !currentlyToday);
}

function scheduleTaskDate(id, scheduledDate) {
  const task = tasks.find((item) => item.id === id);
  if (!task || task.status === "done") return;
  task.scheduledDate = scheduledDate;
  task.isToday = scheduledDate === todayKey();
  save();
  renderBoard();
  showToast(
    scheduledDate
      ? `Misión movida al ${scheduledDate.split("-").reverse().join("/")}.`
      : "Misión devuelta a pendientes sin día.",
  );
}

function openInlineTaskRename(id) {
  const task = tasks.find((item) => item.id === id);
  if (!task) return;
  editingTaskId = id;
  if (!elements.tasksView.classList.contains("hidden")) renderTasks();
  if (!elements.boardView.classList.contains("hidden")) renderBoard();
  window.setTimeout(() => {
    const input = document.querySelector(`[data-inline-task-title="${id}"]`);
    input?.focus();
    input?.select();
  }, 20);
}

function finishInlineTaskRename(id, value, cancel = false) {
  if (editingTaskId !== id) return;
  const task = tasks.find((item) => item.id === id);
  const name = String(value || "").trim();
  editingTaskId = null;
  if (!cancel && task && name && name !== task.title) {
    task.title = name;
    questStack = questStack.map((item) => (item.id === id ? task : item));
    save();
    elements.panelTitle.textContent =
      currentQuest()?.title || projectFilter || "Tareas";
    showToast("Nombre actualizado.");
  }
  if (!elements.tasksView.classList.contains("hidden")) renderTasks();
  if (!elements.boardView.classList.contains("hidden")) renderBoard();
}

function openRename(target) {
  if (
    target.type === "project" &&
    target.currentName === MISSION_BACKPACK_PROJECT
  ) {
    showToast("La Mochila de misiones es un proyecto permanente.");
    return;
  }
  renameTarget = target;
  elements.renameTitle.textContent =
    target.type === "project" ? "Cambiar nombre del proyecto" : "Cambiar nombre";
  elements.deleteProjectFromRename.classList.toggle(
    "hidden",
    target.type !== "project",
  );
  elements.renameInput.value = target.currentName;
  elements.renameModal.classList.remove("hidden");
  window.setTimeout(() => {
    elements.renameInput.focus();
    elements.renameInput.select();
  }, 50);
}

function closeRename() {
  renameTarget = null;
  elements.renameModal.classList.add("hidden");
  elements.renameForm.reset();
}

function openProjectDeleteConfirm() {
  if (!renameTarget || renameTarget.type !== "project") return;
  projectDeleteTarget = { ...renameTarget };
  elements.projectDeleteName.textContent = renameTarget.currentName;
  closeRename();
  elements.projectDeleteConfirm.classList.remove("hidden");
}

function closeProjectDeleteConfirm() {
  projectDeleteTarget = null;
  elements.projectDeleteConfirm.classList.add("hidden");
  elements.projectDeleteName.textContent = "";
}

function confirmProjectDelete() {
  if (!projectDeleteTarget) return;
  const target = projectDeleteTarget;
  if (target.id !== null && target.id !== undefined) {
    customProjects = customProjects.filter((project) => project.id !== target.id);
  } else if (target.originalName) {
    projectRenames[target.originalName] = DELETED_PROJECT_SENTINEL;
  }
  tasks = tasks.map((task) =>
    task.project === target.currentName || task.project === target.originalName
      ? {
          ...task,
          area: MISSION_BACKPACK_AREA,
          project: MISSION_BACKPACK_PROJECT,
        }
      : task,
  );
  if (
    projectFilter === target.currentName ||
    projectFilter === target.originalName
  ) {
    projectFilter = "";
    questStack = [];
  }
  save();
  closeProjectDeleteConfirm();
  if (!elements.projectsView.classList.contains("hidden")) renderProjects();
  if (!elements.tasksView.classList.contains("hidden")) {
    elements.panelTitle.textContent = currentQuest()?.title || projectFilter || "Tareas";
    renderTasks();
  }
  if (!elements.boardView.classList.contains("hidden")) renderBoard();
  showToast("Proyecto eliminado. Sus misiones quedaron guardadas sin proyecto.");
}

function isVisibleLayer(element) {
  return Boolean(element && !element.classList.contains("hidden"));
}

function closeTopmostLayer() {
  if (document.querySelector("#password-entry-dialog")?.open) {
    clearPasswordEntryForm();
    document.querySelector("#add-password-entry")?.focus();
    return true;
  }
  const layers = [
    { element: elements.worldModuleDetailBackdrop, close: closeWorldModuleDetails },
    {
      element: elements.partnerWizard,
      close: () => elements.partnerWizard.classList.add("hidden"),
    },
    {
      element: elements.petWizard,
      close: () => elements.petWizard.classList.add("hidden"),
    },
    { element: elements.scriptContextMenu, close: closeScriptContextMenu },
    { element: elements.birthdayAlert, close: closeBirthdayAlert },
    {
      element: elements.writingDeleteConfirm,
      close: closeWritingDeleteConfirm,
    },
    {
      element: elements.achievementCelebration,
      close: closeAchievementCelebration,
    },
    {
      element: elements.completionCelebration,
      close: closeCompletionCelebration,
    },
    { element: elements.exitConfirm, close: closeExitConfirm },
    {
      element: elements.hubAlert,
      close: () => elements.hubAlert.classList.add("hidden"),
    },
    { element: elements.activityPanel, close: closeActivityPanel },
    {
      element: elements.projectDeleteConfirm,
      close: closeProjectDeleteConfirm,
    },
    { element: elements.renameModal, close: closeRename },
    { element: elements.modal, close: closeNewTask },
    {
      element: elements.vaultDeleteConfirm,
      close: () => elements.vaultDeleteConfirm.classList.add("hidden"),
    },
    { element: elements.eventForm, close: cancelEventEdit },
    { element: elements.agendaBirthdayForm, close: cancelBirthdayEdit },
    { element: elements.panelBackdrop, close: closePanel },
  ];
  const topmostLayer = layers.find(({ element }) => isVisibleLayer(element));
  if (!topmostLayer) {
    if (worldBuildMode) {
      setWorldBuildMode(false);
      return true;
    }
    if (undergroundWorldOpen) {
      leaveUndergroundWorld();
      return true;
    }
    return false;
  }
  topmostLayer.close();
  return true;
}

function submitRename() {
  const name = elements.renameInput.value.trim();
  if (!renameTarget || !name) return;
  if (renameTarget.type === "task") {
    const task = tasks.find((item) => item.id === renameTarget.id);
    if (!task) return;
    task.title = name;
    questStack = questStack.map((item) =>
      item.id === task.id ? task : item,
    );
  } else {
    const oldName = renameTarget.currentName;
    if (renameTarget.id) {
      const project = customProjects.find(
        (item) => item.id === renameTarget.id,
      );
      if (!project) return;
      project.name = name;
    } else if (renameTarget.originalName) {
      projectRenames[renameTarget.originalName] = name;
    }
    tasks = tasks.map((task) =>
      task.project === oldName ? { ...task, project: name } : task,
    );
    if (projectFilter === oldName) projectFilter = name;
  }
  save();
  closeRename();
  if (!elements.projectsView.classList.contains("hidden")) renderProjects();
  if (!elements.tasksView.classList.contains("hidden")) {
    elements.panelTitle.textContent =
      currentQuest()?.title || projectFilter || "Tareas";
    renderTasks();
  }
  if (!elements.boardView.classList.contains("hidden")) renderBoard();
  showToast("Nombre actualizado.");
}

function deleteTask(id) {
  const idsToDelete = new Set([id]);
  let foundMore = true;
  while (foundMore) {
    foundMore = false;
    for (const task of tasks) {
      if (task.parentId !== null && idsToDelete.has(task.parentId) && !idsToDelete.has(task.id)) {
        idsToDelete.add(task.id);
        foundMore = true;
      }
    }
  }
  tasks = tasks.filter((task) => !idsToDelete.has(task.id));
  questStack = questStack.filter((quest) => !idsToDelete.has(quest.id));
  save();
  if (!elements.tasksView.classList.contains("hidden")) renderTasks();
  if (!elements.boardView.classList.contains("hidden")) renderBoard();
  if (!elements.missionView.classList.contains("hidden")) renderMission();
  showToast("Misión eliminada.");
}

document.addEventListener("click", (event) => {
  const dailyPlanDelete = event.target.closest("[data-daily-plan-delete]");
  if (dailyPlanDelete) {
    const key = dailyPlanDelete.dataset.dailyPlanKey;
    if (!dailyPlan[key]) return;
    dailyPlan[key] = dailyPlan[key].filter(
      (item) => item.id !== dailyPlanDelete.dataset.dailyPlanDelete,
    );
    save();
    renderBoard();
    return;
  }

  const projectColorButton = event.target.closest("[data-project-color]");
  if (projectColorButton) {
    selectedProjectColor = projectColorButton.dataset.projectColor;
    elements.projectColorPicker
      .querySelectorAll("[data-project-color]")
      .forEach((button) =>
        button.classList.toggle(
          "active",
          button.dataset.projectColor === selectedProjectColor,
        ),
      );
    return;
  }

  const calendarNav = event.target.closest("[data-calendar-nav]");
  if (calendarNav) {
    const direction = calendarNav.dataset.calendarNav;
    calendarCursor =
      direction === "today"
        ? new Date()
        : new Date(
            calendarCursor.getFullYear(),
            calendarCursor.getMonth() + Number(direction),
            1,
          );
    renderCalendar();
    return;
  }

  const eventEdit = event.target.closest("[data-event-edit]");
  if (eventEdit) {
    beginEventEdit(Number(eventEdit.dataset.eventEdit));
    return;
  }

  const eventDelete = event.target.closest("[data-event-delete]");
  if (eventDelete) {
    if (editingEventId === Number(eventDelete.dataset.eventDelete)) {
      cancelEventEdit();
    }
    importantEvents = importantEvents.filter(
      (item) => item.id !== Number(eventDelete.dataset.eventDelete),
    );
    save();
    if (!elements.agendaView.classList.contains("hidden")) renderAgenda();
    if (!elements.boardView.classList.contains("hidden")) renderBoard();
    if (!elements.calendarView.classList.contains("hidden")) renderCalendar();
    return;
  }

  const writingDuplicateButton = event.target.closest("[data-writing-duplicate]");
  if (writingDuplicateButton) {
    const sourceId = Number(writingDuplicateButton.dataset.writingDuplicate);
    if (sourceId === activeWritingId) persistActiveWritingDraft();
    const source = writingProjects.find((project) => project.id === sourceId);
    if (!source) return;
    const now = new Date().toISOString();
    const duplicate = {
      ...source,
      id: Date.now(),
      title: nextWritingVersionTitle(source.title),
      createdAt: now,
      updatedAt: now,
    };
    writingProjects.unshift(duplicate);
    activeWritingId = duplicate.id;
    activeWritingPage = 0;
    writingEditorOpen = true;
    resetWritingHistory(activeWritingId);
    save();
    renderWriting();
    showToast(`${duplicate.title} creada con todo el contenido original.`);
    return;
  }

  const writingDeleteButton = event.target.closest("[data-writing-delete]");
  if (writingDeleteButton) {
    const projectId = Number(writingDeleteButton.dataset.writingDelete);
    openWritingDeleteConfirm(projectId);
    return;
  }

  const writingButton = event.target.closest("[data-writing-id]");
  if (writingButton) {
    const nextWritingId = Number(writingButton.dataset.writingId);
    if (nextWritingId === activeWritingId) {
      persistActiveWritingDraft();
      writingEditorOpen = true;
      renderWriting();
      return;
    }
    persistActiveWritingDraft();
    activeWritingId = nextWritingId;
    activeWritingPage = 0;
    writingEditorOpen = true;
    resetWritingHistory(activeWritingId);
    renderWriting();
    return;
  }

  const birthdayEdit = event.target.closest("[data-birthday-edit]");
  if (birthdayEdit) {
    beginBirthdayEdit(Number(birthdayEdit.dataset.birthdayEdit));
    return;
  }

  const birthdayDelete = event.target.closest("[data-birthday-delete]");
  if (birthdayDelete) {
    if (editingBirthdayId === Number(birthdayDelete.dataset.birthdayDelete)) {
      cancelBirthdayEdit();
    }
    birthdays = birthdays.filter(
      (birthday) =>
        birthday.id !== Number(birthdayDelete.dataset.birthdayDelete),
    );
    save();
    if (!elements.agendaView.classList.contains("hidden")) renderAgenda();
    if (!elements.boardView.classList.contains("hidden")) renderBoard();
    if (!elements.calendarView.classList.contains("hidden")) renderCalendar();
    return;
  }

  const petDelete = event.target.closest("[data-pet-delete]");
  if (petDelete) {
    const id = petDelete.dataset.petDelete;
    profile.pets = readPetsFromForm().filter((pet) => pet.id !== id);
    save();
    renderPets();
    renderWorldCompanions();
    return;
  }

  const financeDelete = event.target.closest("[data-finance-delete]");
  if (financeDelete) {
    financeEntries = financeEntries.filter(
      (entry) => entry.id !== Number(financeDelete.dataset.financeDelete),
    );
    save();
    renderFinance();
    return;
  }

  const boardEventButton = event.target.closest("[data-board-event]");
  if (boardEventButton) {
    const boardEvent = importantEvents.find(
      (item) => item.id === Number(boardEventButton.dataset.boardEvent),
    );
    if (!boardEvent) return;
    openPanel("agenda");
    beginEventEdit(boardEvent.id);
    return;
  }

  const eventOpen = event.target.closest("[data-event-open]");
  if (eventOpen) {
    beginEventEdit(Number(eventOpen.dataset.eventOpen));
    return;
  }

  const openButton = event.target.closest("[data-open]");
  if (openButton) {
    const quickAccessId = openButton.dataset.quickAccess;
    const portalId = openButton.dataset.worldModule ||
      (WORLD_MODULE_DEFINITIONS.some((definition) => definition.id === quickAccessId) ? quickAccessId : null);
    if (portalId) {
      const portalModule = worldModuleState(portalId);
      if (portalModule) {
        portalModule.openCount = Math.max(0, Number(portalModule.openCount) || 0) + 1;
        saveWorldLayout();
      }
    }
    if (openButton.dataset.quickAccess === "task") openNewTask();
    else openPanel(openButton.dataset.open);
    return;
  }

  const newButton = event.target.closest("[data-new-task]");
  if (newButton) {
    openNewTask();
    return;
  }

  const focusStepToggle = event.target.closest("[data-focus-step-toggle]");
  if (focusStepToggle) {
    toggleMissionFocusStep(Number(focusStepToggle.dataset.focusStepToggle));
    return;
  }

  const focusResult = event.target.closest("[data-focus-result]");
  if (focusResult) {
    const task = recommendedTask();
    missionFocusReviewOpen = false;
    if (focusResult.dataset.focusResult === "complete" && task) {
      updateTaskStatus(task.id, "done");
      closePanel();
    } else {
      closePanel();
      showToast("La misión queda pendiente para continuar más adelante.");
    }
    return;
  }

  const actionButton = event.target.closest("[data-task-action]");
  if (actionButton) {
    const id = Number(actionButton.dataset.taskId);
    const action = actionButton.dataset.taskAction;
    if (action === "delete") deleteTask(id);
    else if (action === "today") toggleTodayTask(id);
    else if (action === "edit") openTaskEditor(id);
    else if (action === "rename") {
      openInlineTaskRename(id);
    }
    else if (action === "quest") {
      enterTaskQuest(id);
    } else updateTaskStatus(id, action);
    return;
  }

  const taskCard = event.target.closest("[data-task-card]");
  if (taskCard) {
    if (Date.now() < suppressTaskCardOpenUntil) return;
    if (isTaskCardInteractiveTarget(event.target)) return;
    const id = Number(taskCard.dataset.taskCard);
    if (editingTaskId === id) return;
    const task = tasks.find((item) => item.id === id);
    openTaskEditor(id);
    return;
  }

  const petEdit = event.target.closest("[data-pet-edit]");
  if (petEdit) {
    const currentPets = readPetsFromForm();
    const pet = currentPets.find((item) => item.id === petEdit.dataset.petEdit);
    if (pet) openPetWizard(pet);
    return;
  }

  const projectRenameButton = event.target.closest("[data-project-rename]");
  if (projectRenameButton) {
    openRename({
      type: "project",
      id: Number(projectRenameButton.dataset.projectId) || null,
      originalName: projectRenameButton.dataset.projectOriginal || null,
      currentName: projectRenameButton.dataset.projectRename,
    });
    return;
  }

  const projectButton = event.target.closest("[data-project]");
  if (projectButton) {
    projectFilter = projectButton.dataset.project;
    questStack = [];
    activeTaskTab = "todo";
    openPanel("tasks");
    return;
  }

  const statusButton = event.target.closest("[data-status]");
  if (statusButton) {
    activeTaskTab = statusButton.dataset.status;
    renderTasks();
    return;
  }

  const projectTabButton = event.target.closest("[data-project-tab]");
  if (projectTabButton) {
    activeProjectTab = projectTabButton.dataset.projectTab;
    renderProjects();
    return;
  }

  const breadcrumbButton = event.target.closest("[data-breadcrumb-index]");
  if (breadcrumbButton) {
    const index = Number(breadcrumbButton.dataset.breadcrumbIndex);
    questStack = index < 0 ? [] : questStack.slice(0, index + 1);
    elements.panelTitle.textContent =
      currentQuest()?.title || projectFilter || "Tareas";
    activeTaskTab = "todo";
    renderTasks();
  }
});

document.querySelector("#close-panel").addEventListener("click", closePanel);
document.querySelector("#close-board").addEventListener("click", closePanel);
elements.closeCreativity.addEventListener("click", closePanel);
document.querySelector("#close-modal").addEventListener("click", closeNewTask);
document.querySelector("#close-rename").addEventListener("click", closeRename);
document.querySelector("#cancel-rename").addEventListener("click", closeRename);
elements.deleteProjectFromRename.addEventListener("click", openProjectDeleteConfirm);
elements.cancelProjectDelete.addEventListener("click", closeProjectDeleteConfirm);
elements.confirmProjectDelete.addEventListener("click", confirmProjectDelete);
document.querySelectorAll("[data-focus-minutes]").forEach((button) => {
  button.addEventListener("click", () => {
    chooseFocusDuration(Number(button.dataset.focusMinutes));
  });
});
elements.focusStart.addEventListener("click", toggleFocusTimer);
elements.focusReset.addEventListener("click", resetFocusTimer);

document.querySelectorAll("[data-hub-tab], [data-hub-open]").forEach((button) => {
  button.addEventListener("click", () => {
    setHubTab(button.dataset.hubTab || button.dataset.hubOpen);
  });
});

elements.hubAlarmForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const time = elements.hubAlarmTime.value;
  if (!time) return;
  hubAlarms.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label: elements.hubAlarmLabel.value.trim() || "Alarma personal",
    time,
    enabled: true,
    lastTriggeredDate: "",
  });
  elements.hubAlarmForm.reset();
  save();
  renderHub();
  showToast("Alarma guardada en el HUB.");
});

elements.hubAlarmList.addEventListener("click", (event) => {
  const toggle = event.target.closest("[data-alarm-toggle]");
  const remove = event.target.closest("[data-alarm-delete]");
  if (toggle) {
    const alarm = hubAlarms.find((item) => item.id === toggle.dataset.alarmToggle);
    if (!alarm) return;
    alarm.enabled = !alarm.enabled;
    save();
    renderHub();
  } else if (remove) {
    hubAlarms = hubAlarms.filter((item) => item.id !== remove.dataset.alarmDelete);
    save();
    renderHub();
  }
});

document.querySelectorAll("[data-hub-minutes]").forEach((button) => {
  button.addEventListener("click", () => chooseHubTimer(Number(button.dataset.hubMinutes)));
});
document.querySelectorAll("[data-hub-time-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    hubTimeMode = button.dataset.hubTimeMode === "stopwatch" ? "stopwatch" : "timer";
    renderHub();
  });
});
elements.hubUseCustom.addEventListener("click", () => {
  const minutes = Number(elements.hubCustomMinutes.value.replace(",", "."));
  if (!Number.isFinite(minutes) || minutes <= 0 || minutes > 720) {
    showToast("Elegí entre 1 y 720 minutos.");
    return;
  }
  chooseHubTimer(minutes);
});
elements.hubTimerStart.addEventListener("click", () => {
  if (hubTimerSeconds === 0) hubTimerSeconds = hubTimerDuration;
  hubTimerRunning = !hubTimerRunning;
  renderHub();
});
elements.hubTimerReset.addEventListener("click", () => {
  hubTimerRunning = false;
  hubTimerSeconds = hubTimerDuration;
  renderHub();
});
elements.hubStopwatchStart.addEventListener("click", () => {
  if (hubStopwatchRunning) {
    hubStopwatchMilliseconds = Math.max(0, Date.now() - hubStopwatchStartedAt);
    hubStopwatchRunning = false;
  } else {
    hubStopwatchStartedAt = Date.now() - hubStopwatchMilliseconds;
    hubStopwatchRunning = true;
  }
  renderHub();
});
elements.hubStopwatchLap.addEventListener("click", () => {
  if (hubStopwatchMilliseconds <= 0) return;
  hubStopwatchLaps.push(hubStopwatchMilliseconds);
  renderHub();
});
elements.hubStopwatchReset.addEventListener("click", () => {
  hubStopwatchRunning = false;
  hubStopwatchMilliseconds = 0;
  hubStopwatchLaps = [];
  renderHub();
});

document.querySelectorAll("[data-calculator-key]").forEach((button) => {
  button.addEventListener("click", () => {
    elements.calculatorExpression.value += button.dataset.calculatorKey;
  });
});
elements.calculatorForm.addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    const result = calculateExpression(elements.calculatorExpression.value);
    elements.calculatorResult.textContent = result;
    elements.calculatorExpression.value = result;
  } catch (error) {
    elements.calculatorResult.textContent = error instanceof Error
      ? error.message
      : "No pude calcularlo";
  }
});
elements.calculatorClear.addEventListener("click", () => {
  elements.calculatorExpression.value = "";
  elements.calculatorResult.textContent = "0";
});
elements.calculatorBackspace.addEventListener("click", () => {
  elements.calculatorExpression.value = elements.calculatorExpression.value.slice(0, -1);
  elements.calculatorExpression.focus();
});

elements.boardWeekView.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-daily-plan-form]");
  if (!form) return;
  event.preventDefault();
  const key = form.dataset.dailyPlanForm;
  const input = form.querySelector('[name="daily-plan-item"]');
  const text = input?.value.trim().slice(0, 140) || "";
  if (!text || !dailyPlan[key]) return;
  dailyPlan[key].push({
    id: `plan-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text,
  });
  input.value = "";
  save();
  renderBoard();
  window.setTimeout(() => {
    elements.weekDaysGrid
      ?.querySelector(`[data-daily-plan-form="${key}"] input`)
      ?.focus();
  }, 0);
});

elements.quickListCreateForm.addEventListener("submit", (event) => {
  event.preventDefault();
  createQuickList(elements.quickListTitle.value, quickListCreateType);
  elements.quickListCreateForm.reset();
});

elements.quickListTypePicker?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-quick-list-type]");
  if (!button) return;
  const nextType = button.dataset.quickListType;
  if (!Object.hasOwn(QUICK_LIST_TYPE_META, nextType)) return;
  quickListCreateType = nextType;
  activeQuickListId = quickLists.find((list) => list.type === nextType)?.id ?? null;
  quickListDeleteArmedId = null;
  elements.quickListTypePicker.querySelectorAll("[data-quick-list-type]").forEach((entry) => {
    entry.classList.toggle("active", entry.dataset.quickListType === nextType);
  });
  elements.quickListTitle.placeholder = nextType === "ranking"
    ? "Ej: Mejores películas"
    : nextType === "notes"
      ? "Ej: Ideas sueltas"
      : "Ej: Lista del super";
  renderQuickLists();
});

elements.drawingCanvas?.addEventListener("pointerdown", beginDrawing);
elements.drawingCanvas?.addEventListener("pointermove", continueDrawing);
elements.drawingCanvas?.addEventListener("pointerup", endDrawing);
elements.drawingCanvas?.addEventListener("pointercancel", endDrawing);
elements.drawingNew?.addEventListener("click", newDrawingIdea);
elements.drawingSave?.addEventListener("click", saveDrawingIdea);
elements.drawingThumbnails?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-drawing-id]");
  if (!button) return;
  const idea = drawingIdeas.find((entry) => entry.id === button.dataset.drawingId);
  if (!idea) return;
  activeDrawingId = idea.id;
  elements.drawingTitle.value = idea.title;
  loadDrawingCanvas(idea.image);
  renderDrawings();
});
document.querySelectorAll("[data-drawing-tool]").forEach((button) => button.addEventListener("click", () => {
  drawingTool = button.dataset.drawingTool;
  document.querySelectorAll("[data-drawing-tool]").forEach((entry) => entry.classList.toggle("active", entry === button));
}));
elements.drawingColors?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-drawing-color]");
  if (!button) return;
  drawingColor = button.dataset.drawingColor;
  drawingTool = "brush";
  elements.drawingColor.value = drawingColor;
  elements.drawingColors.querySelectorAll("[data-drawing-color]").forEach((entry) => entry.classList.toggle("active", entry === button));
  document.querySelectorAll("[data-drawing-tool]").forEach((entry) => entry.classList.toggle("active", entry.dataset.drawingTool === "brush"));
});
elements.drawingColor?.addEventListener("input", () => { drawingColor = elements.drawingColor.value; drawingTool = "brush"; });
elements.drawingSize?.addEventListener("input", () => { drawingSize = Number(elements.drawingSize.value); });
elements.drawingUndo?.addEventListener("click", () => { if (drawingHistoryIndex > 0) restoreDrawing(drawingHistory[--drawingHistoryIndex]); });
elements.drawingRedo?.addEventListener("click", () => { if (drawingHistoryIndex < drawingHistory.length - 1) restoreDrawing(drawingHistory[++drawingHistoryIndex]); });
elements.drawingClear?.addEventListener("click", () => { loadDrawingCanvas(null); commitDrawingHistory(); });
elements.drawingExport?.addEventListener("click", () => {
  const link = document.createElement("a");
  link.href = drawingSnapshot("image/png");
  link.download = `${(elements.drawingTitle.value.trim() || "dibujo-nok").replace(/[^a-z0-9]+/gi, "-")}.png`;
  link.click();
});
elements.drawingDelete?.addEventListener("click", () => {
  if (!activeDrawingId) return;
  drawingIdeas = drawingIdeas.filter((idea) => idea.id !== activeDrawingId);
  newDrawingIdea();
  save();
  showToast("Dibujo eliminado.");
});

elements.undergroundForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = elements.undergroundTitle.value.trim().slice(0, 100);
  const details = elements.undergroundDetails.value.trim().slice(0, 1200);
  const category = Object.hasOwn(UNDERGROUND_CATEGORY_LABELS, elements.undergroundCategory.value)
    ? elements.undergroundCategory.value
    : "note";
  if (!title) {
    showToast("PonÃ© un nombre para guardar este registro.");
    elements.undergroundTitle.focus();
    return;
  }
  const now = new Date().toISOString();
  if (editingUndergroundId) {
    undergroundItems = undergroundItems.map((item) => item.id === editingUndergroundId
      ? { ...item, title, details, category, updatedAt: now }
      : item);
    showToast("Registro actualizado en la caverna.");
  } else {
    undergroundItems.unshift({
      id: `underground-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      details,
      category,
      createdAt: now,
      updatedAt: now,
    });
    showToast("Guardado en la caverna de respaldo.");
  }
  resetUndergroundForm();
  persistUndergroundItems();
});

elements.undergroundSearch?.addEventListener("input", renderUnderground);
elements.undergroundCancel?.addEventListener("click", resetUndergroundForm);
elements.undergroundList?.addEventListener("click", (event) => {
  const edit = event.target.closest("[data-underground-edit]");
  const remove = event.target.closest("[data-underground-delete]");
  if (edit) {
    const item = undergroundItems.find((entry) => entry.id === edit.dataset.undergroundEdit);
    if (item) editUndergroundItem(item);
    return;
  }
  if (!remove) return;
  undergroundItems = undergroundItems.filter((entry) => entry.id !== remove.dataset.undergroundDelete);
  if (editingUndergroundId === remove.dataset.undergroundDelete) resetUndergroundForm();
  persistUndergroundItems();
  showToast("Registro retirado de la caverna.");
});

elements.quickListTabs.addEventListener("click", (event) => {
  const select = event.target.closest("[data-quick-list-select]");
  if (!select) return;
  activeQuickListId = select.dataset.quickListSelect;
  quickListDeleteArmedId = null;
  renderQuickLists();
});

elements.quickListSheet.addEventListener("input", (event) => {
  const list = activeQuickList();
  if (!list) return;
  if (event.target.id === "active-quick-list-title") {
    list.title = event.target.value.slice(0, 80);
  } else if (event.target.id === "quick-list-notes-editor") {
    list.note = event.target.value.slice(0, 20000);
  } else {
    return;
  }
  list.updatedAt = new Date().toISOString();
  save();
});

elements.quickListSheet.addEventListener("focusout", (event) => {
  if (event.target.id !== "active-quick-list-title") return;
  const list = activeQuickList();
  if (!list) return;
  list.title = list.title.trim() || "Lista sin nombre";
  touchQuickList(list);
});

elements.quickListSheet.addEventListener("submit", (event) => {
  if (event.target.id !== "quick-list-item-form") return;
  event.preventDefault();
  const list = activeQuickList();
  const input = event.target.querySelector("#quick-list-item-text");
  const text = input?.value.trim().slice(0, 160) || "";
  if (!list || !text) return;
  list.items.push({
    id: quickListId("item"),
    text,
    checked: false,
    createdAt: new Date().toISOString(),
  });
  touchQuickList(list);
  elements.quickListSheet.querySelector("#quick-list-item-text")?.focus();
});

elements.quickListSheet.addEventListener("click", (event) => {
  const list = activeQuickList();
  if (!list) return;
  const toggle = event.target.closest("[data-quick-list-toggle]");
  const removeItem = event.target.closest("[data-quick-list-item-delete]");
  const action = event.target.closest("[data-quick-list-action]");
  const rankingStep = event.target.closest("[data-ranking-step]");
  const editItem = event.target.closest("[data-quick-list-edit]");
  const editRow = event.target.closest("[data-quick-list-edit-row]");
  if (editItem || (editRow && !event.target.closest("button,input"))) {
    editingQuickListItemId = editItem?.dataset.quickListEdit || editRow?.dataset.quickListEditRow;
    renderQuickLists();
    requestAnimationFrame(() => {
      const input = elements.quickListSheet.querySelector(`[data-quick-list-inline-edit="${CSS.escape(editingQuickListItemId)}"]`);
      input?.focus();
      input?.select();
    });
    return;
  }
  if (rankingStep && list.type === "ranking") {
    const index = list.items.findIndex((entry) => entry.id === rankingStep.dataset.rankingItem);
    if (index < 0) return;
    const nextIndex = rankingStep.dataset.rankingStep === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= list.items.length) return;
    const [item] = list.items.splice(index, 1);
    list.items.splice(nextIndex, 0, item);
    touchQuickList(list);
    return;
  }
  if (toggle) {
    if (list.type !== "checklist") return;
    const item = list.items.find((entry) => entry.id === toggle.dataset.quickListToggle);
    if (!item) return;
    item.checked = !item.checked;
    touchQuickList(list);
    return;
  }
  if (removeItem) {
    list.items = list.items.filter((entry) => entry.id !== removeItem.dataset.quickListItemDelete);
    touchQuickList(list);
    return;
  }
  if (!action) return;
  if (action.dataset.quickListAction === "reset") {
    list.items = list.items.map((item) => ({ ...item, checked: false }));
    touchQuickList(list);
    showToast(`Lista “${list.title}” lista para volver a usar.`);
  } else if (action.dataset.quickListAction === "duplicate") {
    duplicateQuickList(list);
  } else if (action.dataset.quickListAction === "delete") {
    if (quickListDeleteArmedId !== list.id) {
      quickListDeleteArmedId = list.id;
      renderQuickLists();
      showToast("Volvé a tocar ELIMINAR para confirmar.");
      return;
    }
    quickLists = quickLists.filter((entry) => entry.id !== list.id);
    activeQuickListId = quickLists.find((entry) => entry.type === quickListCreateType)?.id ?? null;
    quickListDeleteArmedId = null;
    save();
    renderQuickLists();
    showToast(`Lista “${list.title}” eliminada.`);
  }
});

function commitQuickListInlineEdit(input, cancel = false) {
  const list = activeQuickList();
  const itemId = input?.dataset.quickListInlineEdit;
  const item = list?.items.find((entry) => entry.id === itemId);
  if (item && !cancel) {
    const text = String(input.value || "").trim().slice(0, 160);
    if (text) item.text = text;
    editingQuickListItemId = null;
    touchQuickList(list);
    return;
  }
  editingQuickListItemId = null;
  renderQuickLists();
}

elements.quickListSheet.addEventListener("keydown", (event) => {
  const input = event.target.closest("[data-quick-list-inline-edit]");
  if (!input) return;
  if (event.key === "Enter") {
    event.preventDefault();
    commitQuickListInlineEdit(input);
  } else if (event.key === "Escape") {
    event.preventDefault();
    commitQuickListInlineEdit(input, true);
  }
});

elements.quickListSheet.addEventListener("focusout", (event) => {
  const input = event.target.closest("[data-quick-list-inline-edit]");
  if (input) commitQuickListInlineEdit(input);
});

elements.quickListSheet.addEventListener("dragstart", (event) => {
  const row = event.target.closest("[data-ranking-item-id]");
  if (!row) return;
  draggedRankingItemId = row.dataset.rankingItemId;
  event.dataTransfer.effectAllowed = "move";
});

elements.quickListSheet.addEventListener("dragover", (event) => {
  if (draggedRankingItemId && event.target.closest("[data-ranking-item-id]")) event.preventDefault();
});

elements.quickListSheet.addEventListener("drop", (event) => {
  const target = event.target.closest("[data-ranking-item-id]");
  const list = activeQuickList();
  if (!target || !list || list.type !== "ranking" || !draggedRankingItemId) return;
  event.preventDefault();
  const from = list.items.findIndex((item) => item.id === draggedRankingItemId);
  const to = list.items.findIndex((item) => item.id === target.dataset.rankingItemId);
  if (from >= 0 && to >= 0 && from !== to) {
    const [item] = list.items.splice(from, 1);
    list.items.splice(to, 0, item);
    touchQuickList(list);
  }
  draggedRankingItemId = null;
});

elements.quickListSheet.addEventListener("dragend", () => {
  draggedRankingItemId = null;
});

elements.quickListSheet.addEventListener("pointerdown", (event) => {
  const handle = event.target.closest("[data-ranking-drag-handle]");
  if (handle && event.pointerType !== "mouse") draggedRankingItemId = handle.dataset.rankingDragHandle;
});

elements.quickListSheet.addEventListener("pointerup", (event) => {
  if (!draggedRankingItemId || event.pointerType === "mouse") return;
  const target = document.elementFromPoint(event.clientX, event.clientY)?.closest?.("[data-ranking-item-id]");
  const list = activeQuickList();
  if (target && list?.type === "ranking") {
    const from = list.items.findIndex((item) => item.id === draggedRankingItemId);
    const to = list.items.findIndex((item) => item.id === target.dataset.rankingItemId);
    if (from >= 0 && to >= 0 && from !== to) {
      const [item] = list.items.splice(from, 1);
      list.items.splice(to, 0, item);
      touchQuickList(list);
    }
  }
  draggedRankingItemId = null;
});

elements.puzzleCheck.addEventListener("click", checkPuzzleAnswer);
elements.puzzleAnswer.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    checkPuzzleAnswer();
  }
});
elements.puzzleShowHint.addEventListener("click", () => {
  elements.puzzleHint.classList.remove("hidden");
});
elements.puzzleShowSolution.addEventListener("click", () => {
  puzzleRunning = false;
  elements.puzzleSolution.classList.remove("hidden");
  renderPuzzle();
});
elements.learningDifficulty.addEventListener("click", (event) => {
  const button = event.target.closest("[data-learning-difficulty]");
  if (!button || lockedLearningDifficulty) return;
  learningDifficulty = button.dataset.learningDifficulty;
  lockedLearningDifficulty = learningDifficulty;
  localStorage.setItem(
    LEARNING_PROGRESS_KEY,
    JSON.stringify({
      date: todayKey(),
      difficulty: learningDifficulty,
      completed: learningProgress,
    }),
  );
  markCloudChange();
  renderLearningHub();
});
elements.learningBlockGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-learning-block]");
  if (!button || button.disabled) return;
  openLearningBlock(button.dataset.learningBlock);
});
elements.learningBack.addEventListener("click", closeLearningBlock);
elements.learningFactComplete.addEventListener("click", () => {
  completeLearningBlock("fact");
  elements.learningFactComplete.textContent = "✓ LEÍDO HOY";
});
elements.revealDailyCulture.addEventListener("click", () => {
  elements.dailyCultureAnswer.classList.remove("hidden");
  elements.revealDailyCulture.textContent = "✓ RESPUESTA VISTA";
  completeLearningBlock("culture");
});
function checkCultureAnswer() {
  const answer = normalizePuzzleAnswer(elements.cultureAnswerInput.value);
  const expected = normalizePuzzleAnswer(dailyCultureForDifficulty().answer);
  elements.cultureFeedback.classList.remove("hidden", "success");
  if (!answer) {
    elements.cultureFeedback.textContent = "Escribí una respuesta antes de comprobar.";
    return;
  }
  const correct =
    expected === answer ||
    (answer.length >= 3 && expected.includes(answer)) ||
    (expected.length >= 3 && answer.includes(expected));
  if (!correct) {
    elements.cultureFeedback.textContent = "Todavía no. Probá otra respuesta o pedí ver la solución.";
    return;
  }
  elements.cultureFeedback.textContent = "¡Correcto! Completaste la pregunta de hoy.";
  elements.cultureFeedback.classList.add("success");
  elements.dailyCultureAnswer.classList.remove("hidden");
  elements.revealDailyCulture.textContent = "✓ RESPUESTA VISTA";
  completeLearningBlock("culture");
}
elements.cultureCheck.addEventListener("click", checkCultureAnswer);
elements.cultureAnswerInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    checkCultureAnswer();
  }
});
function checkMemoryAnswer() {
  const challenge = dailyMemoryForDifficulty();
  const answer = normalizePuzzleAnswer(elements.memoryAnswer.value);
  const correct = challenge.answers.some((candidate) => normalizePuzzleAnswer(candidate) === answer);
  elements.memoryFeedback.classList.remove("hidden", "success");
  if (!answer) {
    elements.memoryFeedback.textContent = "Escribí primero la secuencia que recordás.";
  } else if (correct) {
    elements.memoryFeedback.textContent = "¡Memoria perfecta! Completaste el desafío de hoy.";
    elements.memoryFeedback.classList.add("success");
    completeLearningBlock("memory");
  } else {
    elements.memoryFeedback.textContent = "Todavía no coincide. Respirá y probá una vez más.";
  }
}
elements.memoryCheck.addEventListener("click", checkMemoryAnswer);
elements.memoryAnswer.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    checkMemoryAnswer();
  }
});
elements.closeHubAlert.addEventListener("click", () => {
  elements.hubAlert.classList.add("hidden");
});
elements.filterChip.addEventListener("click", () => {
  projectFilter = "";
  questStack = [];
  elements.panelTitle.textContent = "Tareas";
  renderTasks();
});
elements.backProjects.addEventListener("click", () => {
  questStack = [];
  activeProjectTab = isPersonalProject(projectFilter)
    ? "personal"
    : "laboral";
  openPanel("projects");
});
elements.panelBackdrop.addEventListener("mousedown", (event) => {
  if (event.target === elements.panelBackdrop) closePanel();
});
elements.modal.addEventListener("mousedown", (event) => {
  if (event.target === elements.modal) closeNewTask();
});
elements.renameModal.addEventListener("mousedown", (event) => {
  if (event.target === elements.renameModal) closeRename();
});
elements.projectDeleteConfirm.addEventListener("mousedown", (event) => {
  if (event.target === elements.projectDeleteConfirm) {
    closeProjectDeleteConfirm();
  }
});
elements.renameForm.addEventListener("submit", (event) => {
  event.preventDefault();
  submitRename();
});
elements.taskArea.addEventListener("change", () => updateTaskProjectOptions());
elements.taskProject.addEventListener("change", () => {
  const selected = elements.taskProject.value;
  if (!selected) return;
  elements.taskArea.value = isPersonalProject(selected)
    ? "personal"
    : "laboral";
  updateTaskProjectOptions(selected);
});
elements.toggleProjectForm.addEventListener("click", () => {
  const opening = elements.newProjectForm.classList.contains("hidden");
  elements.newProjectForm.classList.toggle("hidden", !opening);
  elements.toggleProjectForm.textContent = opening
    ? "× CERRAR"
    : "+ NUEVO PROYECTO";
  if (opening) {
    elements.newProjectAreaLabel.textContent =
      activeProjectTab === "laboral"
        ? "Nuevo proyecto laboral"
        : "Nuevo proyecto personal";
    window.setTimeout(() => elements.newProjectName.focus(), 50);
  }
});
elements.newProjectCode.addEventListener("input", () => {
  elements.newProjectCode.value = elements.newProjectCode.value.toUpperCase();
});
elements.newProjectForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = elements.newProjectName.value.trim();
  if (!name) return;
  const duplicate = allProjectList().some(
    ([projectName]) =>
      projectName.toLocaleLowerCase("es") === name.toLocaleLowerCase("es"),
  );
  if (duplicate) {
    showToast("Ya existe un proyecto con ese nombre.");
    return;
  }
  customProjects.push({
    id: Date.now(),
    name,
    code: projectCode(name, elements.newProjectCode.value),
    description:
      elements.newProjectDescription.value.trim() ||
      "Proyecto personal creado en el mapa.",
    accent: selectedProjectColor,
    area: activeProjectTab,
    createdAt: new Date().toISOString(),
  });
  elements.newProjectForm.reset();
  selectedProjectColor = "#6ca6c1";
  elements.projectColorPicker
    .querySelectorAll("[data-project-color]")
    .forEach((button) =>
      button.classList.toggle(
        "active",
        button.dataset.projectColor === selectedProjectColor,
      ),
    );
  elements.newProjectForm.classList.add("hidden");
  elements.toggleProjectForm.textContent = "+ NUEVO PROYECTO";
  save();
  renderProjects();
  showToast(`${name} se sumó al mapa.`);
});

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = elements.taskTitle.value.trim();
  if (!title) return;
  const priority = elements.taskPriorityHigh?.checked ? "high" : "low";
  if (editingTaskFormId !== null) {
    const task = tasks.find((item) => item.id === editingTaskFormId);
    if (!task) return;
    task.title = title;
    task.details = elements.taskDetails.value.trim();
    task.area = elements.taskArea.value || MISSION_BACKPACK_AREA;
    task.project = elements.taskProject.value || MISSION_BACKPACK_PROJECT;
    task.priority = priority;
    task.parentId = newTaskParentId;
    task.isQuest = document.querySelector("#task-is-quest").checked;
    const keepToday = document.querySelector("#task-is-today").checked;
    task.isToday = keepToday;
    if (keepToday) {
      task.scheduledDate = todayKey();
    } else if (task.scheduledDate === todayKey()) {
      task.scheduledDate = "";
    }
    task.xpReward = priority === "high" ? 40 : 20;
    save();
    closeNewTask();
    if (!elements.boardView.classList.contains("hidden")) renderBoard();
    if (!elements.tasksView.classList.contains("hidden")) renderTasks();
    if (!elements.missionView.classList.contains("hidden")) renderMission();
    showToast("Misión actualizada y guardada en su lugar.");
    return;
  }
  const task = {
    id: Date.now(),
    title,
    details: elements.taskDetails.value.trim(),
    area: elements.taskArea.value || MISSION_BACKPACK_AREA,
    project: elements.taskProject.value || MISSION_BACKPACK_PROJECT,
    priority,
    status: "todo",
    parentId: newTaskParentId,
    isQuest: document.querySelector("#task-is-quest").checked,
    isToday: document.querySelector("#task-is-today").checked,
    scheduledDate: document.querySelector("#task-is-today").checked
      ? todayKey()
      : "",
    xpReward: priority === "high" ? 40 : 20,
    sortOrder: -Date.now(),
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
  tasks.unshift(task);
  recordTaskCreated();
  save();
  closeNewTask();
  activeTaskTab = "todo";
  openPanel(task.project || task.parentId ? "tasks" : "board");
  showToast("Misión anotada. Tu cabeza ya puede soltarla.");
});

elements.missionContent.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-focus-step-form]");
  if (!form) return;
  event.preventDefault();
  const input = form.querySelector("[data-focus-step-input]");
  addMissionFocusStep(input?.value);
});

elements.taskFormDelete.addEventListener("click", () => {
  if (editingTaskFormId === null) return;
  const id = editingTaskFormId;
  closeNewTask();
  deleteTask(id);
});

elements.boardQuickForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = elements.boardQuickTitle.value.trim();
  if (!title) return;
  tasks.unshift({
    id: Date.now(),
    title,
    details: "",
    area: MISSION_BACKPACK_AREA,
    project: MISSION_BACKPACK_PROJECT,
    priority: "low",
    status: "todo",
    parentId: null,
    isQuest: false,
    isToday: true,
    scheduledDate: todayKey(),
    xpReward: 20,
    sortOrder: -Date.now(),
    createdAt: new Date().toISOString(),
    completedAt: null,
  });
  recordTaskCreated();
  elements.boardQuickTitle.value = "";
  save();
  renderBoard();
  showToast("Tarea rápida sumada al plan de hoy.");
});

elements.boardTodayMode.addEventListener("click", () => {
  boardMode = "today";
  renderBoard();
});

singleBoardColumn.addEventListener("change", () => {
  if (!elements.panelBackdrop.classList.contains("hidden") && !elements.boardView.classList.contains("hidden")) renderBoard();
});

elements.boardWeekMode.addEventListener("click", () => {
  boardMode = "week";
  renderBoard();
});

elements.boardView.addEventListener("click", (event) => {
  const sectionButton = event.target.closest("[data-board-mobile-section]");
  if (sectionButton) {
    boardMobileSection = sectionButton.dataset.boardMobileSection || "today";
    boardMotivationExpanded = false;
    renderBoard();
    return;
  }
  if (event.target.closest("#motivation-note")) {
    boardMotivationExpanded = !boardMotivationExpanded;
    renderBoard();
  }
});

elements.boardTodayView.addEventListener("dragstart", (event) => {
  const card = event.target.closest("[data-board-task]");
  if (!card) return;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/task-id", card.dataset.boardTask);
  card.classList.add("dragging");
});

elements.boardTodayView.addEventListener("dragend", (event) => {
  event.target.closest("[data-board-task]")?.classList.remove("dragging");
  elements.boardTodayDropZone.classList.remove("is-drag-over");
  elements.boardBacklogDropZone.classList.remove("is-drag-over");
});

function setupBoardDropZone(zone, nextIsToday) {
  zone.addEventListener("dragenter", (event) => {
    if (!event.dataTransfer.types.includes("text/task-id")) return;
    event.preventDefault();
    zone.classList.add("is-drag-over");
  });
  zone.addEventListener("dragover", (event) => {
    if (!event.dataTransfer.types.includes("text/task-id")) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  });
  zone.addEventListener("dragleave", (event) => {
    if (!zone.contains(event.relatedTarget)) {
      zone.classList.remove("is-drag-over");
    }
  });
  zone.addEventListener("drop", (event) => {
    event.preventDefault();
    zone.classList.remove("is-drag-over");
    const taskId = Number(event.dataTransfer.getData("text/task-id"));
    if (Number.isInteger(taskId)) setTaskTodayState(taskId, nextIsToday);
  });
}

setupBoardDropZone(elements.boardTodayDropZone, true);
setupBoardDropZone(elements.boardBacklogDropZone, false);

elements.boardWeekView.addEventListener("dragstart", (event) => {
  const card = event.target.closest("[data-week-task]");
  if (!card) return;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/task-id", card.dataset.weekTask);
  card.classList.add("dragging");
});

elements.boardWeekView.addEventListener("dragend", (event) => {
  event.target.closest("[data-week-task]")?.classList.remove("dragging");
});

elements.boardWeekView.addEventListener("dragover", (event) => {
  if (event.target.closest("[data-week-date]")) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }
});

elements.boardWeekView.addEventListener("drop", (event) => {
  const target = event.target.closest("[data-week-date]");
  if (!target) return;
  event.preventDefault();
  const taskId = Number(event.dataTransfer.getData("text/task-id"));
  if (Number.isInteger(taskId)) {
    scheduleTaskDate(taskId, target.dataset.weekDate || "");
  }
});

elements.taskList.addEventListener("dragstart", (event) => {
  const card = event.target.closest("[data-project-task-drag]");
  if (!card || event.target.closest("button, input, textarea")) {
    event.preventDefault();
    return;
  }
  projectTaskDraggingId = Number(card.dataset.projectTaskDrag);
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/task-id", String(projectTaskDraggingId));
  card.classList.add("task-drag-source");
});

elements.taskList.addEventListener("dragover", (event) => {
  const card = event.target.closest("[data-project-task-drag]");
  if (!card || projectTaskDraggingId === null) return;
  const targetId = Number(card.dataset.projectTaskDrag);
  if (targetId === projectTaskDraggingId) return;
  const targetTask = tasks.find((task) => task.id === targetId);
  if (!targetTask) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  clearProjectTaskDropStyles();
  elements.taskList
    .querySelector(`[data-project-task-drag="${projectTaskDraggingId}"]`)
    ?.classList.add("task-drag-source");
  card.classList.add(
    `task-drop-${projectTaskDropPosition(event, targetTask, card)}`,
  );
});

elements.taskList.addEventListener("drop", (event) => {
  const card = event.target.closest("[data-project-task-drag]");
  if (!card || projectTaskDraggingId === null) return;
  event.preventDefault();
  event.stopPropagation();
  const targetId = Number(card.dataset.projectTaskDrag);
  const targetTask = tasks.find((task) => task.id === targetId);
  const draggedId = Number(
    event.dataTransfer.getData("text/task-id") || projectTaskDraggingId,
  );
  if (targetTask) {
    moveProjectTask(
      draggedId,
      targetId,
      projectTaskDropPosition(event, targetTask, card),
    );
  }
  projectTaskDraggingId = null;
  suppressTaskCardOpenUntil = Date.now() + 240;
  clearProjectTaskDropStyles();
});

elements.taskList.addEventListener("dragend", () => {
  projectTaskDraggingId = null;
  suppressTaskCardOpenUntil = Date.now() + 240;
  clearProjectTaskDropStyles();
});

elements.birthdayForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = elements.birthdayName.value.trim();
  const date = elements.birthdayDate.value;
  if (!name || !date) return;
  birthdays.push({
    id: Date.now(),
    name,
    date,
    notes: "",
    createdAt: new Date().toISOString(),
  });
  elements.birthdayForm.reset();
  save();
  renderBoard();
  checkBirthdayAlerts();
  showToast("Cumpleaños guardado para siempre en el Archivo.");
});

elements.eventForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = elements.eventTitle.value.trim();
  const date = elements.eventDate.value;
  if (!title || !date || Number.isNaN(new Date(date).getTime())) return;
  const notes = elements.eventNotes.value.trim();
  const checklist = normalizeEventChecklist(eventChecklistDraft);
  if (editingEventId === null) {
    importantEvents.push({
      id: Date.now(),
      title,
      date,
      notes,
      taskId: null,
      checklist,
      createdAt: new Date().toISOString(),
    });
  } else {
    importantEvents = importantEvents.map((item) =>
      item.id === editingEventId
        ? { ...item, title, date, notes, taskId: null, checklist }
        : item,
    );
  }
  const wasEditing = editingEventId !== null;
  cancelEventEdit();
  save();
  renderAgenda();
  checkEventAlerts();
  showToast(
    wasEditing
      ? "Evento actualizado."
      : "Evento agregado. El juego te lo va a recordar.",
  );
});

elements.agendaBirthdayForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = elements.agendaBirthdayName.value.trim();
  const date = elements.agendaBirthdayDate.value;
  if (!name || !date) return;
  const notes = elements.agendaBirthdayNotes.value.trim();
  if (editingBirthdayId === null) {
    birthdays.push({
      id: Date.now(),
      name,
      date,
      notes,
      createdAt: new Date().toISOString(),
    });
  } else {
    birthdays = birthdays.map((item) =>
      item.id === editingBirthdayId ? { ...item, name, date, notes } : item,
    );
  }
  const wasEditing = editingBirthdayId !== null;
  cancelBirthdayEdit();
  save();
  renderAgenda();
  checkBirthdayAlerts();
  showToast(
    wasEditing
      ? "Cumpleaños actualizado."
      : "Cumpleaños guardado para siempre en el Archivo.",
  );
});

elements.profileForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveProfileAutomatically();
});

elements.profileForm.addEventListener("input", (event) => {
  if (event.target === elements.profileName || event.target === elements.profileBirthDate) {
    renderProfilePreview();
  }
  scheduleProfileAutosave();
});
elements.profileForm.addEventListener("change", () => {
  renderProfilePreview();
  scheduleProfileAutosave();
});
elements.profileWorkEnabled.addEventListener("change", renderWorkProfile);
elements.profileMarried.addEventListener("change", () => {
  if (elements.profileMarried.checked) {
    profile.married = true;
    openPartnerWizard();
  }
  if (!elements.profileMarried.checked) {
    profile.married = false;
    profile.spouseName = "";
    profile.spouseBirthDate = "";
    profile.datingStartDate = "";
    profile.weddingDate = "";
    save();
    renderWorldCompanions();
  }
  renderProfilePreview();
  scheduleProfileAutosave();
});
elements.addPet.addEventListener("click", () => {
  profile.pets = readPetsFromForm();
  openPetWizard();
});
elements.changePartnerPortrait.addEventListener("click", openPartnerWizard);
elements.closePartnerWizard.addEventListener("click", () => elements.partnerWizard.classList.add("hidden"));
elements.confirmPartnerWizard.addEventListener("click", confirmPartnerWizard);
elements.partnerWizardName.addEventListener("input", () => {
  elements.partnerWizardCaption.textContent = `${elements.profileName.value.trim() || "VOS"} + ${elements.partnerWizardName.value.trim() || "TU PAREJA"}`;
});
elements.partnerOptionGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-partner-appearance]");
  if (button) setPartnerAppearance(button.dataset.partnerAppearance);
});
elements.closePetWizard.addEventListener("click", () => elements.petWizard.classList.add("hidden"));
elements.confirmPetWizard.addEventListener("click", confirmPetWizard);
elements.petSpeciesPicker.addEventListener("click", (event) => {
  const button = event.target.closest("[data-pet-species]");
  if (!button || !petWizardDraft) return;
  petWizardDraft.species = button.dataset.petSpecies;
  petWizardDraft.appearance = defaultPetAppearance(petWizardDraft.species);
  renderPetWizardOptions();
});
elements.petOptionGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-pet-appearance]");
  if (!button || !petWizardDraft) return;
  petWizardDraft.appearance = button.dataset.petAppearance;
  renderPetWizardOptions();
});
elements.passportPageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setProfilePassportPage(button.dataset.passportPage);
  });
});
elements.passportPagePrevious.addEventListener("click", () => {
  const index = PROFILE_PASSPORT_PAGES.indexOf(activeProfilePassportPage);
  setProfilePassportPage(PROFILE_PASSPORT_PAGES[Math.max(0, index - 1)]);
});
elements.passportPageNext.addEventListener("click", () => {
  const index = PROFILE_PASSPORT_PAGES.indexOf(activeProfilePassportPage);
  setProfilePassportPage(
    PROFILE_PASSPORT_PAGES[Math.min(PROFILE_PASSPORT_PAGES.length - 1, index + 1)],
  );
});
elements.openEventForm.addEventListener("click", () => {
  cancelBirthdayEdit();
  cancelEventEdit();
  elements.eventForm.classList.remove("hidden");
  window.setTimeout(() => elements.eventTitle.focus(), 30);
});
elements.openBirthdayForm.addEventListener("click", () => {
  cancelEventEdit();
  cancelBirthdayEdit();
  elements.agendaBirthdayForm.classList.remove("hidden");
  window.setTimeout(() => elements.agendaBirthdayName.focus(), 30);
});
elements.cancelEventEdit.addEventListener("click", cancelEventEdit);
elements.cancelBirthdayEdit.addEventListener("click", cancelBirthdayEdit);
elements.eventChecklistAdd.addEventListener("click", addEventChecklistDraftItem);
elements.eventChecklistInput.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  addEventChecklistDraftItem();
});
elements.eventChecklistItems.addEventListener("change", (event) => {
  const checkbox = event.target.closest("[data-event-check-toggle]");
  if (!checkbox) return;
  const id = Number(checkbox.dataset.eventCheckToggle);
  eventChecklistDraft = eventChecklistDraft.map((item) =>
    item.id === id ? { ...item, done: checkbox.checked } : item,
  );
  renderEventChecklistDraft();
});
elements.eventChecklistItems.addEventListener("click", (event) => {
  const button = event.target.closest("[data-event-check-delete]");
  if (!button) return;
  eventChecklistDraft = eventChecklistDraft.filter(
    (item) => item.id !== Number(button.dataset.eventCheckDelete),
  );
  renderEventChecklistDraft();
});

elements.quickTaskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const parent = currentQuest();
  const targetProject = parent?.project || projectFilter;
  const title = elements.quickTaskTitle.value.trim();
  if (!targetProject || !title) return;
  tasks.unshift({
    id: Date.now(),
    title,
    details: "",
    area:
      parent?.area ??
      (isPersonalProject(targetProject) ? "personal" : "laboral"),
    project: targetProject,
    priority: "low",
    status: "todo",
    parentId: parent?.id ?? null,
    isQuest: false,
    isToday: false,
    scheduledDate: "",
    xpReward: 20,
    sortOrder: -Date.now(),
    createdAt: new Date().toISOString(),
    completedAt: null,
  });
  recordTaskCreated();
  elements.quickTaskTitle.value = "";
  activeTaskTab = "todo";
  save();
  renderTasks();
  showToast(
    parent
      ? "Tarea rápida agregada dentro de la Quest."
      : "Tarea rápida agregada al proyecto.",
  );
});

elements.newWritingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = elements.newWritingTitle.value.trim();
  if (!title) return;
  const now = new Date().toISOString();
  const project = {
    id: Date.now(),
    title,
    summary: "",
    content: "",
    createdAt: now,
    updatedAt: now,
  };
  writingProjects.unshift(project);
  activeWritingId = project.id;
  activeWritingPage = 0;
  writingEditorOpen = true;
  resetWritingHistory(activeWritingId);
  elements.newWritingForm.reset();
  save();
  renderWriting();
  showToast("Nuevo libro abierto en Creatividad.");
});

elements.writingBackLibrary.addEventListener("click", () => {
  persistActiveWritingDraft();
  writingEditorOpen = false;
  renderWriting();
});

elements.writingTitle.addEventListener("input", scheduleWritingAutosave);
elements.writingContent.addEventListener("input", updateActiveWritingPage);
elements.writingContent.addEventListener("keydown", (event) => {
  const project = activeWritingProject();
  if (!project) return;
  const pages = splitWritingPages(project.content);
  const currentPage = Math.max(0, Math.min(activeWritingPage, pages.length - 1));
  const start = elements.writingContent.selectionStart || 0;
  const end = elements.writingContent.selectionEnd || start;
  const modifier = event.ctrlKey || event.metaKey;
  const key = event.key.toLowerCase();
  if (modifier && !event.altKey && key === "z") {
    event.preventDefault();
    restoreWritingHistory(event.shiftKey ? "redo" : "undo");
    return;
  }
  if (modifier && !event.altKey && key === "y") {
    event.preventDefault();
    restoreWritingHistory("redo");
    return;
  }
  if (
    event.key === "Enter" &&
    !modifier &&
    !event.altKey &&
    !event.shiftKey &&
    isScreenplayCharacterLine(elements.writingContent.value, end)
  ) {
    event.preventDefault();
    const dialogueStart = `\n${SCREENPLAY_DIALOGUE_INDENT}`;
    const nextPageText = `${elements.writingContent.value.slice(0, end)}${dialogueStart}${elements.writingContent.value.slice(end)}`;
    const followingContent = pages.slice(currentPage + 1).join("");
    const nextCursor = end + dialogueStart.length;
    reflowWritingFromPage(
      currentPage,
      `${nextPageText}${followingContent}`,
      nextCursor,
      nextCursor,
      "format",
    );
    return;
  }
  if (
    event.key === "Delete" &&
    start === end &&
    end === elements.writingContent.value.length &&
    currentPage < pages.length - 1
  ) {
    event.preventDefault();
    const followingContent = pages.slice(currentPage + 1).join("");
    reflowWritingFromPage(
      currentPage,
      `${elements.writingContent.value}${followingContent.slice(1)}`,
      start,
      start,
      "delete",
    );
    return;
  }
  if (event.key === "Backspace" && start === 0 && end === 0 && currentPage > 0) {
    event.preventDefault();
    const previousPage = pages[currentPage - 1];
    reflowWritingFromPage(
      currentPage - 1,
      `${previousPage.slice(0, -1)}${elements.writingContent.value}${pages.slice(currentPage + 1).join("")}`,
      Math.max(0, previousPage.length - 1),
      Math.max(0, previousPage.length - 1),
      "delete",
    );
  }
});
elements.writingContent.addEventListener("contextmenu", openScriptContextMenu);
elements.scriptContextMenu.addEventListener("pointerdown", (event) => {
  event.stopPropagation();
});
elements.scriptContextMenu.addEventListener("click", (event) => {
  const button = event.target.closest("[data-screenplay-block]");
  if (button) insertScreenplayBlock(button.dataset.screenplayBlock);
});
document.addEventListener("pointerdown", closeScriptContextMenu);
elements.writingContent.addEventListener("focus", () => {
  normalizeWritingPagination();
});
elements.writingPrevPage.addEventListener("click", () => {
  persistActiveWritingDraft();
  activeWritingPage = Math.max(0, activeWritingPage - 1);
  renderWritingPage();
  elements.writingContent.focus();
});
elements.writingNextPage.addEventListener("click", () => {
  persistActiveWritingDraft();
  const pages = splitWritingPages(activeWritingProject()?.content || "");
  activeWritingPage = Math.min(pages.length - 1, activeWritingPage + 1);
  renderWritingPage();
  elements.writingContent.focus();
});
elements.copyWritingDocument.addEventListener("click", () => {
  void copyFullWritingDocument();
});

elements.financeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const amount = Number(elements.financeAmount.value);
  const name = elements.financeName.value.trim();
  if (!name || !Number.isFinite(amount) || amount < 0) return;
  financeEntries.unshift({
    id: Date.now(),
    type: elements.financeType.value,
    name,
    amount,
    notes: elements.financeNotes.value.trim(),
    createdAt: new Date().toISOString(),
  });
  elements.financeForm.reset();
  save();
  renderFinance();
  showToast("Movimiento guardado en el cofre.");
});

elements.cofferHomeTab.addEventListener("click", () => {
  setCofferTab("home");
});

elements.cofferFinanceTab.addEventListener("click", () => {
  setCofferTab("finance");
});

elements.cofferPasswordTab.addEventListener("click", () => {
  setCofferTab("passwords");
  document.querySelector("#add-password-entry").focus();
});

elements.cofferNotesTab.addEventListener("click", () => {
  setCofferTab("notes");
});

elements.cofferInventoryHome.addEventListener("click", (event) => {
  const target = event.target.closest("[data-coffer-open]");
  if (!target) return;
  const tab = target.dataset.cofferOpen;
  setCofferTab(tab);
  if (tab === "passwords") document.querySelector("#add-password-entry").focus();
});

elements.cofferNoteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = elements.cofferNoteTitle.value.trim();
  const content = elements.cofferNoteContent.value.trim();
  if (!title || !content) return;
  const now = new Date().toISOString();
  const editingId = elements.cofferNoteEditId.value;
  if (editingId) {
    cofferNotes = cofferNotes.map((note) =>
      note.id === editingId
        ? { ...note, title, content, updatedAt: now }
        : note,
    );
    showToast("Pergamino actualizado.");
  } else {
    cofferNotes.unshift({
      id: window.crypto.randomUUID(),
      title,
      content,
      createdAt: now,
      updatedAt: now,
    });
    showToast("Información importante guardada.");
  }
  clearCofferNoteForm();
  save();
  renderCofferNotes();
});

elements.cancelCofferNoteEdit.addEventListener("click", clearCofferNoteForm);

elements.cofferNoteList.addEventListener("click", (event) => {
  const edit = event.target.closest("[data-coffer-note-edit]");
  const remove = event.target.closest("[data-coffer-note-delete]");
  const id = edit?.dataset.cofferNoteEdit || remove?.dataset.cofferNoteDelete;
  if (!id) return;
  const note = cofferNotes.find((item) => item.id === id);
  if (!note) return;
  if (edit) {
    elements.cofferNoteEditId.value = note.id;
    elements.cofferNoteTitle.value = note.title;
    elements.cofferNoteContent.value = note.content;
    elements.cofferNoteEyebrow.textContent = "EDITAR PERGAMINO";
    elements.saveCofferNote.textContent = "GUARDAR CAMBIOS";
    elements.cancelCofferNoteEdit.classList.remove("hidden");
    elements.cofferNoteTitle.focus();
  } else {
    cofferNotes = cofferNotes.filter((item) => item.id !== id);
    if (elements.cofferNoteEditId.value === id) clearCofferNoteForm();
    save();
    renderCofferNotes();
    showToast("Pergamino eliminado.");
  }
});

elements.vaultMasterForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const password = elements.vaultMasterPassword.value;
  const confirmation = elements.vaultMasterConfirm.value;
  const existingPayload = localStorage.getItem(PASSWORD_VAULT_KEY);
  elements.vaultError.classList.add("hidden");
  if (password.length < 8) {
    elements.vaultError.textContent =
      "La clave maestra debe tener al menos 8 caracteres.";
    elements.vaultError.classList.remove("hidden");
    return;
  }
  if (!existingPayload && password !== confirmation) {
    elements.vaultError.textContent = "Las dos claves maestras no coinciden.";
    elements.vaultError.classList.remove("hidden");
    return;
  }

  elements.vaultMasterSubmit.disabled = true;
  const attempt = ++passwordVaultAttempt;
  elements.vaultMasterSubmit.textContent = "ABRIENDO…";
  try {
    if (existingPayload) {
      const decrypted = await decryptPasswordVault(
        existingPayload,
        password,
      );
      if (attempt !== passwordVaultAttempt) return;
      passwordVaultEntries = decrypted;
    } else {
      passwordVaultEntries = [];
      const payload = await encryptPasswordVault([], password);
      if (attempt !== passwordVaultAttempt) return;
      localStorage.setItem(PASSWORD_VAULT_KEY, payload);
      markCloudChange();
      showToast("Bóveda segura creada.");
    }
    passwordVaultMaster = password;
    elements.vaultMasterForm.reset();
    renderPasswordVault();
  } catch {
    elements.vaultError.textContent =
      "No se pudo abrir. Revisá la clave maestra.";
    elements.vaultError.classList.remove("hidden");
  } finally {
    elements.vaultMasterSubmit.disabled = false;
    elements.vaultMasterSubmit.textContent = localStorage.getItem(
      PASSWORD_VAULT_KEY,
    )
      ? "ABRIR FINANZAS"
      : "CREAR CLAVE Y ENTRAR";
  }
});

elements.lockPasswordVault.addEventListener("click", () => {
  lockPasswordVault();
  elements.vaultMasterPassword.focus();
});

elements.deletePasswordVault.addEventListener("click", () => {
  elements.vaultDeleteConfirm.classList.remove("hidden");
});

elements.cancelDeletePasswordVault.addEventListener("click", () => {
  elements.vaultDeleteConfirm.classList.add("hidden");
});

elements.confirmDeletePasswordVault.addEventListener("click", () => {
  localStorage.removeItem(PASSWORD_VAULT_KEY);
  markCloudChange();
  lockPasswordVault();
  showToast("Bóveda de contraseñas eliminada.");
});

elements.toggleFormPassword.addEventListener("click", () => {
  const visible = elements.passwordSecret.type === "text";
  elements.passwordSecret.type = visible ? "password" : "text";
  elements.toggleFormPassword.textContent = visible ? "◎" : "◉";
  elements.toggleFormPassword.setAttribute(
    "aria-label",
    visible ? "Mostrar contraseña" : "Ocultar contraseña",
  );
});

elements.generatePassword.addEventListener("click", () => {
  elements.passwordSecret.value = generateStrongPassword();
  elements.passwordSecret.type = "text";
  elements.toggleFormPassword.textContent = "◉";
  elements.toggleFormPassword.setAttribute("aria-label", "Ocultar contraseña");
  elements.passwordSecret.focus();
});

elements.cancelPasswordEdit.addEventListener("click", () => {
  clearPasswordEntryForm();
});

document.querySelector("#add-password-entry").addEventListener("click", () => {
  clearPasswordEntryForm();
  document.querySelector("#password-entry-dialog").showModal();
  elements.passwordService.focus();
});
document.querySelector("#close-password-dialog").addEventListener("click", clearPasswordEntryForm);
document.querySelector("#password-entry-dialog").addEventListener("cancel", (event) => {
  event.preventDefault();
  clearPasswordEntryForm();
});

elements.passwordEntryForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const service = elements.passwordService.value.trim();
  const secret = elements.passwordSecret.value;
  if (!service || !secret || !passwordVaultMaster) return;
  const editingId = elements.passwordEditId.value;
  const entry = {
    id: editingId || window.crypto.randomUUID(),
    service,
    username: elements.passwordUsername.value.trim(),
    password: secret,
    url: elements.passwordUrl.value.trim(),
    notes: elements.passwordNotes.value.trim(),
    updatedAt: new Date().toISOString(),
  };
  const nextEntries = editingId
    ? passwordVaultEntries.map((item) =>
        item.id === editingId ? entry : item,
      )
    : [entry, ...passwordVaultEntries];
  elements.savePasswordEntry.disabled = true;
  elements.savePasswordEntry.textContent = "CIFRANDO…";
  try {
    await persistPasswordEntries(nextEntries);
    clearPasswordEntryForm();
    showToast(editingId ? "Contraseña actualizada." : "Contraseña guardada.");
  } catch {
    showToast("No se pudo guardar la contraseña.");
  } finally {
    elements.savePasswordEntry.disabled = false;
    if (!elements.passwordEditId.value) {
      elements.savePasswordEntry.textContent = "+ GUARDAR LLAVE";
    }
  }
});

elements.passwordList.addEventListener("click", async (event) => {
  const copyUser = event.target.closest("[data-password-copy-user]");
  const copySecret = event.target.closest("[data-password-copy-secret]");
  const toggle = event.target.closest("[data-password-toggle]");
  const edit = event.target.closest("[data-password-edit]");
  const remove = event.target.closest("[data-password-delete]");
  const id =
    copyUser?.dataset.passwordCopyUser ||
    copySecret?.dataset.passwordCopySecret ||
    toggle?.dataset.passwordToggle ||
    edit?.dataset.passwordEdit ||
    remove?.dataset.passwordDelete;
  if (!id) return;
  const entry = passwordVaultEntries.find((item) => item.id === id);
  if (!entry) return;

  if (copyUser) {
    await copyPasswordValue(entry.username, "Usuario");
  } else if (copySecret) {
    await copyPasswordValue(entry.password, "Contraseña");
  } else if (toggle) {
    if (visiblePasswordIds.has(id)) visiblePasswordIds.delete(id);
    else visiblePasswordIds.add(id);
    renderPasswordVault();
  } else if (edit) {
    beginPasswordEdit(entry);
  } else if (remove) {
    try {
      await persistPasswordEntries(
        passwordVaultEntries.filter((item) => item.id !== id),
      );
      if (elements.passwordEditId.value === id) clearPasswordEntryForm();
      showToast("Contraseña eliminada.");
    } catch {
      showToast("No se pudo eliminar la contraseña.");
    }
  }
});

document.addEventListener("keydown", (event) => {
  if (!elements.characterSetup.classList.contains("hidden")) return;
  if (isMissionFocusLocked()) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  const inlineTitle = event.target.closest?.("[data-inline-task-title]");
  if (inlineTitle) {
    const id = Number(inlineTitle.dataset.inlineTaskTitle);
    if (event.key === "Enter") {
      event.preventDefault();
      finishInlineTaskRename(id, inlineTitle.value);
    } else if (event.key === "Escape") {
      event.preventDefault();
      finishInlineTaskRename(id, inlineTitle.value, true);
    }
    return;
  }
  const tag = event.target.tagName;
  const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
  if (event.key === "Escape") {
    if (closeTopmostLayer()) {
      event.preventDefault();
      event.stopPropagation();
    }
    return;
  }
  if (typing) return;
  if (event.key === "F10") {
    event.preventDefault();
    openPanel("settings");
    return;
  }
  const canMove =
    elements.panelBackdrop.classList.contains("hidden") &&
    elements.modal.classList.contains("hidden") &&
    elements.activityPanel.classList.contains("hidden") &&
    elements.exitConfirm.classList.contains("hidden") &&
    elements.completionCelebration.classList.contains("hidden");
  if (canMove && settings.keyboardMovement) {
    const movementKeys = new Set([
      "arrowup",
      "w",
      "arrowdown",
      "s",
      "arrowleft",
      "a",
      "arrowright",
      "d",
    ]);
    const key = event.key.toLowerCase();
    if (movementKeys.has(key)) {
      event.preventDefault();
      pressedMovementKeys.add(key);
      return;
    }
  }
  if (settings.shortcutsEnabled) {
    const quickIndex = Number(event.key) - 1;
    const quickId = activeQuickAccessIds()[quickIndex];
    if (quickId) {
      const definition = quickAccessDefinition(quickId);
      if (quickId === "task") openNewTask();
      else openPanel(definition.panel);
      return;
    }
    if (event.key.toLowerCase() === "t") openPanel("board");
    if (event.key.toLowerCase() === "c") openPanel("creativity");
    if (event.key.toLowerCase() === "p") openPanel("projects");
    if (event.key.toLowerCase() === "n") openNewTask();
  }
});

document.addEventListener("keyup", (event) => {
  pressedMovementKeys.delete(event.key.toLowerCase());
});

window.addEventListener("blur", () => {
  pressedMovementKeys.clear();
});

window.addEventListener("nok-android-back", () => {
  pressedMovementKeys.clear();
  if (document.querySelector("#password-entry-dialog")?.open) {
    clearPasswordEntryForm();
    return;
  }
  if (!elements.birthdayAlert.classList.contains("hidden")) {
    closeBirthdayAlert();
    return;
  }
  if (!elements.completionCelebration.classList.contains("hidden")) {
    closeCompletionCelebration();
    return;
  }
  if (!elements.activityPanel.classList.contains("hidden")) {
    closeActivityPanel();
    return;
  }
  if (!elements.exitConfirm.classList.contains("hidden")) {
    closeExitConfirm();
    return;
  }
  if (
    !elements.panelBackdrop.classList.contains("hidden") ||
    !elements.modal.classList.contains("hidden")
  ) {
    closeNewTask();
    closePanel();
    return;
  }
  openExitConfirm();
});

function stopMobileWorldPan(event) {
  if (mobileWorldPointerId === null || event.pointerId !== mobileWorldPointerId) {
    return;
  }
  const shouldActivateTap =
    event.type === "pointerup" &&
    !mobileWorldDragged &&
    mobileWorldTapButton instanceof HTMLElement;
  const tapButton = mobileWorldTapButton;
  mobileWorldPointerId = null;
  elements.world.releasePointerCapture?.(event.pointerId);
  elements.world.classList.remove("is-panning");
  if (shouldActivateTap) {
    mobileWorldTapHandled = true;
    tapButton.click();
  }
  window.setTimeout(() => {
    mobileWorldDragged = false;
    mobileWorldTapButton = null;
    mobileWorldTapHandled = false;
  }, 0);
}

elements.undergroundHatch?.addEventListener("click", () => {
  if (!worldBuildMode) enterUndergroundWorld();
});
elements.undergroundLadderAccess?.addEventListener("click", leaveUndergroundWorld);

elements.worldBuildToggle.addEventListener("click", () => {
  setWorldBuildMode(!worldBuildMode);
});

elements.worldModuleInventory.addEventListener("click", (event) => {
  const detailsButton = event.target.closest("[data-module-details]");
  if (detailsButton) {
    openWorldModuleDetails(detailsButton.dataset.moduleDetails);
    return;
  }
  const button = event.target.closest("[data-inventory-module]");
  if (!button) return;
  const id = button.dataset.inventoryModule;
  const portalModule = worldModuleState(id);
  if (!portalModule) return;
  if (!worldModuleUnlocked(id)) {
    showToast("Desbloqueá esta recompensa en el Salón de logros.");
    return;
  }
  if (!portalModule.placed) {
    const plot = firstFreeWorldPlot(id);
    if (!plot) {
      showToast("No quedan claros libres. Mové un portal para hacer lugar.");
      return;
    }
    placeWorldModule(id, plot);
  }
  selectWorldModule(id);
});

elements.worldModuleTitle.addEventListener("input", () => {
  if (!worldModuleDetailId) return;
  renameWorldModule(worldModuleDetailId, elements.worldModuleTitle.value);
  renderWorldModuleDetails();
});

elements.worldModuleRemove.addEventListener("click", () => {
  if (!worldModuleDetailId) return;
  removeWorldModule(worldModuleDetailId);
});

elements.worldModuleDetailClose?.addEventListener("click", closeWorldModuleDetails);
elements.worldModuleDetailBackdrop?.addEventListener("click", (event) => {
  if (event.target === elements.worldModuleDetailBackdrop) closeWorldModuleDetails();
});
elements.worldModuleDetailMove?.addEventListener("click", () => {
  if (!worldModuleDetailId) return;
  const id = worldModuleDetailId;
  const portalModule = worldModuleState(id);
  if (!portalModule?.placed) {
    const plot = firstFreeWorldPlot(id);
    if (!plot) {
      showToast("No quedan claros libres. Mové un portal para hacer lugar.");
      return;
    }
    placeWorldModule(id, plot);
  }
  selectWorldModule(id);
  closeWorldModuleDetails();
  showToast("Portal listo para mover. Arrastralo o tocá una casilla libre.");
});

elements.worldGrid.addEventListener("click", (event) => {
  if (!worldBuildMode || !selectedWorldModuleId) return;
  const target = event.target.closest("[data-plot-x]");
  if (!target) return;
  const plot = { x: Number(target.dataset.plotX), y: Number(target.dataset.plotY) };
  placeWorldModule(selectedWorldModuleId, plot);
});

elements.world.addEventListener("pointerdown", (event) => {
  if (!worldBuildMode) return;
  const element = event.target.closest("[data-build-prop]");
  if (!element) return;
  beginWorldPropDrag(event, element, element.dataset.buildProp);
});

window.addEventListener("pointermove", moveWorldPropDrag);
window.addEventListener("pointerup", finishWorldPropDrag);
window.addEventListener("pointercancel", finishWorldPropDrag);

elements.worldModuleLayer.addEventListener("pointerdown", (event) => {
  if (!worldBuildMode) return;
  const element = event.target.closest("[data-world-module]");
  if (!element) return;
  event.preventDefault();
  event.stopPropagation();
  const id = element.dataset.worldModule;
  selectWorldModule(id);
  const bounds = elements.world.getBoundingClientRect();
  const portalModule = worldModuleState(id);
  const position = plotToWorldPosition(portalModule.plot);
  moduleDragState = {
    id,
    pointerId: event.pointerId,
    element,
    startX: event.clientX,
    startY: event.clientY,
    offsetX: event.clientX - (bounds.left + (position.x / 100) * bounds.width),
    offsetY: event.clientY - (bounds.top + (position.y / 100) * bounds.height),
    moved: false,
    plot: null,
  };
  element.classList.add("dragging");
  element.setPointerCapture?.(event.pointerId);
});

window.addEventListener("pointermove", (event) => {
  if (!moduleDragState || event.pointerId !== moduleDragState.pointerId) return;
  event.preventDefault();
  const bounds = elements.world.getBoundingClientRect();
  const anchorClientX = event.clientX - moduleDragState.offsetX;
  const anchorClientY = event.clientY - moduleDragState.offsetY;
  const left = ((anchorClientX - bounds.left) / bounds.width) * 100;
  const top = ((anchorClientY - bounds.top) / bounds.height) * 100;
  moduleDragState.moved ||= Math.hypot(
    event.clientX - moduleDragState.startX,
    event.clientY - moduleDragState.startY,
  ) > 5;
  moduleDragState.element.style.left = `${left}%`;
  moduleDragState.element.style.top = `${top}%`;
  moduleDragState.plot = nearestWorldPlotFromPointer(anchorClientX, anchorClientY, moduleDragState.id);
  elements.worldGrid.querySelectorAll(".world-build-plot").forEach((plotElement) => {
    plotElement.classList.toggle(
      "drop-ready",
      Boolean(
        moduleDragState.plot &&
        Number(plotElement.dataset.plotX) === moduleDragState.plot.x &&
        Number(plotElement.dataset.plotY) === moduleDragState.plot.y,
      ),
    );
  });
});

function finishWorldModuleDrag(event) {
  if (!moduleDragState || event.pointerId !== moduleDragState.pointerId) return;
  const drag = moduleDragState;
  moduleDragState = null;
  drag.element.releasePointerCapture?.(event.pointerId);
  drag.element.classList.remove("dragging");
  if (drag.moved && drag.plot) placeWorldModule(drag.id, drag.plot);
  else renderWorldModules();
}

window.addEventListener("pointerup", finishWorldModuleDrag);
window.addEventListener("pointercancel", finishWorldModuleDrag);

elements.world.addEventListener("pointerdown", (event) => {
  const blockedControl = event.target.closest(
    "input, textarea, select, [contenteditable='true']",
  );
  if (
    !isPortraitMobileMap() ||
    !canPlayerMove() ||
    event.pointerType === "mouse" ||
    blockedControl
  ) {
    return;
  }
  event.preventDefault();
  mobileWorldPointerId = event.pointerId;
  mobileWorldPointerStartX = event.clientX;
  mobileWorldPointerStartY = event.clientY;
  mobileWorldPanStartX = mobileWorldPanX;
  mobileWorldDragged = false;
  mobileWorldTapButton = event.target.closest("button");
  mobileWorldTapHandled = false;
  elements.world.classList.add("is-panning");
  elements.world.setPointerCapture?.(event.pointerId);
});

elements.world.addEventListener("pointermove", (event) => {
  if (mobileWorldPointerId === null || event.pointerId !== mobileWorldPointerId) {
    return;
  }
  event.preventDefault();
  const deltaX = event.clientX - mobileWorldPointerStartX;
  const deltaY = event.clientY - mobileWorldPointerStartY;
  if (Math.hypot(deltaX, deltaY) > 8) mobileWorldDragged = true;
  setMobileWorldPan(mobileWorldPanStartX + deltaX);
});

elements.world.addEventListener("pointerup", stopMobileWorldPan);
elements.world.addEventListener("pointercancel", stopMobileWorldPan);
elements.world.addEventListener("lostpointercapture", stopMobileWorldPan);
elements.world.addEventListener(
  "click",
  (event) => {
    if (!event.isTrusted || (!mobileWorldDragged && !mobileWorldTapHandled)) return;
    event.preventDefault();
    event.stopPropagation();
  },
  true,
);

new ResizeObserver(([entry]) => {
  worldWidth = entry.contentRect.width;
  worldHeight = entry.contentRect.height;
  positionActor(elements.movablePlayer, playerPosition);
  for (const {element,npc} of petActors) positionActor(element,npc.position);
  setMobileWorldPan(mobileWorldPanX);
  keepPlayerInMobileCamera();
}).observe(elements.world);
window.addEventListener("resize", () => {
  setMobileWorldPan(mobileWorldPanX);
  keepPlayerInMobileCamera();
});

function setMobileJoystickDirections(nextDirections) {
  for (const key of mobileJoystickDirections) pressedMovementKeys.delete(key);
  mobileJoystickDirections = nextDirections;
  for (const key of mobileJoystickDirections) pressedMovementKeys.add(key);
}

function resetMobileJoystick() {
  setMobileJoystickDirections([]);
  mobileJoystickPointerId = null;
  elements.mobileJoystick.classList.remove("is-active");
  elements.mobileJoystickKnob.style.transform = "translate3d(0, 0, 0)";
}

function updateMobileJoystick(event) {
  const rect = elements.mobileJoystickBase.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const maxDistance = rect.width * 0.28;
  let deltaX = event.clientX - centerX;
  let deltaY = event.clientY - centerY;
  const distance = Math.hypot(deltaX, deltaY);
  if (distance > maxDistance) {
    const scale = maxDistance / distance;
    deltaX *= scale;
    deltaY *= scale;
  }
  elements.mobileJoystickKnob.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;

  const deadZone = maxDistance * 0.28;
  const directions = [];
  if (deltaY < -deadZone) directions.push("arrowup");
  if (deltaY > deadZone) directions.push("arrowdown");
  if (deltaX < -deadZone) directions.push("arrowleft");
  if (deltaX > deadZone) directions.push("arrowright");
  setMobileJoystickDirections(directions);
}

elements.mobileJoystickBase.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  if (!isMobileRuntime || !settings.touchJoystickEnabled || !canPlayerMove()) return;
  mobileJoystickPointerId = event.pointerId;
  elements.mobileJoystick.classList.add("is-active");
  elements.mobileJoystickBase.setPointerCapture?.(event.pointerId);
  updateMobileJoystick(event);
});

elements.mobileJoystickBase.addEventListener("pointermove", (event) => {
  if (event.pointerId !== mobileJoystickPointerId) return;
  event.preventDefault();
  updateMobileJoystick(event);
});

for (const eventName of ["pointerup", "pointercancel", "lostpointercapture"]) {
  elements.mobileJoystickBase.addEventListener(eventName, (event) => {
    if (mobileJoystickPointerId !== null && event.pointerId !== mobileJoystickPointerId) return;
    event.preventDefault();
    resetMobileJoystick();
  });
}
elements.mobileJoystickBase.addEventListener("contextmenu", (event) => event.preventDefault());

document.addEventListener("focusout", (event) => {
  const inlineTitle = event.target.closest?.("[data-inline-task-title]");
  if (!inlineTitle) return;
  finishInlineTaskRename(
    Number(inlineTitle.dataset.inlineTaskTitle),
    inlineTitle.value,
  );
});

elements.minimizeGame.addEventListener("click", () => {
  window.nokWindow?.minimize();
});

window.nokWindow?.onFocusLockEmergencyExit?.(emergencyExitMissionFocus);

elements.openStreakHistory.addEventListener("click", () => {
  openActivityPanel("streak");
});
elements.openCoinRewards.addEventListener("click", () => {
  openActivityPanel("coins");
});
elements.openTodayHistory.addEventListener("click", () => {
  openActivityPanel("today");
});
elements.closeActivity.addEventListener("click", closeActivityPanel);
elements.progressTabs.forEach((button) => {
  button.addEventListener("click", () => {
    activityTab = button.dataset.progressTab || "stats";
    renderProgressPanel();
  });
});
elements.activityContent.addEventListener("click", (event) => {
  const destination = event.target.closest("[data-progress-go]");
  if (destination) {
    activityTab = destination.dataset.progressGo;
    renderProgressPanel();
    return;
  }
  const reward = event.target.closest("[data-buy-reward]");
  if (reward) buyProgressReward(reward.dataset.buyReward);
});
elements.activityPanel.addEventListener("mousedown", (event) => {
  if (event.target === elements.activityPanel) closeActivityPanel();
});

elements.cancelWritingDelete.addEventListener(
  "click",
  closeWritingDeleteConfirm,
);
elements.confirmWritingDelete.addEventListener(
  "click",
  confirmWritingProjectDelete,
);
elements.writingDeleteConfirm.addEventListener("mousedown", (event) => {
  if (event.target === elements.writingDeleteConfirm) {
    closeWritingDeleteConfirm();
  }
});

elements.closeGame.addEventListener("click", openExitConfirm);
elements.cancelExit.addEventListener("click", closeExitConfirm);
elements.confirmExit.addEventListener("click", confirmGameExit);
elements.exitConfirm.addEventListener("mousedown", (event) => {
  if (event.target === elements.exitConfirm) closeExitConfirm();
});
elements.closeBirthdayAlert.addEventListener("click", closeBirthdayAlert);
elements.confirmBirthdayAlert.addEventListener("click", closeBirthdayAlert);
elements.snoozeEventAlert.addEventListener("click", snoozeActiveEventAlert);
elements.openBirthdayArchive.addEventListener("click", () => {
  closeBirthdayAlert();
  openPanel("agenda");
});
elements.closeCompletionCelebration.addEventListener(
  "click",
  closeCompletionCelebration,
);
elements.completionCelebration.addEventListener("mousedown", (event) => {
  if (event.target === elements.completionCelebration) {
    closeCompletionCelebration();
  }
});

elements.musicOcarina.addEventListener("click", () => {
  if (worldBuildMode) return;
  void toggleCampMusic();
});

elements.cloudCreateWorld.addEventListener("click", async () => {
  if (!cloudSync) return;
  elements.cloudCreateWorld.disabled = true;
  try {
    await cloudSync.createCloudWorld();
    cloudSync.start();
    const pairing = await cloudSync.createPairingCode();
    activePairingCode = pairing.code;
    elements.cloudWorldCodeOutput.value = pairing.code;
    try {
      await navigator.clipboard.writeText(pairing.code);
      showToast("Nube activada. Copiamos el código de 6 caracteres; dura 10 minutos.");
    } catch {
      showToast("Nube activada. Usá el código de 6 caracteres dentro de los próximos 10 minutos.");
    }
  } catch (error) {
    showToast(error instanceof Error ? error.message : "No se pudo activar la nube.");
  } finally {
    renderCloudSync();
  }
});

elements.cloudConnectWorld.addEventListener("click", async () => {
  if (!cloudSync) return;
  const code = elements.cloudWorldCodeInput.value.trim();
  if (!code) {
    showToast("Ingresá primero el código de 6 caracteres.");
    elements.cloudWorldCodeInput.focus();
    return;
  }
  if (
    !window.confirm(
      "¿Vincular este dispositivo? NOK guardará una copia de rescate local y luego abrirá el mundo de la nube.",
    )
  ) {
    return;
  }
  elements.cloudConnectWorld.disabled = true;
  try {
    await cloudSync.connectWithPairingCode(code);
    showToast("Mundo encontrado. Abriendo la partida sincronizada…");
  } catch (error) {
    showToast(error instanceof Error ? error.message : "No se pudo vincular el mundo.");
    renderCloudSync();
  } finally {
    elements.cloudConnectWorld.disabled = false;
  }
});

elements.cloudWorldCodeInput.addEventListener("input", () => {
  elements.cloudWorldCodeInput.value = elements.cloudWorldCodeInput.value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
});
elements.closeAchievementCelebration.addEventListener("click", closeAchievementCelebration);
elements.achievementContinue.addEventListener("click", closeAchievementCelebration);
elements.achievementCelebration.addEventListener("mousedown", (event) => {
  if (event.target === elements.achievementCelebration) closeAchievementCelebration();
});

elements.cloudToggleCode.addEventListener("click", async () => {
  if (!cloudSync) return;
  elements.cloudToggleCode.disabled = true;
  try {
    const pairing = await cloudSync.createPairingCode();
    activePairingCode = pairing.code;
    elements.cloudWorldCodeOutput.value = pairing.code;
    showToast("Código listo. Dura 10 minutos y se puede usar una sola vez.");
  } catch (error) {
    showToast(error instanceof Error ? error.message : "No se pudo generar el código.");
  } finally {
    elements.cloudToggleCode.disabled = false;
  }
});

elements.cloudCopyCode.addEventListener("click", async () => {
  if (!activePairingCode) {
    showToast("Primero generá un código de vinculación.");
    return;
  }
  try {
    await navigator.clipboard.writeText(elements.cloudWorldCodeOutput.value);
    showToast("Código de vinculación copiado.");
  } catch {
    elements.cloudWorldCodeOutput.select();
    showToast("Seleccionamos el código para que puedas copiarlo.");
  }
});

elements.cloudSyncNow.addEventListener("click", () => {
  void cloudSync?.sync();
});

elements.cloudDownloadWorld.addEventListener("click", async () => {
  if (!cloudSync) return;
  const downloaded = await cloudSync.pullRemote();
  if (downloaded) showToast("Partida descargada. Abriendo los datos de la nube…");
});

elements.cloudUploadWorld.addEventListener("click", async () => {
  if (!cloudSync) return;
  if (
    !window.confirm(
      "¿Subir la partida de este dispositivo? La copia online será reemplazada por estos datos.",
    )
  ) {
    return;
  }
  const uploaded = await cloudSync.pushLocal();
  if (uploaded) showToast("Partida subida. Los otros dispositivos la recibirán automáticamente.");
});

elements.cloudDisconnect.addEventListener("click", () => {
  if (!window.confirm("¿Desconectar este dispositivo? La partida local no se borra.")) return;
  cloudSync?.disconnect();
  elements.cloudWorldCodeInput.value = "";
  showToast("Este dispositivo quedó desconectado de la nube.");
});

elements.cloudDeleteCopy.addEventListener("click", async () => {
  if (
    !window.confirm(
      "¿Borrar la copia online? La partida de este dispositivo queda guardada, pero los otros dejarán de sincronizar.",
    )
  ) {
    return;
  }
  try {
    await cloudSync?.deleteCloudCopy();
    showToast("Copia online eliminada. Tu partida local está intacta.");
  } catch (error) {
    showToast(error instanceof Error ? error.message : "No se pudo borrar la copia online.");
  }
});

document.addEventListener(
  "click",
  (event) => {
    if (!settings.soundEffectsEnabled || settings.volume <= 0) return;
    const button = event.target.closest?.("button, [role='button']");
    if (!button || button.matches(":disabled")) return;
    if (button.getAttribute("aria-disabled") === "true") return;
    if (!soundEngine) soundEngine = new window.NokSoundEngine();
    soundEngine.setVolume(settings.volume / 100);
    void soundEngine.play(buttonSoundKind(button)).catch(() => {});
  },
  true,
);

elements.settingsVolume.addEventListener("input", () => {
  settings.volume = Number(elements.settingsVolume.value);
  elements.settingsVolumeValue.textContent = `${settings.volume}%`;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  markCloudChange();
  musicEngine?.setVolume(settings.volume / 100);
  soundEngine?.setVolume(settings.volume / 100);
});

elements.settingsWorldName.addEventListener("input", () => {
  settings.worldName = elements.settingsWorldName.value.slice(0, 40);
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  markCloudChange();
});

elements.settingsWorldName.addEventListener("blur", () => {
  settings.worldName = settings.worldName.trim() || "Mi mundo NOK";
  elements.settingsWorldName.value = settings.worldName;
  persistSettings("Nombre del mundo actualizado.");
});

document.querySelectorAll("[data-world-theme]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.worldTheme === "earth" && !rewardUnlocked("map-coast")) {
      showToast("Desbloqueá el nuevo mapa en el Salón de logros.");
      return;
    }
    settings.worldTheme = button.dataset.worldTheme;
    worldLayout = sanitizeWorldLayout(worldLayout, settings.worldTheme);
    saveWorldLayout();
    renderWorldModules();
    renderWorldBuilder();
    persistSettings(
      settings.worldTheme === "earth"
        ? "Tu mundo ahora es una playa terrenal."
        : "Tu mundo volvió al campamento fantástico.",
    );
  });
});

elements.characterSettingsContent.addEventListener("click", (event) => {
  const gender = event.target.closest("[data-settings-character-gender]");
  const age = event.target.closest("[data-settings-character-age]");
  const hair = event.target.closest("[data-settings-character-hair]");
  if (gender) {
    settings.characterGender = gender.dataset.settingsCharacterGender;
    settings.avatarStyle = settings.characterGender === "female" ? "adventurer-female" : "adventurer";
  } else if (age) {
    settings.characterAgeOverride = age.dataset.settingsCharacterAge;
  } else if (hair) {
    settings.characterHair = hair.dataset.settingsCharacterHair;
  } else if (event.target.closest("[data-open-character-rewards]")) {
    closePanel();
    activityTab = "rewards";
    renderProgressPanel();
    elements.activityPanel.classList.remove("hidden");
    return;
  } else {
    return;
  }
  persistSettings("Personaje actualizado.");
});

elements.settingsMusicEnabled.addEventListener("change", () => {
  settings.musicEnabled = elements.settingsMusicEnabled.checked;
  persistSettings(
    settings.musicEnabled ? "Música habilitada." : "Música desactivada.",
  );
});

elements.settingsSoundEffectsEnabled.addEventListener("change", () => {
  settings.soundEffectsEnabled = elements.settingsSoundEffectsEnabled.checked;
  persistSettings(
    settings.soundEffectsEnabled
      ? "Efectos de botones habilitados."
      : "Efectos de botones desactivados.",
  );
});

elements.settingsKeyboardMovement.addEventListener("change", () => {
  settings.keyboardMovement = elements.settingsKeyboardMovement.checked;
  persistSettings();
});

elements.settingsTouchJoystick.addEventListener("change", () => {
  settings.touchJoystickEnabled = elements.settingsTouchJoystick.checked;
  persistSettings(
    settings.touchJoystickEnabled
      ? "Joystick táctil visible."
      : "Joystick táctil oculto.",
  );
});

elements.settingsShortcutsEnabled.addEventListener("change", () => {
  settings.shortcutsEnabled = elements.settingsShortcutsEnabled.checked;
  persistSettings();
});

elements.settingsQuickAccessPicker.addEventListener("click", (event) => {
  const toggle = event.target.closest("[data-quick-access-toggle]");
  if (toggle) {
    toggleQuickAccess(toggle.dataset.quickAccessToggle);
    return;
  }
  const move = event.target.closest("[data-quick-access-move]");
  if (move) {
    moveQuickAccess(move.dataset.quickAccessId, move.dataset.quickAccessMove);
  }
});

elements.settingsReducedMotion.addEventListener("change", () => {
  settings.reducedMotion = elements.settingsReducedMotion.checked;
  persistSettings();
});

elements.settingsHomeReminders.addEventListener("change", () => {
  settings.showHomeReminders = elements.settingsHomeReminders.checked;
  persistSettings(
    settings.showHomeReminders
      ? "Recordatorios visibles en el mapa."
      : "Recordatorios ocultos en el mapa.",
  );
});

elements.settingsStrictFocusMode.addEventListener("change", () => {
  settings.strictFocusMode = elements.settingsStrictFocusMode.checked;
  persistSettings(
    settings.strictFocusMode
      ? "Modo enfoque estricto activado."
      : "Modo enfoque estricto desactivado.",
  );
});

elements.resetSettings.addEventListener("click", () => {
  settings = {
    ...DEFAULT_SETTINGS,
    avatarStyle: settings.avatarStyle,
    characterGender: settings.characterGender,
    characterHair: settings.characterHair,
    characterAgeOverride: settings.characterAgeOverride,
    characterSetupComplete: settings.characterSetupComplete,
  };
  persistSettings("Ajustes originales restaurados.");
});

window.addEventListener("beforeunload", () => {
  persistActiveWritingDraft();
  localStorage.setItem(PLAYER_POSITION_KEY, JSON.stringify(playerPosition));
  window.cancelAnimationFrame(playerAnimationFrame);
  window.cancelAnimationFrame(petNpcAnimationFrame);
  if (missionFocusTimer) window.clearInterval(missionFocusTimer);
  cloudSync?.stop();
  musicEngine?.destroy();
  soundEngine?.destroy();
});

updateTaskProjectOptions();
initializeCloudSync();
applySettings();
applyTimeOfDay();
renderHud();
renderReminder();
renderWorldCompanions();
renderHub();
renderPuzzle();
checkBirthdayAlerts();
checkEventAlerts();
renderPlayer();
playerAnimationFrame = window.requestAnimationFrame(runPlayerMovementFrame);
petNpcAnimationFrame = window.requestAnimationFrame(runPetNpcMovementFrame);
window.setInterval(tickHubAndPuzzle, 1000);
window.setInterval(() => {
  if (!hubStopwatchRunning) return;
  hubStopwatchMilliseconds = Math.max(0, Date.now() - hubStopwatchStartedAt);
  if (activePanel === "hub") renderHub();
}, 100);
window.setInterval(() => {
  applyTimeOfDay();
  renderHud();
  checkBirthdayAlerts();
  checkEventAlerts();
  if (!elements.boardView.classList.contains("hidden")) renderBoard();
}, 60_000);

function renderCharacterSetup() {
  const age = ageFromBirthDate(elements.characterSetupBirth.value);
  const ageGroup = characterAgeGroupFromAge(age);
  const titles = {
    1: "¿Cómo te llamás?",
    2: "¿Cuándo empezó tu historia?",
    3: "¿Quién querés ser en esta aventura?",
  };
  elements.characterSetupKicker.textContent = `CREACIÓN DEL MUNDO · PASO ${characterSetupStep} DE 3`;
  elements.characterSetupTitle.textContent = titles[characterSetupStep];
  elements.characterSetup.querySelectorAll("[data-character-step]").forEach((step) => step.classList.toggle("hidden", Number(step.dataset.characterStep) !== characterSetupStep));
  elements.characterSetup.querySelectorAll(".character-setup-progress i").forEach((marker, index) => marker.classList.toggle("active", index < characterSetupStep));
  elements.closeCharacterSetup.classList.toggle("hidden", !settings.characterSetupComplete);
  applyCharacterPreview(elements.characterBirthPreview, characterSetupGender, characterSetupHair, ageGroup);
  const validAge = age !== null && age >= 12 && age <= 99;
  elements.characterAgeResult.classList.toggle("hidden", age === null);
  elements.characterAgeResult.classList.toggle("invalid", age !== null && !validAge);
  if (age !== null) {
    elements.characterAgeResult.querySelector("strong").textContent = `${age} AÑOS`;
    elements.characterAgeResult.querySelector("span").textContent = validAge ? CHARACTER_AGE_OPTIONS.find((item) => item.id === ageGroup).label : "EDAD FUERA DE RANGO";
  }
  elements.characterBirthNext.disabled = !validAge;
  elements.characterAgeLabel.textContent = CHARACTER_AGE_OPTIONS.find((item) => item.id === ageGroup).label;
  elements.characterAgeCopy.textContent = age === null ? "Completá tu fecha" : `${age} años · esta etapa cambia con vos`;
  elements.characterSetup.querySelectorAll("[data-character-gender]").forEach((button) => {
    const gender = button.dataset.characterGender;
    button.classList.toggle("active", gender === characterSetupGender);
    applyCharacterPreview(button.querySelector(".setup-character-preview"), gender, characterSetupHair, ageGroup);
  });
  elements.characterSetup.querySelectorAll("[data-character-hair]").forEach((button) => button.classList.toggle("active", button.dataset.characterHair === characterSetupHair));
}

function openCharacterSetup() {
  elements.characterSetupName.value = profile.name || "";
  elements.characterSetupBirth.value = profile.birthDate || "";
  characterSetupGender = settings.characterGender || (settings.avatarStyle === "adventurer-female" ? "female" : "male");
  characterSetupHair = settings.characterHair || "brown";
  characterSetupStep = profile.name.trim() ? (profile.birthDate ? 3 : 2) : 1;
  renderCharacterSetup();
  elements.characterSetup.classList.remove("hidden");
  const firstControl = characterSetupStep === 1 ? elements.characterSetupName : characterSetupStep === 2 ? elements.characterSetupBirth : elements.characterSetup.querySelector("[data-character-gender].active");
  firstControl?.focus({ preventScroll: true });
}

function finishCharacterSetup() {
  const age = ageFromBirthDate(elements.characterSetupBirth.value);
  if (!elements.characterSetupName.value.trim()) { characterSetupStep = 1; renderCharacterSetup(); return; }
  if (age === null || age < 12 || age > 99) { characterSetupStep = 2; renderCharacterSetup(); return; }
  profile.name = elements.characterSetupName.value.trim();
  profile.birthDate = elements.characterSetupBirth.value;
  profile.level = age;
  settings.characterGender = characterSetupGender;
  settings.characterHair = characterSetupHair;
  settings.characterAgeOverride = "";
  settings.characterSetupComplete = true;
  settings.avatarStyle = characterSetupGender === "female" ? "adventurer-female" : "adventurer";
  elements.characterSetup.classList.add("hidden");
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  save();
  applySettings();
  renderProfile();
  showToast("Tu personaje ya es parte de este mundo.");
}

document.addEventListener("nok:world-entered", () => {
  if (!profile.name.trim() || !profile.birthDate || !settings.characterSetupComplete) {
    openCharacterSetup();
  } else if (elements.birthdayAlert.classList.contains("hidden")) {
    elements.world.focus({ preventScroll: true });
  }
}, { once: true });
document.querySelector("#edit-character").addEventListener("click", openCharacterSetup);
elements.closeCharacterSetup.addEventListener("click", () => elements.characterSetup.classList.add("hidden"));
elements.characterNameNext.addEventListener("click", () => {
  if (!elements.characterSetupName.value.trim()) return;
  characterSetupStep = 2;
  renderCharacterSetup();
  elements.characterSetupBirth.focus();
});
elements.characterSetupName.addEventListener("keydown", (event) => {
  if (event.key === "Enter") elements.characterNameNext.click();
});
elements.characterSetupBirth.addEventListener("input", renderCharacterSetup);
elements.characterBirthNext.addEventListener("click", () => {
  const age = ageFromBirthDate(elements.characterSetupBirth.value);
  if (age === null || age < 12 || age > 99) return;
  characterSetupStep = 3;
  renderCharacterSetup();
});
elements.characterSetup.querySelectorAll("[data-character-back]").forEach((button) => button.addEventListener("click", () => { characterSetupStep = Number(button.dataset.characterBack); renderCharacterSetup(); }));
elements.characterSetup.querySelectorAll("[data-character-gender]").forEach((button) => button.addEventListener("click", () => { characterSetupGender = button.dataset.characterGender; renderCharacterSetup(); }));
elements.characterSetup.querySelectorAll("[data-character-hair]").forEach((button) => button.addEventListener("click", () => { characterSetupHair = button.dataset.characterHair; renderCharacterSetup(); }));
elements.finishCharacterSetup.addEventListener("click", finishCharacterSetup);
})(window.nokGameStorage);
