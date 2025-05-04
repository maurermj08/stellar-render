import { Link } from "react-router-dom";
import { TokenIcon } from "@/components/icons/TokenIcon";

const CustomVideoIcon = () => (
  <svg 
    viewBox="0 0 28 28" 
    fill="currentColor"
    className="w-6 h-6 -translate-y-1"
  >
    <path d="M15 4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8m0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6M3 12c0-2.61 1.67-4.83 4-5.65V4.26C3.55 5.15 1 8.27 1 12s2.55 6.85 6 7.74v-2.09c-2.33-.82-4-3.04-4-5.65" />
    <path d="m19.2 23 6.268 4.178a.6.6 0 0 0 .932-.499V17.444a.6.6 0 0 0-.902-.518L19.2 20.6" />
    <rect x="2.4" y="16" width="18.8" height="14.4" rx="2.4" />
  </svg>
);

export function Navbar() {
  return (
    <nav className="fixed top-0 inset-x-0 h-16 bg-card/80 backdrop-blur-sm border-b border-primary/10 z-50">
      <div className="container h-full flex items-center justify-between">
        <div className="flex items-center gap-8">
          <CustomVideoIcon />
          <Link to="/" className="text-2xl font-bold text-primary hover:text-primary-hover transition-colors">
            Stellar Videos
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm hover:text-primary transition-colors">Gallery</Link>
            <Link to="/queue" className="text-sm hover:text-primary transition-colors">Queue</Link>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-card border border-primary/20 rounded-full">
            <TokenIcon className="w-4 h-4" />
            <span className="text-sm font-medium">--</span>
          </div>
          
          <div className="w-8 h-8 rounded-full bg-primary/20"></div>
        </div>
      </div>
    </nav>
  );
}