'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function Page() {
  const [isMounted, setIsMounted] = useState(false);
  const pitchRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ゲームの状態管理
  const [gameState, setGameState] = useState('attack'); 
  const [logs, setLogs] = useState([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [ronScore, setRonScore] = useState(0);
  const [currentActionMessage, setCurrentActionMessage] = useState('ゴール内をクリックしてシュート！');

  const [playerHistory, setPlayerHistory] = useState([null, null, null, null, null]);
  const [ronHistory, setRonHistory] = useState([null, null, null, null, null]);
  const [currentRound, setCurrentRound] = useState(0); 
  const [winner, setWinner] = useState('');

  // 位置情報（初期位置）
  const [ballLeft, setBallLeft] = useState('50%');
  const [ballTop, setBallTop] = useState('115%');
  const [keeperLeft, setKeeperLeft] = useState('50%');
  const [keeperTop, setKeeperTop] = useState('35%');

  // 勝敗判定
  const checkGameOver = (pScore, rScore, round, isAfterDefend) => {
    if (pScore >= 3 && rScore < 3 && isAfterDefend) {
      setWinner('あなた');
      setGameState('game_over');
      setCurrentActionMessage('🎉 3点先取！あなたの勝ちです！');
      return true;
    }
    if (rScore >= 3 && pScore < 3 && isAfterDefend) {
      setWinner('ロン君');
      setGameState('game_over');
      setCurrentActionMessage('🐈 ロン君が3点先取！ロン君の勝ちです！');
      return true;
    }
    if (pScore >= 3 && rScore >= 3) {
      setWinner(pScore > rScore ? 'あなた' : rScore > pScore ? 'ロン君' : '引き分け');
      setGameState('game_over');
      setCurrentActionMessage('試合終了！');
      return true;
    }
    if (round >= 5) {
      setWinner(pScore > rScore ? 'あなた' : rScore > pScore ? 'ロン君' : '引き分け');
      setGameState('game_over');
      setCurrentActionMessage('5回戦終了しました！');
      return true;
    }
    return false;
  };

  // あなたの攻撃（クリックイベント）
  const handleAttack = (e) => {
    // 1. 状態ガード
    if (gameState !== 'attack') return;
    if (!pitchRef || !pitchRef.current) return;

    // 2. クラッシュ防止：イベントデータを即座にローカル変数に固定（最重要）
    const clientX = e.clientX;
    const clientY = e.clientY;

    // 3. 要素の座標計算
    const rect = pitchRef.current.getBoundingClientRect();
    if (!rect) return;

    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    // ゴールポストの外（下側）のクリックは処理しない
    if (clickY > 180 || clickX < 0 || clickX > 400) return;

    // 確率計算用の数値
    const ballXPercent = (clickX / 400) * 100;
    const ballYPercent = (clickY / 288) * 100;
    const ronXPercent = 25 + Math.random() * 50; 
    const ronYPercent = 20 + Math.random() * 35;

    // 表示位置の更新（安全な文字列リテラル）
    setBallLeft(String(ballXPercent) + '%');
    setBallTop(String(ballYPercent) + '%');
    setKeeperLeft(String(ronXPercent) + '%');
    setKeeperTop(String(ronYPercent) + '%');

    // ゴール判定（キーパーとボールの距離を計算）
    const xDiff = clickX - (ronXPercent * 400) / 100;
    const yDiff = clickY - (ronYPercent * 288) / 100;
    const isGoal = Math.sqrt(xDiff * xDiff + yDiff * yDiff) > 60;

    const nextHistory = [...playerHistory];
    let nextPlayerScore = playerScore;
    let result = '';

    if (isGoal) {
      nextPlayerScore += 1;
      setPlayerScore(nextPlayerScore);
      result = '〇 ゴール！';
      nextHistory[currentRound] = '〇';
    } else {
      result = '× 止められた…';
      nextHistory[currentRound] = '×';
    }
    setPlayerHistory(nextHistory);

    const rNum = currentRound + 1;
    setLogs(prev => ['【' + rNum + '回戦・あなた攻撃】 → ' + result, ...prev]);
    setCurrentActionMessage(result + ' 次は守備の番です。下のオレンジのボタンを押してロン君のシュートを止めましょう！');
    setGameState('defend_ready');
  };

  // あなたの守備（ボタンクリック）
  const handleDefend = () => {
    if (gameState !== 'defend_ready') return;

    const ronX = 15 + Math.random() * 70;
    const ronY = 15 + Math.random() * 40;
    const playerX = 25 + Math.random() * 50;
    const playerY = 20 + Math.random() * 35;

    setBallLeft(String(ronX) + '%');
    setBallTop(String(ronY) + '%');
    setKeeperLeft(String(playerX) + '%');
    setKeeperTop(String(playerY) + '%');

    const xDiff = ((ronX - playerX) * 400) / 100;
    const yDiff = ((ronY - playerY) * 288) / 100;
    const isSaved = Math.sqrt(xDiff * xDiff + yDiff * yDiff) <= 60;

    const nextHistory = [...ronHistory];
    let nextRonScore = ronScore;
    let result = '';

    if (isSaved) {
      result = '〇 止めた！';
      nextHistory[currentRound] = '〇';
    } else {
      nextRonScore += 1;
      setRonScore(nextRonScore);
      result = '× 決められた…';
      nextHistory[currentRound] = '×';
    }
    setRonHistory(nextHistory);

    const nextRound = currentRound + 1;
    setCurrentRound(nextRound);

    const rNum = currentRound + 1;
    const detail = isSaved ? 'あなたがセーブ！' : 'ロン君ゴール！';
    setLogs(prev => ['【' + rNum + '回戦・ロン君攻撃】 → ' + detail, ...prev]);

    const isOver = checkGameOver(playerScore, nextRonScore, nextRound, true);
    if (!isOver) {
      setCurrentActionMessage(result + ' ' + (nextRound + 1) + '回戦に突入！ゴール内をクリックしてシュートしてください。');
      setGameState('attack');
    }
  };

  // リセット
  const resetGame = () => {
    setPlayerScore(0);
    setRonScore(0);
    setLogs([]);
    setPlayerHistory([null, null, null, null, null]);
    setRonHistory([null, null, null, null, null]);
    setCurrentRound(0);
    setWinner('');
    setGameState('attack');
    setBallLeft('50%');
    setBallTop('115%');
    setKeeperLeft('50%');
    setKeeperTop('35%');
    setCurrentActionMessage('ゴール内をクリックしてシュート！');
  };

  if (!isMounted) {
    return <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>ゲームを読み込み中...</div>;
  }

  return (
    <div style={{ padding: '15px', fontFamily: 'sans-serif', maxWidth: '440px', margin: '0 auto', textAlign: 'center' }}>
      <h3>黒猫ロン君とのPK戦（5回戦・3点先取制）</h3>

      {/* スコア表 */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#ffffff', border: '1px solid #dddddd' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th style={{ padding: '6px', border: '1px solid #dddddd' }}>選手 / 回戦</th>
            {[1, 2, 3, 4, 5].map(r => (
              <th key={r} style={{ padding: '6px', border: '1px solid #dddddd', width: '50px', color: currentRound === r - 1 ? '#0d47a1' : '#333333' }}>
                {r}{currentRound === r - 1 ? '★' : ''}
              </th>
            ))}
            <th style={{ padding: '6px', border: '1px solid #dddddd', backgroundColor: '#e8f5e9' }}>計</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '6px', border: '1px solid #dddddd', fontWeight: 'bold' }}>あなた (攻)</td>
            {playerHistory.map((h, i) => (
              <td key={i} style={{ padding: '6px', border: '1px solid #dddddd', fontWeight: 'bold', color: h === '〇' ? '#d32f2f' : '#388e3c' }}>{h || '-'}</td>
            ))}
            <td style={{ padding: '6px', border: '1px solid #dddddd', fontWeight: 'bold', backgroundColor: '#e8f5e9' }}>{playerScore}</td>
          </tr>
          <tr>
            <td style={{ padding: '6px', border: '1px solid #dddddd', fontWeight: 'bold' }}>ロン君 (守)</td>
            {ronHistory.map((h, i) => (
              <td key={i} style={{ padding: '6px', border: '1px solid #dddddd', fontWeight: 'bold', color: h === '×' ? '#d32f2f' : '#388e3c' }}>
                {h === '〇' ? '×' : h === '×' ? '〇' : '-'}
              </td>
            ))}
            <td style={{ padding: '6px', border: '1px solid #dddddd', fontWeight: 'bold', backgroundColor: '#e8f5e9' }}>{ronScore}</td>
          </tr>
        </tbody>
      </table>

      {/* アナウンス情報 */}
      <div style={{
        padding: '10px', 
        borderRadius: '6px', 
        marginBottom: '15px', 
        fontWeight: 'bold',
        fontSize: '13px',
        background: gameState === 'attack' ? '#e3f2fd' : gameState === 'game_over' ? '#e8f5e9' : '#fff3e0',
        color: gameState === 'attack' ? '#0d47a1' : gameState === 'game_over' ? '#2e7d32' : '#e65100',
        border: '1px solid #cccccc'
      }}>
        {gameState === 'attack' && '⚔️ あなたの攻撃ターン'}
        {gameState === 'defend_ready' && '🛡️ ロン君の攻撃（あなたの守備ターン）'}
        {gameState === 'game_over' && '🏆 試合終了 【勝者: ' + winner + '】'}
        <div style={{ fontWeight: 'normal', fontSize: '12px', color: '#444444', marginTop: '4px' }}>
          {currentActionMessage}
        </div>
      </div>

      {/* ピッチメインエリア */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '15px' }}>
        <div 
          ref={pitchRef}
          onClick={gameState === 'attack' ? handleAttack : undefined}
          style={{
            width: '400px',
            height: '288px', 
            background: gameState === 'attack' ? '#2e7d32' : '#114016', 
            position: 'relative',
            borderRadius: '6px',
            overflow: 'hidden',
            cursor: gameState === 'attack' ? 'pointer' : 'default'
          }}
        >
          {/* ゴール枠 */}
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '20px',
            width: '360px',
            height: '180px',
            borderTop: gameState === 'attack' ? '5px solid #ffffff' : '5px solid #78909c',
            borderLeft: gameState === 'attack' ? '5px solid #ffffff' : '5px solid #78909c',
            borderRight: gameState === 'attack' ? '5px solid #ffffff' : '5px solid #78909c',
            boxSizing: 'border-box',
            background: gameState === 'attack' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.3)', 
            borderRadius: '4px 4px 0 0'
          }}>
            <div style={{ position: 'absolute', bottom: '0px', left: '0px', right: '0px', height: '2px', backgroundColor: 'rgba(255,255,255,0.2)' }}></div>
          </div>

          {/* 白線グラウンドライン */}
          <div style={{
            position: 'absolute',
            top: '190px',
            width: '100%',
            height: '2px',
            backgroundColor: 'rgba(255,255,255,0.3)'
          }}></div>

          {/* キーパーキャラ */}
          <div style={{
            position: 'absolute',
            left: keeperLeft,
            top: keeperTop,
            transform: 'translate(-50%, -50%)',
            fontSize: '40px',
            zIndex: 10,
            userSelect: 'none',
            transition: 'left 0.2s ease-out, top 0.2s ease-out'
          }}>
            {gameState === 'attack' ? '🐈‍⬛' : '🧍'}
          </div>

          {/* サッカーボール */}
          <div style={{
            position: 'absolute',
            left: ballLeft,
            top: ballTop,
            transform: 'translate(-50%, -50%)',
            fontSize: '26px',
            zIndex: 20,
            userSelect: 'none',
            transition: 'left 0.2s ease-out, top 0.2s ease-out'
          }}>
            ⚽
          </div>

          {/* キッカー位置インジケータ */}
          {gameState === 'attack' && (
            <div style={{ position: 'absolute', bottom: '5px', left: '50%', transform: 'translateX(-50%)', fontSize: '24px' }}>
              🏃‍♂️
            </div>
          )}
          {gameState === 'defend_ready' && (
            <div style={{ position: 'absolute', bottom: '5px', left: '50%', transform: 'translateX(-50%) scaleX(-1)', fontSize: '24px' }}>
              🐈‍⬛
            </div>
          )}
        </div>

        {/* 守備時のアクションボタン */}
        {gameState === 'defend_ready' && (
          <div style={{ width: '400px', marginTop: '-5px' }}>
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
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              🏃‍♂️ 動いてシュートを止める！
            </button>
          </div>
        )}
      </div>

      {/* 操作パネル */}
      <button 
        onClick={resetGame}
        style={{ padding: '8px 16px', background: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', color: '#444444', width: '100%' }}
      >
        ゲームをリセット
      </button>

      {/* 試合ログ */}
      <div style={{ marginTop: '15px' }}>
        <div style={{ maxHeight: '90px', overflowY: 'auto', background: '#fafafa', padding: '6px', borderRadius: '4px', border: '1px solid #eeeeee', fontSize: '11px', color: '#666666', textAlign: 'left' }}>
          {logs.length === 0 && <p style={{ margin: 0, color: '#999999', textAlign: 'center' }}>キックオフ！ゴール枠内を狙ってね。</p>}
          {logs.map((log, index) => (
            <div key={index} style={{ padding: '2px 0', borderBottom: '1px solid #eeeeee' }}>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}