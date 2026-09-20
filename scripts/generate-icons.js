import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '..', 'public');

// CRC32 table for PNG chunks
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createPng(size, isMaskable = false) {
  // RGBA buffer: each scanline has 1 filter byte (0) + size * 4 bytes
  const scanlineLength = 1 + size * 4;
  const rawData = Buffer.alloc(scanlineLength * size);

  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size * 0.46;
  const innerRadius = size * 0.43;
  const safeRadius = isMaskable ? size * 0.38 : outerRadius;

  for (let y = 0; y < size; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter byte: None

    for (let x = 0; x < size; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Default background: #020617 (dark navy/slate)
      let r = 2;
      let g = 6;
      let b = 23;
      let a = 255;

      // Rounded container / shield or circle
      if (dist < safeRadius) {
        // Gradient inner circle background
        const grad = (y / size);
        r = Math.round(5 + grad * 10);
        g = Math.round(15 + grad * 25);
        b = Math.round(30 + grad * 15);

        // Green border ring
        if (dist >= safeRadius - size * 0.04) {
          r = 16;
          g = 185;
          b = 129; // Emerald 500
        }
      }

      // Draw % symbol
      // Normalize coordinate to [-1, 1] relative to center
      const nx = (x - cx) / (size * 0.35);
      const ny = (y - cy) / (size * 0.35);

      // Slash line from (-0.6, 0.6) to (0.6, -0.6)
      // Line equation: nx + ny = 0, distance to line is |nx + ny| / sqrt(2)
      const slashDist = Math.abs(nx + ny) / Math.SQRT2;
      const slashSpan = Math.abs(nx - ny) / Math.SQRT2;
      if (slashDist < 0.12 && slashSpan < 0.85) {
        r = 52;
        g = 211;
        b = 153; // Emerald 400
      }

      // Top-left circle center (-0.4, -0.4), radius ~0.22, thickness ~0.08
      const d1 = Math.sqrt((nx + 0.42) ** 2 + (ny + 0.42) ** 2);
      if (d1 < 0.24 && d1 > 0.1) {
        r = 255;
        g = 255;
        b = 255; // White
      }

      // Bottom-right circle center (0.4, 0.4), radius ~0.22, thickness ~0.08
      const d2 = Math.sqrt((nx - 0.42) ** 2 + (ny - 0.42) ** 2);
      if (d2 < 0.24 && d2 > 0.1) {
        r = 255;
        g = 255;
        b = 255; // White
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Header
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0); // Width
  ihdrData.writeUInt32BE(size, 4); // Height
  ihdrData.writeUInt8(8, 8); // Bit depth: 8
  ihdrData.writeUInt8(6, 9); // Color type: 6 (RGBA)
  ihdrData.writeUInt8(0, 10); // Compression: 0 (deflate)
  ihdrData.writeUInt8(0, 11); // Filter: 0 (adaptive)
  ihdrData.writeUInt8(0, 12); // Interlace: 0 (no interlace)
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate files
fs.mkdirSync(publicDir, { recursive: true });

// 1. Vector SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="50%" stop-color="#0b1329"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="50%" stop-color="#059669"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>
    <linearGradient id="slashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#10b981" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)"/>
  <rect width="504" height="504" x="4" y="4" rx="108" fill="none" stroke="#10b981" stroke-opacity="0.3" stroke-width="6"/>

  <!-- Center Shield Ring -->
  <circle cx="256" cy="256" r="190" fill="#040b19" stroke="url(#shieldGrad)" stroke-width="14" filter="url(#glow)"/>

  <!-- Percentage Symbol -->
  <!-- Top Left Circle -->
  <circle cx="180" cy="180" r="42" fill="none" stroke="#ffffff" stroke-width="18"/>

  <!-- Slash Diagonal -->
  <line x1="330" y1="170" x2="182" y2="342" stroke="url(#slashGrad)" stroke-width="22" stroke-linecap="round"/>

  <!-- Bottom Right Circle -->
  <circle cx="332" cy="332" r="42" fill="none" stroke="#ffffff" stroke-width="18"/>

  <!-- Inner Stars / Accent -->
  <circle cx="256" cy="115" r="5" fill="#34d399"/>
  <circle cx="256" cy="397" r="5" fill="#34d399"/>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf8');
console.log('✓ Created public/icon.svg');

// 2. PNG files
const pwa192 = createPng(192, false);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), pwa192);
console.log('✓ Created public/pwa-192x192.png');

const pwa512 = createPng(512, false);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), pwa512);
console.log('✓ Created public/pwa-512x512.png');

const pwaMaskable512 = createPng(512, true);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pwaMaskable512);
console.log('✓ Created public/pwa-maskable-512x512.png');

const appleTouch = createPng(180, false);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouch);
console.log('✓ Created public/apple-touch-icon.png');

const favicon = createPng(64, false);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), favicon);
console.log('✓ Created public/favicon.ico');
