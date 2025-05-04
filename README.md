# Stellar Videos Render - Remotion Project

This project is an interactive website showcasing a collection of React Remotion video components. Users can browse, customize, and preview videos in real-time.

## Features
- Browse a gallery of 20+ Remotion video components.
- Customize video parameters through an intuitive UI.
- Preview videos in real-time.
- Save and share customized video configurations.

## Tech Stack
- **Frontend Framework**: Vite + React + TypeScript
- **Video Rendering**: React Remotion
- **UI Components**: shadcn/UI (Radix UI)
- **Backend**: Supabase (authentication, storage, and database)

## Prerequisites
- Node.js 23+
- Yarn package manager

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/your-repo/stellar-videos-render.git
cd stellar-videos-render
```

### 2. Install Dependencies
```bash
yarn install
```

### 3. Start the Development Server
```bash
yarn dev
```

The application will be available at `http://localhost:5173`.

### 4. Build for Production
```bash
yarn build
```

### 5. Preview the Production Build
```bash
yarn preview
```

### Run Remotion Studio

```bash
npm run studio
```

## Project Structure
```
stellar-videos-render/
├── src/                # Source code
│   ├── compositions/   # Remotion video compositions
│   ├── components/     # Reusable React components
│   ├── videos/         # Video components
│   ├── pages/          # Application pages (Home, Preview, Customize)
│   ├── lib/            # Utility functions
│   ├── hooks/          # Custom React hooks
│   ├── assets/         # Static assets
│   ├── maps/           # Map related components
│   ├── index.css       # Global styles
│   ├── style.css       # Additional styles
│   ├── compositions.config.ts  # Video composition configurations
│   ├── Root.tsx        # Root component for Remotion
│   ├── RootCLI.tsx     # CLI-specific root component
│   ├── App.tsx         # Main application component
│   └── main.tsx        # Application entry point
├── public/             # Public assets
│   ├── fonts/          # Custom fonts
│   ├── logos/          # Logo assets
│   ├── models/         # 3D models and textures
│   └── sounds/         # Audio files
├── legacy/             # Legacy projects (render-videos, stellar-video-grid)
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite configuration
├── tailwind.config.ts  # Tailwind CSS configuration
└── package.json        # Project metadata and dependencies
```

## Development Tools
- **VS Code Extensions**:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript Vue Plugin
  - GitLens

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request.

## License
This project is licensed under the MIT License.
