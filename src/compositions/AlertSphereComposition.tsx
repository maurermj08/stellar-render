import { AbsoluteFill } from 'remotion';
import { AlertSphere } from '../videos/AlertSphere';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';

export const alertSphereCompSchema = z.object({
  sphereColor: zColor().default('#00FF00'),
  backgroundColor: zColor().default('#000000'),
  redLabelColor: zColor().default('#FF0000'),
  greenLabelColor: zColor().default('#00FF00'),
  rotationSpeed: z.number().min(1).max(10).default(2),
  sphereSizeRatio: z.number().min(1).max(10).default(4),
  tiltAngle: z.number().min(0).max(90).default(32.5),
  greenMessage1: z.string().default("Spacecraft leaving atmosphere"),
  greenMessage2: z.string().default("Small explosion detected"),
  greenMessage3: z.string().default("Bespin gas leak detected"),
  greenMessage4: z.string().default("Abnormal radio interference"),
  greenMessage5: z.string().default("Outpost communication lost"),
  redMessage1: z.string().default("Outpost alarm activated"),
  redMessage2: z.string().default("Known outlaw sighted"),
  redMessage3: z.string().default("Unauthorized spacecraft detected"),
  redMessage4: z.string().default("Emergency signal received"),
  redMessage5: z.string().default("Significant combat activity detected"),
  useAurekBesh: z.boolean().default(true),
});

export const AlertSphereComposition: React.FC<z.infer<typeof alertSphereCompSchema>> = ({
  sphereColor,
  backgroundColor,
  redLabelColor,
  greenLabelColor,
  rotationSpeed,
  sphereSizeRatio,
  tiltAngle,
  greenMessage1,
  greenMessage2,
  greenMessage3,
  greenMessage4,
  greenMessage5,
  redMessage1,
  redMessage2,
  redMessage3,
  redMessage4,
  redMessage5,
  useAurekBesh,
}) => {
  const greenMessages = [greenMessage1, greenMessage2, greenMessage3, greenMessage4, greenMessage5];
  const redMessages = [redMessage1, redMessage2, redMessage3, redMessage4, redMessage5];

  return (
    <AbsoluteFill className="bg-black items-center justify-center">
      <AlertSphere
        sphereColor={sphereColor}
        backgroundColor={backgroundColor}
        redLabelColor={redLabelColor}
        greenLabelColor={greenLabelColor}
        rotationSpeed={rotationSpeed}
        sphereSizeRatio={sphereSizeRatio}
        tiltAngle={tiltAngle}
        greenMessages={greenMessages}
        redMessages={redMessages}
        useAurekBesh={useAurekBesh}
      />
    </AbsoluteFill>
  );
};
