import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as AuthUser, Session } from '@supabase/supabase-js';
import type { User, UserRole } from '@/types/database';

interface AuthContextType {
  /** Supabase auth user */
  authUser: AuthUser | null;
  /** App user profile from public.users */
  profile: User | null;
  /** User role shortcut */
  role: UserRole | null;
  /** Session object */
  session: Session | null;
  /** Loading state */
  loading: boolean;
  /** Sign in with email and password */
  signInWithEmail: (email: string, password: string) => Promise<User | null>;
  /** Send a password-reset email with a link to /reset-password */
  resetPassword: (email: string) => Promise<void>;
  /** Set a new password (requires an active session, e.g. from a recovery link) */
  updatePassword: (newPassword: string) => Promise<void>;
  /** Sign out */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from public.users
  const fetchProfile = async (userId: string) => {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error.message);
      return null;
    }

    if (user && user.role === 'supervisor') {
      // Fetch site_id from supervisors table
      const { data: supervisor } = await supabase
        .from('supervisors')
        .select('site_id')
        .eq('user_id', userId)
        .maybeSingle();

      return {
        ...user,
        site_id: supervisor?.site_id ?? null,
      };
    }

    return user;
  };

  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return;
      setSession(s);
      setAuthUser(s?.user ?? null);
      if (!s?.user) setLoading(false);
    });

    // Listen for auth changes. IMPORTANT: no awaited supabase queries inside
    // this callback — supabase-js holds its auth lock while notifying
    // subscribers, and a query here (which needs that lock) can deadlock.
    // Profile fetching happens in the effect below, keyed on the user id.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s);
        setAuthUser(s?.user ?? null);
        if (!s?.user) {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Fetch the profile whenever the signed-in user changes
  const userId = authUser?.id ?? null;
  const profileId = profile?.id ?? null;
  useEffect(() => {
    if (!userId) return;
    if (profileId === userId) {
      // Already have this user's profile (e.g. set by signInWithEmail)
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchProfile(userId).then((p) => {
      if (cancelled) return;
      setProfile(p);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [userId, profileId]);

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) {
      const p = await fetchProfile(data.user.id);
      setProfile(p);
      return p;
    }
    return null;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
  };

  const role = profile?.role ?? null;

  return (
    <AuthContext.Provider
      value={{
        authUser,
        profile,
        role,
        session,
        loading,
        signInWithEmail,
        resetPassword,
        updatePassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
