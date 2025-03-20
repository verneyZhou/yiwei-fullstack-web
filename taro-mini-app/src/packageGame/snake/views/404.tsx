import React from "react";
import { View, Text } from "@tarojs/components";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./404.scss";

export default function NotFound() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");

  const goBack = () => {
    if (type === "project") {
      navigate("/index");
    } else {
      navigate(-1);
    }
  };

  return (
    <View className="not-found-container">
      <View className="not-found-content">
        <Text className="error-code">404</Text>
        <Text className="error-message">页面不存在</Text>
        <View className="back-button" onClick={goBack}>
          返回
        </View>
      </View>
    </View>
  );
}