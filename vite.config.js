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
});
