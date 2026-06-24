import { useState, type FormEvent } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login, verify2fa } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState<'login' | '2fa'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsPending(false);
    setLoading(true);
    try {
      const { requiresTwoFactor } = await login(email, password);
      if (requiresTwoFactor) setStep('2fa');
      else navigate('/');
    } catch (err: any) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || 'Invalid email or password';
      if (status === 403) {
        setIsPending(true);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handle2fa = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verify2fa(code);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid 2FA code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">📋</div>
          <div className="text-3xl font-bold text-stone-100 mb-1">JD Explorer</div>
          <div className="text-orange-400 text-sm">IIT Delhi Placement Portal</div>
        </div>

        <div className="bg-stone-900 border border-stone-700 rounded-2xl p-8 shadow-2xl">

          {searchParams.get('registered') && (
            <div className="mb-5 bg-green-500/15 border border-green-600/30 rounded-lg px-4 py-3 text-green-400 text-sm text-center">
              Account created! Please wait for admin approval before signing in.
            </div>
          )}

          {isPending ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">⏳</div>
              <h2 className="text-stone-100 font-semibold text-lg mb-2">Approval Pending</h2>
              <p className="text-stone-400 text-sm leading-relaxed">
                Your account is awaiting admin approval. You'll be able to sign in once approved.
              </p>
              <button
                onClick={() => { setIsPending(false); setEmail(''); setPassword(''); }}
                className="mt-5 text-sm text-orange-400 hover:text-orange-300 underline"
              >
                Back to login
              </button>
            </div>
          ) : step === 'login' ? (
            <>
              <h2 className="text-xl font-semibold text-stone-100 mb-6">Sign In</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm text-stone-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="abc@iitd.ac.in"
                  />
                </div>

                <div>
                  <label className="block text-sm text-stone-400 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 pr-12 text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors select-none"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>

              <p className="text-center text-stone-500 text-sm mt-6">
                Don't have an account?{' '}
                <Link to="/register" className="text-orange-400 hover:text-orange-300">Register</Link>
              </p>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="text-3xl mb-2">🔐</div>
                <h2 className="text-xl font-semibold text-stone-100">Two-Factor Auth</h2>
                <p className="text-stone-400 text-sm mt-1">Enter the 6-digit OTP from your authenticator app</p>
              </div>
              <form onSubmit={handle2fa} className="space-y-4">
                <input
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-4 text-stone-100 text-center text-3xl tracking-widest font-mono placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="000000"
                  autoFocus
                />
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  {loading ? 'Verifying…' : 'Verify OTP'}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep('login'); setCode(''); setError(''); }}
                  className="w-full text-stone-500 text-sm hover:text-stone-300"
                >
                  ← Back to login
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
