import SOSButton from '@/components/worker/SOSButton';
import { useAuth } from '@/context/AuthContext';
import { Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function SOSPage() {
  const { profile } = useAuth();

  const handleSOS = async (lat?: number, lng?: number, desc?: string) => {
    if (!profile?.id) return;

    // 1. Fetch site info
    let siteData = null;
    if (profile.site_id) {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('id', profile.site_id)
        .single();
      if (!error) {
        siteData = data;
      }
    }

    // 2. Determine Dev vs Prod Webhook URL
    const isDev = import.meta.env.DEV;
    const webhookUrl = isDev 
      ? 'https://nexy13.app.n8n.cloud/webhook-test/sos' 
      : 'https://nexy13.app.n8n.cloud/webhook/sos';

    // 3. Post to n8n Webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        worker_id: profile.id,
        worker_name: profile.name,
        worker_phone: profile.phone,
        worker_age: profile.age,
        site_id: profile.site_id,
        site_name: siteData?.name || 'Unknown Site',
        site_location: siteData?.location || 'Unknown Location',
        site_zone: siteData?.zone || 'Unknown Zone',
        latitude: lat || null,
        longitude: lng || null,
        description: desc || 'Dizzy or unwell',
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to reach emergency dispatch server');
    }

    // 4. Also write alert to Supabase alerts table so supervisor/admin dashboard updates in real-time
    const { error: alertErr } = await supabase.from('alerts').insert({
      worker_id: profile.id,
      alert_type: 'sos',
      status: 'open',
      created_at: new Date().toISOString(),
    });

    if (alertErr) {
      console.error('Error logging SOS alert to DB:', alertErr.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
      <SOSButton onTrigger={handleSOS} />

      {/* Emergency contacts */}
      <div className="mt-12 glass rounded-2xl p-6 w-full max-w-sm">
        <h3 className="text-sm font-semibold text-[var(--color-text-muted)] mb-3 uppercase tracking-wider">
          Emergency Contacts
        </h3>
        <div className="space-y-3">
          <a
            href="tel:112"
            className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg-secondary)] hover:bg-red-500/10 transition-colors"
          >
            <Phone size={18} className="text-red-400" />
            <div>
              <p className="text-sm font-medium">National Emergency</p>
              <p className="text-xs text-[var(--color-text-muted)]">112</p>
            </div>
          </a>
          <a
            href="tel:108"
            className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg-secondary)] hover:bg-red-500/10 transition-colors"
          >
            <Phone size={18} className="text-indigo-400" />
            <div>
              <p className="text-sm font-medium">Ambulance</p>
              <p className="text-xs text-[var(--color-text-muted)]">108</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
