// This adapter never writes a world, a password or an auth token into browser storage.
export function worldStorage(initial = {}, changed = () => {}) {
  const entries = Object.entries(initial);
  if (entries.some(([k,v]) => !k.startsWith("nok-") || typeof v !== "string")) throw Error("Partida no válida.");
  const data = new Map(entries);
  const storage = Object.freeze({
    getItem(key) { return data.get(key) ?? null; },
    setItem(key, value) {
      if (!key.startsWith("nok-")) throw Error("Clave de partida no válida.");
      const next = String(value);
      if (data.get(key) !== next) { data.set(key, next); changed(); }
    },
    removeItem(key) { if (data.delete(key)) changed(); }
  });
  return { storage, snapshot: () => Object.fromEntries(data) };
}
export const chunkSize = 256 * 1024, maxParts = 16;
export async function encode(value) {
  const raw = new Blob([JSON.stringify(value)]).stream().pipeThrough(new CompressionStream("gzip"));
  const bytes = new Uint8Array(await new Response(raw).arrayBuffer());
  if (bytes.length > maxParts * chunkSize) throw Error("La partida excede el espacio de guardado.");
  return Array.from({length: Math.ceil(bytes.length/chunkSize)}, (_,i) => bytes.slice(i*chunkSize, (i+1)*chunkSize));
}
export async function decode(parts) {
  const raw = new Blob(parts).stream().pipeThrough(new DecompressionStream("gzip"));
  const state = JSON.parse(await new Response(raw).text());
  if (!state || typeof state !== "object" || Array.isArray(state)) throw Error("Partida no válida.");
  return state;
}
