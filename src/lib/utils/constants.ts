// ============================================
// HeatShield AI — Constants & Thresholds
// ============================================

import type { HeatThreshold } from '@/types/common';

/** Heat index risk thresholds (°C) */
export const HEAT_THRESHOLDS: HeatThreshold[] = [
  {
    level: 'Low',
    minTemp: 0,
    maxTemp: 27,
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.15)',
    action: 'Normal operations',
  },
  {
    level: 'Moderate',
    minTemp: 27,
    maxTemp: 32,
    color: '#eab308',
    bgColor: 'rgba(234, 179, 8, 0.15)',
    action: 'Hydration reminders every 30 min',
  },
  {
    level: 'High',
    minTemp: 32,
    maxTemp: 40,
    color: '#f97316',
    bgColor: 'rgba(249, 115, 22, 0.15)',
    action: 'Mandatory 15-min water break every hour, shade required',
  },
  {
    level: 'Extreme',
    minTemp: 40,
    maxTemp: 52,
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    action: 'Reduce shift to 4 hours, mandatory 30-min rest cycles',
  },
  {
    level: 'Danger',
    minTemp: 52,
    maxTemp: null,
    color: '#1e1e1e',
    bgColor: 'rgba(30, 30, 30, 0.9)',
    action: 'STOP ALL WORK — Evacuate immediately',
  },
];

/** Hydration reminder interval in minutes */
export const HYDRATION_REMINDER_INTERVAL_MIN = 30;

/** Default water intake per break (ml) */
export const DEFAULT_WATER_ML = 250;

/** Maximum shift duration in hours before forced termination */
export const MAX_SHIFT_HOURS = 8;

/** SOS auto-escalation timeout in seconds */
export const SOS_ESCALATION_TIMEOUT_SEC = 120;

/** Supported languages */
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
] as const;

/** User role labels */
export const ROLE_LABELS: Record<string, string> = {
  worker: 'Worker',
  supervisor: 'Supervisor',
  admin: 'Admin',
  ngo: 'NGO Observer',
};

/** Category gradients for visual cards */
export const RISK_GRADIENTS: Record<string, string> = {
  low: 'from-emerald-500 to-green-600',
  moderate: 'from-yellow-500 to-amber-600',
  high: 'from-orange-500 to-red-500',
  extreme: 'from-red-600 to-rose-700',
  danger: 'from-gray-900 to-black',
};

/** App name */
export const APP_NAME = 'HeatShield AI';

/** App tagline */
export const APP_TAGLINE = 'Protecting lives from extreme heat';
