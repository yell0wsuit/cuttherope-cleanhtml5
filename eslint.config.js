import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs}"],
        plugins: { js },
        extends: ["js/recommended"],
        languageOptions: { globals: globals.browser },
        ignores: ["node_modules/**", "dist/**", "public/**"],
        rules: {
            "no-var": "error",
            "prefer-const": "error",
            "no-unused-vars": "warn",
        },
    },
    ...tseslint.configs.recommended.map((config) => ({
        ...config,
        languageOptions: {
            ...config.languageOptions,
            globals: {
                ...globals.browser,
                ...config.languageOptions?.globals,
            },
        },
    })),
]);
