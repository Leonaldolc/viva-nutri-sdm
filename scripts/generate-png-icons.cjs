const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Minimal pure-Node PNG encoder
function createPNG(width, height, getPixel) {
  const rowSize = width * 4 + 1;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth
  ihdr[9] = 6; // Color type: RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // IDAT chunk
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (-(crc & 1) & 0xEDB88320);
    }
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const typeAndData = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeAndData, crc]);
}

// Generate rounded dark icon with gradient Viva Nutri emblem
function generateIcon(size) {
  const radius = size * 0.22;
  const cx = size / 2;
  const cy = size / 2;

  return createPNG(size, size, (x, y) => {
    // Check rounded rect
    const dx = Math.max(Math.abs(x - cx) - (cx - radius), 0);
    const dy = Math.max(Math.abs(y - cy) - (cy - radius), 0);
    const distSq = dx * dx + dy * dy;

    if (distSq > radius * radius) {
      return [0, 0, 0, 0]; // Transparent outside rounded corner
    }

    // Distance from center for the glowing emblem
    const dFromCenter = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
    const emblemRadius = size * 0.36;

    if (dFromCenter < emblemRadius) {
      // Viva Nutri Gradient (Purple to Orange)
      const ratio = (x + y) / (size * 2);
      const r = Math.round(124 + ratio * (249 - 124));
      const g = Math.round(58 + ratio * (115 - 58));
      const b = Math.round(237 + ratio * (22 - 237));
      return [r, g, b, 255];
    } else if (dFromCenter < emblemRadius * 1.15) {
      // Glow ring
      const alpha = Math.round((1 - (dFromCenter - emblemRadius) / (emblemRadius * 0.15)) * 120);
      return [124, 58, 237, alpha];
    }

    // Dark background #090D16
    return [9, 13, 22, 255];
  });
}

const publicDir = path.join(__dirname, '..', 'public');

const png192 = generateIcon(192);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);
console.log('pwa-192x192.png generated');

const png512 = generateIcon(512);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);
console.log('pwa-512x512.png generated');

const appleIcon = generateIcon(180);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);
console.log('apple-touch-icon.png generated');
