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
});

export const Waves3DComposition: React.FC<z.infer<typeof waves3DCompSchema>> = ({
  waveNearColor,
  waveFarColor,
  backgroundColor,
  speed,
  waveHeight,
  waveFrequency,
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
      />
    </AbsoluteFill>
  );
};
