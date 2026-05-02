import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Briefcase, Zap, Star, Clock, DollarSign, ArrowRight } from 'lucide-react';

const SavedItems = () => {
  const { user, toggleSavedService, toggleSavedJob } = useContext(AuthContext);
  const [savedServices, setSavedServices] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('services'); // 'services' or 'jobs'

  useEffect(() => {
    const fetchSavedItems = async () => {
      try {
        const res = await api.get('/auth/saved');
        setSavedServices(res.data.savedServices || []);
        setSavedJobs(res.data.savedJobs || []);
      } catch (error) {
        console.error('Failed to fetch saved items', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSavedItems();
  }, [user?.savedServices?.length, user?.savedJobs?.length]); 

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
            <Heart size={28} className="text-red-500 fill-red-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Saved Items
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 mb-8 border-b border-gray-200 dark:border-gray-800 pb-px">
          <button
            onClick={() => setActiveTab('services')}
            className={`flex items-center gap-2 pb-4 px-2 border-b-2 transition-colors font-bold ${
              activeTab === 'services' 
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' 
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Zap size={20} />
            Services ({savedServices.length})
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex items-center gap-2 pb-4 px-2 border-b-2 transition-colors font-bold ${
              activeTab === 'jobs' 
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' 
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Briefcase size={20} />
            Jobs ({savedJobs.length})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'services' && (
              <motion.div
                key="services"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {savedServices.length === 0 ? (
                  <div className="col-span-full py-20 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
                    <Zap size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No saved services</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">You haven't saved any services yet.</p>
                    <Link to="/services" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors">
                      Browse Services <ArrowRight size={18} />
                    </Link>
                  </div>
                ) : (
                  savedServices.map(service => (
                    <div key={service._id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
                      <div className="relative h-48 bg-gray-100 dark:bg-gray-800">
                        {service.image ? (
                          <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-gray-400">No Image</div>
                        )}
                        <button 
                          onClick={() => toggleSavedService(service._id)}
                          className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-black/50 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-black transition-colors"
                        >
                          <Heart size={20} className="text-red-500 fill-red-500" />
                        </button>
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <Link to={`/service/${service._id}`} className="block mb-2 group/title flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-2 group-hover/title:text-blue-600 transition-colors">{service.title}</h3>
                        </Link>
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                           <div className="flex items-center gap-1">
                             <Star size={16} className="text-yellow-400 fill-yellow-400" />
                             <span className="font-bold text-gray-900 dark:text-white text-sm">{(service.rating || 0).toFixed(1)}</span>
                           </div>
                           <p className="font-bold text-lg text-gray-900 dark:text-white">
                             {service.currency === 'INR' ? '₹' : '$'}{service.price}
                           </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'jobs' && (
              <motion.div
                key="jobs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {savedJobs.length === 0 ? (
                  <div className="col-span-full py-20 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
                    <Briefcase size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No saved jobs</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">You haven't saved any jobs yet.</p>
                    <Link to="/jobs" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors">
                      Browse Jobs <ArrowRight size={18} />
                    </Link>
                  </div>
                ) : (
                  savedJobs.map(job => (
                    <div key={job._id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all p-6 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold">
                          {job.category}
                        </span>
                        <button 
                          onClick={() => toggleSavedJob(job._id)}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <Heart size={20} className="text-red-500 fill-red-500" />
                        </button>
                      </div>
                      <Link to={`/jobs/${job._id}`} className="block mb-2 group">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                      </Link>
                      <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4 flex-1">{job.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div>
                          <p className="text-xs text-gray-500 font-semibold mb-1 flex items-center gap-1"><DollarSign size={12}/> Budget</p>
                          <p className="font-bold text-gray-900 dark:text-white">{job.currency === 'INR' ? '₹' : '$'}{job.budget}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold mb-1 flex items-center gap-1"><Clock size={12}/> Time</p>
                          <p className="font-bold text-gray-900 dark:text-white truncate">{job.deliveryTime}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default SavedItems;
