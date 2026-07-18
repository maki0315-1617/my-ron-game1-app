'use client';

import React, { useState } from 'react';

export default function Page() {
  // カウントを管理するステート
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <p style={{ fontSize: '18px', marginBottom: '10px' }}>
        現在のカウント: {count}
      </p>
      
      {/* ボタンを押すと setCount で count が +1 されます */}
      <button 
        onClick={() => setCount(count + 1)}
        style={{ 
          padding: '8px 16px', 
          fontSize: '16px', 
          cursor: 'pointer' 
        }}
      >
        増
      </button>
    </div>
  );
}