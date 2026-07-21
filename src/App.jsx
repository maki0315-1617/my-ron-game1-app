import React, { useState, useEffect } from 'react';
import './App.css';
import Cockroach from './Cockroach';
import trashPileImage from './images/trash_pile.png'; 
import blackCatImage from './images/black_cat.png';

const cockroachTypes = ['normal', 'bad', 'special'];

// ランダムプレゼントのリスト
const GIFTS = [
  "🎁 高級マタタビ",
  "🐟 最高級マグロの缶詰",
  "👑 金の王冠",
  "🧶 お気に入りの毛糸玉",
  "🌟 特製ちゅ〜る"
];

function App() {
  const [gameState, setGameState] = useState('start');
  const [score, setScore] = useState(0);
  const [cockroaches, setCockroaches] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [clearTime, setClearTime] = useState(null);
  const [history, setHistory] = useState([]);
  
  // 3回連続1分以内クリアの状態管理
  const [consecutiveWins, setConsecutiveWins] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);
  const [randomGift, setRandomGift] = useState('');

  useEffect(() => {
    const savedHistory = localStorage.getItem('gameHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }

    // 連勝記録の復元
    const savedWins = localStorage.getItem('consecutiveWins');
    if (savedWins) {
      const parsedWins = parseInt(savedWins, 10);
      if (!isNaN(parsedWins)) {
        setConsecutiveWins(parsedWins);
      }
    }
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setTimeout(() => {
      const now = new Date();
      const dateTimeString = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      
      const record = {
        dateTime: dateTimeString,
        seconds: 0,
        isGameOver: true
      };

      const updatedHistory = [record, ...history].slice(0, 3);
      setHistory(updatedHistory);
      localStorage.setItem('gameHistory', JSON.stringify(updatedHistory));

      // タイムアップ時は連勝をリセット
      setConsecutiveWins(0);
      localStorage.setItem('consecutiveWins', '0');

      setGameState('gameover');
      setCockroaches([]);
    }, 60000);

    const spawnInterval = setInterval(() => {
      const id = Date.now();
      const directions = ['top', 'bottom', 'left', 'right'];
      const direction = directions[Math.floor(Math.random() * directions.length)];
      const type = cockroachTypes[Math.floor(Math.random() * cockroachTypes.length)];

      const newCockroach = {
        id,
        direction,
        type,
        position: Math.random() * 80 + 10, 
        duration: Math.random() * 6.0 + 10.0,
      };

      setCockroaches((prev) => [...prev, newCockroach]);

      setTimeout(() => {
        setCockroaches((prev) => prev.filter((c) => c.id !== id));
      }, (newCockroach.duration + 2.0) * 1000);

    }, 2000);

    return () => {
      clearTimeout(timer);
      clearInterval(spawnInterval);
    };
  }, [gameState, history]);

  // 引数で id と type を確実に受け取るスコア処理
  const handleCockroachClick = (id, type) => {
    if (gameState !== 'playing') return;

    setScore((prevScore) => {
      let points = 1; // normal
      if (type === 'bad') points = -3;
      if (type === 'special') points = 2;

      const nextScore = Math.max(0, prevScore + points);

      if (nextScore >= 10) {
        const endTime = Date.now();
        const durationSeconds = ((endTime - startTime) / 1000).toFixed(2);
        
        const now = new Date();
        const dateTimeString = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        
        const record = {
          dateTime: dateTimeString,
          seconds: durationSeconds,
          isGameOver: false
        };

        const updatedHistory = [record, ...history].slice(0, 3);
        setHistory(updatedHistory);
        localStorage.setItem('gameHistory', JSON.stringify(updatedHistory));

        // 1分以内（60秒以内）のクリア判定＆連勝カウント加算
        if (parseFloat(durationSeconds) <= 60.0) {
          const nextWins = consecutiveWins + 1;
          setConsecutiveWins(nextWins);
          localStorage.setItem('consecutiveWins', String(nextWins));

          if (nextWins >= 3) {
            // 3回連続クリア達成時の処理
            const gift = GIFTS[Math.floor(Math.random() * GIFTS.length)];
            setRandomGift(gift);
            setShowCongrats(true);
            setConsecutiveWins(0);
            localStorage.setItem('consecutiveWins', '0');
          }
        } else {
          // 60秒を超えた場合は連勝リセット
          setConsecutiveWins(0);
          localStorage.setItem('consecutiveWins', '0');
        }

        setClearTime(durationSeconds);
        setGameState('clear');
        setCockroaches([]);
      }
      return nextScore;
    });

    setCockroaches((prev) => prev.filter((c) => c.id !== id));
  };

  const startGame = () => {
    setScore(0);
    setCockroaches([]);
    setStartTime(Date.now());
    setClearTime(null);
    setGameState('playing');
  };

  const backToTitle = () => {
    setGameState('start');
  };

  return (
    <div className="game-container">
      {gameState === 'start' && (
        <div className="start-screen">
          <div className="cat-header">
            <img src={blackCatImage} alt="Ron-kun the Black Cat" className="cat-image" />
          </div>
          <h1>ロン君のゴキ退治</h1>
          <p className="instruction-text">1分以内でゴキを10匹退治してね</p>
          
          <p style={{ fontSize: '14px', color: '#ffeb3b', margin: '0 0 15px 0' }}>
            現在の連続クリア数: {consecutiveWins} / 3
          </p>

          <button className="start-button" onClick={startGame}>ゲームスタート</button>
          
          <div className="history-section">
            <h3>過去のクリア記録 (直近3回)</h3>
            {history.length === 0 ? (
              <p>まだ記録はありません</p>
            ) : (
              <ul>
                {history.map((item, index) => (
                  <li key={index} style={{ color: item.isGameOver ? '#ff6b6b' : 'inherit' }}>
                    {item.dateTime} - {item.isGameOver ? 'ゲームオーバー' : `タイム: ${item.seconds}秒`}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <>
          <div className="score-display">
            スコア: {score} / 10
          </div>

          <div className="game-content">
            <p className="warning-text">注意：バットゴキブリはマイナスになるから気を付けて！</p>
            <div className="cat-header">
              <img src={blackCatImage} alt="Ron-kun the Black Cat" className="cat-image" />
            </div>
            
            <div className="garbage-display">
              <img 
                src={trashPileImage} 
                alt="Trash Pile" 
                className="garbage-image" 
              />
            </div>
          </div>

          {cockroaches.map((roach) => (
            <Cockroach 
              key={roach.id} 
              id={roach.id}
              direction={roach.direction} 
              type={roach.type}
              position={roach.position} 
              duration={roach.duration} 
              onClick={handleCockroachClick}
            />
          ))}
        </>
      )}

      {gameState === 'clear' && (
        <div className="clear-screen">
          <div className="cat-header">
            <img src={blackCatImage} alt="Ron-kun the Black Cat" className="cat-image" />
          </div>
          <h1>ゲームクリア！</h1>
          <p>クリアタイム: <strong>{clearTime}</strong> 秒</p>
          <button className="start-button" onClick={startGame}>もう一度プレイ</button>
          <button className="start-button" style={{ marginTop: '10px', backgroundColor: '#555' }} onClick={backToTitle}>タイトルに戻る</button>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="clear-screen">
          <div className="cat-header">
            <img src={blackCatImage} alt="Ron-kun the Black Cat" className="cat-image" />
          </div>
          <h1 style={{ color: '#ff6b6b' }}>ゲームオーバー</h1>
          <p>1分が経過しました...</p>
          <button className="start-button" onClick={startGame}>もう一度プレイ</button>
          <button className="start-button" style={{ marginTop: '10px', backgroundColor: '#555' }} onClick={backToTitle}>タイトルに戻る</button>
        </div>
      )}

      {/* 3回連続クリアのおめでとう＆ランダムプレゼント画面（モーダル） */}
      {showCongrats && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100
        }}>
          <div className="clear-screen" style={{ border: '2px solid #ffcc00', boxShadow: '0 0 20px rgba(255, 204, 0, 0.4)' }}>
            <h2 style={{ color: '#ffcc00', marginBottom: '15px', fontSize: '20px' }}>🎉 大記録達成！おめでとう！ 🎉</h2>
            <p className="instruction-text" style={{ marginBottom: '15px' }}>
              1分以内のゴキ退治、3回連続クリア成功！
            </p>
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px dashed #ffcc00'
            }}>
              <p style={{ color: '#a3e4d7', fontSize: '13px', margin: '0 0 5px 0' }}>ロン君からのプレゼント：</p>
              <p style={{ color: '#ffeb3b', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{randomGift}</p>
            </div>
            <button className="start-button" onClick={() => setShowCongrats(false)}>
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;