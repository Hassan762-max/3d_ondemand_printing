import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";

export async function writeTryOnPreview(input: {
  photoUrl: string;
  productName: string;
  garmentColor: string;
  designUrl?: string | null;
  size?: string;
}) {
  const designBlock = input.designUrl
    ? `<image href="${escapeXml(input.designUrl)}" x="330" y="290" width="140" height="140" opacity="0.92"/>`
    : `<rect x="340" y="310" width="120" height="120" rx="12" fill="#F4F1EB" opacity="0.25"/>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 800 1000" fill="none">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#1a1f28"/>
      <stop offset="1" stop-color="#0e1116"/>
    </linearGradient>
    <clipPath id="frame"><rect x="80" y="80" width="640" height="840" rx="28"/></clipPath>
  </defs>
  <rect width="800" height="1000" fill="url(#bg)"/>
  <g clip-path="url(#frame)">
    <image href="${escapeXml(input.photoUrl)}" x="80" y="80" width="640" height="840" preserveAspectRatio="xMidYMid slice"/>
    <rect x="250" y="260" width="300" height="360" rx="24" fill="${escapeXml(input.garmentColor)}" opacity="0.78"/>
    ${designBlock}
  </g>
  <text x="100" y="960" fill="#F4F1EB" font-family="system-ui,sans-serif" font-size="22">${escapeXml(input.productName)}${input.size ? ` · ${escapeXml(input.size)}` : ""}</text>
  <text x="100" y="60" fill="#2A8F78" font-family="system-ui,sans-serif" font-size="14" letter-spacing="3">PRINTORA TRY-ON PREVIEW</text>
</svg>`;

  const filename = `tryon-${nanoid(12)}.svg`;
  const dir = path.join(process.cwd(), "public", "uploads", "try-on");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), svg, "utf8");
  return `/uploads/try-on/${filename}`;
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
