import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const indexPath = path.join(rootDir, "index.html");
const templatePath = path.join(rootDir, "scripts", "templates", "index.html");
const assetsPath = path.join(rootDir, "public", "assets");

async function restoreIndexFromTemplate() {
  try {
    const template = await fs.readFile(templatePath, "utf8");
    await fs.writeFile(indexPath, template, "utf8");
  } catch (error) {
    console.error(`prebuild: unable to restore index.html from template at ${templatePath}`);
    throw error;
  }
}

async function cleanAssetsDirectory() {
  try {
    await fs.rm(assetsPath, { recursive: true, force: true });
  } catch (error) {
    console.error(`prebuild: failed to clean ${assetsPath}`);
    throw error;
  }
}

(async () => {
  await restoreIndexFromTemplate();
  await cleanAssetsDirectory();
})();
