module.exports = {
  extends: [
    "stylelint-config-standard",
    // 'stylelint-config-recess-order' // 该插件的作用是强制你按照某个顺序编写 css。例如先写定位，再写盒模型，再写内容区样式，最后写 CSS3 相关属性。这样可以极大的保证我们代码的可读性。
  ],
  rules: {
    "at-rule-no-unknown": [
      true,
      { ignoreAtRules: ["mixin", "extend", "content", "include"] },
    ],
    indentation: 4,
    "no-descending-specificity": null, // 禁止特异性较低的选择器在特异性较高的选择器之后重写
  },
};
