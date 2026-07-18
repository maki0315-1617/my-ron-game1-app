'use client';

import React, { useState, useEffect } from 'react';

export default function Page() {
  const [isMounted, setIsMounted] = useState(false);

  // ゲームの状態管理 ('attack', 'defend_ready', 'game_over')
  const [gameState, setGameState] = useState('attack'); 
  const [logs, setLogs] = useState([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [ronScore, setRonScore] = useState(0);
  const [currentActionMessage, setCurrentActionMessage] = useState('ゴールの狙いたいところ（左・中央・右）を直接クリックしてシュート！');

  const [playerHistory, setPlayerHistory] = useState([null, null, null, null, null]);
  const [ronHistory, setRonHistory] = useState([null, null, null, null, null]);
  const [currentRound, setCurrentRound] = useState(0); 
  const [winner, setWinner] = useState('');

  // 位置情報（%指定による完全固定化で、ブラウザの計算ズレを徹底排除）
  const [ballLeft, setBallLeft] = useState('50%');
  const [ballTop, setBallTop] = useState('80%');
  const [keeperLeft, setKeeperLeft] = useState('50%');
  const [keeperTop, setKeeperTop] = useState('35%');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 勝敗判定ロジック
  const checkGameOver = (pScore, rScore, round) => {
    if (pScore >= 3 && rScore < 3) {
      setWinner('あなた');
      setGameState('game_over');
      setCurrentActionMessage('🎉 3点先取！あなたの勝ちです！');
      return true;
    }
    if (rScore >= 3 && pScore < 3) {
      setWinner('ロン君');
      setGameState('game_over');
      setCurrentActionMessage('🐈 ロン君が3点先取！ロン君の勝ちです！');
      return true;
    }
    if (round >= 5) {
      const finalWinner = pScore > rScore ? 'あなた' : rScore > pScore ? 'ロン君' : '引き分け';
      setWinner(finalWinner);
      setGameState('game_over');
      setCurrentActionMessage('5回戦終了しました！勝者: ' + finalWinner);
      return true;
    }
    return false;
  };

  // あなたの攻撃（ゴール内部の透明な各コースエリアをクリックした時の処理）
  const handleAttack = (course) => {
    if (gameState !== 'attack') return;

    // ロン君キーパーが守る方向をランダム決定
    const courses = ['左', '中央', '右'];
    const ronCourse = courses[Math.floor(Math.random() * 3)];

    // 各コースに応じたボールとキーパーの安全な移動先座標
    const positionMap = {
      '左': { ballLeft: '25%', keeperLeft: ronCourse === '左' ? '25%' : ronCourse === '中央' ? '50%' : '75%' },
      '中央': { ballLeft: '50%', keeperLeft: ronCourse === '左' ? '25%' : ronCourse === '中央' ? '50%' : '75%' },
      '右': { ballLeft: '75%', keeperLeft: ronCourse === '左' ? '25%' : ronCourse === '中央' ? '50%' : '75%' }
    };

    // グラフィックスの更新
    setBallLeft(positionMap[course].ballLeft);
    setBallTop('35%');
    setKeeperLeft(positionMap[course].keeperLeft);

    // 判定（選んだコースとロン君の守ったコースが違えばゴール！）
    const isGoal = course !== ronCourse;

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
    setLogs(prev => [`【${rNum}回戦・あなた攻撃】 ${course}を狙った ➔ ロン君は${ronCourse}を守った：${result}`, ...prev]);
    setCurrentActionMessage(`${result} 次はあなたの守備です。下のボタンから守る方向を選んでください！`);
    setGameState('defend_ready');
  };

  // あなたの守備（ボタンでコースを選択）
  const handleDefend = (course) => {
    if (gameState !== 'defend_ready') return;

    // ロン君がシュートする方向をランダム決定
    const courses = ['左', '中央', '右'];
    const ronCourse = courses[Math.floor(Math.random() * 3)];

    // 表示の更新
    setBallLeft(ronCourse === '左' ? '25%' : ronCourse === '中央' ? '50%' : '75%');
    setBallTop('35%');
    setKeeperLeft(course === '左' ? '25%' : course === '中央' ? '50%' : '75%');

    // あなたの守備方向とシュート方向が同じならセーブ
    const isSaved = course === ronCourse;

    const nextHistory = [...ronHistory];
    let nextRonScore = ronScore;
    let result = '';

    if (isSaved) {
      result = '〇 ナイスセーブ！';
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
    setLogs(prev => [`【${rNum}回戦・ロン君攻撃】 ロン君は${ronCourse}へ蹴った ➔ あなたは${course}を守った：${isSaved ? 'セーブ' : '失点'}`, ...prev]);

    const isOver = checkGameOver(playerScore, nextRonScore, nextRound);
    if (!isOver) {
      setCurrentActionMessage(`${result} ${nextRound + 1}回戦に突入！ゴール内をクリックしてシュート！`);
      setGameState('attack');
      
      // 1秒後にボールとキーパーを基本位置へ安全に戻す
      setTimeout(() => {
        setBallLeft('50%');
        setBallTop('80%');
        setKeeperLeft('50%');
      }, 1000);
    }
  };

  // 完全リセット
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
    setBallTop('80%');
    setKeeperLeft('50%');
    setCurrentActionMessage('ゴールの狙いたいところ（左・中央・右）を直接クリックしてシュート！');
  };

  if (!isMounted) {
    return <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>ゲームシステム起動中...</div>;
  }

  return (
    <div style={{ padding: '15px', fontFamily: 'sans-serif', maxWidth: '440px', margin: '0 auto', textAlign: 'center', userSelect: 'none' }}>
      <h3>黒猫ロン君とのPK戦（5回戦・3点先取制）</h3>

      {/* スコアボード */}
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

      {/* メッセージインフォ */}
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
        {gameState === 'game_over' && `🏆 試合終了 【勝者: ${winner}】`}
        <div style={{ fontWeight: 'normal', fontSize: '12px', color: '#444444', marginTop: '4px' }}>
          {currentActionMessage}
        </div>
      </div>

      {/* サッカーピッチ */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '15px' }}>
        <div style={{
          width: '400px',
          height: '288px', 
          background: gameState === 'attack' ? '#2e7d32' : '#114016', 
          position: 'relative',
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          {/* ゴール枠 */}
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '20px',
            width: '360px',
            height: '140px',
            borderTop: '5px solid #ffffff',
            borderLeft: '5px solid #ffffff',
            borderRight: '5px solid #ffffff',
            boxSizing: 'border-box',
            background: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: '4px 4px 0 0',
            display: 'flex'
          }}>
            {/* 🔴 クラッシュを防ぐコアシステム：ゴール内に敷き詰めた3つの透明な反応エリア */}
            {gameState === 'attack' ? (
              <>
                <div onClick={() => handleAttack('左')} style={{ flex: 1, cursor: 'pointer', zIndex: 30, background: 'transparent' }} title="左へシュート！" />
                <div onClick={() => handleAttack('中央')} style={{ flex: 1, cursor: 'pointer', zIndex: 30, background: 'transparent', borderLeft: '1px dashed rgba(255,255,255,0.1)', borderRight: '1px dashed rgba(255,255,255,0.1)' }} title="中央へシュート！" />
                <div onClick={() => handleAttack('右')} style={{ flex: 1, cursor: 'pointer', zIndex: 30, background: 'transparent' }} title="右へシュート！" />
              </>
            ) : null}
          </div>

          {/* 白線グラウンドライン */}
          <div style={{ position: 'absolute', top: '150px', width: '100%', height: '2px', backgroundColor: 'rgba(255,255,255,0.3)' }} />

          {/* キーパー（ロン君 / あなた） */}
          <div style={{
            position: 'absolute',
            left: keeperLeft,
            top: keeperTop,
            transform: 'translate(-50%, -50%)',
            fontSize: '40px',
            zIndex: 10,
            transition: 'left 0.2s ease-out'
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
            transition: 'left 0.2s ease-out, top 0.2s ease-out'
          }}>
            ⚽
          </div>

          {/* キッカー位置の目印 */}
          <div style={{ position: 'absolute', bottom: '5px', left: '50%', transform: 'translateX(-50%)', fontSize: '24px' }}>
            {gameState === 'attack' ? '🏃‍♂️' : '🐈‍⬛'}
          </div>
        </div>

        {/* 守備用の安全なコース選択コントロール（守備時のみ表示） */}
        {gameState === 'defend_ready' && (
          <div style={{ width: '400px', background: '#f5f5f5', padding: '10px', boxSizing: 'border-box', border: '1px solid #cccccc', borderRadius: '0 0 6px 6px', marginTop: '-5px' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 'bold', color: '#333333' }}>守る方向を選択してください：</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['左', '中央', '右'].map((dir) => (
                <button 
                  key={dir} 
                  onClick={() => handleDefend(dir)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    backgroundColor: '#ff9800',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {dir}を守る
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* システム操作 */}
      <button 
        onClick={resetGame}
        style={{ padding: '8px 16px', background: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', color: '#444444', width: '100%' }}
      >
        ゲームをリセット
      </button>

      {/* ログ履歴 */}
      <div style={{ marginTop: '15px' }}>
        <div style={{ maxHeight: '95px', overflowY: 'auto', background: '#fafafa', padding: '6px', borderRadius: '4px', border: '1px solid #eeeeee', fontSize: '11px', color: '#666666', textAlign: 'left' }}>
          {logs.length === 0 && <p style={{ margin: 0, color: '#999999', textAlign: 'center' }}>キックオフ！ゴールの狙いたい場所をクリックしてね。</p>}
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