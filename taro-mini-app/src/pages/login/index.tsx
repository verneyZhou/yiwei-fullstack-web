import {
  View,
  Text,
  Image,
  Input,
  Button as TaroButton,
} from "@tarojs/components";
import { useState, useMemo, useEffect, useRef } from "react";
import { Button, Form, Field, Toast, FormItem } from "@antmjs/vantui";
import type { IFormInstanceAPI } from "@antmjs/vantui";
import Taro from "@tarojs/taro";
import "./index.scss";
import { promisify } from "@/utils/wx";
import officeToast from "@/components/toast";
import { debounce } from "@/utils/util";
import {
  _wxLogin,
  _getUserInfo,
  _updateUserInfo,
  _getCaptchaCode,
  _captchaLogin,
  _captchaRegister,
} from "@/services/user";
import { useAppStore, useSelector } from "@/store";

// 注册账号组件
const RegisterForm = (props) => {
  const [captchaInfo, setCaptchaInfo] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const formRef = useRef<IFormInstanceAPI>(null);

  const handleSubmit = async (err, values) => {
    console.log("Form values:", err, values);
    const { username, password, captcha_code, confirm_password } = values;

    // 表单校验
    if (Object.values(values).some((v) => !v)) {
      officeToast.warning("请填写完整的注册信息");
      return;
    }

    if (password !== confirm_password) {
      officeToast.warning("两次密码输入不一致");
      return;
    }

    if (!captchaInfo?.id) {
      officeToast.warning("请先获取验证码");
      return;
    }

    try {
      officeToast.loading("注册中...");
      const res = await _captchaRegister({
        username,
        password,
        confirm_password,
        code: captcha_code,
        captcha_id: captchaInfo.id,
      });
      console.log("register res:", res);
      officeToast.hide();
      if (res.code === 200 && res.data?.token) {
        const _token = res.data.token;
        officeToast.success("注册成功！");
        await props.updateToken(_token, "account");
        setTimeout(() => {
          Taro.redirectTo({
            url: "/packageUser/chat/index",
          });
        }, 500);
      } else {
        officeToast.warning(res.message || "登录失败");
      }
    } catch (error) {
      officeToast.hide();
      console.error("登录失败:", error);
      officeToast.error(error?.message || "登录失败，请稍后重试");
    }
  };

  const getCaptcha = async () => {
    try {
      const res = await _getCaptchaCode();
      console.log("获取验证码成功", res);
      setCaptchaInfo(res.data);
    } catch (error) {
      console.log("获取验证码失败", error);
      officeToast.warning("获取验证码失败,请稍后重试");
    }
  };

  return (
    <>
      <View className="login-header">
        <View className="title">欢迎注册</View>
      </View>
      <Form ref={formRef} onFinish={handleSubmit} className="form-container">
        <FormItem
          name="username"
          rules={[{ required: true, message: "请输入用户名" }]}
          className="form-item"
        >
          <Field
            placeholder="请输入用户名"
            border={false}
            clearable
            leftIcon="user-o"
          />
        </FormItem>

        <FormItem
          name="password"
          rules={[{ required: true, message: "请输入密码" }]}
          className="form-item"
        >
          <Field
            type={showPassword ? "text" : "password"}
            placeholder="请输入密码"
            maxLength={10}
            border={false}
            leftIcon="lock"
            rightIcon={showPassword ? "eye-o" : "closed-eye"}
            onClickIcon={() => setShowPassword(!showPassword)}
            clearable
          />
        </FormItem>

        <FormItem
          name="confirm_password"
          rules={[{ required: true, message: "请确认密码" }]}
          className="form-item"
        >
          <Field
            type={showConfirmPassword ? "text" : "password"}
            placeholder="请确认密码"
            maxLength={10}
            border={false}
            leftIcon="lock"
            rightIcon={showConfirmPassword ? "eye-o" : "closed-eye"}
            onClickIcon={() => setShowConfirmPassword(!showConfirmPassword)}
            clearable
          />
        </FormItem>

        <FormItem
          name="captcha_code"
          rules={[{ required: true, message: "请输入验证码" }]}
          maxLength={6}
          className="form-item captcha-item"
        >
          <View className="captcha-wrapper">
            <Field
              placeholder="请输入验证码"
              border={false}
              clearable
              leftIcon="shield-o"
              onChange={(e) => {
                formRef?.current?.setFieldsValue("captcha_code", e.detail);
              }}
              className="captcha-input"
            />
            <View className="captcha-image" onClick={getCaptcha}>
              {captchaInfo ? (
                <Image src={captchaInfo.image} className="image" />
              ) : (
                <Text>获取验证码</Text>
              )}
            </View>
          </View>
        </FormItem>

        <Button type="primary" formType="submit" className="submit-btn" block>
          注册
        </Button>
        <View className="login-type-switch">
          <Text
            className="switch-btn"
            onClick={() => props.setFormType("login")}
          >
            已有账号？返回登录
          </Text>
        </View>
      </Form>
    </>
  );
};

// 忘记密码组件
const ForgotPasswordForm = (props) => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleSubmit = (values) => {
    console.log("Forgot password form values:", values);
    // TODO: 实现重置密码逻辑
    Toast.success("重置密码成功");
  };

  return (
    <>
      <View className="login-header">
        <View className="title">找回密码</View>
      </View>
      <Form onFinish={handleSubmit} className="form-container">
        <FormItem
          name="username"
          rules={[{ required: true, message: "请输入用户名" }]}
          className="form-item"
        >
          <Field
            placeholder="请输入用户名"
            border={false}
            clearable
            leftIcon="user-o"
          />
        </FormItem>

        <FormItem
          name="newPassword"
          rules={[
            { required: true, message: "请输入新密码" },
            { min: 6, message: "密码至少6位" },
          ]}
          className="form-item"
        >
          <Field
            type={showNewPassword ? "text" : "password"}
            placeholder="请输入新密码"
            border={false}
            leftIcon="lock"
            rightIcon={showNewPassword ? "eye-o" : "closed-eye"}
            onClickIcon={() => setShowNewPassword(!showNewPassword)}
            clearable
          />
        </FormItem>

        <FormItem
          name="confirmPassword"
          rules={[
            { required: true, message: "请确认新密码" },
            { min: 6, message: "密码至少6位" },
          ]}
          className="form-item"
        >
          <Field
            type={showConfirmPassword ? "text" : "password"}
            placeholder="请确认新密码"
            border={false}
            leftIcon="lock"
            rightIcon={showConfirmPassword ? "eye-o" : "closed-eye"}
            onClickIcon={() => setShowConfirmPassword(!showConfirmPassword)}
            clearable
          />
        </FormItem>

        <Button type="primary" formType="submit" className="submit-btn" block>
          重置密码
        </Button>
        <View className="login-type-switch">
          <Text
            className="switch-btn"
            onClick={() => props.setFormType("login")}
          >
            返回登录
          </Text>
        </View>
      </Form>
    </>
  );
};

const LoginPage = () => {
  const { userInfo, setUserInfo } = useAppStore(
    useSelector(["userInfo", "setUserInfo", "reset"])
  );
  const [formType, setFormType] = useState<"login" | "register" | "forgot">(
    "login"
  );
  const [loginType, setLoginType] = useState<"account" | "wechat">("account");
  const [token, setToken] = useState<any>(Taro.getStorageSync("token") || "");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaInfo, setCaptchaInfo] = useState<any>(null);
  const formRef = useRef<IFormInstanceAPI>(null);

  const canIUseNicknameComp = useMemo(() => {
    return !!Taro.canIUse("input.type.nickname");
  }, []);
  const hasUserInfo = useMemo(() => {
    return userInfo;
  }, [userInfo]);

  const getCaptcha = async () => {
    try {
      const res = await _getCaptchaCode();
      console.log("获取验证码成功", res);
      setCaptchaInfo(res.data);
    } catch (error) {
      console.log("获取验证码失败", error);
      officeToast.warning("获取验证码失败,请稍后重试");
    }
  };

  //   账号登录
  const handleSubmit = async (err, values) => {
    console.log("Form values:", err, values);
    const { username, password, captcha_code } = values;

    // 表单校验
    if (!username || !password || !captcha_code) {
      officeToast.warning("请填写完整的登录信息");
      return;
    }

    if (!captchaInfo?.id) {
      officeToast.warning("请先获取验证码");
      return;
    }

    try {
      officeToast.loading("登录中...");
      const loginRes = await _captchaLogin({
        username,
        password,
        code: captcha_code,
        captcha_id: captchaInfo.id,
      });
      console.log("loginRes", loginRes);
      officeToast.hide();
      if (loginRes.code === 200 && loginRes.data?.token) {
        const _token = loginRes.data.token;
        officeToast.success("登录成功");
        await updateToken(_token, "account");
        setTimeout(() => {
          Taro.redirectTo({
            url: "/packageUser/chat/index",
          });
        }, 500);
      } else {
        officeToast.warning(loginRes.message || "登录失败");
      }
    } catch (error) {
      officeToast.hide();
      console.error("登录失败:", error);
      officeToast.error(error?.message || "登录失败，请稍后重试");
    }
  };

  /**
   * 微信登录相关逻辑
   */
  //   微信登录
  const wxLogin = async (payload) => {
    console.log("onGetUserInfo", payload);
    if (payload.target.errMsg.indexOf("ok") === -1) {
      officeToast.error(payload.target.errMsg);
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
        updateToken(_token, "wechat");
      }
    } catch (error) {
      console.log(error);
      officeToast.error(error?.message);
    }
  };

  const updateToken = async (_token: string, user_type?: string) => {
    setToken(_token);
    Taro.setStorageSync("token", _token);
    await handleUserInfo(user_type);
  };

  // 获取用户信息
  const handleUserInfo = async (user_type = "account") => {
    try {
      const res = await _getUserInfo(user_type);
      console.log("====res", res);
      setUserInfo(res.data);
      //   officeToast.success("获取成功！");
    } catch (error) {
      console.log(error);
    }
  };

  // 选择头像
  const onChooseAvatar = (payload) => {
    console.log("onChooseAvatar", payload);
    setUserInfo({
      ...userInfo,
      avatar: payload.detail.avatarUrl,
    });
    handleUpdateUserInfo({
      avatar: payload.detail.avatarUrl,
    });
  };
  // 输入昵称
  const onInputChange = debounce((payload) => {
    console.log("onInputChange", payload);
    setUserInfo({
      ...userInfo,
      nick_name: payload.detail.value,
    });
    handleUpdateUserInfo({
      nick_name: payload.detail.value,
    });
  }, 500);

  // 更新用户信息
  const handleUpdateUserInfo = async (info: any = {}) => {
    const { nick_name = "", avatar = "" } = info;
    if (!nick_name && !avatar) {
      return;
    }
    try {
      let params = {
        nick_name,
        avatar,
      };
      console.log("====params", params);
      const res = await _updateUserInfo(params);
      console.log("====res", res);
    } catch (error) {
      console.log(error);
    }
  };

  //   to 首页
  const toHome = () => {
    if (!userInfo?.nick_name) {
      officeToast.warning("请先完善个人信息");
      return;
    }
    Taro.redirectTo({ url: "/packageUser/chat/index" });
  };

  const renderForm = () => {
    switch (formType) {
      case "register":
        return (
          <RegisterForm setFormType={setFormType} updateToken={updateToken} />
        );
      case "forgot":
        return <ForgotPasswordForm setFormType={setFormType} />;
      default:
        return (
          <>
            <View className="login-header">
              <Text className="title">欢迎登录</Text>
            </View>
            {loginType === "account" && (
              <Form
                ref={formRef}
                onFinish={handleSubmit}
                className="form-container"
              >
                <FormItem
                  name="username"
                  rules={[{ required: true, message: "请输入用户名" }]}
                  className="form-item"
                >
                  <Field
                    placeholder="请输入用户名"
                    border={false}
                    maxlength={20}
                    clearable
                    leftIcon="user-o"
                  />
                </FormItem>

                <FormItem
                  name="password"
                  rules={[{ required: true, message: "请输入密码" }]}
                  className="form-item"
                >
                  <Field
                    type={showPassword ? "text" : "password"}
                    placeholder="请输入密码"
                    border={false}
                    maxlength={10}
                    clearable
                    leftIcon="lock"
                    rightIcon={showPassword ? "eye-o" : "closed-eye"}
                    onClickIcon={() => setShowPassword(!showPassword)}
                    clearable
                  />
                </FormItem>

                <FormItem
                  name="captcha_code"
                  rules={[{ required: true, message: "请输入验证码" }]}
                  className="form-item captcha-item"
                >
                  <View className="captcha-wrapper">
                    <Field
                      type="text"
                      placeholder="请输入验证码"
                      border={false}
                      maxlength={4}
                      clearable
                      className="captcha-input"
                      leftIcon="shield-o"
                      onChange={(e) => {
                        formRef?.current?.setFieldsValue(
                          "captcha_code",
                          e.detail
                        );
                      }}
                    />
                    <View className="captcha-image" onClick={getCaptcha}>
                      {captchaInfo ? (
                        <Image src={captchaInfo.image} className="image" />
                      ) : (
                        <Text>获取验证码</Text>
                      )}
                    </View>
                  </View>
                </FormItem>

                <View className="actions">
                  <Text
                    className="action-link"
                    onClick={() => setFormType("register")}
                  >
                    注册账号
                  </Text>
                  <Text
                    className="action-link"
                    onClick={() => setFormType("forgot")}
                  >
                    忘记密码？
                  </Text>
                </View>

                <Button
                  type="primary"
                  formType="submit"
                  className="submit-btn"
                  block
                >
                  登录
                </Button>

                <View className="login-type-switch">
                  <Text
                    className="switch-btn"
                    onClick={() => setLoginType("wechat")}
                  >
                    使用微信登录
                  </Text>
                </View>
              </Form>
            )}

            {loginType === "wechat" && (
              <View className="form-container wechat-login">
                {!token ? (
                  <Button
                    type="primary"
                    className="wechat-btn"
                    open-type="getUserInfo"
                    onGetUserInfo={wxLogin}
                    block
                  >
                    微信一键登录
                  </Button>
                ) : null}
                {token && hasUserInfo && canIUseNicknameComp ? (
                  <View className="wechat-info">
                    <TaroButton
                      className="avatar-wrapper"
                      open-type="chooseAvatar"
                      onChooseAvatar={onChooseAvatar}
                    >
                      <Image className="avatar" src={userInfo?.avatar}></Image>
                    </TaroButton>
                    <Input
                      type="nickname"
                      className="weui-input"
                      placeholder="请输入昵称"
                      onInput={onInputChange}
                      value={userInfo?.nick_name}
                    />
                    <Button
                      type="primary"
                      className="wechat-btn"
                      block
                      onClick={() => toHome()}
                    >
                      确认
                    </Button>
                  </View>
                ) : null}

                <View className="login-type-switch">
                  <Text
                    className="switch-btn"
                    onClick={() => setLoginType("account")}
                  >
                    使用账号密码登录
                  </Text>
                </View>
              </View>
            )}
          </>
        );
    }
  };

  return <View className="login-page-wrapper">{renderForm()}</View>;
};

export default LoginPage;
