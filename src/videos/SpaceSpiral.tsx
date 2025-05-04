import React, { useRef, useEffect, useMemo } from 'react';
import { useCurrentFrame, random } from 'remotion';
import * as THREE from 'three';

interface SpaceSpiralProps {
  turns?: number;
  height?: number;
  radius?: number;
  segments?: number;
  spiralColor?: string;
  starCount?: number;
  minStarSize?: number;
  maxStarSize?: number;
  zoomLevel?: number;
  spiralRotation?: number;
  screenRotation?: number;
  screenRotationSpeed?: number;
  seed?: number;
}

export const SpaceSpiral: React.FC<SpaceSpiralProps> = ({
  turns = 42,
  height = 20,
  radius = 3,
  segments = 800,
  spiralColor = '#FFFF00',
  starCount = 100,
  minStarSize = 0.5,
  maxStarSize = 1.0,
  zoomLevel = 7,
  spiralRotation = 270,
  screenRotation = 60,
  screenRotationSpeed = 12,
  seed = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const spiralRef = useRef<THREE.Line | null>(null);
  const starCanvasRef = useRef<HTMLCanvasElement>(null);
  const frame = useCurrentFrame();
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Generate deterministic star positions using Remotion's random
  const stars = useMemo(() => {
    return Array.from({ length: starCount }, (_, i) => ({
      x: random(`star-x-${i}-${seed}`) * 100,
      y: random(`star-y-${i}-${seed}`) * 100,
      size: random(`star-size-${i}-${seed}`) * (maxStarSize - minStarSize) + minStarSize,
      opacity: random(`star-opacity-${i}-${seed}`) * 0.5 + 0.5,
    }));
  }, [starCount, minStarSize, maxStarSize, seed]);

  // Handle window resize
  const handleResize = () => {
    if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();

    rendererRef.current.setSize(width, height);

    // Update star canvas size
    if (starCanvasRef.current) {
      starCanvasRef.current.width = width;
      starCanvasRef.current.height = height;

      // Redraw stars
      const ctx = starCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
        stars.forEach((star) => {
          const x = star.x * (width / 100);
          const y = star.y * (height / 100);
          ctx.beginPath();
          ctx.arc(x, y, star.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
          ctx.fill();
        });
      }
    }
  };

  // Setup and handle stars canvas
  useEffect(() => {
    const starCanvas = starCanvasRef.current;
    if (!starCanvas || !containerRef.current) return;

    handleResize();
  }, [stars]);

  // Setup and handle Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up any existing scene
    if (rendererRef.current && containerRef.current.contains(rendererRef.current.domElement)) {
      containerRef.current.removeChild(rendererRef.current.domElement);
    }

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);

    // Insert renderer before star canvas to ensure proper layering
    if (starCanvasRef.current) {
      containerRef.current.insertBefore(renderer.domElement, starCanvasRef.current);
    } else {
      containerRef.current.appendChild(renderer.domElement);
    }

    // Style the renderer canvas for proper positioning
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    // Apply screen rotation
    scene.rotation.z = THREE.MathUtils.degToRad(screenRotation);

    // Spiral geometry
    const spiralGeometry = new THREE.BufferGeometry();
    const points = [];

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * turns * Math.PI * 2;
      const y = (i / segments) * height - height / 2;
      const radiusVariation = Math.sin((i / segments) * Math.PI * 2) * 0.5;
      const x = Math.cos(angle) * (radius + radiusVariation);
      const z = Math.sin(angle) * (radius + radiusVariation);
      points.push(new THREE.Vector3(x, y, z));
    }

    spiralGeometry.setFromPoints(points);

    const material = new THREE.LineBasicMaterial({ color: spiralColor });
    const spiral = new THREE.Line(spiralGeometry, material);
    scene.add(spiral);

    // Set camera position and spiral rotation
    camera.position.z = zoomLevel;
    spiral.rotation.x = THREE.MathUtils.degToRad(spiralRotation);

    // Store refs
    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;
    spiralRef.current = spiral;

    // Setup resize observer
    resizeObserverRef.current = new ResizeObserver(handleResize);
    resizeObserverRef.current.observe(containerRef.current);

    // Cleanup
    return () => {
      resizeObserverRef.current?.disconnect();
      renderer.dispose();
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [turns, height, radius, segments, spiralColor, zoomLevel, spiralRotation, screenRotation]);

  // Handle animation
  useEffect(() => {
    if (!sceneRef.current || !rendererRef.current || !cameraRef.current || !spiralRef.current) return;

    // Update spiral rotation
    spiralRef.current.rotation.y = frame * 0.01;

    // Update screen rotation
    sceneRef.current.rotation.z = THREE.MathUtils.degToRad(screenRotation + (frame * screenRotationSpeed));

    // Render
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }, [frame, screenRotationSpeed]);

  return (
    <div ref={containerRef} className="w-full h-full bg-black relative">
      <canvas
        ref={starCanvasRef}
        className="absolute top-0 left-0 w-full h-full"
        style={{ zIndex: 1 }}
      />
    </div>
  );
};