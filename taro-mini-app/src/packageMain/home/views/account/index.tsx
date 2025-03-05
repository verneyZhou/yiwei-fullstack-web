import "./index.scss";

import HomeCard from "@/packageMain/home/components/card";

export default function HomeMy() {
  return (
    <div className="home-account-content">
      <HomeCard title="我的资产" btnTxt="充值" desc="你的小金库~">
        <div className="office-btn big">去买点什么吧~</div>
      </HomeCard>
      <HomeCard title="我的订单" btnTxt="更多" />
      <HomeCard title="我的创作" btnTxt="更多" />
      <HomeCard title="我的访客" btnTxt="更多" />
    </div>
  );
}
