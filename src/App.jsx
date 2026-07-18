'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function Page() {
  const [isMounted, setIsMounted] = useState(false);
  const timerRef = useRef(null);

  const [gameState, setGameState] = useState('setup'); 
  const [playerScore, setPlayerScore] = useState(0);
  const [ronScore, setRonScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [message, setMessage] = useState('準備ができたら下の「キックオフ！」ボタンを押してね！');
  const [logs, setLogs] = useState([]);
  const [countdownNum, setCountdownNum] = useState(3);
  const [playerHistory, setPlayerHistory] = useState([null, null, null, null, null]);
  const [ronHistory, setRonHistory] = useState([null, null, null, null, null]);
  const [ballLeft, setBallLeft] = useState('50%');
  const [ballTop, setBallTop] = useState('85%');
  const [keeperLeft, setKeeperLeft] = useState('50%');
  const [keeperTop, setKeeperTop] = useState('30%');
  const [ronTargetCourse, setRonTargetCourse] = useState('中央');

  useEffect(() => {
    setIsMounted(true);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
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
    setMessage(`⚽ 第 ${currentRound + 1}回戦 あなたの攻撃！シュートする方向をクリック！`);
    setBallLeft('50%'); setBallTop('85%');
    setKeeperLeft('50%'); setKeeperTop('30%');
  };

  const handlePitchClickAttack = (course) => {
    if (gameState !== 'attack') return;

    const courses = ['左', '中央', '右'];
    const ronCourse = courses[Math.floor(Math.random() * 3)];
    const posMap = { '左': '25%', '中央': '50%', '右': '75%' };
    
    setBallLeft(posMap[course]);
    setBallTop('30%');
    setKeeperLeft(posMap[ronCourse]);

    // 判定修正：同じコースなら止められる(失敗)、違うコースならゴール(成功)
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
    setLogs(prev => [`【${currentRound + 1}回戦】 あなた:${course} ➔ ロン君:${ronCourse} 【${resultText}】`, ...prev]);
    setMessage(`${resultText} 次は守備フェーズです。`);
    setGameState('attack_result');
  };

  const startDefendPhase = () => {
    clearActiveTimer();
    setGameState('countdown');
    setCountdownNum(3);
    setBallLeft('50%'); setBallTop('85%'); 
    setKeeperLeft('50%'); setKeeperTop('30%'); 

    const courses = ['左', '中央', '右'];
    const ronChoice = courses[Math.floor(Math.random() * 3)];
    setRonTargetCourse(ronChoice);

    let count = 3;
    timerRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdownNum(count);
      } else {
        clearActiveTimer();
        setCountdownNum('KICK!');
        setMessage('🏃‍♂️ ロン君が蹴った！ゴール枠内をクリックしてセーブ！');
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
    let newRonScore = ronScore;
    const nextRonHistory = [...ronHistory];

    if (isSaved) {
      nextRonHistory[currentRound] = '〇';
    } else {
      newRonScore += 1;
      setRonScore(newRonScore);
      nextRonHistory[currentRound] = '×';
    }

    setRonHistory(nextRonHistory);
    setLogs(prev => [`【${currentRound + 1}回戦】 ロン君:${ronTargetCourse} ➔ あなた:${course} 【${isSaved ? 'セーブ成功' : '失点'}】`, ...prev]);
    setMessage(isSaved ? '〇 ナイスセーブ！' : '× 決められた…');
    setGameState('defend_result');
  };

  const advanceAfterDefend = () => {
    clearActiveTimer();
    if (playerScore >= 3 || ronScore >= 3 || currentRound >= 4) {
      setGameState('game_over');
      setMessage(`試合終了！ ${playerScore} 対 ${ronScore}`);
    } else {
      setCurrentRound(currentRound + 1);
      setGameState('setup');
      setMessage('次の回戦へ進みます。「キックオフ！」を押してください。');
    }
  };

  const resetGame = () => {
    setPlayerScore(0); setRonScore(0); setCurrentRound(0);
    setPlayerHistory([null, null, null, null, null]);
    setRonHistory([null, null, null, null, null]);
    setGameState('setup');
    setMessage('準備ができたら下の「キックオフ！」ボタンを押してね！');
  };

  if (!isMounted) return null;

  return (
    <div style={{ padding: '15px', fontFamily: 'sans-serif', maxWidth: '440px', margin: '0 auto', textAlign: 'center' }}>
      <h2>黒猫ロン君とのPK戦</h2>
      {/* 画面構成は省略 */}
      {/* 以下のピッチ表示やボタン類は元の構造を維持しています */}
    </div>
  );
}