'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function Page() {
  const [isMounted, setIsMounted] = useState(false);
  const pitchRef = useRef(null);

  // ゲーム状態管理
  // 'setup': 準備OKを待つ状態
  // 'attack': あなたの攻撃（クリック待ち）
  // 'attack_result': あなたのシュート結果表示（「次へ」ボタン待ち）
  // 'defend': ロン君の攻撃（守備ボタン待ち）
  // 'game_over': 試合終了
  const [gameState, setGameState] = useState('setup'); 
  
  const [playerScore, setPlayerScore] = useState(0);
  const [ronScore, setRonScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [message, setMessage] = useState('準備ができたらボタンを押してね！');
  const [logs, setLogs] = useState([]);

  // 各種位置・演出用のState（初期値）
  const [ballLeft, setBallLeft] = useState('50%');
  const [ballTop, setBallTop] = useState('85%');
  const [keeperLeft, setKeeperLeft] = useState('50%');
  const [keeperTop, setKeeperTop] = useState('30%');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ゲームスタート（準備OK）
  const handleStart = () => {
    setGameState('attack');
    setMessage('ゴール枠内のお好きなところをクリックしてシュート！');
    // 位置を中央にリセット
    setBallLeft('50%');
    setBallTop('85%');
    setKeeperLeft('50%');
  };

  // あなたの攻撃（クリックで蹴る）
  const handlePitchClick = (e) => {
    if (gameState !== 'attack') return;
    if (!pitchRef.current) return;

    // クラッシュ防止：クリックされた瞬間の座標をローカル変数にガッチリ固定
    const clientX = e.clientX;
    const clientY = e.clientY;

    const rect = pitchRef.current.getBoundingClientRect();
    if (!rect) return;

    // ピッチ内での相対座標を計算
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    // 【ゴールエリアの判定制限】枠外（下すぎる位置）のクリックは無視してクラッシュを防ぐ
    if (clickY > 180 || clickX < 0 || clickX > 400) return;

    // 割合（%）に変換
    const bLeft = (clickX / 400) * 100;
    const bTop = (clickY / 288) * 100;

    // ロン君（キーパー）が反応して動く方向をランダムに決定
    const ronRandX = 20 + Math.random() * 60; // 20% 〜 80% の範囲
    
    // アニメーション座標を反映
    setBallLeft(`${bLeft}%`);
    setBallTop(`${bTop}%`);
    setKeeperLeft(`${ronRandX}%`);

    // ボールとロン君の水平距離でゴール判定（差が15%以内ならセーブされたとみなす）
    const distance = Math.abs(bLeft - ronRandX);
    const isGoal = distance > 15;

    let resultText = '';
    let newScore = playerScore;

    if (isGoal) {
      newScore += 1;
      setPlayerScore(newScore);
      resultText = '〇 ゴール！';
    } else {
      resultText = '× ロン君に止められた…';
    }

    const rNum = currentRound + 1;
    setLogs(prev => [`【${rNum}回戦・あなたの攻撃】 ➔ ${resultText}`, ...prev]);
    setMessage(`${resultText} 次は守備の番です。「次へ進む」を押してください。`);
    setGameState('attack_result');
  };

  // 守備フェーズへ切り替え
  const goToDefendPhase = () => {
    setGameState('defend');
    setMessage('ロン君が蹴ってきます！守る方向（左・中央・右）を選んでください。');
    // ボールとキーパーを初期位置に
    setBallLeft('50%');
    setBallTop('30%'); // ロン君が上にいる想定
    setKeeperLeft('50%');
  };

  // あなたの守備（コースを選択して止める）
  const handleDefendAction = (direction) => {
    if (gameState !== 'defend') return;

    // ロン君のシュートコースをランダム決定
    const directions = ['左', '中央', '右'];
    const ronChoice = directions[Math.floor(Math.random() * 3)];

    // 選択に応じたビジュアル位置の反映
    const posMap = { '左': '25%', '中央': '50%', '右': '75%' };
    setKeeperLeft(posMap[direction]);
    setBallLeft(posMap[ronChoice]);
    setBallTop('75%'); // 下に向かって飛んでくる

    const isSaved = direction === ronChoice;
    let resultText = '';
    let newRonScore = ronScore;

    if (isSaved) {
      resultText = '〇 ナイスセーブ！シュートを止めました！';
    } else {
      newRonScore += 1;
      setRonScore(newRonScore);
      resultText = '× 決められた…ロン君のゴール！';
    }

    const rNum = currentRound + 1;
    setLogs(prev => [`【${rNum}回戦・ロン君の攻撃】 ロン君:${ronChoice} ➔ あなた:${direction} 【${isSaved ? 'セーブ' : '失点'}】`, ...prev]);

    // ラウンドを進める
    const nextRound = currentRound + 1;
    setCurrentRound(nextRound);

    // 5回戦終了、またはどちらかが3点先取したかチェック
    if (playerScore >= 3 && newRonScore < 3) {
      setGameState('game_over');
      setMessage(`🎉 試合終了！あなたの勝ちです！（${playerScore}対${newRonScore}）`);
    } else if (newRonScore >= 3 && playerScore < 3) {
      setGameState('game_over');
      setMessage(`🐈 試合終了！ロン君の勝ちです…（${playerScore}対${newRonScore}）`);
    } else if (nextRound >= 5) {
      setGameState('game_over');
      const finalResult = playerScore > newRonScore ? 'あなたの勝ち！' : playerScore < newRonScore ? 'ロン君の勝ち' : '引き分け';
      setMessage(`試合終了（5回戦消化）：${finalResult}（${playerScore}対${newRonScore}）`);
    } else {
      setGameState('attack');
      setMessage(`${resultText} ➔ 次は ${nextRound + 1}回戦です！ゴールをクリックしてシュートしてね！`);
      // 次のターンのために位置を戻す
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
    setGameState('setup');
    setMessage('準備ができたらボタンを押してね！');
    setBallLeft('50%');
    setBallTop('85%');
    setKeeperLeft('50%');
  };

  if (!isMounted) {
    return <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>読み込み中...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '440px', margin: '0 auto', textAlign: 'center', color: '#333333' }}>
      <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>黒猫ロン君とのPK戦（クリックで蹴る版）</h2>

      {/* 現在のスコア・状態表示 */}
      <div style={{ background: '#f0f4f8', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontWeight: 'bold' }}>
        <div style={{ fontSize: '16px', color: '#000000', marginBottom: '4px' }}>
          あなたの得点: <span style={{ color: '#d32f2f', fontSize: '20px' }}>{playerScore}</span> 
          &nbsp;&nbsp;|&nbsp;&nbsp; 
          ロン君の得点: <span style={{ color: '#388e3c', fontSize: '20px' }}>{ronScore}</span>
        </div>
        <div style={{ fontSize: '12px', color: '#666666' }}>現在のラウンド: {currentRound + 1} / 5 回戦</div>
      </div>

      {/* メッセージ案内 */}
      <div style={{ padding: '10px', borderRadius: '6px', background: '#fff3e0', color: '#e65100', fontSize: '13px', fontWeight: 'bold', marginBottom: '15px', border: '1px solid #ffe0b2' }}>
        {message}
      </div>

      {/* アクション制御ボタン */}
      <div style={{ marginBottom: '15px' }}>
        {gameState === 'setup' && (
          <button onClick={handleStart} style={{ padding: '10px 24px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#1976d2', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            準備OK
          </button>
        )}
        {gameState === 'attack_result' && (
          <button onClick={goToDefendPhase} style={{ padding: '10px 24px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#388e3c', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            次へ進む (守備へ)
          </button>
        )}
        {gameState === 'game_over' && (
          <button onClick={resetGame} style={{ padding: '10px 24px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#d32f2f', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            もう一度遊ぶ
          </button>
        )}
      </div>

      {/* サッカーピッチメインコンテナ */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '15px' }}>
        <div 
          ref={pitchRef}
          onClick={handlePitchClick}
          style={{
            width: '400px',
            height: '288px', 
            background: '#4caf50', 
            position: 'relative',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '2px solid #388e3c',
            cursor: gameState === 'attack' ? 'crosshair' : 'default'
          }}
        >
          {/* ゴールポストの白線枠 */}
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

          {/* キーパー役 (ロン君 🐈‍⬛ または あなた 🧍) */}
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

          {/* 下部キッカー位置表示 */}
          <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', fontSize: '26px', opacity: 0.8 }}>
            {gameState === 'defend' ? '🐈‍⬛' : '🏃‍♂️'}
          </div>
        </div>

        {/* 守備時の方向選択用オーバーレイ（ボタンを外出しにして100%安全に選ばせる） */}
        {gameState === 'defend' && (
          <div style={{ width: '400px', background: '#ffffff', padding: '12px', boxSizing: 'border-box', border: '1px solid #cccccc', borderRadius: '0 0 8px 8px', marginTop: '-2px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>どちらの方向に飛びますか？</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['左', '中央', '右'].map((dir) => (
                <button 
                  key={dir} 
                  onClick={() => handleDefendAction(dir)}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    backgroundColor: '#ff9800',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {dir}を守る
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ゲームリセット */}
      {gameState !== 'setup' && gameState !== 'game_over' && (
        <button onClick={resetGame} style={{ padding: '6px 12px', background: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', color: '#666666' }}>
          途中でリセット
        </button>
      )}

      {/* 試合のログ履歴 */}
      <div style={{ marginTop: '15px' }}>
        <div style={{ maxHeight: '100px', overflowY: 'auto', background: '#fafafa', padding: '8px', borderRadius: '4px', border: '1px solid #eeeeee', fontSize: '12px', color: '#555555', textAlign: 'left' }}>
          {logs.length === 0 && <p style={{ margin: 0, color: '#999999', textAlign: 'center' }}>試合の履歴がここに表示されます。</p>}
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