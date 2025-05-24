import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import supabase from "@/utils/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (password !== confirmPassword) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Passwords do not match",
        });
        return;
      }
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: email.split("@")[0],
            avatar_url: "",
          },
        },
      });

      if (signUpError) throw signUpError;

      setSignUpSuccess(true);
      toast({
        title: "Success!",
        description: "Please check your email to verify your account.",
      });

      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      navigate("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your email address",
      });
      return;
    }
    
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Password reset email sent",
        description: "Check your email for a password reset link",
      });
      
      setEmail("");
      setActiveTab("signin");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-200px)]">
      <div className="flex justify-center pt-12 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome to Stellar Videos</CardTitle>
            <CardDescription>Sign in or create a new account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                <TabsTrigger value="reset">Reset</TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    required
                  />
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Loading..." : "Sign In"}
                  </Button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setActiveTab("reset")}
                      className="text-sm text-blue-600 hover:underline mt-2"
                    >
                      Forgot your password?
                    </button>
                  </div>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                {signUpSuccess ? (
                  <div className="text-center space-y-4 py-8">
                    <div className="text-green-600 text-lg font-semibold">
                      ✓ Account Created Successfully!
                    </div>
                    <div className="text-gray-600">
                      We've sent a verification email to your inbox. Please check your email and click the verification link to complete your registration and start creating amazing video!
                    </div>
                    <div className="text-sm text-gray-500">
                      Didn't receive the email? Check your spam folder or{" "}
                      <button
                        onClick={() => setSignUpSuccess(false)}
                        className="text-blue-600 hover:underline"
                      >
                        try signing up again
                      </button>
                      .
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                      required
                    />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      required
                    />
                    <Input
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Loading..." : "Sign Up"}
                    </Button>
                    <p className="text-xs text-center text-gray-500">
                      By creating an account, you agree to our{" "}
                      <Link to="/terms-of-service" className="underline hover:text-blue-600">
                        Terms of Service
                      </Link>
                      .
                    </p>
                  </form>
                )}
              </TabsContent>
              <TabsContent value="reset">
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="mb-4 text-sm text-gray-500">
                    Enter your email address and we'll send you a link to reset your password.
                  </div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                  />
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setActiveTab("signin")}
                      className="text-sm text-blue-600 hover:underline mt-2"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;