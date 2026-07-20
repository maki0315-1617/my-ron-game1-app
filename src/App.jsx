import React, { useState, useEffect } from 'react';
import './App.css';
import Cockoach from './Cockroach';
import trashPileImage from './images/trash_pile.png'; 

function App() {
  // Manage the list of cockroaches in state
  const [cockroaches, setCockroaches] = useState([]);

  useEffect(() => {
    // Timer to spawn cockroaches at regular intervals
    const spawnInterval = setInterval(() => {
      const id = Date.now();
      // Randomly choose from 4 directions: top, bottom, left, right
      const directions = ['top', 'bottom', 'left', 'right'];
      const direction = directions[Math.floor(Math.random() * directions.length)];

      const newCockroach = {
        id,
        direction,
        // Position depends on direction (percentage for placement)
        position: Math.random() * 80 + 10, 
        // Moderate intermediate speed (animation duration between 3.0s and 6.0s)
        duration: Math.random() * 3.0 + 3.0,
      };

      setCockroaches((prev) => [...prev, newCockroach]);

      // Remove from memory after moving off-screen
      setTimeout(() => {
        setCockroaches((prev) => prev.filter((c) => c.id !== id));
      }, (newCockroach.duration + 0.5) * 1000);

    }, 1500);

    return () => clearInterval(spawnInterval);
  }, []);

  return (
    <div className="game-container">
      {/* Center content on screen (such as garbage) */}
      <div className="game-content">
        <h1>PK Game (In Preparation)</h1>
        <p>Placed garbage and cockroaches on top of the floor background.</p>
        
        <div className="garbage-display">
          <img 
            src={trashPileImage} 
            alt="Trash Pile" 
            className="garbage-image" 
          />
        </div>
      </div>

      {/* Render cockroaches moving across the screen edges */}
      {cockroaches.map((roach) => (
        <Cockoach 
          key={roach.id} 
          direction={roach.direction} 
          position={roach.position} 
          duration={roach.duration} 
        />
      ))}
    </div>
  );
}

export default App;