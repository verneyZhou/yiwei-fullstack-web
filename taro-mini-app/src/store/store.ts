import Taro from "@tarojs/taro";

export const sessionStorage = () => ({
  getItem: (name: string) => Taro.getStorageSync(name),
  setItem: (name: string, value: any) => Taro.setStorageSync(name, value),
  removeItem: (name: string) => Taro.removeStorageSync(name),
})