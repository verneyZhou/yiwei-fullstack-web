import React from 'react';
import { Navigate } from 'react-router-dom';
import { lazyLoad } from './LazyLoad';
import Layout from '../components/layout';


const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '/index', element: lazyLoad(React.lazy(() => import('../views/home'))), },
      { path: '/community', element: lazyLoad(React.lazy(() => import('../views/community'))), },
      { path: '/fair', element: lazyLoad(React.lazy(() => import('../views/fair'))), },
      { path: '/account', element: lazyLoad(React.lazy(() => import('../views/account'))), },
      // {
      //   path: "/courses",
      //   element: lazyLoad(React.lazy(() => import('../views/course'))),
      //   children: [
      //     { index: true, element: lazyLoad(React.lazy(() => import('../views/course-index'))) },
      //     { path: "/courses/:id", element: lazyLoad(React.lazy(() => import('../views/course-detail'))) },
      //   ],
      // },
      { path: '*', element: <Navigate to='/404?type=project' /> },
    ],
  },
  {
    path: '/404',
    element: lazyLoad(React.lazy(() => import('../views/404'))),
  },
  {
    path: '/:pathMatch(.*)',
    element: <Navigate to='/404?type=project' />,
  },
];


export default routes;
