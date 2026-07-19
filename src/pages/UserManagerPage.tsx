import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X } from 'lucide-react';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">User Management</h2>
          <p className="text-[var(--color-text-muted)] text-sm">Manage platform administrators and mill supervisors</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] z-10" />
            <Input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Button onClick={openInvite} variant="primary" className="py-2.5 px-4 rounded-xl font-medium">
            <Plus size={16} /> Add User
          </Button>
        </div>
      </div>

      {error ? (
        <Card className="p-8 text-center max-w-lg mx-auto border-red-500/20 bg-red-500/5">
          <p className="text-red-500 font-semibold">{error}</p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0" hoverable={false}>
          <Table>
            <TableHeader>
              <TableRow className="bg-[var(--color-bg-secondary)] hover:bg-transparent">
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Assigned Mill</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-left">{user.name}</p>
                        <p className="text-xs text-[var(--color-text-muted)] text-left">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`badge ${user.role === 'admin' ? 'badge-danger' : 'badge-warning'}`}>
                      {ROLE_LABELS[user.role] ?? user.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-[var(--color-text-muted)]">{user.phone || '—'}</TableCell>
                  <TableCell className="text-[var(--color-text-muted)]">
                    {user.role === 'admin' ? 'All mills' : user.assigned_site?.name ?? 'Unassigned'}
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => openEdit(user)}
                      className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors inline-block mr-1 cursor-pointer"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(user)}
                      className="p-2 text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors inline-block cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="p-10 text-center text-[var(--color-text-muted)]">
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
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-6 z-50 animate-fade-in">
          <Card className="w-full max-w-md bg-[var(--bg-card)] p-6 space-y-4" hoverable={false}>
            <div className="flex justify-between items-center border-b border-[var(--border)] pb-3">
              <h3 className="text-lg font-bold font-serif">{editingUser ? `Edit ${editingUser.name}` : 'Add User'}</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={20} />
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
                      <option value="supervisor">Supervisor — manages one mill</option>
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
                    label="Assigned Mill"
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
                <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-left font-medium">{formError}</p>
              )}

              <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-3">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="py-2.5 px-5 rounded-xl font-medium">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} loading={saving} variant="primary" className="py-2.5 px-5 rounded-xl font-medium">
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
