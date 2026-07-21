import { supabase } from '@/lib/supabase';
import type { User, UserRole } from '@/types/database';

export type UserWithSite = User & { assigned_site?: { id: string; name: string } | null };

/** Get all platform users with their supervisor site assignment (admin) */
export async function getAllUsers(): Promise<UserWithSite[]> {
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;

  const { data: supervisors, error: supError } = await supabase
    .from('supervisors')
    .select('user_id, site:kiln_sites(id, name)');

  if (supError) throw supError;

  const siteMap = new Map<string, { id: string; name: string } | null>(
    (supervisors ?? []).map((s) => [s.user_id as string, (s.site as unknown as { id: string; name: string }) ?? null])
  );

  return (users ?? []).map((u) => ({ ...u, assigned_site: siteMap.get(u.id) ?? null }));
}

/**
 * Create a platform account — supervisor or admin (admin only).
 *
 * Signs the new user up via Supabase Auth — the on_auth_user_created trigger
 * creates their public.users row with the role from the signup metadata —
 * then records the site assignment for supervisors. The new user confirms
 * their email and logs in with the password set here.
 */
export async function createPlatformUser(input: {
  name: string;
  email: string;
  password: string;
  role: 'supervisor' | 'admin';
  phone?: string;
  siteId?: string | null;
}): Promise<void> {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: { name: input.name, role: input.role },
    },
  });
  if (error) throw error;

  // Supabase obfuscates duplicate signups: an existing email returns a user
  // with no identities instead of an error.
  if (!data.user || data.user.identities?.length === 0) {
    throw new Error('An account with this email already exists.');
  }

  const isSupervisor = input.role === 'supervisor';
  const updates: Partial<User> = {};
  if (input.phone) updates.phone = input.phone;
  if (isSupervisor && input.siteId) updates.site_id = input.siteId;
  if (Object.keys(updates).length > 0) {
    const { error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', data.user.id);
    if (updateError) throw updateError;
  }

  if (isSupervisor && input.siteId) {
    const { error: supError } = await supabase
      .from('supervisors')
      .upsert({ user_id: data.user.id, site_id: input.siteId }, { onConflict: 'user_id' });
    if (supError) throw supError;
  }
}

/** Update a user's profile fields (admin, or the user themselves).
 *  Note: `email` here is the contact/notification address on public.users
 *  (used for emergency emails); the auth login email is managed separately. */
export async function updateUser(
  userId: string,
  updates: Partial<Pick<User, 'name' | 'phone' | 'role' | 'site_id' | 'email'>>
): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Set (or clear) a supervisor's site assignment (admin) */
export async function assignSupervisorSite(userId: string, siteId: string | null): Promise<void> {
  if (siteId) {
    const { error } = await supabase
      .from('supervisors')
      .upsert({ user_id: userId, site_id: siteId }, { onConflict: 'user_id' });
    if (error) throw error;
  } else {
    const { error } = await supabase.from('supervisors').delete().eq('user_id', userId);
    if (error) throw error;
  }

  const { error: userError } = await supabase
    .from('users')
    .update({ site_id: siteId })
    .eq('id', userId);
  if (userError) throw userError;
}

/**
 * Delete a user's profile and supervisor assignment (admin).
 *
 * NOTE: this removes the platform profile, which revokes all dashboard
 * access, but the underlying auth.users login can only be deleted with a
 * service-role key (not available in the browser).
 */
export async function deleteUserProfile(userId: string): Promise<void> {
  const { error: supError } = await supabase.from('supervisors').delete().eq('user_id', userId);
  if (supError) throw supError;

  const { error } = await supabase.from('users').delete().eq('id', userId);
  if (error) throw error;
}

export type { UserRole };
