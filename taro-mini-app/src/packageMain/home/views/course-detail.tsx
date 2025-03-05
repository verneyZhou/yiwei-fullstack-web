import React, { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Switch,
  Outlet,
  useRoutes,
  useParams,
  useLocation,
} from 'react-router-dom';

import { Link } from '@/components/link';

export default function Course() {
  const { id } = useParams();
  console.log('=course detail ==id', id);

  return (
    <div>
      <h2>
        Welcome to the {id?.split('-').map(capitalizeString).join(' ')} course!
      </h2>

      <p>This is a great course. You're gonna love it!</p>

      <Link to='/courses'>See all courses</Link>
    </div>
  );
}

function capitalizeString(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
