import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../lib/api';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await authApi.register({ name: form.name, email: form.email, password: form.password });
      setDone(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ on }: { on: boolean }) => on ? (
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
  );

  const EyeButton = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
    <button type="button" onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
      tabIndex={-1}>
      <EyeIcon on={show} />
    </button>
  );

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">📋</div>
          <div className="text-3xl font-bold text-stone-100 mb-1">JD Explorer</div>
          <div className="text-orange-400 text-sm">IIT Delhi Placement Portal</div>
        </div>

        <div className="bg-stone-900 border border-stone-700 rounded-2xl p-8 shadow-2xl">
          {done ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-stone-100 text-xl font-semibold mb-2">Registration Submitted</h2>
              <p className="text-stone-400 text-sm leading-relaxed mb-2">Your account has been created successfully.</p>
              <p className="text-stone-400 text-sm leading-relaxed mb-6">
                An admin will review and approve your access. Once approved, you can sign in with your credentials.
              </p>
              <div className="bg-stone-800 rounded-xl p-4 text-left mb-6">
                <p className="text-stone-500 text-xs uppercase tracking-wider mb-1">Registered as</p>
                <p className="text-stone-100 font-medium">{form.name}</p>
                <p className="text-orange-400 text-sm">{form.email}</p>
              </div>
              <Link to="/login"
                className="inline-block w-full text-center bg-orange-600 hover:bg-orange-500 text-white font-semibold py-3 rounded-lg transition-colors">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-stone-100 mb-1">Create Account</h2>
              <p className="text-stone-500 text-xs mb-5">Access requires admin approval after registration.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { label: 'Full Name', field: 'name', type: 'text', placeholder: 'Your Name' },
                  { label: 'Email', field: 'email', type: 'email', placeholder: 'abc@iitd.ac.in' },
                ].map(({ label, field, type, placeholder }) => (
                  <div key={field}>
                    <label className="block text-sm text-stone-400 mb-1">{label}</label>
                    <input
                      type={type}
                      value={(form as any)[field]}
                      onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                      required
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder={placeholder}
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-sm text-stone-400 mb-1">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={8}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 pr-12 text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="8+ characters" />
                    <EyeButton show={showPassword} onToggle={() => setShowPassword(v => !v)} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-stone-400 mb-1">Confirm Password</label>
                  <div className="relative">
                    <input type={showConfirm ? 'text' : 'password'} value={form.confirm}
                      onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} required
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 pr-12 text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="••••••••" />
                    <EyeButton show={showConfirm} onToggle={() => setShowConfirm(v => !v)} />
                  </div>
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <button type="submit" disabled={loading}
                  className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors">
                  {loading ? 'Creating account…' : 'Request Access'}
                </button>
              </form>

              <p className="text-center text-stone-500 text-sm mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-orange-400 hover:text-orange-300">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
