// Optional, only when source artwork changes. The full resolution maps stay untouched.
import {chromium} from "playwright-core";
import {readFile,writeFile,mkdir} from "node:fs/promises";
const dir="game/art", out=dir+"/previews";
await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:"chrome"});
try {
  const page=await browser.newPage();
  for(const [source,name,width,quality] of [
    ["world-no-player","camp-cover",1024,.58],
    ["world-builder-day","fantasy",440,.72],
    ["world-earth-day","coast",440,.72],
    ["ui/nok-world-pencil-logo","camp-emblem",108,.83],
    ["ui/nok-app-icon","favicon",48,.82]
  ]){
    const input=await readFile(dir+"/"+source+".webp");
    const url=await page.evaluate(async({data,width,quality})=>{
      const img=new Image(); img.src="data:image/webp;base64,"+data; await img.decode();
      const canvas=document.createElement("canvas"); canvas.width=width;canvas.height=Math.round(img.height*width/img.width);
      const ctx=canvas.getContext("2d");ctx.imageSmoothingQuality="high";ctx.drawImage(img,0,0,canvas.width,canvas.height);
      return canvas.toDataURL("image/webp",quality);
    },{data:input.toString("base64"),width,quality});
    await writeFile(out+"/"+name+".webp",Buffer.from(url.split(",")[1],"base64"));
  }
} finally {await browser.close();}
