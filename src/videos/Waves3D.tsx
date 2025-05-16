import React, { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';

export interface Waves3DProps {
  waveNearColor: string;
  waveFarColor: string;
  backgroundColor: string;
  speed: number; // 0-100, divided by 10 for final value
  waveHeight: number;
  waveFrequency: number;
}

export const Waves3D: React.FC<Waves3DProps> = ({
  waveNearColor,
  waveFarColor,
  backgroundColor,
  speed,
  waveHeight,
  waveFrequency,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // === CONFIGURABLE CONSTANTS (adapted from HTML) ===
  const GRID_SIZE = 140;
  const GRID_DIVISIONS = 41; // Keep odd for a center line if needed, or if math assumes it
  const FOG_NEAR = 10;
  const FOG_FAR = 90;
  const CAMERA_POSITION = { x: 0, y: 10, z: 30 };
  const CAMERA_LOOK_AT = { x: 0, y: 0, z: -30 };
  const CAMERA_FOV = 40;
  const CAMERA_NEAR = 1;
  const CAMERA_FAR = 100;
  const GRID_SOLID_FILL = false; // Set to true for solid fill, false for lines
  const VALLEY_DEPTH = 10;
  const VALLEY_FALLOFF = 1;
  const MOUNTAIN_HEIGHT = waveHeight; // Use prop
  const MOUNTAIN_FREQ_X = waveFrequency; // Use prop
  const MOUNTAIN_FREQ_Z = waveFrequency; // Use prop
  const MOUNTAIN_RANDOMNESS = 0.1;
  const MOUNTAIN_SEED = 42;
  const gridSpeed = speed / 10; // Use prop

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const threeWaveNearColor = new THREE.Color(waveNearColor);
    const threeWaveFarColor = new THREE.Color(waveFarColor);
    const threeBackgroundColor = new THREE.Color(backgroundColor);

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = threeBackgroundColor;
    scene.fog = new THREE.Fog(0x000000, FOG_NEAR, FOG_FAR); // HTML fog color is black

    // Camera setup
    const aspect = width / height;
    const camera = new THREE.PerspectiveCamera(CAMERA_FOV, aspect, CAMERA_NEAR, CAMERA_FAR);
    camera.position.set(CAMERA_POSITION.x, CAMERA_POSITION.y, CAMERA_POSITION.z);
    camera.lookAt(CAMERA_LOOK_AT.x, CAMERA_LOOK_AT.y, CAMERA_LOOK_AT.z);

    // Renderer
    // Allow Three.js to handle context creation. Keep antialias and alpha simplified.
    const renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: false, // Keep simplified
      alpha: false      // Keep simplified
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Grid parameters
    const halfSize = GRID_SIZE / 2;
    const step = GRID_SIZE / GRID_DIVISIONS;

    // Pseudo-random function (from HTML)
    function pseudoRandom(x: number, y: number, seed: number): number {
      return Math.abs(Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453) % 1;
    }

    // Generate heights for grid points (common for lines and solid fill)
    const heights: number[][] = [];
    for (let i = 0; i <= GRID_DIVISIONS; i++) {
      heights[i] = [];
      for (let j = 0; j <= GRID_DIVISIONS; j++) {
        const xNorm = i / GRID_DIVISIONS;
        const zNorm = j / GRID_DIVISIONS;
        const base = Math.sin(xNorm * Math.PI * MOUNTAIN_FREQ_X) * Math.sin(zNorm * Math.PI * MOUNTAIN_FREQ_Z);
        const rand = (pseudoRandom(i, j, MOUNTAIN_SEED) - 0.5) * 2 * MOUNTAIN_RANDOMNESS;
        const distFromCenter = Math.abs(xNorm - 0.5) * 2;
        const valley = Math.pow(distFromCenter, VALLEY_FALLOFF) * VALLEY_DEPTH;
        heights[i][j] = (base + rand) * MOUNTAIN_HEIGHT + valley;
      }
    }

    // Custom shader material (common for lines and solid fill)
    const gridVertexShader = `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `;
    const gridFragmentShader = `
      varying vec3 vWorldPosition;
      uniform vec3 uCameraPosition;
      uniform float nearZ; // Relative to camera's local Z axis
      uniform float farZ;  // Relative to camera's local Z axis
      uniform vec3 uColorNear;
      uniform vec3 uColorFar;
      void main() {
        // Calculate distance along camera's view direction (approx)
        // For orthographic view along Z, vWorldPosition.z - uCameraPosition.z is fine.
        // For perspective, true distance to camera plane or point is more complex.
        // The HTML example uses vWorldPosition.z - uCameraPosition.z, assuming camera points along -Z.
        // Our camera looks at (0,0,-30) from (0,10,30), so it's angled.
        // A simpler approach for fog/color based on world Z might be sufficient if camera doesn't move much.
        // Let's stick to the HTML's method for direct porting.
        float zDist = vWorldPosition.z - uCameraPosition.z;


        // nearZ and farZ in the shader are negative values representing distances in front of the camera.
        // Example: nearZ = -10 (10 units in front), farZ = -100 (100 units in front)
        // t should be 0 when zDist is at nearZ, and 1 when zDist is at farZ.
        // If camera.position.z = 30, nearZ_uniform = -10, farZ_uniform = -GRID_SIZE = -140
        // A point at world z = 20 (10 units in front of camera) => zDist = 20 - 30 = -10. t = 0.
        // A point at world z = -110 (140 units in front of camera) => zDist = -110 - 30 = -140. t = 1.
        float t = clamp((zDist - nearZ) / (farZ - nearZ), 0.0, 1.0);

        float brightness = mix(1.0, 0.15, t); // Original brightness
        vec3 color = mix(uColorNear, uColorFar, t);
        gl_FragColor = vec4(color * brightness, 1.0);
      }
    `;
    const gridMaterial = new THREE.ShaderMaterial({
      vertexShader: gridVertexShader,
      fragmentShader: gridFragmentShader,
      uniforms: {
        uCameraPosition: { value: camera.position },
        nearZ: { value: -10.0 }, // Corresponds to FOG_NEAR if camera was at z=0 looking at -Z. Adjusted for camera pos.
        farZ: { value: -GRID_SIZE }, // Corresponds to FOG_FAR.
        uColorNear: { value: threeWaveNearColor },
        uColorFar: { value: threeWaveFarColor },
      },
    });

    const currentFrameDisplacement = frame * gridSpeed;
    const activeObjects: THREE.Object3D[] = [];
    let lineGeometry: THREE.BufferGeometry | null = null;


    if (!GRID_SOLID_FILL) {
      const positions: number[] = [];
      const colors: number[] = []; // Vertex colors, though shader overrides
      const colorFront = new THREE.Color(0xffffff);
      const colorBack = new THREE.Color(0x222233);
      const getColorForZ_lines = (zCoord: number) => {
        const t = (zCoord + halfSize) / GRID_SIZE;
        return colorFront.clone().lerp(colorBack, t);
      };

      for (let i = 0; i <= GRID_DIVISIONS; i++) { // Vertical lines
        for (let j = 0; j < GRID_DIVISIONS; j++) {
          const x = -halfSize + i * step;
          const z1 = -halfSize + j * step;
          const z2 = -halfSize + (j + 1) * step;
          positions.push(x, heights[i][j], z1, x, heights[i][j + 1], z2);
          const c1 = getColorForZ_lines(z1);
          const c2 = getColorForZ_lines(z2);
          colors.push(c1.r, c1.g, c1.b, c2.r, c2.g, c2.b);
        }
      }
      for (let j = 0; j <= GRID_DIVISIONS; j++) { // Horizontal lines
        for (let i = 0; i < GRID_DIVISIONS; i++) {
          const z = -halfSize + j * step;
          const x1 = -halfSize + i * step;
          const x2 = -halfSize + (i + 1) * step;
          positions.push(x1, heights[i][j], z, x2, heights[i + 1][j], z);
          const c1 = getColorForZ_lines(z);
          const c2 = getColorForZ_lines(z); // Same Z for horizontal segment points
          colors.push(c1.r, c1.g, c1.b, c2.r, c2.g, c2.b);
        }
      }
      lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(positions), 3));
      lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(colors), 3));

      const gridLines1 = new THREE.LineSegments(lineGeometry, gridMaterial);
      const gridLines2 = new THREE.LineSegments(lineGeometry, gridMaterial);
      const gridLines3 = new THREE.LineSegments(lineGeometry, gridMaterial);

      const loopZ = (rawZ: number, baseGridSize: number) => {
        // Maps rawZ to a cycle of 3*baseGridSize, centered around 0 effectively.
        // Example range: [-baseGridSize, 2*baseGridSize - epsilon]
        return rawZ - Math.floor((rawZ + baseGridSize) / (3 * baseGridSize)) * (3 * baseGridSize);
      };

      gridLines1.position.z = loopZ(0 + currentFrameDisplacement, GRID_SIZE);
      gridLines2.position.z = loopZ(-GRID_SIZE + currentFrameDisplacement, GRID_SIZE);
      gridLines3.position.z = loopZ(-2 * GRID_SIZE + currentFrameDisplacement, GRID_SIZE);
      
      scene.add(gridLines1, gridLines2, gridLines3);
      activeObjects.push(gridLines1, gridLines2, gridLines3);
    } else { // GRID_SOLID_FILL = true
      let zPosForSolidBlock = 0;
      // Iteratively calculate z position to match stateful HTML logic
      for (let i_frame = 0; i_frame < frame; i_frame++) {
        zPosForSolidBlock += gridSpeed;
        if (zPosForSolidBlock > GRID_SIZE / 2) {
          zPosForSolidBlock -= 3 * GRID_SIZE;
        }
      }

      const cellMeshes: THREE.Mesh[] = [];
      for (let i = 0; i < GRID_DIVISIONS; i++) {
        for (let j = 0; j < GRID_DIVISIONS; j++) {
          const x1 = -halfSize + i * step;
          const x2 = -halfSize + (i + 1) * step;
          const z1_cell = -halfSize + j * step;
          const z2_cell = -halfSize + (j + 1) * step;
          const y11 = heights[i][j];
          const y12 = heights[i][j + 1];
          const y21 = heights[i + 1][j];
          const y22 = heights[i + 1][j + 1];

          const cellGeometry = new THREE.BufferGeometry();
          const cellPositions = new Float32Array([
            x1, y11, z1_cell, x2, y21, z1_cell, x2, y22, z2_cell,
            x1, y11, z1_cell, x2, y22, z2_cell, x1, y12, z2_cell,
          ]);
          cellGeometry.setAttribute('position', new THREE.BufferAttribute(cellPositions, 3));
          const cellMesh = new THREE.Mesh(cellGeometry, gridMaterial);
          cellMesh.position.z = zPosForSolidBlock;
          scene.add(cellMesh);
          cellMeshes.push(cellMesh); // Keep track for disposal
        }
      }
      activeObjects.push(...cellMeshes);
    }

    gridMaterial.uniforms.uCameraPosition.value.copy(camera.position);
    renderer.render(scene, camera);

    return () => {
      activeObjects.forEach(obj => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) {
          obj.geometry.dispose(); // Dispose individual cell geometries or shared line geometry
        }
        scene.remove(obj);
      });
      if (lineGeometry && !GRID_SOLID_FILL) { // Dispose shared line geometry if it was created
         lineGeometry.dispose();
      }
      gridMaterial.dispose();
      renderer.dispose();
    };
  }, [
    frame, width, height, 
    waveNearColor, waveFarColor, backgroundColor, speed, waveHeight, waveFrequency,
    GRID_SIZE, GRID_DIVISIONS, FOG_NEAR, FOG_FAR, CAMERA_POSITION, CAMERA_LOOK_AT, CAMERA_FOV, CAMERA_NEAR, CAMERA_FAR,
    GRID_SOLID_FILL, VALLEY_DEPTH, VALLEY_FALLOFF, MOUNTAIN_RANDOMNESS, MOUNTAIN_SEED, gridSpeed // Include all constants from component scope
  ]);

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />;
};

// Removed useState for dimensions as width/height from useVideoConfig are used directly.
// Constants are part of the dependency array for useEffect to ensure it reruns if they were, hypothetically, changeable.
// pseudoRandom is a pure function, defined inside useEffect for encapsulation or could be outside.
// getColorForZ_lines is also defined inside useEffect as it uses its scoped constants.
