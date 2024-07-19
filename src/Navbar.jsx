import React from 'react';
import './App.css'; // or create a separate CSS file for Navbar styles

function Navbar({ onGotoClick, onLocationClick }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">StarMap</div>
      <div className="navbar-button-container">
        <button onClick={onGotoClick}>Goto</button>
        <button onClick={onLocationClick}>Location</button>
      </div>
    </nav>
  );
}

export default Navbar;
