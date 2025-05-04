import { AbsoluteFill } from 'remotion';
import { SpinningStars } from '../videos/SpinningStars';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';

export const SpinningStarsCompSchema = z.object({
  starCount: z.number().default(4000),
  slowStarSpeed: z.number().default(0.001),
  fastStarSpeed: z.number().default(1),
  slowTailLength: z.number().default(0.01),
  fastTailLength: z.number().default(0.2),
  phaseDuration: z.number().default(300),
  transitionDuration: z.number().default(30),
  defaultStarColor: zColor().default('#FFFFFF'),
  fastStarColor: zColor().default('#00FFFF'),
  regenerateStarsEachFrame: z.boolean().default(false),
  rotationSpeed: z.number().min(-100).max(100).default(10),
});

export const SpinningStarsComposition: React.FC<z.infer<typeof SpinningStarsCompSchema>> = ({
  starCount = 4000,
  slowStarSpeed = 0.001,
  fastStarSpeed = 1,
  slowTailLength = 0.01,
  fastTailLength = 0.2,
  phaseDuration = 5,
  transitionDuration = 1,
  defaultStarColor = '#FFFFFF',
  fastStarColor = '#00FFFF',
  regenerateStarsEachFrame = false,
  rotationSpeed = 10,
}) => {
  return (
    <AbsoluteFill>
      <SpinningStars
        starCount={starCount}
        slowStarSpeed={slowStarSpeed}
        fastStarSpeed={fastStarSpeed}
        slowTailLength={slowTailLength}
        fastTailLength={fastTailLength}
        phaseDuration={phaseDuration}
        transitionDuration={transitionDuration}
        defaultStarColor={defaultStarColor}
        fastStarColor={fastStarColor}
        regenerateStarsEachFrame={regenerateStarsEachFrame}
        rotationSpeed={rotationSpeed}
      />
    </AbsoluteFill>
  );
};
