import './index.scss';

import React, { useState, useEffect, memo, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Taro from '@tarojs/taro';
import { Skeleton } from '@antmjs/vantui';


import {Link} from '@/components/link';
import {userInfoItemTy} from '@/types/home';
import avatarBoy from '@/assets/images/home/avatar-boy.png';
import avatarGirl from '@/assets/images/home/avatar-girl.png';




const userInfoList: userInfoItemTy[] = [
  { label: '能力值', value: '', code: 'ability', field: 'cap_value' },
  { label: '幸运值', value: '', code: 'lucky', field: 'luck_value' },
  { label: '排名', value: '', code: 'range', field: 'my_ranking' },
  { label: '已工作', value: '', code: 'work', field: 'work_time' },
];


// 底部导航
const UserInfo = () => {
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<any>({
    avatar: '',
    hit_status: 1,
    sex: 1,
  });

  const defaultAvatar = useMemo(() => {
    return userInfo.sex === 1 ? avatarBoy : avatarGirl;
  }, []);

  const infoList = useMemo(() => {
    return userInfoList.map((item, index) => {
      return {
        ...item,
        value: '100+'
      };
    });
  }, []);
    

  return (
    <div className='home-userinfo-container'>
      {
        loading ? <Skeleton title row={2} /> : 
          <>
            <div className='name-guide flex-center-between'>
              <div className='name flex-center-start'>
                <span className='label'>我的办公桌</span>
                <span className='edit-btn'>编辑</span>
              </div>
              {/* <div>
                            <span className="link-btn">攻略</span>
                        </div> */}
              <div className='avatar office-linear-border'>
                <img src={defaultAvatar} alt='' />
              </div>
            </div>
            <ul className='total-info flex-center-start'>
              {
                infoList.map((item, index) => {
                  return <li key={index} className='item flex-column-center'>
                    <span className='num'>{item.value}</span>
                    <div className='desc flex-center-start'>
                      <b className={item.code}></b>
                      <span>{item.label}</span>
                    </div>
                  </li>;
                })
              }
            </ul>
          </>
      }
    </div>
  );


};

export default UserInfo;
