import { z } from 'zod';

export const UserRole = z.enum(['admin', 'driver']);
export const PlatformType = z.enum(['UBER', 'CABIFY', 'BOLT', 'TAXXILO']);

export const CompanySchema = z.object({
  id: z.number(),
  name: z.string(),
  adminId: z.number(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  password: z.string(),
  role: UserRole,
  name: z.string(),
  companyId: z.number().optional(),
  adminId: z.number().optional(),
  commission: z.number().min(0).max(100).default(0),
  created_at: z.date(),
  updated_at: z.date(),
});

export const SaleSchema = z.object({
  id: z.number(),
  userId: z.number(),
  companyId: z.number(),
  date: z.date(),
  platform: z.string(),
  cardPayments: z.number().min(0),
  cashPayments: z.number().min(0),
  totalSale: z.number().min(0),
  notes: z.string().nullable(),
  lastModifiedBy: z.number(),
  lastModifiedByName: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
  driverName: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;
export type Sale = z.infer<typeof SaleSchema>;
export type Company = z.infer<typeof CompanySchema>;

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const AVAILABLE_CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];