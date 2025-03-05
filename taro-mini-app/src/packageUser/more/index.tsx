import React, { useCallback, useState } from 'react';
import Taro, {useShareAppMessage, useShareTimeline} from '@tarojs/taro';
import { View, Text, Button, Image, Navigator} from '@tarojs/components';
import { useEnv, useNavigationBar, useModal, useToast, useSystemInfo } from 'taro-hooks';
import logo from '@/assets/images/hook.png';
import dog from '@/assets/images/dog.jpg';

import './index.scss';

const Index = () => {
  const env = useEnv();
  const systemInfo = useSystemInfo();
  console.log('===init hooks', env, systemInfo, process.env.TARO_ENV);


  const { setTitle } = useNavigationBar({ title: 'Taro Hooks' });
  const showModal = useModal({
    title: 'Taro Hooks Canary!',
    showCancel: false,
    confirmColor: '#8c2de9',
    confirmText: '支持一下'
  });
  const { show } = useToast({ mask: true });

  const handleModal = useCallback(() => {
    showModal({ content: '不如给一个star⭐️!' }).then(() => {
      show({ title: '点击了支持!' });
    });
  }, [show, showModal]);


  const [btns] = useState<any[]>([
    {
      text: '页面主操作 Normal',
      size: 'default',
      type: 'primary'
    },
    {
      text: '页面主操作 Loading',
      size: 'default',
      type: 'primary',
      loading: true,
    },
    {
      text: '页面主操作 Disabled',
      size: 'default',
      type: 'primary',
      disabled: true,
    },
    {
      text: '页面次要操作 Normal',
      size: 'default',
      type: 'default'
    },
    {
      text: '页面次要操作 Disabled',
      size: 'default',
      type: 'default',
      disabled: true,
    },
    {
      text: '警告类操作 Normal',
      size: 'mini',
      type: 'warn'
    },
    {
      text: '警告类操作 Disabled',
      size: 'mini',
      type: 'warn',
      disabled: true,
    },
    {
      text: 'getPhoneNumber',
      size: 'mini',
      type: 'primary',
      openType:'getPhoneNumber',
      onGetPhoneNumber: (data) => {
        console.log('====onGetPhoneNumber', data);
      }
    },
    {
      text: 'contact',
      size: 'mini',
      type: 'primary',
      openType:'contact',
      showMessageCard: true,
      onContact: (data) => {
        console.log('====onContact', data);
      }
    },
    {
      text: 'getUserInfo',
      size: 'mini',
      type: 'primary',
      openType:'getUserInfo',
      onGetUserInfo: (data) => {
        console.log('====onGetUserInfo', data);
      }
    },
    {
      text: 'openSetting',
      size: 'mini',
      type: 'primary',
      withSubscriptions: true,
      openType:'openSetting',
      onOpenSetting: (data) => {
        console.log('====openSetting', data);
      }
    },
    {
      text: 'launchApp',
      size: 'mini',
      type: 'primary',
      openType:'launchApp',
      appParameter:'wechat',
      onLaunchApp: (data) => {
        console.log('====onLaunchApp', data);
      },
      onError: (err) => {
        console.log('==launchApp==onError', err);
      }
    },
    {
      text: 'chooseAvatar',
      size: 'mini',
      type: 'primary',
      openType:'chooseAvatar',
      onChooseAvatar: (data) => {
        console.log('====onChooseAvatar', data);
      }
    },
    {
      text: 'agreePrivacyAuthorization',
      size: 'mini',
      type: 'primary',
      openType:'agreePrivacyAuthorization',
      onAgreePrivacyAuthorization: (data) => {
        console.log('====onAgreePrivacyAuthorization', data);
      }
    },
    {
      text: 'login(百度小程序支持)',
      size: 'mini',
      type: 'primary',
      openType:'login',
      onLogin: (data) => {
        console.log('====login', data);
      }
    },
    {
      text: 'subscribe',
      size: 'mini',
      type: 'primary',
      openType:'subscribe',
      subscribeId: 1234,
      onSubscribe: (data) => {
        console.log('====onSubscribe', data);
      }
    },
    {
      text: 'share',
      size: 'mini',
      type: 'primary',
      openType:'share',
      shareMessageTitle: '分享标题11',
      shareMessageImg: logo,
      subscribeId: 1234,
      onSubscribe: (data) => {
        console.log('====onSubscribe', data);
      }
    },
  ]);


  if (process.env.TARO_ENV === 'weapp') {
    // 显示当前页面的转发按钮
    Taro.showShareMenu({
      withShareTicket: true, // https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/share.html
      success:(res) => {
        console.log('==showShareMenu==success', res);
      },
      fail: err => {
        console.log('===showShareMenu====fail', err);
      }
    });

    // 获取转发详细信息
    const shareTicket = Taro.getStorageSync('shareTicket');
    console.log('====shareTicket', shareTicket);
    shareTicket && Taro.getShareInfo({
      shareTicket,
      success: res => {
        console.log('==getShareInfo==success', res);
      },
      fail: err => {
        console.log('=====getShareInfo====err', err);
      }
    });
  }

  


  // 发送给朋友: 监听用户点击页面内转发按钮（Button 组件 openType='share'）或右上角菜单“转发”按钮的行为，并自定义转发内容。等同于 onShareAppMessage 页面生命周期钩子。
  useShareAppMessage(res => {
    console.log('====useShareAppMessage', res);
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
      title: '转发标题111',
      imageUrl: dog,
      path: '/pages/more/index?id=123',
    };
  });

  // 监听右上角菜单“分享到朋友圈”按钮的行为，并自定义分享内容
  useShareTimeline(res => {
    console.log('=====onShareTimeline', res);
    return {
      title: '转发标题222',
      imageUrl: dog,
      path: '/pages/more/index?id=123',
    };
  });




  return (
    <View className='wrapper'>
      <Image className='logo' src={logo} />
      <Text className='desc'>为Taro而设计的Hooks Library~~🔥🔥</Text>
      <Text className='desc'>
        目前覆盖70%官方API. 抹平部分API在H5端短板. 提供近40+Hooks!
        并结合ahook适配Taro! 更多信息可以查看新版文档: <a href='https://next-version-taro-hooks.vercel.app/' target='_blank'>https://next-version-taro-hooks.vercel.app/</a>
      </Text>
      <View className='list'>
        <Text className='label'>运行环境</Text>
        <Text className='note'>{env}</Text>
      </View>
      <Button className='button' onClick={() => setTitle('Taro Hooks Nice!')}>
        设置标题
      </Button>
      <Button className='button' onClick={handleModal}>
        使用Modal
      </Button>
      <Text className='title'>按钮组件</Text>
      <View className='btns-wrapper'>
        {
          btns.map((btn, index) => {
            return (
              <Button key={index} {...btn}>{btn.text}</Button>
            );
          })
        }
      </View>
      
    </View>
  );
};

export default Index;
