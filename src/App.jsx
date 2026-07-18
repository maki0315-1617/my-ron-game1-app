import React, { useState, useEffect } from "react";
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

const directions = ["左", "中央", "右"];

function getRandomDirection() {
  return directions[Math.floor(Math.random() * directions.length)];
}

function App() {
  const [state, setState] = useState(initialState);
  const [message, setMessage] = useState(
    "緊迫したPK戦が始まる… 黒猫ロン君がこちらをじっと見つめている。"
  );
  const [history, setHistory] = useState([]);

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
    setMessage("新たなPK戦が始まる… ロン君の瞳が光る。");
  };

  const handlePlayerKick = (playerDir) => {
    if (state.isFinished || !state.isPlayerTurn) return;

    const ronDir = getRandomDirection();
    const isGoal = playerDir !== ronDir;

    const logEntry = `あなたのシュート：${playerDir} / ロン君の予測：${ronDir} → ${
      isGoal ? "ゴール！" : "セーブされた…"
    }`;

    setState((prev) => ({
      ...prev,
      playerScore: isGoal ? prev.playerScore + 1 : prev.playerScore,
      isPlayerTurn: false,
      log: [...prev.log, logEntry],
    }));

    setMessage(
      isGoal
        ? "あなたのシュートがネットを揺らした！スタジアムがどよめく。"
        : "ロン君が鋭い反応で止めた…重い空気が流れる。"
    );

    setTimeout(handleRonKick, 800);
  };

  const handleRonKick = () => {
    setState((prev) => {
      const ronDir = getRandomDirection();
      const playerGuess = getRandomDirection();
      const isGoal = ronDir !== playerGuess;

      const logEntry = `ロン君のシュート：${ronDir} / あなたの予測：${playerGuess} → ${
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
            resultText = "あなたの勝利！ロン君は悔しそうに尻尾を揺らしている。";
          } else if (newPlayerScore < newRonScore) {
            isFinished = true;
            resultText = "ロン君の勝利…黒猫の冷静さが光った。";
          } else {
            isSuddenDeath = true;
            resultText = "同点！サドンデスに突入…緊張がさらに高まる。";
          }
        }
      } else {
        if (newPlayerScore !== newRonScore) {
          isFinished = true;
          resultText =
            newPlayerScore > newRonScore
              ? "サドンデスを制した！あなたの勝利！"
              : "サドンデスでロン君が決めた…黒猫の勝利。";
        } else {
          newRound = prev.round + 1;
          resultText = "サドンデス継続…どちらも譲らない。";
        }
      }

      if (resultText && isFinished) {
        saveResultToHistory(
          `あなた ${newPlayerScore} - ロン君 ${newRonScore} → ${resultText}`
        );
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
  };

  return (
    <div className="app">
      <header className="header">
        <h1>黒猫ロン君とのPK戦ゲーム</h1>
        <p className="sub">あなた vs 黒猫ロン君（CPU）</p>
      </header>

      <section className="history-section">
        <h2>過去5回の勝敗結果</h2>
        {history.length === 0 ? (
          <p className="history-empty">まだ結果がありません。</p>
        ) : (
          <ul className="history-list">
            {history.map((h, idx) => (
              <li key={idx}>
                <span className="history-time">{h.time}</span>
                <span className="history-result">{h.result}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="game-section">
        <div className="score-board">
          <div className="score-item">
            <span className="label">あなた</span>
            <span className="score">{state.playerScore}</span>
          </div>
          <div className="score-item">
            <span className="label">ロン君 🐾</span>
            <span className="score">{state.ronScore}</span>
          </div>
        </div>

        <div className="round-info">
          <p>
            ラウンド: <strong>{state.round}</strong>
            {state.isSuddenDeath && <span className="sudden">（サドンデス）</span>}
          </p>
          <p>
            状態:{" "}
            {state.isFinished
              ? "試合終了"
              : state.isPlayerTurn
              ? "あなたの番"
              : "ロン君の番"}
          </p>
        </div>

        <div className="message">{message}</div>

        <div className="controls">
          <p>シュート方向を選択：</p>
          <div className="buttons">
            {directions.map((dir) => (
              <button
                key={dir}
                className="kick-button"
                onClick={() => handlePlayerKick(dir)}
                disabled={!state.isPlayerTurn || state.isFinished}
              >
                {dir} に蹴る
              </button>
            ))}
          </div>
        </div>

        <div className="log">
          <h3>試合ログ</h3>
          {state.log.length === 0 ? (
            <p>まだプレーはありません。</p>
          ) : (
            <ul>
              {state.log.map((entry, idx) => (
                <li key={idx}>{entry}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="actions">
          <button className="reset-button" onClick={resetGame}>
            新しいPK戦を始める
          </button>
        </div>
      </section>
    </div>
  );
}

export default App;
