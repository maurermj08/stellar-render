import { AbsoluteFill } from 'remotion';
import { SpaceGauges } from '../videos/SpaceGauges';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';

export const SpaceGaugesCompSchema = z.object({
  firstGaugeName: z.string().default("Energy"),
  secondGaugeName: z.string().default("Shields"),
  thirdGaugeName: z.string().default("Thrust"),
  toggleStars: z.boolean().default(true),
  starsSpeed: z.number().min(0).max(10).default(5),
  textColor: zColor().default('#00FFFF'),
  gaugeColor: zColor().default('#00FFFF'),
  criticalColor: zColor().default('#FF0000'),
  cautionColor: zColor().default('#FFFF00'),
  optimalColor: zColor().default('#00FF00'),
});

export const SpaceGaugesComposition: React.FC<z.infer<typeof SpaceGaugesCompSchema>> = ({
  firstGaugeName,
  secondGaugeName,
  thirdGaugeName,
  toggleStars,
  starsSpeed,
  textColor,
  gaugeColor,
  criticalColor,
  cautionColor,
  optimalColor,
}) => {
  return (
    <AbsoluteFill>
      <SpaceGauges
        firstGaugeName={firstGaugeName}
        secondGaugeName={secondGaugeName}
        thirdGaugeName={thirdGaugeName}
        toggleStars={toggleStars}
        starsSpeed={starsSpeed}
        textColor={textColor}
        gaugeColor={gaugeColor}
        criticalColor={criticalColor}
        cautionColor={cautionColor}
        optimalColor={optimalColor}
      />
    </AbsoluteFill>
  );
};
