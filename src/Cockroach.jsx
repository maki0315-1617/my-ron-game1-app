import React from 'react';
import './Cockroach.css';
import cockroachImg from './画像/cockroach.png';

const Cockroach = ({ fromTop, x, duration }) => {
  const style = {
    left: `${x}%`,
    animationDuration: `${duration}s`,
  };

  return (
    <div 
      className={`cockroach ${fromTop ? 'from-top' : 'from-bottom'}`}
      style={style}
    >
      <img src={cockroachImg} alt="ゴキブリ" />
    </div>
  );
};

export default Cockroach;