import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import starData from './sao_catalog.json'; // Assuming you have the star data in a JSON file

const StarMap = () => {
  const pointsRef = useRef(); 
  const [cameraLonLat, setCameraLonLat] = useState({ lon: 0, lat: 0 });
  // Function to convert RA and Dec to Cartesian coordinates
  const convertToCartesian = (ra, dec, radius) => {
    const raRad = (ra.hours + ra.minutes / 60 + parseFloat(ra.seconds) / 3600) * (Math.PI / 12); // Convert RA to radians
    const decRad = (dec.degrees + dec.minutes / 60) * (Math.PI / 180); // Convert Dec to radians

    const x = radius * Math.cos(decRad) * Math.cos(raRad);
    const y = radius * Math.cos(decRad) * Math.sin(raRad);
    const z = radius * Math.sin(decRad);

    return [x, y, z];
  };
  const stars = useMemo(() => {
    const starArray = new Float32Array(starData.length * 3); // Each star has x, y, z coordinates
    const sizeArray = new Float32Array(starData.length); // Each star has a size
    const radius = 600; // Radius of the sphere

    starData.forEach((star, index) => {
      const [x, y, z] = convertToCartesian(star.right_ascension, star.declination, radius);
      starArray[index * 3] = x;
      starArray[index * 3 + 1] = y;
      starArray[index * 3 + 2] = z;

      // Determine the size based on the magnitude
      let size = 1;
      if (star.magnitude < 0) {
        size = 8;
      } else if (star.magnitude < 5) {
        size = 7;
      } else if (star.magnitude < 10) {
        size = 4;
      } else if (star.magnitude < 20) {
        size = 2;
      }
      sizeArray[index] = size;
    });

    return { starArray, sizeArray };
  }, []);

  useEffect(() => {
    if (pointsRef.current) {
      pointsRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(stars.starArray, 3));
      pointsRef.current.geometry.setAttribute('size', new THREE.BufferAttribute(stars.sizeArray, 1));
    }
  }, [stars]);

  // Function to create grid lines on the sphere
  const createCircularGridLines = () => {
    const radius = 500;
    const segments = 64;
    const lines = [];

    // Create latitude lines
    for (let i = -75; i <= 75; i += 15) {
      const lat = (i * Math.PI) / 180;
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      for (let j = 0; j <= segments; j++) {
        const lon = (j * 2 * Math.PI) / segments;
        const x = radius * Math.cos(lat) * Math.cos(lon);
        const y = radius * Math.cos(lat) * Math.sin(lon);
        const z = radius * Math.sin(lat);
        vertices.push(x, y, z);
      }
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      const material = new THREE.LineBasicMaterial({ color: 0x555555 });
      const line = new THREE.Line(geometry, material);
      lines.push(line);
    }

    // Create longitude lines
    for (let i = 0; i < 360; i += 30) {
      const lon = (i * Math.PI) / 180;
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      for (let j = -90; j <= 90; j++) {
        const lat = (j * Math.PI) / 180;
        const x = radius * Math.cos(lat) * Math.cos(lon);
        const y = radius * Math.cos(lat) * Math.sin(lon);
        const z = radius * Math.sin(lat);
        vertices.push(x, y, z);
      }
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      const material = new THREE.LineBasicMaterial({ color: 0x555555 });
      const line = new THREE.Line(geometry, material);
      lines.push(line);
    }

    return lines;
  };

  // Custom component to handle FOV-based zoom
  const FOVControls = () => {
    const { camera, gl } = useThree();

    useEffect(() => {
      const handleWheel = (event) => {
        event.preventDefault();
        const zoomFactor = 0.96;
        if (event.deltaY < 0) {
          camera.fov = Math.max(12, camera.fov * zoomFactor);
        } else {
          camera.fov = Math.min(75, camera.fov / zoomFactor);
        }
        camera.updateProjectionMatrix();
      };

      gl.domElement.addEventListener('wheel', handleWheel);
      return () => {
        gl.domElement.removeEventListener('wheel', handleWheel);
      };
    }, [camera, gl]);
    useFrame(() => {
      const radius = Math.sqrt(camera.position.x ** 2 + camera.position.y ** 2 + camera.position.z ** 2);
      const lat = Math.asin(camera.position.y / radius) * (180 / Math.PI);
      const lon = Math.atan2(camera.position.x, camera.position.z) * (180 / Math.PI);
      setCameraLonLat({ lon, lat });
    });
    return null;
  };
  return (
    <div className="canvas-container">
      <Canvas camera={{ position: [0, 0, 10], fov: 75, near: 0.01, far: 5000 }}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <points ref={pointsRef}>
          <bufferGeometry />
          <shaderMaterial
            attach="material"
            args={[{
              uniforms: {
                size: { value: 1.0 },
                scale: { value: window.innerHeight / 2 }
              },
              vertexShader: `
                attribute float size;
                varying float vSize;
                void main() {
                  vSize = size;
                  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                  gl_PointSize = max(size * (300.0 / -mvPosition.z), 1.0);
                  gl_Position = projectionMatrix * mvPosition;
                }
              `,
              fragmentShader: `
                void main() {
                  gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
                }
              `,
              transparent: true
            }]}
          />
        </points>
        {createCircularGridLines().map((line, index) => (
          <primitive key={index} object={line} />
        ))}
        <FOVControls />
        <OrbitControls enablePan={true} enableRotate={true} enableZoom={false} />
      </Canvas>
      <div className='parameters'>
        <p className='parameter'>RA: {cameraLonLat.lon.toFixed(2)}°</p>
        <p className='parameter'>Dec: {cameraLonLat.lat.toFixed(2)}°</p>
      </div>
    </div>
  );
};

export default StarMap;