import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const distHtmlPath = path.join(rootDir, 'dist', 'index.html');
const publicStandalonePath = path.join(rootDir, 'public', 'standalone.html');

if (!fs.existsSync(distHtmlPath)) {
  console.error('Error: dist/index.html does not exist. Run vite build first.');
  process.exit(1);
}

let html = fs.readFileSync(distHtmlPath, 'utf8');

// 1. Read embedded base64 fonts
const interB64Path = path.join(rootDir, 'inter.woff2.b64');
const jetbrainsB64Path = path.join(rootDir, 'jetbrains.woff2.b64');

let embeddedFontCss = '';
if (fs.existsSync(interB64Path) && fs.existsSync(jetbrainsB64Path)) {
  const interB64 = fs.readFileSync(interB64Path, 'utf8').trim();
  const jetbrainsB64 = fs.readFileSync(jetbrainsB64Path, 'utf8').trim();

  embeddedFontCss = `
<style id="embedded-offline-fonts">
  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 100 900;
    font-display: swap;
    src: url('data:font/woff2;base64,${interB64}') format('woff2');
  }
  @font-face {
    font-family: 'JetBrains Mono';
    font-style: normal;
    font-weight: 100 800;
    font-display: swap;
    src: url('data:font/woff2;base64,${jetbrainsB64}') format('woff2');
  }
</style>
`;
}

// 2. Android WebView Safe Storage & Execution Polyfill
const androidWebViewPolyfill = `
<script id="android-webview-compatibility">
(function() {
  // 1. Android WebView & file:// Storage Safe Polyfill (prevents DOMStorage disabled / CORS crashes)
  var storageAvailable = false;
  try {
    var testKey = '__wv_storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    storageAvailable = true;
  } catch (e) {
    storageAvailable = false;
  }

  if (!storageAvailable) {
    console.warn('[EPL] LocalStorage restricted, activating resilient storage fallback');
    var mem = {};
    var storeFallback = {
      getItem: function(k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
      setItem: function(k, v) { mem[k] = String(v); },
      removeItem: function(k) { delete mem[k]; },
      clear: function() { mem = {}; },
      key: function(i) { return Object.keys(mem)[i] || null; },
      get length() { return Object.keys(mem).length; }
    };
    try {
      Object.defineProperty(window, 'localStorage', {
        value: storeFallback,
        configurable: true,
        enumerable: true,
        writable: true
      });
    } catch(err1) {
      try { window.localStorage = storeFallback; } catch(err2) {}
    }
    try {
      Object.defineProperty(window, 'sessionStorage', {
        value: storeFallback,
        configurable: true,
        enumerable: true,
        writable: true
      });
    } catch(err3) {
      try { window.sessionStorage = storeFallback; } catch(err4) {}
    }
  }

  // 2. Immediate preload check from IndexedDB if localStorage does not have user state
  if (window.indexedDB) {
    try {
      var req = window.indexedDB.open('EPL_PRO_STORAGE_DB', 1);
      req.onupgradeneeded = function(ev) {
        var db = ev.target.result;
        if (!db.objectStoreNames.contains('app_state_store')) {
          db.createObjectStore('app_state_store');
        }
      };
      req.onsuccess = function(ev) {
        try {
          var db = ev.target.result;
          var tx = db.transaction(['app_state_store'], 'readonly');
          var getReq = tx.objectStore('app_state_store').get('current_app_state');
          getReq.onsuccess = function() {
            var val = getReq.result;
            if (val && typeof val === 'object') {
              if (!window.__PRELOADED_APP_STATE__) {
                window.__PRELOADED_APP_STATE__ = val;
              }
              try {
                if (!localStorage.getItem('btts_app_state_v2')) {
                  localStorage.setItem('btts_app_state_v2', JSON.stringify(val));
                }
              } catch(e) {}
            }
          };
        } catch(e) {}
      };
    } catch(e) {}
  }

  // 3. Prevent accidental pinch-zoom or unwanted double-tap zoom shifts in WebView
  try {
    document.addEventListener('gesturestart', function(e) { e.preventDefault(); }, false);
  } catch (e) {}
})();
</script>
`;

// 3. Strip external Google Fonts link tags to ensure 100% offline capability
html = html.replace(/<link[^>]+fonts\.googleapis\.com[^>]*>/gi, '');
html = html.replace(/<link[^>]+fonts\.gstatic\.com[^>]*>/gi, '');

// 4. Clean up unnecessary style attributes (like rel="stylesheet" crossorigin on <style>)
html = html.replace(/<style\s+rel=["']stylesheet["']\s+crossorigin>/gi, '<style>');

// 5. Extract the main application bundle script (Vite singlefile places it in <head> or <body> with type="module")
// We will convert it to a 100% classic non-module script and move it to the bottom of <body>
const scriptTagRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
const allScripts = [...html.matchAll(scriptTagRegex)];

let appScriptContent = '';
let appScriptTag = '';

for (const match of allScripts) {
  const fullTag = match[0];
  const attrs = match[1];
  const content = match[2];

  if (attrs.includes('android-webview-compatibility')) {
    continue;
  }

  // Pick the largest script (the real bundle)
  if (content.length > appScriptContent.length) {
    appScriptContent = content;
    appScriptTag = fullTag;
  }
}

if (appScriptTag) {
  html = html.replace(appScriptTag, '');
} else {
  console.error('[post-build] Error: Could not find main bundle script in HTML!');
}

// 6. Remove Vite modulepreload polyfill if present (not needed for classic non-module script)
appScriptContent = appScriptContent.replace(/\(function\(\)\{const [A-Za-z]=document\.createElement\("link"\)\.relList;[\s\S]*?fetch\([A-Za-z]\.href,[A-Za-z]\)\}\}\)\(\);?/g, '');

// Neutralize any import.meta or import.meta.url so classic script execution never throws SyntaxError
appScriptContent = appScriptContent.replace(/\bimport\.meta\.url\b/g, "(typeof document !== 'undefined' ? (document.baseURI || window.location.href) : '')");
appScriptContent = appScriptContent.replace(/\bimport\.meta\b/g, "({url: (typeof document !== 'undefined' ? (document.baseURI || window.location.href) : '')})");

// Hex-escape any internal "<script", "</script>", "<body", or "<head" inside JS string literals so they never trick HTML parsers
appScriptContent = appScriptContent.replace(/<script/gi, () => '\\x3cscript');
appScriptContent = appScriptContent.replace(/<\/script>/gi, () => '\\x3c/script>');
appScriptContent = appScriptContent.replace(/<body/gi, () => '\\x3cbody');
appScriptContent = appScriptContent.replace(/<\/body>/gi, () => '\\x3c/body>');
appScriptContent = appScriptContent.replace(/<head/gi, () => '\\x3chead');
appScriptContent = appScriptContent.replace(/<\/head>/gi, () => '\\x3c/head>');

// Verify JS bundle syntax - FATAL if invalid so broken scripts never reach dist
try {
  new Function(appScriptContent);
  console.log('[post-build] Application bundle JS syntax: 100% VALID');
} catch (syntaxErr) {
  console.error('[post-build] FATAL: Application bundle has syntax error:', syntaxErr.message);
  process.exit(1);
}

// 7. Inject embedded fonts and Android polyfill into <head>
const headMatch = html.match(/<head[^>]*>/i);
if (headMatch && headMatch.index !== undefined) {
  const insertPos = headMatch.index + headMatch[0].length;
  html =
    html.substring(0, insertPos) +
    '\n' +
    embeddedFontCss +
    '\n' +
    androidWebViewPolyfill +
    '\n' +
    html.substring(insertPos);
} else {
  html = embeddedFontCss + '\n' + androidWebViewPolyfill + '\n' + html;
}

// 8. Relocate the clean classic application <script> to the bottom of <body>, immediately before the LAST </body>
const cleanAppScript = `<script id="epl-app-bundle">\n${appScriptContent}\n</script>`;
const lastBodyIndex = html.lastIndexOf('</body>');
if (lastBodyIndex !== -1) {
  html =
    html.substring(0, lastBodyIndex) +
    '\n' +
    cleanAppScript +
    '\n' +
    html.substring(lastBodyIndex);
} else {
  html = html + '\n' + cleanAppScript;
}

// 9. Ensure root document has optimal styling & meta tags
if (!html.includes('viewport-fit=cover')) {
  html = html.replace(/name=["']viewport["'][^>]*>/i, 'name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">');
}

// 10. Validate output HTML structure
const rootPresent = html.includes('id="root"') || html.includes("id='root'");
const headOpenCount = (html.match(/<head\b/gi) || []).length;
const headCloseCount = (html.match(/<\/head>/gi) || []).length;
const bodyOpenCount = (html.match(/<body\b/gi) || []).length;
const bodyCloseCount = (html.match(/<\/body>/gi) || []).length;

if (!rootPresent || headOpenCount !== 1 || headCloseCount !== 1 || bodyOpenCount !== 1 || bodyCloseCount !== 1) {
  console.warn(`[post-build] Warning: Unexpected HTML structure:`, {
    rootPresent,
    headOpenCount,
    headCloseCount,
    bodyOpenCount,
    bodyCloseCount
  });
}

// Write back to dist/index.html
fs.writeFileSync(distHtmlPath, html, 'utf8');
console.log(`[post-build] dist/index.html updated successfully (${(html.length / 1024).toFixed(1)} KB).`);

// Also update dist/standalone.html
const distStandalonePath = path.join(rootDir, 'dist', 'standalone.html');
fs.writeFileSync(distStandalonePath, html, 'utf8');

// Also update public/standalone.html
fs.mkdirSync(path.dirname(publicStandalonePath), { recursive: true });
fs.writeFileSync(publicStandalonePath, html, 'utf8');
console.log(`[post-build] public/standalone.html updated successfully.`);

// 11. Generate WebIntoApp offline bundle ZIP for instant 1-click download
try {
  const zip = new JSZip();
  zip.file('index.html', html);

  const manifest = {
    name: "EPL Match Center",
    short_name: "EPL",
    start_url: "index.html",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#dc2626",
    orientation: "any"
  };
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  const configXml = `<?xml version="1.0" encoding="UTF-8"?>
<widget id="com.epl.matchcenter" version="1.0.0" xmlns="http://www.w3.org/ns/widgets">
    <name>EPL Match Center</name>
    <description>EPL Match Task, Category Rankings and Pro Journal</description>
    <content src="index.html" />
    <access origin="*" />
    <preference name="Orientation" value="default" />
    <preference name="Fullscreen" value="false" />
    <preference name="AllowUniversalAccessFromFileURLs" value="true" />
    <preference name="AllowFileAccessFromFileURLs" value="true" />
    <preference name="MixedContentMode" value="0" />
    <preference name="DomStorageEnabled" value="true" />
    <preference name="DatabaseEnabled" value="true" />
    <icon src="icon.png" />
</widget>`;
  zip.file('config.xml', configXml);

  const iconSrc = path.join(rootDir, 'public', 'pwa-512x512.png');
  if (fs.existsSync(iconSrc)) {
    zip.file('icon.png', fs.readFileSync(iconSrc));
  }

  const guideText = `========================================================================
EPL PRO MATCH CENTER - WEBINTOAPP 100% OFFLINE APK GUIDE
========================================================================

How to create your permanent Android APK without any 'Oops' or connection error:

1. Go to https://www.webintoapp.com
2. Click "Make App"
3. IMPORTANT: Select "HTML / ZIP File" (DO NOT choose "Website URL")
4. Upload this ZIP file (webintoapp_epl_offline_bundle.zip)
5. Set App Name: "EPL Match Center"
6. Click "Make App" / "Create App" and download your APK!

Why this works permanently:
- This package bundles 100% of the app, CSS, JS, crests, and fonts inside index.html.
- The APK will load directly from the device storage (file:///android_asset/index.html).
- Zero external server calls. Zero internet required. It will NEVER show connection errors!
========================================================================`;
  zip.file('README_WebIntoApp_Guide.txt', guideText);

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(path.join(rootDir, 'dist', 'webintoapp_epl_offline_bundle.zip'), zipBuffer);
  fs.writeFileSync(path.join(rootDir, 'public', 'webintoapp_epl_offline_bundle.zip'), zipBuffer);
  console.log(`[post-build] webintoapp_epl_offline_bundle.zip generated successfully (${(zipBuffer.length / 1024).toFixed(1)} KB).`);
} catch (zipErr) {
  console.error('[post-build] Warning: Could not generate pre-built webintoapp zip:', zipErr);
}

