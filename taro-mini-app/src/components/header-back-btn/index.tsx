import Taro from '@tarojs/taro';
import { useNavigate } from 'react-router-dom';
import {memo} from 'react';

import './index.scss';


interface propsTy {
    title?: string;
    path?: string;
    preventBack?: boolean; // 自定义返回
    borderBottom?: boolean;
    fixed?: boolean;
    opacity?: number;
    needBack?: boolean;
    children?: any;
    backType?:string; // 返回类型
}

function HeaderBackBtn(props: propsTy) {
  const navigate = useNavigate();
  const {title = '返回', path = '', preventBack = false, borderBottom = false, fixed = false, opacity = 1, needBack = true, backType = 'spa'} = props;

  const onRouter = () => {
    if (backType === 'page') {
      if (path) {
        Taro.navigateTo({
          url: path
        });
        return;
      }
      Taro.navigateBack();

    } else { // spa
      if (path) {
        navigate(path, {replace: true});
        return;
      }
      navigate(-1);
    }
  };
  return (
    <div
      className={`header-back-btn ${borderBottom ? 'border-bottom' : ''}`}
      style={{
        position: fixed ? 'fixed' : 'relative',
        opacity: opacity,
        display: opacity ? 'block' : 'none',
      }}
    >
      {needBack ? <b v-if='needBack' onClick={onRouter}></b> : null}
      {title}
      {
        props.children && 
                <div className='btn-box'>
                  {props.children}
                </div>
      }
    </div>
  );
}


export default memo(HeaderBackBtn);
