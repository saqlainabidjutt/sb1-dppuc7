import React, { useState, useEffect } from 'react';
import { BarChart3, Download } from 'lucide-react';
import { getRecentSales, getAllDrivers } from '../lib/db';
import { Sale, User } from '../lib/db/schema';
import { getDefaultDateRange } from './dashboard/utils';
import FilterBar from './common/FilterBar';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import MonthlyDriverSales from './reports/MonthlyDriverSales';

interface ReportsProps {
  userRole: 'admin' | 'driver' | null;
  userId?: number;
  companyId?: number;
  settings: {
    currency: string;
    enabledPlatforms: string[];
  };
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

const Reports: React.FC<ReportsProps> = ({ userRole, userId, companyId, settings }) => {
  const [salesData, setSalesData] = useState<Array<Sale & { driverName: string }>>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string>('all');
  const [dateRange, setDateRange] = useState(() => getDefaultDateRange());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [monthlyTotals, setMonthlyTotals] = useState({
    total: 0,
    card: 0,
    cash: 0,
  });
  const [platformTotals, setPlatformTotals] = useState<{
    [platform: string]: { total: number; card: number; cash: number };
  }>({});
  const [dailySalesByDriver, setDailySalesByDriver] = useState<Array<{
    date: string;
    total: number;
    [key: string]: number | string;
  }>>([]);

  useEffect(() => {
    if (userRole === 'admin') {
      loadDrivers();
    }
    loadData();
  }, [userRole]);

  const loadDrivers = async () => {
    try {
      const allDrivers = await getAllDrivers();
      setDrivers(allDrivers);
    } catch (error) {
      console.error('Failed to load drivers:', error);
      setError('Failed to load drivers');
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const filterUserId = userRole === 'driver' 
        ? userId 
        : selectedDriver !== 'all' 
          ? Number(selectedDriver) 
          : undefined;

      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);

      const sales = await getRecentSales(
        filterUserId,
        companyId,
        startDate,
        endDate
      );

      setSalesData(sales);

      // Calculate platform totals
      const platformSummary = sales.reduce((acc, sale) => {
        if (!acc[sale.platform]) {
          acc[sale.platform] = { total: 0, card: 0, cash: 0 };
        }
        acc[sale.platform].total += sale.totalSale;
        acc[sale.platform].card += sale.cardPayments;
        acc[sale.platform].cash += sale.cashPayments;
        return acc;
      }, {} as { [key: string]: { total: number; card: number; cash: number } });
      setPlatformTotals(platformSummary);

      // Calculate monthly totals
      const totals = sales.reduce(
        (acc, sale) => ({
          total: acc.total + sale.totalSale,
          card: acc.card + sale.cardPayments,
          cash: acc.cash + sale.cashPayments,
        }),
        { total: 0, card: 0, cash: 0 }
      );
      setMonthlyTotals(totals);

      // Process daily sales by driver
      const salesByDate = sales.reduce((acc, sale) => {
        const date = new Date(sale.date).toLocaleDateString();
        
        if (!acc[date]) {
          acc[date] = {
            date,
            total: 0,
          };
        }
        
        acc[date].total += sale.totalSale;
        acc[date][sale.driverName] = (acc[date][sale.driverName] || 0) + sale.totalSale;
        
        return acc;
      }, {} as { [key: string]: { date: string; total: number; [key: string]: number | string } });

      const dailySales = Object.values(salesByDate)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setDailySalesByDriver(dailySales);

    } catch (error) {
      console.error('Failed to load sales data:', error);
      setError('Failed to load sales data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDriverChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDriver(e.target.value);
  };

  const handleDateRangeChange = (newDateRange: { startDate: string; endDate: string }) => {
    setDateRange(newDateRange);
  };

  const handleFilter = () => {
    loadData();
  };

  const formatCurrencyWithSettings = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrencyWithSettings(entry.value)}
            </p>
          ))}
          <p className="font-medium text-gray-900 mt-2 pt-2 border-t">
            Total: {formatCurrencyWithSettings(payload.reduce((sum: number, entry: any) => sum + entry.value, 0))}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Sales Reports</h1>
      </div>

      <FilterBar
        userRole={userRole}
        drivers={drivers}
        selectedDriver={selectedDriver}
        dateRange={dateRange}
        onDriverChange={handleDriverChange}
        onDateRangeChange={handleDateRangeChange}
        onFilter={handleFilter}
      />

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-3">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Period Total Sales</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrencyWithSettings(monthlyTotals.total)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-3">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Card Payments</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrencyWithSettings(monthlyTotals.card)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 rounded-full p-3">
              <BarChart3 className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Cash Payments</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrencyWithSettings(monthlyTotals.cash)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Daily Sales Trend */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Sales Trend</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailySalesByDriver}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => formatCurrencyWithSettings(value)} />
                <Tooltip content={CustomTooltip} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#4F46E5"
                  fill="#4F46E5"
                  fillOpacity={0.1}
                  name="Total Sales"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Distribution and Payment Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Distribution</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(platformTotals).map(([platform, data]) => ({
                      platform,
                      value: data.total
                    }))}
                    dataKey="value"
                    nameKey="platform"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.platform}: ${formatCurrencyWithSettings(entry.value)}`}
                  >
                    {Object.entries(platformTotals).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrencyWithSettings(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Methods</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Object.entries(platformTotals).map(([platform, data]) => ({
                  platform,
                  card: data.card,
                  cash: data.cash
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="platform" />
                  <YAxis tickFormatter={(value) => formatCurrencyWithSettings(value)} />
                  <Tooltip formatter={(value: number) => formatCurrencyWithSettings(value)} />
                  <Legend />
                  <Bar dataKey="card" name="Card Payments" fill="#4F46E5" />
                  <Bar dataKey="cash" name="Cash Payments" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Monthly Sales by Driver (Admin Only) */}
        {userRole === 'admin' && (
          <div>
            <MonthlyDriverSales
              sales={salesData}
              formatCurrency={formatCurrencyWithSettings}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;