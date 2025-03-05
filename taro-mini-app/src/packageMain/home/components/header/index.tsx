import './index.scss';

import React, { useState, useEffect, memo, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Taro from '@tarojs/taro';
import { Icon } from '@antmjs/vantui';

import {Link} from '@/components/link';
import {infoItemTy} from '@/types/home';

import officeLogo from '@/assets/images/home/office-logo.png';
import coinIcon from '@/assets/images/home/hz-header-icon.png';
import likeIcon from '@/assets/images/home/like-icon.png';
import commentIcon from '@/assets/images/home/comment-icon.png';
import htIcon from '@/assets/images/home/ht-header-icon.png';



const numberFormat = (num: number) => {
  // 截取
  const slip = (val: number) => {
    const _arr = `${val}`.split('.');
    if (!_arr[1]) {
      return _arr[0];
    }
    return `${_arr[0]}.${_arr[1].substring(0, 2)}`;
  };
  if (num > 10000) {
    return parseInt(`${num / 10000}`) + 'w+';
  } else {
    return slip(num);
  }
};

const InfoList: infoItemTy[] =[
  {
    icon: htIcon,
    value: 'exchange',
    num: 0,
    field: 'ht_amount',
  },
  { icon: coinIcon, value: 'coin', num: 456, field: 'hz_amount' },
  { icon: likeIcon, value: 'like', num: 99999, field: 'likes_count' },
  { icon: commentIcon, value: 'comment', num: 4433, field: 'comment_count' },
];
// 底部导航
const HomeHeader = () => {

  const [infoList, setInfoList] = useState<infoItemTy[]>(InfoList);
  useEffect(() => {
  }, []);


  return (
    <ul className='home-header-container flex-center-between box-border'>
      <img src={officeLogo} alt='' className='logo' />
      <ul className='header-info flex-center-start'>
        {
          infoList.map((item, index) => {
            return (
              <li key={index} className='item flex-center-start'>
                <img src={item.icon} alt='' />
                <span>{numberFormat(item.num)}</span>
              </li>
            );
          })
        }
      </ul>
    </ul>
  );


};

export default HomeHeader;
