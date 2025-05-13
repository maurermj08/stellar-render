import { Link, useNavigate, useLocation } from "react-router-dom";
import { TokenIcon } from "@/components/icons/TokenIcon";
import { Menu, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import supabase from "@/utils/supabase";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
            <CustomVideoIcon />
            <Link to="/" className="text-2xl font-bold text-[#FFE169] hover:text-[#FFD700] transition-colors">
              Stellar Videos
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link 
                to="/" 
                className={`text-sm transition-colors ${
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
                  className={`text-sm transition-colors ${
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
                <Link to="/profile" className="flex items-center gap-4 group">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-primary/20 rounded-full group-hover:border-primary/30 transition-colors">
                    <TokenIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">{profile?.tokens || 0}</span>
                  </div>
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
                className="px-4 py-2 hover:bg-primary/10 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Gallery
              </Link>
              {session?.user && (
                <>
                  <Link 
                    to="/queue" 
                    className="px-4 py-2 hover:bg-primary/10 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Queue
                  </Link>
                  <Link 
                    to="/profile" 
                    className="px-4 py-2 hover:bg-primary/10 rounded-md transition-colors flex items-center justify-between"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>Profile</span>
                    <div className="flex items-center gap-1.5">
                      <TokenIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">{profile?.tokens || 0}</span>
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleSignOut();
                    }}
                    className="px-4 py-2 hover:bg-primary/10 rounded-md transition-colors flex items-center text-left w-full"
                  >
                    Sign Out
                  </button>
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