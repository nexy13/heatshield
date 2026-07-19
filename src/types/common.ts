// ============================================
// HeatShield — Common Types & Interfaces
// ============================================

/** Navigation item for sidebar / navbar */
export interface NavItem {
  label: string;
  to: string;
  icon: React.ElementType;
  roles?: string[];
  badge?: number;
}

/** Toast notification */
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

/** Stats card data */
export interface StatCardData {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  color?: string;
}

/** Heat threshold configuration */
export interface HeatThreshold {
  level: string;
  minTemp: number;
  maxTemp: number | null;
  color: string;
  bgColor: string;
  action: string;
}

/** Geolocation position */
export interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

/** API response wrapper */
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

/** Pagination params */
export interface PaginationParams {
  page: number;
  pageSize: number;
  total?: number;
}

/** Filter options for alerts */
export interface AlertFilters {
  type?: string;
  severity?: string;
  status?: string;
  siteId?: string;
  dateFrom?: string;
  dateTo?: string;
}
