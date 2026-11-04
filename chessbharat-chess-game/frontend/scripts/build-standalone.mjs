// Assemble a single self-contained, offline-playable HTML file from the
// standalone IIFE bundle plus inlined portraits, fonts (already in the CSS),
// the Stockfish engine glue and its WASM. Run after:
//   npx vite build --config vite.standalone.config.ts
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const fe = resolve(here, '..');
const plugin = resolve(fe, '..');
const dist = resolve(fe, 'standalone-dist');

const css = readFileSync(resolve(dist, 'standalone.css'), 'utf8');
let js = readFileSync(resolve(dist, 'standalone.js'), 'utf8');
// Prevent an inline </script> in the bundle from closing our script tag.
js = js.replace(/<\/script>/gi, '<\\/script>');

// Portraits -> { filename: dataURI }
const portraitsDir = resolve(plugin, 'assets/portraits');
const portraits = {};
for (const f of readdirSync(portraitsDir)) {
  if (!f.endsWith('.webp')) continue;
  const b64 = readFileSync(resolve(portraitsDir, f)).toString('base64');
  portraits[f] = `data:image/webp;base64,${b64}`;
}

// Engine glue + WASM as base64 (decoded in-page into a blob worker).
const engineDir = resolve(plugin, 'assets/engine');
const glueB64 = readFileSync(resolve(engineDir, 'stockfish-19-lite-single.js')).toString('base64');
const wasmB64 = readFileSync(resolve(engineDir, 'stockfish-19-lite-single.wasm')).toString('base64');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>ChessBharat</title>
<meta name="description" content="Play chess against 11 original computer opponents. Fully offline, single file.">
<style>
  :root { color-scheme: dark; }
  html, body { margin: 0; background: #0a0e0c; min-height: 100%; }
  body { padding: 14px; }
  .cb-wrap { max-width: 1280px; margin: 0 auto; }
  .cb-hint { max-width: 1280px; margin: 0 auto 10px; color: #69726b;
    font: 12px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; letter-spacing: .02em; }
</style>
<style>${css}</style>
</head>
<body>
<p class="cb-hint">ChessBharat, offline demo. Pick an opponent and play. Everything, including the Stockfish engine, runs locally in this file.</p>
<div class="cb-wrap"><div class="chessbharat-game" data-chessbharat-root><div class="chessbharat-game-loading">Loading the board...</div></div></div>

<script type="application/json" id="cb-portraits">${JSON.stringify(portraits)}</script>
<script type="text/plain" id="sf-glue">${glueB64}</script>
<script type="text/plain" id="sf-wasm">${wasmB64}</script>
<script>window.process = window.process || { env: { NODE_ENV: 'production' } };</script>
<script>
(function () {
  function bytesFromB64(b64) { var s = atob(b64); var a = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; }
  try {
    var glueText = new TextDecoder().decode(bytesFromB64(document.getElementById('sf-glue').textContent.trim()));
    var wasmB64 = document.getElementById('sf-wasm').textContent.trim();
    // Preamble (runs first inside the worker): decode the WASM once, hand it to
    // Emscripten via Module.wasmBinary, and also intercept fetch so any attempt
    // to load the .wasm by URL returns the inlined bytes. This makes the engine
    // work from a blob worker with no network and no origin (file://).
    var preamble =
      "var __b=atob(" + JSON.stringify(wasmB64) + ");" +
      "var __w=new Uint8Array(__b.length);for(var __i=0;__i<__b.length;__i++)__w[__i]=__b.charCodeAt(__i);" +
      "self.Module={wasmBinary:__w,locateFile:function(p){return p;}};" +
      "self.fetch=function(){return Promise.resolve(new Response(__w,{status:200,headers:{'Content-Type':'application/wasm'}}));};\\n";
    var blob = new Blob([preamble, glueText], { type: 'text/javascript' });
    window.__CHESSBHARAT_ENGINE_WORKER_URL__ = URL.createObjectURL(blob);
  } catch (e) { console.warn('ChessBharat: engine inline setup failed, using fallback opponent.', e); }
  var portraits = {};
  try { portraits = JSON.parse(document.getElementById('cb-portraits').textContent); } catch (e) {}
  window.ChessBharatConfig = { assetsBase: '', portraitsBase: '', engineBase: '', restUrl: '', nonce: '', showCoordinates: true, version: 'standalone', portraits: portraits };
})();
</script>
<script>${js}</script>
</body>
</html>
`;

// Write outside the plugin folder so the large demo file is never bundled into
// the installable plugin ZIP.
const out = resolve(plugin, '..', 'play-chessbharat.html');
writeFileSync(out, html);
console.log('wrote', out, (html.length / 1048576).toFixed(2), 'MB');
