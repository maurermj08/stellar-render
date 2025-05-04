import { AbsoluteFill } from 'remotion';
import { ScifiGrid } from '../videos/ScifiGrid';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';

export const scifiGridSchema = z.object({
  backgroundColor: zColor().default('#000000'),
  gridColor: zColor().default('#0066cc'),
  scanLineColor: zColor().default('#00ccff'),
  animationSpeed: z.number().min(0.1).max(20).default(1),
  gridSpacing: z.number().min(10).max(200).default(50),
  scanAngle: z.number().min(0).max(360).default(0),
  scanLineThickness: z.number().min(1).max(20).default(4),
  scanLineGlow: z.number().min(5).max(50).default(20),
  numberOfLines: z.number().min(1).max(8).default(1),
});

export const ScifiGridComposition: React.FC<z.infer<typeof scifiGridSchema>> = ({
  backgroundColor,
  gridColor,
  scanLineColor,
  animationSpeed,
  gridSpacing,
  scanAngle,
  scanLineThickness,
  scanLineGlow,
  numberOfLines,
}) => {
  return (
    <AbsoluteFill className="bg-black">
      <ScifiGrid
        backgroundColor={backgroundColor}
        gridColor={gridColor}
        scanLineColor={scanLineColor}
        animationSpeed={animationSpeed}
        gridSpacing={gridSpacing}
        scanAngle={scanAngle}
        scanLineThickness={scanLineThickness}
        scanLineGlow={scanLineGlow}
        numberOfLines={numberOfLines}
      />
    </AbsoluteFill>
  );
}; 