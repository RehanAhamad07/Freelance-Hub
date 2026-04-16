import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { Briefcase, Search as SearchIcon, Clock, DollarSign, Code, PenTool, Video, Pen, Music, MoreHorizontal } from 'lucide-react';

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
  'OPEN': 'bg-gradient-to-r from-green-400 to-green-600 text-white',
  'IN_PROGRESS': 'bg-gradient-to-r from-blue-400 to-blue-600 text-white',
  'CLOSED': 'bg-gradient-to-r from-gray-400 to-gray-600 text-white',
};

const JobsListing = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const categoryQuery = searchParams.get('category') || '';

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const params = {};
        if (searchQuery) params.search = searchQuery;
        if (categoryQuery) params.category = categoryQuery;
        
        const res = await api.get('/jobs', { params });
        setJobs(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [searchQuery, categoryQuery]);

  const getColorScheme = (category) => categoryColors[category] || categoryColors['Other'];
  const getCategoryIcon = (category) => categoryIcons[category] || MoreHorizontal;

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-14 relative"
        >
          <div className="absolute -top-20 left-0 right-0 h-40 bg-gradient-to-b from-blue-100/30 to-transparent dark:from-blue-950/20 blur-3xl rounded-full"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Briefcase size={24} className="text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Explore Jobs
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 font-medium ml-0">
              Find freelance opportunities and tasks from amazing clients
            </p>
          </div>
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <motion.div 
                key={i} 
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="animate-pulse bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl h-40 border border-gray-200 dark:border-gray-600 w-full"
              ></motion.div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700"
          >
            <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-xl text-gray-600 dark:text-gray-400 font-semibold">No jobs found</p>
            <p className="text-gray-500 dark:text-gray-500 mt-2">Try adjusting your search criteria</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job, i) => {
              const colors = getColorScheme(job.category);
              const CategoryIcon = getCategoryIcon(job.category);
              
              return (
                <motion.div 
                  key={job._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className={`group relative rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col`}
                >
                  {/* Gradient accent bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient}`}></div>
                  
                  {/* Background gradient effect */}
                  <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-5 pointer-events-none ${colors.bg.replace('bg-', 'bg-').replace('-50', '-400')}`}></div>

                  <div className="p-6 flex flex-col h-full relative z-10">
                    {/* Header with category and status */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2.5 rounded-xl ${colors.bg} flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          <CategoryIcon size={20} className={colors.text} />
                        </div>
                        <div className="flex-1">
                          <p className={`text-xs font-bold uppercase tracking-widest ${colors.text} mb-1`}>
                            {job.category}
                          </p>
                          <Link to={`/jobs/${job._id}`} className="block group/title">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white group-hover/title:text-transparent group-hover/title:bg-gradient-to-r group-hover/title:from-blue-600 group-hover/title:to-purple-600 group-hover/title:bg-clip-text transition-all line-clamp-2">
                              {job.title}
                            </h3>
                          </Link>
                        </div>
                      </div>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap ${statusColors[job.status] || statusColors['OPEN']} shadow-lg`}>
                        {job.status}
                      </span>
                    </div>
                    
                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4 leading-relaxed">
                      {job.description}
                    </p>
                    
                    {/* Skills */}
                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.skills.slice(0, 3).map((skill, index) => (
                          <span 
                            key={index} 
                            className={`px-3 py-1 rounded-lg text-xs font-semibold ${colors.badge} border border-current border-opacity-20 backdrop-blur-sm`}
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 3 && (
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold ${colors.badge} border border-current border-opacity-20`}>
                            +{job.skills.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Bottom section */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-auto space-y-3">
                      {/* Budget and Timeline */}
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${colors.bg}`}>
                              <DollarSign size={16} className={colors.text} />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Budget</p>
                              <p className="font-bold text-gray-900 dark:text-white flex items-center">
                                <span className={`text-lg mr-1 ${colors.text}`}>{job.currency === 'INR' ? '₹' : '$'}</span>
                                {job.budget}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${colors.bg}`}>
                            <Clock size={16} className={colors.text} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Timeline</p>
                            <p className="font-bold text-gray-900 dark:text-white">{job.deliveryTime}</p>
                          </div>
                        </div>
                      </div>

                      {/* Posted by */}
                      <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Posted by</span>
                        <div className="flex items-center gap-2 flex-1">
                          {job.client?.profilePicture ? (
                            <img 
                              src={job.client.profilePicture} 
                              alt={job.client.name} 
                              className="w-7 h-7 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600" 
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center font-bold text-xs text-white">
                              {job.client?.name?.charAt(0) || 'C'}
                            </div>
                          )}
                          <span className="font-semibold text-gray-800 dark:text-gray-200">{job.client?.name || 'Client'}</span>
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
  );
};

export default JobsListing;
