import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, MapPin, Users, Droplets, Navigation } from 'lucide-react';
import { useAlerts } from '@/context/AlertContext';
import { getAllSites, createSite, updateSite, deleteSite } from '@/lib/api/sites';
import { getSiteWorkerCount } from '@/lib/api/workers';
import type { KilnSite, SiteStatus } from '@/types/database';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
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

const STATUS_BADGE: Record<string, BadgeVariant> = {
  active: 'success',
  inactive: 'neutral',
  suspended: 'orange',
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
      const msg = err instanceof Error ? err.message : 'Failed to delete kiln site.';
      addToast({ title: 'Error', message: msg, type: 'error' });
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="text-left">
          <p className="eyebrow mb-1.5">Site Management</p>
          <h2 className="page-title">Kiln Sites</h2>
          <p className="page-subtitle">Manage all brick kiln sites and their operational status</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-light)] z-10" />
            <Input
              type="text"
              placeholder="Search sites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button onClick={openCreate} variant="primary" className="py-2.5 px-4">
            <Plus size={16} /> Add Site
          </Button>
        </div>
      </div>

      {error ? (
        <Card className="p-8 text-center max-w-lg mx-auto" hoverable={false} style={{ borderColor: 'rgba(220,38,38,0.25)', background: 'var(--emergency-bg)' }}>
          <p className="font-semibold" style={{ color: 'var(--emergency)' }}>{error}</p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0" hoverable={false}>
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
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
                <TableRow key={site.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className="icon-chip transition-transform duration-200 group-hover:scale-110"
                        style={{ background: 'var(--brand-tint)', color: 'var(--brand)' }}
                      >
                        <MapPin size={16} />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-[var(--text)] leading-tight">{site.name}</p>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5 flex items-center gap-1">
                          <Navigation size={9} />
                          {site.address || `${site.latitude.toFixed(3)}, ${site.longitude.toFixed(3)}`}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-[var(--text-secondary)]">{site.region || '—'}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 font-medium text-[var(--text-secondary)]">
                      <Users size={13} className="text-[var(--text-light)]" />
                      {workerCounts[site.id] ?? 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 font-mono text-sm text-[var(--text-secondary)]">
                      <Droplets size={13} style={{ color: 'var(--info)' }} />
                      {site.hydration_interval_min ?? 30} min
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE[site.status] ?? 'neutral'} dot={site.status === 'active'}>
                      {site.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(site)}
                        className="btn-icon"
                        aria-label={`Edit ${site.name}`}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(site)}
                        className="btn-icon btn-icon-danger"
                        aria-label={`Delete ${site.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="p-12 text-center text-[var(--text-muted)]">
                    No kiln sites yet. Add your first site to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </div>
        </Card>
      )}

      {/* ── CREATE / EDIT MODAL ── */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        size="lg"
        title={editingSite ? `Edit ${editingSite.name}` : 'Add Kiln Site'}
        description={editingSite ? 'Update site details and operational status' : 'Register a new brick kiln site on the platform'}
      >
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
                    placeholder="12.71"
                    value={form.latitude}
                    onChange={(e) => setForm((p) => ({ ...p, latitude: e.target.value }))}
                  />
                  <Input
                    label="Longitude"
                    id="longitude"
                    required
                    placeholder="77.69"
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
                  {editingSite ? 'Save Changes' : 'Create Site'}
                </Button>
              </div>
            </form>
      </Modal>
    </div>
  );
}
