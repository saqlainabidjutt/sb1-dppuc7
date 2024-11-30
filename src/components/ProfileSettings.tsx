import React, { useState, useEffect } from 'react';
import { Settings, Save } from 'lucide-react';

interface ProfileSettingsProps {
  onSave: (settings: UserSettings) => void;
  initialSettings?: UserSettings;
}

export interface UserSettings {
  currency: string;
  enabledPlatforms: string[];
}

const AVAILABLE_CURRENCIES = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' }
];

const AVAILABLE_PLATFORMS = [
  'UBER',
  'CABIFY',
  'BOLT',
  'TAXXILO'
];

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onSave, initialSettings }) => {
  const [settings, setSettings] = useState<UserSettings>({
    currency: initialSettings?.currency || 'USD',
    enabledPlatforms: initialSettings?.enabledPlatforms || AVAILABLE_PLATFORMS
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(settings);
  };

  const handlePlatformToggle = (platform: string) => {
    setSettings(prev => ({
      ...prev,
      enabledPlatforms: prev.enabledPlatforms.includes(platform)
        ? prev.enabledPlatforms.filter(p => p !== platform)
        : [...prev.enabledPlatforms, platform]
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Settings className="h-6 w-6 text-indigo-600" />
        <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency
          </label>
          <select
            value={settings.currency}
            onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          >
            {AVAILABLE_CURRENCIES.map(currency => (
              <option key={currency.code} value={currency.code}>
                {currency.code} ({currency.symbol})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enabled Platforms
          </label>
          <div className="space-y-2">
            {AVAILABLE_PLATFORMS.map(platform => (
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
  );
};

export default ProfileSettings;