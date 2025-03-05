import React, { useState, useEffect, useRef } from "react";
import { View, Text, Button, Image } from "@tarojs/components";
import Taro, {
  useDidShow,
  useDidHide,
  useLoad,
  useUnload,
  useReady,
} from "@tarojs/taro";

import axios from "axios";
import { useAppStore, useSelector } from '@/store';

import { Button as VanButton } from "@antmjs/vantui";
import officeToast from "@/components/toast";
import OfficeDialog from "@/components/dialog/dialog";
import officeDialog from "@/components/dialog";

import { getHome, uploadFile } from "@/services/home";
import { getV1List, postV2List, getNews, getUserList, getDouban } from "@/services/common";
import dogPic from "@/assets/images/dog.jpg";

import "./index.scss";

const Home = () => {
  const { userInfo } = useAppStore(state => state);
  const { testData, setTestData } = useAppStore(useSelector(['testData', 'setTestData']));
  const [list, setList] = useState<number[]>([]);
  const [imgList] = useState<any[]>([
    dogPic,
    "https://gips0.baidu.com/it/u=838505001,1009740821&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f254_80",
  ]);

  const dialogRef = useRef<any>();

  // 等同于页面的 onLoad 生命周期钩子。
  useLoad(() => {
    console.log("===home onLoad");
    const instance = Taro.getCurrentInstance();
    console.log("===instance", instance);
  });

  // 等同于页面的 onReady 生命周期钩子。
  useReady(() => {
    console.log("=====home useReady");
  });

  //  等同于页面的 onUnload 生命周期钩子。
  useUnload(() => {
    console.log("====home onUnload");
  });

  // 页面显示/切入前台时触发。等同于 componentDidShow 页面生命周期钩子。
  useDidShow(() => {
    console.log("===home componentDidShow");
  });

  useDidHide(() => {
    console.log("====home componentDidHide");
  });

  useEffect(() => {
    console.log('=====userInfo', userInfo);
    console.log("====token", useAppStore.getState().token);
    console.log("====testData", testData);
  }, [testData]);

  useEffect(() => {
    console.log("====list change");
  }, [list]);

  const changeName = () => {
    const item = +new Date();
    list.push(item);
    setList([...list]);
  };

  const handleGetHome = async () => {
    try {
      Taro.showLoading({
        title: "加载中...",
        mask: true,
      });
      const res = await getHome({ keyword: "test" });
      console.log(res);
    } catch (err) {
      console.log(err);
    } finally {
      Taro.hideLoading();
    }
  };

  const handleUpload = () => {
    Taro.chooseImage({
      count: 1,
      sourceType: ["album", "camera"],
      success: async (res) => {
        console.log("=====chooseImage", res);
        const tempFilePaths = res.tempFilePaths[0];
        try {
          const uploadRes = await uploadFile(tempFilePaths);
          console.log(uploadRes);
        } catch (err) {
          console.log(err);
        }
      },
      fail: (err) => {
        console.log(err);
        Taro.showModal({
          title: "提示",
          content: JSON.stringify(err) || "上传图片失败",
          success: function (res) {
            if (res.confirm) {
              console.log("用户点击确定");
            } else if (res.cancel) {
              console.log("用户点击取消");
            }
          },
        });
      },
    });
  };

  // 获取设备信息：https://docs.taro.zone/docs/apis/base/system/getDeviceInfo
  const handleGetDevice = () => {
    console.log(Taro.canIUse("openBluetoothAdapter"));
    const deviceInfo = Taro.getDeviceInfo();
    console.log("====deviceInfo", deviceInfo);
    const appBaseInfo = Taro.getAppBaseInfo();
    console.log("=====appBaseInfo", appBaseInfo);
    Taro.getSystemInfo({
      success: (res) => console.log("==success===getSystemInfo", res),
    }).then((res) => console.log("==res====getSystemInfo", res));
  };

  const changeTitle = () => {
    Taro.setNavigationBarTitle({
      title: "新标题",
      success: (res) => {
        console.log("====res", res);
      },
      fail: (err) => {
        console.log("====err", err);
      },
    });
  };

  const checkImage = () => {
    Taro.previewImage({
      current: "", // 当前显示图片的http链接
      urls: imgList, // 需要预览的图片http链接列表
    });
  };

  const handleLocation = () => {
    Taro.getLocation({
      type: "gcj02", //返回可以用于 Taro.openLocation的经纬度
      success: function (res) {
        console.log("====getLocation success", res);
        const latitude = res.latitude;
        const longitude = res.longitude;
        Taro.openLocation({
          latitude,
          longitude,
          scale: 18,
          success: (res) => {
            console.log("====openLocation success", res);
          },
          fail: (err) => {
            console.log("====openLocation fail", err);
          },
        });
      },
      fail: (err) => {
        console.log("===getLocation fail", err);
      },
    });
  };

  // 调微信原生方法
  const onMiniClick = () => {
    const env = process.env.TARO_ENV;
    console.log("=====env", env, process.env.NODE_ENV);
    if (env !== "weapp" || process.env.NODE_ENV !== "production") return;
  };

  const onToast = (type) => {
    officeToast[type]("这是一个toast");
  };
  const onDialog = () => {
    dialogRef.current?.show({
      title: "标题",
      subTitle: "副标题",
      content: "内容",
      confirmText: "确定11",
      cancelText: "取消11",
      // preventLayer: true,
      // preventConfirm: true,
      confirm: () => {
        console.log("===onConfirm");
      },
      cancel: () => {
        console.log("===onCancel");
      },
    });
  };

  const onDialogV2 = () => {
    officeDialog({
      title: "标题",
      subTitle: "副标题",
      content: "内容" + +new Date(),
      confirmText: "确定22",
      cancelText: +new Date() % 2 ? "取消22" : false,
      preventLayer: true,
      preventConfirm: true,
      confirm: () => {
        officeDialog.hide();
      },
      cancel: () => {},
    });
  };

  const onAPI = async (str: string) => {
    const apiMap = {
      v1: getV1List,
      v2: postV2List,
      new: getNews,
      user: getUserList,
      douban: getDouban,
    };
    try {
      const res = await apiMap[str]();
      console.log("=====getV1List", res);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View className="home-page-wrapper pt-6 pb-10">
      <View className="text-[#acc855] text-[40px] text-center">
        Hello home!
      </View>
      {list.map((item) => {
        return (
          <View key={item} className="list-item">
            {item}
          </View>
        );
      })}
      <View>
        <p>vantui 组件</p>
        <VanButton type="default">默认按钮</VanButton>
        <VanButton type="primary">主要按钮</VanButton>
        <VanButton type="info">信息按钮</VanButton>
        <VanButton type="warning">警告按钮</VanButton>
        <VanButton type="danger">危险按钮</VanButton>
      </View>

      <Button onClick={changeName}>add list</Button>
      <Button onClick={handleGetHome}>getHome</Button>
      <Button onClick={handleUpload}>上传图片</Button>
      <Button onClick={handleGetDevice}>获取设备信息</Button>
      <Button onClick={changeTitle}>改变页面标题</Button>
      <View>
        {imgList.map((src) => {
          return <Image className="image-show" src={src} />;
        })}
      </View>
      <Button onClick={checkImage}>查看图片</Button>
      <Button onClick={handleLocation}>查看位置</Button>
      <Button
        onClick={() => Taro.navigateTo({ url: "/pages/login/index" })}
        // onClick={() => Taro.switchTab({ url: '/pages/login/index' })}
      >
        跳转至登录页面
      </Button>
      <div>html原生标签div</div>
      <span>html原生标签span</span>
      <Button onClick={onMiniClick}>调微信原生方法</Button>
      <Button
        onClick={() => Taro.navigateTo({ url: "/pages/index/index" })}
        // onClick={() => Taro.switchTab({ url: '/pages/login/index' })}
      >
        跳转至原生首页
      </Button>
      <img
        className="image-show"
        src="https://gips0.baidu.com/it/u=838505001,1009740821&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f254_80"
        alt="img标签"
      />
      <div>
        <VanButton onClick={() => onToast("success")} type="primary">
          toast success
        </VanButton>
        <VanButton onClick={() => onToast("warning")} type="primary">
          toast warning
        </VanButton>
        <VanButton onClick={() => onToast("loading")} type="primary">
          toast loading
        </VanButton>
        <VanButton onClick={() => onToast("hide")} type="primary">
          toast hide
        </VanButton>
      </div>
      <div>
        <VanButton onClick={() => onDialog()} type="primary">
          dialog open
        </VanButton>
        <VanButton onClick={() => onDialogV2()} type="primary">
          dialog open v2
        </VanButton>
      </div>
      <OfficeDialog ref={dialogRef} title="标题11">
        <div>自定义内容</div>
      </OfficeDialog>
      <div>
        <VanButton onClick={() => onAPI("v1")} type="primary">
          api/v1/list
        </VanButton>
        <VanButton onClick={() => onAPI("v2")} type="primary">
          api/v2/list
        </VanButton>
        <VanButton onClick={() => onAPI("new")} type="primary">
          api/new
        </VanButton>
      </div>
      <div>
        <VanButton onClick={() => onAPI("user")} type="primary">
          api/user/getUserList
        </VanButton>
        <VanButton onClick={() => onAPI("douban")} type="primary">
          douban
        </VanButton>
      </div>
      <div>
        <VanButton onClick={() => {
          setTestData({id: +new Date()})
        }} type="primary"
        >change store</VanButton>
      </div>
    </View>
  );
};

export default Home;
