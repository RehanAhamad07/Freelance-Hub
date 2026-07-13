import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { Plus, Package, MessageSquare, Briefcase, ChevronRight, User, CheckCircle, CreditCard, Send, X, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

const Dashboard = () => {
  const { user, formatPrice } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState([]);
  const [loadingAction, setLoadingAction] = useState(null);

  const getDeliveryFileUrl = (filePath) => {
    if (!filePath || typeof filePath !== 'string') return '';
    if (/^https?:\/\//i.test(filePath)) return filePath;
    const apiBase = api.defaults.baseURL || '';
    const serverOrigin = apiBase.replace(/\/api\/?$/, '');
    if (!serverOrigin) return filePath;
    return `${serverOrigin}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
  };

  // Delivery Modal State
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [deliveryFile, setDeliveryFile] = useState(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeCategory, setDisputeCategory] = useState('quality_issue');
  const [disputeReason, setDisputeReason] = useState('');
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [evidenceNote, setEvidenceNote] = useState('');
  const [evidenceFile, setEvidenceFile] = useState(null);

  const fetchOrders = async () => {
    try {
      const orderRes = await api.get('/orders');
      setOrders(orderRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchOrders();

        const serviceRes = await api.get('/services'); 
        setServices(serviceRes.data.filter(s => 
          s.freelancer && (
            s.freelancer._id === user.id || 
            s.freelancer._id === user._id || 
            s.freelancer === user.id || 
            s.freelancer === user._id
          )
        ));
      } catch (error) {
        console.error(error);
      }
    };
    if (user) fetchData();
  }, [user]);

  const handleOrderAction = async (orderId, action) => {
    setLoadingAction(orderId);
    try {
      const res = await api.post(`/orders/${action}/${orderId}`);
      toast.success(res.data.message);
      await fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.error || `Failed to ${action} order`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeliver = async (e) => {
    e.preventDefault();
    if (!activeOrderId) return;
    
    setLoadingAction(activeOrderId);
    try {
      const formData = new FormData();
      if (deliveryFile) formData.append('file', deliveryFile);
      formData.append('message', deliveryMessage);

      const res = await api.post(`/orders/deliver/${activeOrderId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(res.data.message);
      setShowDeliveryModal(false);
      setDeliveryFile(null);
      setDeliveryMessage('');
      await fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to deliver work');
    } finally {
      setLoadingAction(null);
      setActiveOrderId(null);
    }
  };

  const handleDisputeSubmit = async (e) => {
    e.preventDefault();
    if (!activeOrderId) return;

    setLoadingAction(activeOrderId);
    try {
      const res = await api.post(`/orders/dispute/${activeOrderId}`, {
        category: disputeCategory,
        reason: disputeReason
      });
      toast.success(res.data.message);
      setShowDisputeModal(false);
      setDisputeCategory('quality_issue');
      setDisputeReason('');
      await fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to dispute order');
    } finally {
      setLoadingAction(null);
      setActiveOrderId(null);
    }
  };

  const handleEvidenceSubmit = async (e) => {
    e.preventDefault();
    if (!activeOrderId) return;
    setLoadingAction(activeOrderId);
    try {
      const formData = new FormData();
      formData.append('note', evidenceNote);
      if (evidenceFile) formData.append('evidence', evidenceFile);

      const res = await api.post(`/orders/dispute/${activeOrderId}/comment`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(res.data.message);
      setShowEvidenceModal(false);
      setEvidenceNote('');
      setEvidenceFile(null);
      await fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add dispute evidence');
    } finally {
      setLoadingAction(null);
      setActiveOrderId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mt-8 relative">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-gray-900 dark:text-white">Welcome back, {user?.name}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your services, track orders, and monitor earnings</p>
        </div>
        <Link to="/create-service" className="btn-success flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl shadow-3d-sm text-sm hover:scale-103 whitespace-nowrap self-start sm:self-auto">
          <Plus size={18} /> Create New Gig
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <motion.div initial={{opacity:0, y:15}} animate={{opacity:1, y:0}} className="card p-6 flex items-center gap-4 hover-3d">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/40 text-brand-blue rounded-2xl shadow-3d-sm"><Package size={26} /></div>
          <div>
            <p className="text-2xl font-display font-extrabold text-gray-900 dark:text-white">{orders.length}</p>
            <p className="text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase mt-0.5">Total Orders</p>
          </div>
        </motion.div>
        
        <motion.div initial={{opacity:0, y:15}} animate={{opacity:1, y:0}} transition={{delay: 0.05}} className="card p-6 flex items-center gap-4 hover-3d">
          <div className="p-4 bg-green-50 dark:bg-green-950/40 text-brand-green rounded-2xl shadow-3d-sm"><Briefcase size={26} /></div>
          <div>
            <p className="text-2xl font-display font-extrabold text-gray-900 dark:text-white">{services.length}</p>
            <p className="text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase mt-0.5">Active Gigs</p>
          </div>
        </motion.div>

        <motion.div initial={{opacity:0, y:15}} animate={{opacity:1, y:0}} transition={{delay: 0.1}} className="card p-6 flex items-center gap-4 hover-3d">
          <div className="p-4 bg-purple-50 dark:bg-purple-950/40 text-brand-purple rounded-2xl shadow-3d-sm"><MessageSquare size={26} /></div>
          <div>
            <p className="text-2xl font-display font-extrabold text-gray-900 dark:text-white">Active</p>
            <p className="text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase mt-0.5">Messages</p>
          </div>
        </motion.div>
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Recent Orders</h2>
        {orders.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Service</th>
                  <th className="py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Other Party</th>
                  <th className="py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Status</th>
                  <th className="py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Price</th>
                  <th className="py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Date</th>
                  <th className="py-3 px-4 font-medium text-gray-600 dark:text-gray-300 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const isClient = o.client && (o.client._id === user.id || o.client._id === user._id);
                  const isFreelancer = o.freelancer && (o.freelancer._id === user.id || o.freelancer._id === user._id);
                  const otherParty = isClient ? o.freelancer : o.client;
                  
                  return (
                    <tr key={o._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                      <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">
                        <div>
                          {o.service?.title || 'Service Deleted'}
                          {o.latestDelivery?.file && (
                            <a href={getDeliveryFileUrl(o.latestDelivery.file)} target="_blank" rel="noreferrer" className="block text-xs text-blue-500 hover:underline mt-1">
                              View Latest Delivery
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {otherParty ? (
                          <Link to={`/profile/${otherParty._id}`} className="flex items-center gap-2 group">
                            {otherParty.profilePicture ? (
                              <img src={otherParty.profilePicture} alt={otherParty.name} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                                {otherParty.name?.charAt(0) || <User size={14} />}
                              </div>
                            )}
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary transition">{otherParty.name}</span>
                          </Link>
                        ) : (
                          <span className="text-sm text-gray-500">Unknown User</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize 
                          ${o.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : o.status === 'delivered' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : (o.status === 'in_progress' || o.status === 'in progress') ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : o.status === 'disputed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                          {o.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-bold">{formatPrice(o.price, o.currency || o.service?.currency || 'USD')}</td>
                      <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-sm">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right flex items-center justify-end gap-2 flex-wrap">
                        
                        {isFreelancer && (o.status === 'in_progress' || o.status === 'in progress') && (
                          <button 
                            onClick={() => {
                              setActiveOrderId(o._id);
                              setShowDeliveryModal(true);
                            }}
                            disabled={loadingAction === o._id}
                            className="inline-flex items-center gap-1 text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium transition disabled:opacity-50"
                          >
                            <Send size={14} /> Deliver Work
                          </button>
                        )}

                        {isClient && o.status === 'delivered' && (
                          <>
                            <button 
                              onClick={() => handleOrderAction(o._id, 'accept')}
                              disabled={loadingAction === o._id}
                              className="inline-flex items-center gap-1 text-xs bg-primary hover:bg-green-600 text-white px-2 py-1.5 rounded font-medium transition disabled:opacity-50"
                            >
                              <CheckCircle size={14} /> Accept & Pay
                            </button>
                            <button 
                              onClick={() => handleOrderAction(o._id, 'revision')}
                              disabled={loadingAction === o._id}
                              className="inline-flex items-center gap-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1.5 rounded font-medium transition disabled:opacity-50"
                            >
                              <RefreshCw size={14} /> Revision
                            </button>
                            <button 
                              onClick={() => {
                                setActiveOrderId(o._id);
                                setShowDisputeModal(true);
                              }}
                              disabled={loadingAction === o._id}
                              className="inline-flex items-center gap-1 text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1.5 rounded font-medium transition disabled:opacity-50"
                            >
                              <AlertCircle size={14} /> Dispute
                            </button>
                          </>
                        )}

                        {(isClient || isFreelancer) && o.status === 'disputed' && (
                          <button
                            onClick={() => {
                              setActiveOrderId(o._id);
                              setShowEvidenceModal(true);
                            }}
                            disabled={loadingAction === o._id}
                            className="inline-flex items-center gap-1 text-xs bg-indigo-500 hover:bg-indigo-600 text-white px-2 py-1.5 rounded font-medium transition disabled:opacity-50"
                          >
                            <MessageSquare size={14} /> Add Evidence
                          </button>
                        )}

                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delivery Modal */}
      <AnimatePresence>
        {showDeliveryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-lg shadow-xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Deliver Work</h3>
                <button onClick={() => setShowDeliveryModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleDeliver} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                  <textarea 
                    value={deliveryMessage}
                    onChange={(e) => setDeliveryMessage(e.target.value)}
                    placeholder="Describe what you have delivered..."
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white h-32"
                    required
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload File (Optional)</label>
                  <input 
                    type="file" 
                    onChange={(e) => setDeliveryFile(e.target.files[0])}
                    className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-800 dark:file:text-blue-400"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loadingAction === activeOrderId}
                  className="w-full bg-primary hover:bg-green-600 text-white font-bold py-3 rounded-xl transition mt-4 disabled:opacity-50"
                >
                  {loadingAction === activeOrderId ? 'Submitting...' : 'Submit Delivery'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dispute Evidence Modal */}
      <AnimatePresence>
        {showEvidenceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-lg shadow-xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add Dispute Evidence</h3>
                <button
                  onClick={() => setShowEvidenceModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleEvidenceSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Comment</label>
                  <textarea
                    value={evidenceNote}
                    onChange={(e) => setEvidenceNote(e.target.value)}
                    placeholder="Add proof/context for admin review (minimum 10 characters)..."
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white h-32"
                    required
                    minLength={10}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Attach Evidence (Optional)</label>
                  <input
                    type="file"
                    onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-gray-800 dark:file:text-indigo-400"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Upload screenshots, documents, or PDF proof.</p>
                </div>
                <button
                  type="submit"
                  disabled={loadingAction === activeOrderId}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-xl transition mt-4 disabled:opacity-50"
                >
                  {loadingAction === activeOrderId ? 'Submitting...' : 'Submit Evidence'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dispute Modal */}
      <AnimatePresence>
        {showDisputeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-lg shadow-xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Open Dispute</h3>
                <button
                  onClick={() => setShowDisputeModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleDisputeSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select
                    value={disputeCategory}
                    onChange={(e) => setDisputeCategory(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white"
                    required
                  >
                    <option value="quality_issue">Quality Issue</option>
                    <option value="not_as_described">Not As Described</option>
                    <option value="late_delivery">Late Delivery</option>
                    <option value="plagiarism">Plagiarism/Copyright</option>
                    <option value="fraud">Fraud/Abuse</option>
                    <option value="other">Other</option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Tip: for quality issues, request at least one revision before dispute.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
                  <textarea
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    placeholder="Explain the issue clearly (minimum 20 characters)..."
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white h-32"
                    required
                    minLength={20}
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={loadingAction === activeOrderId}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition mt-4 disabled:opacity-50"
                >
                  {loadingAction === activeOrderId ? 'Submitting...' : 'Submit Dispute'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Analytics Dashboard */}
      <AnalyticsDashboard />
    </div>
  );
};

export default Dashboard;
