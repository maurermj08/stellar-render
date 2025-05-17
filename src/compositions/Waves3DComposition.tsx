import { AbsoluteFill } from 'remotion';
import { Waves3D } from '../videos/Waves3D';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';

export const waves3DCompSchema = z.object({
  waveNearColor: zColor().default('#00ffff'),
  waveFarColor: zColor().default('#ff00ff'),
  backgroundColor: zColor().default('#101033'),
  speed: z.number().min(0).max(100).default(10),
  waveHeight: z.number().min(0).max(10).default(2),
  waveFrequency: z.number().min(1).max(10).default(4),
  gridSize: z.number().min(10).max(500).default(140),
  gridDivisions: z.number().min(3).max(201).default(41),
  fogNear: z.number().min(0).max(500).default(10),
  fogFar: z.number().min(0).max(1000).default(90),
  cameraFov: z.number().min(1).max(180).default(40),
  cameraNear: z.number().min(0.01).max(100).default(1),
  cameraFar: z.number().min(1).max(1000).default(100),
  gridSolidFill: z.boolean().default(false),
  valleyDepth: z.number().min(0).max(100).default(10),
  valleyFalloff: z.number().min(0.1).max(10).default(1),
  mountainRandomness: z.number().min(0).max(1).default(0.1),
  mountainSeed: z.number().min(0).max(10000).default(42),
});

export const Waves3DComposition: React.FC<z.infer<typeof waves3DCompSchema>> = ({
  waveNearColor,
  waveFarColor,
  backgroundColor,
  speed,
  waveHeight,
  waveFrequency,
  gridSize,
  gridDivisions,
  fogNear,
  fogFar,
  cameraFov,
  cameraNear,
  cameraFar,
  gridSolidFill,
  valleyDepth,
  valleyFalloff,
  mountainRandomness,
  mountainSeed,
}) => {
  return (
    <AbsoluteFill className="bg-black items-center justify-center">
      <Waves3D
        waveNearColor={waveNearColor}
        waveFarColor={waveFarColor}
        backgroundColor={backgroundColor}
        speed={speed}
        waveHeight={waveHeight}
        waveFrequency={waveFrequency}
        gridSize={gridSize}
        gridDivisions={gridDivisions}
        fogNear={fogNear}
        fogFar={fogFar}
        cameraFov={cameraFov}
        cameraNear={cameraNear}
        cameraFar={cameraFar}
        gridSolidFill={gridSolidFill}
        valleyDepth={valleyDepth}
        valleyFalloff={valleyFalloff}
        mountainRandomness={mountainRandomness}
        mountainSeed={mountainSeed}
      />
    </AbsoluteFill>
  );
};
