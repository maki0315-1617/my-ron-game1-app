import React, { useState, useEffect } from 'react';
import './App.css';
import Cockoach from './Cockroach';
import trashPileImage from './画像/trash_pile.png'; 

function App() {
  // ゴキブリのリストを管理するステート
  const [cockroaches, setCockroaches] = useState([]);

  useEffect(() => {
    // 一定間隔でゴキブリを生成するタイマー
    const spawnInterval = setInterval(() => {
      const id = Date.now();
      const fromTop = Math.random() > 0.5;

      const newCockroach = {
        id,
        fromTop,
        x: Math.random() * 80 + 10, // 画面横方向の出現位置（10%〜90%）
        // スピードをさらに落とすため、アニメーション時間をさらに長めに設定（例：5.0秒〜8.0秒程度）
        duration: fromTop ? Math.random() * 3.0 + 5.0 : Math.random() * 3.0 + 5.0,
      };

      setCockroaches((prev) => [...prev, newCockroach]);

      // 画面外へ移動した後にメモリから削除
      setTimeout(() => {
        setCockroaches((prev) => prev.filter((c) => c.id !== id));
      }, (newCockroach.duration + 0.2) * 1000);

    }, 1000);

    return () => clearInterval(spawnInterval);
  }, []);

  return (
    <div className="game-container">
      {/* 画面中央のコンテンツ（生ごみなど） */}
      <div className="game-content">
        <h1>PKゲーム（準備中）</h1>
        <p>床の背景の上に、生ごみとゴキブリを配置しました。</p>
        
        <div className="garbage-display">
          <img 
            src={trashPileImage} 
            alt="生ごみ" 
            className="garbage-image" 
          />
        </div>
      </div>

      {/* 画面全体の上下端を移動するゴキブリの描画 */}
      {cockroaches.map((roach) => (
        <Cockroach 
          key={roach.id} 
          fromTop={roach.fromTop} 
          x={roach.x} 
          duration={roach.duration} 
        />
      ))}
    </div>
  );
}

export default App;