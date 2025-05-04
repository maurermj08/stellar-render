import { AbsoluteFill } from 'remotion';
import { DonutShield } from '../videos/DonutShield';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';

export const donutShieldCompSchema = z.object({
  donutRotationSpeed: z.number().min(0).max(100).default(10),
  message1: z.string().default("Quantum flux stabilizers online"),
  message2: z.string().default("Tachyon particle harmonics nominal"),
  message3: z.string().default("Subspace field integrity at 98.7%"),
  message4: z.string().default("Neutrino dampeners functioning optimally"),
  donutColor: zColor().default('#0f0'),
  innerCircleColor: zColor().default('hsl(180, 100%, 50%)'),
  middleCircleColor: zColor().default('hsl(200, 100%, 50%)'),
  outerCircleColor: zColor().default('hsl(220, 100%, 50%)'),
  textColor: zColor().default('#0f0'),
});

export const DonutShieldComposition: React.FC<z.infer<typeof donutShieldCompSchema>> = ({
  donutRotationSpeed,
  message1,
  message2,
  message3,
  message4,
  donutColor,
  innerCircleColor,
  middleCircleColor,
  outerCircleColor,
  textColor,
}) => {
  return (
    <AbsoluteFill className="bg-black items-center justify-center">
      <DonutShield
        donutRotationSpeed={donutRotationSpeed}
        message1={message1}
        message2={message2}
        message3={message3}
        message4={message4}
        donutColor={donutColor}
        innerCircleColor={innerCircleColor}
        middleCircleColor={middleCircleColor}
        outerCircleColor={outerCircleColor}
        textColor={textColor}
      />
    </AbsoluteFill>
  );
};