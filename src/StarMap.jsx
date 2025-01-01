import React, { useRef, useEffect } from 'react';
import useStarMap from './useStarMap.js';

function StarMap() {
  const svgRef = useRef();
  const { dimensions, currentRange, clickedPoint, nearestStar } = useStarMap(svgRef);

  useEffect(() => {
    console.log("Clicked Point:", clickedPoint);
    console.log("Nearest Star:", nearestStar);
  }, [clickedPoint, nearestStar]);

  return (
    <div>
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height}></svg>
      {clickedPoint && (
        <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '10px' }}>
          <h3>Clicked Point</h3>
          <p>Nearest Star: SAO{nearestStar.sao_number}</p>
          <p>RA: {clickedPoint.ra.toFixed(3)} hours</p>
          <p>Dec: {clickedPoint.dec.toFixed(3)} degrees</p>
        </div>
      )}
    </div>
  );
}
export default StarMap;