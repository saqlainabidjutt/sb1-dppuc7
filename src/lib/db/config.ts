import { DBSchema } from './types';

export const DB_CONFIG: DBSchema = {
  users: '++id, email, role, companyId, adminId',
  sales: '++id, userId, companyId, date, platform, lastModifiedBy',
  companies: '++id, adminId'
};