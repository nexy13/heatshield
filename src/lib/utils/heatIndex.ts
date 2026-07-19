// ============================================
// HeatShield — Heat Index Calculator
// Uses the Rothfusz regression equation (NWS standard)
// ============================================

import { HEAT_THRESHOLDS } from './constants';
import type { RiskLevel } from '@/types/database';
import type { HeatThreshold } from '@/types/common';

/**
 * Calculate heat index from temperature (°C) and relative humidity (%).
 * Based on the Rothfusz regression equation used by NOAA/NWS.
 */
export function calculateHeatIndex(tempC: number, humidityPct: number): number {
  // Convert to Fahrenheit for the standard equation
  const T = (tempC * 9) / 5 + 32;
  const RH = humidityPct;

  // Simple formula for low temperatures
  if (T < 80) {
    const simple = 0.5 * (T + 61.0 + (T - 68.0) * 1.2 + RH * 0.094);
    return ((simple - 32) * 5) / 9; // back to Celsius
  }

  // Rothfusz regression
  let HI =
    -42.379 +
    2.04901523 * T +
    10.14333127 * RH -
    0.22475541 * T * RH -
    0.00683783 * T * T -
    0.05481717 * RH * RH +
    0.00122874 * T * T * RH +
    0.00085282 * T * RH * RH -
    0.00000199 * T * T * RH * RH;

  // Adjustments
  if (RH < 13 && T >= 80 && T <= 112) {
    HI -= ((13 - RH) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
  } else if (RH > 85 && T >= 80 && T <= 87) {
    HI += ((RH - 85) / 10) * ((87 - T) / 5);
  }

  // Convert back to Celsius
  return Math.round(((HI - 32) * 5) / 9 * 10) / 10;
}

/**
 * Determine risk level from a heat index value (°C).
 */
export function getRiskLevel(heatIndex: number): RiskLevel {
  if (heatIndex < 27) return 'low';
  if (heatIndex < 32) return 'moderate';
  if (heatIndex < 40) return 'high';
  if (heatIndex < 52) return 'extreme';
  return 'danger';
}

/**
 * Get the threshold config for a given heat index.
 */
export function getThresholdForHeatIndex(heatIndex: number): HeatThreshold {
  const threshold = HEAT_THRESHOLDS.find(
    (t) => heatIndex >= t.minTemp && (t.maxTemp === null || heatIndex < t.maxTemp)
  );
  return threshold || HEAT_THRESHOLDS[0];
}

/**
 * Get a human-readable label for the risk level.
 */
export function getRiskLabel(level: RiskLevel): string {
  const labels: Record<RiskLevel, string> = {
    low: '🟢 Low Risk',
    moderate: '🟡 Moderate',
    high: '🟠 High Risk',
    extreme: '🔴 Extreme',
    danger: '⚫ DANGER',
  };
  return labels[level];
}

/**
 * Calculate recommended water intake (ml) per hour based on heat index.
 */
export function recommendedWaterIntake(heatIndex: number): number {
  if (heatIndex < 27) return 250;
  if (heatIndex < 32) return 500;
  if (heatIndex < 40) return 750;
  if (heatIndex < 52) return 1000;
  return 0; // Should not be working
}
