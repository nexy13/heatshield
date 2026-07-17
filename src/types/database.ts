// ============================================
// HeatShield AI — Database Types
// Matches supabase/migrations/001_initial_schema.sql
// ============================================

export type UserRole = 'worker' | 'supervisor' | 'admin' | 'ngo';
export type SiteStatus = 'active' | 'inactive' | 'suspended';
export type WorkerStatus = 'active' | 'inactive' | 'on_leave';
export type ShiftStatus = 'active' | 'completed' | 'terminated';
export type RiskLevel = 'low' | 'moderate' | 'high' | 'extreme' | 'danger';
export type AlertType = 'heat_warning' | 'hydration' | 'sos' | 'compliance' | 'system';
export type AlertSeverity = 'info' | 'warning' | 'critical' | 'emergency';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';
export type SOSStatus = 'triggered' | 'responding' | 'resolved' | 'false_alarm';
export type ReminderType = 'scheduled' | 'manual' | 'system';
export type NotificationChannel = 'push' | 'sms' | 'whatsapp' | 'in_app';
export type ReportedBy = 'self' | 'supervisor' | 'system';
export type ComplianceGrade = 'A' | 'B' | 'C' | 'D' | 'F';

// ---- Table Row Types ----

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  language_pref: string;
  avatar_url: string | null;
  created_at: string;
  site_id: string | null;
  age: number | null;
  health_flags: string[] | null;
}

export interface KilnSite {
  id: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  region: string | null;
  owner_id: string | null;
  status: SiteStatus;
  created_at: string;
}

export interface Worker {
  id: string;
  user_id: string;
  site_id: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  blood_group: string | null;
  medical_conditions: string[];
  status: WorkerStatus;
  created_at: string;
}

export interface Supervisor {
  id: string;
  user_id: string;
  site_id: string | null;
  created_at: string;
}

export interface Shift {
  id: string;
  worker_id: string;
  site_id: string | null;
  start_time: string;
  end_time: string | null;
  status: ShiftStatus;
  avg_heat_index: number | null;
  water_breaks_taken: number;
  notes: string | null;
  created_at: string;
}

export interface WeatherReading {
  id: string;
  site_id: string;
  temperature_c: number;
  humidity_pct: number;
  heat_index: number;
  wind_speed_kmh: number | null;
  condition: string | null;
  risk_level: RiskLevel | null;
  raw_api_response: Record<string, unknown> | null;
  recorded_at: string;
}

export interface HealthLog {
  id: string;
  worker_id: string;
  shift_id: string | null;
  body_temp_c: number | null;
  heart_rate_bpm: number | null;
  symptoms: string | null;
  reported_by: ReportedBy | null;
  recorded_at: string;
}

export interface Alert {
  id: string;
  site_id: string;
  shift_id: string | null;
  worker_id: string | null;
  alert_type: AlertType;
  severity: AlertSeverity;
  message: string;
  status: AlertStatus;
  action_taken: string | null;
  resolved_by: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface SOSEvent {
  id: string;
  worker_id: string;
  site_id: string | null;
  latitude: number | null;
  longitude: number | null;
  status: SOSStatus;
  description: string | null;
  responded_by: string | null;
  triggered_at: string;
  resolved_at: string | null;
}

export interface HydrationLog {
  id: string;
  worker_id: string;
  shift_id: string | null;
  water_ml: number;
  reminder_type: ReminderType | null;
  was_reminded: boolean;
  logged_at: string;
}

export interface NotificationLog {
  id: string;
  user_id: string;
  type: string;
  channel: NotificationChannel | null;
  title: string | null;
  body: string | null;
  is_read: boolean;
  metadata: Record<string, unknown> | null;
  sent_at: string;
}

export interface ComplianceReport {
  id: string;
  site_id: string;
  report_date: string;
  total_workers: number;
  workers_with_water_breaks: number;
  sos_events_count: number;
  alerts_triggered: number;
  avg_heat_index: number | null;
  compliance_grade: ComplianceGrade | null;
  details: Record<string, unknown> | null;
  generated_at: string;
}

// ---- Join / Display Types ----

export interface WorkerWithUser extends Worker {
  user: User;
}

export interface WorkerWithSite extends Worker {
  user: User;
  site: KilnSite;
}

export interface AlertWithDetails extends Alert {
  site?: KilnSite;
  worker?: WorkerWithUser;
}

export interface SOSEventWithDetails extends SOSEvent {
  worker?: WorkerWithUser;
  site?: KilnSite;
}

export interface ShiftWithWorker extends Shift {
  worker?: WorkerWithUser;
}
