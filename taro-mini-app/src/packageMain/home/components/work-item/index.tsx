import './index.scss';

import likeIcon from '@/assets/images/common/like-icon.png';
import noLikeIcon from '@/assets/images/common/no-like-icon.png';


const timeStr = (time = '') => {
  time = time.replace(/(-)/g, '/'); // 兼容ios
  const timestamp: number = +new Date(time);
  const now: number = +new Date();
  const diff = parseInt(`${(now - timestamp) / 1000}`);
  if (diff <= 60) {
    return `${diff}秒前更新`;
  } else if (diff <= 60 * 60) {
    return `${parseInt(`${diff / 60}`)}分钟前更新`;
  } else if (diff <= 60 * 60 * 24) {
    return `${parseInt(`${diff / (60 * 60)}`)}小时前更新`;
  } else {
    return `${parseInt(`${diff / (60 * 60 * 24)}`)}天前更新`;
  }
};

export default function WorkItem (props) {
  console.log('====WorkItem', props);
  const {item} = props;

  return (
    <li className='work-item flex-center-start'>
      <div className='info'>
        <h2 className='ellipse'>{item.title}</h2>
        <div className='time-like flex-center-start'>
          <p>{timeStr(item.create_time)}</p>
          <p className='comment'>
            {item.comment_count ? `${item.comment_count}条` : '暂无'}评论
          </p>
        </div>
      </div>
      <div className='like flex-column-center'>
        <img src={item.is_like === 1 ? likeIcon : noLikeIcon} alt='' />
        <span>{ item.like_count || 0 }</span>
      </div>
    </li>
  );
}
