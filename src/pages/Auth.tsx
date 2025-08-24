import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthForm } from '@/components/ui/auth-form';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, signUp, signIn } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'signin'
  );
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (email: string, password: string) => {
    setLoading(true);
    const result = mode === 'signup' ? await signUp(email, password) : await signIn(email, password);
    setLoading(false);
    return result;
  };

  const handleModeChange = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    const params = new URLSearchParams(searchParams);
    if (newMode === 'signup') {
      params.set('mode', 'signup');
    } else {
      params.delete('mode');
    }
    navigate(`/auth?${params.toString()}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient */}
      <div className="absolute top-0 z-[0] h-screen w-screen bg-purple-950/10 dark:bg-purple-950/10 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      
      <div className="relative z-10">
        {/* Header with back button */}
        <div className="container max-w-screen-xl mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Button>
        </div>

        {/* Auth form centered */}
        <div className="container max-w-screen-xl mx-auto px-4 py-20 flex items-center justify-center">
          <AuthForm
            mode={mode}
            onSubmit={handleSubmit}
            onModeChange={handleModeChange}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;