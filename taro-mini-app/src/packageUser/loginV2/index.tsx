import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, Image } from '@tarojs/components';
import Taro, { useDidShow, useDidHide, useLoad, useUnload, useReady  } from '@tarojs/taro';
import { useModal, useToast } from 'taro-hooks';

import { GetTest, GetTest2, GetTest3, GetTest4 } from '@/services/more';

const Login = () => {

  useEffect(() => {
    console.log('====Login Page load');
    const instance = Taro.getCurrentInstance();
    console.log('===instance', instance);
  }, []);



  const showModal = useModal({
    title: 'Taro Hooks Canary!',
    showCancel: false,
    confirmColor: '#8c2de9',
    confirmText: '确定'
  });
  // const { show } = useToast({ mask: true });

  const handleModal = useCallback((content) => {
    showModal({ content, title: '提示' });
  }, [showModal]);



  const getSetting = () => {
    Taro.getSetting({
      withSubscriptions: true, // 是否同时获取用户订阅消息的订阅状态
      success: function (res) {
        console.log('====getSetting success', res);
        handleModal(JSON.stringify(res));
        // res.authSetting = {
        //   "scope.userInfo": true,
        //   "scope.userLocation": true
        // }
      },
      fail: (err) => {
        console.log('====getSetting err', err);
      }
    });
  };

  const openSetting = () => {
    Taro.openSetting({
      withSubscriptions: true, // 是否同时获取用户订阅消息的订阅状态
      success: function (res) {
        console.log('====openSetting success', res);
        handleModal(JSON.stringify(res));
      }
    });
  };

  const getAccount = () => {
    const accountInfo = Taro.getAccountInfoSync();
    console.log('====accountInfo', accountInfo);
    handleModal(JSON.stringify(accountInfo));
  };


  const onLogin = () => {
    Taro.checkSession({
      success: function (res) {
        console.log('====checkSession success', res);
        handleModal(JSON.stringify(res));
        //session_key 未过期，并且在本生命周期一直有效
      },
      fail: function (err) {
        console.log('====checkSession fail', err);
        // session_key 已经失效，需要重新执行登录流程
        Taro.login({
          success: function (res) {
            console.log('===login', res);
            handleModal(JSON.stringify(res));
            if (res.code) {
              //发起网络请求
              Taro.request({
                url: 'https://test.com/onLogin',
                data: {
                  code: res.code
                }
              });
            } else {
              console.log('登录失败！' + res.errMsg);
            }
          }
        });
      }
    });
  };


  const getUserProfile = () => {
    Taro.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
        console.log('====getUserProfile===success', res);
        handleModal(JSON.stringify(res));
      },
      fail: err => {
        console.log('===getUserProfile==fail', err);
      }
    });
  };

  const getUserInfo = () => {
    Taro.getUserInfo({
      success: function(res) {
        console.log('====getUserInfo===success', res);
        handleModal(JSON.stringify(res));
      }
    });
  };

  const onAuthorize = () => {
    Taro.authorize({
      scope: 'scope.userInfo',
      success(res) {
        console.log('===authorize success', res);
        handleModal(JSON.stringify(res));
      },
      fail() {
        // 用户没有授权，可以在失败回调弹窗中说明用途，引导用户进行授权。
        console.log('===authorize fail');
        handleModal(JSON.stringify('授权失败'));
      }
    });
  };


  function handleTest(ind: number) {
    const params = { user: 'test' };
    if(ind === 1) {
      params['pwd'] = '123456';
    }
    switch (ind) {
      case 0:
        GetTest(params).then(res => console.log('GetTest:>> ', res));
        break;
      case 1:
        GetTest2(params).then((res) => console.log('GetTest:>> ', res));
        break;
      case 2:
        GetTest3(params).then((res) => console.log('GetTest:>> ', res));
        break;
      case 3:
        GetTest4().then((res) => console.log('GetTest:>> ', res));
        break;
    }
  }

  return (
    <View className='wrapper'>
      <Button onClick={getSetting}>getSetting</Button>
      <Button onClick={openSetting}>openSetting</Button>
      <Button onClick={getAccount}>getAccount</Button>
      <Button onClick={onLogin}>login</Button>
      <Button onClick={getUserProfile}>getUserProfile</Button>
      <Button onClick={getUserInfo}>getUserInfo</Button>
      <Button onClick={onAuthorize}>authorize</Button>

      <Button type='primary' onClick={() => handleTest(0)}>
        http
      </Button>
      <Button type='primary' onClick={() => handleTest(1)}>
        http post
      </Button>
      <Button type='primary' onClick={() => handleTest(2)}>
        http postJSON
      </Button>
      <Button type='primary' onClick={() => handleTest(3)}>
        http postERR
      </Button>
    </View>
  );
};

export default Login;
