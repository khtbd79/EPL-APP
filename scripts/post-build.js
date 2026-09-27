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
              window.__PRELOADED_APP_STATE__ = val;
              try {
                localStorage.setItem('btts_app_state_v2', JSON.stringify(val));
              } catch(e) {}
            }
          };
        } catch(e) {}
      };
    } catch(e) {}
  }

  // 3. Prevent unhandled resource/network errors from bubbling up to WebViewClient
  try {
    window.addEventListener('error', function(e) {
      if (e && e.target && (e.target.tagName === 'IMG' || e.target.tagName === 'SCRIPT' || e.target.tagName === 'LINK')) {
        e.preventDefault();
      }
    }, true);
    window.addEventListener('unhandledrejection', function(e) {
      e.preventDefault();
    });
  } catch(err) {}

  // 4. Prevent accidental pinch-zoom or unwanted double-tap zoom shifts in WebView
  try {
    document.addEventListener('gesturestart', function(e) { e.preventDefault(); }, false);
  } catch (e) {}
})();
</script>
`;

// 3. Strip external Google Fonts link tags to ensure 100% offline capability
html = html.replace(/<link[^>]+fonts\.googleapis\.com[^>]*>/gi, '');
html = html.replace(/<link[^>]+fonts\.gstatic\.com[^>]*>/gi, '');

// 4. Strip external icon, manifest, and stylesheet links to prevent 404/ERR_FILE_NOT_FOUND in Android WebView
html = html.replace(/<link[^>]+rel=["']manifest["'][^>]*>/gi, '');
html = html.replace(/<link[^>]+rel=["'](?:alternate\s+)?icon["'][^>]*>/gi, '');
html = html.replace(/<link[^>]+rel=["']apple-touch-icon["'][^>]*>/gi, '');

// 5. Clean up unnecessary style attributes (like rel="stylesheet" crossorigin on <style>)
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

// Strip any residual service worker registrations so Android WebView never makes network requests for sw.js
appScriptContent = appScriptContent.replace(/navigator\.serviceWorker\.register\([^)]+\)/g, 'Promise.resolve()');

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

// 7. Inject embedded fonts, inline standalone favicon (zero external requests), and Android polyfill into <head>
const embeddedFavicon = `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%23126e51'/%3E%3Ctext x='50' y='65' font-size='32' font-weight='900' font-family='sans-serif' text-anchor='middle' fill='%23ffdf1b'%3EEPL%3C/text%3E%3C/svg%3E" />`;

const headMatch = html.match(/<head[^>]*>/i);
if (headMatch && headMatch.index !== undefined) {
  const insertPos = headMatch.index + headMatch[0].length;
  html =
    html.substring(0, insertPos) +
    '\n' +
    embeddedFontCss +
    '\n' +
    embeddedFavicon +
    '\n' +
    androidWebViewPolyfill +
    '\n' +
    html.substring(insertPos);
} else {
  html = embeddedFontCss + '\n' + embeddedFavicon + '\n' + androidWebViewPolyfill + '\n' + html;
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

// 11. Generate Windows PC Installer & WebIntoApp Offline Bundles
try {
  const iconSrc = path.join(rootDir, 'public', 'pwa-512x512.png');
  const faviconSrc = path.join(rootDir, 'public', 'favicon.ico');
  const iconSvgSrc = path.join(rootDir, 'public', 'icon.svg');

  const iconBuffer = fs.existsSync(iconSrc) ? fs.readFileSync(iconSrc) : null;
  const faviconBuffer = fs.existsSync(faviconSrc) ? fs.readFileSync(faviconSrc) : null;
  const iconSvgBuffer = fs.existsSync(iconSvgSrc) ? fs.readFileSync(iconSvgSrc) : null;

  // Primary 1-Click Windows PC Installer
  const windowsInstallerBat = `@echo off
setlocal EnableDelayedExpansion
title EPL 2026 MATCH CENTER - PC Installer
color 0A
cd /d "%~dp0"

echo ====================================================================
echo             EPL 2026 MATCH CENTER - WINDOWS PC INSTALLER
echo                         1-Click Setup Wizard
echo ====================================================================
echo.
echo [1/4] Checking installer files...
if not exist "index.html" (
    echo [ERROR] index.html not found!
    echo Please make sure you have EXTRACTED the ZIP file before running.
    echo.
    pause
    exit /b 1
)

set "INSTALL_DIR=%LOCALAPPDATA%\\Programs\\EPL2026"
echo [2/4] Installing application to:
echo       "%INSTALL_DIR%"
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

echo [3/4] Copying files to program directory...
copy /Y "index.html" "%INSTALL_DIR%\\index.html" >nul
if exist "favicon.ico" (
    copy /Y "favicon.ico" "%INSTALL_DIR%\\icon.ico" >nul
) else if exist "icon.png" (
    copy /Y "icon.png" "%INSTALL_DIR%\\icon.png" >nul
)

:: Create standalone runner script inside the installed directory
(
echo @echo off
echo cd /d "%%~dp0"
echo set "HTML_PATH=%%~dp0index.html"
echo set "FILE_URL=file:///%%HTML_PATH:\\=/%%"
echo :: Try Microsoft Edge in standalone app window mode
echo if exist "%%ProgramFiles(x86)%%\\Microsoft\\Edge\\Application\\msedge.exe" ^(
echo     start "" "%%ProgramFiles(x86)%%\\Microsoft\\Edge\\Application\\msedge.exe" --app="%%FILE_URL%%" --window-size=1540,920
echo     exit /b
echo ^)
echo if exist "%%ProgramFiles%%\\Microsoft\\Edge\\Application\\msedge.exe" ^(
echo     start "" "%%ProgramFiles%%\\Microsoft\\Edge\\Application\\msedge.exe" --app="%%FILE_URL%%" --window-size=1540,920
echo     exit /b
echo ^)
echo if exist "%%LocalAppData%%\\Microsoft\\Edge\\Application\\msedge.exe" ^(
echo     start "" "%%LocalAppData%%\\Microsoft\\Edge\\Application\\msedge.exe" --app="%%FILE_URL%%" --window-size=1540,920
echo     exit /b
echo ^)
echo :: Try Google Chrome in standalone app window mode
echo if exist "%%ProgramFiles%%\\Google\\Chrome\\Application\\chrome.exe" ^(
echo     start "" "%%ProgramFiles%%\\Google\\Chrome\\Application\\chrome.exe" --app="%%FILE_URL%%" --window-size=1540,920
echo     exit /b
echo ^)
echo if exist "%%ProgramFiles(x86)%%\\Google\\Chrome\\Application\\chrome.exe" ^(
echo     start "" "%%ProgramFiles(x86)%%\\Google\\Chrome\\Application\\chrome.exe" --app="%%FILE_URL%%" --window-size=1540,920
echo     exit /b
echo ^)
echo if exist "%%LocalAppData%%\\Google\\Chrome\\Application\\chrome.exe" ^(
echo     start "" "%%LocalAppData%%\\Google\\Chrome\\Application\\chrome.exe" --app="%%FILE_URL%%" --window-size=1540,920
echo     exit /b
echo ^)
echo :: Fallback default browser
echo start "" "%%HTML_PATH%%"
echo exit /b
) > "%INSTALL_DIR%\\run_app.bat"

:: Create VBScript launcher for silent launch (no black command prompt)
(
echo Set WshShell = CreateObject^("WScript.Shell"^)
echo strDir = CreateObject^("Scripting.FileSystemObject"^).GetParentFolderName^(WScript.ScriptFullName^)
echo WshShell.Run "cmd /c """ ^& strDir ^& "\\run_app.bat""", 0, False
) > "%INSTALL_DIR%\\run_silent.vbs"

:: Create Uninstaller
(
echo @echo off
echo title Uninstall EPL 2026
echo color 0C
echo echo ====================================================
echo echo           Uninstall EPL 2026 Match Center
echo echo ====================================================
echo echo.
echo set /p CONFIRM="Are you sure you want to uninstall EPL 2026? (Y/N): "
echo if /i not "%%CONFIRM%%"=="Y" exit /b
echo.
echo Removing Desktop shortcut...
echo del /f /q "%%USERPROFILE%%\\Desktop\\EPL 2026.lnk" 2^>nul
echo Removing Start Menu shortcut...
echo del /f /q "%%APPDATA%%\\Microsoft\\Windows\\Start Menu\\Programs\\EPL 2026.lnk" 2^>nul
echo Removing installation folder...
echo cd /d "%%LOCALAPPDATA%%\\Programs"
echo rmdir /s /q "%%LOCALAPPDATA%%\\Programs\\EPL2026" 2^>nul
echo echo EPL 2026 has been successfully uninstalled.
echo pause
echo exit /b
) > "%INSTALL_DIR%\\uninstall.bat"

echo [4/4] Creating Desktop and Start Menu Shortcuts...

:: Create temporary VBScript to make desktop & start menu shortcuts
(
echo Set WshShell = CreateObject^("WScript.Shell"^)
echo strDesktop = WshShell.SpecialFolders^("Desktop"^)
echo strPrograms = WshShell.SpecialFolders^("Programs"^)
echo strAppDir = "%INSTALL_DIR%"
echo.
echo ' Desktop shortcut
echo Set oLink = WshShell.CreateShortcut^(strDesktop ^& "\\EPL 2026.lnk"^)
echo oLink.TargetPath = strAppDir ^& "\\run_silent.vbs"
echo oLink.WorkingDirectory = strAppDir
echo oLink.Description = "EPL 2026 - Premier League Match Center"
echo If CreateObject^("Scripting.FileSystemObject"^).FileExists^(strAppDir ^& "\\icon.ico"^) Then
echo     oLink.IconLocation = strAppDir ^& "\\icon.ico, 0"
echo End If
echo oLink.Save
echo.
echo ' Start Menu shortcut
echo Set oStartLink = WshShell.CreateShortcut^(strPrograms ^& "\\EPL 2026.lnk"^)
echo oStartLink.TargetPath = strAppDir ^& "\\run_silent.vbs"
echo oStartLink.WorkingDirectory = strAppDir
echo oStartLink.Description = "EPL 2026 - Premier League Match Center"
echo If CreateObject^("Scripting.FileSystemObject"^).FileExists^(strAppDir ^& "\\icon.ico"^) Then
echo     oStartLink.IconLocation = strAppDir ^& "\\icon.ico, 0"
echo End If
echo oStartLink.Save
) > "%TEMP%\\create_epl_shortcuts.vbs"

cscript //nologo "%TEMP%\\create_epl_shortcuts.vbs"
del /f /q "%TEMP%\\create_epl_shortcuts.vbs" 2>nul

echo.
echo ====================================================================
echo   SUCCESS! EPL 2026 HAS BEEN INSTALLED ON YOUR PC!
echo ====================================================================
echo.
echo - A shortcut "EPL 2026" is now on your Desktop.
echo - It is also added to your Windows Start Menu.
echo.
echo Launching EPL 2026 now...
wscript "%INSTALL_DIR%\\run_silent.vbs"
timeout /t 3 >nul
exit /b 0
`;

  // Portable launcher (double-click to run without installing)
  const portableRunnerBat = `@echo off
title EPL 2026 MATCH CENTER
cd /d "%~dp0"
set "HTML_PATH=%~dp0index.html"
set "FILE_URL=file:///%HTML_PATH:\\=/%"

if exist "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" (
    start "" "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" --app="%FILE_URL%" --window-size=1540,920
    exit /b
)
if exist "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" (
    start "" "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" --app="%FILE_URL%" --window-size=1540,920
    exit /b
)
if exist "%LocalAppData%\\Microsoft\\Edge\\Application\\msedge.exe" (
    start "" "%LocalAppData%\\Microsoft\\Edge\\Application\\msedge.exe" --app="%FILE_URL%" --window-size=1540,920
    exit /b
)
if exist "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" (
    start "" "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" --app="%FILE_URL%" --window-size=1540,920
    exit /b
)
if exist "%LocalAppData%\\Google\\Chrome\\Application\\chrome.exe" (
    start "" "%LocalAppData%\\Google\\Chrome\\Application\\chrome.exe" --app="%FILE_URL%" --window-size=1540,920
    exit /b
)
start "" "%HTML_PATH%"
exit /b
`;

  const englishInstructions = `========================================================================
EPL 2026 MATCH CENTER - WINDOWS PC INSTALLATION GUIDE
========================================================================

Method 1: 1-Click Automatic Installer
------------------------------------------------------------
1. Extract (unzip) this ZIP file on your computer.
2. Double-click "INSTALL_EPL2026_PC.bat".
3. The installer will automatically:
   - Install EPL 2026 to %LocalAppData%\\Programs\\EPL2026
   - Place a desktop shortcut named "EPL 2026" on your Desktop
   - Add "EPL 2026" to your Windows Start Menu
   - Launch the app in native frameless desktop app mode!

Method 2: Portable Mode (Run without installing)
------------------------------------------------------------
- Just double-click "Launch_EPL2026_Portable.bat" or open "index.html".
========================================================================`;

  // 1. Create Dedicated Windows PC Bundle ZIP
  const winZip = new JSZip();
  winZip.file('INSTALL_EPL2026_PC.bat', windowsInstallerBat);
  winZip.file('Setup_EPL2026.bat', windowsInstallerBat);
  winZip.file('Launch_EPL2026_Portable.bat', portableRunnerBat);
  winZip.file('index.html', html);
  if (faviconBuffer) winZip.file('favicon.ico', faviconBuffer);
  if (iconBuffer) winZip.file('icon.png', iconBuffer);
  winZip.file('README_Windows_PC_Installation_Guide.txt', englishInstructions);

  const winZipBuffer = await winZip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(path.join(rootDir, 'dist', 'epl_windows_desktop_bundle.zip'), winZipBuffer);
  fs.writeFileSync(path.join(rootDir, 'public', 'epl_windows_desktop_bundle.zip'), winZipBuffer);
  console.log(`[post-build] epl_windows_desktop_bundle.zip generated successfully (${(winZipBuffer.length / 1024).toFixed(1)} KB).`);

  // 2. Create WebIntoApp Mobile APK Bundle ZIP
  const webIntoAppZip = new JSZip();
  webIntoAppZip.file('index.html', html);
  const manifest = {
    name: "EPL2026",
    short_name: "EPL2026",
    start_url: "index.html",
    display: "standalone",
    background_color: "#1f2228",
    theme_color: "#126e51",
    orientation: "any",
    icons: [{ src: "icon.png", sizes: "512x512", type: "image/png" }]
  };
  webIntoAppZip.file('manifest.json', JSON.stringify(manifest, null, 2));

  const configXml = `<?xml version="1.0" encoding="UTF-8"?>
<widget id="com.epl2026.app" version="1.0.0" xmlns="http://www.w3.org/ns/widgets">
    <name>EPL2026</name>
    <description>EPL2026 - Odds &amp; percentage calculator, live match select, and sports analytics</description>
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
  webIntoAppZip.file('config.xml', configXml);
  if (iconBuffer) webIntoAppZip.file('icon.png', iconBuffer);
  if (faviconBuffer) webIntoAppZip.file('favicon.ico', faviconBuffer);
  if (iconSvgBuffer) webIntoAppZip.file('icon.svg', iconSvgBuffer);

  const guideText = `========================================================================
EPL PRO MATCH CENTER - WEBINTOAPP 100% OFFLINE APK GUIDE
========================================================================

How to create your permanent Android APK without any 'Oops' or connection error:

1. Go to https://www.webintoapp.com
2. Click "Make App"
3. IMPORTANT: Select "HTML / ZIP File" (or "All in One").
4. Upload this ZIP file (webintoapp_epl_offline_bundle.zip).
5. Set App Name: "EPL Match Center"
6. Under Settings / Advanced Settings, ensure "Internet Connection Check" is OFF / Disabled.
7. Click "Make App" / "Create App" and download your APK!
========================================================================`;
  webIntoAppZip.file('README_WebIntoApp_Guide.txt', guideText);

  // Also include the Windows PC Installer inside WebIntoApp zip in case a user uses this zip on PC!
  webIntoAppZip.file('INSTALL_EPL2026_PC.bat', windowsInstallerBat);
  webIntoAppZip.file('Launch_EPL2026_Portable.bat', portableRunnerBat);

  const webIntoAppBuffer = await webIntoAppZip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(path.join(rootDir, 'dist', 'webintoapp_epl_offline_bundle.zip'), webIntoAppBuffer);
  fs.writeFileSync(path.join(rootDir, 'public', 'webintoapp_epl_offline_bundle.zip'), webIntoAppBuffer);
  console.log(`[post-build] webintoapp_epl_offline_bundle.zip generated successfully (${(webIntoAppBuffer.length / 1024).toFixed(1)} KB).`);

  // 3. Update root epl.zip to contain ALL files (both Windows PC Installer and WebIntoApp)
  try {
    const rootEplZipPath = path.join(rootDir, 'epl.zip');
    fs.writeFileSync(rootEplZipPath, webIntoAppBuffer);
    console.log(`[post-build] root epl.zip updated with offline ready-to-run bundle & Windows installer.`);
  } catch (eplErr) {
    console.warn('[post-build] Could not update root epl.zip:', eplErr.message);
  }
} catch (zipErr) {
  console.error('[post-build] Warning: Could not generate pre-built bundles:', zipErr);
}

