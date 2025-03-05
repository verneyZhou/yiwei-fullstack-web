module.exports = {
  extends: ["taro/react"],
  parser: "@typescript-eslint/parser", // 解析.ts 文件
  plugins: [
    // 插件
    "react",
    "@typescript-eslint",
  ],
  rules: {
    "react/jsx-uses-react": "off",
    "react/react-in-jsx-scope": "off",
    "jsx-quotes": "off",
    "no-unused-vars": "warn",
    // // 禁止出现未使用过的变量
    "no-unused-vars": "off",
    // // 缩进风格
    indent: ["warn", 2, { SwitchCase: 1 }],
    // // 是否应该在行尾使用分号
    // semi: ["error", "always", { omitLastInOneLineBlock: true }],
    // // 强制使用一致的单引号
    // quotes: ["error", "single"],
    // // 最后一行
    // "eol-last": 1,
    // // 强制在 JSX 属性中一致地使用双引号或单引号
    // "jsx-quotes": ["error", "prefer-single"],
    // // 未重新赋值的变量使用 const 而不是 let
    // "prefer-const": "warn",

    // semi: ["error", "always"],
    // "no-undef": 0,
    // "import/first": 0,
    // "space-infix-ops": 1,
    // "array-bracket-spacing": 0,
    // "object-curly-spacing": ["error", "always"],
    // "spaced-comment": 2,
    // "no-unused-vars": 0,
    // "react/no-unused-state": 0,
    // "react/sort-comp": 0,
    // "react/self-closing-comp": 1,
    // "react/no-multi-comp": 0,
    "react/jsx-filename-extension": [
      1,
      { extensions: [".js", ".jsx", ".tsx", ".ts"] },
    ],
    // "@typescript-eslint/no-unused-vars": [1, { varsIgnorePattern: "React" }],
    // "@typescript-eslint/no-undef": 0,
    // "@typescript-eslint/explicit-function-return-type": 0,
    // "@typescript-eslint/no-empty-function": 0,
    // "@typescript-eslint/no-explicit-any": 0,
    // "jsx-quotes": ["error", "prefer-double"],
    // "import/prefer-default-export": 0,
    // "@typescript-eslint/camelcase": 0,
    // "@typescript-eslint/ban-ts-ignore": 0,
    // "@typescript-eslint/no-inferrable-types": 0,
    // "@typescript-eslint/no-shadow": 0,
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
