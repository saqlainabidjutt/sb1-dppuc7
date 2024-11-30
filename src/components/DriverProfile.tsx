import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Mail, Save, ArrowLeft, Percent } from 'lucide-react';
import { getUserById, updateUser, getSalesByUserId } from '../lib/db';
import { User as UserType, Sale } from '../lib/db/schema';

const DriverProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [driver, setDriver] = useState<UserType | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    commission: '0',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadDriverData();
  }, [id]);

  const loadDriverData = async () => {
    if (!id) return;
    
    try {
      const driverData = await getUserById(Number(id));
      const salesData = await getSalesByUserId(Number(id));
      
      if (driverData) {
        setDriver(driverData);
        setFormData({
          name: driverData.name,
          email: driverData.email,
          password: '',
          commission: driverData.commission?.toString() || '0',
        });
      }
      
      setSales(salesData);
    } catch (err) {
      setError('Failed to load driver data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      await updateUser(Number(id), {
        name: formData.name,
        email: formData.email,
        commission: Number(formData.commission),
        ...(formData.password ? { password: formData.password } : {}),
      });
      setSuccess('Profile updated successfully');
      loadDriverData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
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

  if (!driver) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/drivers')}
        className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Drivers</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Driver Profile</h2>

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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <span>Name</span>
                </div>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                required
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <span>New Password (leave blank to keep current)</span>
                </div>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Save className="h-5 w-5" />
                <span>Update Profile</span>
              </button>
            </div>
          </form>
        </div>

        {/* Sales History */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Sales History</h2>
          <div className="space-y-4">
            {sales.map((sale) => (
              <div
                key={sale.id}
                className="p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(sale.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">Platform: {sale.platform}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      Total: ${sale.totalSale.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Card: ${sale.cardPayments.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Cash: ${sale.cashPayments.toFixed(2)}
                    </p>
                    <p className="text-sm text-indigo-600">
                      Commission: ${((sale.totalSale * Number(formData.commission)) / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;