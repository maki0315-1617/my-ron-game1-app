import React from 'react';
import './Cockroach.css';
import cockroachImage from './images/cockroach.png';

function Cockroach({ direction, position, duration }) {
  // Determine style and animation class based on direction
  let style = {};
  let animationClass = '';

  if (direction === 'top') {
    style = { left: `${position}%`, top: '-50px' };
    animationClass = 'move-down';
  } else if (direction === 'bottom') {
    style = { left: `${position}%`, bottom: '-50px' };
    animationClass = 'move-up';
  } else if (direction === 'left') {
    style = { top: `${position}%`, left: '-50px' };
    animationClass = 'move-right';
  } else if (direction === 'right') {
    style = { top: `${position}%`, right: '-50px' };
    animationClass = 'move-left';
  }

  style.animationDuration = `${duration}s`;

  return (
    <div className={`cockroach-wrapper ${animationClass}`} style={style}>
      <img src={cockroachImage} alt="Cockroach" className="cockroach-image" />
    </div>
  );
}

export default Cockroach;