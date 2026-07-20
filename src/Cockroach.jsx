import React from 'react';
import './Cockroach.css'; // 専用のCSSファイルをインポート
import cockroachImg from './images/cockroach.png'; // ゴキブリ画像をインポート

const Cockroach = ({ fromTop, x, duration }) => {
  // インラインスタイルでアニメーションの設定を渡す
  const style = {
    '--start-y': fromTop ? '-10%' : '110%', // 画面外から開始
    '--end-y': fromTop ? '110%' : '-10%',   // 画面外へ終了
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