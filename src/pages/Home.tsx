import React, { Suspense } from 'react'; // Added Suspense
import { getAllCompositions } from "@/compositions/loader";
import { addSpacesToCamelCase } from "../lib/utils";

const LazyVideoCard = React.lazy(() => 
  import('@/components/VideoCard').then(module => ({ default: module.VideoCard }))
);

export function Home() {
  const compositions = getAllCompositions();

  return (
    <div className="md:container py-8 space-y-8">
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
            <Suspense fallback={<div className="w-full h-full bg-muted animate-pulse rounded-lg"></div>}>
              <LazyVideoCard 
                id={composition.id}
                name={addSpacesToCamelCase(composition.name)}
                duration={Math.round(composition.durationInFrames / composition.fps)}
                cost={composition.renderCost}
                component={composition.component}
                defaultProps={composition.defaultProps}
              />
            </Suspense>
          </div>
        ))}
      </div>
    </div>
  );
}