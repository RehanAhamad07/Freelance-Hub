import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, Eye, Target, DollarSign, Loader2, Copy, Gift, Trophy } from 'lucide-react';

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6366F1'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' && entry.name !== 'Views' ? `$${entry.value.toLocaleString()}` : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        setAnalytics(res.data);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const [copied, setCopied] = React.useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!analytics) return null;

  const { monthlyRevenue, proposalStats, orderStats, profileViews, totalEarned, levelInfo, referralCode, allLevels } = analytics;
  const copyReferral = () => { navigator.clipboard.writeText(referralCode || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const proposalPieData = [
    { name: 'Accepted', value: proposalStats.accepted },
    { name: 'Pending', value: proposalStats.pending },
    { name: 'Rejected', value: proposalStats.rejected },
  ].filter(d => d.value > 0);

  // If no data at all, show placeholder
  const hasProposals = proposalStats.total > 0;

  return (
    <div className="space-y-6 mt-8">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white">
          <TrendingUp size={22} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Overview</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track your growth and performance</p>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:0}}
          className="bg-gradient-to-br from-emerald-500 to-green-600 p-5 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
          <DollarSign size={20} className="opacity-70 mb-2" />
          <p className="text-2xl font-black">${totalEarned.toLocaleString()}</p>
          <p className="text-xs opacity-80 font-medium mt-1">Total Earned</p>
        </motion.div>

        <motion.div initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:0.05}}
          className="bg-gradient-to-br from-blue-500 to-indigo-600 p-5 rounded-2xl text-white shadow-lg shadow-blue-500/20">
          <Target size={20} className="opacity-70 mb-2" />
          <p className="text-2xl font-black">{proposalStats.winRate}%</p>
          <p className="text-xs opacity-80 font-medium mt-1">Proposal Win Rate</p>
        </motion.div>

        <motion.div initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
          className="bg-gradient-to-br from-violet-500 to-purple-600 p-5 rounded-2xl text-white shadow-lg shadow-violet-500/20">
          <Eye size={20} className="opacity-70 mb-2" />
          <p className="text-2xl font-black">{profileViews.reduce((s, p) => s + p.views, 0).toLocaleString()}</p>
          <p className="text-xs opacity-80 font-medium mt-1">Profile Views</p>
        </motion.div>

        <motion.div initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:0.15}}
          className="bg-gradient-to-br from-amber-500 to-orange-600 p-5 rounded-2xl text-white shadow-lg shadow-amber-500/20">
          <TrendingUp size={20} className="opacity-70 mb-2" />
          <p className="text-2xl font-black">{orderStats.completed}</p>
          <p className="text-xs opacity-80 font-medium mt-1">Completed Orders</p>
        </motion.div>
      </div>

      {/* Level & Referral Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Level Progress */}
        {levelInfo && (
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.18}}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl" style={{background: levelInfo.color + '22'}}>
                <Trophy size={20} style={{color: levelInfo.color}} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Level {levelInfo.level}: {levelInfo.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{levelInfo.commissionPercent}% platform commission</p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Progress to next level</span>
                <span className="font-bold">{levelInfo.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000" style={{width: `${levelInfo.progress}%`, background: `linear-gradient(90deg, ${levelInfo.color}, ${levelInfo.color}dd)`}}></div>
              </div>
            </div>
            {levelInfo.next && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-xs space-y-1">
                <p className="font-bold text-gray-700 dark:text-gray-300">Next: Level {levelInfo.next.level} ({levelInfo.next.name}) — {levelInfo.next.commissionPercent}% fee</p>
                <p className="text-gray-500 dark:text-gray-400">Requires: ${levelInfo.next.minEarnings}+ earned · {levelInfo.next.minRating}+ rating · {levelInfo.next.minJobs}+ jobs</p>
              </div>
            )}
            {!levelInfo.next && <p className="text-xs text-green-600 dark:text-green-400 font-bold">🎉 You've reached the highest level!</p>}
          </motion.div>
        )}

        {/* Referral Program */}
        {referralCode && (
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl"><Gift size={20} className="text-purple-600 dark:text-purple-400" /></div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Referral Program</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Earn 2% bonus on every order from referred users</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 mb-3">
              <code className="flex-1 text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">{referralCode}</code>
              <button onClick={copyReferral} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition">
                <Copy size={12} />{copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Share this code with friends. When they sign up and their client places an order, you earn a wallet credit!</p>
          </motion.div>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Revenue Trend</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Last 6 months</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyRevenue} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="earnedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="spentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area type="monotone" dataKey="earned" name="Earned" stroke="#10B981" strokeWidth={2.5} fill="url(#earnedGrad)" />
              <Area type="monotone" dataKey="spent" name="Spent" stroke="#6366F1" strokeWidth={2.5} fill="url(#spentGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Profile Views Chart */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.25}}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Profile Views</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Last 6 months</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={profileViews} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="views" name="Views" fill="#8B5CF6" radius={[6, 6, 0, 0]} barSize={32}>
                {profileViews.map((entry, index) => (
                  <Cell key={index} fill={`hsl(${250 + index * 8}, 70%, ${55 + index * 3}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom Row — Proposal Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Proposal Pie Chart */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Proposal Breakdown</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{proposalStats.total} total proposals</p>
          {hasProposals ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={proposalPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {proposalPieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-gray-400 dark:text-gray-500 text-sm">
              No proposals yet
            </div>
          )}
        </motion.div>

        {/* Order Status Cards */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.35}}
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Order Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total', value: orderStats.total, color: 'from-gray-500 to-gray-600', text: 'text-gray-600 dark:text-gray-300' },
              { label: 'Completed', value: orderStats.completed, color: 'from-emerald-500 to-green-600', text: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'In Progress', value: orderStats.inProgress, color: 'from-blue-500 to-indigo-600', text: 'text-blue-600 dark:text-blue-400' },
              { label: 'Disputed', value: orderStats.disputed, color: 'from-red-500 to-rose-600', text: 'text-red-600 dark:text-red-400' },
            ].map((stat, i) => (
              <div key={i} className="relative overflow-hidden bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stat.color}`}></div>
                <p className={`text-3xl font-black ${stat.text}`}>{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
