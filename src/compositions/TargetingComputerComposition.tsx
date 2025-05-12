import { AbsoluteFill } from 'remotion';
import { TargetingComputer } from '../videos/TargetingComputer';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';

export const targetingComputerCompSchema = z.object({
  animationSpeed: z.number().int().min(1).max(100).default(80),
  lineGap: z.number().int().min(1).max(100).default(25),
  numberOfLines: z.number().int().min(1).default(12),
  acceleration: z.number().min(1).max(10).default(5),
  lineColor: zColor().default('#ffff00'),
  numberColor: zColor().default('#ff0000'),
  fontSize: z.number().int().min(8).max(128).default(64),
});

export const TargetingComputerComposition: React.FC<z.infer<typeof targetingComputerCompSchema>> = ({
  animationSpeed,
  lineGap,
  numberOfLines,
  acceleration,
  lineColor,
  numberColor,
  fontSize,
}) => {
  return (
    <AbsoluteFill className="bg-gray-100 items-center justify-center">
      <TargetingComputer
        animationSpeed={animationSpeed}
        lineGap={lineGap}
        numberOfLines={numberOfLines}
        // @ts-ignore
        acceleration={acceleration}
        lineColor={lineColor}
        numberColor={numberColor}
        fontSize={fontSize}
      />
    </AbsoluteFill>
  );
};