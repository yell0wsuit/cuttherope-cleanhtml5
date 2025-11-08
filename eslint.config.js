import globals from "globals";
import tseslint from "typescript-eslint";

export default [
    {
        ignores: ["node_modules/**", "dist/**", "public/**"],
    },
    ...tseslint.configs.strict.map((config) => ({
        ...config,
        files: ["**/*.ts"],
    })),
    {
        files: ["**/*.ts"],
        languageOptions: { globals: globals.browser },
        rules: {
            "@typescript-eslint/no-unused-vars": "warn",
        },
    },
];
