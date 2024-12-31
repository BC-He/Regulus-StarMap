import React, { useRef } from 'react';
import useStarMap from './useStarMap.js';

function StarMap() {
  const svgRef = useRef();
  const { dimensions, clickedPoint } = useStarMap(svgRef);

  return (
    <div>
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height}></svg>
      {clickedPoint && (
        <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '10px' }}>
          <h3>Clicked Point</h3>
          <p>RA: {clickedPoint.ra.toFixed(3)} hours</p>
          <p>Dec: {clickedPoint.dec.toFixed(3)} degrees</p>
        </div>
      )}
    </div>
  );
}

export default StarMap;