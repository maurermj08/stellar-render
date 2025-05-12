import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import supabase from "@/utils/supabase";
import { Upload, Trash2 } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { TokenIcon } from "@/components/icons/TokenIcon";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const tokenPackages = [
  {
    name: "Popular",
    tokens: 40,
    price: 20,
    value: "$0.50 per token",
    isPopular: true,
  },
  {
    name: "Starter",
    tokens: 1,
    price: 2,
    value: "$2.00 per token",
    isPopular: false,
  },
  {
    name: "Basic",
    tokens: 5,
    price: 5,
    value: "$1.00 per token",
    isPopular: false,
  },
];

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [email, setEmail] = useState("");
  const [tokens, setTokens] = useState(0);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('avatar_url, tokens')
      .eq('id', session.user.id)
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Error loading profile",
        description: error.message
      });
      return;
    }

    if (data) {
      if (data.avatar_url) {
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(data.avatar_url.split('/').pop() || '');
        setAvatarUrl(publicUrl);
      } else {
        setAvatarUrl("");
      }
      setTokens(data.tokens || 0);
    }

    setEmail(session.user.email || "");
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const fileExt = file.name.split('.').pop();
      const filePath = `${session.user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: filePath })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating avatar",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      setAvatarUrl("");
      setShowRemoveDialog(false);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: "Success",
        description: "Profile image removed successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error removing profile image",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (packageName: string) => {
    toast({
      title: "Added to Cart",
      description: `${packageName} package has been added to your cart.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 pt-8 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center gap-6 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg"></div>
              <Avatar className="w-32 h-32 relative">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-primary/30 text-white text-4xl font-bold lowercase">
                  {email ? email.charAt(0) : ""}
                </AvatarFallback>
              </Avatar>
              {avatarUrl && (
                <div className="absolute -bottom-2 left-0">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="rounded-full h-8 w-8 shadow-lg hover:shadow-red-500/20"
                    onClick={() => setShowRemoveDialog(true)}
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <div className="absolute -bottom-2 right-0">
                <label 
                  htmlFor="avatar-upload" 
                  className="flex items-center justify-center h-8 w-8 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-lg hover:shadow-primary/20"
                >
                  <Upload className="w-4 h-4 text-white" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">{email}</h1>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 border border-primary/20">
                <TokenIcon className="w-5 h-5 text-primary" />
                <span className="text-lg font-semibold">
                  {tokens} {tokens == 1 ? 'token' : 'tokens'} available
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tokenPackages.map((pkg) => (
              <Card 
                key={pkg.name} 
                className={`flex flex-col transform transition-all duration-300 ${
                  pkg.isPopular 
                    ? 'bg-gradient-to-br from-card to-primary/20 border-primary/30 scale-105 shadow-lg hover:shadow-primary/20' 
                    : 'border-0'
                }`}
              >
                <CardHeader>
                  <h3 className="text-xl font-bold text-center">{pkg.name}</h3>
                  {pkg.isPopular && (
                    <div className="text-center text-sm text-primary mt-2">
                      Most Popular Choice
                    </div>
                  )}
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="text-center space-y-4">
                    <div className="text-3xl font-bold">${pkg.price}</div>
                    <div className="flex items-center justify-center gap-2 text-lg">
                      <TokenIcon className="w-5 h-5 text-primary" />
                      {pkg.tokens} {pkg.tokens == 1 ? 'token' : 'tokens'}
                    </div>
                    <div className="text-sm text-muted-foreground">{pkg.value}</div>
                  </div>
                </CardContent>
                <CardFooter className="pt-6">
                  <Button 
                    className={`w-full ${pkg.isPopular ? 'bg-primary hover:bg-primary/90' : ''}`}
                    onClick={() => handleAddToCart(pkg.name)}
                  >
                    Get {pkg.name} Package
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Profile Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove your profile image? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveAvatar}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Profile;