import React, { useState } from 'react';

export default function RonPkGame() {
  // ゲームの基本状態
  // 'attack' (プレイヤーの攻撃), 'defend_ready' (ロン君の攻撃を待つ状態), 'defend_result' (守備結果表示)
  const [gameState, setGameState] = useState('attack'); 
  const [logs, setLogs] = useState([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [ronScore, setRonScore] = useState(0);

  // 一時的な状態表示用
  const [currentActionMessage, setCurrentActionMessage] = useState('ゴール内の狙いたい場所をクリックしてシュートを打とう！');

  // ゴールのサイズ定義（判定用）
  const goalWidth = 400;
  const goalHeight = 200;

  // 1. あなたの攻撃（ゴールをクリックしたとき）
  const handleAttack = (e) => {
    if (gameState !== 'attack') return;

    // クリックした座標を取得（ゴールの中心を原点 (0,0) とする計算）
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - goalWidth / 2;
    const y = (e.clientY - rect.top - goalHeight / 2) * -1; // 上方向をプラスに

    // ロン君（守備）の動く位置をランダムで決定
    const ronX = (Math.random() - 0.5) * goalWidth;
    const ronY = (Math.random() - 0.5) * goalHeight;

    // 距離が近い場合はセーブされたと判定（閾値: 60px）
    const distance = Math.sqrt(Math.pow(x - ronX, 2) + Math.pow(y - ronY, 2));
    const isGoal = distance > 60;

    let resultMessage = '';
    if (isGoal) {
      setPlayerScore(prev => prev + 1);
      resultMessage = '〇ゴール！';
    } else {
      resultMessage = '× ロン君に止められた…';
    }

    const newLog = `【あなたの攻撃】 シュート: (${x.toFixed(1)}, ${y.toFixed(1)}) / ロン君の守備: (${ronX.toFixed(1)}, ${ronY.toFixed(1)}) → ${resultMessage}`;
    setLogs(prev => [newLog, ...prev]);
    setCurrentActionMessage(`${resultMessage} 次はロン君の攻撃です。守備の準備をしてください。`);
    
    // 次のターン（守備準備）へ
    setGameState('defend_ready');
  };

  // 2. あなたの守備（「ロン君のシュートを止める！」ボタンを押したとき）
  const handleDefend = () => {
    if (gameState !== 'defend_ready') return;

    // あなた（守備）のランダムな位置
    const playerX = (Math.random() - 0.5) * goalWidth;
    const playerY = (Math.random() - 0.5) * goalHeight;

    // ロン君（攻撃）のランダムなシュート位置
    const ronX = (Math.random() - 0.5) * goalWidth;
    const ronY = (Math.random() - 0.5) * goalHeight;

    // 距離が近い場合はセーブ（閾値: 60px）
    const distance = Math.sqrt(Math.pow(ronX - playerX, 2) + Math.pow(ronY - playerY, 2));
    const isSaved = distance <= 60;

    let resultMessage = '';
    if (isSaved) {
      resultMessage = '〇止めた！';
    } else {
      setRonScore(prev => prev + 1);
      resultMessage = '× ゴール…ロン君に決められた！';
    }

    const newLog = `【ロン君の攻撃】 ロン君のシュート: (${ronX.toFixed(1)}, ${ronY.toFixed(1)}) / あなたの守備: (${playerX.toFixed(1)}, ${playerY.toFixed(1)}) → ${resultMessage}`;
    setLogs(prev => [newLog, ...prev]);
    setCurrentActionMessage(`${resultMessage} 次はあなたの攻撃ターンです！`);

    // 次のターン（攻撃）へ
    setGameState('attack');
  };

  // ゲームリセット
  const resetGame = () => {
    setPlayerScore(0);
    setRonScore(0);
    setLogs([]);
    setGameState('attack');
    setCurrentActionMessage('ゴール内の狙いたい場所をクリックしてシュートを打とう！');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <h2>黒猫ロン君とのPK戦（交互に交代版）</h2>

      {/* スコアボード */}
      <div style={{ display: 'flex', justifyContent: 'space-around', background: '#f0f0f0', padding: '10px', borderRadius: '8px', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>あなた（攻撃）</div>
          <div style={{ fontSize: '24px' }}>{playerScore}</div>
        </div>
        <div style={{ fontSize: '24px', alignSelf: 'center' }}>VS</div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>ロン君（守備）</div>
          <div style={{ fontSize: '24px' }}>{ronScore}</div>
        </div>
      </div>

      {/* 現在のターン案内板 */}
      <div style={{
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px', 
        fontWeight: 'bold',
        background: gameState === 'attack' ? '#e3f2fd' : '#fff3e0',
        color: gameState === 'attack' ? '#0d47a1' : '#e65100',
        border: `20px`
      }}>
        {gameState === 'attack' ? '⚔️ あなたの攻撃ターン' : '🛡️ ロン君の攻撃（あなたの守備ターン）'}
        <p style={{ fontSize: '14px', margin: '5px 0 0 0', color: '#333', fontWeight: 'normal' }}>
          {currentActionMessage}
        </p>
      </div>

      {/* メインアクションエリア */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        {gameState === 'attack' ? (
          /* 攻撃時：クリックできるゴール */
          <div 
            onClick={handleAttack}
            style={{
              width: `${goalWidth}px`,
              height: `${goalHeight}px`,
              border: '5px solid white',
              background: '#2e7d32',
              position: 'relative',
              cursor: 'crosshair',
              borderRadius: '4px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ position: 'absolute', top: '40%', left: '45%', fontSize: '32px' }}>🐈 (ロン君)</div>
            <div style={{ position: 'absolute', bottom: '10px', left: '48%', color: 'white', fontSize: '12px' }}>ここを狙え！</div>
          </div>
        ) : (
          /* 守備時：ボタンを押してロン君にシュートさせる */
          <div 
            style={{
              width: `${goalWidth}px`,
              height: `${goalHeight}px`,
              background: '#37474f',
              borderRadius: '4px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'white'
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>🐈💨 ⚽</div>
            <button 
              onClick={handleDefend}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 'bold',
                backgroundColor: '#ff9800',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
              }}
            >
              ロン君のシュートを止める！
            </button>
          </div>
        )}
      </div>

      {/* コントロール */}
      <button 
        onClick={resetGame}
        style={{ padding: '8px 16px', background: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        ゲームをリセット
      </button>

      {/* 試合ログ */}
      <h3 style={{ textAlign: 'left', marginTop: '30px', borderBottom: '2px solid #ccc', paddingBottom: '5px' }}>試合ログ</h3>
      <div style={{ textAlign: 'left', maxHeight: '200px', overflowY: 'auto', background: '#fafafa', padding: '10px', borderRadius: '4px' }}>
        {logs.length === 0 && <p style={{ color: '#999' }}>ここに試合の経過が表示されます</p>}
        {logs.map((log, index) => (
          <div key={index} style={{ padding: '4px 0', borderBottom: '1px solid #eee', fontSize: '14px' }}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}