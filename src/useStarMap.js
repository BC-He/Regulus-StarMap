// hooks/useStarMap.js

import { useState, useEffect, useCallback } from 'react';
import * as d3 from 'd3';
import { starData } from './sao_catalog.js';
import { zoomed, updateAxisLabels } from './StarMapUtils';

function useStarMap(svgRef) {
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
    const [currentRange, setCurrentRange] = useState({ x: [0, 24], y: [-90, 90] });
    const [clickedPoint, setClickedPoint] = useState(null);
    useEffect(() => {
      function handleResize() {
        setDimensions({
          width: document.documentElement.clientWidth,//window.innerWidth,
          height: document.documentElement.clientHeight//window.innerHeight
        });
      }
  
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    const handleClick = useCallback((event, xScale, yScale, innerWidth, innerHeight, margin, transform) => {
      const svgElement = svgRef.current.getBoundingClientRect();
      const [mouseX, mouseY] = d3.pointer(event);
    
      // Account for zoom and pan
      const scaledX = (mouseX - svgElement.left - margin.left) / transform.k - transform.x / transform.k;
      const scaledY = (mouseY - svgElement.top - margin.top) / transform.k - transform.y / transform.k;
    
      // Check if the click is within bounds
      if (scaledX >= 0 && scaledX <= innerWidth && scaledY >= 0 && scaledY <= innerHeight) {
        const ra = xScale.invert(scaledX);
        const dec = yScale.invert(scaledY);
    
        if (ra >= 0 && ra <= 24 && dec >= -90 && dec <= 90) {
          setClickedPoint({
            ra: Math.round(ra * 100) / 100,
            dec: Math.round(dec * 100) / 100,
          });
        } else {
          setClickedPoint(null);
        }
      } else {
        setClickedPoint(null);
      }
    }, [svgRef]);


    useEffect(() => {
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove(); // Clear previous content
    
      const { width, height } = dimensions;
      const margin = { top: 0, right: 0, bottom: 30, left: 0 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;
    
      const xScale = d3.scaleLinear()
        .domain([0, 24])
        .range([0, innerWidth]);
    
      const yScale = d3.scaleLinear()
        .domain([-90, 90])
        .range([innerHeight, 0]);
    
      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
      const zoom = d3.zoom()
        .scaleExtent([1, 10])
        .translateExtent([[0, 0], [innerWidth, innerHeight]])
        .extent([[0, 0], [innerWidth, innerHeight]])
        .on('zoom', (event) => {
          // Save transform for click handling
          svg.property('currentTransform', event.transform);
    
          // Call zoomed function
          zoomed(event, g, xScale, yScale, innerWidth, innerHeight, setCurrentRange, updateAxisLabels, svg);
        });
    
      svg.call(zoom);
    
      // Initialize with the identity transform if no zoom has occurred
      svg.property('currentTransform', d3.zoomIdentity);
    
      // Add click handler
      svg.on('click', (event) => {
        const transform = svg.property('currentTransform') || d3.zoomIdentity;
        handleClick(event, xScale, yScale, innerWidth, innerHeight, margin, transform);
      });
    
      // Add X grid lines
      g.append('g')
        .attr('class', 'grid')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale)
          .ticks(24)
          .tickSize(-innerHeight)
          .tickFormat('')
        );
    
        g.append('g')
        .attr('class', 'grid')
        .attr('transform', 'translate(30, 0)') // Moves the Y grid lines 20 pixels to the right
        .call(d3.axisLeft(yScale)
          .ticks(18)
          .tickSize(-innerWidth)
          .tickFormat('')
        );
    
      // Plot stars
      g.selectAll('circle')
        .data(starData)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.right_ascension.hours + d.right_ascension.minutes / 60 + parseFloat(d.right_ascension.seconds) / 3600))
        .attr('cy', d => yScale(d.declination.degrees + d.declination.minutes / 60 + parseFloat(d.declination.seconds) / 3600))
        .attr('r', d => Math.max(1, 6 - d.magnitude) * 0.2)
        .attr('fill', 'white');
    
      // Add labels at the bottom center
      svg.append('text')
        .attr('class', 'axis-label x-axis-label')
        .attr('x', width / 2)
        .attr('y', height - margin.bottom * 1.5)
        .attr('text-anchor', 'middle')
        .text('RA (hours): 0 - 24');
    
        svg.append('text')
        .attr('class', 'axis-label y-axis-label')
        .attr('x', 10) // Keep the original x
        .attr('y', height / 2)
        .attr('text-anchor', 'start')
        .attr('transform', `rotate(-90, ${margin.left * 2 + 50}, ${height / 2})`) // Add 20 to the x-offset in the rotation center
        .text('Dec (degrees): -90 - 90');
    
      // Add X axis
      svg.append('g')
        .attr('class', 'Xaxis')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale).ticks(24))
        .call(g => g.selectAll(".tick text")
          .attr("fill", "white")
        )
        .call(g => g.selectAll("line,path")
          .attr("stroke", "white")
        );
    
      // Add Y axis
      svg.append('g')
        .attr('class', 'Yaxis')
        .attr('transform', `translate(${30},${0})`)
        .call(d3.axisLeft(yScale).ticks(18))
        .call(g => g.selectAll(".tick text")
          .attr("fill", "white")
        )
        .call(g => g.selectAll("line,path")
          .attr("stroke", "white")
        );
    
    }, [dimensions, handleClick]);
    

    return { dimensions, currentRange, clickedPoint };
  }
  
  export default useStarMap;