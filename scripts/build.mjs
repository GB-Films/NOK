import { cp, mkdir } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";
import { build } from "esbuild";
await mkdir("dist", {recursive: true});
await cp("game", "dist", {recursive: true});
await build({
  entryPoints: ["game/screen.css"], outfile: "dist/screen.css",
  bundle: true, minifyWhitespace: true,
  plugins: [{name:"keep-web-art-urls", setup(builder) {
    builder.onResolve({filter:/.*/}, args => {
      if (args.kind !== "url-token") return;
      if (/^(?:[a-z]+:|\/|#)/i.test(args.path)) return {path:args.path,external:true};
      const path=relative(resolve("game"),resolve(args.resolveDir,args.path)).split(sep).join("/");
      return {path:"./"+path,external:true};
    });
  }}]
});
await build({ entryPoints: ["game/app.js"], outfile: "dist/app.js", bundle: true, format: "iife", target: "es2022", minify: true, legalComments: "eof" });
await build({ entryPoints: ["account/entry.js"], outfile: "dist/account.js", bundle: true, format: "esm", target: "es2022", minify: true, legalComments: "eof" });
