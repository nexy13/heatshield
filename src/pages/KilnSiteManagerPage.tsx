import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, MapPin } from 'lucide-react';
import { useAlerts } from '@/context/AlertContext';
import { getAllSites, createSite, updateSite, deleteSite } from '@/lib/api/sites';
import { getSiteWorkerCount } from '@/lib/api/workers';
import type { KilnSite, SiteStatus } from '@/types/database';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Spinner from '@/components/ui/Spinner';

interface SiteForm {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  region: string;
  hydration_interval_min: number;
  status: SiteStatus;
}

const emptyForm: SiteForm = {
  name: '',
  address: '',
  latitude: '',
  longitude: '',
  region: '',
  hydration_interval_min: 30,
  status: 'active',
};

export default function KilnSiteManagerPage() {
  const { addToast } = useAlerts();
  const [sites, setSites] = useState<KilnSite[]>([]);
  const [workerCounts, setWorkerCounts] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal form states
  const [showModal, setShowModal] = useState(false);
  const [editingSite, setEditingSite] = useState<KilnSite | null>(null);
  const [form, setForm] = useState<SiteForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getAllSites();
      setSites(data);

      // Load worker counts for each site in parallel
      const counts: Record<string, number> = {};
      await Promise.all(
        data.map(async (site) => {
          const count = await getSiteWorkerCount(site.id);
          counts[site.id] = count;
        })
      );
      setWorkerCounts(counts);
      setError(null);
    } catch (err) {
      console.error(err);
      const msg = 'Failed to load kiln sites';
      setError(msg);
      addToast({ title: 'Error', message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditingSite(null);
    setForm(emptyForm);
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = (site: KilnSite) => {
    setEditingSite(site);
    setForm({
      name: site.name,
      address: site.address ?? '',
      latitude: String(site.latitude),
      longitude: String(site.longitude),
      region: site.region ?? '',
      hydration_interval_min: site.hydration_interval_min,
      status: site.status,
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const lat = Number(form.latitude);
    const lng = Number(form.longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setFormError('Latitude must be a number between -90 and 90');
      return;
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      setFormError('Longitude must be a number between -180 and 180');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        address: form.address || null,
        latitude: lat,
        longitude: lng,
        region: form.region || null,
        hydration_interval_min: Number(form.hydration_interval_min) || 30,
        status: form.status,
        owner_id: null,
      };

      if (editingSite) {
        await updateSite(editingSite.id, payload);
      } else {
        await createSite(payload);
      }

      setShowModal(false);
      loadData();
      addToast({ 
        title: 'Success', 
        message: editingSite ? 'Kiln site updated' : 'Kiln site created successfully', 
        type: 'success' 
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save kiln site';
      setFormError(msg);
      addToast({ title: 'Error', message: msg, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (site: KilnSite) => {
    if (!confirm(`Are you sure you want to delete ${site.name}? This will permanently remove the site and all assigned worker roster records!`)) return;
    try {
      await deleteSite(site.id);
      loadData();
      addToast({ title: 'Success', message: 'Site deleted successfully', type: 'success' });
    } catch (err) {
      console.error(err);
      alert('Failed to delete kiln site.');
    }
  };

  const filtered = sites.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.region && s.region.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return <Spinner label="Loading kiln sites..." />;
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Kiln Site Manager</h2>
          <p className="text-[var(--color-text-muted)] text-sm">Manage all brick kiln mills and their statuses</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] z-10" />
            <Input
              type="text"
              placeholder="Search sites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Button onClick={openCreate} variant="primary" className="py-2.5 px-4 rounded-xl flex items-center gap-2 font-medium">
            <Plus size={16} /> Add Site
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
                <TableHead>Site Name</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Workers</TableHead>
                <TableHead>Hydration Interval</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((site) => (
                <TableRow key={site.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[var(--color-bg-secondary)] flex items-center justify-center">
                        <MapPin size={18} className="text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-left">{site.name}</p>
                        <p className="text-xs text-[var(--color-text-muted)] text-left">{site.address || `${site.latitude.toFixed(3)}, ${site.longitude.toFixed(3)}`}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-[var(--color-text-muted)]">{site.region || '—'}</TableCell>
                  <TableCell className="font-medium text-left">{workerCounts[site.id] ?? 0}</TableCell>
                  <TableCell className="text-sm font-mono text-[var(--color-text-muted)]">{site.hydration_interval_min ?? 30} min</TableCell>
                  <TableCell>
                    <span className={`badge ${site.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                      {site.status.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => openEdit(site)}
                      className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors inline-block mr-1 cursor-pointer"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(site)}
                      className="p-2 text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors inline-block cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="p-10 text-center text-[var(--color-text-muted)]">
                    No kiln sites yet. Add your first mill to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* ── CREATE / EDIT MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-6 z-50 animate-fade-in">
          <Card className="w-full max-w-lg bg-[var(--bg-card)] p-6 space-y-4" hoverable={false}>
            <div className="flex justify-between items-center border-b border-[var(--border)] pb-3">
              <h3 className="text-lg font-bold font-serif">{editingSite ? `Edit ${editingSite.name}` : 'Add Kiln Site'}</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <Input
                  label="Site Name"
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                />

                <Input
                  label="Address"
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="Region"
                    id="region"
                    value={form.region}
                    onChange={(e) => setForm((p) => ({ ...p, region: e.target.value }))}
                  />
                  <Input
                    label="Latitude"
                    id="latitude"
                    required
                    placeholder="26.12"
                    value={form.latitude}
                    onChange={(e) => setForm((p) => ({ ...p, latitude: e.target.value }))}
                  />
                  <Input
                    label="Longitude"
                    id="longitude"
                    required
                    placeholder="85.36"
                    value={form.longitude}
                    onChange={(e) => setForm((p) => ({ ...p, longitude: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Hydration Interval (min)"
                    id="hydration_interval"
                    type="number"
                    min={10}
                    max={120}
                    value={form.hydration_interval_min}
                    onChange={(e) => setForm((p) => ({ ...p, hydration_interval_min: Number(e.target.value) }))}
                  />
                  <Select
                    label="Status"
                    id="status"
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as SiteForm['status'] }))}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </Select>
                </div>
              </div>

              {formError && (
                <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-left font-medium">{formError}</p>
              )}

              <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-3">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="py-2.5 px-5 rounded-xl font-medium">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} loading={saving} variant="primary" className="py-2.5 px-5 rounded-xl font-medium">
                  {editingSite ? 'Save Changes' : 'Create Site'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
