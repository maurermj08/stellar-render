import { AbsoluteFill } from 'remotion';
import { RetroSun, RetroSunSchema } from '../videos/RetroSun';

export const RetroSunCompSchema = RetroSunSchema;

export const RetroSunComposition: React.FC<z.infer<typeof RetroSunCompSchema>> = (props) => {
  return (
    <AbsoluteFill>
      <RetroSun {...props} />
    </AbsoluteFill>
  );
};
