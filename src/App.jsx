'use client';

import React, { useState, useEffect } from 'react';

export default function Page() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ゲーム状態: 'attack' (プレイヤーの攻撃), 'defend' (守備), 'game_over' (終了)
  const [gameState, setGameState] = useState('attack'); 
  const [logs, setLogs] = useState([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [ronScore, setRonScore] = useState(0);
  const [currentActionMessage, setCurrentActionMessage] = useState('シュートするコースを選んでください！');

  const [playerHistory, setPlayerHistory] = useState([null, null, null, null, null]);
  const [ronHistory, setRonHistory] = useState([null, null, null, null, null]);
  const [currentRound, setCurrentRound] = useState(0); 
  const [winner, setWinner] = useState('');

  // 演出用：直前の選択と結果
  const [lastAction, setLastAction] = useState({ player: '', ron: '', result: '' });

  // 勝敗チェック
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
      setCurrentActionMessage('ロン君が3点先取！ロン君の勝ちです！');
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

  // あなたの攻撃（コース選択）
  const handleAttackDirection = (direction) => {
    if (gameState !== 'attack') return;

    // ロン君（キーパー）が飛ぶ方向をランダム決定（左・中央・右）
    const directions = ['左', '中央', '右'];
    const ronDirection = directions[Math.floor(Math.random() * 3)];

    // コースが違えばゴール！同じならセーブ
    const isGoal = direction !== ronDirection;

    const nextHistory = [...playerHistory];
    let nextPlayerScore = playerScore;
    let resultText = '';

    if (isGoal) {
      nextPlayerScore += 1;
      setPlayerScore(nextPlayerScore);
      resultText = 'ゴール！';
      nextHistory[currentRound] = '〇';
    } else {
      resultText = '止められた…';
      nextHistory[currentRound] = '×';
    }
    setPlayerHistory(nextHistory);

    setLastAction({
      player: `シュート: ${direction}`,
      ron: `ロン君のセーブ: ${ronDirection}`,
      result: resultText
    });

    const rNum = currentRound + 1;
    setLogs(prev => [`【${rNum}回戦・あなた攻撃】 あなた:${direction} ➔ ロン君:${ronDirection} 【${resultText}】`, ...prev]);
    setCurrentActionMessage(`${resultText} 次は守備です。ロン君のシュートコースを予測して守りましょう！`);
    setGameState('defend');
  };

  // あなたの守備（コース選択）
  const handleDefendDirection = (direction) => {
    if (gameState !== 'defend') return;

    // ロン君（キッカー）が蹴る方向をランダム決定
    const directions = ['左', '中央', '右'];
    const ronDirection = directions[Math.floor(Math.random() * 3)];

    // あなたが選んだ方向とロン君のシュート方向が同じならセーブ！
    const isSaved = direction === ronDirection;

    const nextHistory = [...ronHistory];
    let nextRonScore = ronScore;
    let resultText = '';

    if (isSaved) {
      resultText = 'ナイスセーブ！';
      nextHistory[currentRound] = '〇';
    } else {
      nextRonScore += 1;
      setRonScore(nextRonScore);
      resultText = '決められた…';
      nextHistory[currentRound] = '×';
    }
    setRonHistory(nextHistory);

    setLastAction({
      player: `あなたの守備: ${direction}`,
      ron: `ロン君のシュート: ${ronDirection}`,
      result: resultText
    });

    const nextRound = currentRound + 1;
    setCurrentRound(nextRound);

    const rNum = currentRound + 1;
    setLogs(prev => [`【${rNum}回戦・ロン君攻撃】 ロン君:${ronDirection} ➔ あなた:${direction} 【${resultText}】`, ...prev]);

    const isOver = checkGameOver(playerScore, nextRonScore, nextRound, true);
    if (!isOver) {
      setCurrentActionMessage(`${resultText} ${nextRound + 1}回戦スタート！シュートコースを選んでください。`);
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
    setLastAction({ player: '', ron: '', result: '' });
    setCurrentActionMessage('シュートするコースを選んでください！');
  };

  if (!isMounted) {
    return <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>ゲームを読み込み中...</div>;
  }

  return (
    <div style={{ padding: '15px', fontFamily: 'sans-serif', maxWidth: '440px', margin: '0 auto', textAlign: 'center', color: '#333333' }}>
      <h3 style={{ margin: '10px 0' }}>黒猫ロン君とのPK戦（5回戦・3点先取制）</h3>

      {/* スコア表 */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#ffffff', border: '1px solid #dddddd' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th style={{ padding: '6px', border: '1px solid #dddddd' }}>選手 / 回戦</th>
            {[1, 2, 3, 4, 5].map(r => (
              <th key={r} style={{ padding: '6px', border: '1px solid #dddddd', width: '45px', color: currentRound === r - 1 ? '#0d47a1' : '#333333' }}>
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
                {h === '〇' ? 'セーブ' : h === '×' ? 'ゴール' : '-'}
              </td>
            ))}
            <td style={{ padding: '6px', border: '1px solid #dddddd', fontWeight: 'bold', backgroundColor: '#e8f5e9' }}>{ronScore}</td>
          </tr>
        </tbody>
      </table>

      {/* 状態表示パネル */}
      <div style={{
        padding: '12px', 
        borderRadius: '6px', 
        marginBottom: '15px', 
        fontWeight: 'bold',
        fontSize: '14px',
        background: gameState === 'attack' ? '#e3f2fd' : gameState === 'game_over' ? '#e8f5e9' : '#fff3e0',
        color: gameState === 'attack' ? '#0d47a1' : gameState === 'game_over' ? '#2e7d32' : '#e65100',
        border: '1px solid #cccccc'
      }}>
        {gameState === 'attack' && '【 あなたの攻撃番 】'}
        {gameState === 'defend' && '【 あなたの守備番（ロン君の攻撃） 】'}
        {gameState === 'game_over' && `【 試合終了 / 勝者: ${winner} 】`}
        <div style={{ fontWeight: 'normal', fontSize: '13px', color: '#444444', marginTop: '6px' }}>
          {currentActionMessage}
        </div>
      </div>

      {/* メイン対戦視覚エリア */}
      <div style={{
        background: '#1b5e20',
        padding: '20px 10px',
        borderRadius: '8px',
        marginBottom: '15px',
        border: '3px solid #ffffff',
        color: '#ffffff'
      }}>
        {/* 前回の対戦ログの簡易ビジュアル表示 */}
        {lastAction.player ? (
          <div>
            <div style={{ fontSize: '14px', marginBottom: '5px' }}>{lastAction.player}</div>
            <div style={{ fontSize: '14px', marginBottom: '10px' }}>{lastAction.ron}</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffeb3b' }}>🏆 {lastAction.result}</div>
          </div>
        ) : (
          <div style={{ padding: '20px 0', fontSize: '15px' }}>
            試合開始です！最初のキックを行ってください。
          </div>
        )}
      </div>

      {/* 操作ボタンエリア */}
      {gameState !== 'game_over' && (
        <div style={{ marginBottom: '15px' }}>
          <p style={{ fontSize: '13px', fontWeight: 'bold', margin: '5px 0' }}>コースを選択して決定：</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
            {['左', '中央', '右'].map((dir) => (
              <button
                key={dir}
                onClick={() => gameState === 'attack' ? handleAttackDirection(dir) : handleDefendDirection(dir)}
                style={{
                  flex: 1,
                  padding: '15px 0',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  backgroundColor: gameState === 'attack' ? '#2196f3' : '#ff9800',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                {dir}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* リセットボタン */}
      <button 
        onClick={resetGame}
        style={{ padding: '8px 16px', background: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', color: '#333333', width: '100%' }}
      >
        ゲームをリセットして最初から遊ぶ
      </button>

      {/* 試合ログ履歴 */}
      <div style={{ marginTop: '15px' }}>
        <div style={{ maxHeight: '110px', overflowY: 'auto', background: '#fafafa', padding: '8px', borderRadius: '4px', border: '1px solid #eeeeee', fontSize: '12px', color: '#555555', textAlign: 'left' }}>
          {logs.length === 0 && <p style={{ margin: 0, color: '#999999', textAlign: 'center' }}>ここに試合の全履歴が表示されます。</p>}
          {logs.map((log, index) => (
            <div key={index} style={{ padding: '3px 0', borderBottom: '1px solid #eee' }}>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}