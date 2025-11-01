import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

const distDir = path.resolve(process.cwd(), "dist");

/**
 * Recursively walk a directory and return all file paths.
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
async function walkDir(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    /** @type {string[]} */
    const files = [];
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...(await walkDir(fullPath)));
        } else {
            files.push(fullPath);
        }
    }
    return files;
}

/**
 * Ensure the dist directory exists before running compression.
 * @returns {Promise<void>}
 */
async function ensureDistExists() {
    try {
        const stats = await fs.stat(distDir);
        if (!stats.isDirectory()) {
            throw new Error(`Expected "${distDir}" to be a directory.`);
        }
    } catch (error) {
        if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
            throw new Error("The dist directory does not exist. Run the build before compressing.");
        }
        throw error;
    }
}

/**
 * Minify a JSON file in place.
 * @param {string} filePath
 * @returns {Promise<void>}
 */
async function minifyJsonFile(filePath) {
    const raw = await fs.readFile(filePath, "utf8");
    try {
        const parsed = JSON.parse(raw);
        const minified = JSON.stringify(parsed);
        await fs.writeFile(filePath, minified);
        console.log(`Minified JSON: ${filePath}`);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`Skipping JSON ${filePath}:`, message);
    }
}

/**
 * Minify a CSS file using a simple regular-expression pass.
 * @param {string} filePath
 * @returns {Promise<void>}
 */
async function minifyCssFile(filePath) {
    const raw = await fs.readFile(filePath, "utf8");
    // Basic CSS minification: remove comments and extra whitespace
    const minified = raw
        .replace(/\/\*[\s\S]*?\*\//g, "") // remove comments
        .replace(/\s{2,}/g, " ") // collapse spaces
        .replace(/\s*([:;{},>])\s*/g, "$1") // trim around symbols
        .replace(/;}/g, "}") // remove last semicolon before }
        .trim();

    await fs.writeFile(filePath, minified);
    console.log(`Minified CSS: ${filePath}`);
}

async function main() {
    await ensureDistExists();
    const allFiles = await walkDir(distDir);

    const jsonFiles = allFiles.filter((file) => file.endsWith(".json"));
    const cssFiles = allFiles.filter((file) => file.endsWith(".css"));

    if (jsonFiles.length === 0 && cssFiles.length === 0) {
        console.log("No JSON or CSS files found to minify.");
        return;
    }

    await Promise.all([
        ...jsonFiles.map((file) => minifyJsonFile(file)),
        ...cssFiles.map((file) => minifyCssFile(file)),
    ]);

    console.log("JSON and CSS minification complete.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
