import { View, Button } from '@tarojs/components';

import './index.scss';

export default function (props) {
  return (
    <View className='picker-comp-wrapper'>
      <View>Picker组件: {props.title}</View>
      {props.list.map(item => (
        <View>PickerItem: {item}</View>
      ))}
      <Button onClick={() => props.onButtonClick()}>Click me +</Button>
    </View>
  );
}
