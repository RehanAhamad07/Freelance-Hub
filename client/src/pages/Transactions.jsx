import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { ArrowDownRight, ArrowUpRight, DollarSign, Wallet, Download, Activity, ExternalLink, X, Plus, Minus, Landmark, CreditCard, ShieldCheck, TrendingUp, Info } from 'lucide-react';
import { toast } from 'react-toastify';

const Transactions = () => {
  const { user, refreshUser, setUser } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Financial metrics
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [balance, setBalance] = useState(0);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('deposit');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        const fetchedOrders = res.data;
        setOrders(fetchedOrders);
        
        let earnings = 0;
        let spent = 0;
        
        const userId = user.id || user._id;

        fetchedOrders.forEach(o => {
          const isFreelancer = o.freelancer && (o.freelancer._id === userId || o.freelancer === userId);
          const isClient = o.client && (o.client._id === userId || o.client === userId);

          if (isFreelancer && o.status === 'completed') {
            earnings += o.price;
          }
          if (isClient) {
            spent += o.price;
          }
        });

        setTotalEarnings(earnings);
        setTotalSpent(spent);
        
        // Use real wallet balance so it matches navbar/account funds.
        setBalance(Number(user.walletBalance || 0));
        
      } catch (error) {
        console.error("Failed to fetch transactions", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  const openModal = (type) => {
    setModalType(type);
    setAmount('');
    setIsModalOpen(true);
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (modalType === 'withdraw' && val > balance) {
      toast.error('Insufficient funds available');
      return;
    }

    try {
      const txRes = await api.post('/auth/wallet/transaction', {
        type: modalType === 'deposit' ? 'deposit' : 'withdraw',
        amount: val
      });
      const updatedBalance = Number(txRes.data.walletBalance || 0);
      setBalance(updatedBalance);
      setUser((prev) => prev ? { ...prev, walletBalance: updatedBalance } : prev);

      toast.success(modalType === 'deposit'
        ? `Successfully deposited $${val}`
        : `Successfully withdrew $${val}`
      );

      await api.post('/notifications/notify', {
        type: modalType === 'deposit' ? 'transaction_credit' : 'transaction_debit',
        message: modalType === 'deposit'
          ? `$${val.toFixed(2)} has been credited to your account.`
          : `$${val.toFixed(2)} has been successfully withdrawn.`,
        link: '/transactions'
      });

      await refreshUser();
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Transaction failed');
      console.error('Wallet transaction failed', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mt-8 min-h-screen">
      
      {/* Header Area */}
      <div className="mb-10 pb-6 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Financial Overview</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm flex items-center gap-2">
            <ShieldCheck size={16} className="text-green-500"/> All transactions are encrypted and secured.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Main Content Component - Left side */}
        <div className="lg:w-2/3 space-y-8">
          
          {/* Quick Financial Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Balance Card (Premium Fin-tech design) */}
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="md:col-span-2 relative overflow-hidden bg-gray-900 dark:bg-gray-800 p-8 rounded-3xl shadow-2xl text-white border border-gray-800 dark:border-gray-700">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet size={20} className="text-blue-400" />
                    <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Total Balance</p>
                  </div>
                  <h2 className="text-5xl md:text-6xl font-black tracking-tight">${balance.toLocaleString('en-US', {minimumFractionDigits: 2})}</h2>
                  <div className="mt-4 flex items-center gap-3 text-sm">
                    <span className="flex items-center gap-1.5 text-green-400 font-semibold bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                      <Activity size={14} /> Available to withdraw
                    </span>
                  </div>
                </div>
                
                {/* Embedded Actions */}
                <div className="flex flex-col w-full md:w-auto gap-3 shrink-0">
                  <button 
                    onClick={() => openModal('deposit')}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/50"
                  >
                    <Plus size={18} /> Add Funds
                  </button>
                  <button 
                    onClick={() => openModal('withdraw')}
                    className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 py-3.5 rounded-2xl font-bold transition-all border border-white/10"
                  >
                    <Minus size={18} /> Withdraw
                  </button>
                </div>
              </div>
            </motion.div>
            
            {/* Income Card */}
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.1}} className="bg-white dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-gray-200/80 dark:border-gray-700 flex flex-col relative overflow-hidden group hover:border-gray-300 dark:hover:border-gray-600 transition duration-300">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3.5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-500 rounded-2xl">
                  <ArrowDownRight size={26} strokeWidth={2.5}/>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 dark:bg-green-500/10 px-2.5 py-1.5 rounded-lg">
                  <TrendingUp size={14}/> +12.5%
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-1 uppercase tracking-wide">Net Earnings</p>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">${totalEarnings.toLocaleString('en-US', {minimumFractionDigits: 2})}</h2>
            </motion.div>

            {/* Expenses Card */}
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.2}} className="bg-white dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-gray-200/80 dark:border-gray-700 flex flex-col relative overflow-hidden group hover:border-gray-300 dark:hover:border-gray-600 transition duration-300">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 rounded-2xl">
                  <ArrowUpRight size={26} strokeWidth={2.5}/>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-700 px-2.5 py-1.5 rounded-lg">
                  -2.4%
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-1 uppercase tracking-wide">Total Spendings</p>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">${totalSpent.toLocaleString('en-US', {minimumFractionDigits: 2})}</h2>
            </motion.div>
          </div>

          {/* Transaction History Section */}
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.3}} className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/30 dark:bg-gray-800/30 backdrop-blur-sm">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">Recent Activity</h2>
              <button className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 px-4 py-2 rounded-xl transition">
                <Download size={16} /> Export CSV
              </button>
            </div>
            
            {loading ? (
              <div className="p-10 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent pt-4 rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500 font-medium">Syncing transactions...</p>
              </div>
            ) : orders.length === 0 ? (
              
              // Elaborate Empty State Setup
              <div className="p-12 md:p-20 flex flex-col items-center justify-center text-center">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-blue-400 opacity-20 rounded-full blur-2xl flex items-center justify-center mx-auto"></div>
                  <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 flex items-center justify-center relative z-10 -rotate-3 hover:rotate-0 transition duration-300">
                    <DollarSign size={40} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="w-16 h-16 bg-green-50 dark:bg-gray-700 rounded-2xl shadow-lg border border-gray-50 dark:border-gray-600 flex items-center justify-center absolute -bottom-4 -right-4 z-20 rotate-6 hover:rotate-0 transition duration-300">
                    <Activity size={24} className="text-green-500" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Your ledger is perfectly clean!</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8 text-lg">
                  There's zero financial activity recorded yet. Jumpstart your financial dashboard by providing a service or hiring a professional.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-sm">
                  <Link to="/create-service" className="w-full flex-1 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white font-bold py-3.5 px-6 rounded-xl transition text-center">
                    Post a Gig
                  </Link>
                  <Link to="/services" className="w-full flex-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-bold py-3.5 px-6 rounded-xl transition text-center">
                    Hire Talent
                  </Link>
                </div>
              </div>
              
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                      <th className="py-5 px-8 font-bold text-xs tracking-widest text-gray-400 dark:text-gray-500 uppercase">Details</th>
                      <th className="py-5 px-8 font-bold text-xs tracking-widest text-gray-400 dark:text-gray-500 uppercase">Type</th>
                      <th className="py-5 px-8 font-bold text-xs tracking-widest text-gray-400 dark:text-gray-500 uppercase">Status</th>
                      <th className="py-5 px-8 font-bold text-xs tracking-widest text-gray-400 dark:text-gray-500 uppercase text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                    {orders.map((o) => {
                      const txId = o._id.substring(0, 8).toUpperCase();
                      const date = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                      
                      const userId = user.id || user._id;
                      const isIncoming = o.freelancer && (o.freelancer._id === userId || o.freelancer === userId);
                      
                      return (
                        <tr key={o._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/80 transition group">
                          <td className="py-5 px-8">
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-2xl ${isIncoming ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                                {isIncoming ? <ArrowDownRight size={18} strokeWidth={2.5}/> : <ArrowUpRight size={18} strokeWidth={2.5}/>}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-1 max-w-sm mb-1">
                                  {o.service?.title || 'System Order Processed'}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                  <span>{date}</span>
                                  <span className="hidden sm:inline w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                  <span className="font-mono text-gray-400 dark:text-gray-500">#{txId}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-5 px-8">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {isIncoming ? 'Incoming Payment' : 'Outbound Transfer'}
                            </span>
                          </td>
                          <td className="py-5 px-8">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold capitalize border
                              ${o.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-400' 
                              : o.status === 'in progress' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400'
                              : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:border-yellow-500/20 dark:text-yellow-400'}
                            `}>
                              <span className={`w-1.5 h-1.5 rounded-full ${o.status === 'completed' ? 'bg-green-500' : o.status === 'in progress' ? 'bg-blue-500' : 'bg-yellow-500'}`}></span>
                              {o.status}
                            </span>
                          </td>
                          <td className="py-5 px-8 text-right">
                            <div className="flex flex-col items-end">
                              <p className={`text-base font-black ${isIncoming ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                                {isIncoming ? '+' : '-'}${o.price.toFixed(2)}
                              </p>
                              <p className="text-xs font-semibold text-blue-500 opacity-0 group-hover:opacity-100 transition mt-1 cursor-pointer flex items-center gap-1">
                                Download Invoice <Download size={12}/>
                              </p>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar Components - Right side */}
        <div className="lg:w-1/3 space-y-6">
          
          {/* Connected Methods Section */}
          <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6">Payout Methods</h3>
            <div className="space-y-4">
              
              {/* Bank Account Card */}
              <div className="group border border-gray-200 dark:border-gray-700 rounded-2xl p-4 hover:border-blue-400 dark:hover:border-blue-500 transition cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">Primary</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition shrink-0">
                    <Landmark size={22} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm mb-0.5">Chase Bank Setup</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">•••• 4242</p>
                  </div>
                </div>
              </div>

              {/* PayPal Card */}
              <div className="group border border-gray-200 dark:border-gray-700 rounded-2xl p-4 hover:border-blue-400 dark:hover:border-blue-500 transition cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#003087]/10 dark:bg-white/10 rounded-xl flex items-center justify-center text-[#003087] dark:text-white group-hover:scale-110 transition shrink-0">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zM18.01 7.2h-.002c-.006 0-.012.002-.018.002-.2-.045-.558-.046-.967-.046H9.176c-.22 0-.404.16-.437.378l-1.637 10.378h3.332c.314 0 .58-.23.626-.54l.583-3.696c.046-.295.298-.515.597-.515h1.22c2.52 0 4.545-1.042 5.127-3.957.17-1.01.077-1.802-.327-2.316-.273-.348-.718-.553-1.258-.69h.008z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm mb-0.5">PayPal Linked</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">user@example.com</p>
                  </div>
                </div>
              </div>

              <button className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400 rounded-2xl py-4 font-bold text-sm transition group">
                <Plus size={18} className="group-hover:scale-110 transition" /> Add Payment Method
              </button>
            </div>
          </motion.div>

          {/* Secure Trust Badge */}
          <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} transition={{delay: 0.1}} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white text-center border border-gray-700">
            <ShieldCheck size={36} className="text-green-400 mx-auto mb-3" />
            <h4 className="font-black mb-1">Bank-Level Security</h4>
            <p className="text-gray-400 text-xs leading-relaxed mb-4">All financial data is secured using 256-bit AES encryption. Payments are safely routed utilizing established banking protocols.</p>
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-300 bg-black/30 rounded-xl py-2">
              <CreditCard size={14} /> Secured by Stripe (Mock)
            </div>
          </motion.div>

        </div>
      </div>

      {/* Transaction Modal (Redesigned) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-md relative overflow-hidden border border-gray-100 dark:border-gray-700"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-gray-500 dark:text-gray-400 transition"
              >
                <X size={18} />
              </button>
              
              <div className="mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${modalType === 'deposit' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                  {modalType === 'deposit' ? <ArrowDownRight size={28} /> : <ArrowUpRight size={28} />}
                </div>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white capitalize tracking-tight mb-1">{modalType === 'deposit' ? 'Add Funds' : 'Withdraw Funds'}</h3>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Wallet size={14} />
                  {modalType === 'deposit' ? 'Top up your marketplace wallet.' : `Balance: $${balance.toFixed(2)}`}
                </p>
              </div>

              <form onSubmit={handleTransactionSubmit} className="space-y-6">
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <span className="text-xl font-bold text-gray-400">$</span>
                    </div>
                    <input 
                      type="number" 
                      min="1"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl pl-10 pr-5 py-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition text-2xl font-black text-gray-900 dark:text-white"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-start gap-3">
                  <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 leading-relaxed">
                    {modalType === 'deposit' 
                      ? "A simulated test transaction mapping securely to dummy Stripe configurations. Process completes instantly."
                      : "Withdrawals process directly into your linked 'Chase Bank Setup' checking account in 1-2 business days."}
                  </p>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-4 rounded-2xl text-white font-black text-lg transition-all transform hover:-translate-y-0.5 shadow-xl active:scale-95 bg-gray-900 hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-500"
                >
                  Confirm {modalType === 'deposit' ? 'Deposit' : 'Withdrawal'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Transactions;
