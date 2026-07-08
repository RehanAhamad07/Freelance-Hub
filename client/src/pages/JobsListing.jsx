import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Search as SearchIcon, Clock, DollarSign, Code, PenTool, Video, Pen, Music, MoreHorizontal, ChevronDown, X, Star, MapPin, Filter, Heart, CheckCircle } from 'lucide-react';

const categoryIcons = {
  'Programming & Tech': Code,
  'Graphics & Design': PenTool,
  'Video & Animation': Video,
  'Writing & Translation': Pen,
  'Music & Audio': Music,
  'Other': MoreHorizontal,
};

const categoryColors = {
  'Programming & Tech': { text: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950', border: 'border-blue-200 dark:border-blue-800', gradient: 'from-blue-400 to-blue-600', badge: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' },
  'Graphics & Design': { text: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-950', border: 'border-pink-200 dark:border-pink-800', gradient: 'from-pink-400 to-pink-600', badge: 'bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300' },
  'Video & Animation': { text: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950', border: 'border-purple-200 dark:border-purple-800', gradient: 'from-purple-400 to-purple-600', badge: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' },
  'Writing & Translation': { text: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950', border: 'border-orange-200 dark:border-orange-800', gradient: 'from-orange-400 to-orange-600', badge: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300' },
  'Music & Audio': { text: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-950', border: 'border-teal-200 dark:border-teal-800', gradient: 'from-teal-400 to-teal-600', badge: 'bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300' },
  'Other': { text: 'text-gray-600', bg: 'bg-gray-50 dark:bg-gray-950', border: 'border-gray-200 dark:border-gray-800', gradient: 'from-gray-400 to-gray-600', badge: 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300' },
};

const statusColors = {
  'OPEN': 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800',
  'IN_PROGRESS': 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
  'CLOSED': 'bg-gray-50 dark:bg-gray-950 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800',
};

const allCategories = [
  'Programming & Tech',
  'Graphics & Design', 
  'Video & Animation',
  'Writing & Translation',
  'Music & Audio',
  'Other'
];

const JobsListing = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const searchQuery = searchParams.get('search') || '';
  const categoryQuery = searchParams.get('category') || '';
  const minBudget = searchParams.get('minBudget') || '';
  const maxBudget = searchParams.get('maxBudget') || '';
  
  const [filters, setFilters] = useState({
    search: searchQuery,
    category: categoryQuery,
    minBudget: minBudget,
    maxBudget: maxBudget,
  });
  
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { user, toggleSavedJob } = useContext(AuthContext);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.category) params.category = filters.category;
        if (filters.minBudget) params.minBudget = filters.minBudget;
        if (filters.maxBudget) params.maxBudget = filters.maxBudget;
        
        const res = await api.get('/jobs', { params });
        setJobs(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [filters]);

  const getColorScheme = (category) => categoryColors[category] || categoryColors['Other'];
  const getCategoryIcon = (category) => categoryIcons[category] || MoreHorizontal;
  
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    const params = new URLSearchParams();
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.minBudget) params.set('minBudget', newFilters.minBudget);
    if (newFilters.maxBudget) params.set('maxBudget', newFilters.maxBudget);
    navigate(`?${params.toString()}`, { replace: true });
  };
  
  const clearFilters = () => {
    setFilters({ search: '', category: '', minBudget: '', maxBudget: '' });
    navigate('?');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section with Search */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-500 rounded-lg">
              <Briefcase size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Browse Jobs
            </h1>
          </div>
          
          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs by title, skills, or keyword..."
                value={filters.search}
                onChange={(e) => handleFilterChange({...filters, search: e.target.value})}
                className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg pl-10 pr-4 py-3 outline-none border-2 border-transparent focus:border-blue-500 transition-colors text-sm"
              />
            </div>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden flex items-center gap-2 px-4 py-3 bg-gray-900 dark:bg-gray-800 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition"
            >
              <Filter size={18} />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {(showMobileFilters || window.innerWidth >= 1024) && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="lg:col-span-1"
              >
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 sticky top-32">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h2>
                    {(filters.search || filters.category || filters.minBudget || filters.maxBudget) && (
                      <button
                        onClick={clearFilters}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  
                  {/* Category Filter */}
                  <div className="mb-8">
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                      Category
                    </label>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleFilterChange({...filters, category: ''})}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                          !filters.category
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        All Categories
                      </button>
                      {allCategories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => handleFilterChange({...filters, category: cat})}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                            filters.category === cat
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Budget Filter */}
                  <div className="mb-8">
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-4">
                      Budget Range ($)
                    </label>
                    <div className="space-y-3">
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</div>
                        <input
                          type="number"
                          placeholder="Minimum"
                          min="0"
                          value={filters.minBudget}
                          onChange={(e) => handleFilterChange({...filters, minBudget: e.target.value})}
                          className="w-full pl-8 pr-3 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm outline-none border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700 transition font-semibold"
                        />
                      </div>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</div>
                        <input
                          type="number"
                          placeholder="Maximum"
                          min="0"
                          value={filters.maxBudget}
                          onChange={(e) => handleFilterChange({...filters, maxBudget: e.target.value})}
                          className="w-full pl-8 pr-3 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm outline-none border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700 transition font-semibold"
                        />
                      </div>
                      {(filters.minBudget || filters.maxBudget) && (
                        <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold">
                            Showing jobs from ${filters.minBudget || '0'} to ${filters.maxBudget || 'any'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timeline Filter */}
                  <div className="mb-8">
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                      Timeline
                    </label>
                    <div className="space-y-2">
                      {['1-3 Days', '1 Week', '2-4 Weeks', '1-3 Months'].map((timeline) => (
                        <button
                          key={timeline}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm transition text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          {timeline}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Filters */}
                  {(filters.search || filters.category || filters.minBudget || filters.maxBudget) && (
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-3">Active Filters</p>
                      <div className="flex flex-wrap gap-2">
                        {filters.search && (
                          <span className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-semibold">
                            {filters.search}
                            <button onClick={() => handleFilterChange({...filters, search: ''})}>
                              <X size={14} />
                            </button>
                          </span>
                        )}
                        {filters.category && (
                          <span className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-semibold">
                            {filters.category}
                            <button onClick={() => handleFilterChange({...filters, category: ''})}>
                              <X size={14} />
                            </button>
                          </span>
                        )}
                        {(filters.minBudget || filters.maxBudget) && (
                          <span className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-semibold">
                            ${filters.minBudget || '0'} - ${filters.maxBudget || '∞'}
                            <button onClick={() => handleFilterChange({...filters, minBudget: '', maxBudget: ''})}>
                              <X size={14} />
                            </button>
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Jobs List */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <motion.div 
                    key={i} 
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="bg-gray-200 dark:bg-gray-800 rounded-xl h-48 w-full"
                  ></motion.div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 bg-white dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700"
              >
                <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-xl text-gray-600 dark:text-gray-400 font-semibold">No jobs found</p>
                <p className="text-gray-500 dark:text-gray-500 mt-2">Try adjusting your search criteria</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job, i) => {
                  const colors = getColorScheme(job.category);
                  const CategoryIcon = getCategoryIcon(job.category);
                  const isLiked = user?.savedJobs?.includes(job._id);
                  
                  return (
                    <motion.div 
                      key={job._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group card hover-3d"
                    >
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`p-3 rounded-lg ${colors.bg} flex-shrink-0`}>
                            <CategoryIcon size={22} className={colors.text} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3 mb-2">
                              <div className="flex-1">
                                <p className={`text-xs font-bold uppercase tracking-widest ${colors.text} mb-1`}>
                                  {job.category}
                                </p>
                                <Link to={`/jobs/${job._id}`} className="block group/title">
                                  <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover/title:text-blue-600 dark:group-hover/title:text-blue-400 transition-colors line-clamp-1">
                                    {job.title}
                                  </h3>
                                </Link>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleSavedJob(job._id)}
                                  className="flex-shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                  <Heart 
                                    size={20} 
                                    className={isLiked ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-400'}
                                  />
                                </button>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 ${statusColors[job.status] || statusColors['OPEN']}`}>
                                  {job.status}
                                </span>
                              </div>
                            </div>

                            {/* Description */}
                            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">
                              {job.description}
                            </p>

                            {/* Skills */}
                            {job.skills && job.skills.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {job.skills.slice(0, 3).map((skill, index) => (
                                  <span 
                                    key={index} 
                                    className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md text-xs font-semibold border border-gray-200 dark:border-gray-700"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {job.skills.length > 3 && (
                                  <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md text-xs font-bold">
                                    +{job.skills.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Bottom Info */}
                            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                              {/* Budget */}
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${colors.bg}`}>
                                  <DollarSign size={16} className={colors.text} />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Budget</p>
                                  <p className="font-bold text-gray-900 dark:text-white">
                                    {job.currency === 'INR' ? '₹' : '$'}{job.budget}
                                  </p>
                                </div>
                              </div>

                              {/* Timeline */}
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${colors.bg}`}>
                                  <Clock size={16} className={colors.text} />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Timeline</p>
                                  <p className="font-bold text-gray-900 dark:text-white">{job.deliveryTime}</p>
                                </div>
                              </div>

                              {/* Client Info */}
                              <div className="flex items-center gap-3 ml-auto">
                                {job.client?.profilePicture ? (
                                  <img 
                                    src={job.client.profilePicture} 
                                    alt={job.client.name} 
                                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700" 
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center font-bold text-xs text-white">
                                    {job.client?.name?.charAt(0) || 'C'}
                                  </div>
                                )}
                                <div className="text-sm">
                                  <div className="flex items-center gap-1.5">
                                    <p className="font-semibold text-gray-900 dark:text-white line-clamp-1">{job.client?.name || 'Client'}</p>
                                    {job.client?.paymentVerified !== false && (
                                      <span className="text-[10px] bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 font-bold px-1.5 py-0.2 rounded border border-green-200 dark:border-green-800/40 flex items-center gap-0.5 whitespace-nowrap" title="Payment Verified">
                                        <CheckCircle size={9} /> Verified
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                    <span className="text-xs text-gray-600 dark:text-gray-400">4.9 (120 reviews)</span>
                                  </div>
                                </div>
                              </div>

                              {/* View Button */}
                              <Link
                                to={`/jobs/${job._id}`}
                                className="btn-primary text-sm px-4 py-2 hover:scale-103 shadow-3d-sm ml-auto whitespace-nowrap"
                              >
                                View Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobsListing;
