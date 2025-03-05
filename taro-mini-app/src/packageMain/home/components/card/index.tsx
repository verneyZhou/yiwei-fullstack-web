import './index.scss';

import React, { Suspense, useState } from 'react';
import { Loading } from '@antmjs/vantui';



const Card = (props: any) => {
  const {title, btnTxt, desc} = props || {};
  const [list, setList] = useState([]);
  return (
    <div className='home-card-wrapper flex flex-col items-center'>
      <div className='title-wrapper flex-center-between'>
        <div className='title flex-center-start'>
          <h3>{title}</h3>
          {desc ? <span className='desc'>{desc}</span> : null}
        </div>
        <span className='link-btn'>{btnTxt}</span>
      </div>
      <p className='no-data-tip'>暂无数据~</p>
      {props?.children}
    </div>
  );
};

// 底部导航
const HomeCard = (props) => {
  return (
    <Suspense fallback={<Loading size='24px' vertical style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }} >加载中...</Loading>}>
      <Card {...props} />
    </Suspense>
  );
};

export default HomeCard;
