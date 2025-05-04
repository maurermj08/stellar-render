import { AbsoluteFill } from 'remotion';
import { SpaceSpiral } from '../videos/SpaceSpiral';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';

export const SpaceSpiralSchema = z.object({
  turns: z.number().int().positive().default(42),
  height: z.number().positive().default(20),
  radius: z.number().positive().default(3),
  segments: z.number().int().positive().default(800),
  spiralColor: zColor().default('#FFFF00'),
  starCount: z.number().int().positive().default(100),
  minStarSize: z.number().positive().default(0.5),
  maxStarSize: z.number().positive().default(1.0),
  zoomLevel: z.number().positive().default(7),
  spiralRotation: z.number().default(270),
  screenRotation: z.number().default(60),
  screenRotationSpeed: z.number().default(12),
  seed: z.number().int().default(0),
});

export const SpaceSpiralComposition: React.FC<z.infer<typeof SpaceSpiralSchema>> = ({
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
  return (
    <AbsoluteFill>
      <SpaceSpiral
        turns={turns}
        height={height}
        radius={radius}
        segments={segments}
        spiralColor={spiralColor}
        starCount={starCount}
        minStarSize={minStarSize}
        maxStarSize={maxStarSize}
        zoomLevel={zoomLevel}
        spiralRotation={spiralRotation}
        screenRotation={screenRotation}
        screenRotationSpeed={screenRotationSpeed}
        seed={seed}
      />
    </AbsoluteFill>
  );
};