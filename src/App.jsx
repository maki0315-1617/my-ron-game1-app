'use client';

import React, { useState } from 'react';

export default function RonPkGame() {
  // ゲームの状態: 'attack' (プレイヤーの攻撃), 'defend_ready' (ロン君の攻撃待ち), 'game_over' (試合終了)
  const [gameState, setGameState] = useState('attack'); 
  const [logs, setLogs] = useState([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [ronScore, setRonScore] = useState(0);
  const [currentActionMessage, setCurrentActionMessage] = useState('ゴール内をクリックしてシュート！');

  // 1回戦〜5回戦の記録用配列（null, '〇', '×'）
  const [playerHistory, setPlayerHistory] = useState([null, null, null, null, null]);
  const [ronHistory, setRonHistory] = useState([null, null, null, null, null]);
  const [currentRound, setCurrentRound] = useState(0); 

  const [winner, setWinner] = useState('');

  // ゴールのサイズ定義
  const goalWidth = 400;
  const goalHeight = 180;

  // 動的な位置情報（%で管理）
  const [ballPos, setBallPos] = useState({ x: 50, y: 115 }); 
  const [keeperPos, setKeeperPos] = useState({ x: 50, y: 35 });  

  // 勝敗チェック関数
  const checkGameOver = (nextPlayerScore, nextRonScore, nextRound, isAfterDefend) => {
    if (nextPlayerScore >= 3 && nextRonScore < 3 && isAfterDefend) {
      setWinner('あなた');
      setGameState('game_over');
      setCurrentActionMessage('🎉 3点先取！あなたの勝ちです！');
      return true;
    } else if (nextRonScore >= 3 && nextPlayerScore < 3 && isAfterDefend) {
      setWinner('ロン君');
      setGameState('game_over');
      setCurrentActionMessage('🐈 ロン君が3点先取！ロン君の勝ちです！');
      return true;
    } else if (nextPlayerScore >= 3 && nextRonScore >= 3) {
      if (nextPlayerScore > nextRonScore) {
        setWinner('あなた');
      } else if (nextRonScore > nextPlayerScore) {
        setWinner('ロン君');
      } else {
        setWinner('引き分け');
      }
      setGameState('game_over');
      setCurrentActionMessage('試合終了！');
      return true;
    } else if (nextRound >= 5) {
      if (nextPlayerScore > nextRonScore) setWinner('あなた');
      else if (nextRonScore > nextPlayerScore) setWinner('ロン君');
      else setWinner('引き分け');
      setGameState('game_over');
      setCurrentActionMessage('5回戦終了しました！');
      return true;
    }
    return false;
  };

  // 1. あなたの攻撃（ゴールエリアをクリックしたとき）
  const handleAttack = (e) => {
    if (gameState !== 'attack') return;
    if (!e || !e.currentTarget) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (clickY > goalHeight) return;

    const ballXPercent = (clickX / goalWidth) * 100;
    const ballYPercent = (clickY / (goalHeight * 1.6)) * 100;

    const ronXPercent = 25 + Math.random() * 50; 
    const ronYPercent = 20 + Math.random() * 35;

    setBallPos({ x: ballXPercent, y: ballYPercent });
    setKeeperPos({ x: ronXPercent, y: ronYPercent });

    const xDiff = clickX - (ronXPercent * goalWidth) / 100;
    const yDiff = clickY - (ronYPercent * (goalHeight * 1.6)) / 100;
    const distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    const isGoal = distance > 60; 

    let resultMessage = '';
    const nextHistory = [...playerHistory];
    let nextPlayerScore = playerScore;

    if (isGoal) {
      nextPlayerScore += 1;
      setPlayerScore(nextPlayerScore);
      resultMessage = '〇 ゴール！';
      nextHistory[currentRound] = '〇';
    } else {
      resultMessage = '× 止められた…';
      nextHistory[currentRound] = '×';
    }
    setPlayerHistory(nextHistory);

    const roundNum = currentRound + 1;
    const newLog = "【" + roundNum + "回戦・あなた攻撃】 → " + resultMessage;
    setLogs(prev => [newLog, ...prev]);

    setCurrentActionMessage(resultMessage + " 次は守備の番です。ロン君のシュートを止めましょう！");
    setGameState('defend_ready');
  };

  // 2. あなたの守備（「動いてシュートを止める！」ボタンを押したとき）
  const handleDefend = () => {
    if (gameState !== 'defend_ready') return;

    const ronXPercent = 15 + Math.random() * 70;
    const ronYPercent = 15 + Math.random() * 40;

    const playerXPercent = 25 + Math.random() * 50;
    const playerYPercent = 20 + Math.random() * 35;

    setBallPos({ x: ronXPercent, y: ronYPercent });
    setKeeperPos({ x: playerXPercent, y: playerYPercent });

    const xDiff = (ronXPercent - playerXPercent) * goalWidth / 100;
    const yDiff = (ronYPercent - playerYPercent) * (goalHeight * 1.6) / 100;
    const distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    const isSaved = distance <= 60;

    let resultMessage = '';
    const nextHistory = [...ronHistory];
    let nextRonScore = ronScore;

    if (isSaved) {
      resultMessage = '〇 止めた！';
      nextHistory[currentRound] = '〇';
    } else {
      nextRonScore += 1;
      setRonScore(nextRonScore);
      resultMessage = '× 決められた…';
      nextHistory[currentRound] = '×';
    }
    setRonHistory(nextHistory);

    const nextRound = currentRound + 1;
    setCurrentRound(nextRound);

    const roundNum = currentRound + 1;
    const logDetail = isSaved ? 'あなたがセーブ！' : 'ロン君ゴール！';
    const newLog = "【" + roundNum + "回戦・ロン君攻撃】 → " + logDetail;
    setLogs(prev => [newLog, ...prev]);

    const isOver = checkGameOver(playerScore, nextRonScore, nextRound, true);

    if (!isOver) {
      const nextRoundNum = nextRound + 1;
      setCurrentActionMessage(resultMessage + " " + nextRoundNum + "回戦に突入！あなたの攻撃です。");
      setGameState('attack');
    }
  };

  const resetGame = () => {
    setPlayerScore(0);
    setRonScore(0);
    setLogs([]);
    setPlayerHistory([null, null, null, null, null]);
    setRonHistory([null, null, null, null, null]);
    setCurrentRound(0);
    setWinner('');
    setGameState('attack');
    setBallPos({ x: 50, y: 115 });
    setKeeperPos({ x: 50, y: 35 });
    setCurrentActionMessage('ゴール内をクリックしてシュート！');
  };

  return (
    <div style={{ padding: '15px', fontFamily: 'sans-serif', maxWidth: '440px', margin: '0 auto', textAlign: 'center' }}>
      <h3>黒猫ロン君とのPK戦（5回戦・3点先取制）</h3>

      {/* 1回戦〜5回戦 マトリックス表 */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: '6px', border: '1px solid #ddd' }}>選手 / 回戦</th>
            {[1, 2, 3, 4, 5].map(r => (
              <th key={r} style={{ padding: '6px', border: '1px solid #ddd', width: '50px', color: currentRound === r - 1 ? '#0d47a1' : '#333' }}>
                {r}{currentRound === r - 1 ? '★' : ''}
              </th>
            ))}
            <th style={{ padding: '6px', border: '1px solid #ddd', backgroundColor: '#e8f5e9' }}>計</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '6px', border: '1px solid #ddd', fontWeight: 'bold' }}>あなた (攻)</td>
            {playerHistory.map((h, i) => (
              <td key={i} style={{ padding: '6px', border: '1px solid #ddd', fontWeight: 'bold', color: h === '〇' ? '#d32f2f' : '#388e3c' }}>{h || '-'}</td>
            ))}
            <td style={{ padding: '6px', border: '1px solid #ddd', fontWeight: 'bold', backgroundColor: '#e8f5e9' }}>{playerScore}</td>
          </tr>
          <tr>
            <td style={{ padding: '6px', border: '1px solid #ddd', fontWeight: 'bold' }}>ロン君 (守)</td>
            {ronHistory.map((h, i) => (
              <td key={i} style={{ padding: '6px', border: '1px solid #ddd', fontWeight: 'bold', color: h === '×' ? '#d32f2f' : '#388e3c' }}>
                {h === '〇' ? '×' : h === '×' ? '〇' : '-'}
              </td>
            ))}
            <td style={{ padding: '6px', border: '1px solid #ddd', fontWeight: 'bold', backgroundColor: '#e8f5e9' }}>{ronScore}</td>
          </tr>
        </tbody>
      </table>

      {/* 状態ガイダンス */}
      <div style={{
        padding: '10px', 
        borderRadius: '6px', 
        marginBottom: '15px', 
        fontWeight: 'bold',
        fontSize: '13px',
        background: gameState === 'attack' ? '#e3f2fd' : gameState === 'game_over' ? '#e8f5e9' : '#fff3e0',
        color: gameState === 'attack' ? '#0d47a1' : gameState === 'game_over' ? '#2e7d32' : '#e65100',
        border: '1px solid rgba(0,0,0,0.05)'
      }}>
        {gameState === 'attack' && '⚔️ あなたの攻撃ターン'}
        {gameState === 'defend_ready' && '🛡️ ロン君の攻撃（あなたの守備ターン）'}
        {gameState === 'game_over' && '🏆 試合終了 【勝者: ' + winner + '】'}
        <div style={{ fontWeight: 'normal', fontSize: '12px', color: '#444', marginTop: '4px' }}>
          {currentActionMessage}
        </div>
      </div>

      {/* メインゲームピッチ */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '15px' }}>
        <div 
          onClick={gameState === 'attack' ? handleAttack : undefined}
          style={{
            width: goalWidth + 'px',
            height: (goalHeight * 1.6) + 'px', 
            background: gameState === 'attack' ? '#2e7d32' : '#114016', 
            position: 'relative',
            cursor: gameState === 'attack' ? 'crosshair' : 'not-allowed',
            borderRadius: '6px',
            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.4)',
            overflow: 'hidden',
            transition: 'background 0.3s ease'
          }}
        >
          {/* ゴールポスト */}
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '20px',
            width: (goalWidth - 40) + 'px',
            height: goalHeight + 'px',
            border: gameState === 'attack' ? '5px solid #ffffff' : '5px solid #b0bec5', 
            borderBottom: 'none',
            boxSizing: 'border-box',
            background: gameState === 'attack' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.25)', 
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
            backgroundSize: '12px 12px',
            borderRadius: '4px 4px 0 0',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ position: 'absolute', bottom: '-2px', left: '-5px', right: '-5px', height: '2px', backgroundColor: '#fff' }}></div>
          </div>

          {/* グラウンドライン */}
          <div style={{
            position: 'absolute',
            top: (goalHeight + 10) + 'px',
            width: '100%',
            height: '2px',
            backgroundColor: 'rgba(255,255,255,0.3)'
          }}></div>

          {/* キーパー */}
          <div style={{
            position: 'absolute',
            left: keeperPos.x + '%',
            top: keeperPos.y + '%',
            transform: 'translate(-50%, -50%)',
            transition: 'all 0.35s ease-out',
            fontSize: '40px',
            zIndex: 10,
            filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.3))',
            userSelect: 'none'
          }}>
            {gameState === 'attack' ? '🐈‍⬛' : '🧍'}
          </div>

          {/* ボール */}
          <div style={{
            position: 'absolute',
            left: ballPos.x + '%',
            top: ballPos.y + '%',
            transform: 'translate(-50%, -50%)',
            transition: 'all 0.3s cubic-bezier(0.1, 0.6, 0.2, 1)',
            fontSize: '26px',
            zIndex: 20,
            filter: 'drop-shadow(0px 3px 2px rgba(0,0,0,0.4))',
            userSelect: 'none'
          }}>
            ⚽
          </div>

          {/* キッカー */}
          {gameState === 'attack' && (
            <div style={{ position: 'absolute', bottom: '5px', left: '50%', transform: 'translateX(-50%)', fontSize: '24px', opacity: 0.8 }}>
              🏃‍♂️
            </div>
          )}
          {gameState === 'defend_ready' && (
            <div style={{ position: 'absolute', bottom: '5px', left: '50%', transform: 'translateX(-50%) scaleX(-1)', fontSize: '24px', opacity: 0.8 }}>
              🐈‍⬛
            </div>
          )}
        </div>

        {/* 守備ボタン */}
        {gameState === 'defend_ready' && (
          <div style={{ width: goalWidth + 'px', marginTop: '-5px' }}>
            <button 
              onClick={handleDefend}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '15px',
                fontWeight: 'bold',
                backgroundColor: '#ff9800',
                color: 'white',
                border: 'none',
                borderRadius: '0 0 6px 6px',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(0,0,0,0.15)'
              }}
            >
              🏃‍♂️ 動いてシュートを止める！
            </button>
          </div>
        )}
      </div>

      {/* コントロール */}
      <button 
        onClick={resetGame}
        style={{ padding: '6px 14px', background: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', color: '#444' }}
      >
        ゲームをリセット
      </button>

      {/* ミニログ */}
      <div style={{ marginTop: '15px' }}>
        <div style={{ maxHeight: '90px', overflowY: 'auto', background: '#fafafa', padding: '6px', borderRadius: '4px', border: '1px solid #eee', fontSize: '11px', color: '#666', textAlign: 'left' }}>
          {logs.length === 0 && <p style={{ margin: 0, color: '#999' }}>キックオフ！ゴール枠内を狙ってね。</p>}
          {logs.map((log, index) => (
            <div key={index} style={{ padding: '2px 0', borderBottom: '1px solid #eee' }}>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}