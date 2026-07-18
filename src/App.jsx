import React, { useState } from 'react';

export default function RonPkGame() {
  // ゲームの状態: 'attack' (プレイヤーの攻撃), 'defend_ready' (ロン君の攻撃を待つ状態)
  const [gameState, setGameState] = useState('attack'); 
  const [logs, setLogs] = useState([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [ronScore, setRonScore] = useState(0);
  const [currentActionMessage, setCurrentActionMessage] = useState('ゴール内をクリックしてシュート！');

  // ゴールのサイズ定義
  const goalWidth = 400;
  const goalHeight = 200;

  // 動的な位置情報（%で管理してCSSで動かす）
  // 初期位置は中央付近
  const [ballPos, setBallPos] = useState({ x: 50, y: 90, opacity: 1 }); // ボールの位置
  const [keeperPos, setKeeperPos] = useState({ x: 50, y: 50 });       // キーパー（守備側）の位置

  // キーパーの画像
  const ronImage = "url('/api/placeholder/120/120?text=🐈')";
  const humanPlayerImage = "url('/api/placeholder/120/120?text=👤')";

  // 1. あなたの攻撃（ゴールをクリックしたとき）
  const handleAttack = (e) => {
    if (gameState !== 'attack') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // % 単位に変換
    const ballXPercent = (clickX / goalWidth) * 100;
    const ballYPercent = (clickY / goalHeight) * 100;

    // ロン君（守備）の動く位置をランダムで決定 (%)
    const ronXPercent = 20 + Math.random() * 60; // 20%〜80%の間
    const ronYPercent = 20 + Math.random() * 60;

    // ボールとキーパーの位置を更新（アニメーションで動く）
    setBallPos({ x: ballXPercent, y: ballYPercent, opacity: 1 });
    setKeeperPos({ x: ronXPercent, y: ronYPercent });

    // 判定用の距離計算（ピクセル換算）
    const xDiff = clickX - (ronXPercent * goalWidth) / 100;
    const yDiff = clickY - (ronYPercent * goalHeight) / 100;
    const distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    const isGoal = distance > 65; // 65px以上離れていればゴール

    let resultMessage = '';
    if (isGoal) {
      setPlayerScore(prev => prev + 1);
      resultMessage = '⚽〇 ゴーーール!!';
    } else {
      resultMessage = '🐈× ロン君に止められた！';
    }

    // 座標計算（ログ表示用の原点中央計算）
    const logX = clickX - goalWidth / 2;
    const logY = (clickY - goalHeight / 2) * -1;

    const newLog = `【あなたの攻撃】 シュート: (${logX.toFixed(0)}, ${logY.toFixed(0)}) → ${resultMessage}`;
    setLogs(prev => [newLog, ...prev]);
    setCurrentActionMessage(`${resultMessage} 次は守備の番です！`);
    
    // 次のターン（守備準備）へ
    setGameState('defend_ready');
  };

  // 2. あなたの守備（「ロン君のシュートを止める！」ボタンを押したとき）
  const handleDefend = () => {
    if (gameState !== 'defend_ready') return;

    // ロン君（シュート）のランダムな位置 (%)
    const ronXPercent = 10 + Math.random() * 80;
    const ronYPercent = 10 + Math.random() * 80;

    // あなた（キーパー）のランダムな動き (%)
    const playerXPercent = 20 + Math.random() * 60;
    const playerYPercent = 20 + Math.random() * 60;

    // ボールとキーパーの位置を更新（アニメーションで動く）
    setBallPos({ x: ronXPercent, y: ronYPercent, opacity: 1 });
    setKeeperPos({ x: playerXPercent, y: playerYPercent });

    // 判定
    const xDiff = (ronXPercent - playerXPercent) * goalWidth / 100;
    const yDiff = (ronYPercent - playerYPercent) * goalHeight / 100;
    const distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    const isSaved = distance <= 65;

    let resultMessage = '';
    if (isSaved) {
      resultMessage = '🛡️〇 ナイスセーブ！止めた！';
    } else {
      setRonScore(prev => prev + 1);
      resultMessage = '⚽× ロン君に決められた…';
    }

    const newLog = `【ロン君の攻撃】 ロン君のシュートを ${isSaved ? 'ブロック！' : '決められた'}`;
    setLogs(prev => [newLog, ...prev]);
    setCurrentActionMessage(`${resultMessage} 次はあなたの攻撃ターンです！`);

    // 次のターン（攻撃）へ
    setGameState('attack');
  };

  // ゲームリセット（ボールとキーパーも中央に戻す）
  const resetGame = () => {
    setPlayerScore(0);
    setRonScore(0);
    setLogs([]);
    setGameState('attack');
    setBallPos({ x: 50, y: 90, opacity: 0.5 }); // 初期位置は下中央
    setKeeperPos({ x: 50, y: 50 });             // キーパーは中央
    setCurrentActionMessage('ゴール内をクリックしてシュート！');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '450px', margin: '0 auto', textAlign: 'center' }}>
      <h2>黒猫ロン君とのPK戦（モーション版）</h2>

      {/* スコアボード */}
      <div style={{ display: 'flex', justifyContent: 'space-around', background: '#f5f5f5', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>
        <div>
          <div style={{ fontSize: '12px', color: '#666' }}>あなた (シュート)</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{playerScore}</div>
        </div>
        <div style={{ fontSize: '20px', alignSelf: 'center', color: '#999' }}>VS</div>
        <div>
          <div style={{ fontSize: '12px', color: '#666' }}>ロン君 (守備)</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{ronScore}</div>
        </div>
      </div>

      {/* 状態ガイダンス */}
      <div style={{
        padding: '12px', 
        borderRadius: '6px', 
        marginBottom: '15px', 
        fontWeight: 'bold',
        fontSize: '14px',
        background: gameState === 'attack' ? '#e3f2fd' : '#fff3e0',
        color: gameState === 'attack' ? '#0d47a1' : '#e65100',
      }}>
        {gameState === 'attack' ? '⚔️ あなたの攻撃ターン' : '🛡️ ロン君の攻撃（あなたの守備）'}
        <div style={{ fontWeight: 'normal', fontSize: '13px', color: '#333', marginTop: '4px' }}>
          {currentActionMessage}
        </div>
      </div>

      {/* メインのゲーム画面（常にゴールとグラウンドを表示） */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
        <div 
          onClick={handleAttack}
          style={{
            width: `${goalWidth}px`,
            height: `${goalHeight * 1.5}px`, // グラウンドエリアを追加
            border: '4px solid white',
            borderBottom: 'none',
            background: '#388e3c',
            position: 'relative',
            cursor: gameState === 'attack' ? 'crosshair' : 'not-allowed',
            borderRadius: '4px 4px 0 0',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }}
        >
          {/* ゴールエリアの白線 */}
          <div style={{ position: 'absolute', top: '0', left: '0', width: `${goalWidth}px`, height: `${goalHeight}px`, border: '4px solid white', boxSizing: 'border-box' }}></div>

          {/* キーパー（ロン君 または 人間の選手） */}
          <div style={{
            position: 'absolute',
            left: `${keeperPos.x}%`,
            top: `${keeperPos.y}%`,
            transform: 'translate(-50%, -50%)',
            transition: 'all 0.4s ease-out', // 0.4秒かけてスムーズに動く
            width: '60px',
            height: '60px',
            backgroundImage: gameState === 'attack' ? ronImage : humanPlayerImage,
            backgroundSize: 'cover',
            zIndex: 2,
            userSelect: 'none'
          }}>
          </div>

          {/* サッカーボール */}
          <div style={{
            position: 'absolute',
            left: `${ballPos.x}%`,
            top: `${ballPos.y}%`,
            transform: 'translate(-50%, -50%)',
            transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)', // シュートの軌道
            fontSize: '24px',
            opacity: ballPos.opacity,
            zIndex: 3,
            userSelect: 'none'
          }}>
            ⚽
          </div>

          {/* キッカー（攻撃ターンのときだけ表示） */}
          {gameState === 'attack' && (
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '32px',
              zIndex: 1,
              userSelect: 'none'
            }}>
              👤
            </div>
          )}

          {/* 攻撃時のクリック誘導テキスト */}
          {gameState === 'attack' && (
            <div style={{ position: 'absolute', bottom: '10px', width: '100%', color: 'rgba(255,255,255,0.6)', fontSize: '11px', textAlign: 'center' }}>
              ゴール内をクリックしてシュート！
            </div>
          )}
        </div>

        {/* 守備ターンのときだけ下に大きな「スタート（セーブ）」ボタンを設置 */}
        {gameState === 'defend_ready' && (
          <div style={{ width: `${goalWidth}px`, background: '#f5f5f5', padding: '10px 0', borderRadius: '0 0 8px 8px', border: '1px solid #ddd', borderTop: 'none' }}>
            <button 
              onClick={handleDefend}
              style={{
                padding: '10px 20px',
                fontSize: '15px',
                fontWeight: 'bold',
                backgroundColor: '#ff9800',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                boxShadow: '0 3px 6px rgba(0,0,0,0.16)'
              }}
            >
              動いてシュートを止める！
            </button>
          </div>
        )}
      </div>

      {/* コントロール */}
      <button 
        onClick={resetGame}
        style={{ padding: '6px 12px', background: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
      >
        ゲームをリセット
      </button>

      {/* 試合ログ */}
      <div style={{ textAlign: 'left', marginTop: '20px' }}>
        <span style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '2px solid #388e3c', paddingBottom: '2px' }}>試合経過</span>
        <div style={{ maxHeight: '120px', overflowY: 'auto', background: '#fafafa', padding: '8px', borderRadius: '4px', marginTop: '8px', border: '1px solid #eee' }}>
          {logs.length === 0 && <p style={{ color: '#999', fontSize: '12px', margin: 0 }}>キックオフ！</p>}
          {logs.map((log, index) => (
            <div key={index} style={{ padding: '3px 0', borderBottom: '1px solid #eee', fontSize: '12px', color: '#444' }}>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}