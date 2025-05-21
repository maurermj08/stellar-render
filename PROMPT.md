# Guide to Creating New Remotion Videos

This document outlines the steps and best practices for creating new Remotion video compositions within this project.

## 1. File Structure

For each new video, you'll typically create two main files:

1.  **Video Component**: Lives in `src/videos/`. Example: `src/videos/MyNewVideo.tsx`.
    *   This component contains the actual Remotion animation logic using `AbsoluteFill`, `Sequence`, `Audio`, `Img`, Three.js, etc.
2.  **Composition Component**: Lives in `src/compositions/`. Example: `src/compositions/MyNewVideoComposition.tsx`.
    *   This component defines the schema for the video's parameters using Zod and wraps the Video Component, passing the props to it.

## 2. Creating the Video Component (`src/videos/MyNewVideo.tsx`)

*   **Props**: Define an interface for the props your video component will accept. These props will be controlled by the Zod schema in the composition file.
*   **Remotion Hooks**:
    *   `useCurrentFrame()`: Essential for animations. Always use the `frame` constant from this hook to drive your animations. Remotion renders videos across multiple threads, so relying on `Date.now()` or other non-deterministic methods will lead to inconsistent results.
    *   `useVideoConfig()`: Provides `width`, `height`, `fps`, `durationInFrames`.
    *   `random()`: If you need randomness, use Remotion's `random()` function. You can seed it (e.g., `random(frame)` or `random('my-seed' + frame)`) to ensure deterministic randomness that is consistent across renders.
*   **Example Structure**:

```tsx
// src/videos/MyNewVideo.tsx
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
// import { random } from 'remotion'; // If you need randomness

export interface MyNewVideoProps {
  mainText: string;
  textColor: string;
  speed: number;
  // ... other props
}

export const MyNewVideo: React.FC<MyNewVideoProps> = ({
  mainText,
  textColor,
  speed,
  // ... other props
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Example animation based on frame and speed prop
  const opacity = Math.min(1, (frame * speed) / fps);

  return (
    <AbsoluteFill style={{ backgroundColor: 'white' }}>
      <div
        style={{
          color: textColor,
          fontSize: '50px',
          textAlign: 'center',
          opacity,
        }}
      >
        {mainText} - Frame: {frame}
      </div>
    </AbsoluteFill>
  );
};
```

## 3. Creating the Composition Component (`src/compositions/MyNewVideoComposition.tsx`)

*   **Zod Schema**:
    *   Define a Zod schema for all configurable parameters of your video.
    *   **Naming Convention for Colors**: Any parameter representing a color **must** end with the word "Color" (e.g., `backgroundColor`, `primaryTextColor`). This allows the customization UI to automatically render a color picker for these fields.
    *   **Parameter Strategy**: It's good practice to define a comprehensive set of parameters in the Zod schema that *could* be customized (e.g., animation timings, specific coordinates, font sizes, complex color palettes). However, you'll later specify a smaller subset of these as `editableFields` for the user-facing customization form.
    *   Use `zColor()` from `@remotion/zod-types` for color parameters.
    *   Provide sensible `default()` values for all parameters.
*   **React Component**:
    *   This component will import your Video Component.
    *   It accepts props that match the Zod schema (`z.infer<typeof yourSchema>`).
    *   It renders your Video Component, passing down the props.
*   **Example Structure**:

```tsx
// src/compositions/MyNewVideoComposition.tsx
import { AbsoluteFill } from 'remotion';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types'; // For color parameters
import { MyNewVideo, MyNewVideoProps } from '../videos/MyNewVideo'; // Import your video component

// Define the Zod schema for parameters
export const myNewVideoCompSchema = z.object({
  mainText: z.string().default('Hello World!'),
  textColor: zColor().default('#000000'),       // Ends with "Color"
  backgroundColor: zColor().default('#FFFFFF'), // Ends with "Color"
  speed: z.number().min(0.1).max(10).default(1),
  // Add more parameters as needed
  // fontSize: z.number().min(10).max(200).default(50), // Example of a parameter not initially editable
});

// Define the composition component
export const MyNewVideoComposition: React.FC<z.infer<typeof myNewVideoCompSchema>> = (props) => {
  return (
    <AbsoluteFill> {/* Or any other layout structure you need */}
      <MyNewVideo {...props} />
    </AbsoluteFill>
  );
};
```

## 4. Registering the Composition (`src/compositions.config.ts`)

After creating your video and composition files, you need to register the new composition so it's available in the application.

*   Open `src/compositions.config.ts`.
*   Import your new composition component and its Zod schema.
*   Add a new entry to the `compositions` object.
    *   `id`: A unique identifier for your composition (usually camelCase or kebab-case version of the name).
    *   `name`: A user-friendly name for the composition.
    *   `component`: The composition component you created (e.g., `MyNewVideoComposition`).
    *   `schema`: The Zod schema you defined (e.g., `myNewVideoCompSchema`).
    *   `durationInFrames`, `fps`, `width`, `height`: Standard Remotion video properties.
    *   `defaultProps`: Provide default values. You can often spread the defaults from your Zod schema or define them explicitly.
    *   `editableFields`: An array of strings, where each string is a key from your Zod schema. **Only these fields will be shown in the customization UI.**
        *   **Recommendation**: Start by making the most common and impactful parameters editable, such as primary colors, main text, and animation speed. You can always add more later. This keeps the UI cleaner.
*   **Example Entry**:

```typescript
// src/compositions.config.ts
// ... other imports
import { MyNewVideoComposition, myNewVideoCompSchema } from './compositions/MyNewVideoComposition'; // Adjust path

export const compositions = {
  // ... other compositions
  myNewVideo: { // This is the 'id'
    name: 'My New Awesome Video', // User-friendly name
    component: MyNewVideoComposition,
    schema: myNewVideoCompSchema,
    durationInFrames: 300, // e.g., 10 seconds at 30 FPS
    fps: 30,
    width: 1920,
    height: 1080,
    defaultProps: {
      mainText: 'Welcome!',
      textColor: '#1E90FF', // DodgerBlue
      backgroundColor: '#F0F8FF', // AliceBlue
      speed: 1,
      // fontSize: 60, // If you had this in schema and want a specific default
    },
    editableFields: [
      'mainText',
      'textColor',
      'backgroundColor',
      'speed',
    ], // Only these will be shown in the UI
  },
};
```

## 5. Remotion Configuration (`remotion.config.ts`)

Generally, you won't need to modify `remotion.config.ts` for each new video unless you are introducing new webpack configurations or global settings. The existing setup should cover most needs.

*   `Config.setVideoImageFormat('jpeg');`
*   `Config.setOverwriteOutput(true);`
*   `Config.setDelayRenderTimeoutInMilliseconds(600000);` (Useful for longer renders)
*   `Config.overrideWebpackConfig(webpackOverride);` (Handled by `src/webpack-override.ts`)
*   `Config.setChromiumOpenGlRenderer('angle');` (Attempts hardware acceleration)

Ensure these settings are appropriate for your project's needs.

## Summary of Key Practices:

*   **Zod for Parameters**: Strictly use Zod for defining all input parameters and their default values.
*   **Color Naming**: Ensure parameters intended for color inputs end with "Color" (e.g., `primaryColor`).
*   **`useCurrentFrame`**: Always use `frame` from this hook for animations to ensure render consistency.
*   **`random()` for Randomness**: Use Remotion's `random()` for deterministic random values.
*   **`editableFields`**: Be selective about which parameters are exposed in the UI via `editableFields` in `compositions.config.ts`. Start with the most impactful ones.
*   **Constants as Parameters**: Lean towards defining potentially configurable values (like animation durations, specific asset URLs if they could change, sizes, etc.) as parameters in your Zod schema. Even if not initially editable, this makes future customization easier.

By following these guidelines, you can efficiently create new, customizable Remotion videos that integrate well with the existing project structure.
