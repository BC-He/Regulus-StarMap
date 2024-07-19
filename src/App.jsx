import React, { useState } from 'react';
import StarMap from './SkyMap';
import Navbar from './Navbar'; // Import the Navbar component
import LocationPanel from './LocationPanel'; // Import the LocationPanel component
import GotoPanel from './GotoPanel'; // Import the GotoPanel component
import './App.css';

function App() {
  const [isLocationPanelVisible, setIsLocationPanelVisible] = useState(false);
  const [isGotoPanelVisible, setIsGotoPanelVisible] = useState(false);

  const handleLocationButtonClick = () => {
    setIsLocationPanelVisible(true);
  };

  const handleSetLocation = () => {
    setIsLocationPanelVisible(false);
  };

  const handleCancelLocation = () => {
    setIsLocationPanelVisible(false);
  };

  const handleGotoButtonClick = () => {
    setIsGotoPanelVisible(true);
  };

  const handleSetCameraPointing = () => {
    setIsGotoPanelVisible(false);
  };

  const handleCancelSetCameraPointing = () => {
    setIsGotoPanelVisible(false);
  };

  return (
    <div className="App">
      <StarMap />
      <Navbar
        onGotoClick={handleGotoButtonClick}
        onLocationClick={handleLocationButtonClick}
      />
      
      {isLocationPanelVisible && (
        <LocationPanel
          onSetLocation={handleSetLocation}
          onCancelLocation={handleCancelLocation}
        />
      )}

      {isGotoPanelVisible && (
        <GotoPanel
          onSetCameraPointing={handleSetCameraPointing}
          onCancelSetCameraPointing={handleCancelSetCameraPointing}
        />
      )}
    </div>
  );
}

export default App;
