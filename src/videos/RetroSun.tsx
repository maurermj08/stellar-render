import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';
import { zColor } from '@remotion/zod-types';

interface RetroSunProps {
  speed: number;
  backgroundColor: string;
  gridColor: string;
  starColor: string;
  sunGradientColor1: string;
  sunGradientColor2: string;
  sunGradientColor3: string;
  numberOfStars: number;
  minStarSize: number;
  maxStarSize: number;
  sunDiameter: number;
  starMovementSpeed: number;
  numberOfMountainPoints: number;
}

const SEED = 42;
const VIDEO_WIDTH = 1920;
const VIDEO_HEIGHT = 600;

// Custom seeded random function
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const randomInRange = (seed: number, min: number, max: number) => {
  return min + seededRandom(seed) * (max - min);
};

const generateMountainPoints = (width: number, height: number, numberOfMountainPoints: number) => {
  const points = [];
  for (let i = 0; i <= numberOfMountainPoints; i++) {
    const x = (i / numberOfMountainPoints) * width;
    const yBase = height * 0.5;
    const yVariation = height * 0.3;
    const middleEffect = Math.sin((i / numberOfMountainPoints) * Math.PI) * height * 0.2;
    const y = yBase - yVariation * seededRandom(SEED + i) + middleEffect;
    points.push([x, y]);
  }
  return points;
};

export const RetroSun: React.FC<RetroSunProps> = ({
  speed,
  backgroundColor,
  gridColor,
  starColor,
  sunGradientColor1,
  sunGradientColor2,
  sunGradientColor3,
  numberOfStars,
  minStarSize,
  maxStarSize,
  sunDiameter,
  starMovementSpeed,
  numberOfMountainPoints,
}) => {
  const frame = useCurrentFrame();

  const stars = useMemo(() => {
    return new Array(numberOfStars).fill(0).map((_, i) => ({
      x: randomInRange(SEED + i * 3, 0, VIDEO_WIDTH),
      y: randomInRange(SEED + i * 3 + 1, 0, VIDEO_HEIGHT), // Limit stars to upper 60% of the screen
      size: randomInRange(SEED + i * 3 + 2, minStarSize, maxStarSize),
    }));
  }, [numberOfStars, minStarSize, maxStarSize]);

  const mountainPoints = useMemo(() => generateMountainPoints(VIDEO_WIDTH, VIDEO_HEIGHT * 0.4, numberOfMountainPoints), [numberOfMountainPoints]);

  // Calculate grid movement based on frame and speed
  const gridOffset = frame * speed;

  // Calculate sun's vertical position
  const sunVerticalPosition = 52.5 + frame * 0.005;

  // Calculate glow pulse
  const glowPulse = Math.sin(frame * 0.1) * 0.6 + 1;

  return (
    <div className="w-full h-full relative" style={{ backgroundColor }}>
      {stars.map((star, index) => {
        // Calculate the star's position relative to the rotation center
        const relativeX = star.x - VIDEO_WIDTH / 2;
        const relativeY = star.y - VIDEO_HEIGHT * 0.2;

        // Calculate the rotation angle based on the current frame
        const angle = frame * 0.0001;

        // Apply rotation to the star's position
        const rotatedX = relativeX * Math.cos(angle) - relativeY * Math.sin(angle);
        const rotatedY = relativeX * Math.sin(angle) + relativeY * Math.cos(angle);

        // Calculate the final position of the star
        const finalX = rotatedX + VIDEO_WIDTH / 2;
        const finalY = rotatedY + VIDEO_HEIGHT * 0.2;

        return (
          <div
            key={index}
            className="absolute rounded-full"
            style={{
              left: finalX,
              top: finalY,
              width: star.size,
              height: star.size,
              opacity: finalY > 0 && finalY < VIDEO_HEIGHT ? 1 : 0, // Hide stars when they go off-screen
              backgroundColor: starColor,
            }}
          />
        );
      })}
      {/* Layer 2: Orange outer glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: sunDiameter * 1.5,
          height: sunDiameter * 1.5,
          top: `${sunVerticalPosition}%`,
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(255,165,0,0.4) 0%, rgba(255,165,0,0) 70%)',
          filter: `blur(30px) opacity(${glowPulse})`,
        }}
      />
      {/* Layer 3: Retro 80s sun with gradient */}
      <div
        className="absolute rounded-full"
        style={{
          width: sunDiameter,
          height: sunDiameter,
          top: `${sunVerticalPosition}%`,
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: `linear-gradient(to bottom, ${sunGradientColor1}, ${sunGradientColor2}, ${sunGradientColor3})`,
        }}
      />
      
      {/* Layer 4: Mountain range */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        style={{ height: '100%'}}
        viewBox={`0 -200 ${VIDEO_WIDTH} ${VIDEO_HEIGHT}`}
        preserveAspectRatio="none"
      >
        <path
          d={`M0,${VIDEO_HEIGHT * 0.4} ${mountainPoints.map(([x, y]) => `L${x},${y}`).join(' ')} L${VIDEO_WIDTH},${VIDEO_HEIGHT * 0.4} Z`}
          fill="#000000"
        />
      </svg>
      
      {/* Layer 5: Black bottom layer with animated purple grid */}
      <div
        className="absolute bottom-0 left-0 right-0 w-full overflow-hidden"
        style={{
          height: '40%',
          backgroundColor: 'black',
          perspective: '1000px',
        }}
      >
        {/* Add pink outer glow */}
        <div
          className="absolute top-0 left-0 right-0 h-20 z-10"
          style={{
            background: 'linear-gradient(to bottom, rgba(255,105,180,0.5) 0%, rgba(255,105,180,0) 100%)',
            filter: 'blur(10px)',
          }}
        />

        <div
          className="w-full h-full relative"
          style={{
            backgroundImage: `
              linear-gradient(to right, ${gridColor} 0px, ${gridColor} 2px, transparent 2px),
              linear-gradient(to bottom, ${gridColor} 0px, ${gridColor} 2px, transparent 2px)
            `,
            backgroundSize: '40px 40px',
            backgroundPosition: `0 ${gridOffset}px`,
            transform: 'rotateX(60deg) scale(4) scaleY(2) translateY(0%)',
            transformOrigin: 'bottom',
          }}
        >
          {/* Fade overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,1) 70%)',
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Update Zod schema
import { z } from 'zod';

export const RetroSunSchema = z.object({
  speed: z.number(),
  backgroundColor: zColor(),
  gridColor: zColor(),
  starColor: zColor(),
  sunGradientColor1: zColor(),
  sunGradientColor2: zColor(),
  sunGradientColor3: zColor(),
  numberOfStars: z.number(),
  minStarSize: z.number(),
  maxStarSize: z.number(),
  sunDiameter: z.number(),
  starMovementSpeed: z.number(),
  numberOfMountainPoints: z.number(),
});
