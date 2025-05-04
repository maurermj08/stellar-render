import React, { useRef, useEffect, useMemo } from 'react';
import { useCurrentFrame, random } from 'remotion';

interface Star {
  x: number;
  y: number;
  z: number;
}

interface SimpleStarsProps {
  starCount?: number;
  speed?: number;
  starColor?: string;
}

export const SimpleStars: React.FC<SimpleStarsProps> = ({
  starCount = 1000,
  speed = 1,
  starColor = '#FFFFFF',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frame = useCurrentFrame();

  // Initialize stars using Remotion's deterministic random
  const stars = useMemo(() => {
    return Array.from({ length: starCount }, (_, i) => ({
      x: (random(`x-${i}`) - 0.5) * 2000,
      y: (random(`y-${i}`) - 0.5) * 2000,
      z: random(`z-${i}`) * 2000
    }));
  }, [starCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw stars
    stars.forEach((star) => {
      // Move stars closer (decrease z)
      const z = star.z - (frame * speed);
      const modZ = ((z % 2000) + 2000) % 2000; // Loop z position

      // Calculate projection
      const scale = 400 / (400 + modZ);
      const x = (star.x * scale) + centerX;
      const y = (star.y * scale) + centerY;

      // Calculate size and opacity based on z position
      const size = Math.max(0.5, 2 * scale);
      const opacity = Math.min(1, (2000 - modZ) / 1000);

      // Draw star
      ctx.beginPath();
      ctx.fillStyle = starColor;
      ctx.globalAlpha = opacity;
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [frame, stars, speed, starColor]);

  return (
    <div className="w-full h-full bg-black">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
    </div>
  );
}; 