import React, { useState, useEffect } from "react";
import "./App.css";

const HISTORY_KEY = "ron-pk-history";

// 6方向
const directions = [
  { key: "左上", x: -120, y: -120 },
  { key: "左下", x: -120, y: 40 },
  { key: "中央上", x: 0, y: -120 },
  { key: "中央下", x: 0, y: 40 },
  { key: "右上", x: 120, y: -120 },
  { key: "右下", x: 120, y: 40 },
];

function getRandomDirection() {
  return directions[Math.floor(Math.random() * directions.length)];
}

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

  // アニメーション用
  const [ballPos, setBallPos] = useState({ x: 0, y: 0 });
  const [ronPos, setRonPos] = useState({ x: 0, y: 0 });
  const [goalFlash, setGoalFlash] = useState(false);
  const [saveShake, setSaveShake] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  const saveResultToHistory = (resultText) => {
    const newEntry = {
      time: new Date().toLocaleString(),
      result: resultText,
    };
    const updated = [newEntry, ...history].slice(0, 5);
    setHistory(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  const resetGame = () => {
    setState(initialState);
    setMessage("新たなPK戦が始まる… ロン君の瞳が鋭く光る。");
    setBallPos({ x: 0, y: 0 });
    setRonPos({ x: 0, y: 0 });
  };

  const animateKick = (dir, ronDir, isGoal) => {
    // ボールを飛ばす
    setBallPos({ x: dir.x, y: dir.y });

    // ロン君を飛ばす
    setRonPos({ x: ronDir.x, y: ronDir.y });

    if (isGoal) {
      setGoalFlash(true);
      setTimeout(() => setGoalFlash(false), 400);
    } else {
      setSaveShake(true);
      setTimeout(() => setSaveShake(false), 300);
    }
  };

  const handlePlayerKick = (dir) => {
    if (!state.isPlayerTurn || state.isFinished) return;

    const ronDir = getRandomDirection();
    const isGoal = dir.key !== ronDir.key;

    animateKick(dir, ronDir, isGoal);

    const logEntry = `攻撃：あなた → ${dir.key} / 守備：ロン君 → ${ronDir.key} → ${
      isGoal ? "ゴール！" : "セーブ！"
    }`;

    setState((prev) => ({
      ...prev,
      playerScore: isGoal ? prev.playerScore + 1 : prev.playerScore,
      isPlayerTurn: false,
      log: [...prev.log, logEntry],
    }));

    setMessage(
      isGoal
        ? "あなたのシュートが決まった！スタジアムが揺れる。"
        : "ロン君が鋭く飛んで止めた…黒猫の反射神経が光る。"
    );

    setTimeout(handleRonKick, 900);
  };

  const handleRonKick = () => {
    setState((prev) => {
      const ronDir = getRandomDirection();
      const playerGuess = getRandomDirection();
      const isGoal = ronDir.key !== playerGuess.key;

      animateKick(ronDir, playerGuess, isGoal);

      const logEntry = `攻撃：ロン君 → ${ronDir.key} / 守備：あなた → ${playerGuess.key} → ${
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
            resultText = "あなたの勝利！ロン君は悔しそうに尻尾を揺らす。";
          } else if (newPlayerScore < newRonScore) {
            isFinished = true;
            resultText = "ロン君の勝利…黒猫の冷静さが勝った。";
          } else {
            isSuddenDeath = true;
            resultText = "同点！サドンデス突入…緊張が極限に達する。";
          }
        }
      } else {
        if (newPlayerScore !== newRonScore) {
          isFinished = true;
          resultText =
            newPlayerScore > newRonScore
              ? "サドンデスを制した！あなたの勝利！"
              : "ロン君が決めた…黒猫の勝利。";
        } else {
          newRound = prev.round + 1;
          resultText = "サドンデス継続…どちらも譲らない。";
        }
      }

      if (isFinished) saveResultToHistory(resultText);
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
  };

  return (
    <div className="app">
      <h1>黒猫ロン君とのPK戦（アニメーション強化版）</h1>

      {/* ゴールエリア */}
      <div className={`goal-area ${goalFlash ? "goal-flash" : ""} ${saveShake ? "save-shake" : ""}`}>
        <div className="goal-frame"></div>

        {/* プレイヤー */}
        <div className="player"></div>

        {/* ボール */}
        <div
          className="ball"
          style={{ transform: `translate(${ballPos.x}px, ${ballPos.y}px)` }}
        ></div>

        {/* ロン君 */}
        <div
          className="ron"
          style={{ transform: `translate(${ronPos.x}px, ${ronPos.y}px)` }}
        ></div>
      </div>

      <p>{message}</p>

      {/* シュートボタン */}
      <div className="buttons">
        {directions.map((d) => (
          <button
            key={d.key}
            className="kick-button"
            disabled={!state.isPlayerTurn || state.isFinished}
            onClick={() => handlePlayerKick(d)}
          >
            {d.key} に蹴る
          </button>
        ))}
      </div>

      {/* ログ */}
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
