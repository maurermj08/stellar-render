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
  rotationSpeed: number; // Speed of camera rotation animation
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
  rotationSpeed,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);

    // Camera setup - perspective camera for 3D depth perception
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5);
    
    // Calculate animated rotation by combining static rotation and animation
    const fps = 30; // Assuming 30 frames per second, adjust if necessary
    const animatedRotationDegrees = ovalRotationDegrees + (rotationSpeed * frame) / fps;
    const cameraRotationRadians = (animatedRotationDegrees * Math.PI) / 180;
    camera.position.x = Math.sin(cameraRotationRadians) * 5;
    camera.position.z = Math.cos(cameraRotationRadians) * 5;
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true,
      alpha: false
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace; // Ensure consistent color space

    // Convert pixel dimensions to Three.js units
    const ovalWidthUnits = (ovalWidthPixels / width) * 4; // Scale to viewport
    const ovalHeightUnits = (ovalHeightPixels / height) * 4; // Scale to viewport
    const thicknessUnits = (ovalThicknessPixels / Math.min(width, height)) * 2;
    
    // Calculate outer and inner radii for the ring
    const outerRadiusX = ovalWidthUnits / 2;
    const outerRadiusY = ovalHeightUnits / 2;
    const innerRadiusX = Math.max(0.05, outerRadiusX - thicknessUnits); // Min inner radius
    const innerRadiusY = Math.max(0.05, outerRadiusY - thicknessUnits);
    
    // Create the oval outline (ring) - always at Z=0
    const ovalGeometry = new THREE.RingGeometry(0, 1, 64);
    ovalGeometry.scale(outerRadiusX, outerRadiusY, 1);
    
    // Create custom shader material for the ring effect
    const ringVertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const ringFragmentShader = `
      varying vec2 vUv;
      uniform vec3 ovalColor;
      uniform float opacity;
      uniform float innerRadiusX;
      uniform float innerRadiusY;
      
      void main() {
        // Convert UV coordinates to centered coordinates (-1 to 1)
        vec2 centered = (vUv - 0.5) * 2.0;
        
        // Calculate normalized distance for ellipse
        float outerDist = pow(centered.x, 2.0) + pow(centered.y, 2.0);
        float innerDist = pow(centered.x / innerRadiusX, 2.0) + pow(centered.y / innerRadiusY, 2.0);
        
        // Check if point is within outer ellipse but outside inner ellipse
        if (outerDist <= 1.0 && innerDist >= 1.0) {
          gl_FragColor = vec4(ovalColor, opacity);
        } else {
          discard;
        }
      }
    `;

    const ovalMaterial = new THREE.ShaderMaterial({
      vertexShader: ringVertexShader,
      fragmentShader: ringFragmentShader,
      uniforms: {
        ovalColor: { value: new THREE.Color(ovalColor) },
        opacity: { value: 1.0 },
        innerRadiusX: { value: innerRadiusX / outerRadiusX },
        innerRadiusY: { value: innerRadiusY / outerRadiusY },
      },
      transparent: true,
      side: THREE.DoubleSide, // Back to double-sided rendering
    });

    const ovalMesh = new THREE.Mesh(ovalGeometry, ovalMaterial);
    ovalMesh.position.set(ovalPositionX, ovalPositionY, 0);
    ovalMesh.rotation.y = Math.PI / 2;
    scene.add(ovalMesh);

    // Create masking geometry if solid fill is enabled
    if (ovalSolidFill) {
      // Create a solid ellipse geometry for masking
      const maskGeometry = new THREE.CircleGeometry(1, 64);
      maskGeometry.scale(outerRadiusX, outerRadiusY, 1);
      
      // Create material that renders background color and blocks depth
      const maskMaterial = new THREE.MeshBasicMaterial({
        color: backgroundColor,
        transparent: false,
        depthWrite: true,
        depthTest: true,
        side: THREE.DoubleSide, // Back to double-sided rendering
      });

      const maskMesh = new THREE.Mesh(maskGeometry, maskMaterial);
      maskMesh.position.set(ovalPositionX, ovalPositionY, -0.01); // Further behind to avoid z-fighting
      maskMesh.rotation.y = Math.PI / 2;
      maskMesh.renderOrder = -1; // Render before the oval outline
      scene.add(maskMesh);
    }

    // Create grid function - makes a flat 5x5 grid like a piece of paper
    const createGrid = (zPosition: number) => {
      const gridGroup = new THREE.Group();
      
      // Convert grid size from pixels to Three.js units
      const gridSizeUnits = (gridSizePixels / Math.min(width, height)) * 4;
      const lineThickness = (gridThickness / Math.min(width, height)) * 2;
      
      const gridMaterial = new THREE.MeshBasicMaterial({ color: gridColor });
      
      // Create 6 lines for 5x5 grid (0,1,2,3,4,5)
      for (let i = 0; i <= 5; i++) {
        const position = (i - 2.5) * (gridSizeUnits / 5);
        
        // Vertical lines
        const verticalGeometry = new THREE.BoxGeometry(lineThickness, gridSizeUnits, lineThickness);
        const verticalLine = new THREE.Mesh(verticalGeometry, gridMaterial);
        verticalLine.position.set(position, 0, 0);
        gridGroup.add(verticalLine);
        
        // Horizontal lines
        const horizontalGeometry = new THREE.BoxGeometry(gridSizeUnits, lineThickness, lineThickness);
        const horizontalLine = new THREE.Mesh(horizontalGeometry, gridMaterial);
        horizontalLine.position.set(0, position, 0);
        gridGroup.add(horizontalLine);
      }
            
      gridGroup.position.z = zPosition;
      return gridGroup;
    };
    
    // Create front and back grids (pieces of paper)
    // Divide gridSpacing by 20 for finer control (0-100 range becomes 0-5 units)
    const actualGridSpacing = gridSpacing / 20;
    
    const frontGrid = createGrid(actualGridSpacing); // Front paper
    const backGrid = createGrid(-actualGridSpacing); // Back paper
    
    scene.add(frontGrid);
    scene.add(backGrid);

    // Render the scene
    renderer.render(scene, camera);

    // Cleanup
    return () => {
      ovalGeometry.dispose();
      ovalMaterial.dispose();
      renderer.dispose();
    };
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
    rotationSpeed,
  ]);

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />;
};