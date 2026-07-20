import React, { useState } from 'react';
import './Cockroach.css';
// 英語フォルダ名 (images) からゴキブリ画像と爆発画像を読み込む
import cockroachImg from './images/cockroach.png';
import explosionImg from './images/explosion.png';

const Cockroach = ({ id, fromTop, x, duration, onClick }) => {
  const [isExploding, setIsExploding] = useState(false);

  // クリック時の処理
  const handleClick = (e) => {
    e.stopPropagation();
    if (isExploding) return;

    setIsExploding(true); // 爆発画像に切り替え
    // 0.3秒間爆発画像を表示した後に親コンポーネントへ通知して消去
    setTimeout(() => {
      onClick(id);
    }, 300);
  };

  // インラインスタイルで横位置とアニメーション速度を設定
  const style = {
    left: `${x}%`,
    animationDuration: `${duration}s`,
  };

  return (
    <div 
      className={`cockroach ${fromTop ? 'from-top' : 'from-bottom'}`}
      style={style}
      onClick={handleClick}
    >
      <img 
        src={isExploding ? explosionImg : cockroachImg} 
        alt={isExploding ? "Explosion" : "Cockroach"} 
      />
    </div>
  );
};

export default Cockroach;