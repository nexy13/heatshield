import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, Phone, MapPin, Globe2, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAlerts } from '@/context/AlertContext';
import { getAllUsers, createPlatformUser, updateUser, assignSupervisorSite, deleteUserProfile, type UserWithSite } from '@/lib/api/users';
import { getAllSites } from '@/lib/api/sites';
import type { KilnSite } from '@/types/database';
import { ROLE_LABELS } from '@/lib/utils/constants';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Spinner from '@/components/ui/Spinner';

interface UserForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'supervisor' | 'admin';
  siteId: string;
}

const emptyForm: UserForm = { name: '', email: '', phone: '', password: '', role: 'supervisor', siteId: '' };

/** Deterministic avatar gradient per name — keeps avatars stable between renders */
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #2563EB, #1E3A8A)',
  'linear-gradient(135deg, #7C3AED, #4C1D95)',
  'linear-gradient(135deg, #0891B2, #164E63)',
  'linear-gradient(135deg, #16A34A, #14532D)',
  'linear-gradient(135deg, #EA580C, #7C2D12)',
  'linear-gradient(135deg, #DB2777, #831843)',
];

function avatarGradient(name: string): string {
  const hash = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

export default function UserManagerPage() {
  const { profile } = useAuth();
  const { addToast } = useAlerts();
  const [users, setUsers] = useState<UserWithSite[]>([]);
  const [sites, setSites] = useState<KilnSite[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Invite / edit modal state
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithSite | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [userList, siteList] = await Promise.all([getAllUsers(), getAllSites()]);
      setUsers(userList);
      setSites(siteList);
      setError(null);
    } catch (err) {
      console.error(err);
      const msg = 'Failed to load platform users';
      setError(msg);
      addToast({ title: 'Error', message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openInvite = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = (user: UserWithSite) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone ?? '',
      password: '',
      role: user.role as any,
      siteId: user.assigned_site?.id ?? user.site_id ?? '',
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      if (editingUser) {
        await updateUser(editingUser.id, { name: form.name, phone: form.phone || null });
        if (editingUser.role === 'supervisor') {
          await assignSupervisorSite(editingUser.id, form.siteId || null);
        }
      } else {
        await createPlatformUser({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          phone: form.phone || undefined,
          siteId: form.role === 'supervisor' ? form.siteId || null : null,
        });
      }
      setShowModal(false);
      loadData();
      addToast({
        title: 'Success',
        message: editingUser ? 'User profile updated' : 'Platform account created successfully',
        type: 'success'
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save user';
      setFormError(msg);
      addToast({ title: 'Error', message: msg, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: UserWithSite) => {
    if (user.id === profile?.id) {
      alert('You cannot delete your own account.');
      return;
    }
    if (!confirm(`Remove ${user.name}'s platform access? Their login profile and site assignment will be deleted.`)) return;
    try {
      await deleteUserProfile(user.id);
      loadData();
      addToast({ title: 'Success', message: 'User profile deleted successfully', type: 'success' });
    } catch (err) {
      console.error(err);
      alert('Failed to delete user profile.');
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Spinner label="Loading platform users..." />;
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="text-left">
          <p className="eyebrow mb-1.5">Access Control</p>
          <h2 className="page-title">User Management</h2>
          <p className="page-subtitle">Manage platform administrators and site supervisors</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-light)] z-10" />
            <Input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button onClick={openInvite} variant="primary" className="py-2.5 px-4">
            <Plus size={16} /> Add User
          </Button>
        </div>
      </div>

      {error ? (
        <Card className="p-8 text-center max-w-lg mx-auto" hoverable={false} style={{ borderColor: 'rgba(220,38,38,0.25)', background: 'var(--emergency-bg)' }}>
          <p className="font-semibold" style={{ color: 'var(--emergency)' }}>{error}</p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0" hoverable={false}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Assigned Site</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 transition-transform duration-200 group-hover:scale-105"
                        style={{
                          background: avatarGradient(user.name),
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 6px rgba(11,21,38,0.18)',
                        }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-[var(--text)] leading-tight flex items-center gap-1.5">
                          {user.name}
                          {user.id === profile?.id && <span className="badge badge-info">You</span>}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`badge ${user.role === 'admin' ? 'badge-danger' : 'badge-info'}`}>
                      {user.role === 'admin' ? <ShieldCheck size={11} /> : <UserRound size={11} />}
                      {ROLE_LABELS[user.role] ?? user.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-[var(--text-secondary)]">
                      <Phone size={12} className="text-[var(--text-light)]" />
                      {user.phone || '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {user.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1.5 text-[var(--text-secondary)] font-medium">
                        <Globe2 size={13} style={{ color: 'var(--info)' }} /> All sites
                      </span>
                    ) : user.assigned_site?.name ? (
                      <span className="inline-flex items-center gap-1.5 text-[var(--text-secondary)]">
                        <MapPin size={13} style={{ color: 'var(--info)' }} /> {user.assigned_site.name}
                      </span>
                    ) : (
                      <span className="badge badge-neutral">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(user)}
                        className="btn-icon"
                        aria-label={`Edit ${user.name}`}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="btn-icon btn-icon-danger"
                        aria-label={`Delete ${user.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="p-12 text-center text-[var(--text-muted)]">
                    No users match your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* ── INVITE / EDIT MODAL ── */}
      {showModal && (
        <div className="modal-overlay">
          <Card className="w-full max-w-md p-6 space-y-4 modal-card" hoverable={false}>
            <div className="flex justify-between items-center border-b border-[var(--border)] pb-4">
              <div className="text-left">
                <h3 className="font-serif text-lg font-bold">{editingUser ? `Edit ${editingUser.name}` : 'Add User'}</h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {editingUser ? 'Update profile and site assignment' : 'Create a new platform account'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="btn-icon"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <Input
                  label="Full Name"
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                />

                {!editingUser && (
                  <>
                    <Select
                      label="Role"
                      id="role"
                      value={form.role}
                      onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as UserForm['role'] }))}
                    >
                      <option value="supervisor">Supervisor — manages one site</option>
                      <option value="admin">Admin — full platform access</option>
                    </Select>

                    <Input
                      label="Email"
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    />

                    <Input
                      label="Temporary Password"
                      id="password"
                      type="text"
                      required
                      minLength={8}
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    />
                  </>
                )}

                <Input
                  label="Phone (for SOS SMS)"
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                />

                {(editingUser ? editingUser.role === 'supervisor' : form.role === 'supervisor') && (
                  <Select
                    label="Assigned Site"
                    id="siteId"
                    value={form.siteId}
                    onChange={(e) => setForm((p) => ({ ...p, siteId: e.target.value }))}
                  >
                    <option value="">Unassigned</option>
                    {sites.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </Select>
                )}
              </div>

              {formError && (
                <p
                  className="text-sm rounded-xl px-3.5 py-2.5 text-left font-medium animate-scale-up"
                  style={{ color: 'var(--emergency)', background: 'var(--emergency-bg)', border: '1px solid rgba(220,38,38,0.2)' }}
                >
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-4">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="py-2.5 px-5">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} loading={saving} variant="primary" className="py-2.5 px-5">
                  {editingUser ? 'Save Changes' : `Create ${form.role === 'admin' ? 'Admin' : 'Supervisor'}`}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
