import React from 'react';
// src/components/OverlayPanel.jsx for Edunex project
const OverlayPanel = ({ isRightPanelActive, togglePanel, projectName = "Edunex" }) => {
    return (
      <div 
        className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-500 ease-in-out z-10
          ${isRightPanelActive ? '-translate-x-full' : ''}`}
      >
        <div 
          className={`bg-gradient-to-r from-blue-700 to-blue-500 text-white relative h-full w-[200%]
            transition-transform duration-500 ease-in-out
            ${isRightPanelActive ? 'translate-x-1/2' : 'translate-x-0'}`}
          style={{left: '-100%'}}
        >
          {/* Left Panel - Sign In */}
          <div 
            className={`absolute flex items-center justify-center flex-col p-10 text-center top-0 h-full w-1/2
              transition-transform duration-500 ease-in-out
              ${isRightPanelActive ? 'translate-x-0' : '-translate-x-5'}`}
            style={{left: '0'}}
          >
            <h1 className="text-3xl font-bold mb-2">{projectName}</h1>
            <h2 className="text-xl mb-4">Welcome Back!</h2>
            <p className="text-lg mb-8 font-light">Sign in with your account to access your educational dashboard</p>
            <button 
              className="bg-transparent border-2 border-white py-3 px-10 rounded-full uppercase text-xs tracking-wider font-medium hover:bg-white/10 transition-colors focus:outline-none"
              onClick={togglePanel}
            >
              Sign In
            </button>
          </div>
          
          {/* Right Panel - Sign Up */}
          <div 
            className={`absolute flex items-center justify-center flex-col p-10 text-center top-0 h-full w-1/2
              transition-transform duration-500 ease-in-out
              ${isRightPanelActive ? 'translate-x-5' : 'translate-x-0'}`}
            style={{right: '0'}}
          >
            <h1 className="text-3xl font-bold mb-2">{projectName}</h1>
            <h2 className="text-xl mb-4">Join Our Community</h2>
            <p className="text-lg mb-8 font-light">Register now and start your educational journey with us</p>
            <button 
              className="bg-transparent border-2 border-white py-3 px-10 rounded-full uppercase text-xs tracking-wider font-medium hover:bg-white/10 transition-colors focus:outline-none"
              onClick={togglePanel}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default OverlayPanel;