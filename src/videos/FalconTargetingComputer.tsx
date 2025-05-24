import React, { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';

export interface FalconTargetingComputerProps {
  backgroundColor: string;
  ovalColor: string;
  ovalWidthPixels: number; // Width in pixels
  ovalHeightPixels: number; // Height in pixels
  ovalPositionX: number; // -1 to 1, relative position
  ovalPositionY: number; // -1 to 1, relative position
  ovalThicknessPixels: number; // Thickness of the oval outline in pixels
  ovalRotationDegrees: number; // Camera rotation in degrees to see the depth
  ovalSolidFill: boolean; // Whether to fill the oval with solid background color
  gridSizePixels: number; // Size of each grid in pixels
  gridSpacing: number; // Z-axis distance between front and back grids
  gridThickness: number; // Thickness of grid lines
  gridColor: string; // Color of the grid lines
  animationSpeed: number; // Speed of camera rotation animation
}

export const FalconTargetingComputer: React.FC<FalconTargetingComputerProps> = ({
  backgroundColor,
  ovalColor,
  ovalWidthPixels,
  ovalHeightPixels,
  ovalPositionX,
  ovalPositionY,
  ovalThicknessPixels,
  ovalRotationDegrees,
  ovalSolidFill,
  gridSizePixels,
  gridSpacing,
  gridThickness,
  gridColor,
  animationSpeed,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Store Three.js instances in refs
  const sceneRef = useRef<THREE.Scene | undefined>(undefined);
  const cameraRef = useRef<THREE.PerspectiveCamera | undefined>(undefined);
  const rendererRef = useRef<THREE.WebGLRenderer | undefined>(undefined);
  const ovalRef = useRef<THREE.Mesh | undefined>(undefined);
  const frontGridRef = useRef<THREE.Group | undefined>(undefined);
  const backGridRef = useRef<THREE.Group | undefined>(undefined);

  // Setup effect - runs once to initialize Three.js instances
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5);
    cameraRef.current = camera;

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    // Cleanup on unmount
    return () => {
      if (ovalRef.current) {
        ovalRef.current.geometry.dispose();
        (ovalRef.current.material as THREE.Material).dispose();
      }
      if (frontGridRef.current) {
        frontGridRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            (child.material as THREE.Material).dispose();
          }
        });
      }
      if (backGridRef.current) {
        backGridRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            (child.material as THREE.Material).dispose();
          }
        });
      }
      renderer.dispose();
      scene.clear();
    };
  }, [width, height]);

  // Animation effect - runs every frame
  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    if (!scene || !camera || !renderer) return;

    // Update scene background
    scene.background = new THREE.Color(backgroundColor);

    // Clear previous objects
    scene.clear();

    // Calculate camera position
    const fps = 30;
    const timeInSeconds = frame / fps;
    const oscillationAmplitude = 30;
    const oscillationCenter = 90;
    const oscillationFrequency = animationSpeed / 60;
    const animatedRotationDegrees = oscillationCenter + 
      oscillationAmplitude * Math.sin(2 * Math.PI * timeInSeconds * oscillationFrequency);
    
    const cameraRotationRadians = (animatedRotationDegrees * Math.PI) / 180;
    camera.position.x = Math.sin(cameraRotationRadians) * 5;
    camera.position.z = Math.cos(cameraRotationRadians) * 5;
    camera.lookAt(0, 0, 0);

    // Create oval
    const outerRadiusX = (ovalWidthPixels / Math.min(width, height)) * 2;
    const outerRadiusY = (ovalHeightPixels / Math.min(width, height)) * 2;
    const thicknessUnits = (ovalThicknessPixels / Math.min(width, height)) * 2;

    const ovalGeometry = new THREE.RingGeometry(0.95, 1.0, 64);
    ovalGeometry.scale(outerRadiusX, outerRadiusY, 1);

    const innerRadiusX = outerRadiusX - thicknessUnits;
    const innerRadiusY = outerRadiusY - thicknessUnits;
    const innerScale = Math.min(innerRadiusX / outerRadiusX, innerRadiusY / outerRadiusY);
    
    for (let i = 0; i < ovalGeometry.attributes.position.count; i++) {
      const x = ovalGeometry.attributes.position.getX(i);
      const y = ovalGeometry.attributes.position.getY(i);
      const z = ovalGeometry.attributes.position.getZ(i);
      
      if (Math.sqrt(x * x + y * y) < 0.975) {
        ovalGeometry.attributes.position.setXYZ(i, x * innerScale, y * innerScale, z);
      }
    }
    ovalGeometry.attributes.position.needsUpdate = true;

    const ovalMaterial = new THREE.MeshBasicMaterial({ 
      color: ovalColor,
      side: THREE.DoubleSide,
      transparent: true,
    });

    const ovalMesh = new THREE.Mesh(ovalGeometry, ovalMaterial);
    ovalMesh.position.set(ovalPositionX, ovalPositionY, 0);
    ovalMesh.rotation.y = Math.PI / 2;
    scene.add(ovalMesh);
    ovalRef.current = ovalMesh;

    if (ovalSolidFill) {
      const maskGeometry = new THREE.CircleGeometry(1, 64);
      maskGeometry.scale(innerRadiusX, innerRadiusY, 1);
      
      const maskMaterial = new THREE.MeshBasicMaterial({
        color: backgroundColor,
        side: THREE.DoubleSide,
      });

      const maskMesh = new THREE.Mesh(maskGeometry, maskMaterial);
      maskMesh.position.set(ovalPositionX, ovalPositionY, -0.01);
      maskMesh.rotation.y = Math.PI / 2;
      scene.add(maskMesh);
    }

    // Create grid function
    const createGrid = (zPosition: number) => {
      const gridGroup = new THREE.Group();
      const gridSizeUnits = (gridSizePixels / Math.min(width, height)) * 4;
      const lineThickness = (gridThickness / Math.min(width, height)) * 2;
      
      const gridMaterial = new THREE.MeshBasicMaterial({ 
        color: gridColor,
        transparent: true,
      });
      
      for (let i = 0; i <= 5; i++) {
        const position = (i - 2.5) * (gridSizeUnits / 5);
        
        const verticalGeometry = new THREE.BoxGeometry(lineThickness, gridSizeUnits, lineThickness);
        const verticalLine = new THREE.Mesh(verticalGeometry, gridMaterial);
        verticalLine.position.set(position, 0, 0);
        gridGroup.add(verticalLine);
        
        const horizontalGeometry = new THREE.BoxGeometry(gridSizeUnits, lineThickness, lineThickness);
        const horizontalLine = new THREE.Mesh(horizontalGeometry, gridMaterial);
        horizontalLine.position.set(0, position, 0);
        gridGroup.add(horizontalLine);
      }
      
      gridGroup.position.z = zPosition;
      return gridGroup;
    };

    const actualGridSpacing = gridSpacing / 20;
    const frontGrid = createGrid(actualGridSpacing);
    const backGrid = createGrid(-actualGridSpacing);
    
    scene.add(frontGrid);
    scene.add(backGrid);
    frontGridRef.current = frontGrid;
    backGridRef.current = backGrid;

    // Render
    renderer.render(scene, camera);
  }, [
    frame,
    width,
    height,
    backgroundColor,
    ovalColor,
    ovalWidthPixels,
    ovalHeightPixels,
    ovalPositionX,
    ovalPositionY,
    ovalThicknessPixels,
    ovalRotationDegrees,
    ovalSolidFill,
    gridSizePixels,
    gridSpacing,
    gridThickness,
    gridColor,
    animationSpeed,
  ]);

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />;
};