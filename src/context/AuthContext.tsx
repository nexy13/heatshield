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
  signInWithEmail: (email: string, password: string) => Promise<void>;
  /** Sign up with email, password, and metadata */
  signUp: (
    email: string,
    password: string,
    metadata: { name: string; role: UserRole; site_id?: string | null; age?: number | null; phone?: string | null }
  ) => Promise<void>;
  /** Sign out */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from public.profiles
  const fetchProfile = async (userId: string, email?: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('Profile missing. Re-creating default profile...');
        const { data: sites } = await supabase.from('sites').select('id').limit(1);
        const defaultSiteId = sites && sites.length > 0 ? sites[0].id : null;

        const defaultProfile = {
          id: userId,
          name: email ? email.split('@')[0] : 'User',
          role: email && (email.includes('admin') || email.includes('supervisor')) ? 'admin' : 'worker',
          site_id: defaultSiteId,
          age: 30,
          phone: null,
          health_flags: [],
        };

        const { data: newProfile, error: insertErr } = await supabase
          .from('profiles')
          .insert(defaultProfile)
          .select()
          .single();

        if (!insertErr && newProfile) {
          return newProfile as any;
        } else {
          console.error('Failed to auto-create profile:', insertErr?.message);
        }
      }
      console.error('Error fetching profile:', error.message);
      return null;
    }
    return data as any;
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setAuthUser(s?.user ?? null);
      if (s?.user) {
        fetchProfile(s.user.id, s.user.email).then((p) => {
          setProfile(p);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        setSession(s);
        setAuthUser(s?.user ?? null);
        if (s?.user) {
          setLoading(true);
          const p = await fetchProfile(s.user.id, s.user.email);
          setProfile(p);
          setLoading(false);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (
    email: string,
    password: string,
    metadata: { name: string; role: UserRole; site_id?: string | null; age?: number | null; phone?: string | null }
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: metadata.name,
          role: metadata.role,
        },
      },
    });
    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          name: metadata.name,
          role: metadata.role,
          site_id: metadata.site_id || null,
          age: metadata.age || null,
          phone: metadata.phone || null,
          health_flags: [],
        });
      if (profileError) throw profileError;
    }
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
        signUp,
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
