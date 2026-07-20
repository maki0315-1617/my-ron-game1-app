import React, { useState, useEffect } from 'react';
import './App.css';
import Cockroach from './Cockroach';
import trashPileImage from './images/trash_pile.png'; 

// Array of available cockroach image types including special
const cockroachTypes = ['normal', 'bad', 'special'];

function App() {
  // Manage the list of active cockroaches in state
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
        // Position depends on direction (percentage for placement along edge)
        position: Math.random() * 80 + 10, 
        // Moderate intermediate speed (animation duration between 3.0s and 6.0s)
        duration: Math.random() * 3.0 + 3.0,
      };

      setCockroaches((prev) => [...prev, newCockroach]);

      // Remove from memory after moving off-screen (slightly after duration)
      setTimeout(() => {
        setCockroaches((prev) => prev.filter((c) => c.id !== id));
      }, (newCockroach.duration + 1.0) * 1000);

    }, 1000); // Spawn interval (every 1 second)

    // Clear interval on component unmount
    return () => clearInterval(spawnInterval);
  }, []);

  return (
    <div className="game-container">
      {/* Center content on screen (garbage pile) */}
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

      {/* Render all active cockroaches moving across the screen edges */}
      {cockroaches.map((roach) => (
        <Cockroach 
          key={roach.id} 
          direction={roach.direction} 
          type={roach.type}
          position={roach.position} 
          duration={roach.duration} 
        />
      ))}
    </div>
  );
}

export default App;