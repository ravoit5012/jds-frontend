import { useState, useEffect } from 'react';
import { userApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';

type Tab = 'pending' | 'all';

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('pending');
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/'); return; }
    userApi.all().then(setUsers).finally(() => setLoading(false));
  }, [user, navigate]);

  const pending = users.filter(u => !u.isApproved && u.isActive !== false);
  const all = users;

  const handle = async (id: string, action: 'approve' | 'reject' | 'toggle') => {
    setActing(id);
    try {
      let updated: any;
      if (action === 'approve') updated = await userApi.approve(id);
      else if (action === 'reject') updated = await userApi.reject(id);
      else updated = await userApi.toggleActive(id);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, ...updated } : u));
    } finally {
      setActing(null);
    }
  };

  const displayed = tab === 'pending' ? pending : all;

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage user access</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">{users.length} total users</span>
          {pending.length > 0 && (
            <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-2.5 py-0.5 rounded-full font-medium">
              {pending.length} pending
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
        {([['pending', 'Pending Approval'], ['all', 'All Users']] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors relative ${
              tab === key ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {label}
            {key === 'pending' && pending.length > 0 && (
              <span className="ml-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {pending.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : displayed.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-3xl mb-2">{tab === 'pending' ? '🎉' : '👥'}</div>
            <p className="text-gray-400 text-sm">
              {tab === 'pending' ? 'No pending approvals' : 'No users yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="px-5 py-3 text-xs text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-5 py-3 text-xs text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-5 py-3 text-xs text-gray-500 uppercase tracking-wider">2FA</th>
                  <th className="px-5 py-3 text-xs text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-xs text-gray-500 uppercase tracking-wider">Saved</th>
                  <th className="px-5 py-3 text-xs text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {displayed.map(u => {
                  const isMe = u._id === user?._id;
                  const busy = acting === u._id;
                  return (
                    <tr key={u._id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="text-white text-sm font-medium">{u.name}</div>
                            <div className="text-gray-500 text-xs">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          u.role === 'admin'
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-gray-700 text-gray-300'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs ${u.isTwoFactorEnabled ? 'text-green-400' : 'text-gray-600'}`}>
                          {u.isTwoFactorEnabled ? '✓ On' : '— Off'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {u.isApproved ? (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            u.isActive
                              ? 'bg-green-500/20 text-green-300'
                              : 'bg-red-500/20 text-red-300'
                          }`}>
                            {u.isActive ? 'Active' : 'Suspended'}
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 text-sm">
                        {u.savedJds?.length ?? 0}
                      </td>
                      <td className="px-5 py-3.5">
                        {isMe ? (
                          <span className="text-gray-600 text-xs">You</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            {!u.isApproved ? (
                              <>
                                <button
                                  disabled={busy}
                                  onClick={() => handle(u._id, 'approve')}
                                  className="text-xs px-3 py-1 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/40 disabled:opacity-40 transition-colors font-medium"
                                >
                                  {busy ? '…' : '✓ Approve'}
                                </button>
                                <button
                                  disabled={busy}
                                  onClick={() => handle(u._id, 'reject')}
                                  className="text-xs px-3 py-1 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/40 disabled:opacity-40 transition-colors font-medium"
                                >
                                  {busy ? '…' : '✗ Reject'}
                                </button>
                              </>
                            ) : (
                              <button
                                disabled={busy}
                                onClick={() => handle(u._id, 'toggle')}
                                className={`text-xs px-3 py-1 rounded-lg transition-colors disabled:opacity-40 ${
                                  u.isActive
                                    ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                                    : 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                                }`}
                              >
                                {busy ? '…' : u.isActive ? 'Suspend' : 'Restore'}
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
