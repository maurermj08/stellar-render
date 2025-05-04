import { VideoCard } from "@/components/VideoCard";
import { getAllCompositions } from "@/compositions/loader";

const addSpacesToCamelCase = (text: string) => {
  return text.replace(/([A-Z])/g, ' $1').trim();
};

export function Home() {
  const compositions = getAllCompositions();

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Gallery</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {compositions.length} videos available
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {compositions.map((composition) => (
          <div key={composition.id} className="aspect-video relative">
            <VideoCard 
              id={composition.id}
              name={addSpacesToCamelCase(composition.name)}
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