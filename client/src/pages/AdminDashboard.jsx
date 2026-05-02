import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [resolutionState, setResolutionState] = useState({});

  const loadUsers = async () => {
    const res = await api.get('/admin/users');
    setUsers(res.data);
  };

  const loadDisputes = async () => {
    const res = await api.get('/orders/disputes/all');
    setDisputes(res.data);
  };

  const loadAnalytics = async () => {
    const res = await api.get('/admin/analytics/revenue');
    setAnalytics(res.data);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      await Promise.all([loadUsers(), loadDisputes(), loadAnalytics()]);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleBan = async () => {
    if (!selectedUserId) return;
    try {
      await api.post(`/admin/users/${selectedUserId}/ban`, { reason: banReason });
      toast.success('User banned');
      setSelectedUserId(null);
      setBanReason('');
      await loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to ban user');
    }
  };

  const handleUnban = async (id) => {
    try {
      await api.post(`/admin/users/${id}/unban`);
      toast.success('User unbanned');
      await loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to unban user');
    }
  };

  const handleResolve = async (orderId) => {
    const data = resolutionState[orderId] || {};
    try {
      await api.post(`/orders/disputes/${orderId}/resolve`, {
        outcome: data.outcome,
        notes: data.notes
      });
      toast.success('Dispute resolved');
      await Promise.all([loadDisputes(), loadAnalytics()]);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to resolve dispute');
    }
  };

  const formatCurrency = (value) => `$${Number(value || 0).toLocaleString()}`;
  const getFileUrl = (filePath) => {
    if (!filePath || typeof filePath !== 'string') return '';
    if (/^https?:\/\//i.test(filePath)) return filePath;
    const apiBase = api.defaults.baseURL || '';
    const serverOrigin = apiBase.replace(/\/api\/?$/, '');
    if (!serverOrigin) return filePath;
    return `${serverOrigin}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
  };
  const formatActor = (entry) => {
    if (!entry) return 'Unknown';
    if (entry.action === 'buyer_comment') return `Buyer (${entry.actor?.name || 'User'})`;
    if (entry.action === 'seller_comment') return `Seller (${entry.actor?.name || 'User'})`;
    if (entry.action === 'opened') return `Opened By (${entry.actor?.name || 'User'})`;
    if (entry.action === 'admin_resolution') return `Admin (${entry.actor?.name || 'User'})`;
    return entry.actor?.name || 'User';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mt-8">
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white rounded-2xl p-6 shadow-xl border border-gray-700">
        <h1 className="text-3xl font-bold">Admin Portal</h1>
        <p className="text-sm text-gray-300 mt-1">Manage users, resolve disputes, and monitor platform revenue.</p>
      </div>

      <div className="flex gap-2 mt-6 mb-6 bg-white dark:bg-gray-800 rounded-xl p-2 border border-gray-200 dark:border-gray-700 shadow-sm w-fit">
        <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'users' ? 'bg-primary text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Users</button>
        <button onClick={() => setActiveTab('disputes')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'disputes' ? 'bg-primary text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Disputes</button>
        <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'analytics' ? 'bg-primary text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Revenue</button>
      </div>

      {loading ? <p className="text-sm text-gray-500 dark:text-gray-300 animate-pulse">Loading admin data...</p> : null}

      {activeTab === 'users' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 overflow-x-auto shadow-sm">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <th className="py-3">Name</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition">
                  <td className="py-3 font-medium text-gray-800 dark:text-gray-100">{u.name}</td>
                  <td className="text-gray-600 dark:text-gray-300">{u.email}</td>
                  <td className="text-gray-600 dark:text-gray-300">{(u.roles || []).join(', ')}</td>
                  <td>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${u.isBanned ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
                      {u.isBanned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="text-right">
                    {u.isBanned ? (
                      <button onClick={() => handleUnban(u._id)} className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-semibold transition">Unban</button>
                    ) : (
                      <button onClick={() => setSelectedUserId(u._id)} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold transition">Ban</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {selectedUserId && (
            <div className="mt-4 p-4 border border-red-200 dark:border-red-800/50 rounded-xl bg-red-50/70 dark:bg-red-900/10">
              <p className="font-semibold mb-2 text-red-700 dark:text-red-300">Ban reason</p>
              <textarea className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-red-400" value={banReason} onChange={(e) => setBanReason(e.target.value)} />
              <div className="flex gap-2 mt-2">
                <button onClick={handleBan} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition">Confirm Ban</button>
                <button onClick={() => { setSelectedUserId(null); setBanReason(''); }} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition">Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'disputes' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={loadDisputes}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              Refresh Disputes
            </button>
          </div>
          {disputes.map((d) => (
            <div key={d._id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-gray-800 dark:text-gray-100">{d.service?.title || 'Service'}</p>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                  {String(d.disputeCategory || 'dispute').replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Client: {d.client?.name} | Freelancer: {d.freelancer?.name}</p>
              <p className="text-sm mt-3 text-gray-700 dark:text-gray-300">{d.disputeReason}</p>

              <div className="mt-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/40 p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Evidence Timeline</p>
                  <span className="text-xs px-2 py-0.5 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    {(d.disputeTimeline || []).length} entries
                  </span>
                </div>

                {(d.disputeTimeline || []).length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No evidence added yet.</p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {d.disputeTimeline.map((entry, index) => (
                      <div key={`${entry._id || index}-${entry.createdAt || index}`} className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{formatActor(entry)}</p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : 'Unknown time'}
                          </p>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{entry.note}</p>
                        {entry.attachmentUrl && (
                          <a
                            href={getFileUrl(entry.attachmentUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                          >
                            View Attachment{entry.attachmentName ? `: ${entry.attachmentName}` : ''}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 grid md:grid-cols-2 gap-3">
                <select
                  className="border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-primary"
                  value={resolutionState[d._id]?.outcome || ''}
                  onChange={(e) => setResolutionState((prev) => ({ ...prev, [d._id]: { ...(prev[d._id] || {}), outcome: e.target.value } }))}
                >
                  <option value="">Select outcome</option>
                  <option value="released_to_seller">Release funds to seller</option>
                  <option value="refunded_to_buyer">Refund buyer</option>
                </select>
                <input
                  className="border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Resolution notes"
                  value={resolutionState[d._id]?.notes || ''}
                  onChange={(e) => setResolutionState((prev) => ({ ...prev, [d._id]: { ...(prev[d._id] || {}), notes: e.target.value } }))}
                />
              </div>
              <button onClick={() => handleResolve(d._id)} className="mt-3 px-4 py-2 bg-primary hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition">
                Resolve Dispute
              </button>
            </div>
          ))}
          {disputes.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-500">
              No active disputes.
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && analytics && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-900/50">
              <p className="text-xs text-blue-700 dark:text-blue-300">Gross Volume</p>
              <p className="font-bold text-xl text-blue-900 dark:text-blue-200">{formatCurrency(analytics.totals.grossVolume)}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
              <p className="text-xs text-emerald-700 dark:text-emerald-300">Platform Revenue</p>
              <p className="font-bold text-xl text-emerald-900 dark:text-emerald-200">{formatCurrency(analytics.totals.platformRevenue)}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-800/20 rounded-xl border border-violet-200 dark:border-violet-900/50">
              <p className="text-xs text-violet-700 dark:text-violet-300">Seller Payouts</p>
              <p className="font-bold text-xl text-violet-900 dark:text-violet-200">{formatCurrency(analytics.totals.sellerPayouts)}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl border border-amber-200 dark:border-amber-900/50">
              <p className="text-xs text-amber-700 dark:text-amber-300">Completed Orders</p>
              <p className="font-bold text-xl text-amber-900 dark:text-amber-200">{analytics.totals.completedOrders}</p>
            </div>
          </div>
          <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-100">Monthly Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  <th className="text-left py-3">Month</th>
                  <th className="text-left">Gross</th>
                  <th className="text-left">Revenue</th>
                  <th className="text-left">Payout</th>
                  <th className="text-left">Orders</th>
                </tr>
              </thead>
              <tbody>
                {analytics.monthly.map((m) => (
                  <tr key={m.month} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition">
                    <td className="py-3 font-medium text-gray-800 dark:text-gray-100">{m.month}</td>
                    <td>{formatCurrency(m.gross)}</td>
                    <td>{formatCurrency(m.revenue)}</td>
                    <td>{formatCurrency(m.payout)}</td>
                    <td><span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs font-semibold">{m.completedOrders}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
