import React, { createContext, useContext } from 'react';


export const HomePageContext = createContext<{
    homePageRef: any;
    homeAppVersion: string;
    // homePageScroll: (e: any) => void;
  }>({
    homePageRef:null,
    homeAppVersion: '',
    // homePageScroll: () => {},
  });


export default function useHomePageContext () {
  return useContext(HomePageContext);
}
