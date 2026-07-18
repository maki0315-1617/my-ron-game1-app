'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function Page() {
  const [isMounted, setIsMounted] = useState(false);
  const timerRef = useRef(null);

  // ゲーム状態管理
  const [gameState, setGameState] = useState('setup'); 
  const [playerScore, setPlayerScore] = useState(0);
  const [ronScore, setRonScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [message, setMessage] = useState('準備ができたら下の「キックオフ！」ボタンを押してね！');
  const [logs, setLogs] = useState([]);

  // カウントダウン用の数字
  const [countdownNum, setCountdownNum] = useState(3);

  // マトリックス表用の履歴（〇, ×, null）
  const [playerHistory, setPlayerHistory] = useState([null, null, null, null, null]);
  const [ronHistory, setRonHistory] = useState([null, null, null, null, null]);

  // 位置データ
  const [ballLeft, setBallLeft] = useState('50%');
  const [ballTop, setBallTop] = useState('85%');
  const [keeperLeft, setKeeperLeft] = useState('50%');
  const [keeperTop, setKeeperTop] = useState('30%');

  // ロン君がどこに蹴るかの内部状態
  const [ronTargetCourse, setRonTargetCourse] = useState('中央');

  useEffect(() => {
    setIsMounted(true);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const clearActiveTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleStart = () => {
    clearActiveTimer();
    setGameState('attack');
    setMessage(`⚽ 第 ${currentRound + 1}回戦 あなたの攻撃：上のゴール枠内の好きなところ（左・中央・右）をクリックしてシュート！`);
    setBallLeft('50%');
    setBallTop('85%');
    setKeeperLeft('50%');
    setKeeperTop('30%');
  };

  const handlePitchClickAttack = (course) => {
    if (gameState !== 'attack') return;

    const courses = ['左', '中央', '右'];
    const ronCourse = courses[Math.floor(Math.random() * 3)];
    const posMap = { '左': '25%', '中央': '50%', '右': '75%' };
    
    setBallLeft(posMap[course]);
    setBallTop('30%');
    setKeeperLeft(posMap[ronCourse]);

    const isGoal = course !== ronCourse;
    let resultText = '';
    let newScore = playerScore;
    const nextPlayerHistory = [...playerHistory];

    if (isGoal) {
      newScore += 1;
      setPlayerScore(newScore);
      resultText = '〇 ゴール！';
      nextPlayerHistory[currentRound] = '〇';
    } else {
      resultText = '× ロン君に止められた…';
      nextPlayerHistory[currentRound] = '×';
    }

    setPlayerHistory(nextPlayerHistory);
    const rNum = currentRound + 1;
    setLogs(prev => [`【${rNum}回戦・あなたの攻撃】 ${course}を狙った ➔ ロン君は${ronCourse}を守った：${resultText}`, ...prev]);
    setMessage(`${resultText} ➔ あなたの攻撃終了。次は守備です。「守備フェーズへ進む」を押すと、位置が入れ替わってカウントダウンが始まります！`);
    setGameState('attack_result');
  };

  const startDefendPhase = () => {
    clearActiveTimer();
    setGameState('countdown');
    setCountdownNum(3);
    setMessage('🛡️ ロン君の攻撃ターン！位置が入れ替わります。身構えてください！');
    
    setBallLeft('50%');
    setBallTop('85%'); 
    setKeeperLeft('50%');
    setKeeperTop('30%'); 

    const courses = ['左', '中央', '右'];
    const ronChoice = courses[Math.floor(Math.random() * 3)];
    setRonTargetCourse(ronChoice);

    let count = 3;
    timerRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdownNum(count);
      } else if (count === 0) {
        clearActiveTimer();
        setCountdownNum('KICK!');
        setMessage('🏃‍♂️ ロン君が蹴った！上のゴール枠内（左・中央・右）をクリックしてシュートを止めて！');
        setGameState('defend_click');
        
        const posMap = { '左': '25%', '中央': '50%', '右': '75%' };
        setBallLeft(posMap[ronChoice]);
        setBallTop('30%'); 
      }
    }, 1000);
  };

  const handlePitchClickDefend = (course) => {
    if (gameState !== 'defend_click') return;

    const posMap = { '左': '25%', '中央': '50%', '右': '75%' };
    setKeeperLeft(posMap[course]);

    const isSaved = course === ronTargetCourse;
    let resultText = '';
    let newRonScore = ronScore;
    const nextRonHistory = [...ronHistory];

    if (isSaved) {
      resultText = '〇 ナイスセーブ！ロン君のシュートを止めました！';
      nextRonHistory[currentRound] = '〇';
    } else {
      newRonScore += 1;
      setRonScore(newRonScore);
      resultText = '× 決められた… ロン君のゴール！';
      nextRonHistory[currentRound] = '×';
    }

    setRonHistory(nextRonHistory);
    const rNum = currentRound + 1;
    setLogs(prev => [`【${rNum}回戦・ロン君の攻撃】 ロン君の狙い:${ronTargetCourse} ➔ あなたの守備:${course} 【${isSaved ? 'セーブ成功' : '失点'}】`, ...prev]);
    
    setMessage(`${resultText} ➔ ロン君の攻撃終了。下のボタンを押して一度画面を初期状態に戻してください。`);
    setGameState('defend_result');
  };

  const advanceAfterDefend = () => {
    clearActiveTimer();
    
    setBallLeft('50%');
    setBallTop('85%');
    setKeeperLeft('50%');
    setKeeperTop('30%');

    if (playerScore >= 3 && ronScore < 3) {
      setGameState('game_over');
      setMessage(`🏆 試合終了！あなたの勝ちです！ 🎉（結果：${playerScore} 対 ${ronScore}）`);
      return;
    }
    if (ronScore >= 3 && playerScore < 3) {
      setGameState('game_over');
      setMessage(`🐈 試合終了！ロン君の勝ちです…（結果：${playerScore} 対 ${ronScore}）`);
      return;
    }

    const nextRound = currentRound + 1;
    if (nextRound >= 5) {
      setGameState('game_over');
      const finalWinner = playerScore > ronScore ? 'あなたの勝ち！🎉' : playerScore < ronScore ? 'ロン君の勝ち 🐈' : '引き分け 🤝';
      setMessage(`🏆 5回戦すべて終了しました！ 結果：${finalWinner}（${playerScore} 対 ${ronScore}）`);
      return;
    }

    const nextRoundDisplay = nextRound + 1;
    const finishedRoundDisplay = currentRound + 1;
    const nextMessage = `第 ${finishedRoundDisplay}回戦が終了しました！下の「キックオフ！」ボタンを押すと、第 ${nextRoundDisplay}回戦が始まります。`;

    setCurrentRound(nextRound);
    setGameState('setup');
    setMessage(nextMessage);
  };

  const resetGame = () => {
    clearActiveTimer();
    setPlayerScore(0);
    setRonScore(0);
    setCurrentRound(0);
    setLogs([]);
    setPlayerHistory([null, null, null, null, null]);
    setRonHistory([null, null, null, null, null]);
    setGameState('setup');
    setMessage('準備ができたら下の「キックオフ！」ボタンを押してね！');
    setBallLeft('50%');
    setBallTop('85%');
    setKeeperLeft('50%');
    setKeeperTop('30%');
  };

  const isDefendMode = (gameState === 'countdown' || gameState === 'defend_click' || gameState === 'defend_result');

  if (!isMounted) return <div style={{ padding: '20px', textAlign: 'center' }}>読み込み中...</div>;

  return (
    <div style={{ padding: '15px', fontFamily: 'sans-serif', maxWidth: '440px', margin: '0 auto', textAlign: 'center', color: '#333333' }}>
      <h2 style={{ fontSize: '18px', marginBottom: '15px', fontWeight: 'bold' }}>黒猫ロン君とのPK戦（5回戦・3点先取）</h2>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '12px', background: '#ffffff', border: '1px solid #dddddd' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            <th style={{ padding: '8px', border: '1px solid #dddddd', fontWeight: 'bold' }}>チーム / 回戦</th>
            {[1, 2, 3, 4, 5].map((r) => (
              <th key={r} style={{ padding: '8px', border: '1px solid #dddddd', width: '50px', backgroundColor: currentRound === r - 1 && gameState !== 'game_over' ? '#edf2f7' : 'transparent' }}>
                {r}回
              </th>
            ))}
            <th style={{ padding: '8px', border: '1px solid #dddddd', backgroundColor: '#edf7ed', fontWeight: 'bold' }}>得点</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '8px', border: '1px solid #dddddd', fontWeight: 'bold' }}>あなた</td>
            {playerHistory.map((h, i) => <td key={i} style={{ padding: '8px', border: '1px solid #dddddd', fontWeight: 'bold', color: h === '〇' ? '#e53e3e' : '#4a5568' }}>{h || '-'}</td>)}
            <td style={{ padding: '8px', border: '1px solid #dddddd', fontWeight: 'bold', backgroundColor: '#edf7ed', color: '#e53e3e' }}>{playerScore}</td>
          </tr>
          <tr>
            <td style={{ padding: '8px', border: '1px solid #dddddd', fontWeight: 'bold' }}>ロン君</td>
            {ronHistory.map((h, i) => <td key={i} style={{ padding: '8px', border: '1px solid #dddddd', fontWeight: 'bold', color: h === '〇' ? '#388e3c' : '#e53e3e' }}>{h === '〇' ? '〇' : h === '×' ? '×' : '-'}</td>)}
            <td style={{ padding: '8px', border: '1px solid #dddddd', fontWeight: 'bold', backgroundColor: '#edf7ed', color: '#388e3c' }}>{ronScore}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ padding: '12px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', marginBottom: '15px', border: '1px solid #cbd5e0', background: '#f7fafc', textAlign: 'left' }}>
        {message}
      </div>

      <div style={{ marginBottom: '15px' }}>
        {gameState === 'setup' && <button onClick={handleStart} style={{ width: '100%', padding: '12px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#1976d2', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>キックオフ！</button>}
        {gameState === 'attack_result' && <button onClick={startDefendPhase} style={{ width: '100%', padding: '12px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#ff9800', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>守備フェーズへ進む</button>}
        {gameState === 'defend_result' && <button onClick={advanceAfterDefend} style={{ width: '100%', padding: '12px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#4caf50', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>判定を確認して次へ</button>}
        {gameState === 'game_over' && <button onClick={resetGame} style={{ width: '100%', padding: '12px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#e53e3e', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>もう一度遊ぶ</button>}
      </div>

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '15px' }}>
        <div style={{ width: '400px', height: '288px', background: isDefendMode ? '#1b4d22' : '#4caf50', position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '2px solid #388e3c' }}>
          {gameState === 'countdown' && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#ffffff', fontSize: '60px', fontWeight: 'bold' }}>{countdownNum}</div>}
          <div style={{ position: 'absolute', top: '15px', left: '40px', width: '320px', height: '140px', borderTop: '4px solid #ffffff', borderLeft: '4px solid #ffffff', borderRight: '4px solid #ffffff', boxSizing: 'border-box' }}>
            {gameState === 'attack' && (
              <div style={{ display: 'flex', height: '100%' }}>
                <div onClick={() => handlePitchClickAttack('左')} style={{ flex: 1, cursor: 'pointer' }} />
                <div onClick={() => handlePitchClickAttack('中央')} style={{ flex: 1, cursor: 'pointer' }} />
                <div onClick={() => handlePitchClickAttack('右')} style={{ flex: 1, cursor: 'pointer' }} />
              </div>
            )}
            {gameState === 'defend_click' && (
              <div style={{ display: 'flex', height: '100%' }}>
                <div onClick={() => handlePitchClickDefend('左')} style={{ flex: 1, cursor: 'pointer' }} />
                <div onClick={() => handlePitchClickDefend('中央')} style={{ flex: 1, cursor: 'pointer' }} />
                <div onClick={() => handlePitchClickDefend('右')} style={{ flex: 1, cursor: 'pointer' }} />
              </div>
            )}
          </div>
          <div style={{ position: 'absolute', left: keeperLeft, top: keeperTop, transform: 'translate(-50%, -50%)', fontSize: '42px', zIndex: 10, transition: 'left 0.2s' }}>{isDefendMode ? '🧍' : '🐈‍⬛'}</div>
          <div style={{ position: 'absolute', left: ballLeft, top: ballTop, transform: 'translate(-50%, -50%)', fontSize: '28px', zIndex: 20, transition: 'left 0.25s' }}>⚽</div>
          <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', fontSize: '38px' }}>{isDefendMode ? '🐈‍⬛' : '🏃‍♂️'}</div>
        </div>
      </div>
      
      <div style={{ maxHeight: '95px', overflowY: 'auto', background: '#fafafa', padding: '8px', borderRadius: '4px', border: '1px solid #eeeeee', fontSize: '11px', color: '#666666', textAlign: 'left' }}>
        {logs.map((log, index) => <div key={index} style={{ padding: '3px 0' }}>{log}</div>)}
      </div>
    </div>
  );
}