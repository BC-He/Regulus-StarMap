import * as d3 from 'd3';

export function zoomed(event, g, xScale, yScale, innerWidth, innerHeight, setCurrentRange, updateAxisLabels, svg) {
  const transform = event.transform;

  // Limit panning within bounds
  const tx = Math.min(0, Math.max(transform.x, innerWidth * (1 - transform.k)));
  const ty = Math.min(0, Math.max(transform.y, innerHeight * (1 - transform.k)));

  // Apply transform to the group element
  g.attr('transform', `translate(${tx},${ty}) scale(${transform.k})`);

  // Adjust visual elements for scaling
  g.selectAll('.tick').attr('font-size', 12 / transform.k);
  g.selectAll('circle').attr('r', d => Math.max(1, 6 - d.magnitude) * 0.2 / transform.k);

  // Calculate new RA/Dec ranges based on transform
  const newXRange = xScale.range()
    .map(d => (d - tx) / transform.k)
    .map(xScale.invert);

  const newYRange = yScale.range()
    .map(d => (d - ty) / transform.k)
    .map(yScale.invert);

  // Update the current range state
  setCurrentRange({ x: newXRange, y: newYRange });

  // Update axis labels for the new range
  updateAxisLabels(newXRange, newYRange, svg, innerWidth, innerHeight);

  // Save the transform for use in other parts (e.g., handleClick)
  svg.property('currentTransform', transform); // Save transform in SVG properties
}

export function updateAxisLabels(xRange, yRange, svg, innerWidth, innerHeight) {
  const xMin = xRange[0];
  const xMax = xRange[1];
  const yMin = yRange[0];
  const yMax = yRange[1];

  svg.select('.x-axis-label')
    .text(`RA (hours): ${xMin.toFixed(3)} - ${xMax.toFixed(3)}`);

  svg.select('.y-axis-label')
    .text(`Dec (degrees): ${yMin.toFixed(3)} - ${yMax.toFixed(3)}`);
  
  const NewxScale = d3.scaleLinear()
    .domain([xMin, xMax])
    .range([0, innerWidth]);
  
  svg.select('.Xaxis')
    .call(d3.axisBottom(NewxScale).ticks(12))
    .call(g => g.selectAll(".tick text")
      .attr("fill", "white")
    )
    .call(g => g.selectAll("line,path")
      .attr("stroke", "white")
    );

  const NewyScale = d3.scaleLinear()
    .domain([yMin, yMax])
    .range([innerHeight, 0]);
  
  svg.select('.Yaxis')
    .call(d3.axisLeft(NewyScale).ticks(10))
    .call(g => g.selectAll(".tick text")
      .attr("fill", "white")
    )
    .call(g => g.selectAll("line,path")
      .attr("stroke", "white")
    );
}