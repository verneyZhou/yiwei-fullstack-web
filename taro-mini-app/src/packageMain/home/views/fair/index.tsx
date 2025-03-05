import "./index.scss";

import { useState } from "react";
import { fairTabItemTy } from "@/types/home";
import { Button } from "@antmjs/vantui";

import WorkTab from "@/packageMain/home/components/work-tab";

const fairTabList: fairTabItemTy[] = [
  { label: "道具商城", code: "card_nft", value: 2 },
  { label: "精选服务", code: "nft", value: 1 },
  // { label: 'NFT道具', code: 'prop_nft', value: 3 },
];

export default function HomeFair() {
  const [curTab, setCurTab] = useState(fairTabList[0].code);
  // tab点击
  const onTab = (item: fairTabItemTy) => {
    setCurTab(item.code);
  };

  return (
    <div className="home-fair-content">
      <h2 className="page-title">市集</h2>
      <WorkTab list={fairTabList} tab={curTab} update={onTab} />
    </div>
  );
}
