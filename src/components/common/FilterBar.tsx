import React, { useState, useEffect } from 'react';
import { Filter, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { User } from '../../lib/db/schema';

interface FilterBarProps {
  userRole: 'admin' | 'driver' | null;
  drivers?: User[];
  selectedDriver: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  onDriverChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onDateRangeChange: (newDateRange: { startDate: string; endDate: string }) => void;
  onFilter: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  userRole,
  drivers = [],
  selectedDriver,
  dateRange,
  onDriverChange,
  onDateRangeChange,
  onFilter,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('custom');

  useEffect(() => {
    if (activeFilter !== 'custom') {
      onFilter();
    }
  }, [dateRange, activeFilter, onFilter]);

  const handleQuickFilter = (filter: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let startDate: Date;
    let endDate: Date;

    switch (filter) {
      case 'today':
        startDate = today;
        endDate = today;
        break;
      case 'yesterday':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 1);
        endDate = new Date(startDate);
        break;
      case 'last7':
        endDate = today;
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 6);
        break;
      default:
        return;
    }

    onDateRangeChange({
      startDate: formatDateForInput(startDate),
      endDate: formatDateForInput(endDate),
    });
    
    setActiveFilter(filter);
  };

  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (type: 'startDate' | 'endDate', value: string) => {
    setActiveFilter('custom');
    onDateRangeChange({
      ...dateRange,
      [type]: value,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg mb-6">
      {/* Mobile Toggle */}
      <div className="sm:hidden">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <div className="flex items-center">
            <Filter className="h-5 w-5 mr-2 text-gray-500" />
            <span>Filters</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
      </div>

      {/* Filter Content */}
      <div className={`${isExpanded ? 'block' : 'hidden'} sm:block p-4`}>
        <form onSubmit={(e) => { e.preventDefault(); onFilter(); }}>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              {/* Driver Selection (Admin Only) */}
              {userRole === 'admin' && (
                <div className="w-full sm:w-auto">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Driver
                  </label>
                  <select
                    value={selectedDriver}
                    onChange={onDriverChange}
                    className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    <option value="all">All Drivers</option>
                    {drivers.map(driver => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Date Range Section */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Quick Filter Buttons */}
                  <div className="inline-flex rounded-md shadow-sm" role="group">
                    <button
                      type="button"
                      onClick={() => handleQuickFilter('today')}
                      className={`
                        relative inline-flex items-center px-4 py-2 rounded-l-lg text-sm font-medium
                        focus:z-10 focus:outline-none focus:ring-2 focus:ring-indigo-500
                        border border-gray-200 transition-colors duration-200
                        ${activeFilter === 'today'
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickFilter('yesterday')}
                      className={`
                        relative inline-flex items-center px-4 py-2 text-sm font-medium
                        focus:z-10 focus:outline-none focus:ring-2 focus:ring-indigo-500
                        border-t border-b border-gray-200 transition-colors duration-200
                        ${activeFilter === 'yesterday'
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      Yesterday
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickFilter('last7')}
                      className={`
                        relative inline-flex items-center px-4 py-2 rounded-r-lg text-sm font-medium
                        focus:z-10 focus:outline-none focus:ring-2 focus:ring-indigo-500
                        border border-gray-200 transition-colors duration-200
                        ${activeFilter === 'last7'
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      Last 7 Days
                    </button>
                  </div>

                  {/* Custom Date Inputs */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => handleDateChange('startDate', e.target.value)}
                        className="w-full sm:w-auto pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                    <span className="text-gray-500">to</span>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => handleDateChange('endDate', e.target.value)}
                        className="w-full sm:w-auto pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter Button */}
              <div className="w-full sm:w-auto self-end">
                <button 
                  type="submit"
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm font-medium transition-colors duration-200"
                >
                  <Filter className="h-5 w-5" />
                  <span>Apply Filters</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FilterBar;