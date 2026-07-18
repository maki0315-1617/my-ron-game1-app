import React, { useState } from 'react';

function Counter() {
  // 状態（state）を管理するためのフック
  const [count, setCount] = useState(0);

  // クリック時の処理
  const handleClick = () => {
    setCount(count + 1);
  };

  return (
    <div>
      <p>現在のカウント: {count}</p>
      <button onClick={handleClick}>増やす</button>
    </div>
  );
}

export default Counter;