import { AbsoluteFill } from 'remotion';
import { Model3D } from '../videos/Model3D';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';

export const Model3DCompSchema = z.object({
  modelPath: z.string(),
  modelColor: zColor(),
  rotationSpeed: z.number(),
});

export const Model3DComposition: React.FC<z.infer<typeof Model3DCompSchema>> = ({
  modelPath,
  modelColor,
  rotationSpeed,
}) => {
  return (
    <AbsoluteFill>
      <Model3D
        modelPath={modelPath}
        modelColor={modelColor}
        rotationSpeed={rotationSpeed}
      />
    </AbsoluteFill>
  );
};
