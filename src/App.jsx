'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function Page() {
  const [isMounted, setIsMounted] = useState(false);
  const pitchRef = useRef(null);

  // ゲーム状態管理
  // 'setup': 開始前
  // 'attack': あなたの攻撃（クリック待ち）
  // 'attack_result': あなたのシュート結果（「守備へ進む」ボタン待ち）
  // 'defend': ロン君の攻撃／あなたの守備（ボタン選択待ち）
  // 'game_over': 試合終了
  const [gameState, setGameState] = useState('setup'); 
  
  const [playerScore, setPlayerScore] = useState(0);
  const [ronScore, setRonScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [message, setMessage] = useState('準備ができたら下の「キックオフ！」ボタンを押してね！');
  const [logs, setLogs] = useState([]);

  // マトリックス表用の履歴（〇, ×, null）
  const [playerHistory, setPlayerHistory] = useState([null, null, null, null, null]);
  const [ronHistory, setRonHistory] = useState([null, null, null, null, null]);

  // 位置・演出用の位置データ
  const [ballLeft, setBallLeft] = useState('50%');
  const [ballTop, setBallTop] = useState('85%');
  const [keeperLeft, setKeeperLeft] = useState('50%');
  const [keeperTop, setKeeperTop] = useState('30%');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ゲームスタート
  const handleStart = () => {
    setGameState('attack');
    setMessage('⚽ あなたの攻撃ターン：ゴール枠内の好きなところをクリックしてシュート！');
    setBallLeft('50%');
    setBallTop('85%');
    setKeeperLeft('50%');
  };

  // あなたの攻撃（クリックシュート）
  const handlePitchClick = (e) => {
    if (gameState !== 'attack') return;
    if (!pitchRef.current) return;

    // 安全な座標の即時ロック
    const clientX = e.clientX;
    const clientY = e.clientY;
    const rect = pitchRef.current.getBoundingClientRect();
    if (!rect) return;

    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    // 枠外クリックは無視
    if (clickY > 180 || clickX < 0 || clickX > 400) return;

    const bLeft = (clickX / 400) * 100;
    const bTop = (clickY / 288) * 100;

    // ロン君キーパーの移動方向をランダム決定
    const ronRandX = 20 + Math.random() * 60;
    
    setBallLeft(`${bLeft}%`);
    setBallTop(`${bTop}%`);
    setKeeperLeft(`${ronRandX}%`);

    const distance = Math.abs(bLeft - ronRandX);
    const isGoal = distance > 15;

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
    setLogs(prev => [`【${rNum}回戦・あなたの攻撃】 ➔ ${resultText}`, ...prev]);
    setMessage(`${resultText} ➔ あなたの攻撃終了。次は守備の番です。「守備フェーズへ進む」を押してください。`);
    setGameState('attack_result');
  };

  // 守備フェーズへの切り替え
  const goToDefendPhase = () => {
    setGameState('defend');
    setMessage('🛡️ あなたの守備ターン：ロン君が蹴ってきます！守る方向（左・中央・右）のボタンを選んで防いで！');
    setBallLeft('50%');
    setBallTop('30%'); 
    setKeeperLeft('50%');
  };

  // あなたの守備（コースボタン選択）
  const handleDefendAction = (direction) => {
    if (gameState !== 'defend') return;

    const directions = ['左', '中央', '右'];
    const ronChoice = directions[Math.floor(Math.random() * 3)];

    const posMap = { '左': '25%', '中央': '50%', '右': '75%' };
    setKeeperLeft(posMap[direction]);
    setBallLeft(posMap[ronChoice]);
    setBallTop('75%'); 

    const isSaved = direction === ronChoice;
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
    setLogs(prev => [`【${rNum}回戦・ロン君の攻撃】 ロン君の狙い:${ronChoice} ➔ あなたの守備:${direction} 【${isSaved ? 'セーブ成功' : '失点'}】`, ...prev]);

    const nextRound = currentRound + 1;
    setCurrentRound(nextRound);

    // 勝敗チェック（3点先取または5回戦消化）
    if (playerScore >= 3 && newRonScore < 3) {
      setGameState('game_over');
      setMessage(`🏆 試合終了！あなたの勝ちです！ 🎉（結果：${playerScore} 対 ${newRonScore}）`);
    } else if (newRonScore >= 3 && playerScore < 3) {
      setGameState('game_over');
      setMessage(`🐈 試合終了！ロン君の勝ちです…（結果：${playerScore} 対 ${newRonScore}）`);
    } else if (nextRound >= 5) {
      setGameState('game_over');
      const finalWinner = playerScore > newRonScore ? 'あなたの勝ち！🎉' : playerScore < newRonScore ? 'ロン君の勝ち 🐈' : '引き分け 🤝';
      setMessage(`🏆 5回戦すべて終了しました！ 結果：${finalWinner}（${playerScore} 対 ${newRonScore}）`);
    } else {
      setGameState('attack');
      setMessage(`${resultText} ➔ 次は第 ${nextRound + 1}回戦です！ゴール枠内をクリックしてシュート！`);
      setTimeout(() => {
        setBallLeft('50%');
        setBallTop('85%');
        setKeeperLeft('50%');
      }, 1200);
    }
  };

  // リセット
  const resetGame = () => {
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
  };

  if (!isMounted) {
    return <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>読み込み中...</div>;
  }

  return (
    <div style={{ padding: '15px', fontFamily: 'sans-serif', maxWidth: '440px', margin: '0 auto', textAlign: 'center', color: '#333333' }}>
      <h2 style={{ fontSize: '18px', marginBottom: '15px', fontWeight: 'bold' }}>黒猫ロン君とのPK戦（5回戦・3点先取）</h2>

      {/* 📊 新設：5回戦マトリックス表（星取表） */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '12px', background: '#ffffff', border: '1px solid #dddddd', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e2e8f0' }}>
            <th style={{ padding: '8px', border: '1px solid #dddddd', fontWeight: 'bold', color: '#4a5568' }}>チーム / 回戦</th>
            {[1, 2, 3, 4, 5].map((r) => (
              <th key={r} style={{ padding: '8px', border: '1px solid #dddddd', width: '50px', backgroundColor: currentRound === r - 1 && gameState !== 'game_over' ? '#edf2f7' : 'transparent', color: currentRound === r - 1 && gameState !== 'game_over' ? '#1a365d' : '#718096', fontWeight: currentRound === r - 1 ? 'bold' : 'normal' }}>
                {r}回{currentRound === r - 1 && gameState !== 'game_over' ? '★' : ''}
              </th>
            ))}
            <th style={{ padding: '8px', border: '1px solid #dddddd', backgroundColor: '#edf7ed', fontWeight: 'bold', color: '#1e4620' }}>得点</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '8px', border: '1px solid #dddddd', fontWeight: 'bold', textAlign: 'left', backgroundColor: gameState === 'attack' || gameState === 'attack_result' ? '#e3f2fd' : 'transparent' }}>
              あなた <span style={{ fontSize: '10px', color: '#2b6cb0', display: 'block' }}>{gameState === 'attack' ? '⚔️ 攻撃中' : '(シュート)'}</span>
            </td>
            {playerHistory.map((h, i) => (
              <td key={i} style={{ padding: '8px', border: '1px solid #dddddd', fontSize: '14px', fontWeight: 'bold', color: h === '〇' ? '#e53e3e' : '#4a5568' }}>
                {h || '-'}
              </td>
            ))}
            <td style={{ padding: '8px', border: '1px solid #dddddd', fontWeight: 'bold', fontSize: '16px', backgroundColor: '#edf7ed', color: '#e53e3e' }}>{playerScore}</td>
          </tr>
          <tr>
            <td style={{ padding: '8px', border: '1px solid #dddddd', fontWeight: 'bold', textAlign: 'left', backgroundColor: gameState === 'defend' ? '#fff3e0' : 'transparent' }}>
              ロン君 <span style={{ fontSize: '10px', color: '#dd6b20', display: 'block' }}>{gameState === 'defend' ? '⚔️ 攻撃中' : '(シュート)'}</span>
            </td>
            {ronHistory.map((h, i) => (
              <td key={i} style={{ padding: '8px', border: '1px solid #dddddd', fontSize: '14px', fontWeight: 'bold', color: h === '〇' ? '#388e3c' : '#e53e3e' }}>
                {h === '〇' ? '×' : h === '×' ? '〇' : '-'}
              </td>
            ))}
            <td style={{ padding: '8px', border: '1px solid #dddddd', fontWeight: 'bold', fontSize: '16px', backgroundColor: '#edf7ed', color: '#388e3c' }}>{ronScore}</td>
          </tr>
        </tbody>
      </table>

      {/* 📢 状況に合わせた状況アナウンス */}
      <div style={{ 
        padding: '12px', 
        borderRadius: '6px', 
        fontSize: '13px', 
        fontWeight: 'bold', 
        marginBottom: '15px', 
        border: '1px solid',
        textAlign: 'left',
        background: gameState === 'attack' || gameState === 'attack_result' ? '#e3f2fd' : gameState === 'defend' ? '#fff3e0' : gameState === 'game_over' ? '#e8f5e9' : '#f7fafc',
        color: gameState === 'attack' || gameState === 'attack_result' ? '#0d47a1' : gameState === 'defend' ? '#b78103' : gameState === 'game_over' ? '#1b5e20' : '#4a5568',
        borderColor: gameState === 'attack' || gameState === 'attack_result' ? '#bbdefb' : gameState === 'defend' ? '#ffe0b2' : gameState === 'game_over' ? '#c8e6c9' : '#cbd5e0'
      }}>
        {message}
      </div>

      {/* 🚀 アクションシステムボタン */}
      <div style={{ marginBottom: '15px' }}>
        {gameState === 'setup' && (
          <button onClick={handleStart} style={{ width: '100%', padding: '12px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#1976d2', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            ⚽ キックオフ！試合を始める
          </button>
        )}
        {gameState === 'attack_result' && (
          <button onClick={goToDefendPhase} style={{ width: '100%', padding: '12px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#388e3c', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            🛡️ 守備フェーズへ進む (ロン君のキックへ)
          </button>
        )}
        {gameState === 'game_over' && (
          <button onClick={resetGame} style={{ width: '100%', padding: '12px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#e53e3e', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            🔄 もう一度最初から遊ぶ
          </button>
        )}
      </div>

      {/* サッカーピッチ */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '15px' }}>
        <div 
          ref={pitchRef}
          onClick={handlePitchClick}
          style={{
            width: '400px',
            height: '288px', 
            background: gameState === 'defend' ? '#1b4d22' : '#4caf50', 
            position: 'relative',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '2px solid #388e3c',
            cursor: gameState === 'attack' ? 'crosshair' : 'default',
            transition: 'background-color 0.3s'
          }}
        >
          {/* ゴールポスト */}
          <div style={{
            position: 'absolute',
            top: '15px',
            left: '40px',
            width: '320px',
            height: '140px',
            borderTop: '4px solid #ffffff',
            borderLeft: '4px solid #ffffff',
            borderRight: '4px solid #ffffff',
            boxSizing: 'border-box',
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '4px 4px 0 0'
          }} />

          {/* キーパー (ロン君 🐈‍⬛ / あなた 🧍) */}
          <div style={{
            position: 'absolute',
            left: keeperLeft,
            top: keeperTop,
            transform: 'translate(-50%, -50%)',
            fontSize: '42px',
            zIndex: 10,
            userSelect: 'none',
            transition: 'left 0.25s ease-out, top 0.25s ease-out'
          }}>
            {gameState === 'defend' ? '🧍' : '🐈‍⬛'}
          </div>

          {/* サッカーボール ⚽ */}
          <div style={{
            position: 'absolute',
            left: ballLeft,
            top: ballTop,
            transform: 'translate(-50%, -50%)',
            fontSize: '28px',
            zIndex: 20,
            userSelect: 'none',
            transition: 'left 0.25s ease-out, top 0.25s ease-out'
          }}>
            ⚽
          </div>

          {/* 下部のキッカー印 */}
          <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', fontSize: '26px', opacity: 0.8 }}>
            {gameState === 'defend' ? '🐈‍⬛' : '🏃‍♂️'}
          </div>
        </div>

        {/* 🛡️ 守備時の外出しセレクトコントローラー */}
        {gameState === 'defend' && (
          <div style={{ width: '400px', background: '#ffffff', padding: '12px', boxSizing: 'border-box', border: '1px solid #cccccc', borderTop: 'none', borderRadius: '0 0 8px 8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: '#dd6b20' }}>ロン君のシュートを止める方向を選んでください！</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['左', '中央', '右'].map((dir) => (
                <button 
                  key={dir} 
                  onClick={() => handleDefendAction(dir)}
                  style={{
                    flex: 1,
                    padding: '12px 0',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    backgroundColor: '#ff9800',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                  }}
                >
                  {dir}を守る！
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 途中のリセットコントロール */}
      {gameState !== 'setup' && gameState !== 'game_over' && (
        <button onClick={resetGame} style={{ padding: '6px 12px', background: '#f7fafc', border: '1px solid #cbd5e0', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', color: '#718096' }}>
          試合を途中でリセットしてやり直す
        </button>
      )}

      {/* 試合ログログ */}
      <div style={{ marginTop: '15px' }}>
        <div style={{ maxHeight: '95px', overflowY: 'auto', background: '#fafafa', padding: '8px', borderRadius: '4px', border: '1px solid #eeeeee', fontSize: '11px', color: '#666666', textAlign: 'left' }}>
          {logs.length === 0 && <p style={{ margin: 0, color: '#aa5555', textAlign: 'center' }}>ここにキックごとの詳細履歴が表示されます。</p>}
          {logs.map((log, index) => (
            <div key={index} style={{ padding: '3px 0', borderBottom: '1px solid #f0f0f0' }}>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}