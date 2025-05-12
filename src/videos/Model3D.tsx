import React, { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig, staticFile } from 'remotion';
import * as THREE from 'three';
// @ts-ignore
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

interface Model3DProps {
  modelPath: string;
  modelColor: string;
  rotationSpeed: number;
}

export const Model3D: React.FC<Model3DProps> = ({
  modelPath = 'models/CoinStand.stl',
  modelColor = '#888888',
  rotationSpeed = 0.1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 16 / 9, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(1920, 1080);
    containerRef.current.appendChild(renderer.domElement);

    // Background
    scene.background = new THREE.Color(0x000000);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Load STL model
    const loader = new STLLoader();
    loader.load(staticFile(modelPath), (geometry) => {
      const material = new THREE.MeshPhongMaterial({
        color: modelColor,
        specular: 0x111111,
        shininess: 200,
        wireframe: true,
      });
      const mesh = new THREE.Mesh(geometry, material);
      
      // Center the model
      geometry.center();
      
      // Scale the model to fit the scene
      const box = new THREE.Box3().setFromObject(mesh);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim;
      mesh.scale.set(scale, scale, scale);

      scene.add(mesh);
      modelRef.current = mesh;
    });

    camera.position.z = 5;

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    return () => {
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [modelPath, modelColor]);

  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current || !modelRef.current) return;

    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const model = modelRef.current;

    // Update animation based on the current frame
    const time = frame / fps;

    // Rotate model
    model.rotation.y = time * rotationSpeed;

    // Render the scene
    renderer.render(scene, camera);
  }, [frame, fps, rotationSpeed]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-black" ref={containerRef}>
      {/* Three.js scene will be rendered here */}
    </div>
  );
};
