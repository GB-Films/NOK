import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

test("Las acciones de icono tienen nombre y los botones destructivos usan el control común",async()=>{
  const files=["game/index.html","game/app.js","assistant/ui.js","planner/ui.js"];
  let destructive=0;
  for(const file of files){
    const source=await readFile(new URL("../"+file,import.meta.url),"utf8");
    for(const [tag] of source.matchAll(/<button\b[^>]*>/g)){
      if(tag.includes("data-ui-glyph"))assert.match(tag,/aria-label=/,file+": "+tag);
      if(/data-(?:[\w-]+-delete=|task-action="delete"|quick-list-action="delete"|remove\b)/.test(tag)){
        assert.match(tag,/data-ui-action="delete"/,file+": "+tag);destructive++;
      }
      if(tag.includes('data-ui-action="close"'))assert.doesNotMatch(tag,/aria-label="Eliminar/);
    }
  }
  assert.ok(destructive>12);
});
