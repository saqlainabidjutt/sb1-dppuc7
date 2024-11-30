import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard, Banknote, Save, User, Car } from 'lucide-react';
import { createSale, getAllDrivers } from '../lib/db';
import { User as UserType } from '../lib/db/schema';

interface SalesEntryProps {
  userRole: 'admin' | 'driver' | null;
  userId?: number;
  userName?: string;
  companyId?: number;
  enabledPlatforms: string[];
  settings?: {
    currency: string;
  };
}

const SalesEntry: React.FC<SalesEntryProps> = ({ 
  userRole, 
  userId, 
  userName, 
  companyId,
  enabledPlatforms, 
  settings 
}) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    platform: '',
    cardPayments: '',
    cashPayments: '',
    totalSale: '',
    notes: '',
    selectedDriver: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [drivers, setDrivers] = useState<UserType[]>([]);

  const currencySymbol = settings?.currency === 'EUR' ? '€' : 
                        settings?.currency === 'GBP' ? '£' : '$';

  useEffect(() => {
    if (userRole === 'admin') {
      loadDrivers();
    }
  }, [userRole]);

  const loadDrivers = async () => {
    try {
      const allDrivers = await getAllDrivers();
      setDrivers(allDrivers);
    } catch (err) {
      setError('Failed to load drivers');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const submittingUserId = userRole === 'admin' ? Number(formData.selectedDriver) : userId;
      
      if (!submittingUserId) {
        throw new Error('Please select a driver');
      }

      if (!companyId) {
        throw new Error('Company ID is required');
      }

      const cardPayments = Number(formData.cardPayments) || 0;
      const cashPayments = Number(formData.cashPayments) || 0;
      const totalSale = Number(formData.totalSale);

      if (!formData.totalSale || totalSale <= 0) {
        throw new Error('Total sale amount is required and must be greater than zero');
      }

      // Get the creator's information
      const creatorId = userId;
      const creatorName = userName;

      if (!creatorId || !creatorName) {
        throw new Error('Creator information is missing');
      }

      await createSale(
        submittingUserId,
        companyId,
        new Date(formData.date),
        formData.platform,
        cardPayments,
        cashPayments,
        totalSale,
        formData.notes,
        { id: creatorId, name: creatorName }
      );

      setSuccess('Sales data submitted successfully!');
      setFormData({
        date: new Date().toISOString().split('T')[0],
        platform: '',
        cardPayments: '',
        cashPayments: '',
        totalSale: '',
        notes: '',
        selectedDriver: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save sales data');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Remove duplicates from enabledPlatforms array
  const uniquePlatforms = Array.from(new Set(enabledPlatforms));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Daily Sales Entry</h1>
        
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
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <Car className="h-5 w-5 text-gray-400" />
                  <span>Platform</span>
                </div>
              </label>
              <select
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select a platform</option>
                {uniquePlatforms.map(platform => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </select>
            </div>

            {userRole === 'admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-400" />
                    <span>Select Driver</span>
                  </div>
                </label>
                <select
                  name="selectedDriver"
                  value={formData.selectedDriver}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select a driver</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <span>Card Payments</span>
                </div>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">{currencySymbol}</span>
                </div>
                <input
                  type="number"
                  name="cardPayments"
                  value={formData.cardPayments}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <Banknote className="h-5 w-5 text-gray-400" />
                  <span>Cash Payments</span>
                </div>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">{currencySymbol}</span>
                </div>
                <input
                  type="number"
                  name="cashPayments"
                  value={formData.cashPayments}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <span>Total Sale</span>
                </div>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">{currencySymbol}</span>
                </div>
                <input
                  type="number"
                  name="totalSale"
                  value={formData.totalSale}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Add any additional notes here..."
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
            >
              <Save className="h-5 w-5" />
              <span>Save Entry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalesEntry;