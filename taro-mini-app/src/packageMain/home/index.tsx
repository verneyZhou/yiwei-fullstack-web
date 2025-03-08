import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
} from "react";
import { BrowserRouter, useRoutes } from "react-router-dom";
import routes from "./router";
import "./index.scss";
import { HomePageContext } from "./context";
import { ScrollView } from "@tarojs/components";

const TARO_ENV = process.env.TARO_ENV;
const prefix = process.env.TARO_APP_PUBLIC_PATH;
const basename =
  TARO_ENV === "h5" ? `${prefix}/packageMain/home` : "packageMain/home";

// 首页入口
export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <HomePage />
    </BrowserRouter>
  );
}

function HomePage() {
  const elements = useRoutes(routes);
  const homePageRef = useRef(null);
  const homeAppVersion = "1.1.1";
  return (
    <HomePageContext.Provider value={{ homePageRef, homeAppVersion }}>
      <ScrollView
        className="home-page-wrapper"
        ref={homePageRef}
        scrollY
        scrollWithAnimation
      >
        {elements}
      </ScrollView>
    </HomePageContext.Provider>
  );
}
