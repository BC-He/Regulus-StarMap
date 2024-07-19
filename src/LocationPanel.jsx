import React from 'react';
import './App.css'; // Ensure this file has the necessary styles

function LocationPanel({ onSetLocation, onCancelLocation }) {
  return (
    <div className="location-panel">
      <h2>Set Observer's Location</h2>
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
        <button onClick={onSetLocation}>Set</button>
        <button onClick={onCancelLocation}>Cancel</button>
      </div>
    </div>
  );
}

export default LocationPanel;
