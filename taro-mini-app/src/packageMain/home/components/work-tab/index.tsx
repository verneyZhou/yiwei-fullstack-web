import { View, Button } from '@tarojs/components';

import './index.scss';

export default function WorkTab (props) {
  const {list = [], tab = '', update} = props;

  const onTab = (item) => {
    if (item.code === tab) return;
    update && update(item);
  };

  return (
    <ul className='work-tab flex-center-start'>
      {
        list?.map(item => {
          return (
            <li key={item.code} className={`item flex-center-center ${item.code === tab ? 'active' : ''}`} onClick={() => onTab(item)}>
              <span>{item.label}</span>
            </li>
          );
        })
      }
    </ul>
  );
}
