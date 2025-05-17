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

## Database Tables
Only use renders and profiles table for now. DO NOT USE TEMPLATES IT IS DEPRECIATED.

### renders
id	
bigint
number

created_timestamp	
timestamp with time zone
string

finished_timestamp	
timestamp with time zone
string

started_timestamp	
timestamp with time zone
string	

parameters	
json

template
LEGACY DO NOT USE

video
string (the name of the video component)

number	
version	
bigint

number	
uuid	
string	

user_id	
uuid
string

### profiles
id	
uuid
string	

updated_at	
timestamp with time zone
string	

username	
text
string	

full_name	
text
string	

avatar_url	
text
string	

website	
text
string

tokens	
bigint
number



## Project Structure
- Legacy projects location: `/legacy/render-videos` and `/legacy/stellar-video-grid`
- Target Node.js version: 23+
- Package manager: npm

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
- [x] Make pages/Customize.tsx generate the form dynamically using the composition and videos schema
- [x] Make Video components load in dynamically
SEE: https://www.remotion.dev/docs/player/thumbnail
SEE: https://www.remotion.dev/docs/player/player

## Phase 3: Match legacy stellar-video-grid
- [x] Rebuild navigation bar to match /legacy/stellar-video-grid
- [x] Match the original /legacy/stellar-video-grid theming and logos
- [x] Build out place holders for user profile, email, display image (Profile.tsx)
- [x] Build out place holder for page rendering videos (Queue.tsx)

## Phase 4: Supabase Integration (Ignore thumbnails, templates, and preview.mp4 files)
- [x] Configure Supabase client
- [x] Set up authentication
- [x] Use profiles table for user profiles
- [x] Use renders table to create new "render" requests
- [x] Use renders table to populate queue page

## Phase 5: Refinement
- [x] Test rendering action
- [ ] Fix any theme compatibility issues
- [ ] Add more token logic
- [ ] Add error handling
- [ ] Implement responsive design adjustments
- [ ] Add loading states and indicators
- [ ] Each video should have a render cost 
- [x] Remove preview videos
- [ ] There should be no way to add money without paying
- [x] Remove legacy folders
- [ ] Improve read me
- [ ] Clean old tables
- [x] Manually deploy to website
- [ ] Setup automatic deployments
- [ ] Setup dev and main branch
- [ ] Setup dev site with URL
- [ ] Add alternative storage
- [ ] Improve github action to quickly check for videos to render before installing packages

## Phase 6: Beyond
- [ ] Add Google Auth
- [ ] Add facebook Auth
- [ ] Stripe integration
- [ ] Free codes (Enter "youtube" and get 2 tokens)
- [ ] Refund (Request refund, just hard limit until request support)

### Key Information for Future Prompts (DO NOT REMOVE THIS LINE JUST ADD ITEMS BELOW)
- Path aliases have been configured in `tsconfig.json` and `vite.config.ts`.
- Tailwind CSS is set up with the theme and configuration from the legacy `stellar-video-grid` project.
- Core UI components (Button, TokenIcon, VideoCard) have been copied and integrated.
- Basic routing structure includes Home, Preview, and Customize pages.
- Supabase URLs and buckets are hardcoded for now but will need to be parameterized in future phases.

### Non-LLM Goals
- [ ] Clean up existing videos
- [ ] Get to 25 videos
- [ ] Add Stripe integration
- [ ] Add Contact US page
- [ ] Add EULA/Terms of Service
- [ ] Reset password
- [ ] Forget password
- [x] Add Upload Service
- [ ] Create new logo & title
- [ ] Setup script to constantly run