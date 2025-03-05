// 首页tab
export interface tabItemTy {
    label: string;
    value: string;
    path: string;
    icon: any;
    activeIcon: any;
    redHot?: boolean;
}

// 首页顶部信息
export interface infoItemTy {
    icon: any;
    value: string;
    num: number;
    field: string;
}

// 首页用户信息
export interface userInfoItemTy {
    label: string;
    value: string;
    code: string;
    field: string;
}


// 社区tab
interface worktabItemTy {
    label: string;
    code: string;
    value: number;
}

// 市集tab
interface fairTabItemTy {
    label: string;
    code: string;
    value: number;
  }