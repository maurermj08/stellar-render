# Stellar Videos Render - Remotion Project

This project aims to create an interactive website that showcases a collection of React Remotion video components. The core purpose is to allow users to:

Browse a gallery of 20+ existing Remotion video components
Select specific components to customize
Modify input parameters through an intuitive UI
Preview the customized videos in real-time
Save and share their customized video configurations
Do not use server side rendering

The application will be built using:

Vite and React: For the frontend framework
React Remotion: For rendering and customizing video components
Supabase: For authentication, storage, and database functionality
shadcn/UI (Radix UI): For the UI components and theming, leveraging your existing design system

Based on 2 legacy projects under the legacy/render-videos and legacy/stellar-video-grid
* render-videos: contains the existing remotion video components
* stellar-video-grid: an old project that implements 90% of the features and pages needed for this project with high quality formatting

The goal is to join these two old projects into a single mono-repo. I am not longer using lovable so those items can be ignored. Please try to use the stellar-video project styling, pages, and theming whenever possible as they look great. However, changes will be needed to make sure the components work.

## Project Structure
- Legacy projects location: `/legacy/render-videos` and `/legacy/stellar-video-grid`
- Target Node.js version: 23+
- Package manager: yarn

### Core Dependencies
```json
{
  "dependencies": {
    "@remotion/cli": "^4.0.0",
    "@remotion/player": "^4.0.0",
    "@radix-ui/react": "^1.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.0.0"
  },
  "devDependencies": {
    "@types/node": "^18.0.0",
    "@types/react": "^18.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.0.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

### Development Tools
- VS Code Extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript Vue Plugin
  - GitLens

Please update this file to track any and all changes. 

## Phase 1: Project Setup
- [x] Create new Vite project with React and TypeScript
- [x] Copy core UI components and theme from existing project
- [x] Install required dependencies (remotion, supabase, etc.)
- [x] Set up basic routing structure

## Phase 2: Remotion Integration
- [x] Create videos folder structure (moved to src/videos)
- [x] Import existing Remotion components
- [x] Test rendering one component in the app (THIS IS KEY) THIS NEEDS TO USE THE REMOTION PLAYER NOT JUST THE MP4 FILE
- [ ] Make pages/Customize.tsx generate the form dynamically using the composition and videos schema
- [ ] Make Video components load in dynamically
SEE: https://www.remotion.dev/docs/player/thumbnail
SEE: https://www.remotion.dev/docs/player/player

## Phase 3: Component Browser
- [ ] Create grid/list view of available components
- [ ] Build component preview cards with thumbnails
- [ ] Implement component selection logic
- [ ] Add filtering/search functionality
- [ ] Create component detail view

## Phase 4: Parameter Editor
- [ ] Create parameter form components
- [ ] Map Radix UI components to parameter types
- [ ] Build dynamic form generation
- [ ] Implement state management for parameters
- [ ] Create real-time parameter updating

## Phase 5: Preview Player
- [ ] Build customized Remotion player
- [ ] Create playback controls
- [ ] Implement preview quality settings
- [ ] Add frame navigation
- [ ] Create responsive container for player

## Phase 6: Supabase Integration
- [ ] Configure Supabase client
- [ ] Set up authentication
- [ ] Create database schema
- [ ] Implement save/load functionality
- [ ] Add user profiles and preferences

## Phase 7: Refinement
- [ ] Test rendering performance
- [ ] Fix any theme compatibility issues
- [ ] Add error handling
- [ ] Implement responsive design adjustments
- [ ] Add loading states and indicators

### Key Information for Future Prompts (DO NOT REMOVE THIS LINE JUST ADD ITEMS BELOW)
- Path aliases have been configured in `tsconfig.json` and `vite.config.ts`.
- Tailwind CSS is set up with the theme and configuration from the legacy `stellar-video-grid` project.
- Core UI components (Button, TokenIcon, VideoCard) have been copied and integrated.
- Basic routing structure includes Home, Preview, and Customize pages.
- Supabase URLs and buckets are hardcoded for now but will need to be parameterized in future phases.
