import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../public/products");
const designPath = path.join(
  __dirname,
  "../public/designs/culture-cloud-dragon.png",
);

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

// Keep same large print size as current hoodie; only re-center vertically
const baseBuf = await sharp(path.join(root, "hoodie.png"))
  .resize(1200, 1600, { fit: "cover", position: "centre" })
  .flatten({ background: { r: 255, g: 255, b: 255 } })
  .png()
  .toBuffer();

const meta = await sharp(baseBuf).metadata();
const W = meta.width;
const H = meta.height;
const designMeta = await sharp(designPath).metadata();

const printW = Math.round(W * 0.4);
const printH = Math.round(
  printW * ((designMeta.height || 1) / (designMeta.width || 1)),
);
const left = Math.round((W - printW) / 2);
// Center in the chest zone between neckline (~28%) and pocket top (~55%)
const chestMidY = H * 0.415;
const top = Math.round(chestMidY - printH / 2);

const designClean = await knockoutWhite(
  await sharp(designPath).png().toBuffer(),
);
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
  .toFile(path.join(root, "mp-hoodie-black.png"));

console.log(`hoodie only: print ${printW}x${printH} @ ${left},${top}`);
