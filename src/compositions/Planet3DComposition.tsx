import { AbsoluteFill } from 'remotion';
import { Planet3D } from '../videos/Planet3D';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';

export const Planet3DCompSchema = z.object({
  planetColor1: zColor().default('#1e90ff'),
  planetColor2: zColor().default('#228b22'),
  moonColor1: zColor().default('#aaaaaa'),
  moonColor2: zColor().default('#888888'),
  planetSize: z.number().min(1).max(100).default(50),
  moonSize: z.number().min(1).max(100).default(27),
  planetTextureSize: z.number().min(64).max(1024).default(256),
  moonTextureSize: z.number().min(32).max(512).default(128),
});

export const Planet3DComposition: React.FC<z.infer<typeof Planet3DCompSchema>> = ({
  planetColor1,
  planetColor2,
  moonColor1,
  moonColor2,
  planetSize,
  moonSize,
  planetTextureSize,
  moonTextureSize,
}) => {
  return (
    <AbsoluteFill>
      <Planet3D
        planetColor1={planetColor1}
        planetColor2={planetColor2}
        moonColor1={moonColor1}
        moonColor2={moonColor2}
        planetSize={planetSize}
        moonSize={moonSize}
        planetTextureSize={planetTextureSize}
        moonTextureSize={moonTextureSize}
      />
    </AbsoluteFill>
  );
};
