import React from 'react';
import './Cockroach.css';

// Import both cockroach images
import cockroachImage from './images/cockroach.png';
import cockroachBadImage from './images/cockroach_bad.png';

function Cockroach({ direction, type, position, duration }) {
  // Determine style and animation class based on direction
  let wrapperStyle = {};
  let imageStyle = {};
  let animationClass = '';

  // Set base animation duration
  wrapperStyle.animationDuration = `${duration}s`;

  // Calculate initial position and choose animation class
  if (direction === 'top') {
    wrapperStyle.left = `${position}%`;
    wrapperStyle.top = '-50px';
    animationClass = 'moveDown';
  } else if (direction === 'bottom') {
    wrapperStyle.left = `${position}%`;
    wrapperStyle.bottom = '-50px';
    animationClass = 'moveUp';
  } else if (direction === 'left') {
    wrapperStyle.top = `${position}%`;
    wrapperStyle.left = '-50px';
    animationClass = 'moveRight';
    imageStyle.transform = 'rotate(90deg)'; // Rotate for horizontal movement
  } else if (direction === 'right') {
    wrapperStyle.top = `${position}%`;
    wrapperStyle.right = '-50px';
    animationClass = 'moveLeft';
    imageStyle.transform = 'rotate(-90deg)'; // Rotate for horizontal movement
  }

  // Select the image source based on the type prop
  const imageSrc = type === 'bad' ? cockroachBadImage : cockroachImage;
  const altText = type === 'bad' ? 'Bad Cockroach' : 'Cockroach';

  return (
    <div className={`cockroach-wrapper ${animationClass}`} style={wrapperStyle}>
      <img 
        src={imageSrc} 
        alt={altText} 
        className="cockroach-image" 
        style={imageStyle} 
      />
    </div>
  );
}

export default Cockroach;