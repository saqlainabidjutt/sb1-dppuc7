import React from 'react';
import { PlatformSummary as PlatformSummaryType } from './types';

interface PlatformSummaryProps {
  platformSummaries: PlatformSummaryType[];
  formatCurrency: (amount: number) => string;
}

const PlatformSummary: React.FC<PlatformSummaryProps> = ({ platformSummaries, formatCurrency }) => (
  <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Summary</h2>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
              Platform
            </th>
            <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase">
              Card
            </th>
            <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase">
              Cash
            </th>
            <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {platformSummaries.map((platform) => (
            <tr key={platform.name} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                {platform.name}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                {formatCurrency(platform.cardPayments)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                {formatCurrency(platform.cashPayments)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                {formatCurrency(platform.totalSale)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default PlatformSummary;