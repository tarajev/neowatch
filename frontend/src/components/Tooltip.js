import React, { useState, useEffect } from 'react';

export default function Tooltip({ text, hideOn, top, right, children, className }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (hideOn)
      setVisible(false);
  }, [hideOn]);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)} 
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && text && (
        <div 
          className={`${className} z-[999] absolute bg-gray-900 text-white text-center text-sm rounded py-2 px-3 shadow-lg fade-in
            ${top ? 'bottom-full mb-2' : ''} 
            ${right ? 'left-full ml-2 top-1/2 -translate-y-1/2' : 'left-1/2 transform -translate-x-1/2 mt-2 w-40'}`}
        >
          <p className='truncate'>{text}</p>
          {/* Tooltip Arrow */}
          <div 
            className={`absolute w-3 h-3 bg-gray-900 rotate-45
              ${top ? 'top-full left-1/2 -translate-x-1/2 -mt-2' : ''}
              ${right ? 'left-[-0.35rem] top-1/2 -translate-y-1/2' : ''}
              ${!top && !right ? 'bottom-full left-1/2 -translate-x-1/2 -mb-2' : ''}
            `}
          ></div>
        </div>
      )}
    </div>
  );
}
