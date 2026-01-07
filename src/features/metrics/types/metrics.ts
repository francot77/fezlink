export interface Stat {
  _id: string;
  clicks: number;
  displayDate?: string;
  isMonthly?: boolean;
}

export interface Trend {
  key: string;
  thisPeriod: number;
  lastPeriod: number;
  changePercent: number | null;
  hasEnoughData: boolean;
}

export interface DeviceTotal {
  deviceType: string;
  clicks: number;
}

export interface SourceTotal {
  source: string;
  clicks: number;
}

export interface MetricsData {
  stats: Stat[];
  totalClicks: number;
  availableCountries: string[];
  availableSources: string[];
  availableDevices: string[];
  countryTotals: Record<string, number>;
  deviceTotals: DeviceTotal[];
  sourceTotals: SourceTotal[];
  deviceTrends: Trend[];
  sourceTrends: Trend[];
}

export interface MetricsFilters {
  startDate: string;
  endDate: string;
  country: string;
  deviceType: string;
  source: string;
  activePreset: 'week' | 'month' | 'year' | 'custom';
  selectedMonth: string;
  selectedYear: string;
}
