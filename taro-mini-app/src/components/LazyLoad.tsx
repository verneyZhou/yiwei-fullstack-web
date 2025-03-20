
import React, { Suspense } from 'react';
import { Loading } from '@antmjs/vantui';

/**
 * 组件懒加载，结合Suspense实现
 * @param Component 组件对象
 * @returns 返回新组件
 */
export const lazyLoad = (Component: React.LazyExoticComponent<() => JSX.Element>): React.ReactNode => {
  return (
    <Suspense fallback={<Loading size='24px' vertical style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }} >加载中...</Loading>}>
      <Component />
    </Suspense>
  );
};
