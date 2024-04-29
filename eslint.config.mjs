import globals from "globals";
import pluginJs from "@eslint/js";

export default [
    { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
    { env: { browser: true }, languageOptions: { globals: globals.browser } },
    pluginJs.configs.recommended,
];
