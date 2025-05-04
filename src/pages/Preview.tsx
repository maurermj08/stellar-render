import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getComponent } from '@/lib/registry';
import { Player } from '@remotion/player';

export function Preview() {
  const { id } = useParams();
  
  const composition = id ? getComponent(id) : null;
  
  if (!composition) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-6">Video Not Found</h1>
          <Link to="/">
            <Button variant="default" size="lg">
              Back to Gallery
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Video Preview</h1>
        <div className="aspect-video bg-card rounded-lg mb-6">
          <Player
            component={composition.component}
            durationInFrames={composition.durationInFrames}
            fps={composition.fps}
            compositionWidth={composition.width}
            compositionHeight={composition.height}
            inputProps={composition.defaultProps}
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        </div>
        <div className="flex gap-4">
          <Link to={`/customize/${id}`}>
            <Button variant="default" size="lg">
              Customize
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" size="lg">
              Back to Gallery
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}