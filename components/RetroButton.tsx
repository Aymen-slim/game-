import React from 'react';

interface RetroButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'success';
}

const RetroButton: React.FC<RetroButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "relative px-4 py-3 font-bold uppercase transition-transform active:scale-95 border-4";
  
  let colors = "";
  switch(variant) {
    case 'primary':
      colors = "bg-blue-600 border-blue-800 text-white hover:bg-blue-500 shadow-[4px_4px_0px_0px_rgba(30,58,138,1)]";
      break;
    case 'danger':
      colors = "bg-red-600 border-red-800 text-white hover:bg-red-500 shadow-[4px_4px_0px_0px_rgba(153,27,27,1)]";
      break;
    case 'success':
      colors = "bg-green-600 border-green-800 text-white hover:bg-green-500 shadow-[4px_4px_0px_0px_rgba(22,101,52,1)]";
      break;
  }

  return (
    <button 
      className={`${baseStyle} ${colors} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

export default RetroButton;