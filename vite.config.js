import { fileURLToPath } from "url";
import path from "path";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    base: "/cuttherope-cleanhtml5/",
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    // Split each node_modules package into its own chunk
                    if (id.includes("node_modules")) {
                        const packageName = id.split("node_modules/")[1].split("/")[0];
                        return `vendor/${packageName}`;
                    }

                    // Split source files into separate chunks
                    if (id.includes("/src/")) {
                        // Normalize path separators and extract relative path
                        const srcPath = id.split("/src/")[1];

                        // Remove file extension and create a clean chunk name
                        const chunkName = srcPath
                            .replace(/\.(js|ts|tsx|jsx)$/, "")
                            .replace(/\\/g, "/"); // Normalize Windows paths

                        return chunkName;
                    }
                },
            },
        },
    },
});
