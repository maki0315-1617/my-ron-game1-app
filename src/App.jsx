import React, { useState, useEffect } from 'react';
import './App.css';
import Cockroach from './Cockroach';
import trashPileImage from './画像/trash_pile.png'; 

function App() {
  const [cockroaches, setCockroaches] = useState([]);

  useEffect(() => {
    const spawnInterval = setInterval(() => {
      const id = Date.now();
      const fromTop = Math.random() > 0.5;

      const newCockroach = {
        id,
        fromTop,
        x: Math.random() * 80 + 10,
        // スピードをさらに10倍にするため、時間を極端に短縮 (0.1秒〜0.15秒程度)
        duration: fromTop ? Math.random() * 0.05 + 0.1 : Math.random() * 0.05 + 0.1,
      };

      setCockroaches((prev) => [...prev, newCockroach]);

      setTimeout(() => {
        setCockroaches((prev) => prev.filter((c) => c.id !== id));
      }, (newCockroach.duration + 0.05) * 1000); // 消去のタイミングも調整

    }, 500); // 生成頻度も上げる

    return () => clearInterval(spawnInterval);
  }, []);

  return (
    <div className="game-container">
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