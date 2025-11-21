import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Memuat data...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className={`${sizeClasses[size]} border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin`}></div>
      {text && <p className="mt-3 text-gray-600 text-sm">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;