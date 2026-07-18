'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function Page() {
  const [isMounted, setIsMounted] = useState(false);
  const pitchRef = useRef(null);

  // ゲーム状態管理
  // 'setup', 'attack', 'attack_result', 'countdown', 'defend_click', 'game_over'
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

  // 位置データ（％指定）
  const [ballLeft, setBallLeft] = useState('50%');
  const [ballTop, setBallTop] = useState('85%');
  const [keeperLeft, setKeeperLeft] = useState('50%');
  const [keeperTop, setKeeperTop] = useState('30%');

  // ロン君がどこに蹴るかの内部状態
  const [ronTargetCourse, setRonTargetCourse] = useState('中央');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ゲームスタート
  const handleStart = () => {
    setGameState('attack');
    setMessage('⚽ あなたの攻撃：上のゴール枠内の好きなところ（左・中央・右）をクリックしてシュート！');
    setBallLeft('50%');
    setBallTop('85%');
    setKeeperLeft('50%');
    setKeeperTop('30%');
  };

  // あなたの攻撃（クリックシュート）
  const handlePitchClickAttack = (course) => {
    if (gameState !== 'attack') return;

    // ロン君キーパーの移動方向をランダム決定
    const courses = ['左', '中央', '右'];
    const ronCourse = courses[Math.floor(Math.random() * 3)];
    
    const posMap = { '左': '25%', '中央': '50%', '右': '75%' };
    
    // ボールが上のゴールへ、ロン君が守りへ動く
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

  // 守備フェーズへの切り替え（位置を入れ替えてカウントダウン開始）
  const startDefendPhase = () => {
    setGameState('countdown');
    setCountdownNum(3);
    setMessage('🛡️ ロン君の攻撃ターン！位置が入れ替わります。身構えてください！');
    
    // 【位置反転】ロン君が下（キッカー）、人間（GK）が上（ゴール）
    setBallLeft('50%');
    setBallTop('85%'); 
    setKeeperLeft('50%');
    setKeeperTop('30%'); 

    // ロン君のシュートコースをあらかじめ裏で決定
    const courses = ['左', '中央', '右'];
    const ronChoice = courses[Math.floor(Math.random() * 3)];
    setRonTargetCourse(ronChoice);

    // 3, 2, 1 のタイマー開始
    let count = 3;
    const timer = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdownNum(count);
      } else if (count === 0) {
        setCountdownNum('KICK!');
        setMessage('🏃‍♂️ ロン君が蹴った！上のゴール枠内（左・中央・右）をクリックしてシュートを止めて！');
        setGameState('defend_click');
        
        // 【人間の攻撃と同じ動き】ボールが下から上に向かって飛んでいく！
        const posMap = { '左': '25%', '中央': '50%', '右': '75%' };
        setBallLeft(posMap[ronChoice]);
        setBallTop('30%'); 
        
        clearInterval(timer);
      }
    }, 1000);
  };

  // あなたの守備（上のゴールをクリックして止める）
  const handlePitchClickDefend = (course) => {
    if (gameState !== 'defend_click') return;

    const posMap = { '左': '25%', '中央': '50%', '右': '75%' };
    // 上にいる人間（GK）を動かす
    setKeeperLeft(posMap[course]);

    // ロン君のコースと一致していればセーブ成功
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

    const nextRound = currentRound + 1;
    setCurrentRound(nextRound);

    // 勝敗チェック
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
      setMessage(`${resultText} ➔ 次は第 ${nextRound + 1}回戦です！位置が元に戻ります。ゴール内をクリックしてシュート！`);
      // 次のターン（あなたの攻撃）用に初期位置へ戻す
      setTimeout(() => {
        setBallLeft('50%');
        setBallTop('85%');
        setKeeperLeft('50%');
        setKeeperTop('30%');
      }, 1500);
    }
  };

  // 完全リセット
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
    setKeeperTop('30%');
  };

  const isDefendMode = (gameState === 'countdown' || gameState === 'defend_click');

  if (!isMounted) {
    return <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>読み込み中...</div>;
  }

  return (
    <div style={{ padding: '15px', fontFamily: 'sans-serif', maxWidth: '440px', margin: '0 auto', textAlign: 'center', color: '#333333' }}>
      <h2 style={{ fontSize: '18px', marginBottom: '15px', fontWeight: 'bold' }}>黒猫ロン君とのPK戦（5回戦・3点先取）</h2>

      {/* 📊 5回戦マトリックス表（星取表） */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '12px', background: '#ffffff', border: '1px solid #dddddd' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            <th style={{ padding: '8px', border: '1px solid #dddddd', fontWeight: 'bold' }}>チーム / 回戦</th>
            {[1, 2, 3, 4, 5].map((r) => (
              <th key={r} style={{ padding: '8px', border: '1px solid #dddddd', width: '50px', backgroundColor: currentRound === r - 1 && gameState !== 'game_over' ? '#edf2f7' : 'transparent', fontWeight: currentRound === r - 1 ? 'bold' : 'normal' }}>
                {r}回{currentRound === r - 1 && gameState !== 'game_over' ? '★' : ''}
              </th>
            ))}
            <th style={{ padding: '8px', border: '1px solid #dddddd', backgroundColor: '#edf7ed', fontWeight: 'bold' }}>得点</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '8px', border: '1px solid #dddddd', fontWeight: 'bold', textAlign: 'left', backgroundColor: gameState === 'attack' ? '#e3f2fd' : 'transparent' }}>
              あなた <span style={{ fontSize: '10px', color: '#2b6cb0', display: 'block' }}>{gameState === 'attack' ? '⚔️ シュート中' : '(攻)'}</span>
            </td>
            {playerHistory.map((h, i) => (
              <td key={i} style={{ padding: '8px', border: '1px solid #dddddd', fontSize: '14px', fontWeight: 'bold', color: h === '〇' ? '#e53e3e' : '#4a5568' }}>
                {h || '-'}
              </td>
            ))}
            <td style={{ padding: '8px', border: '1px solid #dddddd', fontWeight: 'bold', fontSize: '16px', backgroundColor: '#edf7ed', color: '#e53e3e' }}>{playerScore}</td>
          </tr>
          <tr>
            <td style={{ padding: '8px', border: '1px solid #dddddd', fontWeight: 'bold', textAlign: 'left', backgroundColor: isDefendMode ? '#fff3e0' : 'transparent' }}>
              ロン君 <span style={{ fontSize: '10px', color: '#dd6b20', display: 'block' }}>{isDefendMode ? '🛡️ 防御せよ！' : '(守)'}</span>
            </td>
            {ronHistory.map((h, i) => (
              <td key={i} style={{ padding: '8px', border: '1px solid #dddddd', fontSize: '14px', fontWeight: 'bold', color: h === '〇' ? '#388e3c' : '#e53e3e' }}>
                {h === '〇' ? '〇' : h === '×' ? '×' : '-'}
              </td>
            ))}
            <td style={{ padding: '8px', border: '1px solid #dddddd', fontWeight: 'bold', fontSize: '16px', backgroundColor: '#edf7ed', color: '#388e3c' }}>{ronScore}</td>
          </tr>
        </tbody>
      </table>

      {/* 📢 状況アナウンス */}
      <div style={{ 
        padding: '12px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', marginBottom: '15px', border: '1px solid', textAlign: 'left',
        background: gameState === 'attack' || gameState === 'attack_result' ? '#e3f2fd' : isDefendMode ? '#fff3e0' : gameState === 'game_over' ? '#e8f5e9' : '#f7fafc',
        color: gameState === 'attack' || gameState === 'attack_result' ? '#0d47a1' : isDefendMode ? '#b78103' : gameState === 'game_over' ? '#1b5e20' : '#4a5568',
        borderColor: gameState === 'attack' || gameState === 'attack_result' ? '#bbdefb' : isDefendMode ? '#ffe0b2' : '#cbd5e0'
      }}>
        {message}
      </div>

      {/* 🚀 メインボタンエリア */}
      <div style={{ marginBottom: '15px' }}>
        {gameState === 'setup' && (
          <button onClick={handleStart} style={{ width: '100%', padding: '12px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#1976d2', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            ⚽ キックオフ！試合を始める
          </button>
        )}
        {gameState === 'attack_result' && (
          <button onClick={startDefendPhase} style={{ width: '100%', padding: '12px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#ff9800', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            🛡️ 守備フェーズへ進む (位置交代＆カウントダウン)
          </button>
        )}
        {gameState === 'game_over' && (
          <button onClick={resetGame} style={{ width: '100%', padding: '12px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#e53e3e', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            🔄 もう一度最初から遊ぶ
          </button>
        )}
      </div>

      {/* サッカーピッチ */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '15px' }}>
        <div style={{
          width: '400px',
          height: '288px', 
          background: isDefendMode ? '#1b4d22' : '#4caf50', 
          position: 'relative',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '2px solid #388e3c',
          transition: 'background-color 0.3s'
        }}>
          
          {/* ⏰ カウントダウンオーバーレイ表示 */}
          {gameState === 'countdown' && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#ffffff', fontSize: '60px', fontWeight: 'bold', fontStyle: 'italic' }}>
              {countdownNum}
            </div>
          )}

          {/* ゴールポスト（常に上側に配置される白枠線） */}
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
            borderRadius: '4px 4px 0 0',
            display: 'flex'
          }}>
            {/* ⚔️ あなたの攻撃時の3分割クリックエリア */}
            {gameState === 'attack' && (
              <>
                <div onClick={() => handlePitchClickAttack('左')} style={{ flex: 1, cursor: 'pointer', zIndex: 50, background: 'transparent' }} />
                <div onClick={() => handlePitchClickAttack('中央')} style={{ flex: 1, cursor: 'pointer', zIndex: 50, background: 'transparent' }} />
                <div onClick={() => handlePitchClickAttack('右')} style={{ flex: 1, cursor: 'pointer', zIndex: 50, background: 'transparent' }} />
              </>
            )}

            {/* 🛡️ あなたの守備時の3分割クリックエリア */}
            {gameState === 'defend_click' && (
              <>
                <div onClick={() => handlePitchClickDefend('左')} style={{ flex: 1, cursor: 'pointer', zIndex: 50, background: 'rgba(255,255,255,0.05)', borderRight: '1px dashed rgba(255,255,255,0.2)' }} title="左を守る！" />
                <div onClick={() => handlePitchClickDefend('中央')} style={{ flex: 1, cursor: 'pointer', zIndex: 50, background: 'rgba(255,255,255,0.05)', borderRight: '1px dashed rgba(255,255,255,0.2)' }} title="中央を守る！" />
                <div onClick={() => handlePitchClickDefend('右')} style={{ flex: 1, cursor: 'pointer', zIndex: 50, background: 'rgba(255,255,255,0.05)' }} title="右を守る！" />
              </>
            )}
          </div>

          {/* 上側：キーパー（あなたの攻撃時は「ロン君 🐈‍⬛」、あなたの守備時は「あなた 🧍」） */}
          <div style={{
            position: 'absolute',
            left: keeperLeft,
            top: keeperTop,
            transform: 'translate(-50%, -50%)',
            fontSize: '42px',
            zIndex: 10,
            userSelect: 'none',
            transition: 'left 0.2s ease-out, top 0.2s ease-out'
          }}>
            {isDefendMode ? '🧍' : '🐈‍⬛'}
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

          {/* 下側：キッカー（あなたの攻撃時は「あなた 🏃‍♂️」、あなたの守備時は「ロン君 🐈‍⬛」） */}
          <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', fontSize: '38px', opacity: 0.9 }}>
            {isDefendMode ? '🐈‍⬛' : '🏃‍♂️'}
          </div>
        </div>
      </div>

      {/* 中断リセットボタン */}
      {gameState !== 'setup' && gameState !== 'game_over' && (
        <button onClick={resetGame} style={{ padding: '6px 12px', background: '#f7fafc', border: '1px solid #cbd5e0', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', color: '#718096' }}>
          試合をリセットしてやり直す
        </button>
      )}

      {/* 履歴ログ */}
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