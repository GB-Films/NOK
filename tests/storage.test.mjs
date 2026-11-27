import test from "node:test";
import assert from "node:assert/strict";
import {worldStorage,encode,decode,chunkSize} from "../account/storage.js";
import {randomBytes} from "node:crypto";
test("cada visita es independiente y sólo los cambios reales solicitan guardado", () => {
  let changes=0; const a=worldStorage({},()=>changes++), b=worldStorage();
  a.storage.setItem("nok-hello","hola"); a.storage.setItem("nok-hello","hola");
  assert.equal(b.storage.getItem("nok-hello"),null); assert.equal(changes,1);
  a.storage.removeItem("nok-hello"); assert.deepEqual(a.snapshot(),{}); assert.equal(changes,2);
});
test("una partida grande con texto y dibujos se recupera exactamente",async()=>{
  const state={"nok-notes":"¡Hola mundo! 🦋", "nok-drawings":randomBytes(520000).toString("base64")};
  const parts=await encode(state);assert.ok(parts.length>1);assert.ok(parts.every(p=>p.length<=chunkSize));assert.deepEqual(await decode(parts),state);
});
test("un guardado no válido se rechaza, nunca se reemplaza por una partida vacía",async()=>{
  assert.throws(()=>worldStorage({"nok-a":false}));assert.throws(()=>worldStorage({unrelated:"other app"}));
  await assert.rejects(()=>decode([new Uint8Array([1,2,3])]));
});
