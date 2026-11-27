import { cp, mkdir } from "node:fs/promises";
import { build } from "esbuild";
await mkdir("dist", {recursive: true});
await cp("game", "dist", {recursive: true});
await build({ entryPoints: ["account/entry.js"], outfile: "dist/account.js", bundle: true, format: "esm", target: "es2022", minify: true, legalComments: "eof" });
