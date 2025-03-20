import React, { Suspense } from 'react';

interface LazyLoadProps {
  factory: () => Promise<any>;
}

export default function LazyLoad({ factory }: LazyLoadProps) {
  const Component = React.lazy(factory);

  return (
    <Suspense fallback={<div className="loading-container">加载中...</div>}>
      <Component />
    </Suspense>
  );
}