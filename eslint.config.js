import globals from "globals";
import tseslint from "typescript-eslint";

export default [
    {
        ignores: ["node_modules/**", "dist/**", "public/**"],
    },
    ...tseslint.configs.recommended.map((config) => ({
        ...config,
        files: ["**/*.ts"],
    })),
    // Stylistic rules (indentation, spacing, etc.)
    ...tseslint.configs.stylistic.map((config) => ({
        ...config,
        files: ["**/*.ts"],
    })),
    {
        files: ["**/*.ts"],
        languageOptions: { globals: globals.browser },
        rules: {
            "@typescript-eslint/no-unused-vars": "warn",
            "@typescript-eslint/no-useless-constructor": "error",
        },
    },
];
