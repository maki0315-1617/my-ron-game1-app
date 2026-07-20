import React from 'react';
import './Cockroach.css';
// 英語フォルダ名 (images) からゴキブリ画像を読み込む
import cockroachImg from './images/cockroach.png';

const Cockroach = ({ fromTop, x, duration }) => {
  // インラインスタイルで横位置とアニメーション速度を設定
  const style = {
    left: `${x}%`,
    animationDuration: `${duration}s`,
  };

  return (
    <div 
      className={`cockroach ${fromTop ? 'from-top' : 'from-bottom'}`}
      style={style}
    >
      <img src={cockroachImg} alt="ゴキブリ" />
    </div>
  );
};

export default Cockroach;