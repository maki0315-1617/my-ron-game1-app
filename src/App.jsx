import React, { useState, useEffect, useRef } from 'react';
// CSSの読み込み（下記に記載）
import './App.css'; 

const GAME_TIME = 30;

// --- 画像パス（必要に応じて変更して下さい） ---
const IMAGES = {
  normal: '/images/cockroach.png',
  special: '/images/cockroach_special.png', // 延長用（色を変えるなど）
  bad: '/images/cockroach_bad.png', // マイナス用（黒くするなど）
  explosion: '/images/explosion.png'
};

const App = () => {
  const [gameState, setGameState] = useState('start');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [cockroaches, setCockroaches] = useState([]);
  const [explosions, setExplosions] = useState([]); // 爆発エフェクト管理用
  const [history, setHistory] = useState([]);
  const gameAreaRef = useRef(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('goki-scores') || '[]');
    setHistory(saved.slice(0, 3));
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });

      if (Math.random() < 0.35) spawnCockroach();
      
      setCockroaches((prev) => 
        prev.map(g => ({ ...g, x: g.x + g.vx, y: g.y + g.vy }))
            .filter(g => {
              const dist = Math.sqrt(Math.pow(g.x - 50, 2) + Math.pow(g.y - 50, 2));
              if (dist < 8) { endGame(); return false; }
              return true;
            })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  const spawnCockroach = () => {
    const side = Math.floor(Math.random() * 4);
    let x, y;
    if (side === 0) { x = Math.random() * 100; y = -12; }
    else if (side === 1) { x = 112; y = Math.random() * 100; }
    else if (side === 2) { x = Math.random() * 100; y = 112; }
    else { x = -12; y = Math.random() * 100; }

    const rand = Math.random();
    const type = rand < 0.1 ? 'special' : rand < 0.2 ? 'bad' : 'normal';
    
    setCockroaches(prev => [...prev, { 
      id: Date.now(), x, y, 
      vx: (50 - x) / 90, vy: (50 - y) / 90, // 速度調整
      type
    }]);
  };

  const killCockroach = (id, type, x, y) => {
    if (type === 'special') setTimeLeft(prev => prev + 10);
    if (type === 'bad') setTimeLeft(prev => Math.max(0, prev - 10));
    setScore(prev => prev + (type === 'special' ? 60 : type === 'bad' ? -25 : 10));
    
    // ゴキブリを削除
    setCockroaches(prev => prev.filter(g => g.id !== id));
    
    // --- 爆発エフェクトの追加 ---
    const explosionId = Date.now() + 1;
    setExplosions(prev => [...prev, { id: explosionId, x, y }]);
    // 0.5秒後に爆発を消去
    setTimeout(() => {
      setExplosions(prev => prev.filter(e => e.id !== explosionId));
    }, 500);
  };

  const endGame = () => {
    setGameState('gameover');
    const newHistory = [score, ...history].slice(0, 3);
    setHistory(newHistory);
    localStorage.setItem('goki-scores', JSON.stringify(newHistory));
    setCockroaches([]); // ゴキブリをリセット
    setExplosions([]); // 爆発をリセット
  };

  return (
    <div className="h-screen w-full bg-[#d2b48c] p-4 flex flex-col items-center font-sans">
      {gameState === 'start' && (
        <div className="text-center mt-20">
            <h1 className="text-5xl font-bold text-red-700 mb-10 drop-shadow-lg">ロン君のゴッキー退治ゲーム</h1>
            <button onClick={() => { setGameState('playing'); setTimeLeft(GAME_TIME); setScore(0); }} 
                    className="p-8 bg-green-600 text-white rounded-full text-3xl font-bold shadow-xl hover:bg-green-700 transition-all duration-300 transform hover:scale-105">ゲーム開始！</button>
        </div>
      )}

      {gameState === 'playing' && (
        <div ref={gameAreaRef} className="relative w-full max-w-[800px] h-[70vh] min-h-[500px] bg-[url('/images/floor_texture.jpg')] bg-cover border-4 border-black rounded-lg overflow-hidden shadow-inner">
          {/* ゴミ */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-yellow-950/80 rounded-full flex items-center justify-center text-yellow-300 font-extrabold text-xl shadow-2xl border-4 border-yellow-900 z-10">
            ゴミ山
            <img src="/images/trash_pile.png" alt="ゴミ" className="absolute inset-0 w-full h-full object-cover rounded-full opacity-70"/>
          </div>
          
          {/* UI (タイマーとスコア) */}
          <div className="absolute top-2 left-2 bg-black/60 p-3 rounded-lg text-white z-20 border border-yellow-800 shadow-lg">
            <div className="text-2xl font-bold">スコア: {score}</div>
            <div className={`text-3xl font-black ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>残り: {timeLeft}秒</div>
          </div>

          {/* ゴキブリたち */}
          {cockroaches.map(g => (
            <div key={g.id} 
                 onClick={() => killCockroach(g.id, g.type, g.x, g.y)}
                 onTouchStart={() => killCockroach(g.id, g.type, g.x, g.y)} // タップ対応
                 className={`absolute w-14 h-14 cursor-crosshair cockroach-move`}
                 style={{ 
                    left: `${g.x}%`, 
                    top: `${g.y}%`,
                    backgroundImage: `url(${IMAGES[g.type]})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center'
                }} />
          ))}

          {/* 爆発エフェクト */}
          {explosions.map(e => (
            <div key={e.id} 
                 className="absolute w-20 h-20 -translate-x-1/2 -translate-y-1/2 explosion-effect pointer-events-none z-30"
                 style={{ 
                    left: `${e.x}%`, 
                    top: `${e.y}%`,
                    backgroundImage: `url(${IMAGES.explosion})`,
                    backgroundSize: 'cover'
                }} />
          ))}

          {/* 中央のゴミの上を覆い隠す要素 (ゴキブリがゴミの上に重なった時の挙動を改善) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-26 h-26 z-10 pointer-events-none rounded-full border-[12px] border-[#d2b48c] shadow-inner"></div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="text-center bg-black/70 p-10 rounded-2xl text-white border-4 border-red-900 mt-10">
          <h1 className="text-7xl font-extrabold text-red-500 mb-5 animate-bounce">GAME OVER</h1>
          <p className="text-5xl font-bold text-yellow-300 mb-8">最終スコア: {score}</p>
          <h2 className="text-3xl text-white font-bold mb-4">🏆 過去の記録 🏆</h2>
          <div className="space-y-3 text-3xl">
            {history.map((s, i) => <p key={i} className="bg-gray-800 p-3 rounded-lg font-mono">{i+1}位: {s}点</p>)}
          </div>
          <button onClick={() => setGameState('start')} className="mt-10 p-6 bg-red-700 text-white text-2xl font-bold rounded-full shadow-lg hover:bg-red-800 transition-all duration-300">もう一度退治する</button>
        </div>
      )}
    </div>
  );
};

export default App;