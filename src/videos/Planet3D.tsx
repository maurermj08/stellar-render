import React, { useRef, useEffect, useMemo } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';

interface Planet3DProps {
  planetColor1: string;
  planetColor2: string;
  moonColor1: string;
  moonColor2: string;
  planetSize: number;
  moonSize: number;
  planetTextureSize: number;
  moonTextureSize: number;
}

export const Planet3D: React.FC<Planet3DProps> = ({
  planetColor1,
  planetColor2,
  moonColor1,
  moonColor2,
  planetSize,
  moonSize,
  planetTextureSize,
  moonTextureSize,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Scale sizes
  const scaledPlanetSize = useMemo(() => 0.1 + (planetSize - 1) * (2.9 / 99), [planetSize]);
  const scaledMoonSize = useMemo(() => 0.1 + (moonSize - 1) * (2.9 / 99), [moonSize]);

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

    // Earth-like sphere
    const sphereGeometry = new THREE.SphereGeometry(scaledPlanetSize, 64, 64);
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      specular: 0x555555,
      shininess: 30,
      bumpScale: 0.05,
      displacementScale: 0.06,
    });

    // Create a simple procedural texture for the Earth-like appearance
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = planetTextureSize;
    const ctx = canvas.getContext('2d')!;

    // Create a gradient background
    const gradient = ctx.createRadialGradient(
      planetTextureSize / 2, planetTextureSize / 2, 0,
      planetTextureSize / 2, planetTextureSize / 2, planetTextureSize / 2
    );
    gradient.addColorStop(0, planetColor1);
    gradient.addColorStop(1, planetColor2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, planetTextureSize, planetTextureSize);

    // Add some noise for a more detailed look
    for (let i = 0; i < planetTextureSize * 5; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? planetColor1 : planetColor2;
      ctx.fillRect(
        Math.random() * planetTextureSize,
        Math.random() * planetTextureSize,
        2,
        2
      );
    }

    const texture = new THREE.CanvasTexture(canvas);
    sphereMaterial.map = texture;
    sphereMaterial.bumpMap = texture;
    sphereMaterial.displacementMap = texture;

    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.name = 'earth';
    scene.add(sphere);

    // Set a higher renderOrder for the sphere
    sphere.renderOrder = 1;

    // Moon
    const moonGeometry = new THREE.SphereGeometry(scaledMoonSize, 32, 32);
    const moonMaterial = new THREE.MeshPhongMaterial({
      color: 0xaaaaaa,
      specular: 0x333333,
      shininess: 5,
      bumpScale: 0.002,
      displacementScale: 0.002,
    });

    // Create a simple procedural texture for the moon
    const moonCanvas = document.createElement('canvas');
    moonCanvas.width = moonCanvas.height = moonTextureSize;
    const moonCtx = moonCanvas.getContext('2d')!;

    // Create a gradient background for the moon
    const moonGradient = moonCtx.createRadialGradient(
      moonTextureSize / 2, moonTextureSize / 2, 0,
      moonTextureSize / 2, moonTextureSize / 2, moonTextureSize / 2
    );
    moonGradient.addColorStop(0, moonColor1);
    moonGradient.addColorStop(1, moonColor2);
    moonCtx.fillStyle = moonGradient;
    moonCtx.fillRect(0, 0, moonTextureSize, moonTextureSize);

    // Add some noise for a more detailed look
    for (let i = 0; i < moonTextureSize * 5; i++) {
      moonCtx.fillStyle = Math.random() > 0.5 ? moonColor1 : moonColor2;
      moonCtx.fillRect(
        Math.random() * moonTextureSize,
        Math.random() * moonTextureSize,
        1,
        1
      );
    }

    const moonTexture = new THREE.CanvasTexture(moonCanvas);
    moonMaterial.map = moonTexture;
    moonMaterial.bumpMap = moonTexture;
    moonMaterial.displacementMap = moonTexture;

    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.name = 'moon';
    scene.add(moon);

    // Moon orbit
    const moonOrbit = new THREE.Object3D();
    moonOrbit.name = 'moonOrbit';
    moonOrbit.add(moon);
    scene.add(moonOrbit);
    moon.position.set(3 * scaledPlanetSize, 0, 0);

    // Particles (stars)
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCnt = 5000;
    const posArray = new Float32Array(particlesCnt * 3);
    for (let i = 0; i < particlesCnt * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 20;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.005,
      color: 0xffffff,
      depthWrite: false,
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    particlesMesh.name = 'stars';
    scene.add(particlesMesh);

    // Set a lower renderOrder for the particles
    particlesMesh.renderOrder = 0;

    // Ships
    const shipCount = 7;
    const shipMaterials = [
      new THREE.MeshBasicMaterial({ color: 0x333333 }),
      new THREE.MeshBasicMaterial({ color: 0x444444 }),
      new THREE.MeshBasicMaterial({ color: 0x555555 }),
    ];

    function createShipGeometry() {
      const bodyGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.03, 8);
      const noseGeometry = new THREE.SphereGeometry(0.01, 8, 8);
      
      const body = new THREE.Mesh(bodyGeometry);
      const nose = new THREE.Mesh(noseGeometry);
      
      nose.position.y = 0.015;
      
      const shipGeometry = new THREE.Group();
      shipGeometry.add(body);
      shipGeometry.add(nose);
      
      return shipGeometry;
    }

    for (let i = 0; i < shipCount; i++) {
      const shipGeometry = createShipGeometry();
      const shipMaterial = shipMaterials[Math.floor(Math.random() * shipMaterials.length)];
      shipGeometry.children.forEach(part => (part as THREE.Mesh).material = shipMaterial);
      
      const radius = 2 + Math.random() * 3;
      const angle = Math.random() * Math.PI * 2;
      shipGeometry.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 2,
        Math.sin(angle) * radius
      );
      shipGeometry.lookAt(0, 0, 0);
      shipGeometry.rotateX(Math.PI / 2);
      shipGeometry.name = `ship${i + 1}`;
      shipGeometry.userData = {
        speed: 0.001 + Math.random() * 0.002,
        angle: angle,
        radius: radius,
        direction: Math.random() < 0.5 ? 1 : -1,
      };
      scene.add(shipGeometry);
    }

    camera.position.z = 5;

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    return () => {
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [planetColor1, planetColor2, moonColor1, moonColor2, scaledPlanetSize, scaledMoonSize, planetTextureSize, moonTextureSize]);

  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;

    // Update animations based on the current frame
    const time = frame / fps;

    // Rotate sphere
    const sphere = scene.getObjectByName('earth') as THREE.Mesh;
    if (sphere) {
      sphere.rotation.y = time * 0.1;
    }

    // Rotate and orbit moon
    const moonOrbit = scene.getObjectByName('moonOrbit') as THREE.Object3D;
    const moon = scene.getObjectByName('moon') as THREE.Mesh;
    if (moonOrbit && moon) {
      moon.rotation.y = time * 0.5;
      moonOrbit.rotation.y = time * 0.5;
    }

    // Rotate particles
    const particlesMesh = scene.getObjectByName('stars') as THREE.Points;
    if (particlesMesh) {
      particlesMesh.rotation.x = time * 0.02;
      particlesMesh.rotation.y = time * 0.02;
    }

    // Animate ships
    scene.children.forEach((child) => {
      if (child.name.startsWith('ship')) {
        const ship = child as THREE.Group;
        const shipData = ship.userData as {
          speed: number;
          angle: number;
          radius: number;
          direction: number;
        };

        shipData.angle += shipData.speed * shipData.direction * time;
        const newRadius = shipData.radius + shipData.speed * 0.1 * shipData.direction * time;
        ship.position.x = Math.cos(shipData.angle) * newRadius;
        ship.position.z = Math.sin(shipData.angle) * newRadius;
        ship.lookAt(0, ship.position.y, 0);

        if (newRadius > 8 || newRadius < 1.5) {
          shipData.direction *= -1;
          shipData.radius = shipData.direction > 0 ? 1.5 : 8;
        } else {
          shipData.radius = newRadius;
        }
      }
    });

    // Render the scene
    renderer.render(scene, camera);
  }, [frame, fps]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-black" ref={containerRef}>
      {/* Three.js scene will be rendered here */}
    </div>
  );
};