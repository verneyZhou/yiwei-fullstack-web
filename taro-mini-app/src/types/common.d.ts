/*类型命名建议以Ty结尾*/
/*
*
枚举 类，接口 都是大驼峰 WangMeng
方法，变量，常量 小驼峰 wangMeng
* */


/*通用对象*/

export interface ObjTy {
    [propName: string]: any // 属性名称未字符串，值为任意类型
}


// 全局toast组件
export interface toastItemTy {
    content: string;
    type: string; // "success" | "error" | "warning" | "info" | "loading";
    onRemove: () => void;
    key?: number;
} 



// 全局dialog组件
export interface dialogItemTy {
    show?: boolean;
    title?: string;
    subTitle?: string;
    content?: string | Element | any; // 内容可以是字符串，也可以是对象
    textCenter?: boolean; // 内容是否居中
    confirmText?: string | boolean;
    cancelText?: string | boolean;
    overflow?: string; // hidden 不允许滚动  auto 允许滚动
    preventLayer?: boolean; // 是否允许点击蒙层关闭
    preventConfirm?: boolean; // 是否允许点击确认关闭
    cancel?: () => void; // 取消回调
    confirm?: () => void; // 确认回调
    children?: any; // 自定义内容
} 
  