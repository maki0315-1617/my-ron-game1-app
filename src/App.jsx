import React, { useState, useEffect } from 'react';
import './App.css';
import Cockroach from './Cockroach';
// 英語フォルダ名 (images) からゴミ画像と背景画像を読み込む
import trashPileImage from './images/trash_pile.png';
import floorTexture from './images/floor_texture.jpg';

function App() {
  // ゴキブリのリストを管理するステート
  const [cockroaches, setCockroaches] = useState([]);
  // スコアを管理するステート
  const [score, setScore] = useState(0);

  useEffect(() => {
    // 一定間隔でゴキブリを生成するタイマー
    const spawnInterval = setInterval(() => {
      const id = Date.now();
      const fromTop = Math.random() > 0.5;

      const newCockroach = {
        id,
        fromTop,
        x: Math.random() * 80 + 10, // 画面横方向の出現位置（10%〜90%）
        // スピードを半分に落とした移動時間（0.4秒〜0.6秒程度）
        duration: fromTop ? Math.random() * 0.2 + 0.4 : Math.random() * 0.2 + 0.4,
      };

      setCockroaches((prev) => [...prev, newCockroach]);

      // 画面外へ移動した後にメモリから削除
      setTimeout(() => {
        setCockroaches((prev) => prev.filter((c) => c.id !== id));
      }, (newCockroach.duration + 0.2) * 1000);

    }, 600);

    return () => clearInterval(spawnInterval);
  }, []);

  // ゴキブリをクリック/タップしたときのスコア加算ハンドラー
  const handleCockroachClick = (id) => {
    setScore((prevScore) => prevScore + 100); // 1匹につき100点加算
    // クリックされたゴキブリを即座にリストから削除
    setCockroaches((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div 
      className="game-container"
      style={{ backgroundImage: `url(${floorTexture})` }}
    >
      {/* スコアボードの表示 */}
      <div className="score-board">
        SCORE: {score}
      </div>

      {/* 画面中央のコンテンツ（生ごみなど） */}
      <div className="game-content">
        <h1>PKゲーム（準備中）</h1>
        <p>床の背景の上に、生ごみとゴキブリを配置しました。</p>
        
        <div className="garbage-display">
          <img 
            src={trashPileImage} 
            alt="Trash Pile" 
            className="garbage-image" 
          />
        </div>
      </div>

      {/* 画面全体の上下端を移動するゴキブリの描画 */}
      {cockroaches.map((roach) => (
        <Cockroach 
          key={roach.id} 
          id={roach.id}
          fromTop={roach.fromTop} 
          x={roach.x} 
          duration={roach.duration} 
          onClick={handleCockroachClick}
        />
      ))}
    </div>
  );
}

export default App;