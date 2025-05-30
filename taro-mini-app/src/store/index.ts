import { useRef } from 'react';
import {create} from 'zustand';
import {combine, persist, createJSONStorage} from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { pick } from 'lodash-es';
import {sessionStorage} from './store';
import Taro from "@tarojs/taro";


interface AppState {
  testData: any;
  openId: string;
  token: string;
  userInfo: null | object | any;
  isDarkMode: boolean;
}

const initialState = () => ({
  testData: {},
  openId: '',
  token: '',
  userInfo: null,
  isDarkMode: false,
} as AppState);

export const useAppStore = create(persist(
  combine(
    initialState(),
    set => ({
      setTestData: (testData) => set({ testData }),
      setOpenId: (openId) => set({ openId }),
      setToken: (token) => set({ token }),
      setUserInfo: (userInfo) => set({ userInfo }),
      setIsDarkMode: (isDarkMode) => set({ isDarkMode }),
      removeToken: () => set({ token: '' }),
      reset: () => {
        Taro.removeStorageSync("token");
        set(initialState())
      },
    })
  ),
  {
    name: 'yiwei-app-storage-key',
    storage: createJSONStorage(sessionStorage), // (optional) storage to use for state persistence, defaults to localStorage for web
    version: 1.0,
  }
));


type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
  }
  
  type Many<T> = T | readonly T[];
  
/**
   * 优化useSelector
   * @description 从store中获取state，且只获取需要的state，避免不必要的渲染
   * 因为如果错误的在组件内使用同一个store的时候 用法上会对渲染造成影响
   * @plan1 useStore(state => state) 就算没有使用store的state，只要store更新，组件就会重新渲染
   * @plan2 useStore(state => state.a)) 单次只导出一个方法或state   官方方法1 这样组件就不会重新渲染了
   * @plan3 useStore(useShallow(state => ({ a: state.a })))        官方方法2 这样组件就不会重新渲染了
   * @use useStore(useSelector(['a', 'b']))
   * @param fields 需要获取的state字段列表，不填默认全部
   * @returns 返回需要的state
   */
export function useSelector<T extends object, K extends keyof T>(fields?: Many<K>): (state: T) => Pick<T, K> {
    type P = Pick<T, K>;
    const prev = useRef<P>({} as P);
    return (state: T) => {
      if(state) {
        const next = fields ? pick(state, fields) : state;
        return shallow(prev.current, next) ? prev.current : (prev.current = next);
      }
      return prev.current;
    };
  
}
  