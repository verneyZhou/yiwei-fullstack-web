import './index.scss';

import React, {useState, useEffect, useMemo, useRef} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Taro, {usePageScroll} from '@tarojs/taro';
import {View} from '@tarojs/components';


import HeaderBackBtn from '@/components/header-back-btn';
import WorkTab from '@/packageMain/home/components/work-tab';
import WorkItem from '@/packageMain/home/components/work-item';
import { queryToSearch, throttle, debounce, searchQuery } from '@/utils/util';

import useHomePageContext from '@/packageMain/home/context';
import {worktabItemTy} from '@/types/home';
import VirtualList from '@tarojs/components-advanced/dist/components/virtual-list' // https://docs.taro.zone/docs/next/virtual-list
import { VirtualWaterfall } from '@tarojs/components-advanced'



const itemSize = 80;
function buildData(offset = 0) {
  return Array(20)
    .fill(0)
    .map((_, i) => {
      return {
        'title': '文章标题' + (i + offset), // 文章的标题
        'like_count': i + offset, // 文章点赞数
        'create_time':'2022-06-22', // 文章发表时间
        'content_id': i + offset,  // 文章ID
        'is_like': (i + offset) % 2 === 0 ? 2 : 1, // 是否点赞，1=是，2=否
      };
    })
}

const workTabList: worktabItemTy[] = [
  { label: '摸鱼', code: 'fish', value: 1 },
  { label: '我的互动', code: 'interactive', value: 2 },
  { label: '我的创作', code: 'create', value: 3 },
];


const uniqueId = 'home__community__list';

const mockList = [
  {
    'title': '文章标题发电是发送到发送到风扇范德萨范德萨付首付都是', // 文章的标题
    'like_count': 0, // 文章点赞数
    'create_time':'2022-06-22', // 文章发表时间
    'content_id':1,  // 文章ID
    'is_like':1 // 是否点赞，1=是，2=否
  },
  {
    'title': '文章标题', // 文章的标题
    'like_count': 9999, // 文章点赞数
    'create_time':'2022-06-22', // 文章发表时间
    'content_id':1,  // 文章ID
    'is_like':0 // 是否点赞，1=是，2=否
  },
  {
    'title': '文章标题', // 文章的标题
    'like_count': 9, // 文章点赞数
    'create_time':'2022-06-22', // 文章发表时间
    'content_id':1,  // 文章ID
    'is_like':0 // 是否点赞，1=是，2=否
  },
  {
    'title': '文章标题', // 文章的标题
    'like_count': 100, // 文章点赞数
    'create_time':'2022-06-22', // 文章发表时间
    'content_id':1,  // 文章ID
    'is_like':0 // 是否点赞，1=是，2=否
  },
  {
    'title': '文章标题', // 文章的标题
    'like_count': 100, // 文章点赞数
    'create_time':'2022-06-22', // 文章发表时间
    'content_id':1,  // 文章ID
    'is_like':1 // 是否点赞，1=是，2=否
  },
  {
    'title': '文章标题', // 文章的标题
    'like_count': 100, // 文章点赞数
    'create_time':'2022-06-22', // 文章发表时间
    'content_id':1,  // 文章ID
    'is_like':1 // 是否点赞，1=是，2=否
  },
  {
    'title': '文章标题', // 文章的标题
    'like_count': 100, // 文章点赞数
    'create_time':'2022-06-22', // 文章发表时间
    'content_id':1,  // 文章ID
    'is_like':0 // 是否点赞，1=是，2=否
  },
  {
    'title': '文章标题', // 文章的标题
    'like_count': 100, // 文章点赞数
    'create_time':'2022-06-22', // 文章发表时间
    'content_id':1,  // 文章ID
    'is_like':1 // 是否点赞，1=是，2=否
  },
  {
    'title': '文章标题', // 文章的标题
    'like_count': 100, // 文章点赞数
    'create_time':'2022-06-22', // 文章发表时间
    'content_id':1,  // 文章ID
    'is_like':1 // 是否点赞，1=是，2=否
  },
];

export default function HomeCommunity() {
  const {  pathname, search } = useLocation();
  const { homePageRef, homeAppVersion } = useHomePageContext();
  const communityListRef: any = useRef(null);
  const navigate = useNavigate();
  const [list, setList] = useState(mockList);
  const [curTab, setCurTab] = useState('fish');
  const [interactiveList, setInteractiveList] = useState<any>([]);
  const [virtualLoading, setVirtualLoading] = useState(false);
  const [createList, setCreateList] = useState<any>([]);

  const [bgOpacity, setBgOpacity] = useState(0);
  // 监听页面滚动
  useEffect(() => {
    console.log('====homePageRef', homePageRef);
    if (!homePageRef?.current) return;
    homePageRef?.current?.addEventListener('scroll',throttle(handleScroll, 100), false);
    return () => {
      homePageRef?.current?.removeEventListener('scroll', handleScroll, false);
    };
  }, []);
  const handleScroll = async (e: any) => {
    // console.log('==23456==scroll', e);
    const query = Taro.createSelectorQuery();
    query?.select(`#${uniqueId}`).boundingClientRect((rect: any) => {
      // console.log('==rect', rect);
      const {top} = rect;
      const _opacity = top > 44 ? 0 : Math.min(1, (44 - top) / 100);
      setBgOpacity(_opacity);
    }).exec();
  };

  const curTabItem: worktabItemTy | any = useMemo(() => {
    return workTabList.find((v) => v.code === curTab) || {};
  }, [curTab]);

  // tab点击
  const onTab = (item: worktabItemTy) => {
    setCurTab(item.code);
    if (item.code === 'interactive') {
      listReachBottom('init');
    }
    if (item.code === 'create') {
      listReachBottomV2('create');
    }
    const query = searchQuery(search);
    console.log(search, query);
    const _query = Object.assign({}, query, {
      tab: item.code,
    });
    const curUrl = pathname + queryToSearch(_query);
    navigate(curUrl, {replace: true});
  };

  // 加载更多数据
  const listReachBottom = (type = '') => {
    console.log('==listReachBottom');
    Taro.showLoading()
    setVirtualLoading(true);
    setTimeout(() => {
      let _list = type === 'init' ? buildData(0) : interactiveList.concat(buildData(interactiveList.length));
      setInteractiveList(_list)
      setVirtualLoading(false);
      Taro.hideLoading();
    }, 1000)
  };
  // 虚拟列表的子组件
  const VirtualItem = React.memo(({ id, index, data }) => {
    // console.log('===VirtualItem', id, index, data);
    return (
      <WorkItem item={data[index]} key={index} id={id} />
    )
  })
  const RowItem = React.memo(({ id, index, data }) => {
    console.log('===RowItem', id, index, data);
    return (
      <View id={id} key={index} className={`virtual-list-item mb-3 ${index % 2 ? 'item-odd' : 'item-even'}`}>
        <h2>{data[index].title}</h2>
        <p>{data[index].create_time}</p>
        <p>点赞数：{data[index].like_count}、{data[index].is_like}</p>
      </View>
    )
  })
  const listReachBottomV2 = (type = '') => {
    console.log('==listReachBottomV2');
    Taro.showLoading()
    setVirtualLoading(true);
    setTimeout(() => {
      let _list = type === 'init' ? buildData(0) : createList.concat(buildData(createList.length));
      setCreateList(_list)
      setVirtualLoading(false);
      Taro.hideLoading();
    }, 1000)
  };
  return (
    <div className='home-community-content'>
      <HeaderBackBtn title={curTabItem?.label || ''} fixed opacity={bgOpacity} />
      <WorkTab list={workTabList} tab={curTab} update={onTab} />
      <div className='home-community-list' id={uniqueId} ref={el => { communityListRef.current = { ...el, id: uniqueId } }}>
        {
          curTab === 'fish' ? (
            list.map((item, index) => {
              return (
                <WorkItem item={item} key={index} />
              );
            })
          ) : null
        }
        {
          curTab === 'interactive' ? (
            <VirtualList
              className='virtual-list'
              width='100%'
              height={400}
              item={VirtualItem}
              itemData={interactiveList}
              itemCount={interactiveList.length}
              itemSize={itemSize}
              overscanCount={5}
              // onScroll={({ scrollDirection, scrollOffset }) => {
              //   console.log('==scrollDirection', scrollDirection, scrollOffset, virtualLoading, (interactiveList.length - 10) * itemSize);
              //   // if (
              //   //   // 避免重复加载数据
              //   //   !virtualLoading &&
              //   //   // 只有往前滚动我们才触发
              //   //   scrollDirection === 'forward' &&
              //   //   // 7 = (列表高度 / 单项列表高度)
              //   //   // 100 = 滚动提前加载量，可根据样式情况调整
              //   //   scrollOffset > (interactiveList.length - 10) * itemSize + 100
              //   // ) {
              //   //   listReachBottom()
              //   // }
              // }}
              onScrollToLower={(...args) => {
                console.log('==onScrollToLower', ...args);
                if (!virtualLoading) {
                  listReachBottom()
                }
              }}
            />
          ) : null
        }
        {
          curTab === 'create' ? (
            <VirtualWaterfall
              className="virtual-waterfall-list"
              width="100%"
              height={400}
              column={2}
              item={RowItem}
              itemData={createList}
              itemCount={createList.length}
              itemSize={(index, itemData) => itemSize + (index || 0) * 2}
              // onScroll={({ scrollDirection, scrollOffset }) => {
              //   console.log('==scrollDirection', scrollDirection, scrollOffset, (createList.length - 5) * itemSize + 100);
              //   if (
              //     // 避免重复加载数据
              //     virtualLoading &&
              //     // 只有往前滚动我们才触发
              //     scrollDirection === 'forward' &&
              //     // 5 = (列表高度 / 单项列表高度)
              //     // 100 = 滚动提前加载量，可根据样式情况调整
              //     scrollOffset > (createList.length - 5) * itemSize + 100
              //   ) {
              //     listReachBottomV2()
              //   }
              // }}
              onScrollToLower={(...args) => {
                console.log('==onScrollToLower', ...args);
                if (!virtualLoading) {
                  listReachBottomV2()
                }
              }}
            />
          ) : null
        }
      </div>
    </div>
  );
}
