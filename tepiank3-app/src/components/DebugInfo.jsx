import React, { useContext } from 'react';
import { ContextApi } from '../Context/ContextApi';

const DebugInfo = () => {
  const { user, isAuthenticated } = useContext(ContextApi);
  
  // Hanya tampilkan di development
  if (import.meta.env.PROD) return null;
  
  return (
    <div className="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-xs max-w-sm">
      <h4 className="font-bold mb-2">Debug Info</h4>
      <div>
        <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
        <p><strong>User:</strong> {user ? user.email : 'None'}</p>
        <p><strong>Role:</strong> {user ? user.role : 'None'}</p>
        <p><strong>Token:</strong> {localStorage.getItem('authToken') ? 'Present' : 'Missing'}</p>
      </div>
    </div>
  );
};

export default DebugInfo;