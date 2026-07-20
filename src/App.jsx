import React, { useState, useEffect } from 'react';
import './App.css';
// ゴキブリコンポーネントをインポート
import Cockroach from './Cockroach';
// ゴミ画像（trash_pile.png）をインポート ※ファイル名は適宜合わせてください
import trashPileImage from './images/trash_pile.png'; 

function App() {
  // ゴキブリの配列ステート
  const [cockroaches, setCockroaches] = useState([]);

  // 一定時間ごとにゴキブリを生成するエフェクト
  useEffect(() => {
    const spawnInterval = setInterval(() => {
      const id = Date.now();
      // 出現位置をランダム（上から or 下から）に決定
      const fromTop = Math.random() > 0.5;

      const newCockroach = {
        id,
        fromTop,
        // x座標もランダム
        x: Math.random() * 80 + 10, // 10% ~ 90% の範囲
        // アニメーション速度（fromTopの方が若干速いイメージ）
        duration: fromTop ? Math.random() * 2 + 2 : Math.random() * 3 + 3,
      };

      setCockroaches((prev) => [...prev, newCockroach]);

      // ゴキブリが消えた後に配列から削除（メモリリーク防止）
      setTimeout(() => {
        setCockroaches((prev) => prev.filter((c) => c.id !== id));
      }, (newCockroach.duration + 0.5) * 1000); // duration + 0.5秒後に削除

    }, 1500); // 1.5秒ごとに生成

    return () => clearInterval(spawnInterval);
  }, []);

  return (
    <div className="game-container">
      <div className="game-content">
        <h1>PKゲーム（準備中）</h1>
        <p>床の背景の上に、生ごみとゴキブリを配置しました。</p>
        
        {/* 中央に配置する生ごみ画像 */}
        <div className="garbage-display">
          <img 
            src={trashPileImage} 
            alt="生ごみ" 
            className="garbage-image" 
          />
        </div>

        {/* 生成されたゴキブリを描画 */}
        {cockroaches.map((roach) => (
          <Cockroach 
            key={roach.id} 
            fromTop={roach.fromTop} 
            x={roach.x} 
            duration={roach.duration} 
          />
        ))}
        
      </div>
    </div>
  );
}

export default App;