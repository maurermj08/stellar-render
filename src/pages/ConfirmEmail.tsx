import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '@/utils/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const ConfirmEmail = () => {
  const [status, setStatus] = useState<'confirming' | 'success' | 'error'>('confirming');
  const [message, setMessage] = useState('Confirming your email...');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
              // User is now verified and signed in
              setStatus('success');
              setMessage('Email confirmed successfully! Redirecting to gallery...');
              
              toast({
                title: "Email Confirmed",
                description: "Welcome to Stellar Videos! You can now create amazing videos.",
              });

              // Redirect to gallery after a short delay
              setTimeout(() => {
                navigate('/');
              }, 2000);
            } else if (event === 'SIGNED_OUT') {
              // Handle sign out during confirmation
              setStatus('error');
              setMessage('Email confirmation failed. Please try again.');
              
              toast({
                variant: "destructive",
                title: "Confirmation Failed",
                description: "There was an issue confirming your email. Please try signing up again.",
              });

              // Redirect to auth page after delay
              setTimeout(() => {
                navigate('/auth');
              }, 3000);
            }
          }
        );

        // Check if there's already an active session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setStatus('success');
          setMessage('Email already confirmed! Redirecting to gallery...');
          
          setTimeout(() => {
            navigate('/');
          }, 2000);
        }

        // Clean up subscription
        return () => {
          subscription.unsubscribe();
        };
      } catch (error: any) {
        console.error('Error during email confirmation:', error);
        setStatus('error');
        setMessage('An error occurred during confirmation. Please try again.');
        
        toast({
          variant: "destructive",
          title: "Confirmation Error",
          description: "There was an issue confirming your email. Please try again.",
        });

        setTimeout(() => {
          navigate('/auth');
        }, 3000);
      }
    };

    handleEmailConfirmation();
  }, [navigate, toast]);

  const getIcon = () => {
    switch (status) {
      case 'confirming':
        return <Loader2 className="w-12 h-12 text-primary animate-spin" />;
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case 'error':
        return <XCircle className="w-12 h-12 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'confirming':
        return 'text-primary';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <CardTitle className={getStatusColor()}>
            {status === 'confirming' && 'Confirming Email'}
            {status === 'success' && 'Email Confirmed!'}
            {status === 'error' && 'Confirmation Failed'}
          </CardTitle>
          <CardDescription>
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'confirming' && (
            <p className="text-sm text-muted-foreground">
              Please wait while we confirm your email address...
            </p>
          )}
          {status === 'success' && (
            <p className="text-sm text-muted-foreground">
              You will be redirected to the gallery in a moment.
            </p>
          )}
          {status === 'error' && (
            <p className="text-sm text-muted-foreground">
              You will be redirected to the sign-in page shortly.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmEmail;