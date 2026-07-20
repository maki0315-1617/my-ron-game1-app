import React, { useState, useEffect } from 'react';
import './App.css';
import Cockroach from './Cockroach';
import trashPileImage from './images/trash_pile.png'; 

// Array of available cockroach image types
const cockroachTypes = ['normal', 'bad', 'special'];

function App() {
  const [score, setScore] = useState(0);
  const [cockroaches, setCockroaches] = useState([]);

  useEffect(() => {
    // Timer to spawn cockroaches at regular intervals
    const spawnInterval = setInterval(() => {
      const id = Date.now();
      
      // Randomly choose from 4 directions: top, bottom, left, right
      const directions = ['top', 'bottom', 'left', 'right'];
      const direction = directions[Math.floor(Math.random() * directions.length)];

      // Randomly choose a cockroach type
      const type = cockroachTypes[Math.floor(Math.random() * cockroachTypes.length)];

      const newCockroach = {
        id,
        direction,
        type,
        position: Math.random() * 80 + 10, 
        // Moderate intermediate speed (animation duration between 3.0s and 6.0s)
        duration: Math.random() * 3.0 + 3.0,
      };

      setCockroaches((prev) => [...prev, newCockroach]);

      // Remove from memory after moving off-screen
      setTimeout(() => {
        setCockroaches((prev) => prev.filter((c) => c.id !== id));
      }, (newCockroach.duration + 1.0) * 1000);

    }, 1000);

    return () => clearInterval(spawnInterval);
  }, []);

  // Handle clicking on a cockroach to destroy it and update score (+1 point for any type)
  const handleCockroachClick = (id) => {
    setScore((prevScore) => prevScore + 1);
    setCockroaches((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="game-container">
      {/* Score Display */}
      <div className="score-display">
        スコア: {score}
      </div>

      {/* Center content on screen (garbage pile) */}
      <div className="game-content">
        <h1>PK戦（準備中）</h1>
        <p>床の背景の上にゴミとゴキブリを置いた。</p>
        
        <div className="garbage-display">
          <img 
            src={trashPileImage} 
            alt="Trash Pile" 
            className="garbage-image" 
          />
        </div>
      </div>

      {/* Render all active cockroaches moving across the screen edges */}
      {cockroaches.map((roach) => (
        <Cockroach 
          key={roach.id} 
          id={roach.id}
          direction={roach.direction} 
          type={roach.type}
          position={roach.position} 
          duration={roach.duration} 
          onClick={handleCockroachClick}
        />
      ))}
    </div>
  );
}

export default App;