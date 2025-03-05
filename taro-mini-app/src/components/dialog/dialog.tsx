import "./index.scss";

import { useState, memo, useImperativeHandle, forwardRef } from "react";
import { dialogItemTy } from "@/types/common";

const defaultConfig = {
  title: "",
  subTitle: "",
  content: "",
  contentType: "string", // string 纯文本；   node dom节点；   slot（组件调用使用）； get  获得金币/能力值
  textCenter: false, // 内容居中
  isTranslateZ: true, // 是否在最高层级展示（兼容ios）
  confirmText: "确认",
  cancelText: "取消",
  overflow: "hidden", // hidden 不允许滚动  auto 允许滚动
  preventLayer: false,
  preventConfirm: false, // 点击确认是否允许关闭弹窗
  cancel: () => {}, // 取消回调
  confirm: () => {}, // 确认回调
  children: null,
};

function Dialog(props: dialogItemTy = {}, ref: any) {
  const [isShow, setIsShow] = useState(false);
  const [config, setConfig] = useState(Object.assign({}, defaultConfig, props));
  console.log("config", config);
  const {
    isTranslateZ,
    preventLayer,
    preventConfirm,
    overflow,
    title,
    subTitle,
    contentType,
    content,
    textCenter,
    cancelText,
    confirmText,
    cancel,
    confirm,
  } = config;

  //   打开弹窗
  const show = (opts: dialogItemTy) => {
    opts &&
      setConfig((prevConfig) => {
        return Object.assign({}, prevConfig, opts);
      });
    setIsShow(true);
  };

  //关闭弹窗
  const hide = () => {
    setIsShow(false);
    setConfig({ ...defaultConfig });
  };

  // 取消回调
  const onCancel = () => {
    cancel?.();
    hide();
  };
  //   确认回调
  const onConfirm = () => {
    if (!confirm) {
      hide();
    } else {
      confirm();
      !preventConfirm && hide();
    }
  };

  // 暴露方法
  useImperativeHandle(ref, () => ({
    show,
    hide,
  }));

  if (!isShow) return null;
  return (
    <div
      className={`office-dialog-wrapper ${isTranslateZ ? "translate__z" : ""}`}
      onClick={() => (preventLayer ? null : hide())}
    >
      <div
        className={`office-dialog-content flex-column-center ${
          overflow === "auto" ? "overflow-auto" : ""
        }`}
      >
        <h3 className="title">{title}</h3>
        {subTitle ? <h4 className="sub-title">{subTitle}</h4> : null}
        {contentType === "string" && content ? (
          <div
            className={`content scroll-hidden ${
              textCenter ? "text-center" : ""
            }`}
          >
            {content}
          </div>
        ) : null}
        {contentType === "node" && content ? (
          <div
            className="content scroll-hidden"
            dangerouslySetInnerHTML={{ __html: content }}
          ></div>
        ) : null}
        {props.children}
        <div className="footer-btns flex-center-between">
          {cancelText ? (
            <span className="office-btn small default" onClick={onCancel}>
              {cancelText}
            </span>
          ) : null}
          {confirmText ? (
            <span
              className={`office-btn small bg-active ${
                !cancelText ? " single" : ""
              }`}
              onClick={onConfirm}
            >
              {confirmText}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default memo(forwardRef(Dialog));
