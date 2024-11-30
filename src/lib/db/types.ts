export interface DBSchema {
  [key: string]: string;
}

export interface Settings {
  currency: string;
  enabledPlatforms: string[];
  customPlatforms: string[];
}

export interface DemoSale {
  id: number;
  userId: number;
  companyId: number;
  date: Date;
  platform: string;
  cardPayments: number;
  cashPayments: number;
  totalSale: number;
  notes?: string;
  lastModifiedBy: number;
  lastModifiedByName: string;
  createdAt: Date;
  updatedAt: Date;
  driverName?: string;
  last_modified_by_name: string;
}