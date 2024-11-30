import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, DollarSign, CreditCard, Banknote, Car, Clock, User, Trash2 } from 'lucide-react';
import { Sale } from '../lib/db/schema';
import { getSaleById, updateSale, deleteSale } from '../lib/db';
import { formatDateTime } from './dashboard/utils';

interface EditSaleProps {
  userRole: 'admin' | 'driver' | null;
  userId?: number;
  userName?: string;
  companyId?: number;
  enabledPlatforms: string[];
  settings?: {
    currency: string;
  };
}

const EditSale: React.FC<EditSaleProps> = ({ 
  userRole, 
  userId, 
  userName,
  companyId,
  enabledPlatforms,
  settings 
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sale, setSale] = useState<Sale | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    platform: '',
    cardPayments: '',
    cashPayments: '',
    totalSale: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const currencySymbol = settings?.currency === 'EUR' ? '€' : 
                        settings?.currency === 'GBP' ? '£' : '$';

  useEffect(() => {
    loadSaleData();
  }, [id]);

  const loadSaleData = async () => {
    if (!id) return;
    
    try {
      const saleData = await getSaleById(Number(id));
      if (saleData) {
        setSale(saleData);
        setFormData({
          date: new Date(saleData.date).toISOString().split('T')[0],
          platform: saleData.platform,
          cardPayments: saleData.cardPayments.toString(),
          cashPayments: saleData.cashPayments.toString(),
          totalSale: saleData.totalSale.toString(),
          notes: saleData.notes || ''
        });
      }
    } catch (err) {
      setError('Failed to load sale data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (!id) {
        setError('Sale ID is missing');
        return;
      }

      const cardPayments = Number(formData.cardPayments) || 0;
      const cashPayments = Number(formData.cashPayments) || 0;
      const totalSale = Number(formData.totalSale) || cardPayments + cashPayments;

      if (totalSale <= 0) {
        setError('Total sale amount must be greater than zero');
        return;
      }

      await updateSale(Number(id), {
        date: new Date(formData.date),
        platform: formData.platform,
        cardPayments,
        cashPayments,
        totalSale,
        notes: formData.notes,
        userId: sale?.userId || 0,
        companyId: companyId || 0,
        updatedAt: new Date()
      }, {
        id: userId || 0,
        name: userName || 'Unknown User'
      });
      
      setSuccess('Sale updated successfully');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update sale');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setIsDeleting(true);
      await deleteSale(Number(id));
      setSuccess('Sale deleted successfully');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError('Failed to delete sale');
      setIsDeleting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Remove duplicates from enabledPlatforms array
  const uniquePlatforms = Array.from(new Set(enabledPlatforms));

  if (!sale) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Dashboard</span>
      </button>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Edit Sale Entry</h2>
          {userRole === 'admin' && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              <Trash2 className="h-5 w-5" />
              <span>{isDeleting ? 'Deleting...' : 'Delete Sale'}</span>
            </button>
          )}
        </div>

        <div className="text-sm text-gray-500 space-y-1 mb-6">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Last Modified: {formatDateTime(sale.updated_at)}</span>
          </div>
          {sale.lastModifiedByName && (
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Modified By: {sale.lastModifiedByName}</span>
            </div>
          )}
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
              className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Save className="h-5 w-5" />
              <span>Update Sale</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSale;