import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard, Banknote, Users, Percent } from 'lucide-react';
import { User as UserType } from '../lib/db/schema';
import { getUserById, getAllDrivers, getRecentSales, deleteSale } from '../lib/db';
import StatCard from './dashboard/StatCard';
import PlatformSummary from './dashboard/PlatformSummary';
import RecentActivity from './dashboard/RecentActivity';
import FilterBar from './common/FilterBar';
import { formatCurrency, formatDate, getDefaultDateRange } from './dashboard/utils';
import { DashboardProps, MonthlyTotals, PlatformSummary as PlatformSummaryType } from './dashboard/types';

const Dashboard: React.FC<DashboardProps> = ({ userRole, userId, companyId, settings }) => {
  const [currentDriver, setCurrentDriver] = useState<UserType | null>(null);
  const [monthlyTotals, setMonthlyTotals] = useState<MonthlyTotals>({
    total: 0,
    card: 0,
    cash: 0,
    commission: 0
  });
  const [driverCount, setDriverCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [recentSales, setRecentSales] = useState<Array<Sale & { driverName: string }>>([]);
  const [platformSummaries, setPlatformSummaries] = useState<PlatformSummaryType[]>([]);
  const [drivers, setDrivers] = useState<UserType[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string>('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dateRange, setDateRange] = useState(() => getDefaultDateRange());

  useEffect(() => {
    const initializeData = async () => {
      try {
        if (userRole === 'admin') {
          await loadDrivers();
        }
        if (userRole === 'driver' && userId) {
          await loadCurrentDriver();
        }
        await loadDashboardData();
      } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        setError('Failed to load dashboard data');
      }
    };
    initializeData();
  }, [userRole, userId]);

  const loadCurrentDriver = async () => {
    if (!userId) return;
    try {
      const driver = await getUserById(userId);
      setCurrentDriver(driver);
      return driver;
    } catch (error) {
      console.error('Failed to load driver data:', error);
      setError('Failed to load driver data');
      return null;
    }
  };

  const loadDrivers = async () => {
    try {
      const allDrivers = await getAllDrivers();
      setDrivers(allDrivers);
      setDriverCount(allDrivers.length);
    } catch (error) {
      console.error('Failed to load drivers:', error);
      setError('Failed to load drivers');
    }
  };

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError('');
    
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

      setRecentSales(sales);

      // Calculate platform summaries
      const platformData = sales.reduce((acc: { [key: string]: PlatformSummaryType }, sale) => {
        if (!acc[sale.platform]) {
          acc[sale.platform] = {
            name: sale.platform,
            totalSale: 0,
            cardPayments: 0,
            cashPayments: 0
          };
        }
        acc[sale.platform].totalSale += sale.totalSale;
        acc[sale.platform].cardPayments += sale.cardPayments;
        acc[sale.platform].cashPayments += sale.cashPayments;
        return acc;
      }, {});

      setPlatformSummaries(Object.values(platformData));

      // Calculate totals
      const totals = sales.reduce(
        (acc, sale) => ({
          total: acc.total + sale.totalSale,
          card: acc.card + sale.cardPayments,
          cash: acc.cash + sale.cashPayments,
        }),
        { total: 0, card: 0, cash: 0 }
      );

      // Calculate commission if applicable
      let commission = 0;
      if (userRole === 'driver' && currentDriver?.commission) {
        commission = (totals.total * currentDriver.commission) / 100;
      }

      setMonthlyTotals({
        ...totals,
        commission
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateRangeChange = (newDateRange: { startDate: string; endDate: string }) => {
    setDateRange(newDateRange);
  };

  const handleDriverChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDriver(e.target.value);
  };

  const handleFilter = () => {
    loadDashboardData();
  };

  const handleDeleteSale = async (saleId: number) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      try {
        await deleteSale(saleId);
        await loadDashboardData();
        setSuccess('Sale deleted successfully');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to delete sale');
      }
    }
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
        <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Dashboard</h1>
        <FilterBar
          userRole={userRole}
          drivers={drivers}
          selectedDriver={selectedDriver}
          dateRange={dateRange}
          onDriverChange={handleDriverChange}
          onDateRangeChange={handleDateRangeChange}
          onFilter={handleFilter}
        />
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Period Total Sales"
          value={formatCurrency(monthlyTotals.total, settings.currency)}
          icon={<DollarSign className="h-6 w-6 text-green-600" />}
          color="bg-green-100"
        />
        <StatCard
          title="Card Payments"
          value={formatCurrency(monthlyTotals.card, settings.currency)}
          icon={<CreditCard className="h-6 w-6 text-blue-600" />}
          color="bg-blue-100"
        />
        <StatCard
          title="Cash Payments"
          value={formatCurrency(monthlyTotals.cash, settings.currency)}
          icon={<Banknote className="h-6 w-6 text-yellow-600" />}
          color="bg-yellow-100"
        />
        {userRole === 'admin' ? (
          <StatCard
            title="Active Drivers"
            value={driverCount.toString()}
            icon={<Users className="h-6 w-6 text-purple-600" />}
            color="bg-purple-100"
          />
        ) : currentDriver && (
          <StatCard
            title="Commission Earned"
            value={formatCurrency(monthlyTotals.commission, settings.currency)}
            subtitle={`${currentDriver.commission}% of total sales`}
            icon={<Percent className="h-6 w-6 text-purple-600" />}
            color="bg-purple-100"
          />
        )}
      </div>

      <PlatformSummary
        platformSummaries={platformSummaries}
        formatCurrency={(amount) => formatCurrency(amount, settings.currency)}
      />

      <RecentActivity
        sales={recentSales}
        userRole={userRole}
        formatCurrency={(amount) => formatCurrency(amount, settings.currency)}
        onDeleteSale={handleDeleteSale}
      />
    </div>
  );
};

export default Dashboard;