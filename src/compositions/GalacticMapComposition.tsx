import { AbsoluteFill } from 'remotion';
import { GalacticMap } from '../videos/GalacticMap';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';

export const GalacticMapCompSchema = z.object({
  messageText: z.string(),
  locationText: z.string(),
  cabinText: z.string(),
  topLettersColor: zColor(),
  primaryColor: zColor(),
  secondaryColor: zColor(),
  keyPriColor: zColor(),
  keySecColor: zColor(),
  planetsColor: zColor(),
  jumpsColor: zColor(),
  pathColor: zColor(),
  routesColor: zColor(),
  regionColor: zColor(),
  altPlanetColor: zColor(),
  graphColor: zColor(),
  smPathColor: zColor(),
  backgroundColor: zColor(),
  regionTextColor: zColor(),
  showCircle: z.boolean(),
  logo: z.enum(['firstorder', 'imperial', 'rebel', 'mandalorian', 'halcyon', 'falcon']),
  changeIntervalInSeconds: z.number(),
  shipName: z.string(),
});

export const GalacticMapComposition: React.FC<z.infer<typeof GalacticMapCompSchema>> = (props) => {
  return (
    <AbsoluteFill>
      <GalacticMap {...props} />
    </AbsoluteFill>
  );
};
