import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Preview } from './pages/Preview';
import { Customize } from './pages/Customize';
import { Queue } from './pages/Queue';
import Auth from './pages/Auth';
import ConfirmEmail from './pages/ConfirmEmail';
import Profile from './pages/Profile';
import ResetPassword from './pages/ResetPassword';
import ChangePassword from './pages/ChangePassword';
import TermsOfService from './pages/TermsOfService';
import { Navbar } from './components/Navbar';
import { registerCompositionsFromConfig } from "./lib/registry";
import { compositions } from "./compositions.config";
import { Toaster } from './components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Footer from './components/Footer';
import { Support } from './pages/Support';

// Register all compositions when the app starts
registerCompositionsFromConfig(compositions);

// Create a client
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background text-foreground antialiased">
          <Navbar />
          <main className="pt-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/preview/:id" element={<Preview />} />
              <Route path="/customize/:id" element={<Customize />} />
              <Route path="/queue" element={<Queue />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/confirm" element={<ConfirmEmail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/support" element={<Support />} />
            </Routes>
          </main>
          <Toaster />
          <Footer />
        </div>
      </Router>
    </QueryClientProvider>
  );
}
