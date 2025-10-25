import { fileURLToPath } from "url";
import path from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const base = "cuttherope-cleanhtml5";
const APP_VERSION = "1";

export default defineConfig({
    base: `/${base}/`,
    plugins: [
        VitePWA({
            registerType: "autoUpdate",
            includeAssets: ["favicon.ico", "css/ctr.css"],
            devOptions: {
                enabled: false,
            },
            manifest: {
                id: base,
                name: "Cut the Rope: H5DX",
                short_name: "Cut the Rope: H5DX",
                description:
                    "Play Cut the Rope! A mysterious package has arrived, and the little monster inside has only one request… CANDY!",
                start_url: `/${base}/`,
                scope: `/${base}/`,
                display: "standalone",
                theme_color: "#000000",
                background_color: "#000000",
                icons: [
                    {
                        src: `images/ctr-icon-512.png`,
                        sizes: "512x512",
                        type: "image/png",
                    },
                    {
                        src: `images/ctr-icon.png`,
                        sizes: "2048x2048",
                        type: "image/png",
                    },
                ],
            },
            workbox: {
                globPatterns: [
                    "**/*.{js,css,html,ico,png,svg,jpg,jpeg,gif,webp,json,woff,woff2,ttf,cur,mp3,ogg}",
                ],
                maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MB
                navigateFallback: `/${base}/index.html`,
                cleanupOutdatedCaches: true,
                runtimeCaching: [
                    {
                        urlPattern: ({ request, url }) =>
                            request.destination === "style" || url.pathname.includes("/css/"),
                        handler: "StaleWhileRevalidate",
                        options: {
                            cacheName: `ctr-styles-${APP_VERSION}`,
                            expiration: {
                                maxEntries: 20,
                                maxAgeSeconds: 60 * 60 * 24 * 365, // 365 days
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                    {
                        urlPattern: ({ request, url }) =>
                            request.destination === "image" || url.pathname.includes("/images/"),
                        handler: "CacheFirst",
                        options: {
                            cacheName: `ctr-images-${APP_VERSION}`,
                            expiration: {
                                maxEntries: 200,
                                maxAgeSeconds: 60 * 60 * 24 * 365,
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                    {
                        urlPattern: ({ request, url }) =>
                            request.destination === "font" || url.pathname.includes("/fonts/"),
                        handler: "CacheFirst",
                        options: {
                            cacheName: `ctr-fonts-${APP_VERSION}`,
                            expiration: {
                                maxAgeSeconds: 60 * 60 * 24 * 365,
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                    {
                        urlPattern: ({ request, url }) =>
                            request.destination === "audio" || url.pathname.includes("/audio/"),
                        handler: "CacheFirst",
                        options: {
                            cacheName: `ctr-audio-${APP_VERSION}`,
                            expiration: {
                                maxAgeSeconds: 60 * 60 * 24 * 365,
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                    {
                        urlPattern: ({ url }) =>
                            url.pathname.endsWith(".json") && url.pathname.includes("/data/"),
                        handler: "NetworkFirst",
                        options: {
                            cacheName: `ctr-json-${APP_VERSION}`,
                            networkTimeoutSeconds: 3,
                            expiration: {
                                maxAgeSeconds: 60 * 60 * 24 * 365,
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                ],
            },
        }),
    ],
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
