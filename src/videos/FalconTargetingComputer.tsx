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
  shipColor: string; // Color of the 3D ship/arrow
  shipIndent: number; // How deep the arrow indent is (0-10)
  shipSpeed: number; // Speed multiplier for ship movement (0.1 to 5.0)
  shipSize: number; // Size multiplier for ship (0.1 to 2.0)
  maxShips: number; // Number of ships to display (0-10)
  speedVariation: number; // Speed variation percentage (0-50)
  shipSizeVariation: number; // Ship size variation percentage (0-50)
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
  shipColor,
  shipIndent,
  shipSpeed,
  shipSize,
  maxShips,
  speedVariation,
  shipSizeVariation,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Store Three.js instances in refs
  const sceneRef = useRef<THREE.Scene | undefined>(undefined);
  const shipSceneRef = useRef<THREE.Scene | undefined>(undefined);
  const cameraRef = useRef<THREE.PerspectiveCamera | undefined>(undefined);
  const shipCameraRef = useRef<THREE.PerspectiveCamera | undefined>(undefined);
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

    // Initialize separate ship scene
    const shipScene = new THREE.Scene();
    shipSceneRef.current = shipScene;

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5);
    cameraRef.current = camera;

    // Initialize separate ship camera (stationary)
    const shipCamera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    shipCamera.position.set(0, 0, 5);
    shipCameraRef.current = shipCamera;

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
    const shipScene = shipSceneRef.current;
    const camera = cameraRef.current;
    const shipCamera = shipCameraRef.current;
    const renderer = rendererRef.current;
    if (!scene || !shipScene || !camera || !shipCamera || !renderer) return;

    // Update scene backgrounds
    scene.background = new THREE.Color(backgroundColor);
    shipScene.background = new THREE.Color(backgroundColor);

    // Clear previous objects
    scene.clear();
    shipScene.clear();

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

    // Create 3D Ships (arrow heads) in separate scene - flying animation
    for (let shipIndex = 0; shipIndex < maxShips; shipIndex++) {
      const shape = new THREE.Shape();
      // Convert shipIndent from 0-10 range to 0-1 range
      const normalizedIndent = shipIndent / 10;
      // Create arrow head shape oriented horizontally (nose pointing right)
      shape.moveTo(1, 0); // Point (front) - now pointing right
      shape.lineTo(-1, -0.5); // Left back corner
      shape.lineTo(-1 + normalizedIndent, -0.1); // Left side of indent
      shape.lineTo(-1 + normalizedIndent * 0.5, 0); // Center of indent (deeper)
      shape.lineTo(-1 + normalizedIndent, 0.1); // Right side of indent
      shape.lineTo(-1, 0.5); // Right back corner
      shape.lineTo(1, 0); // Back to point (close the shape)

      // Use ShapeGeometry instead of ExtrudeGeometry to make it flat (no tail)
      const shipGeometry = new THREE.ShapeGeometry(shape);
      const shipMaterial = new THREE.MeshBasicMaterial({ color: shipColor, side: THREE.DoubleSide });
      
      const shipMesh = new THREE.Mesh(shipGeometry, shipMaterial);
      
      // Calculate individual ship speed with variation
      const shipVariationSeed = shipIndex * 789.123; // Unique seed per ship for consistent variation
      const shipVariationRandom = Math.abs((Math.sin(shipVariationSeed * 12.9898) * 43758.5453) % 1);
      const speedVariationRange = (speedVariation / 100) * shipSpeed; // Convert percentage to actual range
      const minSpeed = shipSpeed - speedVariationRange;
      const maxSpeed = shipSpeed + speedVariationRange;
      const individualShipSpeed = minSpeed + (shipVariationRandom * (maxSpeed - minSpeed));
      
      // Calculate individual ship size with variation
      const shipSizeVariationRandom = Math.abs((Math.sin(shipVariationSeed * 78.233) * 43758.5453) % 1);
      const sizeVariationRange = (shipSizeVariation / 100) * shipSize; // Convert percentage to actual range
      const minSize = shipSize - sizeVariationRange;
      const maxSize = shipSize + sizeVariationRange;
      const individualShipSize = minSize + (shipSizeVariationRandom * (maxSize - minSize));
      
      // Ship flight animation parameters - use shipIndex to offset timing and seed
      const baseFlightDuration = 600; // base frames (20 seconds at 30fps)
      const shipFlightDuration = Math.round(baseFlightDuration / individualShipSpeed); // Use individual speed
      const offsetFrame = frame + (shipIndex * Math.floor(shipFlightDuration / maxShips)); // Offset each ship's timing
      const shipCycleFrame = offsetFrame % shipFlightDuration;
      const shipProgress = shipCycleFrame / shipFlightDuration;
      
      // Random seed based on cycle and ship index to get consistent random movement per cycle per ship
      const cycleSeed = Math.floor(offsetFrame / shipFlightDuration) + shipIndex * 1000;
      const random1 = Math.abs((Math.sin(cycleSeed * 12.9898) * 43758.5453) % 1);
      const random2 = Math.abs((Math.sin(cycleSeed * 78.233) * 43758.5453) % 1);
      const random3 = Math.abs((Math.sin(cycleSeed * 35.456) * 43758.5453) % 1);
      const random4 = Math.abs((Math.sin(cycleSeed * 93.127) * 43758.5453) % 1);
      
      // Randomly choose direction: left-to-right or right-to-left
      const goingLeftToRight =  (cycleSeed % 2) === 0; // Simple alternating pattern
      
      // Start and end positions (off-screen)
      let startX, startY, endX, endY;
      
      if (goingLeftToRight) {
        // Left to right movement
        startX = -18 + random1 * 2; // Random start between -20 and -18
        endX = 18 + random3 * 2;   // Random end between 18 and 20
      } else {
        // Right to left movement
        startX = 18 + random1 * 2;  // Random start between 18 and 20
        endX = -18 + random3 * 2;   // Random end between -20 and -18
      }
      
      startY = -6 + random2 * 12; // Random Y between -6 and 6
      endY = -6 + random1 * 12;   // Different random Y for end (wider range)
      
      // Linear interpolation for position
      const shipX = startX + (endX - startX) * shipProgress;
      const shipY = startY + (endY - startY) * shipProgress;
      const shipZ = -3 - random2 * 2; // Random depth between -3 and -5
      
      // Tilting animation on X-axis (like a ship banking/rolling)
      const tiltAmplitude = 0.3; // Maximum tilt in radians
      const tiltFrequency = 2 + random3 * 3; // Random frequency between 2-5
      const shipTiltX = Math.sin(shipProgress * Math.PI * 2 * tiltFrequency) * tiltAmplitude;
      
      // Direction-based rotation - point (front) faces direction of travel
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const shipDirectionZ = Math.atan2(deltaY, deltaX); // Rotation around Z-axis for 2D movement
      
      shipMesh.position.set(shipX, shipY, shipZ);
      shipMesh.rotation.set(shipTiltX, 0, shipDirectionZ); // Apply direction to Z rotation
      shipMesh.scale.set(0.4 * individualShipSize, 0.4 * individualShipSize, 0.4 * individualShipSize); // Apply individual size
      shipScene.add(shipMesh);
    }

    // Render
    renderer.render(shipScene, shipCamera);
    
    // Then render main scene on top with transparent background
    renderer.autoClear = false;
    scene.background = null;
    renderer.render(scene, camera);
    renderer.autoClear = true;
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
    shipColor,
    shipIndent,
    shipSpeed,
    shipSize,
    maxShips,
    speedVariation,
    shipSizeVariation,
  ]);

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />;
};