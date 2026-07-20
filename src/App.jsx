import React, { useState, useEffect } from 'react';
import './App.css';
import Cockroach from './Cockroach';
// フォルダ名・ファイル名が英語である前提のパス
import trashPileImage from './images/trash_pile.png'; 

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
        // スピードを1/2にするため、時間を2倍に設定（0.2秒〜0.3秒程度）
        duration: fromTop ? Math.random() * 0.1 + 0.2 : Math.random() * 0.1 + 0.2,
      };

      setCockroaches((prev) => [...prev, newCockroach]);

      // 画面外へ移動した後にメモリから削除
      setTimeout(() => {
        setCockroaches((prev) => prev.filter((c) => c.id !== id));
      }, (newCockroach.duration + 0.1) * 1000);

    }, 400);

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