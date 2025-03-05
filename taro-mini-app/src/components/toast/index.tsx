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
import { document, TaroRootElement } from "@tarojs/runtime";
import { toastItemTy } from "@/types/common";

const TARO_ENV = process.env.TARO_ENV;
const toastWrapperClass = "office-toast-wrapper";

// 创建容器
const createWrapper = () => {
  console.log("====TARO_ENV", TARO_ENV);
  let el: any = null;
  if (TARO_ENV === "weapp") {
    // 微信小程序.
    // 参考：https://juejin.cn/post/7207090090103128125
    el = document.createElement("view");
    el.classList.add(toastWrapperClass);
    const currentPages = Taro.getCurrentPages();
    console.log("currentPages", currentPages);
    const currentPage = currentPages[currentPages.length - 1]; // 获取当前页面对象
    const path = currentPage.$taroPath;
    const pageElement = document.getElementById<TaroRootElement>(path);
    pageElement?.appendChild(el);
    return el;
  } else {
    // h5
    el = document.createElement("div");
    el.classList.add(toastWrapperClass);
    document.body?.append(el);
  }
  return el;
};

// toast 组件
const Toast = (props: toastItemTy) => {
  const { content, type, onRemove } = props;
  const [hideClass, setHideClass] = useState("");
  useEffect(() => {
    let timeout;
    if (type !== "loading") {
      timeout = setTimeout(() => {
        setHideClass("slideup");
        setTimeout(() => {
          // 通知父组件移除自身
          onRemove();
        }, 300);
      }, 3000);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [onRemove, type]);

  // 通知图标样式
  const classIcon = useMemo(() => {
    return `icon-toast-${type}`;
  }, [type]);

  return (
    <div className={`office-toast ${hideClass}`}>
      <div className="toast-con">
        <i className={classIcon}></i>
        <span className="txt">{content}</span>
      </div>
    </div>
  );
};

// toast容器
const ToastWrapper = forwardRef((props, ref) => {
  const [list, setList] = useState<any>([]); // 通知列表
  const incrementKeyRef = useRef(0); // 通知自增 key
  // 添加
  const onAdd = (content: string, type: string) => {
    // 自增 key
    const key = incrementKeyRef.current++;
    setList((list) => {
      const item = (
        <Toast
          key={key}
          type={type}
          onRemove={() => onRemove(key)}
          content={content}
        />
      );
      const newList = [...list, item];
      return newList;
    });
  };

  // 移除
  const onRemove = (key) => {
    // 移除通知
    setList((list) => {
      return list.filter((item) => item.key !== key.toString());
    });
  };

  // 暴露方法，这个 Hook 可以设置 Ref 的值，参考：https://reactjs.org/docs/hooks-reference.html#useimperativehandle
  useImperativeHandle(
    ref,
    () => ({
      show(content: string, type: string) {
        onAdd(content, type);
      },
      hide() {
        setList([]);
      },
    }),
    []
  );
  return <>{list}</>;
});

let toastVNode: any = null;
let toastWrapperRef: any = null;
// 初始化
const initToast = () => {
  toastVNode = createWrapper();
  const root = ReactDOM.createRoot(toastVNode);
  // 用于暴露 ToastWrapper 里面的方法
  toastWrapperRef = React.createRef();
  // 渲染容器
  root.render(<ToastWrapper ref={toastWrapperRef} />);
};

const beforeLoad = (callback: () => void) => {
  if (!toastVNode) {
    setTimeout(() => {
      initToast();
      setTimeout(callback, 10);
    }, 0);
  } else {
    callback();
  }
};

/**
 * 显示通知
 * @param {React.ReactNode} content 通知内容
 */
const officeToast = {
  success: (content) => {
    beforeLoad(() => {
      toastWrapperRef?.current?.show(content, "success");
    });
  },
  info: (content) => {
    beforeLoad(() => {
      toastWrapperRef?.current?.show(content, "info");
    });
  },
  error: (content) => {
    beforeLoad(() => {
      toastWrapperRef?.current?.show(content, "error");
    });
  },
  warning: (content) => {
    beforeLoad(() => {
      toastWrapperRef?.current?.show(content, "warning");
    });
  },
  loading: (content) => {
    beforeLoad(() => {
      toastWrapperRef?.current?.show(content, "loading");
    });
  },
  hide: () => {
    toastWrapperRef?.current?.hide();
  },
};

export default officeToast;
