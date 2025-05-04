import { AbsoluteFill } from 'remotion';
import { SimpleStars } from '../videos/SimpleStars';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';

export const SimpleStarsSchema = z.object({
  starCount: z.number().int().positive().default(1000),
  speed: z.number().positive().default(1),
  starColor: zColor().default('#FFFFFF'),
});

export const SimpleStarsComposition: React.FC<z.infer<typeof SimpleStarsSchema>> = ({
  starCount = 1000,
  speed = 1,
  starColor = '#FFFFFF',
}) => {
  return (
    <AbsoluteFill>
      <SimpleStars
        starCount={starCount}
        speed={speed}
        starColor={starColor}
      />
    </AbsoluteFill>
  );
}; 

// Export metadata about this composition for the registry
export const metadata = {
  id: 'simple-stars',
  name: 'Simple Stars',
  description: 'A simple animation of stars moving in space',
  component: SimpleStarsComposition,
  durationInFrames: 300,
  fps: 30,
  width: 1920,
  height: 1080,
  schema: SimpleStarsSchema,
  defaultProps: {
    starCount: 2000,
    speed: 2,
    starColor: '#FFFFFF',
  },
  tags: ['space', 'stars', 'background'],
  thumbnailUrl: '/thumbnails/simple_stars.jpg',
  previewVideoUrl: '/previews/simple_stars.mp4',
};