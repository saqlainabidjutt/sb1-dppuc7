import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, ArrowUpDown } from 'lucide-react';
import { Sale } from '../../lib/db/schema';
import { formatDate, formatDateTime } from './utils';

interface RecentActivityProps {
  sales: Array<Sale & { driverName: string }>;
  userRole: 'admin' | 'driver' | null;
  formatCurrency: (amount: number) => string;
  onDeleteSale: (saleId: number) => void;
}

type SortField = 'date' | 'driverName' | 'platform' | 'cardPayments' | 'cashPayments' | 'totalSale' | 'updated_at';
type SortDirection = 'asc' | 'desc';

const RecentActivity: React.FC<RecentActivityProps> = ({
  sales,
  userRole,
  formatCurrency,
  onDeleteSale
}) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedSales = [...sales].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'driverName':
        comparison = (a.driverName || '').localeCompare(b.driverName || '');
        break;
      case 'platform':
        comparison = a.platform.localeCompare(b.platform);
        break;
      case 'cardPayments':
        comparison = a.cardPayments - b.cardPayments;
        break;
      case 'cashPayments':
        comparison = a.cashPayments - b.cashPayments;
        break;
      case 'totalSale':
        comparison = a.totalSale - b.totalSale;
        break;
      case 'updated_at':
        comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        break;
      default:
        comparison = 0;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const SortableHeader: React.FC<{ field: SortField; children: React.ReactNode }> = ({ field, children }) => (
    <th
      className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        <ArrowUpDown className={`h-4 w-4 transition-colors ${
          sortField === field ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'
        }`} />
      </div>
    </th>
  );

  // Mobile card view for each sale
  const SaleCard = ({ sale }: { sale: Sale & { driverName: string } }) => (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-medium text-gray-900">{formatDate(sale.date)}</p>
          {userRole === 'admin' && (
            <p className="text-sm text-gray-600">{sale.driverName}</p>
          )}
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/sales/${sale.id}/edit`}
            className="text-indigo-600 hover:text-indigo-900"
          >
            <Edit2 className="h-4 w-4" />
          </Link>
          {userRole === 'admin' && (
            <button
              onClick={() => onDeleteSale(sale.id)}
              className="text-red-600 hover:text-red-900"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-2">Platform: {sale.platform}</p>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-gray-500">Card:</p>
          <p className="font-medium">{formatCurrency(sale.cardPayments)}</p>
        </div>
        <div>
          <p className="text-gray-500">Cash:</p>
          <p className="font-medium">{formatCurrency(sale.cashPayments)}</p>
        </div>
        <div className="col-span-2">
          <p className="text-gray-500">Total:</p>
          <p className="font-medium text-lg">{formatCurrency(sale.totalSale)}</p>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
        <p>Last modified: {formatDateTime(sale.updated_at)}</p>
        <p>by {sale.last_modified_by_name}</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        <Link 
          to="/reports" 
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          View All Reports →
        </Link>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {sortedSales.map(sale => (
          <SaleCard key={sale.id} sale={sale} />
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <SortableHeader field="date">Date</SortableHeader>
              {userRole === 'admin' && (
                <SortableHeader field="driverName">Driver</SortableHeader>
              )}
              <SortableHeader field="platform">Platform</SortableHeader>
              <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center justify-end space-x-1 cursor-pointer group" onClick={() => handleSort('cardPayments')}>
                  <span>Card</span>
                  <ArrowUpDown className={`h-4 w-4 transition-colors ${
                    sortField === 'cardPayments' ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`} />
                </div>
              </th>
              <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center justify-end space-x-1 cursor-pointer group" onClick={() => handleSort('cashPayments')}>
                  <span>Cash</span>
                  <ArrowUpDown className={`h-4 w-4 transition-colors ${
                    sortField === 'cashPayments' ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`} />
                </div>
              </th>
              <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center justify-end space-x-1 cursor-pointer group" onClick={() => handleSort('totalSale')}>
                  <span>Total</span>
                  <ArrowUpDown className={`h-4 w-4 transition-colors ${
                    sortField === 'totalSale' ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`} />
                </div>
              </th>
              <SortableHeader field="updated_at">Last Modified</SortableHeader>
              <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedSales.map((sale) => (
              <tr key={sale.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(sale.date)}
                </td>
                {userRole === 'admin' && (
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.driverName}
                  </td>
                )}
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {sale.platform}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {formatCurrency(sale.cardPayments)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {formatCurrency(sale.cashPayments)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                  {formatCurrency(sale.totalSale)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex flex-col">
                    <span>{formatDateTime(sale.updated_at)}</span>
                    <span className="text-gray-400">
                      by {sale.last_modified_by_name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-3">
                    <Link
                      to={`/sales/${sale.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Edit sale"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Link>
                    {userRole === 'admin' && (
                      <button
                        onClick={() => onDeleteSale(sale.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete sale"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentActivity;