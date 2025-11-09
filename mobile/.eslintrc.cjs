module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
    jest: true
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: ["@typescript-eslint", "react", "prettier"],
  extends: [
    "@react-native",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  rules: {
    "prettier/prettier": "error",
    "react/react-in-jsx-scope": "off"
  },
  settings: {
    react: { version: "detect" }
  }
};
