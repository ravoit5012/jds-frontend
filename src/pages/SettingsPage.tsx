import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { authApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'idle' | 'setup' | 'disable'>('idle');

  const startSetup = async () => {
    setLoading(true);
    try {
      const data = await authApi.setup2fa();
      setQrCode(data.qrCode);
      setStep('setup');
    } catch {
      setMessage({ type: 'error', text: 'Failed to generate 2FA secret' });
    } finally {
      setLoading(false);
    }
  };

  const enable2fa = async () => {
    if (!code || code.length !== 6) return;
    setLoading(true);
    try {
      await authApi.enable2fa(code);
      setMessage({ type: 'success', text: '2FA enabled successfully!' });
      setStep('idle');
      setQrCode(null);
      setCode('');
      await refreshUser();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Invalid code' });
    } finally {
      setLoading(false);
    }
  };

  const disable2fa = async () => {
    if (!code || code.length !== 6) return;
    setLoading(true);
    try {
      await authApi.disable2fa(code);
      setMessage({ type: 'success', text: '2FA disabled.' });
      setStep('idle');
      setCode('');
      await refreshUser();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Invalid code' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Account Settings</h1>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-4">
          <h2 className="text-white font-semibold mb-4">Profile</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div className="text-white font-medium">{user?.name}</div>
                <div className="text-gray-400 text-sm">{user?.email}</div>
                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full mt-1 inline-block">{user?.role}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-white font-semibold">Two-Factor Authentication</h2>
              <p className="text-gray-500 text-sm mt-0.5">Add an extra layer of security with TOTP</p>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${user?.isTwoFactorEnabled ? 'bg-green-500/20 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
              {user?.isTwoFactorEnabled ? '✓ Enabled' : 'Disabled'}
            </span>
          </div>

          {message && (
            <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
              {message.text}
            </div>
          )}

          {step === 'idle' && !user?.isTwoFactorEnabled && (
            <button
              onClick={startSetup}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? 'Generating…' : 'Enable 2FA'}
            </button>
          )}

          {step === 'setup' && qrCode && (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm">Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>
              <div className="bg-white p-4 rounded-xl inline-block">
                <QRCodeSVG value={qrCode.replace('data:image/png;base64,', '')} size={180} />
              </div>
              <p className="text-gray-500 text-xs">Or manually enter the setup key shown in your authenticator app.</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code to confirm"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={6}
                />
                <button
                  onClick={enable2fa}
                  disabled={loading || code.length !== 6}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          )}

          {step === 'idle' && user?.isTwoFactorEnabled && (
            <div className="space-y-3">
              {step === 'idle' && (
                <button
                  onClick={() => setStep('disable')}
                  className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium transition-colors"
                >
                  Disable 2FA
                </button>
              )}
            </div>
          )}

          {step === 'disable' && (
            <div className="space-y-3">
              <p className="text-gray-400 text-sm">Enter your current authenticator code to disable 2FA:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit code"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={6}
                  autoFocus
                />
                <button
                  onClick={disable2fa}
                  disabled={loading || code.length !== 6}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium"
                >
                  Disable
                </button>
                <button onClick={() => { setStep('idle'); setCode(''); }} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
