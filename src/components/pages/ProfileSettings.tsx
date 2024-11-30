import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Plus, X } from 'lucide-react';
import { AVAILABLE_CURRENCIES } from '../../lib/db/schema';
import { getCompanyById, updateCompany } from '../../lib/db';
import { getSettings, updateSettings as updateSettingsInDb, DEFAULT_SETTINGS } from '../../lib/db/settings';
import type { Settings } from '../../lib/db/types';

interface ProfileSettingsPageProps {
  onSave: (settings: Settings) => void;
  initialSettings?: Settings;
  companyId?: number;
  userRole: 'admin' | 'driver' | null;
}

interface CompanyData {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

const ProfileSettingsPage: React.FC<ProfileSettingsPageProps> = ({ 
  onSave, 
  initialSettings,
  companyId,
  userRole
}) => {
  const [settings, setSettings] = useState<Settings>(initialSettings || DEFAULT_SETTINGS);
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: ''
  });
  
  const [newPlatform, setNewPlatform] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (!companyId) {
        throw new Error('Company ID is required');
      }

      const [company, settingsData] = await Promise.all([
        getCompanyById(companyId),
        getSettings(companyId)
      ]);

      if (company) {
        setCompanyData({
          name: company.name,
          address: company.address || '',
          phone: company.phone || '',
          email: company.email || '',
          website: company.website || ''
        });
      }

      if (settingsData) {
        setSettings(settingsData);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      if (!companyId) {
        throw new Error('Company ID is required');
      }

      await Promise.all([
        updateSettingsInDb(companyId, settings),
        updateCompany(companyId, companyData)
      ]);

      onSave(settings);
      setSuccess('Settings saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    }
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlatformToggle = (platform: string) => {
    setSettings(prev => ({
      ...prev,
      enabledPlatforms: prev.enabledPlatforms.includes(platform)
        ? prev.enabledPlatforms.filter(p => p !== platform)
        : [...prev.enabledPlatforms, platform]
    }));
  };

  const handleAddCustomPlatform = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlatform.trim()) {
      const platformName = newPlatform.trim().toUpperCase();
      if (!settings.customPlatforms.includes(platformName)) {
        setSettings(prev => ({
          ...prev,
          customPlatforms: [...prev.customPlatforms, platformName],
          enabledPlatforms: [...prev.enabledPlatforms, platformName]
        }));
      }
      setNewPlatform('');
    }
  };

  const handleRemoveCustomPlatform = (platform: string) => {
    setSettings(prev => ({
      ...prev,
      customPlatforms: prev.customPlatforms.filter(p => p !== platform),
      enabledPlatforms: prev.enabledPlatforms.filter(p => p !== platform)
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-2 mb-6">
          <SettingsIcon className="h-6 w-6 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
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
            <h3 className="text-lg font-medium text-gray-900">Company Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                name="name"
                value={companyData.name}
                onChange={handleCompanyChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={companyData.address}
                onChange={handleCompanyChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={companyData.phone}
                  onChange={handleCompanyChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={companyData.email}
                  onChange={handleCompanyChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={companyData.website}
                onChange={handleCompanyChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Application Settings</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                name="currency"
                value={settings.currency}
                onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              >
                {AVAILABLE_CURRENCIES.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.name} ({currency.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enabled Platforms
              </label>
              <div className="space-y-2">
                {DEFAULT_SETTINGS.enabledPlatforms.map(platform => (
                  <label key={platform} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.enabledPlatforms.includes(platform)}
                      onChange={() => handlePlatformToggle(platform)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-gray-700">{platform}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Platforms
              </label>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value)}
                    placeholder="Enter platform name"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomPlatform}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {settings.customPlatforms.map(platform => (
                    <div key={platform} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">{platform}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomPlatform(platform)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Save className="h-5 w-5" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;