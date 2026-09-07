import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";

export async function writeGeneratedSvg(prompt: string, style: string) {
  const safe = prompt.replace(/[<>&]/g, "").slice(0, 48) || "Printora";
  const accent =
    style === "bold"
      ? "#1F6B5A"
      : style === "minimal"
        ? "#1B2A4A"
        : style === "editorial"
          ? "#A8906C"
          : "#0E1116";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" fill="none">
  <rect width="800" height="800" fill="#F4F1EB"/>
  <circle cx="400" cy="360" r="180" fill="${accent}" opacity="0.12"/>
  <rect x="220" y="220" width="360" height="360" rx="28" stroke="${accent}" stroke-width="10"/>
  <text x="400" y="390" text-anchor="middle" font-family="Georgia, serif" font-size="42" fill="#0E1116">${escapeXml(safe)}</text>
  <text x="400" y="440" text-anchor="middle" font-family="system-ui, sans-serif" font-size="18" fill="#6B6F78" letter-spacing="4">${escapeXml(style.toUpperCase())}</text>
</svg>`;

  const filename = `gen-${nanoid(10)}.svg`;
  const dir = path.join(process.cwd(), "public", "uploads", "generated");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), svg, "utf8");
  return `/uploads/generated/${filename}`;
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
