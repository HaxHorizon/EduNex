import { useState } from 'react';
import React from 'react';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import OverlayPanel from '../components/OverlayPanel';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
function Auth() {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);

  const togglePanel = () => {
    setIsRightPanelActive(!isRightPanelActive);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
       <ToastContainer position="top-right" />
      <div className={`relative overflow-hidden bg-white rounded-2xl shadow-xxxl w-full max-w-3xl min-h-[500px] inc shadow`}>
        {/* Login form container */}
        <div 
          className={`absolute top-0 h-full transition-all duration-500 ease-in-out w-1/2
            ${isRightPanelActive ? 'translate-x-full opacity-0' : 'opacity-100'}`}
          style={{zIndex: isRightPanelActive ? 1 : 2}}
        >
          <LoginForm projectName="Edunex" />
        </div>

        {/* Register form container */}
        <div 
          className={`absolute top-0 h-full transition-all duration-500 ease-in-out w-1/2
            ${isRightPanelActive ? 'translate-x-full opacity-100' : 'opacity-0'}`}
          style={{zIndex: isRightPanelActive ? 5 : 1}}
        >
          <RegisterForm projectName="Edunex" />
        </div>

        {/* Overlay container */}
        <OverlayPanel 
          isRightPanelActive={isRightPanelActive} 
          togglePanel={togglePanel}
          projectName="Edunex" 
        />
      </div>
    </div>
  );
}

export default Auth;