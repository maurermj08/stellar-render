import { VideoCard } from "@/components/VideoCard";
import { getAllCompositions } from "@/compositions/loader";

export function Home() {
  const compositions = getAllCompositions();
  console.log('Loaded compositions:', compositions);

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Video Components</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {compositions.map((composition) => (
          <div key={composition.id} className="aspect-video relative">
            <VideoCard 
              id={composition.id}
              name={composition.name}
              duration={Math.round(composition.durationInFrames / composition.fps)}
              cost={0}
              component={composition.component}
              defaultProps={composition.defaultProps}
            />
          </div>
        ))}
      </div>
    </div>
  );
}