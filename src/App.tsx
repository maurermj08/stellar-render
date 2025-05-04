import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Preview } from './pages/Preview';
import { Customize } from './pages/Customize';
import { Queue } from './pages/Queue';
import { Navbar } from './components/Navbar';
import { registerCompositionsFromConfig } from "./lib/registry";
import { compositions } from "./compositions.config";

// Register all compositions when the app starts
registerCompositionsFromConfig(compositions);

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground antialiased">
        <Navbar />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/preview/:id" element={<Preview />} />
            <Route path="/customize/:id" element={<Customize />} />
            <Route path="/queue" element={<Queue />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
