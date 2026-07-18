import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const HISTORY_KEY = "ron-pk-history";

const initialState = {
  playerScore: 0,
  ronScore: 0,
  round: 1,
  maxRounds: 5,
  isPlayerTurn: true,
  isFinished: false,
  isSuddenDeath: false,
  log: [],
};

function App() {
  const [state, setState] = useState(initialState);
  const [message, setMessage] = useState("黒猫ロン君がゴール前で構えている…緊迫したPK戦が始まる。");
  const [history, setHistory] = useState([]);

  const [ballPos, setBallPos] = useState({ x: 0, y: 0 });
  const [ronPos, setRonPos] = useState({ x: 0, y: 0 });
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });

  const [goalFlash, setGoalFlash] = useState(false);
  const [saveShake, setSaveShake] = useState(false);

  const [countdown, setCountdown] = useState(5);
  const timerRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  const startCountdown = () => {
    setCountdown(5);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
        }
        return c - 1;
      });
    }, 1000);
  };

  const handleTimeout = () => {
    if (!state.isPlayerTurn || state.isFinished) return;

    const logEntry = "タイムオーバー → あなたの失敗";
    setState((prev) => ({
      ...prev,
      isPlayerTurn: false,
      log: [...prev.log, logEntry],
    }));

    setMessage("タイムオーバー！蹴る前に時間が切れた…");

    setTimeout(handleRonKick, 900);
  };

  const resetGame = () => {
    setState(initialState);
    setMessage("新たなPK戦が始まる… ロン君の瞳が鋭く光る。");
    setBallPos({ x: 0, y: 0 });
    setRonPos({ x: 0, y: 0 });
    setPlayerPos({ x: 0, y: 0 });
    clearInterval(timerRef.current);
    startCountdown();
  };

  useEffect(() => {
    startCountdown();
  }, []);

  const animateKick = (ballX, ballY, ronX, ronY, isGoal) => {
    setBallPos({ x: ballX, y: ballY });
    setRonPos({ x: ronX, y: ronY });

    if (isGoal) {
      setGoalFlash(true);
      setTimeout(() => setGoalFlash(false), 400);
    } else {
      setSaveShake(true);
      setTimeout(() => setSaveShake(false), 300);
    }
  };

  const handlePlayerKick = (e) => {
    if (!state.isPlayerTurn || state.isFinished) return;

    clearInterval(timerRef.current);

    const rect = e.target.getBoundingClientRect();
    const clickX = e.clientX - rect.left - 150;
    const clickY = e.clientY - rect.top - 80;

    const ronGuessX = Math.random() * 200 - 100;
    const ronGuessY = Math.random() * 120 - 60;

    const isGoal = Math.abs(clickX - ronGuessX) > 40 || Math.abs(clickY - ronGuessY) > 40;

    animateKick(clickX, clickY, ronGuessX, ronGuessY, isGoal);

    const logEntry = `攻撃：あなた → (${clickX}, ${clickY}) / 守備：ロン君 → (${ronGuessX}, ${ronGuessY}) → ${
      isGoal ? "ゴール！" : "セーブ！"
    }`;

    setState((prev) => ({
      ...prev,
      playerScore: isGoal ? prev.playerScore + 1 : prev.playerScore,
      isPlayerTurn: false,
      log: [...prev.log, logEntry],
    }));

    setMessage(isGoal ? "あなたのシュートが決まった！" : "ロン君が止めた…黒猫の反射神経が光る。");

    setTimeout(handleRonKick, 900);
  };

  const handleRonKick = () => {
    setState((prev) => {
      const ronX = Math.random() * 200 - 100;
      const ronY = Math.random() * 120 - 60;

      const playerGuessX = Math.random() * 200 - 100;
      const playerGuessY = Math.random() * 120 - 60;

      const isGoal = Math.abs(ronX - playerGuessX) > 40 || Math.abs(ronY - playerGuessY) > 40;

      animateKick(ronX, ronY, playerGuessX, playerGuessY, isGoal);

      const logEntry = `攻撃：ロン君 → (${ronX}, ${ronY}) / 守備：あなた → (${playerGuessX}, ${playerGuessY}) → ${
        isGoal ? "ゴール…" : "止めた！"
      }`;

      let newPlayerScore = prev.playerScore;
      let newRonScore = isGoal ? prev.ronScore + 1 : prev.ronScore;
      let newRound = prev.round;
      let isSuddenDeath = prev.isSuddenDeath;
      let isFinished = false;
      let resultText = "";

      if (!prev.isSuddenDeath) {
        if (prev.round < prev.maxRounds) {
          newRound = prev.round + 1;
        } else {
          if (newPlayerScore > newRonScore) {
            isFinished = true;
            resultText = "あなたの勝利！";
          } else if (newPlayerScore < newRonScore) {
            isFinished = true;
            resultText = "ロン君の勝利…黒猫の冷静さが勝った。";
          } else {
            isSuddenDeath = true;
            resultText = "同点！サドンデス突入…";
          }
        }
      } else {
        if (newPlayerScore !== newRonScore) {
          isFinished = true;
          resultText =
            newPlayerScore > newRonScore ? "サドンデスを制した！あなたの勝利！" : "ロン君が決めた…黒猫の勝利。";
        } else {
          newRound = prev.round + 1;
          resultText = "サドンデス継続…";
        }
      }

      setMessage(resultText);

      return {
        ...prev,
        ronScore: newRonScore,
        round: newRound,
        isPlayerTurn: true,
        isSuddenDeath,
        isFinished,
        log: [...prev.log, logEntry],
      };
    });

    startCountdown();
  };

  return (
    <div className="app">
      <h1>黒猫ロン君とのPK戦（クリックで蹴る版）</h1>

      <div className="countdown">残り時間：{countdown}秒</div>

      {/* ゴールエリア */}
      <div
        className={`goal-area ${goalFlash ? "goal-flash" : ""} ${saveShake ? "save-shake" : ""}`}
        onClick={handlePlayerKick}
      >
        <div className="goal-frame"></div>

        <div className="player" style={{ transform: `translate(${playerPos.x}px, ${playerPos.y}px)` }}></div>

        <div className="ball" style={{ transform: `translate(${ballPos.x}px, ${ballPos.y}px)` }}></div>

        <div className="ron" style={{ transform: `translate(${ronPos.x}px, ${ronPos.y}px)` }}></div>
      </div>

      <p>{message}</p>

      <div className="log">
        <h3>試合ログ</h3>
        <ul>
          {state.log.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      </div>

      <button className="reset-button" onClick={resetGame}>
        新しいPK戦を始める
      </button>
    </div>
  );
}

export default App;
