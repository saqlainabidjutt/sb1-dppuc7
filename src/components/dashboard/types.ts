import { Sale, User } from '../../lib/db/schema';

export interface PlatformSummary {
  name: string;
  totalSale: number;
  cardPayments: number;
  cashPayments: number;
}

export interface PlatformTotals {
  [platform: string]: {
    total: number;
    card: number;
    cash: number;
  };
}

export interface GroupedSales {
  [key: string]: Array<Sale & { driverName: string }>;
}

export interface DashboardProps {
  userRole: 'admin' | 'driver' | null;
  userId?: number;
  companyId?: number;
  settings: {
    currency: string;
    enabledPlatforms: string[];
    customPlatforms: string[];
  };
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface MonthlyTotals {
  total: number;
  card: number;
  cash: number;
  commission: number;
}