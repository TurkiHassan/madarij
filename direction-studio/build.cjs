const fs = require("node:fs");
const path = require("node:path");

const ROOT = __dirname;
const PROJECT = path.resolve(ROOT, "..");
const OUT = path.join(PROJECT, "madarij-directions.html");

const FONT_QUERY = [
  "Aref+Ruqaa:wght@400;700",
  "Noto+Naskh+Arabic:wght@400;500;600;700",
  "Readex+Pro:wght@300;400;500;600;700",
  "Rakkas",
  "Almarai:wght@300;400;700",
  "Amiri:wght@400;700",
  "Reem+Kufi:wght@400;500;600;700",
  "Tajawal:wght@400;500;700;800;900",
].join("&family=");

const FONT_URL = `https://fonts.googleapis.com/css2?family=${FONT_QUERY}&display=swap`;
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function buildFonts() {
  const response = await fetch(FONT_URL, { headers: { "User-Agent": UA } });
  if (!response.ok) {
    throw new Error(`Google Fonts CSS failed: ${response.status}`);
  }
  const css = await response.text();
  const blockPattern = /\/\*\s*([a-z0-9-]+)\s*\*\/\s*@font-face\s*\{([^}]+)\}/g;
  const groups = new Map();
  let match;

  while ((match = blockPattern.exec(css))) {
    const subset = match[1];
    if (subset !== "arabic" && subset !== "latin") continue;
    const body = match[2];
    const familyMatch = body.match(/font-family:\s*'([^']+)'/);
    const weightMatch = body.match(/font-weight:\s*([^;]+);/);
    const srcMatch = body.match(/src:\s*url\((https:[^)]+)\)/);
    const rangeMatch = body.match(/unicode-range:\s*([^;]+);/);
    if (!familyMatch || !weightMatch || !srcMatch) continue;
    const family = familyMatch[1];
    const weights = weightMatch[1]
      .trim()
      .split(/\s+/)
      .map((value) => parseInt(value, 10))
      .filter((value) => Number.isFinite(value));
    if (!weights.length) continue;
    const url = srcMatch[1];
    const key = `${family}|${subset}|${url}`;
    if (!groups.has(key)) {
      groups.set(key, {
        family,
        subset,
        url,
        weights: new Set(),
        range: rangeMatch ? rangeMatch[1].trim() : "",
      });
    }
    const group = groups.get(key);
    weights.forEach((weight) => group.weights.add(weight));
  }

  const base64Cache = new Map();
  const fontFaces = [];
  const orderedGroups = Array.from(groups.values()).sort((a, b) => {
    if (a.family !== b.family) return a.family.localeCompare(b.family);
    if (a.subset !== b.subset) return a.subset === "arabic" ? -1 : 1;
    const aw = Math.min(...a.weights);
    const bw = Math.min(...b.weights);
    return aw - bw;
  });

  for (const group of orderedGroups) {
    if (!base64Cache.has(group.url)) {
      const fontResponse = await fetch(group.url, { headers: { "User-Agent": UA } });
      if (!fontResponse.ok) {
        throw new Error(`Font download failed (${fontResponse.status}): ${group.url}`);
      }
      const buffer = Buffer.from(await fontResponse.arrayBuffer());
      base64Cache.set(group.url, buffer.toString("base64"));
      console.log(
        `font ${group.family} ${group.subset} ${buffer.length.toLocaleString()} bytes`,
      );
    }
    const weightValues = Array.from(group.weights).sort((a, b) => a - b);
    const minWeight = weightValues[0];
    const maxWeight = weightValues[weightValues.length - 1];
    const fontWeight =
      minWeight === maxWeight ? String(minWeight) : `${minWeight} ${maxWeight}`;
    const data = base64Cache.get(group.url);
    fontFaces.push(`@font-face {
  font-family: '${decodeEntities(group.family)}';
  font-style: normal;
  font-weight: ${fontWeight};
  font-display: swap;
  src: url(data:font/woff2;base64,${data}) format('woff2');
  unicode-range: ${group.range};
}`);
  }

  return fontFaces.join("\n\n");
}

async function main() {
  console.log("Fetching Google Fonts CSS…");
  const fontCss = await buildFonts();
  console.log(`Embedded ${fontCss.length.toLocaleString()} chars of font CSS.`);

  const cssFiles = [
    "styles/base.css",
    "styles/nb.css",
    "styles/lab.css",
    "styles/cl.css",
    "styles/obs.css",
    "styles/wf.css",
  ].map((file) => fs.readFileSync(path.join(ROOT, file), "utf8"));

  const appJs = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  let html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

  // Remove the remote font preconnects, font link, and stylesheet links.
  html = html.replace(
    /\s*<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">/,
    "",
  );
  html = html.replace(
    /\s*<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>/,
    "",
  );
  html = html.replace(
    /\s*<link href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]+" rel="stylesheet">/,
    "",
  );
  html = html.replace(
    /\s*<link rel="stylesheet" href="styles\/base\.css">\s*<link rel="stylesheet" href="styles\/nb\.css">\s*<link rel="stylesheet" href="styles\/lab\.css">\s*<link rel="stylesheet" href="styles\/cl\.css">\s*<link rel="stylesheet" href="styles\/obs\.css">\s*<link rel="stylesheet" href="styles\/wf\.css">/,
    `\n  <style>\n${fontCss}\n\n${cssFiles.join("\n\n")}\n  </style>`,
  );
  html = html.replace(
    /\s*<script src="app\.js"><\/script>/,
    `\n<script>\n${appJs}\n</script>`,
  );

  if (html.includes("fonts.googleapis.com") || html.includes('src="app.js"')) {
    throw new Error("External asset reference remained in the built HTML.");
  }

  fs.writeFileSync(OUT, html, "utf8");
  const stats = fs.statSync(OUT);
  console.log(`Wrote ${OUT}`);
  console.log(`Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
