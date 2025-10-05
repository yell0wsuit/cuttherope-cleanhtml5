import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
    base: "/cuttherope-cleanhtml5/",
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
