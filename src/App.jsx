import React from 'react';
import './App.css';
import floorTexture from './floor_texture.jpg';

function App() {
  return (
    <div 
      className="game-container" 
      style={{ backgroundImage: `url(${floorTexture})` }}
    >
      <div className="game-content">
        <h1>PKゲーム（準備中）</h1>
        <p>床の背景が表示されています。ここから機能を追加していきます。</p>
      </div>
    </div>
  );
}

export default App;