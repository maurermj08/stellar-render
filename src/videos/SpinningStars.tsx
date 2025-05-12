import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { useCurrentFrame, useVideoConfig, random } from 'remotion';

interface SpinningStarsProps {
  starCount?: number;
  slowStarSpeed?: number;
  fastStarSpeed?: number;
  slowTailLength?: number;
  fastTailLength?: number;
  phaseDuration?: number;
  transitionDuration?: number;
  debug?: boolean;
  regenerateStarsEachFrame?: boolean;
  defaultStarColor?: string;
  fastStarColor?: string;
  rotationSpeed?: number;
}

export const SpinningStars: React.FC<SpinningStarsProps> = ({
  starCount = 4000,
  slowStarSpeed = 0.001,
  fastStarSpeed = 1,
  slowTailLength = 0.01,
  fastTailLength = 0.2,
  phaseDuration = 10,
  transitionDuration = 2,
  debug = false,
  regenerateStarsEachFrame = false,
  defaultStarColor = '#FFFFFF',
  fastStarColor = '#007BFF',
  rotationSpeed = 10,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  // Update generateStar to use Remotion's random function
  const generateStar = useCallback((index: number) => {
    const angle = random(`angle-${index}`) * Math.PI * 2;
    const radius = random(`radius-${index}`) * Math.min(width, height) / 2;
    const willTurnBlue = random(`willTurnBlue-${index}`) < 0.6;
    const blueTransitionSpeed = willTurnBlue ? 0.3 + random(`blueTransitionSpeed-${index}`) * 0.3 : null;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      z: random(`z-${index}`) * 32,
      color: defaultStarColor,
      willTurnBlue,
      blueTransitionSpeed,
    };
  }, [width, height, defaultStarColor]);

  // Initialize stars using useMemo
  const initialStars = useMemo(() => {
    return Array.from({ length: starCount }, (_, index) => generateStar(index));
  }, [starCount, generateStar]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = width / 2;
    const centerY = height / 2;

    const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const elapsed = frame / fps * 1000;
    const cycleDuration = phaseDuration * 2 + transitionDuration * 2;
    const cycleElapsed = elapsed % (cycleDuration * 1000);

    let currentStarSpeed, currentTailLength, currentPhase;
    let isRotationEnabled = false;

    if (cycleElapsed < phaseDuration * 1000) {
      // Slow phase
      currentStarSpeed = slowStarSpeed;
      currentTailLength = slowTailLength;
      currentPhase = "Slow";
      isRotationEnabled = false;
    } else if (cycleElapsed < (phaseDuration + transitionDuration) * 1000) {
      // Slow to Fast transition
      const transitionElapsed = cycleElapsed - phaseDuration * 1000;
      const t = transitionElapsed / (transitionDuration * 1000);
      const easeT = easeInOutQuad(t);
      currentStarSpeed = slowStarSpeed + (fastStarSpeed - slowStarSpeed) * easeT;
      currentTailLength = slowTailLength + (fastTailLength - slowTailLength) * easeT;
      currentPhase = "Ramping Up";
      isRotationEnabled = false;
    } else if (cycleElapsed < (phaseDuration * 2 + transitionDuration) * 1000) {
      // Fast phase
      currentStarSpeed = fastStarSpeed;
      currentTailLength = fastTailLength;
      currentPhase = "Fast";
      isRotationEnabled = true;
    } else {
      // Fast to Slow transition
      const transitionElapsed = cycleElapsed - (phaseDuration * 2 + transitionDuration) * 1000;
      const t = transitionElapsed / (transitionDuration * 1000);
      const easeT = easeInOutQuad(t);
      currentStarSpeed = fastStarSpeed + (slowStarSpeed - fastStarSpeed) * easeT;
      currentTailLength = fastTailLength + (slowTailLength - fastTailLength) * easeT;
      currentPhase = "Ramping Down";
      isRotationEnabled = false; // Disable rotation during ramp down
    }

    // Set black background
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 2;
    const stars = regenerateStarsEachFrame
      ? Array.from({ length: starCount }, generateStar)
      : initialStars;

    const maxRotationSpeed = 10;
    const normalizedRotationSpeed = rotationSpeed / maxRotationSpeed;
    
    // Only apply rotation if it's enabled
    const rotationAngle = isRotationEnabled ? (frame * normalizedRotationSpeed * Math.PI) / 180 : 0;

    stars.forEach((star, index) => {
      let x = star.x / (star.z * 0.001);
      let y = star.y / (star.z * 0.001);

      // Apply rotation only if it's enabled
      if (isRotationEnabled && rotationSpeed !== 0) {
        const rotatedX = x * Math.cos(rotationAngle) - y * Math.sin(rotationAngle);
        const rotatedY = x * Math.sin(rotationAngle) + y * Math.cos(rotationAngle);
        x = rotatedX;
        y = rotatedY;
      }

      let starColor = star.color;
      if (star.willTurnBlue && currentStarSpeed >= (star.blueTransitionSpeed ?? 0)) {
        starColor = fastStarColor;
      }

      ctx.beginPath();
      ctx.moveTo(x + centerX, y + centerY);
      ctx.lineTo(x * (1 + currentTailLength) + centerX, y * (1 + currentTailLength) + centerY);
      ctx.strokeStyle = starColor;
      ctx.globalAlpha = 1 - star.z / 32;
      ctx.stroke();

      if (!regenerateStarsEachFrame) {
        star.z -= currentStarSpeed;
        if (star.z <= 0) {
          Object.assign(star, generateStar(index));
        }
      }
    });

    if (debug) {
      ctx.fillStyle = 'white';
      ctx.font = '14px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`Tail Length: ${currentTailLength.toFixed(3)}`, 10, 10);
      ctx.fillText(`Speed: ${currentStarSpeed.toFixed(3)}`, 10, 30);
      ctx.fillText(`Phase: ${currentPhase}`, 10, 50);
      ctx.fillText(`Elapsed Time: ${(frame / fps).toFixed(2)}s`, 10, 70);
      ctx.fillText(`Phase Duration: ${phaseDuration}s`, 10, 90);
      ctx.fillText(`Transition Duration: ${transitionDuration}s`, 10, 110);
      ctx.fillText(`Rotation Speed: ${normalizedRotationSpeed.toFixed(4)}`, 10, 130);
      ctx.fillText(`Rotation: ${isRotationEnabled ? 'Enabled' : 'Disabled'}`, 10, 150);
      ctx.fillText(`Cycle Progress: ${(cycleElapsed / (cycleDuration * 1000) * 100).toFixed(2)}%`, 10, 170);
    }

  }, [
    frame, width, height, initialStars, slowStarSpeed, fastStarSpeed, 
    slowTailLength, fastTailLength, phaseDuration, transitionDuration, 
    debug, fps, regenerateStarsEachFrame, defaultStarColor, fastStarColor, 
    generateStar, starCount, rotationSpeed
  ]);

  return <canvas ref={canvasRef} width={width} height={height} className="bg-black" />;
};
