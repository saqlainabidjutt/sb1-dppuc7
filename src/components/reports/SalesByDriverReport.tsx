import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Sale } from '../../lib/db/schema';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface SalesByDriverReportProps {
  sales: Array<Sale & { driverName: string }>;
  formatCurrency: (amount: number) => string;
}

interface DateGroup {
  date: string;
  totalSales: number;
  isExpanded: boolean;
  drivers: {
    [key: string]: {
      name: string;
      total: number;
      cardTotal: number;
      cashTotal: number;
    };
  };
}

const COLORS = [
  '#4F46E5', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
];

const SalesByDriverReport: React.FC<SalesByDriverReportProps> = ({ sales, formatCurrency }) => {
  // Group sales by date and then by driver
  const initialGroupedData = sales.reduce((acc: { [key: string]: DateGroup }, sale) => {
    const date = new Date(sale.date).toLocaleDateString();
    
    if (!acc[date]) {
      acc[date] = {
        date,
        totalSales: 0,
        isExpanded: false,
        drivers: {}
      };
    }
    
    if (!acc[date].drivers[sale.driverName]) {
      acc[date].drivers[sale.driverName] = {
        name: sale.driverName,
        total: 0,
        cardTotal: 0,
        cashTotal: 0
      };
    }
    
    acc[date].totalSales += sale.totalSale;
    acc[date].drivers[sale.driverName].total += sale.totalSale;
    acc[date].drivers[sale.driverName].cardTotal += sale.cardPayments;
    acc[date].drivers[sale.driverName].cashTotal += sale.cashPayments;
    
    return acc;
  }, {});

  const [groupedData, setGroupedData] = useState<{ [key: string]: DateGroup }>(initialGroupedData);

  const toggleDateExpansion = (date: string) => {
    setGroupedData(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        isExpanded: !prev[date].isExpanded
      }
    }));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-indigo-600">Total: {formatCurrency(data.total)}</p>
          {data.cardTotal !== undefined && (
            <>
              <p className="text-emerald-600">Card: {formatCurrency(data.cardTotal)}</p>
              <p className="text-amber-600">Cash: {formatCurrency(data.cashTotal)}</p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg">
        {Object.entries(groupedData)
          .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
          .map(([date, data]) => (
            <div key={date} className="border-b border-gray-200 last:border-b-0">
              {/* Date Header */}
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleDateExpansion(date)}
              >
                <div className="flex items-center space-x-3">
                  {data.isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                  <h3 className="text-lg font-medium text-gray-900">{date}</h3>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(data.totalSales)}
                  </p>
                </div>
              </div>

              {/* Driver Breakdown */}
              {data.isExpanded && (
                <div className="px-4 pb-4">
                  <div className="h-[300px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Object.values(data.drivers)
                          .sort((a, b) => b.total - a.total)}
                        layout="vertical"
                        margin={{ left: 100 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={formatCurrency} />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          width={100}
                        />
                        <Tooltip content={CustomTooltip} />
                        <Legend />
                        <Bar 
                          dataKey="total" 
                          name="Total Sales"
                          radius={[0, 4, 4, 0]}
                        >
                          {Object.values(data.drivers).map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Detailed Table */}
                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Driver
                          </th>
                          <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Card Payments
                          </th>
                          <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cash Payments
                          </th>
                          <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Sales
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Object.values(data.drivers)
                          .sort((a, b) => b.total - a.total)
                          .map((driver) => (
                            <tr key={driver.name} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                {driver.name}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                                {formatCurrency(driver.cardTotal)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                                {formatCurrency(driver.cashTotal)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                                {formatCurrency(driver.total)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            Total
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                            {formatCurrency(
                              Object.values(data.drivers).reduce((sum, driver) => sum + driver.cardTotal, 0)
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                            {formatCurrency(
                              Object.values(data.drivers).reduce((sum, driver) => sum + driver.cashTotal, 0)
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                            {formatCurrency(data.totalSales)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default SalesByDriverReport;