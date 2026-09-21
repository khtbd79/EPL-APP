import JSZip from 'jszip';
import { AppState } from '../types';

// Decode tag tokens dynamically at runtime to prevent bundlers from constant-folding tags into bundle strings
const b64 = (s: string) => (typeof atob !== 'undefined' ? atob(s) : Buffer.from(s, 'base64').toString('utf8'));

/**
 * Strict validation rule for production standalone HTML bundle:
 * Ensures the bundle is 100% self-contained, valid HTML, and has NO dev runtime traces.
 */
export function validateStandaloneHtmlBundle(html: string): { isValid: boolean; error?: string } {
  if (!html || typeof html !== 'string' || html.trim().length < 5000) {
    return {
      isValid: false,
      error: 'App export failed. The standalone application bundle could not be generated.'
    };
  }

  const lower = html.toLowerCase();

  const tagHtmlOpen = b64('PGh0bWw=');
  const tagHtmlClose = b64('PC9odG1sPg==');
  const tagHeadOpen = b64('PGhlYWQ=');
  const tagHeadClose = b64('PC9oZWFkPg==');
  const tagBodyOpen = b64('PGJvZHk=');
  const tagBodyClose = b64('PC9ib2R5Pg==');
  const tagScriptOpen = b64('PHNjcmlwdA==');
  const tagScriptClose = b64('PC9zY3JpcHQ+');

  // 1. Root and standard DOM document checks
  if (!lower.includes(tagHtmlOpen) || !lower.includes(tagHtmlClose)) {
    return {
      isValid: false,
      error: 'App export failed. The bundle is missing a complete <html> document.'
    };
  }
  if (!lower.includes(tagHeadOpen) || !lower.includes(tagHeadClose)) {
    return {
      isValid: false,
      error: 'App export failed. The bundle is missing document head.'
    };
  }
  if (!lower.includes(tagBodyOpen) || !lower.includes(tagBodyClose)) {
    return {
      isValid: false,
      error: 'App export failed. The bundle is missing document body.'
    };
  }
  if (!html.includes('id="root"') && !html.includes("id='root'")) {
    return {
      isValid: false,
      error: 'App export failed. Root mounting container is missing.'
    };
  }

  // 2. Bundled JavaScript presence check
  if (!lower.includes(tagScriptOpen) || !lower.includes(tagScriptClose)) {
    return {
      isValid: false,
      error: 'App export failed. Application JavaScript bundle is missing.'
    };
  }

  // 3. Strict Dev-only blacklist checks
  // Must NOT have unbundled /src/ dev script entry point tag
  const devScriptRegex = new RegExp(['<', 's', 'c', 'r', 'i', 'p', 't', '[^>]+src\\s*=\\s*[\'"][^\'"]*\\/src\\/[^\'"]*[\'"]'].join(''), 'i');
  const devLinkRegex = new RegExp(['<', 'l', 'i', 'n', 'k', '[^>]+href\\s*=\\s*[\'"][^\'"]*\\/src\\/[^\'"]*[\'"]'].join(''), 'i');
  if (devScriptRegex.test(html) || devLinkRegex.test(html)) {
    return {
      isValid: false,
      error: 'App export failed. Detected unbundled /src/ development entry point.'
    };
  }

  // Must NOT contain Vite dev runtime script references (encoded to prevent self-matching in bundle)
  const viteToken1 = ['/', '@', 'v', 'i', 't', 'e', '/'].join('');
  const viteToken2 = ['/', '@', 'f', 's', '/'].join('');
  const viteToken3 = ['/', '@', 'i', 'd', '/'].join('');
  const viteToken4 = ['v', 'i', 't', 'e', '/', 'c', 'l', 'i', 'e', 'n', 't'].join('');
  if (
    html.includes(viteToken1) ||
    html.includes(viteToken2) ||
    html.includes(viteToken3) ||
    html.includes(viteToken4)
  ) {
    return {
      isValid: false,
      error: 'App export failed. Detected development Vite runtime dependencies.'
    };
  }

  // Must NOT contain localhost / 127.0.0.1 development server bindings (encoded to prevent self-matching)
  const locToken1 = ['h', 't', 't', 'p', ':', '/', '/', 'l', 'o', 'c', 'a', 'l', 'h', 'o', 's', 't'].join('');
  const locToken2 = ['h', 't', 't', 'p', ':', '/', '/', '1', '2', '7', '.', '0', '.', '0', '.', '1'].join('');
  const locPortRegex = new RegExp(['l', 'o', 'c', 'a', 'l', 'h', 'o', 's', 't', ':', '\\d+'].join(''), 'i');
  const ipPortRegex = new RegExp(['1', '2', '7', '\\.', '0', '\\.', '0', '\\.', '1', ':', '\\d+'].join(''), 'i');
  if (
    html.includes(locToken1) ||
    html.includes(locToken2) ||
    locPortRegex.test(html) ||
    ipPortRegex.test(html)
  ) {
    return {
      isValid: false,
      error: 'App export failed. Detected localhost or development server references.'
    };
  }

  // Must NOT contain unhandled dev fetch fallbacks in bundle scripts
  const fetchToken1 = ['f', 'e', 't', 'c', 'h', '(', '"', '/', '"', ')'].join('');
  const fetchToken2 = ['f', 'e', 't', 'c', 'h', '(', "'", '/', "'", ')'].join('');
  const fetchToken3 = ['f', 'e', 't', 'c', 'h', '(', '"', '/', 's', 't', 'a', 'n', 'd', 'a', 'l', 'o', 'n', 'e', '.', 'h', 't', 'm', 'l', '"', ')'].join('');
  const fetchToken4 = ['f', 'e', 't', 'c', 'h', '(', "'", '/', 's', 't', 'a', 'n', 'd', 'a', 'l', 'o', 'n', 'e', '.', 'h', 't', 'm', 'l', "'", ')'].join('');
  if (
    html.includes(fetchToken1) ||
    html.includes(fetchToken2) ||
    html.includes(fetchToken3) ||
    html.includes(fetchToken4)
  ) {
    return {
      isValid: false,
      error: 'App export failed. Detected dynamic server fetch dependencies in bundle.'
    };
  }

  return { isValid: true };
}

/**
 * Retrieves the compiled single-file React bundle (/standalone.html)
 * and pre-injects the user's current AppState into localstorage.
 * NEVER falls back to unbundled development DOM.
 */
export async function getStandaloneHTMLContent(currentState: AppState): Promise<string> {
  let baseHtml = '';

  // 1. In browser environment, load the verified pre-bundled standalone.html
  if (typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http')) {
    const standaloneFileName = ['s', 't', 'a', 'n', 'd', 'a', 'l', 'o', 'n', 'e', '.', 'h', 't', 'm', 'l'].join('');
    const cacheBust = `?t=${Date.now()}`;
    try {
      const res = await fetch('./' + standaloneFileName + cacheBust, { cache: 'no-store' });
      if (res.ok) {
        const text = await res.text();
        const check = validateStandaloneHtmlBundle(text);
        if (check.isValid) {
          baseHtml = text;
        }
      }
    } catch {
      // Ignored
    }

    // Secondary attempt from root path
    if (!baseHtml) {
      try {
        const res = await fetch('/' + standaloneFileName + cacheBust, { cache: 'no-store' });
        if (res.ok) {
          const text = await res.text();
          const check = validateStandaloneHtmlBundle(text);
          if (check.isValid) {
            baseHtml = text;
          }
        }
      } catch {
        // Ignored
      }
    }
  }

  // 2. If running directly inside an already-bundled standalone APK / file://,
  // document.documentElement is already the compiled bundle.
  // Validate strictly before using — NEVER use if it contains dev traces.
  if (!baseHtml) {
    if (typeof document !== 'undefined' && document.documentElement) {
      const doctype = document.doctype
        ? `<!DOCTYPE ${document.doctype.name}${document.doctype.publicId ? ` PUBLIC "${document.doctype.publicId}"` : ''}${!document.doctype.publicId && document.doctype.systemId ? ' SYSTEM' : ''}${document.doctype.systemId ? ` "${document.doctype.systemId}"` : ''}>\n`
        : '<!DOCTYPE html>\n';
      const docHtml = doctype + document.documentElement.outerHTML;
      const check = validateStandaloneHtmlBundle(docHtml);
      if (check.isValid) {
        baseHtml = docHtml;
      }
    }
  }

  // 3. If verified standalone bundle could not be obtained:
  // DO NOT create a broken fallback. Throw explicit error.
  if (!baseHtml) {
    throw new Error('App export failed. The standalone application bundle could not be generated.');
  }

  // Inject script to pre-set user's state into LocalStorage and window memory
  const safeStateJson = JSON.stringify(currentState)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

  const sOpen = b64('PHNjcmlwdD4=');
  const sClose = b64('PC9zY3JpcHQ+');
  const scriptBody = [
    '(function() {',
    '  try {',
    "    var key = 'btts_app_state_v2';",
    "    var backupKey = 'btts_app_backup_state_v2';",
    "    var legacyKey = 'btts_app_state_v1';",
    '    var preloaded = ' + safeStateJson + ';',
    '    if (preloaded) {',
    '      window.__PRELOADED_APP_STATE__ = preloaded;',
    '      try { localStorage.setItem(key, JSON.stringify(preloaded)); } catch(e) {}',
    '      try { localStorage.setItem(backupKey, JSON.stringify(preloaded)); } catch(e) {}',
    '      try { sessionStorage.setItem(key, JSON.stringify(preloaded)); } catch(e) {}',
    '      if (window.indexedDB) {',
    "        try {",
    "          var req = window.indexedDB.open('EPL_PRO_STORAGE_DB', 1);",
    "          req.onupgradeneeded = function(ev) {",
    "            var db = ev.target.result;",
    "            if (!db.objectStoreNames.contains('app_state_store')) {",
    "              db.createObjectStore('app_state_store');",
    "            }",
    "          };",
    "          req.onsuccess = function(ev) {",
    "            try {",
    "              var db = ev.target.result;",
    "              var tx = db.transaction(['app_state_store'], 'readwrite');",
    "              tx.objectStore('app_state_store').put(preloaded, 'current_app_state');",
    "            } catch(txErr) {}",
    "          };",
    "        } catch(idbErr) {}",
    '      }',
    '    }',
    '  } catch (e) {',
    "    console.error('Failed to set initial state:', e);",
    '  }',
    '})();'
  ].join('\n');

  const preloadedScript = sOpen + '\n' + scriptBody + '\n' + sClose;

  const headMatch = baseHtml.match(new RegExp(['<', 'h', 'e', 'a', 'd', '[^>]*>'].join(''), 'i'));
  let finalHtml = '';
  if (headMatch && headMatch.index !== undefined) {
    const insertPos = headMatch.index + headMatch[0].length;
    finalHtml =
      baseHtml.substring(0, insertPos) +
      '\n' +
      preloadedScript +
      '\n' +
      baseHtml.substring(insertPos);
  } else {
    finalHtml = preloadedScript + '\n' + baseHtml;
  }

  // Final safety: ensure any residual type="module" is converted to universal classic script
  const scriptModuleRegex1 = new RegExp(['<', 's', 'c', 'r', 'i', 'p', 't', '\\s+type=["\']module["\']\\s+crossorigin>'].join(''), 'gi');
  const scriptModuleRegex2 = new RegExp(['<', 's', 'c', 'r', 'i', 'p', 't', '\\s+type=["\']module["\']>'].join(''), 'gi');
  const cleanScriptTag = ['<', 's', 'c', 'r', 'i', 'p', 't', '>'].join('');
  finalHtml = finalHtml.replace(scriptModuleRegex1, cleanScriptTag);
  finalHtml = finalHtml.replace(scriptModuleRegex2, cleanScriptTag);

  // Strip any broken external icon/manifest links to prevent 404 in Android WebView file:///
  finalHtml = finalHtml.replace(/<link[^>]+rel=["']manifest["'][^>]*>/gi, '');
  finalHtml = finalHtml.replace(/<link[^>]+rel=["'](?:alternate\s+)?icon["'][^>]*>/gi, '');
  finalHtml = finalHtml.replace(/<link[^>]+rel=["']apple-touch-icon["'][^>]*>/gi, '');

  // Embed standalone inline SVG favicon and icon.png
  const safeFaviconTag = `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%23dc2626'/%3E%3Ctext x='50' y='68' font-size='60' text-anchor='middle'%3E%E2%9A%BD%3C/text%3E%3C/svg%3E" />\n<link rel="icon" type="image/png" href="icon.png" />`;
  if (finalHtml.includes('</head>')) {
    finalHtml = finalHtml.replace('</head>', safeFaviconTag + '\n</head>');
  }

  // Neutralize any import.meta or import.meta.url so classic script execution never throws SyntaxError
  finalHtml = finalHtml.replace(/\bimport\.meta\.url\b/g, "(typeof document !== 'undefined' ? (document.baseURI || window.location.href) : '')");
  finalHtml = finalHtml.replace(/\bimport\.meta\b/g, "({url: (typeof document !== 'undefined' ? (document.baseURI || window.location.href) : '')})");

  // Final rigorous validation check
  const finalCheck = validateStandaloneHtmlBundle(finalHtml);
  if (!finalCheck.isValid) {
    throw new Error(finalCheck.error || 'App export failed. The standalone application bundle could not be generated.');
  }

  return finalHtml;
}

async function generateAppIconBlob(): Promise<Blob | null> {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#dc2626');
    grad.addColorStop(1, '#991b1b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 16;
    ctx.strokeRect(12, 12, 488, 488);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(256, 200, 110, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 100px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚽', 256, 200);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText('EPL', 256, 370);

    ctx.fillStyle = '#fecaca';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('PRO MATCH CENTER', 256, 430);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  } catch (e) {
    console.error('Failed to generate icon blob:', e);
    return null;
  }
}

/**
 * Downloads the high-resolution 512x512 app icon PNG directly.
 * Perfect for uploading to WebIntoApp as the app launcher icon.
 */
export async function downloadAppIconPng(): Promise<void> {
  try {
    const iconBlob = await generateAppIconBlob();
    if (!iconBlob) throw new Error('Failed to generate app icon');
    const url = URL.createObjectURL(iconBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'app_icon_512x512.png';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
    }, 500);
  } catch (err) {
    console.error('Failed to download icon:', err);
    throw err;
  }
}

/**
 * Downloads a standalone single-file HTML version of the app.
 * Contains 100% of full React app, Tailwind styles, icons, modals, logic & state!
 */
export async function downloadStandaloneHtmlApp(currentState: AppState): Promise<void> {
  try {
    const htmlContent = await getStandaloneHTMLContent(currentState);

    // Validate before downloading
    const check = validateStandaloneHtmlBundle(htmlContent);
    if (!check.isValid) {
      console.error(check.error || 'App export failed. The standalone application bundle could not be generated.');
      throw new Error(check.error || 'App export failed.');
    }

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `epl_standalone_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
    }, 500);
  } catch (err: any) {
    console.error('Failed to generate HTML export:', err);
    throw err;
  }
}

/**
 * Converts a PNG Blob into a valid Windows .ICO icon format Blob.
 * Supported natively by Windows Vista, 7, 8, 10, and 11.
 */
async function createIcoFromPngBlob(pngBlob: Blob): Promise<Blob> {
  try {
    const pngBuffer = await pngBlob.arrayBuffer();
    const pngBytes = new Uint8Array(pngBuffer);
    const icoHeader = new Uint8Array(22);

    // Reserved (2 bytes, must be 0)
    icoHeader[0] = 0;
    icoHeader[1] = 0;
    // Resource type (1 for ICO)
    icoHeader[2] = 1;
    icoHeader[3] = 0;
    // Number of images (1)
    icoHeader[4] = 1;
    icoHeader[5] = 0;

    // ICONDIRENTRY (16 bytes)
    icoHeader[6] = 64; // width (64px)
    icoHeader[7] = 64; // height (64px)
    icoHeader[8] = 0;  // palette colors (0 = no palette)
    icoHeader[9] = 0;  // reserved
    icoHeader[10] = 1; // color planes
    icoHeader[11] = 0;
    icoHeader[12] = 32; // bits per pixel (32-bit RGBA)
    icoHeader[13] = 0;

    // Image size in bytes (4 bytes, little-endian)
    const size = pngBytes.length;
    icoHeader[14] = size & 0xFF;
    icoHeader[15] = (size >> 8) & 0xFF;
    icoHeader[16] = (size >> 16) & 0xFF;
    icoHeader[17] = (size >> 24) & 0xFF;

    // Image data offset (22 bytes, little-endian)
    icoHeader[18] = 22;
    icoHeader[19] = 0;
    icoHeader[20] = 0;
    icoHeader[21] = 0;

    return new Blob([icoHeader, pngBytes], { type: 'image/x-icon' });
  } catch (e) {
    console.error('Failed to convert PNG to ICO:', e);
    return pngBlob;
  }
}

/**
 * Generates a complete standalone Windows Desktop Application ZIP package (.zip).
 * Includes index.html, 1-click automatic zero-command batch installer that compiles
 * native "EPL-Manager.exe", creates a Windows Desktop shortcut with icon, and launches the app!
 */
export async function downloadWindowsDesktopZip(currentState: AppState): Promise<void> {
  try {
    const zip = new JSZip();
    const htmlContent = await getStandaloneHTMLContent(currentState);

    const check = validateStandaloneHtmlBundle(htmlContent);
    if (!check.isValid) {
      console.error(check.error || 'App export failed.');
      throw new Error(check.error || 'App export failed.');
    }

    // 1. Root index.html bundle
    zip.file('index.html', htmlContent);

    // 2. Automated 1-Click Zero-Command Installer & EXE Generator (.bat)
    const autoInstallerBat = `@echo off
color 0A
title EPL - PRO MATCH CENTER (PC Installer)
cd /d "%~dp0"

echo ====================================================================
echo   EPL - PRO MATCH CENTER : 1-CLICK PC INSTALLER ^& RUNNER
echo ====================================================================
echo.
echo [1/3] Searching for Windows .NET Compiler...

set CSC=
if exist "%SystemRoot%\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe" set CSC="%SystemRoot%\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe"
if not defined CSC if exist "%SystemRoot%\\Microsoft.NET\\Framework\\v4.0.30319\\csc.exe" set CSC="%SystemRoot%\\Microsoft.NET\\Framework\\v4.0.30319\\csc.exe"
if not defined CSC if exist "%SystemRoot%\\Microsoft.NET\\Framework64\\v3.5\\csc.exe" set CSC="%SystemRoot%\\Microsoft.NET\\Framework64\\v3.5\\csc.exe"
if not defined CSC if exist "%SystemRoot%\\Microsoft.NET\\Framework\\v3.5\\csc.exe" set CSC="%SystemRoot%\\Microsoft.NET\\Framework\\v3.5\\csc.exe"

if defined CSC (
    echo [2/3] Building standalone "EPL-Manager.exe"...
    if exist icon.ico (
        %CSC% /nologo /target:winexe /out:"EPL-Manager.exe" /win32icon:icon.ico launcher.cs >nul 2>&1
    ) else (
        %CSC% /nologo /target:winexe /out:"EPL-Manager.exe" launcher.cs >nul 2>&1
    )
    if exist "EPL-Manager.exe" (
        echo [OK] "EPL-Manager.exe" successfully built!
    )
) else (
    echo [2/3] Configuring standalone desktop mode...
)

echo [3/3] Creating Desktop Shortcut...
cscript //nologo make_shortcut.vbs

echo.
echo ====================================================================
echo   Installation complete! Launching EPL Manager...
echo ====================================================================
echo.

if exist "EPL-Manager.exe" (
    start "" "%~dp0EPL-Manager.exe"
) else (
    cscript //nologo Launch-Silent-App.vbs
)

timeout /t 2 >nul
exit /b
`;
    // Add primary click file with clear name
    zip.file('CLICK_TO_INSTALL_AND_RUN.bat', autoInstallerBat);
    zip.file('INSTALL_EPL_MANAGER.bat', autoInstallerBat);

    // 3. C# Launcher source file for built-in csc.exe compiler
    const csharpLauncherSource = `using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

namespace EPLManager {
    static class Program {
        [STAThread]
        static void Main() {
            try {
                string currentDir = AppDomain.CurrentDomain.BaseDirectory;
                string htmlFile = Path.Combine(currentDir, "index.html");

                if (!File.Exists(htmlFile)) {
                    MessageBox.Show("index.html file not found in: " + currentDir, "EPL Manager Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    return;
                }

                string fileUrl = "file:///" + htmlFile.Replace('\\', '/');

                // Check for Chromium-based modern browsers to run in dedicated native app window
                string[] browserPaths = new string[] {
                    Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86) + @"\Microsoft\Edge\Application\msedge.exe",
                    Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles) + @"\Microsoft\Edge\Application\msedge.exe",
                    Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles) + @"\Google\Chrome\Application\chrome.exe",
                    Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86) + @"\Google\Chrome\Application\chrome.exe",
                    Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles) + @"\BraveSoftware\Brave-Browser\Application\brave.exe",
                    Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData) + @"\Google\Chrome\Application\chrome.exe",
                    Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData) + @"\Microsoft\Edge\Application\msedge.exe"
                };

                foreach (string browser in browserPaths) {
                    if (File.Exists(browser)) {
                        ProcessStartInfo psi = new ProcessStartInfo();
                        psi.FileName = browser;
                        psi.Arguments = "--app=\"" + fileUrl + "\" --window-size=1366,850";
                        psi.UseShellExecute = false;
                        Process.Start(psi);
                        return;
                    }
                }

                // Fallback to default system handler
                ProcessStartInfo defaultPsi = new ProcessStartInfo();
                defaultPsi.FileName = htmlFile;
                defaultPsi.UseShellExecute = true;
                Process.Start(defaultPsi);
            }
            catch (Exception ex) {
                MessageBox.Show("Error launching application: " + ex.Message, "EPL Manager", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        }
    }
}
`;
    zip.file('launcher.cs', csharpLauncherSource);

    // 4. Desktop Shortcut Creator Script (make_shortcut.vbs)
    const makeShortcutVbs = `Set WshShell = CreateObject("WScript.Shell")
strDesktop = WshShell.SpecialFolders("Desktop")
strCurrentDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)

Set oShellLink = WshShell.CreateShortcut(strDesktop & "\\EPL - Pro Match Center.lnk")
If CreateObject("Scripting.FileSystemObject").FileExists(strCurrentDir & "\\EPL-Manager.exe") Then
    oShellLink.TargetPath = strCurrentDir & "\\EPL-Manager.exe"
ElseIf CreateObject("Scripting.FileSystemObject").FileExists(strCurrentDir & "\\Launch-Silent-App.vbs") Then
    oShellLink.TargetPath = strCurrentDir & "\\Launch-Silent-App.vbs"
Else
    oShellLink.TargetPath = strCurrentDir & "\\EPL-Manager-Desktop.bat"
End If

oShellLink.WorkingDirectory = strCurrentDir
oShellLink.WindowStyle = 1
oShellLink.Description = "EPL Pro Match Center Desktop Application"
If CreateObject("Scripting.FileSystemObject").FileExists(strCurrentDir & "\\icon.ico") Then
    oShellLink.IconLocation = strCurrentDir & "\\icon.ico, 0"
End If
oShellLink.Save
`;
    zip.file('make_shortcut.vbs', makeShortcutVbs);

    // 5. Windows 1-Click Desktop Launcher (.bat)
    const batContent = `@echo off
title EPL - PRO MATCH CENTER
cd /d "%~dp0"

:: If .exe already compiled, launch .exe
if exist "%~dp0EPL-Manager.exe" (
    start "" "%~dp0EPL-Manager.exe"
    exit /b
)

:: 1. Check Microsoft Edge (Built-in on all Windows 10 & 11) for native app-window mode
if exist "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" (
    start "" "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" --app="%~dp0index.html" --allow-file-access-from-files --window-size=1540,920
    exit /b
)
if exist "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" (
    start "" "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" --app="%~dp0index.html" --allow-file-access-from-files --window-size=1540,920
    exit /b
)
if exist "%LocalAppData%\\Microsoft\\Edge\\Application\\msedge.exe" (
    start "" "%LocalAppData%\\Microsoft\\Edge\\Application\\msedge.exe" --app="%~dp0index.html" --allow-file-access-from-files --window-size=1540,920
    exit /b
)

:: 2. Check Google Chrome
if exist "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" (
    start "" "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" --app="%~dp0index.html" --allow-file-access-from-files --window-size=1540,920
    exit /b
)
if exist "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" (
    start "" "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" --app="%~dp0index.html" --allow-file-access-from-files --window-size=1540,920
    exit /b
)
if exist "%LocalAppData%\\Google\\Chrome\\Application\\chrome.exe" (
    start "" "%LocalAppData%\\Google\\Chrome\\Application\\chrome.exe" --app="%~dp0index.html" --allow-file-access-from-files --window-size=1540,920
    exit /b
)

:: 3. Check Brave Browser
if exist "%ProgramFiles%\\BraveSoftware\\Brave-Browser\\Application\\brave.exe" (
    start "" "%ProgramFiles%\\BraveSoftware\\Brave-Browser\\Application\\brave.exe" --app="%~dp0index.html" --allow-file-access-from-files --window-size=1540,920
    exit /b
)

:: 4. Fallback to default browser
start "" "%~dp0index.html"
exit /b
`;
    zip.file('EPL-Manager-Desktop.bat', batContent);
    zip.file('Launch_EPL_App.bat', batContent);
    zip.file('1_CLICK_RUN_APP.bat', batContent);

    // 6. Silent Launcher (.vbs) - Runs without command prompt black window
    const vbsContent = `Set WshShell = CreateObject("WScript.Shell")
strDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
If CreateObject("Scripting.FileSystemObject").FileExists(strDir & "\\EPL-Manager.exe") Then
    WshShell.Run """" & strDir & "\\EPL-Manager.exe""", 1, False
Else
    WshShell.Run "cmd /c """ & strDir & "\\EPL-Manager-Desktop.bat""", 0, False
End If
`;
    zip.file('Launch-Silent-App.vbs', vbsContent);

    // 7. Electron Desktop process script (optional backup for developers)
    const electronMain = `const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1366,
    height: 850,
    minWidth: 1024,
    minHeight: 700,
    title: 'EPL - Pro Match Center',
    backgroundColor: '#ffffff',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
`;
    zip.file('electron-main.js', electronMain);

    // 8. Electron package.json for building .exe
    const electronPkg = {
      name: "epl-pro-match-center",
      version: "1.0.0",
      description: "EPL Pro Match Center Windows Desktop App",
      main: "electron-main.js",
      scripts: {
        start: "electron .",
        "build:exe": "npx electron-builder --win portable --x64"
      },
      devDependencies: {
        electron: "^33.0.0",
        "electron-builder": "^25.0.0"
      },
      build: {
        appId: "com.epl.matchcenter",
        productName: "EPL Manager",
        win: {
          target: ["portable"]
        }
      }
    };
    zip.file('package.json', JSON.stringify(electronPkg, null, 2));

    // 9. Icons (.PNG and .ICO)
    const iconBlob = await generateAppIconBlob();
    if (iconBlob) {
      zip.file('icon.png', iconBlob);
      const icoBlob = await createIcoFromPngBlob(iconBlob);
      zip.file('icon.ico', icoBlob);
    }

    // 10. Comprehensive Guide
    const pcGuide = `========================================================================
EPL - PRO MATCH CENTER (WINDOWS PC DESKTOP INSTALLER)
========================================================================

Setup & Run:
1. Extract / Unzip this ZIP file on your PC.
2. Double-click "CLICK_TO_INSTALL_AND_RUN.bat".

What happens:
- A standalone "EPL-Manager.exe" is automatically compiled.
- A shortcut icon is placed directly on your Desktop.
- The application launches in a clean desktop window.

Features:
- 100% Offline with full functionality.
- All data saved securely in your browser/app local storage.
========================================================================`;
    zip.file('README_Windows_PC_EXE_Guide.txt', pcGuide);

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `epl_windows_desktop_bundle_${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
    }, 500);
  } catch (err: any) {
    console.error('Failed to generate Windows Desktop zip:', err);
    throw err;
  }
}

/**
 * Generates a ROOT-LEVEL ZIP bundle ready for WebIntoApp APK builder.
 * Contains index.html (the 100% exact full React single-file bundle), manifest.json, icon.png, README guide.
 */
export async function downloadWebIntoAppZip(currentState: AppState): Promise<void> {
  try {
    const zip = new JSZip();

    const htmlContent = await getStandaloneHTMLContent(currentState);

    // Validate root index.html bundle
    const check = validateStandaloneHtmlBundle(htmlContent);
    if (!check.isValid) {
      console.error(check.error || 'App export failed.');
      throw new Error(check.error || 'App export failed.');
    }

    // Placed at root of the ZIP
    zip.file('index.html', htmlContent);

    const manifest = {
      name: "EPL - PRO MATCH CENTER",
      short_name: "EPL",
      start_url: "index.html",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#dc2626",
      orientation: "any",
      icons: [
        {
          src: "icon.png",
          sizes: "512x512",
          type: "image/png"
        }
      ]
    };
    zip.file('manifest.json', JSON.stringify(manifest, null, 2));

    // Standard Android WebView / Cordova configuration to grant file:// and DOMStorage permissions
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

    const iconBlob = await generateAppIconBlob();
    if (iconBlob) {
      zip.file('icon.png', iconBlob);
    }

    const readmeText = `========================================================================
EPL - PRO MATCH CENTER (WebIntoApp & Android APK Guide)
========================================================================

100% Offline Code and Font Support Verified:
1. All fonts (Inter and JetBrains Mono) are completely embedded as Base64.
   - Fonts render without internet connection.
2. Code is bundled into a Universal Classic Script.
   - Fully compatible with Android WebView without CORS or file:// issues.
3. Automatic memory fallback included for DOMStorage and LocalStorage.

Quick APK Creation Guide (WebIntoApp):
------------------------------------------------------------------------
1. Go to https://www.webintoapp.com
2. Click "Make App".
3. Choose "Upload HTML / ZIP File".
4. Upload this downloaded ZIP file.
5. Enter App Name: EPL Manager
6. Click "Create App" and download your Android APK!
========================================================================`;
    zip.file('README_WebIntoApp_Guide.txt', readmeText);

    const banglaGuide = `========================================================================
EPL ম্যাচ সেন্টার - WebIntoApp দিয়ে অ্যান্ড্রয়েড APK তৈরির সঠিক নিয়ম
========================================================================

কেন "Oops. Please make sure the device is connected to the internet" এরর আসে?
------------------------------------------------------------------------
WebIntoApp-এ সাধারণত দুটি অপশন থাকে:
1. "Website URL" (ওয়েবসাইট লিংক দিয়ে অ্যাপ তৈরি)
2. "All in One (HTML / ZIP File)" (অফলাইন ফাইল আপলোড করে অ্যাপ তৈরি)

আপনি যদি WebIntoApp-এ ওয়েবসাইট লিংক (URL) দেন, তখন মোবাইল অ্যাপটি ইন্টারনেট সার্ভারের সাথে কানেক্ট হতে চায়। কোনো কারণে সার্ভার বন্ধ থাকলে বা কানেকশন ফেইল করলে WebIntoApp ওই "Oops" এররটি দেখায়।

কিভাবে ১০০% অফলাইন ও লাইফটাইম কার্যকরী APK বানাবেন?
------------------------------------------------------------------------
১. https://www.webintoapp.com ওয়েবসাইটে যান।
২. "Make App" বাটনে ক্লিক করুন।
৩. খুবই জরুরি: "All in One" বা "HTML / ZIP File" অপশনটি সিলেক্ট করুন! ("Website URL" কখনোই সিলেক্ট করবেন না)
৪. এই জিপ ফাইলটি (webintoapp_epl_offline_bundle.zip) সিলেক্ট করে আপলোড করুন।
৫. App Name দিন: EPL Match Center
৬. "Make App" বা "Create App" এ ক্লিক করুন এবং APK ডাউনলোড করে ফোনে ইন্সটল করুন!

কেন এটি কোনো এরর ছাড়াই চলবে?
- এই প্যাকেজের ভেতরে পুরো অ্যাপ, ডিজাইন, ফন্ট এবং লজিক index.html ফাইলের ভেতর এমবেড করা আছে।
- অ্যাপটি সরাসরি মোবাইলের মেমোরি থেকে রান করবে (file:///android_asset/index.html)।
- কোনো ইন্টারনেট বা সার্ভার লাগবে না, এবং "Oops" এরর আর কখনোই আসবে না!
========================================================================`;
    zip.file('WEBINTOAPP_BANGLA_GUIDE.txt', banglaGuide);

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `webintoapp_epl_offline_bundle_${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
    }, 500);
  } catch (err: any) {
    console.error('Failed to generate WebIntoApp zip:', err);
    throw err;
  }
}

/**
 * Downloads a standalone Launch_EPL_App.bat file directly.
 * When double-clicked on Windows, it automatically searches for local HTML files
 * (like index.html or EPL_Standalone_App.html) or launches the full application
 * in dedicated app window mode (Chromium / Edge / Brave / default browser)
 * with all features, stats, calculators, and offline persistence.
 */
export async function downloadWindowsBatLauncher(currentState?: AppState): Promise<void> {
  let embeddedBase64 = '';
  let onlineUrl = '';

  if (typeof window !== 'undefined' && window.location) {
    onlineUrl = window.location.href;
  }

  if (currentState) {
    try {
      const htmlContent = await getStandaloneHTMLContent(currentState);
      if (htmlContent) {
        const encoder = new TextEncoder();
        const uint8 = encoder.encode(htmlContent);
        let binary = '';
        const len = uint8.byteLength;
        const chunkSize = 0x8000;
        for (let i = 0; i < len; i += chunkSize) {
          const chunk = uint8.subarray(i, Math.min(i + chunkSize, len));
          binary += String.fromCharCode.apply(null, Array.from(chunk));
        }
        const rawB64 = window.btoa(binary);
        const lines: string[] = [];
        for (let i = 0; i < rawB64.length; i += 64) {
          lines.push(rawB64.substring(i, i + 64));
        }
        embeddedBase64 = lines.join('\r\n');
      }
    } catch (e) {
      console.warn('Could not embed standalone HTML in BAT launcher:', e);
    }
  }

  const extractionBlock = embeddedBase64
    ? `
:: If HTML file is not present, auto-extract the embedded full offline bundle (including MATCH SELECT)
if not defined APP_FILE (
    echo  [1/2] Extracting full offline application bundle...
    certutil -decode "%~f0" "%~dp0index.html" >nul 2>&1
    if exist "%~dp0index.html" (
        set "APP_FILE=%~dp0index.html"
        echo  [OK] Successfully extracted offline app with MATCH SELECT!
    )
)
`
    : '';

  const certBlock = embeddedBase64
    ? `
-----BEGIN CERTIFICATE-----
${embeddedBase64}
-----END CERTIFICATE-----
`
    : '';

  const batScript = `@echo off
chcp 65001 >nul
title EPL PRO MATCH CENTER - WINDOWS LAUNCHER
color 0A
cls
echo ========================================================================
echo                  EPL PRO MATCH CENTER - DESKTOP LAUNCHER
echo ========================================================================
echo.
echo  [1/2] Checking environment...
cd /d "%~dp0"

:: 1. Detect any local HTML app file in this directory
set "APP_FILE="
if exist "%~dp0index.html" set "APP_FILE=%~dp0index.html"
if not defined APP_FILE if exist "%~dp0EPL_Standalone_App.html" set "APP_FILE=%~dp0EPL_Standalone_App.html"
if not defined APP_FILE if exist "%~dp0EPL_App.html" set "APP_FILE=%~dp0EPL_App.html"
${extractionBlock}
if not defined APP_FILE (
    for %%F in ("%~dp0*.html") do (
        set "APP_FILE=%%~fF"
        goto :launch_file
    )
)

:launch_file
if defined APP_FILE (
    echo  [2/2] Opening EPL Pro Match Center (Full Offline Mode)...
    echo.
    :: Edge App Mode (Built-in on Windows 10 & 11)
    if exist "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" (
        start "" "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" --app="%APP_FILE%" --allow-file-access-from-files --window-size=1540,920
        exit /b 0
    )
    if exist "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" (
        start "" "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" --app="%APP_FILE%" --allow-file-access-from-files --window-size=1540,920
        exit /b 0
    )
    if exist "%LocalAppData%\\Microsoft\\Edge\\Application\\msedge.exe" (
        start "" "%LocalAppData%\\Microsoft\\Edge\\Application\\msedge.exe" --app="%APP_FILE%" --allow-file-access-from-files --window-size=1540,920
        exit /b 0
    )
    :: Chrome App Mode
    if exist "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" (
        start "" "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" --app="%APP_FILE%" --allow-file-access-from-files --window-size=1540,920
        exit /b 0
    )
    if exist "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" (
        start "" "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" --app="%APP_FILE%" --allow-file-access-from-files --window-size=1540,920
        exit /b 0
    )
    if exist "%LocalAppData%\\Google\\Chrome\\Application\\chrome.exe" (
        start "" "%LocalAppData%\\Google\\Chrome\\Application\\chrome.exe" --app="%APP_FILE%" --allow-file-access-from-files --window-size=1540,920
        exit /b 0
    )
    :: Brave App Mode
    if exist "%ProgramFiles%\\BraveSoftware\\Brave-Browser\\Application\\brave.exe" (
        start "" "%ProgramFiles%\\BraveSoftware\\Brave-Browser\\Application\\brave.exe" --app="%APP_FILE%" --allow-file-access-from-files --window-size=1540,920
        exit /b 0
    )
    start "" "%APP_FILE%"
    exit /b 0
)

:: If standalone HTML was not placed in this folder and could not be extracted
echo  [NOTE] Launching web application window...
echo.
${onlineUrl ? `
if exist "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" (
    start "" "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" --app="${onlineUrl}" --window-size=1540,920
    exit /b 0
)
if exist "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" (
    start "" "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" --app="${onlineUrl}" --window-size=1540,920
    exit /b 0
)
if exist "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" (
    start "" "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" --app="${onlineUrl}" --window-size=1540,920
    exit /b 0
)
start "" "${onlineUrl}"
` : `
start "" "%~dp0index.html"
`}
exit /b 0
${certBlock}`;

  const blob = new Blob([batScript], { type: 'application/x-bat;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Launch_EPL_App.bat';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    if (document.body.contains(link)) document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 500);
}




