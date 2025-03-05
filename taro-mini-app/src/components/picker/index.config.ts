export default {
  navigationBarTitleText: 'Picker',
  styleIsolation: 'isolated', // 启用样式隔离, 在自定义组件内外，使用 class 指定的样式将不会相互影响
  virtualHost: true, // 虚拟节点，不希望这个节点本身可以设置样式、响应 flex 布局，样式由自定义组件本身完全决定
};
