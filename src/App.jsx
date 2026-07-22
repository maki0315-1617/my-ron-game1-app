import React, { useState, useEffect } from 'react';
import './App.css';
import Cockroach from './Cockroach';
import trashPileImage from './images/trash_pile.png'; 
import blackCatImage from './images/black_cat.png';

const cockroachTypes = ['normal', 'bad', 'special'];

function App() {
  const [gameState, setGameState] = useState('start');
  const [score, setScore] = useState(0);
  const [cockroaches, setCockroaches] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [clearTime, setClearTime] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('gameHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history', e);
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
    <div className={`game-container ${gameState === 'playing' ? 'game-floor' : ''}`}>
      {gameState === 'start' && (
        <div className="start-screen">
          <div className="cat-header">
            <img src={blackCatImage} alt="Ron-kun the Black Cat" className="cat-image" />
          </div>
          <h1>ロン君のゴキ退治</h1>
          <p className="instruction-text">1分以内でゴキを10匹退治してね</p>
          <button className="start-button" onClick={startGame}>ゲームスタート</button>
          
          <div className="history-section">
            <h3>過去のクリア記録 (直近3回)</h3>
            {history.length === 0 ? (
              <p>まだ記録はありません</p>
            ) : (
              <ul>
                {history.map((item, index) => (
                  <li key={index} style={{ color: item.isGameOver ? 'red' : 'inherit' }}>
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
          <h1 style={{ color: 'red' }}>ゲームオーバー</h1>
          <p>1分が経過しました...</p>
          <button className="start-button" onClick={startGame}>もう一度プレイ</button>
          <button className="start-button" style={{ marginTop: '10px', backgroundColor: '#555' }} onClick={backToTitle}>タイトルに戻る</button>
        </div>
      )}
    </div>
  );
}

export default App;