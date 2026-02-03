import React from 'react';
import DotGrid from './DotGrid';

const AppLayout = ({ children }) => {
  return (
    <div className="global-dot-grid-container">
      {/* Fixed animated background */}
      <div className="dot-grid-fixed-wrapper">
        <DotGrid
          dotSize={5}
          gap={15}
          baseColor="#262626"
          activeColor="#00FF41"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>

      {/* Foreground content */}
      <div className="main-page-content min-h-screen">
        {children}
      </div>
    </div>
  );
};

export default AppLayout;
