import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Sale } from '../../lib/db/schema';

interface MonthlyDriverSalesProps {
  sales: Array<Sale & { driverName: string }>;
  formatCurrency: (amount: number) => string;
}

interface MonthlyData {
  month: string;
  total: number;
  [key: string]: number | string;
}

const COLORS = [
  '#4F46E5', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
];

const MonthlyDriverSales: React.FC<MonthlyDriverSalesProps> = ({ sales, formatCurrency }) => {
  const monthlyData = useMemo(() => {
    const months: { [key: string]: MonthlyData } = {};
    const drivers = new Set<string>();

    sales.forEach(sale => {
      const date = new Date(sale.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      drivers.add(sale.driverName);

      if (!months[monthKey]) {
        months[monthKey] = {
          month: monthName,
          total: 0,
        };
      }

      months[monthKey].total += sale.totalSale;
      months[monthKey][sale.driverName] = (months[monthKey][sale.driverName] as number || 0) + sale.totalSale;
    });

    return {
      data: Object.values(months).sort((a, b) => a.month.localeCompare(b.month)),
      drivers: Array.from(drivers)
    };
  }, [sales]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
          <p className="font-medium text-gray-900 mt-2 pt-2 border-t">
            Total: {formatCurrency(payload.reduce((sum: number, entry: any) => sum + entry.value, 0))}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Monthly Sales by Driver</h2>
      
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month"
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip content={CustomTooltip} />
            <Legend />
            {monthlyData.drivers.map((driver, index) => (
              <Bar
                key={driver}
                dataKey={driver}
                stackId="a"
                fill={COLORS[index % COLORS.length]}
                name={driver}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Month
              </th>
              {monthlyData.drivers.map(driver => (
                <th
                  key={driver}
                  className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {driver}
                </th>
              ))}
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {monthlyData.data.map((month) => (
              <tr key={month.month} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {month.month}
                </td>
                {monthlyData.drivers.map(driver => (
                  <td
                    key={driver}
                    className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900"
                  >
                    {formatCurrency(month[driver] as number || 0)}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right text-gray-900">
                  {formatCurrency(month.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthlyDriverSales;