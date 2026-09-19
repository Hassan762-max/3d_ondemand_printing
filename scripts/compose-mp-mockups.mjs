import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../public/products");
const designPath = path.join(
  __dirname,
  "../public/designs/culture-cloud-dragon.png",
);

const items = [
  { out: "mp-tee-black.png", base: "tee.png", blacken: false, scale: 0.42, y: 0.38 },
  { out: "mp-cap-black.png", base: "cap.png", blacken: false, scale: 0.34, y: 0.37, contain: true },
  { out: "mp-hoodie-black.png", base: "hoodie.png", blacken: false, scale: 0.4, y: 0.36 },
];

async function toBlack(inputBuf) {
  const { data, info } = await sharp(inputBuf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (r > 230 && g > 230 && b > 230) continue;
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const v = Math.max(8, Math.min(55, lum * 0.28));
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = a;
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

async function knockoutWhite(inputBuf) {
  const { data, info } = await sharp(inputBuf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r > 245 && g > 245 && b > 245) data[i + 3] = 0;
    else if (r > 235 && g > 235 && b > 235)
      data[i + 3] = Math.round(data[i + 3] * 0.35);
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

const designMeta = await sharp(designPath).metadata();
const designClean = await knockoutWhite(
  await sharp(designPath).png().toBuffer(),
);

for (const item of items) {
  let baseBuf = await sharp(path.join(root, item.base))
    .resize(1200, 1600, {
      fit: item.contain ? "contain" : "cover",
      position: "centre",
      background: { r: 255, g: 255, b: 255 },
    })
    .png()
    .toBuffer();

  if (item.blacken) baseBuf = await toBlack(baseBuf);

  baseBuf = await sharp(baseBuf)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png()
    .toBuffer();

  const meta = await sharp(baseBuf).metadata();
  const W = meta.width;
  const H = meta.height;

  const printW = Math.round(W * item.scale);
  const printH = Math.round(
    printW * ((designMeta.height || 1) / (designMeta.width || 1)),
  );
  const left = Math.round((W - printW) / 2);
  const top = Math.round(H * item.y - printH / 2);

  const print = await sharp(designClean)
    .resize(printW, printH, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  await sharp(baseBuf)
    .composite([{ input: print, left, top, blend: "over" }])
    .png()
    .toFile(path.join(root, item.out));

  console.log(`wrote ${item.out} print ${printW}x${printH}`);
}
