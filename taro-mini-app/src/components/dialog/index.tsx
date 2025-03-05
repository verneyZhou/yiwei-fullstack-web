/**
 * 参考：https://zhuanlan.zhihu.com/p/551548383
 */

import "./index.scss";

import ReactDOM from "react-dom/client";
import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from "react";
import Taro, { useReady } from "@tarojs/taro";
import { render, unmountComponentAtNode } from "@tarojs/react";
import { document, TaroRootElement } from "@tarojs/runtime";
import { dialogItemTy } from "@/types/common";

import Dialog from "./dialog";

let dialogWrapperRef: any = null;
let dialogVNode: any = null;

// 创建容器
const createWrapper = (props: dialogItemTy = {}) => {
  let el: any = document.createElement("view");
  el.classList.add("office-dialog__box");
  const currentPages = Taro.getCurrentPages();
  console.log("currentPages", currentPages);
  const currentPage = currentPages[currentPages.length - 1]; // 获取当前页面对象
  const path = currentPage.$taroPath;
  const pageElement = document.getElementById<TaroRootElement>(path);
  dialogWrapperRef = React.createRef();
  render(<Dialog {...props} ref={dialogWrapperRef} />, el, () => {
    dialogVNode = el;
    pageElement?.appendChild(el);
  });
};

// 移除容器
export const destroyWrapper = (node) => {
  const currentPages = Taro.getCurrentPages();
  const currentPage = currentPages[currentPages.length - 1];
  const path = currentPage.$taroPath;
  const pageElement = document.getElementById<TaroRootElement>(path);
  unmountComponentAtNode(node);
  pageElement?.remove(node);
};

const beforeLoad = (callback) => {
  console.log("officeDialog", dialogVNode);
  if (!dialogVNode) {
    setTimeout(() => {
      createWrapper();
      setTimeout(callback, 10);
    }, 0);
  } else {
    callback();
  }
};

const officeDialog = (props: dialogItemTy = {}) => {
  beforeLoad(() => {
    dialogWrapperRef.current?.show(props);
  });
};
officeDialog.hide = () => {
  dialogWrapperRef.current?.hide();
};

export default officeDialog;
