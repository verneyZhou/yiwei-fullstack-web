import './index.scss';

import React, { useState, useEffect, memo, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Taro from '@tarojs/taro';


import {Link} from '@/components/link';
import Header from '../header';


import officeTab from '@/assets/images/home/office-tab.png';
import officeTabActive from '@/assets/images/home/office-tab-active.png';
import workTab from '@/assets/images/home/work-tab.png';
import workTabActive from '@/assets/images/home/work-tab-active.png';
import myTab from '@/assets/images/home/my-tab.png';
import myTabActive from '@/assets/images/home/my-tab-active.png';
import fairTab from '@/assets/images/home/fair-tab.png';
import fairTabActive from '@/assets/images/home/fair-tab-active.png';

import {tabItemTy} from '@/types/home';


const tabList: tabItemTy[] = [
  {
    label: '首页',
    value: 'index',
    path: '/index',
    icon: officeTab,
    activeIcon: officeTabActive,
  },
  {
    label: '市集',
    value: 'fair',
    path: '/fair',
    icon: fairTab,
    activeIcon: fairTabActive,
  },
  {
    label: '鱼池',
    value: 'community',
    path: '/community',
    icon: workTab,
    activeIcon: workTabActive,
  },
  {
    label: '我的',
    value: 'account',
    path: '/account',
    icon: myTab,
    activeIcon: myTabActive,
  },
];

export default function Layout() {
  
  return (
    <div className='home-page-content'>
      <Header />
      <HomeTab />
      <Outlet />
    </div>
  );
}


// 底部导航
const HomeTab = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  console.log('==HomeTab==pathname', useLocation());
  const curTab:any = useMemo(() => {
    return tabList.find((v) => pathname.indexOf(v.path) === 0) || null;
  }, [pathname]);


  const onTab = (item:tabItemTy ) => {
    if (curTab && item.value === curTab.value) return;
    navigate(item.path);
  };


  return (
    <ul className='home-tab-container flex-center-between'>
      {
        tabList.map((tab: tabItemTy) => {
          return (
            <li
              key={tab.value} className={`flex-column-center tab-item ${curTab && curTab.value === tab.value ? 'active' : ''}`}
              onClick={() => onTab(tab)}

            >
              <img src={`${curTab?.value === tab.value ? [tab.activeIcon] : [tab.icon]}`} alt='' />
              <span>{tab.label}</span>
            </li>
          );
        })
      }
    </ul>
  );


};
