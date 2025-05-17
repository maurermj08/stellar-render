import { AbsoluteFill } from 'remotion';
import { DeathStar } from '../videos/DeathStar';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';

export const deathStarSchema = z.object({
  color: zColor(),
  darknessFactor: z.number().min(0).max(100),
  rotationSpeed: z.number().min(0).max(100),
  Rainbow: z.boolean().default(true),
});

export const DeathStarComposition: React.FC<z.infer<typeof deathStarSchema>> = ({
  color,
  darknessFactor,
  rotationSpeed,
  Rainbow = true,
}) => {
  return (
    <AbsoluteFill className="bg-gray-100 items-center justify-center">
      <DeathStar
        color={color}
        darknessFactor={darknessFactor}
        rotationSpeed={rotationSpeed}
        Rainbow={Rainbow}
      />
    </AbsoluteFill>
  );
};