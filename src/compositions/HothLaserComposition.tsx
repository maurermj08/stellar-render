import { AbsoluteFill } from 'remotion';
import { HothLaser } from '../videos/HothLaser';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';

export const HothLaserCompSchema = z.object({
  triangleCount: z.number().int().positive().default(5),
  triangleSize: z.number().positive().default(32),
});

export const HothLaserComposition: React.FC<z.infer<typeof HothLaserCompSchema>> = ({
  triangleCount,
  triangleSize,
}) => {
  return (
    <AbsoluteFill>
      <HothLaser
        triangleCount={triangleCount}
        triangleSize={triangleSize}
      />
    </AbsoluteFill>
  );
};
