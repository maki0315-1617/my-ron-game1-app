import React, { useState, useEffect } from 'react';
import './App.css';
import Cockroach from './Cockroach';
import trashPileImage from './images/trash_pile.png'; 

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
        duration: fromTop ? Math.random() * 2 + 2 : Math.random() * 3 + 3,
      };

      setCockroaches((prev) => [...prev, newCockroach]);

      setTimeout(() => {
        setCockroaches((prev) => prev.filter((c) => c.id !== id));
      }, (newCockroach.duration + 0.5) * 1000);

    }, 1500);

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