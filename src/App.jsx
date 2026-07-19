import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const GAME_TIME = 30;

// 画像パス: publicフォルダ直下にimagesフォルダがある前提
const IMAGES = {
  normal: '/images/cockroach.png',
  special: '/images/cockroach_special.png',
  bad: '/images/cockroach_bad.png',
  explosion: '/images/explosion.png'
};

const App = () => {
  const [gameState, setGameState] = useState('start');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [cockroaches, setCockroaches] = useState([]);
  const [explosions, setExplosions] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('goki-scores') || '[]');
    setHistory(saved.slice(0, 3));
  }, []);

  const spawnCockroach = () => {
    const side = Math.floor(Math.random() * 4);
    let x, y;
    if (side === 0) { x = Math.random() * 90 + 5; y = -10; }
    else if (side === 1) { x = 110; y = Math.random() * 90 + 5; }
    else if (side === 2) { x = Math.random() * 90 + 5; y = 110; }
    else { x = -10; y = Math.random() * 90 + 5; }

    const rand = Math.random();
    const type = rand < 0.1 ? 'special' : rand < 0.2 ? 'bad' : 'normal';
    
    setCockroaches(prev => [...prev, { 
      id: Date.now() + Math.random(), 
      x, y, 
      vx: (50 - x) / 100, vy: (50 - y) / 100,
      type
    }]);
  };

  const endGame = () => {
    setGameState('gameover');
    setHistory(prev => {
        const newHistory = [score, ...prev].slice(0, 3);
        localStorage.setItem('goki-scores', JSON.stringify(newHistory));
        return newHistory;
    });
    setCockroaches([]);
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    // ゴキブリ移動用ループ (50ms)
    const moveTimer = setInterval(() => {
      setCockroaches((prev) => 
        prev.map(g => ({ ...g, x: g.x + g.vx, y: g.y + g.vy }))
            .filter(g => {
              const dist = Math.sqrt(Math.pow(g.x - 50, 2) + Math.pow(g.y - 50, 2));
              if (dist < 10) { 
                endGame(); 
                return false; 
              }
              return true;
            })
      );
    }, 50);

    // タイマー減算用ループ (1s)
    const timeTimer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 生成用ループ (800ms)
    const spawnTimer = setInterval(spawnCockroach, 800);

    return () => {
      clearInterval(moveTimer);
      clearInterval(timeTimer);
      clearInterval(spawnTimer);
    };
  }, [gameState]);

  const killCockroach = (id, type, e) => {
    e.stopPropagation();
    if (type === 'special') setTimeLeft(prev => prev + 10);
    if (type === 'bad') setTimeLeft(prev => Math.max(0, prev - 10));
    setScore(prev => prev + (type === 'special' ? 60 : type === 'bad' ? -25 : 10));
    
    setCockroaches(prev => prev.filter(g => g.id !== id));
  };

  return (
    <div className="h-screen w-full bg-[#d2b48c] flex flex-col items-center justify-center font-sans">
      {gameState === 'start' && (
        <div className="text-center">
            <h1 className="text-4xl font-bold text-red-700 mb-8">ロン君のゴッキー退治ゲーム</h1>
            <button onClick={() => { setGameState('playing'); setTimeLeft(GAME_TIME); setScore(0); }} 
                    className="p-6 bg-green-600 text-white rounded-full text-2xl font-bold shadow-lg hover:bg-green-700">ゲーム開始！</button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="relative w-[90vw] max-w-[600px] h-[60vh] bg-stone-300 border-4 border-black rounded-lg overflow-hidden cursor-crosshair">
          <div className="absolute top-2 left-2 bg-black/50 p-2 text-white z-20">
            <div>スコア: {score}</div>
            <div>残り: {timeLeft}秒</div>
          </div>

          {cockroaches.map(g => (
            <div key={g.id} 
                 onClick={(e) => killCockroach(g.id, g.type, e)}
                 className="absolute w-12 h-12 z-20"
                 style={{ 
                    left: `${g.x}%`, 
                    top: `${g.y}%`,
                    backgroundImage: `url(${IMAGES[g.type]})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat'
                }} />
          ))}
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="text-center p-8 bg-black/80 text-white rounded-xl">
          <h1 className="text-4xl font-bold text-red-500">GAME OVER</h1>
          <p className="text-2xl my-4">最終スコア: {score}</p>
          <button onClick={() => setGameState('start')} className="p-4 bg-red-700 rounded-full">もう一度退治する</button>
        </div>
      )}
    </div>
  );
};

export default App;