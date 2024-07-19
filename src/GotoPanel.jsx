import React from 'react';
import './App.css'; // Ensure this file has the necessary styles

function GotoPanel({ onSetCameraPointing, onCancelSetCameraPointing }) {
  return (
    <div className="location-panel">
      <h2>Set the sky pointing vector.</h2>
      <div className="location-inputs">
        <label>
          Latitude:
          <input type="number" placeholder="Enter latitude" />
        </label>
        <label>
          Longitude:
          <input type="number" placeholder="Enter longitude" />
        </label>
      </div>
      <div className="button-container">
        <button onClick={onSetCameraPointing}>Set</button>
        <button onClick={onCancelSetCameraPointing}>Cancel</button>
      </div>
    </div>
  );
}

export default GotoPanel;
