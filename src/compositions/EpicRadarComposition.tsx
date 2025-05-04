import { AbsoluteFill } from 'remotion';
import { EpicRadar } from '../videos/EpicRadar';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';

export const epicRadarCompSchema = z.object({
  backgroundColor: zColor().default('black'),
  radarColor: zColor().default('rgb(255, 0, 0)'),
  terrainDotColor: zColor().default('rgb(255, 0, 0)'),
  radarSpeed: z.number().min(0).max(100).default(10),
  terrainPointCount: z.number().int().positive().default(50),
  terrainMinDistance: z.number().min(0).max(100).default(10),
  terrainMaxDistance: z.number().min(0).max(100).default(90),
  terrainSeed: z.number().int().default(12345),
  terrainPointSize: z.number().min(1).max(10).default(1),
});

export const EpicRadarComposition: React.FC<z.infer<typeof epicRadarCompSchema>> = ({
  backgroundColor,
  radarColor,
  radarSpeed,
  terrainPointCount,
  terrainMinDistance,
  terrainMaxDistance,
  terrainSeed,
  terrainPointSize,
  terrainDotColor,
}) => {
  return (
    <AbsoluteFill className="bg-black">
      <EpicRadar
        backgroundColor={backgroundColor}
        radarColor={radarColor}
        terrainDotColor={terrainDotColor}
        radarSpeed={radarSpeed}
        terrainPointCount={terrainPointCount}
        terrainMinDistance={terrainMinDistance}
        terrainMaxDistance={terrainMaxDistance}
        terrainSeed={terrainSeed} 
        terrainPointSize={terrainPointSize}
      />
    </AbsoluteFill>
  );
};
