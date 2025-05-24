import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import supabase from "@/utils/supabase";
import { Upload, Trash2, LockKeyhole } from "lucide-react";
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

const subscriptionTiers = [
  {
    name: "Early Free Tier",
    price: "Always Free",
    monthlyTokens: 10,
    storageDuration: "7-day storage",
    storageCapacity: "200MB storage capacity",
    features: ["Standard rendering queue"],
    isEarlyBird: true,
    buttonText: "Current Plan", // Or "Get Started" if not default
  },
  {
    name: "Pro Tier",
    price: "$3.99/month",
    monthlyTokens: 20,
    storageDuration: "90-day storage",
    storageCapacity: "2GB storage capacity",
    features: [
      "Early access to new templates",
      "Pro Discord community",
      "Priority rendering queue",
      "Unused tokens roll over (max 40 tokens)",
    ],
    isEarlyBird: false,
    buttonText: "Choose Pro",
  },
  {
    name: "Max Tier",
    price: "$9.99/month",
    monthlyTokens: 100,
    storageDuration: "Unlimited storage duration",
    storageCapacity: "20GB storage capacity",
    features: [
      "Early access + beta features",
      "Pro Discord community",
      "Priority rendering queue",
      "Roadmap input & feature voting",
      "Direct developer access",
      "Unused tokens roll over (max 200 tokens)",
    ],
    isEarlyBird: false,
    buttonText: "Choose Max",
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

    // Load profile data (avatar_url only)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      toast({
        variant: "destructive",
        title: "Error loading profile",
        description: profileError.message
      });
      return;
    }

    // Load account data (tokens)
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .select('tokens')
      .eq('user_id', session.user.id)
      .single();

    if (accountError) {
      toast({
        variant: "destructive",
        title: "Error loading account",
        description: accountError.message
      });
      return;
    }

    if (profileData) {
      if (profileData.avatar_url) {
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(profileData.avatar_url.split('/').pop() || '');
        setAvatarUrl(publicUrl);
        // Cache avatar in localStorage
        if (session?.user?.id && publicUrl) {
          localStorage.setItem(`avatarUrl_${session.user.id}`, publicUrl);
        }
      } else {
        setAvatarUrl("");
        // Remove avatar from localStorage
        if (session?.user?.id) {
          localStorage.removeItem(`avatarUrl_${session.user.id}`);
        }
      }
    }

    if (accountData) {
      setTokens(accountData.tokens || 0);
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
      // Update avatar cache
      if (session?.user?.id && publicUrl) {
        localStorage.setItem(`avatarUrl_${session.user.id}`, publicUrl);
      }
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['account'] });
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
      // Remove avatar from cache
      if (session?.user?.id) {
        localStorage.removeItem(`avatarUrl_${session.user.id}`);
      }
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

  const handleChoosePlan = (planName: string) => {
    toast({
      title: "Plan Selected",
      description: `You've selected the ${planName}. Please proceed to checkout.`, // Placeholder
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
                    aria-label="Remove profile picture"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <div className="absolute -bottom-2 right-0">
                <label
                  htmlFor="avatar-upload"
                  className="flex items-center justify-center h-8 w-8 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-lg hover:shadow-primary/20"
                  aria-label="Upload profile picture"
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
              <div className="mt-3">
                <Link
                  to="/change-password"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 hover:underline"
                  aria-label="Change your account password"
                >
                  <LockKeyhole className="w-4 h-4" />
                  Change Password
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subscriptionTiers.map((tier) => (
              <div className="relative" key={tier.name}>
                <Card
                  className={`flex flex-col transform transition-all duration-300 ${
                    tier.name === "Free Tier" ? 'border-muted' : 'border-0'
                  }`}
                >
                  <CardHeader>
                    <h3 className="text-xl font-bold text-center">{tier.name}</h3>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="text-center space-y-2 mb-4">
                      <div className="text-3xl font-bold">{tier.price}</div>
                      <div className="flex items-center justify-center gap-2 text-lg">
                        <TokenIcon className="w-5 h-5 text-primary" />
                        {tier.monthlyTokens} tokens monthly
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>{tier.storageDuration}</li>
                      <li>{tier.storageCapacity}</li>
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 mt-0.5 h-4 w-4 text-primary flex-shrink-0"><path d="M20 6L9 17l-5-5"/></svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-6">
                    <Button
                      className={`w-full ${tier.name === "Free Tier" ? 'bg-muted hover:bg-muted/90 text-muted-foreground' : 'bg-primary hover:bg-primary/90'}`}
                      onClick={tier.name === "Free Tier" ? undefined : () => handleChoosePlan(tier.name)}
                      aria-label={`Choose ${tier.name} plan`}
                      disabled={tier.name !== "Free Tier"}
                    >
                      {tier.name === "Free Tier" ? tier.buttonText : 'Coming Soon'}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
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