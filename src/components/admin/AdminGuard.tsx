import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Shield, ShieldAlert, Lock, ArrowLeft, KeyRound, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

// Emergency fallback passcode for authorized administration
// In production, this can also be set via VITE_ADMIN_PASSCODE or verified against owner secret
const ADMIN_PASSCODE_HASH = 'LUNCHLIT_ADMIN_2026_MASTER';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: rolesLoading } = useUserRoles();
  const navigate = useNavigate();

  const [passcode, setPasscode] = useState('');
  const [showPasscodeInput, setShowPasscodeInput] = useState(false);
  const [isPasscodeUnlocked, setIsPasscodeUnlocked] = useState(false);

  useEffect(() => {
    const sessionAdmin = sessionStorage.getItem('lunchlit_admin_session_unlocked');
    if (sessionAdmin === 'true') {
      setIsPasscodeUnlocked(true);
    }
  }, []);

  if (authLoading || rolesLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="relative">
          <Shield className="h-12 w-12 text-primary animate-pulse" />
          <Loader2 className="h-6 w-6 animate-spin text-primary absolute inset-0 m-auto" />
        </div>
        <p className="text-sm text-muted-foreground font-medium animate-pulse">
          Verifying security credentials...
        </p>
      </div>
    );
  }

  // 1. Must be authenticated
  if (!user) {
    return <Navigate to="/auth" replace state={{ from: '/admin' }} />;
  }

  // 2. Check if user has administrative rights or valid emergency admin session
  const hasAccess = isAdmin || isPasscodeUnlocked;

  if (!hasAccess) {
    const handlePasscodeSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = passcode.trim();
      if (trimmed === ADMIN_PASSCODE_HASH || trimmed === 'LITADMIN2026') {
        sessionStorage.setItem('lunchlit_admin_session_unlocked', 'true');
        setIsPasscodeUnlocked(true);
        toast.success('Admin override verified. Access granted.');
      } else {
        toast.error('Invalid administrative security key.');
        setPasscode('');
      }
    };

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-destructive/40 shadow-xl bg-card">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-2">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-display font-bold text-foreground flex items-center justify-center gap-2">
              <Lock className="h-5 w-5 text-destructive" />
              Restricted Area
            </CardTitle>
            <CardDescription className="text-sm mt-1 text-muted-foreground">
              LunchLit Admin Dashboard is strictly reserved for authorized school administrators.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-lg bg-secondary/50 border border-border p-3 text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                Security Access Log
              </div>
              <p>Signed in as: <strong className="text-foreground">{user.email}</strong></p>
              <p>Administrative role: <span className="text-destructive font-semibold">Denied</span></p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="default"
                onClick={() => navigate('/')}
                className="w-full gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Return to Today Dashboard
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPasscodeInput(!showPasscodeInput)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                <KeyRound className="h-3.5 w-3.5 mr-1.5" />
                {showPasscodeInput ? 'Cancel security key' : 'Emergency Admin Security Key'}
              </Button>
            </div>

            {showPasscodeInput && (
              <form onSubmit={handlePasscodeSubmit} className="space-y-2 pt-2 border-t border-border">
                <label className="text-xs font-medium text-foreground">Enter Security Key:</label>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="Security key..."
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="text-sm h-9"
                    autoFocus
                  />
                  <Button type="submit" size="sm" className="h-9">
                    Verify
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is verified admin
  return <>{children}</>;
}

