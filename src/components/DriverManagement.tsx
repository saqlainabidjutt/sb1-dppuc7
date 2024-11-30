import React, { useState, useEffect } from 'react';
import { UserPlus, Users, Mail, User, Edit, Trash2, Percent } from 'lucide-react';
import { createUser, getAllDrivers } from '../lib/db';
import { User as UserType } from '../lib/db/schema';
import { Link } from 'react-router-dom';

interface DriverManagementProps {
  adminId?: number;
  companyId?: number;
}

const DriverManagement: React.FC<DriverManagementProps> = ({ adminId, companyId }) => {
  const [drivers, setDrivers] = useState<UserType[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    commission: '0',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      const allDrivers = await getAllDrivers();
      setDrivers(allDrivers);
    } catch (err) {
      setError('Failed to load drivers');
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      throw new Error('Driver name is required');
    }
    if (!formData.email.trim()) {
      throw new Error('Email is required');
    }
    if (!formData.password || formData.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    if (isNaN(Number(formData.commission)) || Number(formData.commission) < 0 || Number(formData.commission) > 100) {
      throw new Error('Commission must be between 0 and 100');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      validateForm();

      if (!companyId) {
        throw new Error('Company ID is required');
      }

      await createUser(
        formData.email,
        formData.password,
        'driver',
        formData.name,
        companyId,
        Number(formData.commission)
      );

      setSuccess('Driver added successfully!');
      setFormData({
        name: '',
        email: '',
        password: '',
        commission: '0',
      });
      await loadDrivers();
    } catch (err) {
      console.error('Error creating driver:', err);
      setError(err instanceof Error ? err.message : 'Failed to add driver');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'commission') {
      const numValue = Math.min(100, Math.max(0, Number(value)));
      setFormData(prev => ({ ...prev, [name]: numValue.toString() }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Driver List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Users className="h-6 w-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Driver List</h2>
          </div>

          <div className="space-y-4">
            {drivers.map(driver => (
              <div 
                key={driver.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center space-x-4">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{driver.name}</p>
                    <p className="text-sm text-gray-500">{driver.email}</p>
                    <p className="text-sm text-indigo-600">Commission: {driver.commission}%</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/drivers/${driver.id}`}
                    className="p-2 text-blue-600 hover:text-blue-800 transition"
                  >
                    <Edit className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            ))}

            {drivers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No drivers added yet
              </div>
            )}
          </div>
        </div>

        {/* Add New Driver Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-6">
            <UserPlus className="h-6 w-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Add New Driver</h2>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-400" />
                    <span>Driver Name</span>
                  </div>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span>Email</span>
                  </div>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-400" />
                    <span>Password</span>
                  </div>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Percent className="h-5 w-5 text-gray-400" />
                    <span>Commission (%)</span>
                  </div>
                </label>
                <input
                  type="number"
                  name="commission"
                  value={formData.commission}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:opacity-50"
              >
                <UserPlus className="h-5 w-5" />
                <span>{isLoading ? 'Adding...' : 'Add Driver'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DriverManagement;