import "./index.scss";

import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
  useMemo,
} from "react";
import Taro from "@tarojs/taro";
import { useAppStore, useSelector } from "@/store";
import { View, Button, Input, Image } from "@tarojs/components";
import { Button as VanButton } from "@antmjs/vantui";

import { promisify } from "@/utils/wx";
import officeToast from "@/components/toast";
import { _wxLogin, _getUserInfo, _updateUserInfo } from "@/services/user";

const defaultAvatarUrl =
  "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0";

// 首页入口
export default function App() {
  const { userInfo, setUserInfo, reset } = useAppStore(
    useSelector(["userInfo", "setUserInfo", "reset"])
  );
  const [token, setToken] = useState<any>(Taro.getStorageSync("token") || "");
  const canIUseGetUserProfile = useMemo(() => {
    return !!Taro.canIUse("getUserProfile");
  }, []);
  const canIUseNicknameComp = useMemo(() => {
    return !!Taro.canIUse("input.type.nickname");
  }, []);
  const hasUserInfo = useMemo(() => {
    return (
      userInfo &&
      userInfo.nick_name &&
      userInfo.avatar &&
      userInfo.avatar !== defaultAvatarUrl
    );
  }, [userInfo]);

  console.log("canIUseGetUserProfile", canIUseGetUserProfile);

  // 微信登录
  const wxLogin = async (payload) => {
    console.log("onGetUserInfo", payload);
    if (payload.target.errMsg.indexOf("ok") === -1) {
      officeToast.error(payload.target.errMsg?.split(":")[1]);
      return;
    }
    try {
      const res: any = await promisify(Taro.login)(); // 调wx.login方法获取code
      console.log("====res", res);
      let params = {
        code: res.code,
        type: "weapp",
      };
      const loginRes = await _wxLogin(params);
      console.log("loginRes", loginRes);
      const _token = loginRes?.data?.token;
      if (loginRes.code === 200 && _token) {
        officeToast.success("登录成功！");
        setToken(_token);
        Taro.setStorageSync("token", _token);
        return;
      }
    } catch (error) {
      console.log(error);
      officeToast.error(error?.message);
    }
    // promisify(wx.login).then((res) => {
    //     console.log('login res', res);
    // });
  };

  // 手机号登录
  const onGetPhoneNumber = async (payload) => {
    console.log("onGetPhoneNumber", payload);
    if (payload?.detail?.errMsg !== "getPhoneNumber:ok") {
      officeToast.error(payload?.detail?.errMsg?.split(":")[1]);
      return;
    }
    try {
      const res: any = await promisify(Taro.login)(); // 调wx.login方法获取code
      console.log("====res", res);
    } catch (err) {
      console.log(err);
      officeToast.error(err?.message);
    }
  };

  // 获取用户信息
  const getUserProfile = () => {
    Taro.getUserProfile({
      desc: "用于完善用户信息", // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (payload) => {
        // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
        console.log("====getUserProfile===success", payload);
        if (payload?.errMsg !== "getUserProfile:ok") {
          officeToast.error(payload?.errMsg?.split(":")[1]);
          return;
        }
        setUserInfo({
          ...userInfo,
          nick_name: payload.userInfo.nickName,
          avatar: payload.userInfo.avatarUrl,
        });
      },
      fail: (err) => {
        console.log("===getUserProfile==fail", err);
      },
    });
  };

  // 选择头像
  const onChooseAvatar = (payload) => {
    console.log("onChooseAvatar", payload);
    setUserInfo({
      ...userInfo,
      avatar: payload.detail.avatarUrl,
    });
  };
  // 输入昵称
  const onInputChange = (payload) => {
    console.log("onInputChange", payload);
    setUserInfo({
      ...userInfo,
      nick_name: payload.detail.value,
    });
  };

  // 获取用户信息
  const handleUserInfo = async () => {
    try {
      const res = await _getUserInfo();
      console.log("====res", res);
      setUserInfo(res.data);
      officeToast.success("获取成功！");
    } catch (error) {
      console.log(error);
    }
  };

  // 更新用户信息
  const handleUpdateUserInfo = async () => {
    try {
      let params = {
        nick_name: userInfo?.nick_name,
        avatar: userInfo?.avatar,
      };
      const res = await _updateUserInfo(params);
      console.log("====res", res);
      officeToast.success("更新成功！");
    } catch (error) {
      console.log(error);
    }
  };

  // 清除token，退出登录
  const handleClearToken = () => {
    reset();
    Taro.removeStorageSync("token");
    setToken(null);
    officeToast.success("退出登录成功！");
  };

  return (
    <View className="login-page-wrapper">
      <View className="login-page-content flex flex-col items-center justify-center h-full w-full">
        {!token ? (
          <>
            <VanButton
              type="primary"
              open-type="getUserInfo"
              onGetUserInfo={wxLogin}
            >
              微信登录
            </VanButton>
            <VanButton
              type="primary"
              className="mr-t-10"
              open-type="getPhoneNumber"
              onGetPhoneNumber={onGetPhoneNumber}
            >
              手机号登录
            </VanButton>
          </>
        ) : (
          <>
            <View className="mb-t-10">已登录</View>
            <VanButton type="primary" onClick={handleUserInfo}>
              获取用户信息
            </VanButton>
            {!hasUserInfo && canIUseNicknameComp ? (
              <View>
                <Button
                  className="avatar-wrapper"
                  open-type="chooseAvatar"
                  onChooseAvatar={onChooseAvatar}
                >
                  <Image className="avatar" src={userInfo?.avatar}></Image>
                </Button>
                <Input
                  type="nickname"
                  className="weui-input"
                  placeholder="请输入昵称"
                  onInput={onInputChange}
                />
              </View>
            ) : null}
            {!hasUserInfo && !canIUseNicknameComp && canIUseGetUserProfile ? (
              <VanButton type="primary" onClick={getUserProfile}>
                请选择头像和昵称
              </VanButton>
            ) : null}
            {!hasUserInfo && !canIUseNicknameComp && !canIUseGetUserProfile ? (
              <View>请使用2.10.4及以上版本基础库</View>
            ) : null}
            {hasUserInfo ? (
              <View>
                <Image className="avatar" src={userInfo?.avatar}></Image>
                <View className="nickname">{userInfo?.nick_name}</View>
                <VanButton type="primary" onClick={handleUpdateUserInfo}>
                  更新用户信息
                </VanButton>
                <VanButton type="primary" onClick={handleClearToken}>
                  退出登录
                </VanButton>
              </View>
            ) : null}
          </>
        )}
      </View>
    </View>
  );
}
