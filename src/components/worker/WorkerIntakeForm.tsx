import React, { useState, useEffect } from 'react';
import { Download, X, Check, AlertCircle, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { createWorker, updateWorker, bulkInsertWorkers } from '@/lib/api/workers';
import type { KilnSite, Worker } from '@/types/database';

export interface FormFields {
  name: string;
  phone: string;
  address: string;
  total_family_members: string | number;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  blood_group: string;
  medical_conditions: string[];
  site_id: string;
}

export function validateWorkerData(data: Partial<FormFields>): Record<string, string> {
  const errors: Record<string, string> = {};
  const phoneRegex = /^\+?[0-9]{10,15}$/;

  if (!data.name?.trim()) {
    errors.name = 'Name is required';
  }

  if (!data.phone?.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!phoneRegex.test(data.phone.trim())) {
    errors.phone = 'Invalid format (10-15 digits required)';
  }

  if (!data.address?.trim()) {
    errors.address = 'Address is required';
  }

  const familyCount = Number(data.total_family_members);
  if (data.total_family_members === undefined || String(data.total_family_members).trim() === '') {
    errors.total_family_members = 'Family members count is required';
  } else if (isNaN(familyCount) || familyCount < 0 || !Number.isInteger(familyCount)) {
    errors.total_family_members = 'Must be a non-negative integer';
  }

  if (!data.emergency_contact_name?.trim()) {
    errors.emergency_contact_name = 'Emergency contact name is required';
  }

  if (!data.emergency_contact_phone?.trim()) {
    errors.emergency_contact_phone = 'Emergency contact phone is required';
  } else if (!phoneRegex.test(data.emergency_contact_phone.trim())) {
    errors.emergency_contact_phone = 'Invalid format (10-15 digits required)';
  }

  if (!data.site_id) {
    errors.site_id = 'Site assignment is required';
  }

  return errors;
}

interface WorkerIntakeFormProps {
  worker?: Worker | null;
  supervisorSiteId?: string | null;
  sites: KilnSite[];
  onSuccess: () => void;
  onCancel: () => void;
  initialTab?: 'manual' | 'bulk';
}

interface CSVRow {
  name: string;
  phone: string;
  address: string;
  total_family_members: number;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  blood_group: string;
  medical_conditions: string[];
  errors: string[];
}

export default function WorkerIntakeForm({
  worker,
  supervisorSiteId,
  sites,
  onSuccess,
  onCancel,
  initialTab = 'manual',
}: WorkerIntakeFormProps) {
  const [formData, setFormData] = useState<FormFields>({
    name: '',
    phone: '',
    address: '',
    total_family_members: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    blood_group: '',
    medical_conditions: [],
    site_id: supervisorSiteId || '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Tag inputs state
  const [conditionInput, setConditionInput] = useState('');

  // Bulk import state
  const [csvRows, setCsvRows] = useState<CSVRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'manual' | 'bulk'>(initialTab);

  useEffect(() => {
    if (worker) {
      setFormData({
        name: worker.name || '',
        phone: worker.phone || '',
        address: worker.address || '',
        total_family_members: worker.total_family_members !== undefined ? worker.total_family_members : '',
        emergency_contact_name: worker.emergency_contact_name || '',
        emergency_contact_phone: worker.emergency_contact_phone || '',
        blood_group: worker.blood_group || '',
        medical_conditions: worker.medical_conditions || [],
        site_id: worker.site_id || supervisorSiteId || '',
      });
      setActiveTab('manual');
    }
  }, [worker, supervisorSiteId]);

  // Handle manual submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const errors = validateWorkerData(formData);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      const payload = {
        site_id: formData.site_id || null,
        name: formData.name.trim(),
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        total_family_members: Number(formData.total_family_members),
        emergency_contact_name: formData.emergency_contact_name.trim() || null,
        emergency_contact_phone: formData.emergency_contact_phone.trim() || null,
        blood_group: formData.blood_group || null,
        medical_conditions: formData.medical_conditions,
        status: (worker?.status || 'active') as any,
      };

      if (worker?.id) {
        await updateWorker(worker.id, payload);
      } else {
        await createWorker(payload);
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      setSubmitError(err instanceof Error ? err.message : 'An error occurred while saving the worker.');
    } finally {
      setSubmitting(false);
    }
  };

  // Medical conditions tags helper
  const handleAddCondition = () => {
    const trimmed = conditionInput.trim();
    if (trimmed && !formData.medical_conditions.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        medical_conditions: [...prev.medical_conditions, trimmed],
      }));
      setConditionInput('');
    }
  };

  const handleRemoveCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medical_conditions: prev.medical_conditions.filter((_, i) => i !== index),
    }));
  };

  // CSV Parsing
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
      const rows: CSVRow[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim());
        if (cols.length < 6) continue;

        const name = cols[0];
        const phone = cols[1];
        const address = cols[2];
        const total_family_members = Number(cols[3]);
        const emergency_contact_name = cols[4];
        const emergency_contact_phone = cols[5];
        const blood_group = cols[6] || '';
        const medical_conditions = cols[7] ? cols[7].split(';').map(m => m.trim()).filter(Boolean) : [];

        const rowErrors = validateWorkerData({
          name,
          phone,
          address,
          total_family_members,
          emergency_contact_name,
          emergency_contact_phone,
          site_id: formData.site_id, // CSV uploads will default to currently selected site
        });

        // Additional Blood Group validation for CSV
        if (blood_group && !['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(blood_group)) {
          rowErrors.blood_group = 'Invalid blood group (must be e.g. A+, O-)';
        }

        const errorsList = Object.values(rowErrors);

        rows.push({
          name,
          phone,
          address,
          total_family_members: isNaN(total_family_members) ? 0 : total_family_members,
          emergency_contact_name,
          emergency_contact_phone,
          blood_group,
          medical_conditions,
          errors: errorsList,
        });
      }
      setCsvRows(rows);
    };
    reader.readAsText(file);
  };

  const handleCommitImport = async () => {
    if (!formData.site_id) return;
    const validRows = csvRows.filter(r => r.errors.length === 0);
    if (validRows.length === 0) return;

    setImporting(true);
    try {
      const payload = validRows.map(r => ({
        site_id: formData.site_id,
        name: r.name,
        phone: r.phone || null,
        address: r.address || null,
        total_family_members: r.total_family_members,
        emergency_contact_name: r.emergency_contact_name || null,
        emergency_contact_phone: r.emergency_contact_phone || null,
        blood_group: r.blood_group || null,
        medical_conditions: r.medical_conditions,
        status: 'active' as const,
      }));

      await bulkInsertWorkers(payload);
      setCsvRows([]);
      onSuccess();
    } catch (err) {
      console.error(err);
      alert('Failed to complete bulk import.');
    } finally {
      setImporting(false);
    }
  };

  const downloadCSVTemplate = () => {
    const headers = 'Name,Phone,Address,Total Family Members,Emergency Contact Name,Emergency Contact Phone,Blood Group,Medical Conditions (semicolon-separated)\n';
    const sample = 'Sanjay Das,9988776655,Village Sector B,4,Rita Das,9988776644,O+,Diabetes;High BP\n';
    const blob = new Blob([headers + sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'heatshield_workers_template.csv';
    a.click();
  };

  const isFormValid = Object.keys(validateWorkerData(formData)).length === 0;

  return (
    <Card className="max-w-2xl mx-auto shadow-lg border border-[var(--border)] bg-[var(--bg-card)]">
      <CardHeader className="border-b border-[var(--border)] pb-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">{worker ? 'Edit Worker details' : 'Register New Worker'}</CardTitle>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Supervisor Intake Desk — No Auth Accounts Created</p>
        </div>
        {!worker && (
          <div className="flex gap-2 bg-[var(--bg-muted)] p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'manual'
                  ? 'bg-[var(--bg-white)] text-[var(--text)] shadow-sm'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--text)]'
              }`}
            >
              Manual Form
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bulk')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'bulk'
                  ? 'bg-[var(--bg-white)] text-[var(--text)] shadow-sm'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--text)]'
              }`}
            >
              Bulk Import
            </button>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-6">
        {activeTab === 'manual' ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {submitError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg flex items-center gap-2 text-sm font-medium">
                <AlertCircle size={16} />
                {submitError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name*"
                id="name"
                value={formData.name}
                onChange={e => {
                  setFormData(prev => ({ ...prev, name: e.target.value }));
                  setFormErrors(prev => ({ ...prev, name: '' }));
                }}
                error={formErrors.name}
                required
                aria-required="true"
              />

              <Input
                label="Phone Number*"
                id="phone"
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={e => {
                  setFormData(prev => ({ ...prev, phone: e.target.value }));
                  setFormErrors(prev => ({ ...prev, phone: '' }));
                }}
                error={formErrors.phone}
                required
                aria-required="true"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Address*"
                id="address"
                value={formData.address}
                onChange={e => {
                  setFormData(prev => ({ ...prev, address: e.target.value }));
                  setFormErrors(prev => ({ ...prev, address: '' }));
                }}
                error={formErrors.address}
                required
                aria-required="true"
              />

              <Input
                label="Total Family Members*"
                id="total_family_members"
                type="number"
                min="0"
                value={formData.total_family_members}
                onChange={e => {
                  setFormData(prev => ({ ...prev, total_family_members: e.target.value }));
                  setFormErrors(prev => ({ ...prev, total_family_members: '' }));
                }}
                error={formErrors.total_family_members}
                required
                aria-required="true"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Emergency Contact Name*"
                id="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={e => {
                  setFormData(prev => ({ ...prev, emergency_contact_name: e.target.value }));
                  setFormErrors(prev => ({ ...prev, emergency_contact_name: '' }));
                }}
                error={formErrors.emergency_contact_name}
                required
                aria-required="true"
              />

              <Input
                label="Emergency Contact Phone*"
                id="emergency_contact_phone"
                placeholder="e.g. 9876543210"
                value={formData.emergency_contact_phone}
                onChange={e => {
                  setFormData(prev => ({ ...prev, emergency_contact_phone: e.target.value }));
                  setFormErrors(prev => ({ ...prev, emergency_contact_phone: '' }));
                }}
                error={formErrors.emergency_contact_phone}
                required
                aria-required="true"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Blood Group"
                id="blood_group"
                value={formData.blood_group}
                onChange={e => setFormData(prev => ({ ...prev, blood_group: e.target.value }))}
              >
                <option value="">Select blood group (optional)</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </Select>

              <Select
                label="Assign Kiln Site*"
                id="site_id"
                value={formData.site_id}
                onChange={e => {
                  setFormData(prev => ({ ...prev, site_id: e.target.value }));
                  setFormErrors(prev => ({ ...prev, site_id: '' }));
                }}
                error={formErrors.site_id}
                required
                aria-required="true"
              >
                <option value="">Select site</option>
                {sites.map(site => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="medical_conditions" className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
                Medical Conditions (Optional Tags)
              </label>
              <div className="flex gap-2">
                <input
                  id="medical_conditions"
                  type="text"
                  placeholder="e.g. Diabetes, Asthma"
                  value={conditionInput}
                  onChange={e => setConditionInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCondition();
                    }
                  }}
                  className="input-field flex-1"
                />
                <Button type="button" variant="secondary" onClick={handleAddCondition} className="py-2.5 px-4 rounded-xl flex items-center gap-1">
                  <Plus size={16} /> Add
                </Button>
              </div>
              
              {formData.medical_conditions.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {formData.medical_conditions.map((condition, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-full text-xs font-semibold"
                    >
                      {condition}
                      <button
                        type="button"
                        onClick={() => handleRemoveCondition(index)}
                        className="text-amber-500 hover:text-amber-700 focus:outline-none"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-4">
              <Button type="button" variant="secondary" onClick={onCancel} className="py-2.5 px-5 rounded-xl font-semibold">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={submitting || !isFormValid}
                loading={submitting}
                className="py-2.5 px-5 rounded-xl font-semibold"
              >
                {worker ? 'Update Worker' : 'Register Worker'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--bg-muted)] p-4 rounded-xl border border-[var(--border)] text-sm">
              <div>
                <p className="font-semibold text-[var(--text)]">Excel/CSV Roster Template</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Download layout template to populate multiple workers at once.</p>
              </div>
              <Button 
                type="button"
                variant="secondary"
                onClick={downloadCSVTemplate}
                className="py-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]"
              >
                <Download size={14} /> Download Template
              </Button>
            </div>

            <div className="space-y-2">
              <Select
                label="Assign Kiln Site for Uploaded Workers*"
                id="bulk_site_id"
                value={formData.site_id}
                onChange={e => setFormData(prev => ({ ...prev, site_id: e.target.value }))}
                required
              >
                <option value="">Select site</option>
                {sites.map(site => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase mb-1 tracking-wide">
                Upload CSV File
              </label>
              <input 
                type="file" 
                accept=".csv"
                disabled={!formData.site_id}
                onChange={handleCSVUpload}
                className="w-full text-sm text-[var(--color-text-muted)] file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[var(--bg-muted)] file:text-[var(--text)] hover:file:bg-[var(--color-bg-secondary)] file:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {!formData.site_id && (
                <p className="text-xs text-amber-600 mt-1 font-medium flex items-center gap-1">
                  <AlertCircle size={12} /> Select a kiln site above to enable file uploading.
                </p>
              )}
            </div>

            {csvRows.length > 0 && (
              <div className="border border-[var(--border)] rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] uppercase font-semibold">
                      <th className="p-3">Row</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Validation Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {csvRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[var(--color-bg-secondary)]/50">
                        <td className="p-3 font-mono text-[var(--color-text-muted)]">{idx + 2}</td>
                        <td className="p-3 font-semibold text-[var(--text)]">{row.name || 'Unnamed Row'}</td>
                        <td className="p-3">
                          {row.errors.length > 0 ? (
                            <span className="text-red-500 font-medium flex items-center gap-1">
                              <X size={14} /> {row.errors.join(', ')}
                            </span>
                          ) : (
                            <span className="text-emerald-600 font-medium flex items-center gap-1">
                              <Check size={14} /> Ready to Import
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-between items-center border-t border-[var(--border)] pt-4">
              <Button 
                type="button" 
                variant="secondary"
                onClick={onCancel}
                className="py-2.5 px-5 rounded-xl font-semibold"
              >
                Cancel
              </Button>
              
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--color-text-muted)] font-semibold">
                  {csvRows.filter(r => r.errors.length === 0).length} of {csvRows.length} rows valid
                </span>
                <Button 
                  onClick={handleCommitImport}
                  disabled={importing || !formData.site_id || csvRows.filter(r => r.errors.length === 0).length === 0}
                  loading={importing}
                  variant="primary"
                  className="py-2.5 px-5 rounded-xl font-semibold"
                >
                  Commit Valid Rows
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
