// hooks/useStarMap.js

import { useState, useEffect, useCallback } from 'react';
import * as d3 from 'd3';
import { starData } from './sao_catalog.js';
import { zoomed, updateAxisLabels } from './StarMapUtils';

function useStarMap(svgRef) {
  const [dimensions, setDimensions] = useState({
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  });
  const [currentRange, setCurrentRange] = useState({ x: [0, 24], y: [-90, 90] });
  const [clickedPoint, setClickedPoint] = useState(null);
  const [nearestStar, setNearestStar] = useState(null);

  useEffect(() => {
    function handleResize() {
      setDimensions({
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const findNearestStar = useCallback((ra, dec) => {
    // Binary search to find the closest RA
    let left = 0;
    let right = starData.length - 1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midRA =
        starData[mid].right_ascension.hours +
        starData[mid].right_ascension.minutes / 60 +
        parseFloat(starData[mid].right_ascension.seconds) / 3600;

      if (midRA < ra) {
        left = mid + 1;
      } else if (midRA > ra) {
        right = mid - 1;
      } else {
        left = mid;
        break;
      }
    }

    // Linear search in a small range around the found index
    const searchRange = 1000; // Adjust this value based on your data distribution
    const start = Math.max(0, left - searchRange);
    const end = Math.min(starData.length - 1, left + searchRange);

    let nearestDistance = Infinity;
    let nearest = null;

    for (let i = start; i <= end; i++) {
      const star = starData[i];
      const starRA =
        star.right_ascension.hours +
        star.right_ascension.minutes / 60 +
        parseFloat(star.right_ascension.seconds) / 3600;
      const starDec =
        star.declination.degrees +
        star.declination.minutes / 60 +
        parseFloat(star.declination.seconds) / 3600;

      const distance = Math.sqrt(
        Math.pow(ra - starRA, 2) + Math.pow(dec - starDec, 2)
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = star;
      }
    }

    return nearest;
  }, []);

  const handleClick = useCallback(
    (event, xScale, yScale, innerWidth, innerHeight, margin, transform) => {
      const svgElement = svgRef.current.getBoundingClientRect();
      const [mouseX, mouseY] = d3.pointer(event);

      // Account for zoom and pan
      const scaledX =
        (mouseX - svgElement.left - margin.left) / transform.k - transform.x / transform.k;
      const scaledY =
        (mouseY - svgElement.top - margin.top) / transform.k - transform.y / transform.k;

      // Check if the click is within bounds
      if (scaledX >= 0 && scaledX <= innerWidth && scaledY >= 0 && scaledY <= innerHeight) {
        const ra = xScale.invert(scaledX);
        const dec = yScale.invert(scaledY);

        if (ra >= 0 && ra <= 24 && dec >= -90 && dec <= 90) {
          setClickedPoint({
            ra: Math.round(ra * 100) / 100,
            dec: Math.round(dec * 100) / 100,
          });

          // Find and set the nearest star
          const nearest = findNearestStar(ra, dec);
          setNearestStar(nearest);
        } else {
          setClickedPoint(null);
          setNearestStar(null);
        }
      } else {
        setClickedPoint(null);
        setNearestStar(null);
      }
    },
    [findNearestStar, svgRef]
  );

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content

    const { width, height } = dimensions;
    const margin = { top: 0, right: 0, bottom: 30, left: 0 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleLinear().domain([0, 24]).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain([-90, 90]).range([innerHeight, 0]);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const zoom = d3.zoom()
      .scaleExtent([1, 10])
      .translateExtent([[0, 0], [innerWidth, innerHeight]])
      .extent([[0, 0], [innerWidth, innerHeight]])
      .on("zoom", (event) => {
        svg.property("currentTransform", event.transform);
        zoomed(event, g, xScale, yScale, innerWidth, innerHeight, setCurrentRange, updateAxisLabels, svg);
      });

    svg.call(zoom);
    svg.property("currentTransform", d3.zoomIdentity);

    svg.on("click", (event) => {
      const transform = svg.property("currentTransform") || d3.zoomIdentity;
      handleClick(event, xScale, yScale, innerWidth, innerHeight, margin, transform);
    });

    // Add X grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(24).tickSize(-innerHeight).tickFormat(""));

    g.append("g")
      .attr("class", "grid")
      .attr("transform", "translate(30, 0)")
      .call(d3.axisLeft(yScale).ticks(18).tickSize(-innerWidth).tickFormat(""));

    // Plot stars
    g.selectAll("circle")
      .data(starData)
      .enter()
      .append("circle")
      .attr("cx", (d) =>
        xScale(d.right_ascension.hours + d.right_ascension.minutes / 60 + parseFloat(d.right_ascension.seconds) / 3600)
      )
      .attr("cy", (d) =>
        yScale(d.declination.degrees + d.declination.minutes / 60 + parseFloat(d.declination.seconds) / 3600)
      )
      .attr("r", (d) => Math.max(1, 6 - d.magnitude) * 0.2)
      .attr("fill", "white");

    // Add labels
    svg.append("text")
      .attr("class", "axis-label x-axis-label")
      .attr("x", width / 2)
      .attr("y", height - margin.bottom * 1.5)
      .attr("text-anchor", "middle")
      .text("RA (hours): 0 - 24");

    svg.append("text")
      .attr("class", "axis-label y-axis-label")
      .attr("x", 10)
      .attr("y", height / 2)
      .attr("text-anchor", "start")
      .attr("transform", `rotate(-90, ${margin.left * 2 + 50}, ${height / 2})`)
      .text("Dec (degrees): -90 - 90");

    // Add axes
    svg.append("g")
      .attr("class", "Xaxis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(24))
      .call((g) => g.selectAll(".tick text").attr("fill", "white"))
      .call((g) => g.selectAll("line,path").attr("stroke", "white"));

    svg.append("g")
      .attr("class", "Yaxis")
      .attr("transform", `translate(${30},${0})`)
      .call(d3.axisLeft(yScale).ticks(18))
      .call((g) => g.selectAll(".tick text").attr("fill", "white"))
      .call((g) => g.selectAll("line,path").attr("stroke", "white"));
  }, [dimensions, handleClick]);

  return { dimensions, currentRange, clickedPoint, nearestStar };
}

export default useStarMap;
