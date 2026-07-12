import React, { useEffect, useState } from 'react';
import { showToast } from '../services/toast.jsx';
import api from '../services/api';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [resolutionState, setResolutionState] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [detailUser, setDetailUser] = useState(null);

  // Gigs and Jobs Admin state
  const [gigs, setGigs] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [gigSearchQuery, setGigSearchQuery] = useState('');
  const [jobSearchQuery, setJobSearchQuery] = useState('');

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

  const loadGigs = async () => {
    const res = await api.get('/admin/services');
    setGigs(res.data);
  };

  const loadJobs = async () => {
    const res = await api.get('/admin/jobs');
    setJobs(res.data);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadUsers(),
        loadDisputes(),
        loadAnalytics(),
        loadGigs(),
        loadJobs()
      ]);
    } catch (error) {
      showToast.error(error.response?.data?.error || 'Failed to load admin data', 'Error Loading Data');
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
      showToast.success('User has been banned successfully', 'User Banned');
      setSelectedUserId(null);
      setBanReason('');
      await loadUsers();
    } catch (error) {
      showToast.error(error.response?.data?.error || 'Failed to ban user', 'Error');
    }
  };

  const handleUnban = async (id) => {
    try {
      await api.post(`/admin/users/${id}/unban`);
      showToast.success('User has been unbanned successfully', 'User Unbanned');
      await loadUsers();
    } catch (error) {
      showToast.error(error.response?.data?.error || 'Failed to unban user', 'Error');
    }
  };

  const handleResolve = async (orderId) => {
    const data = resolutionState[orderId] || {};
    try {
      await api.post(`/orders/disputes/${orderId}/resolve`, {
        outcome: data.outcome,
        notes: data.notes
      });
      showToast.success('Dispute has been resolved', 'Resolved');
      await Promise.all([loadDisputes(), loadAnalytics()]);
    } catch (error) {
      showToast.error(error.response?.data?.error || 'Failed to resolve dispute', 'Error');
    }
  };

  const handleVerification = async (userId, status, isTopRated) => {
    try {
      const body = {};
      if (status !== undefined) body.status = status;
      if (isTopRated !== undefined) body.isTopRated = isTopRated;
      await api.post(`/admin/users/${userId}/verification`, body);
      showToast.success(`Verification updated successfully`, 'Updated');
      await loadUsers();
    } catch (error) {
      showToast.error(error.response?.data?.error || 'Failed to update verification', 'Error');
    }
  };

  const handleDeleteGig = async (gigId) => {
    if (!window.confirm('Are you sure you want to remove this gig/service? This action cannot be undone.')) return;
    try {
      await api.delete(`/admin/services/${gigId}`);
      showToast.success('Gig has been deleted successfully', 'Gig Removed');
      await loadGigs();
    } catch (error) {
      showToast.error(error.response?.data?.error || 'Failed to delete gig', 'Error');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to remove this job post? This action cannot be undone.')) return;
    try {
      await api.delete(`/admin/jobs/${jobId}`);
      showToast.success('Job post has been deleted successfully', 'Job Removed');
      await loadJobs();
    } catch (error) {
      showToast.error(error.response?.data?.error || 'Failed to delete job post', 'Error');
    }
  };

  const pendingVerifications = users.filter(u => u.verificationStatus === 'pending');
  const allVerifiable = users.filter(u => u.verificationStatus && u.verificationStatus !== 'unverified');

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

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGigs = gigs.filter(g =>
    g.title?.toLowerCase().includes(gigSearchQuery.toLowerCase()) ||
    g.description?.toLowerCase().includes(gigSearchQuery.toLowerCase()) ||
    g.freelancer?.name?.toLowerCase().includes(gigSearchQuery.toLowerCase()) ||
    g.freelancer?.email?.toLowerCase().includes(gigSearchQuery.toLowerCase())
  );

  const filteredJobs = jobs.filter(j =>
    j.title?.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
    j.description?.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
    j.client?.name?.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
    j.client?.email?.toLowerCase().includes(jobSearchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mt-8">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 shadow-2xl border border-indigo-500/20 overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tight mb-1">🛡️ Admin Command Center</h1>
          <p className="text-indigo-200 text-sm">Full platform oversight — users, disputes, verifications & revenue.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {[
              { label: 'Total Users', val: users.length, c: 'text-blue-300' },
              { label: 'Verified', val: users.filter(u => u.verificationStatus === 'verified').length, c: 'text-green-300' },
              { label: 'Disputes', val: disputes.length, c: 'text-amber-300' },
              { label: 'Revenue', val: formatCurrency(analytics?.totals?.platformRevenue || 0), c: 'text-emerald-300' },
            ].map((s, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <p className={`text-2xl font-black ${s.c}`}>{s.val}</p>
                <p className="text-xs text-indigo-300 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white dark:bg-gray-800 rounded-2xl p-1.5 border border-gray-200 dark:border-gray-700 shadow-sm w-fit flex-wrap">
        {[
          { id: 'users', label: '👥 Users' },
          { id: 'verifications', label: '🛡️ Verifications', badge: pendingVerifications.length },
          { id: 'disputes', label: '⚠️ Disputes' },
          { id: 'analytics', label: '💰 Revenue' },
          { id: 'gigs', label: '🏪 Gigs' },
          { id: 'jobs', label: '💼 Job Posts' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
            {tab.label}
            {tab.badge > 0 && <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">{tab.badge}</span>}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-indigo-500 mb-4 animate-pulse">⏳ Loading...</p>}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <input type="text" placeholder="Search users by name or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" />
            <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
          </div>

          <div className="grid gap-3">
            {filteredUsers.map(u => (
              <div key={u._id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-shrink-0">
                  {u.profilePicture ? (
                    <img src={u.profilePicture} alt={u.name} className="w-14 h-14 rounded-xl object-cover border-2 border-gray-200 dark:border-gray-700" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl">{u.name?.charAt(0)?.toUpperCase()}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900 dark:text-white">{u.name}</h3>
                    {u.verificationStatus === 'verified' && <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-[10px] font-bold">✓ VERIFIED</span>}
                    {u.isTopRated && <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-[10px] font-bold">⭐ TOP</span>}
                    {u.isBanned && <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-[10px] font-bold">🚫 BANNED</span>}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{u.email}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span>📋 {(u.roles || []).join(', ')}</span>
                    {u.country && <span>📍 {u.country}</span>}
                    <span>⭐ {(u.rating || 0).toFixed(1)}</span>
                    <span>💼 {u.completedJobs || 0} jobs</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => setDetailUser(u)} className="px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold hover:bg-indigo-100 transition">👁 Details</button>
                  <Link to={`/profile/${u._id}`} className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-100 transition">↗ Profile</Link>
                  {u.isBanned ? (
                    <button onClick={() => handleUnban(u._id)} className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold transition">Unban</button>
                  ) : (
                    <button onClick={() => setSelectedUserId(u._id)} className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition">Ban</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && <p className="text-center py-8 text-gray-400">No users match your search.</p>}

          {selectedUserId && (
            <div className="p-4 border border-red-200 dark:border-red-800/50 rounded-xl bg-red-50/70 dark:bg-red-900/10">
              <p className="font-semibold mb-2 text-red-700 dark:text-red-300">Ban reason</p>
              <textarea className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-red-400" value={banReason} onChange={(e) => setBanReason(e.target.value)} />
              <div className="flex gap-2 mt-2">
                <button onClick={handleBan} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition">Confirm Ban</button>
                <button onClick={() => { setSelectedUserId(null); setBanReason(''); }} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm font-semibold transition">Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'verifications' && (
        <div className="space-y-6">
          {/* Pending Queue */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              ⏳ Pending Verification Requests
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold">{pendingVerifications.length}</span>
            </h2>
            {pendingVerifications.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-500">No pending verification requests.</div>
            ) : (
              <div className="space-y-3">
                {pendingVerifications.map(u => (
                  <div key={u._id} className="bg-white dark:bg-gray-800 rounded-2xl border border-blue-200 dark:border-blue-800/50 p-5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-lg">{u.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{u.email} · {(u.roles || []).join(', ')}</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider">Pending Review</span>
                    </div>
                    {u.verificationDocument && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">Submitted Document</p>
                        <a href={u.verificationDocument} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-semibold break-all">
                          {u.verificationDocument}
                        </a>
                      </div>
                    )}
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => handleVerification(u._id, 'verified')} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition">✓ Approve</button>
                      <button onClick={() => handleVerification(u._id, 'rejected')} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition">✗ Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* All Verifications Table */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">All Verification Statuses</h2>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 overflow-x-auto shadow-sm">
              <table className="w-full text-left min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    <th className="py-3">Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Top Rated</th>
                    <th>Document</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allVerifiable.map(u => (
                    <tr key={u._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition">
                      <td className="py-3 font-medium text-gray-800 dark:text-gray-100">{u.name}</td>
                      <td className="text-gray-600 dark:text-gray-300 text-sm">{u.email}</td>
                      <td>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${u.verificationStatus === 'verified' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                            u.verificationStatus === 'pending' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                              u.verificationStatus === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                          {u.verificationStatus}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleVerification(u._id, undefined, !u.isTopRated)}
                          className={`px-2.5 py-1 rounded-full text-xs font-bold transition ${u.isTopRated
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 hover:bg-amber-200'
                              : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200'
                            }`}
                        >
                          {u.isTopRated ? '⭐ Top Rated' : 'Not Rated'}
                        </button>
                      </td>
                      <td>
                        {u.verificationDocument ? (
                          <a href={u.verificationDocument} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">View Doc</a>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="text-right">
                        <div className="flex gap-1 justify-end">
                          {u.verificationStatus !== 'verified' && (
                            <button onClick={() => handleVerification(u._id, 'verified')} className="px-2.5 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-semibold transition">Approve</button>
                          )}
                          {u.verificationStatus !== 'rejected' && u.verificationStatus !== 'unverified' && (
                            <button onClick={() => handleVerification(u._id, 'rejected')} className="px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-semibold transition">Reject</button>
                          )}
                          {u.verificationStatus === 'verified' && (
                            <button onClick={() => handleVerification(u._id, 'unverified')} className="px-2.5 py-1 bg-gray-400 hover:bg-gray-500 text-white rounded text-xs font-semibold transition">Revoke</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {allVerifiable.length === 0 && (
                <p className="text-center py-8 text-gray-500">No users have submitted verification requests yet.</p>
              )}
            </div>
          </div>
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
      {/* GIGS TAB */}
      {activeTab === 'gigs' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search gigs by title, description, or freelancer..."
              value={gigSearchQuery}
              onChange={(e) => setGigSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
            <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
          </div>

          <div className="grid gap-4">
            {filteredGigs.map((g) => (
              <div
                key={g._id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-4"
              >
                {g.image && (
                  <div className="w-full md:w-32 h-24 flex-shrink-0">
                    <img
                      src={getFileUrl(g.image)}
                      alt={g.title}
                      className="w-full h-full rounded-xl object-cover border border-gray-200 dark:border-gray-700"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                      <Link to={`/service/${g._id}`} target="_blank" rel="noopener noreferrer">
                        {g.title}
                      </Link>
                    </h3>
                    <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-black">
                      {g.currency === 'INR' ? '₹' : '$'}{g.price}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    Category: <span className="font-semibold text-gray-600 dark:text-gray-300">{g.category}</span> · Delivery: <span className="font-semibold text-gray-600 dark:text-gray-300">{g.deliveryTime}</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                    {g.description}
                  </p>
                  <div className="flex items-center gap-2 mt-3 p-2 bg-gray-50 dark:bg-gray-900/40 rounded-xl w-fit border border-gray-100 dark:border-gray-800">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs uppercase">
                      {g.freelancer?.name?.charAt(0)}
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-gray-700 dark:text-gray-300">
                        {g.freelancer?.name || 'Unknown Freelancer'}
                      </span>
                      <span className="text-gray-400 mx-1.5">|</span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {g.freelancer?.email || 'No Email'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-row md:flex-col justify-end gap-2 flex-shrink-0 items-end">
                  <Link
                    to={`/service/${g._id}`}
                    target="_blank"
                    className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold hover:bg-indigo-100 transition whitespace-nowrap"
                  >
                    👁 View Gig ↗
                  </Link>
                  <button
                    onClick={() => handleDeleteGig(g._id)}
                    className="px-4 py-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white rounded-xl text-xs font-bold transition whitespace-nowrap"
                  >
                    🗑 Remove Gig
                  </button>
                </div>
              </div>
            ))}
            {filteredGigs.length === 0 && (
              <div className="text-center py-12 text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                🏪 No gigs match your search.
              </div>
            )}
          </div>
        </div>
      )}

      {/* JOBS TAB */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search job posts by title, description, or client..."
              value={jobSearchQuery}
              onChange={(e) => setJobSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
            <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
          </div>

          <div className="grid gap-4">
            {filteredJobs.map((j) => (
              <div
                key={j._id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                      <Link to={`/jobs/${j._id}`} target="_blank" rel="noopener noreferrer">
                        {j.title}
                      </Link>
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        j.status === 'open' ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' :
                        j.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-950/40 dark:text-gray-400'
                      }`}>
                        {j.status}
                      </span>
                      <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-black">
                        {j.currency === 'INR' ? '₹' : '$'}{j.budget}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    Category: <span className="font-semibold text-gray-600 dark:text-gray-300">{j.category}</span> · Delivery: <span className="font-semibold text-gray-600 dark:text-gray-300">{j.deliveryTime}</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                    {j.description}
                  </p>
                  {j.skills && j.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {j.skills.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-[11px] font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-3 p-2 bg-gray-50 dark:bg-gray-900/40 rounded-xl w-fit border border-gray-100 dark:border-gray-800">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs uppercase">
                      {j.client?.name?.charAt(0)}
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-gray-700 dark:text-gray-300">
                        {j.client?.name || 'Unknown Client'}
                      </span>
                      <span className="text-gray-400 mx-1.5">|</span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {j.client?.email || 'No Email'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-row md:flex-col justify-end gap-2 flex-shrink-0 items-end">
                  <Link
                    to={`/jobs/${j._id}`}
                    target="_blank"
                    className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold hover:bg-indigo-100 transition whitespace-nowrap"
                  >
                    👁 View Job ↗
                  </Link>
                  <button
                    onClick={() => handleDeleteJob(j._id)}
                    className="px-4 py-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white rounded-xl text-xs font-bold transition whitespace-nowrap"
                  >
                    🗑 Remove Job
                  </button>
                </div>
              </div>
            ))}
            {filteredJobs.length === 0 && (
              <div className="text-center py-12 text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                💼 No jobs match your search.
              </div>
            )}
          </div>
        </div>
      )}

      {/* USER DETAIL DRAWER */}
      {detailUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end" onClick={() => setDetailUser(null)}>
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg h-full overflow-y-auto shadow-2xl animate-slideIn" onClick={e => e.stopPropagation()}>
            {/* Detail Header */}
            <div className="relative bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white">
              <button onClick={() => setDetailUser(null)} className="absolute top-4 right-4 p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition text-white text-lg">✕</button>
              <div className="flex items-center gap-4 mt-2">
                {detailUser.profilePicture ? (
                  <img src={detailUser.profilePicture} alt="" className="w-20 h-20 rounded-2xl object-cover border-3 border-white/30" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-black">{detailUser.name?.charAt(0)}</div>
                )}
                <div>
                  <h2 className="text-2xl font-black">{detailUser.name}</h2>
                  <p className="text-indigo-200 text-sm">{detailUser.email}</p>
                  <div className="flex gap-2 mt-2">
                    {detailUser.verificationStatus === 'verified' && <span className="px-2 py-0.5 bg-green-400/20 text-green-200 rounded-full text-[10px] font-bold">✓ Verified</span>}
                    {detailUser.isTopRated && <span className="px-2 py-0.5 bg-amber-400/20 text-amber-200 rounded-full text-[10px] font-bold">⭐ Top Rated</span>}
                    {detailUser.isBanned && <span className="px-2 py-0.5 bg-red-400/20 text-red-200 rounded-full text-[10px] font-bold">🚫 Banned</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Detail Body */}
            <div className="p-6 space-y-5">
              <Link to={`/profile/${detailUser._id}`} onClick={() => setDetailUser(null)} className="w-full block text-center px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition">↗ Visit Full Profile Page</Link>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Roles', val: (detailUser.roles || []).join(', ') },
                  { label: 'Country', val: detailUser.country || '—' },
                  { label: 'Phone', val: detailUser.phone || '—' },
                  { label: 'Rating', val: `⭐ ${(detailUser.rating || 0).toFixed(1)}` },
                  { label: 'Completed Jobs', val: detailUser.completedJobs || 0 },
                  { label: 'Wallet Balance', val: `$${(detailUser.walletBalance || 0).toLocaleString()}` },
                  { label: 'Verification', val: detailUser.verificationStatus || 'unverified' },
                  { label: 'Joined', val: detailUser.createdAt ? new Date(detailUser.createdAt).toLocaleDateString() : '—' },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{item.label}</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{item.val}</p>
                  </div>
                ))}
              </div>

              {/* Bio */}
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">Bio</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700">{detailUser.bio || 'No bio provided.'}</p>
              </div>

              {/* Skills */}
              {detailUser.skills?.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {detailUser.skills.map((s, i) => (
                      <span key={i} className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {detailUser.languages?.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">Languages</p>
                  <div className="flex flex-wrap gap-1.5">
                    {detailUser.languages.map((l, i) => (
                      <span key={i} className="px-2.5 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-semibold">{l}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {detailUser.education?.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">Education</p>
                  {detailUser.education.map((e, i) => (
                    <p key={i} className="text-sm text-gray-700 dark:text-gray-300">🎓 {e}</p>
                  ))}
                </div>
              )}

              {/* Banned Info */}
              {detailUser.isBanned && (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-xl p-4">
                  <p className="text-xs uppercase tracking-wider text-red-500 font-bold mb-1">Ban Details</p>
                  <p className="text-sm text-red-700 dark:text-red-300">Reason: {detailUser.bannedReason || 'No reason specified'}</p>
                  {detailUser.bannedAt && <p className="text-xs text-red-400 mt-1">Banned on: {new Date(detailUser.bannedAt).toLocaleDateString()}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

