// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    rules: {
      "react/no-unescaped-entities": "error",
      "react-hooks/refs": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      "@typescript-eslint/no-unused-vars": "warn",
    },
    ignores: ["dist/*", "eslint_report.json"],
  }
]);
