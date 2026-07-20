import React from 'react';
import './App.css';
// GitHubのリポジトリにある「画像」フォルダから読み込む想定です
import rawGarbageImage from './images/raw_garbage.png'; 

function App() {
  return (
    <div className="game-container">
      <div className="game-content">
        <h1>PKゲーム（準備中）</h1>
        <p>床の背景が表示されています。ここに生ごみを配置しました。</p>
        
        {/* 中央に配置する生ごみ画像 */}
        <div className="garbage-display">
          <img 
            src={rawGarbageImage} 
            alt="生ごみ" 
            className="garbage-image" 
          />
        </div>
        
      </div>
    </div>
  );
}

export default App;