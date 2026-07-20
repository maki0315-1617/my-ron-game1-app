import React from 'react';
import './Cockroach.css';
import cockroachImg from './images/cockroach.png';

const Cockroach = ({ fromTop, x, duration }) => {
  const style = {
    '--start-y': fromTop ? '-10%' : '110%',
    '--end-y': fromTop ? '110%' : '-10%',
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