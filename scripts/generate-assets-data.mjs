import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const srcDir = path.join(projectRoot, "src");
const publicDir = path.join(projectRoot, "public");

const fileCache = new Map();

function readFile(filePath) {
    const cacheKey = path.resolve(filePath);
    if (fileCache.has(cacheKey)) {
        return fileCache.get(cacheKey);
    }
    const contents = fs.readFileSync(filePath, "utf8");
    fileCache.set(cacheKey, contents);
    return contents;
}

function stripImportsAndExports(code) {
    let stripped = code.replace(/import[^;]+;\s*/g, "");
    stripped = stripped.replace(/export\s+default[^;]+;\s*/g, "");
    return stripped;
}

function evaluateModule(filePath, contextValues = {}, returnExpression) {
    const absolutePath = path.resolve(filePath);
    const code = stripImportsAndExports(readFile(absolutePath));
    const script = new vm.Script(`${code}\n${returnExpression}`);
    const context = vm.createContext({ ...contextValues, console });
    return script.runInContext(context, { filename: absolutePath });
}

function toPosix(...segments) {
    return path.posix.join(...segments);
}

function fileExists(relativePath) {
    const absolute = path.join(publicDir, relativePath);
    return fs.existsSync(absolute);
}

function parseRectValues(raw) {
    if (!Array.isArray(raw) || raw.length === 0) {
        return [];
    }
    const rects = [];
    for (let i = 0; i <= raw.length - 4; i += 4) {
        const x = raw[i];
        const y = raw[i + 1];
        const w = raw[i + 2];
        const h = raw[i + 3];
        if ([x, y, w, h].every((value) => typeof value === "number" && !Number.isNaN(value))) {
            rects.push({ x, y, w, h });
        }
    }
    return rects;
}

function parseOffsetValues(raw) {
    if (!Array.isArray(raw) || raw.length === 0) {
        return [];
    }
    const offsets = [];
    for (let i = 0; i <= raw.length - 2; i += 2) {
        const x = raw[i];
        const y = raw[i + 1];
        if ([x, y].every((value) => typeof value === "number" && !Number.isNaN(value))) {
            offsets.push({ x, y });
        }
    }
    return offsets;
}

function normalizeInfo(info) {
    const knownKeys = new Set([
        "id",
        "rects",
        "offsets",
        "preCutWidth",
        "preCutHeight",
        "adjustmentMaxX",
        "adjustmentMaxY",
        "resScale",
        "skipOffsetAdjustment",
        "charOffset",
        "lineOffset",
        "spaceWidth",
        "chars",
        "kerning",
    ]);
    const additional = {};
    Object.keys(info).forEach((key) => {
        if (!knownKeys.has(key)) {
            additional[key] = info[key];
        }
    });
    return additional;
}

function ensureDirExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

const ResourceType = evaluateModule(path.join(srcDir, "resources/ResourceType.js"), {}, "ResourceType");
const ResEntry = evaluateModule(path.join(srcDir, "resources/ResEntry.js"), {}, "ResEntry");
const ResourceId = evaluateModule(path.join(srcDir, "resources/ResourceId.js"), {}, "ResourceId");
const RES_INFO_2560 = evaluateModule(path.join(srcDir, "ResInfo.js"), { ResourceId }, "RES_INFO_2560");
const RES_DATA = evaluateModule(
    path.join(srcDir, "resources/ResData.js"),
    { ResEntry, ResourceType, ResourceId },
    "RES_DATA"
);

const typeLookup = Object.fromEntries(Object.entries(ResourceType).map(([key, value]) => [value, key]));
const idLookup = Object.fromEntries(Object.entries(ResourceId).map(([key, value]) => [value, key]));

const imagesDir = path.join(publicDir, "images");
const resolutionDirs = fs
    .readdirSync(imagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d+$/.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => Number(a) - Number(b));
const extraImageDirs = fs
    .readdirSync(imagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !/^\d+$/.test(entry.name))
    .map((entry) => entry.name)
    .sort();

const assets = [];
for (const info of RES_INFO_2560) {
    if (!info || typeof info !== "object") {
        continue;
    }
    const { id } = info;
    const resource = typeof id === "number" ? RES_DATA[id] : undefined;
    const typeName = resource && typeLookup[resource.type] ? typeLookup[resource.type] : null;
    const rectValues = Array.isArray(info.rects) ? [...info.rects] : [];
    const offsetValues = Array.isArray(info.offsets) ? [...info.offsets] : [];
    const rects = parseRectValues(rectValues);
    const offsets = parseOffsetValues(offsetValues);
    const additional = normalizeInfo(info);

    const availablePaths = {};
    if (resource && resource.path) {
        for (const resolution of resolutionDirs) {
            const searchRoots = ["game", "ui", "page", ""];
            for (const root of searchRoots) {
                const relativePath = root
                    ? toPosix("images", resolution, root, resource.path)
                    : toPosix("images", resolution, resource.path);
                if (fileExists(relativePath)) {
                    availablePaths[resolution] = relativePath;
                    break;
                }
            }
        }
    }

    const globalPaths = [];
    if (resource && resource.path) {
        for (const dir of extraImageDirs) {
            const searchRoots = ["game", "ui", "page", ""];
            for (const root of searchRoots) {
                const relativePath = root
                    ? toPosix("images", dir, root, resource.path)
                    : toPosix("images", dir, resource.path);
                if (fileExists(relativePath)) {
                    globalPaths.push(relativePath);
                }
            }
        }
    }

    const assetEntry = {
        id: typeof id === "number" ? id : null,
        name: typeof id === "number" && idLookup[id] ? idLookup[id] : null,
        file: resource ? resource.path : null,
        type: typeName,
        rects,
        offsets,
        rectValues,
        offsetValues,
        preCutWidth: info.preCutWidth ?? null,
        preCutHeight: info.preCutHeight ?? null,
        adjustmentMaxX: info.adjustmentMaxX ?? null,
        adjustmentMaxY: info.adjustmentMaxY ?? null,
        resScale: info.resScale ?? null,
        skipOffsetAdjustment: info.skipOffsetAdjustment ?? false,
        charOffset: info.charOffset ?? null,
        lineOffset: info.lineOffset ?? null,
        spaceWidth: info.spaceWidth ?? null,
        chars: info.chars ?? null,
        kerning: info.kerning && Object.keys(info.kerning).length ? info.kerning : null,
        availablePaths,
        globalPaths,
        additional,
    };

    assets.push(assetEntry);
}

const output = {
    generatedAt: new Date().toISOString(),
    metadata: {
        availableResolutions: resolutionDirs,
        extraImageDirectories: extraImageDirs,
    },
    assets,
};

const outputDir = path.join(publicDir, "tools/atlas-inspector");
ensureDirExists(outputDir);
const outputPath = path.join(outputDir, "assets-data.json");
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(`Asset data written to ${path.relative(projectRoot, outputPath)}`);
