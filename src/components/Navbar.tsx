import { Link, useNavigate, useLocation } from "react-router-dom";
import { TokenIcon } from "@/components/icons/TokenIcon";
import { Menu, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import supabase from "@/utils/supabase";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const TitleLogo = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  return (
    <div className="relative w-full h-full">
      {/* SVG Logo */}
      <svg
        ref={svgRef}
        id="Layer_1"
        data-name="Layer 1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 849.17 315.49"
        className="stellar-animated-logo relative z-10"
      >
        <g>
          <g>
            <path d="M8.95,120.3l3.13-17.69h77.43c11.08,0,17.76-6.55,17.76-15.74,0-6.97-4.55-10.59-12.93-10.59h-47.45c-17.19,0-26.99-10.03-26.99-24.1,0-18.39,14.07-33.16,37.51-33.16h74.16l-3.13,17.69H54.27c-9.52,0-15.63,5.99-15.63,14.63,0,6.27,4.12,10.03,11.08,10.03h47.31c17.9,0,27.56,7.8,27.56,23.13,0,19.92-13.21,35.81-38.22,35.81H8.95Z" fill="#ffe169"/>
            <path d="M167.08,120.3l15.06-83.6h-39.21l3.13-17.69h96.47l-3.13,17.69h-39.21l-15.06,83.6h-18.04Z" fill="#ffe169"/>
            <path d="M236.27,120.3l18.19-101.29h92.21l-3.13,17.69h-74.3l-11.93,65.9h74.45l-3.13,17.69h-92.35ZM275.34,76.28l2.7-14.91h57.26l-2.7,14.91h-57.26Z" fill="#ffe169"/>
            <path d="M344.1,120.3l18.19-101.29h18.04l-15.06,83.6h69.47l-3.13,17.69h-87.52Z" fill="#ffe169"/>
            <path d="M444.55,120.3l18.19-101.29h18.04l-15.06,83.6h69.47l-3.13,17.69h-87.52Z" fill="#ffe169"/>
            <path d="M652.68,120.3l-10.94-25.5h-48.87l11.08-14.35h31.68l-16.2-37.9-60.81,77.75h-20.6l76.86-96.97c2.7-3.48,5.83-5.71,9.8-5.71s6.11,2.23,7.67,5.71l42.05,96.97h-21.74Z" fill="#ffe169"/>
            <path d="M781.4,120.3l-21.03-28.14h-38.64l2.7-15.6h43.05c15.63,0,24.01-9.61,24.01-24.52,0-10.17-6.11-15.33-16.76-15.33h-56.26l-15.06,83.6h-17.9l18.19-101.29h74.16c20.46,0,31.68,11.56,31.68,29.82,0,19.92-10.94,34.69-28.13,40.68l25.57,30.79h-25.57Z" fill="#ffe169"/>
          </g>
        </g>
        <g>
          <g>
            <path d="M230.51,146.15h1.66l-72.67,95.47c-.38.39-.64.52-1.02.52s-.64-.13-.77-.52l-39.59-95.47h1.4l39.08,94.56,71.9-94.56Z" fill="#ffe169"/>
            <path d="M231.78,240.84l16.35-94.69h1.28l-16.35,94.69h-1.28Z" fill="#ffe169"/>
            <path d="M255.15,240.84l16.35-94.69h50.06c21.33,0,34.87,15.5,34.87,38.03,0,31.13-23.5,56.66-51.21,56.66h-50.06ZM305.47,239.53c26.82,0,49.68-24.88,49.68-55.09,0-22.66-13.15-36.99-33.84-36.99h-48.79l-15.84,92.09h48.79Z" fill="#ffe169"/>
            <path d="M365.62,240.84l16.35-94.69h77.27l-.25,1.3h-75.99l-15.84,92.09h75.99l-.26,1.3h-77.27ZM387.97,193.17l.13-1.3h59.9l-.13,1.3h-59.9Z" fill="#ffe169"/>
            <path d="M501.25,240.84c-21.07,0-34.61-17.06-34.61-39.86,0-32.04,23.24-54.83,50.96-54.83h21.07c21.71,0,35.12,15.37,35.12,37.9,0,31.26-23.63,56.79-51.47,56.79h-21.07ZM522.58,239.53c26.95,0,49.81-24.88,49.81-55.23,0-22.4-12.9-36.86-33.97-36.86h-21.07c-26.82,0-49.43,22.14-49.43,53.27,0,22.79,13.15,38.81,33.59,38.81h21.07Z" fill="#ffe169"/>
            <path d="M582.85,240.84l.25-1.3h67.56c17.75,0,27.33-12.89,27.33-28.79,0-12.63-6.64-17.58-19.29-17.58h-45.47c-12.77,0-19.92-7.68-19.92-19.15,0-15.24,10.47-27.87,28.1-27.87h65.13l-.25,1.3h-65.14c-16.73,0-26.56,11.98-26.56,26.31,0,11.33,6.77,18.1,18.77,18.1h45.47c13.41,0,20.56,5.86,20.56,18.5,0,16.8-10.22,30.48-28.99,30.48h-67.56Z" fill="#ffe169"/>
          </g>
        </g>
      </svg>
    </div>
  );
};

// const CustomVideoIcon = () => (
//   <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 167.4 173.99">
//     <g>
//       <path d="M92.27,0c-29.13,0-52.72,23.59-52.72,52.73s23.59,52.73,52.72,52.73,52.73-23.59,52.73-52.73S121.4,0,92.27,0M92.27,92.27c-21.81,0-39.54-17.73-39.54-39.54S70.45,13.18,92.27,13.18s39.54,17.73,39.54,39.54-17.73,39.54-39.54,39.54M13.18,52.73c0-17.2,11.01-31.83,26.36-37.24V1.71C16.81,7.58,0,28.14,0,52.73s16.81,45.15,39.54,51.01v-13.77c-15.36-5.4-26.36-20.04-26.36-37.24" fill="#fff"/>
//       <path d="M119.95,125.22l41.31,27.54c1.82,1.21,4.27.71,5.48-1.11.43-.65.66-1.41.66-2.18v-60.86c0-2.18-1.77-3.95-3.96-3.95-.7,0-1.38.19-1.99.54l-41.51,24.21" fill="#fff"/>
//       <rect x="9.23" y="79.09" width="123.9" height="94.9" rx="2.4" ry="2.4" fill="#fff"/>
//       <g>
//         <g>
//           <path d="M22.66,153.58l1.13-8.23h27.91c3.99,0,6.4-3.05,6.4-7.32,0-3.24-1.64-4.93-4.66-4.93h-17.1c-6.2,0-9.73-4.67-9.73-11.21,0-8.56,5.07-15.43,13.52-15.43h26.73l-1.13,8.23h-26.73c-3.43,0-5.63,2.79-5.63,6.81,0,2.92,1.48,4.67,3.99,4.67h17.05c6.45,0,9.93,3.63,9.93,10.76,0,9.27-4.76,16.66-13.77,16.66h-27.91Z" fill="#000000"/>
//         </g>
//         <g>
//           <path d="M71.45,108.51h7.59l11.31,34.72,20.96-34.72h7.15l-26.55,43.15c-.93,1.55-2.06,2.54-3.33,2.54-1.37,0-2.15-.99-2.69-2.54l-14.45-43.15Z" fill="#000000"/>
//         </g>
//       </g>
//     </g>
//   </svg>
// );

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
  tokens: number;
}

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      queryClient.setQueryData(['session'], session);
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const { data: profile } = useQuery<Profile | null>({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, tokens')
        .eq('id', session.user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Get public URL for avatar if it exists
  const avatarUrl = profile?.avatar_url 
    ? supabase.storage
        .from('avatars')
        .getPublicUrl(profile.avatar_url.split('/').pop() || '')
        .data.publicUrl
    : null;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    navigate('/');
  };

  return (
    <>
      <nav className="fixed top-0 inset-x-0 h-16 bg-card/80 backdrop-blur-sm border-b border-primary/10 z-50">
        <div className="container h-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* <div className="w-[30px] mb-2">
            <CustomVideoIcon />
            </div> */}

            <div className="w-[160px] mt-2">
              <Link to="/">
                <TitleLogo />
              </Link>
            </div>
            {/* <Link to="/" className="text-2xl font-bold text-[#FFE169] hover:text-[#FFD700] transition-colors">
              Stellar Videos
            </Link> */}
            <div className="hidden md:flex items-center gap-6">
              <Link 
                to="/" 
                className={`text-lg transition-colors ${
                  location.pathname === '/' 
                    ? 'text-purple-500 font-medium' 
                    : 'hover:text-primary'
                }`}
              >
                Gallery
              </Link>
              {session?.user && (
                <Link 
                  to="/queue" 
                  className={`text-lg transition-colors ${
                    location.pathname === '/queue' 
                      ? 'text-purple-500 font-medium' 
                      : 'hover:text-primary'
                  }`}
                >
                  Queue
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {session?.user ? (
              <div className="hidden md:flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-2 group">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-primary/20 rounded-full group-hover:border-primary/30 transition-colors">
                    <TokenIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">{profile?.tokens || 0}</span>
                  </span>
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg group-hover:bg-primary/30 transition-colors"></div>
                    <Avatar className="w-8 h-8 relative">
                      <AvatarImage src={avatarUrl || undefined} />
                      <AvatarFallback className="bg-primary/30 text-white font-bold lowercase">
                        {session.user.email?.charAt(0) || ""}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="hidden md:block">
                <Link to="/auth">
                  <Button variant="default">Sign In</Button>
                </Link>
              </div>
            )}
            
            <button 
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)} />
          <div className="fixed top-16 inset-x-0 bg-background border-b border-primary/10">
            <div className="flex flex-col p-4 space-y-3">
              <Link 
                to="/" 
                className="px-4 py-2 hover:bg-primary/10 rounded-md transition-colors text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Gallery
              </Link>
              {session?.user && (
                <>
                  <Link 
                    to="/queue" 
                    className="px-4 py-2 hover:bg-primary/10 rounded-md transition-colors text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Queue
                  </Link>
                  <div className="flex flex-col items-center w-full">
                    <Link 
                      to="/profile" 
                      className="px-4 py-2 hover:bg-primary/10 rounded-md transition-colors flex items-center justify-center w-full gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span>Profile</span>
                      <div className="flex items-center gap-1">
                        <TokenIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">{profile?.tokens || 0}</span>
                      </div>
                    </Link>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleSignOut();
                      }}
                      className="px-4 py-2 pt-6 hover:bg-primary/10 rounded-md transition-colors flex items-center justify-center w-full text-left"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
              {!session?.user && (
                <Link 
                  to="/auth" 
                  className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}