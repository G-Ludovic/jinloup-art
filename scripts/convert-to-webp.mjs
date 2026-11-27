import "dotenv/config";
import { readdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import pg from "pg";

const IMAGES_DIR = path.join(process.cwd(), "public", "images");
const PUBLIC_DIR = path.join(process.cwd(), "public");
const EXTENSIONS = new Set([".png", ".jpg", ".jpeg"]);

async function getAllFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getAllFiles(fullPath)));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function formatKo(bytes) {
  return `${Math.round(bytes / 1024)} Ko`;
}

async function main() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const files = await getAllFiles(IMAGES_DIR);
    let convertedCount = 0;

    for (const filePath of files) {
      const ext = path.extname(filePath).toLowerCase();
      if (!EXTENSIONS.has(ext)) continue;

      const webpPath = filePath.slice(0, -ext.length) + ".webp";
      const oldUrl =
        "/" + path.relative(PUBLIC_DIR, filePath).split(path.sep).join("/");
      const newUrl =
        "/" + path.relative(PUBLIC_DIR, webpPath).split(path.sep).join("/");

      const oldSize = (await stat(filePath)).size;

      // Conversion en WebP (rotate() respecte l'orientation des scans/photos)
      await sharp(filePath).rotate().webp({ quality: 85 }).toFile(webpPath);

      const newSize = (await stat(webpPath)).size;

      // Mise à jour automatique dans Neon PostgreSQL
      const res = await pool.query(
        'UPDATE "Artwork" SET "imageUrl" = $1 WHERE "imageUrl" = $2',
        [newUrl, oldUrl],
      );

      // Suppression de l'ancien fichier .png/.jpg
      await unlink(filePath);

      console.log(
        `✓ ${oldUrl} (${formatKo(oldSize)}) → ${newUrl} (${formatKo(newSize)}) | BDD : ${res.rowCount} ligne(s)`,
      );
      convertedCount++;
    }

    if (convertedCount === 0) {
      console.log(
        "Aucune image .png/.jpg/.jpeg à convertir dans public/images/.",
      );
    } else {
      console.log(
        `\nTerminé ! ${convertedCount} image(s) convertie(s) en .webp.`,
      );
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Erreur:", err);
  process.exit(1);
});
