import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { Star, Search as SearchIcon, Zap, Code, PenTool, Video, Pen, Music, MoreHorizontal } from 'lucide-react';

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

const ServicesListing = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const categoryQuery = searchParams.get('category') || '';

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const params = {};
        if (searchQuery) params.search = searchQuery;
        if (categoryQuery) params.category = categoryQuery;
        
        const res = await api.get('/services', { params });
        setServices(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
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
          <div className="absolute -top-20 left-0 right-0 h-40 bg-gradient-to-b from-pink-100/30 to-transparent dark:from-pink-950/20 blur-3xl rounded-full"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg">
                <Zap size={24} className="text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Explore Services
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 font-medium ml-0">
              Discover top-rated freelancers and amazing gigs
            </p>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <motion.div 
                key={i} 
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="animate-pulse bg-gradient-to-b from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-3xl h-96 border border-gray-200 dark:border-gray-600"
              ></motion.div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700"
          >
            <Zap size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-xl text-gray-600 dark:text-gray-400 font-semibold">No services found</p>
            <p className="text-gray-500 dark:text-gray-500 mt-2">Try adjusting your search criteria</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {services.map((service, i) => {
              const colors = getColorScheme(service.category);
              const CategoryIcon = getCategoryIcon(service.category);
              
              return (
                <motion.div 
                  key={service._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="group rounded-3xl overflow-hidden shadow-md hover:shadow-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300 flex flex-col h-full relative"
                >
                  {/* Gradient accent top bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient}`}></div>

                  <Link to={`/service/${service._id}`} className="flex-1 flex flex-col">
                    {/* Image section */}
                    <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-600 w-full overflow-hidden">
                      {service.image ? (
                        <img 
                          src={service.image} 
                          alt={service.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                      ) : (
                        <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-20 flex items-center justify-center`}>
                          <CategoryIcon size={40} className="text-gray-400" />
                        </div>
                      )}
                      {/* Overlay badge */}
                      <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold ${colors.badge} backdrop-blur-sm shadow-lg`}>
                        {service.category}
                      </div>
                    </div>

                    {/* Content section */}
                    <div className="p-5 flex-1 flex flex-col">
                      {/* Freelancer info */}
                      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                        {service.freelancer?.profilePicture ? (
                          <img 
                            src={service.freelancer.profilePicture} 
                            alt={service.freelancer.name} 
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600" 
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center font-bold text-xs text-white">
                            {service.freelancer?.name?.charAt(0) || 'F'}
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{service.freelancer?.name || 'Freelancer'}</p>
                          <p className={`text-xs font-semibold ${colors.text} uppercase tracking-widest`}>{service.category}</p>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-black text-gray-900 dark:text-white line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all mb-3 text-lg">
                        {service.title}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={16} 
                              className={`transition-colors ${i < Math.round(service.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{service.rating.toFixed(1)}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">({service.reviewsCount})</span>
                      </div>
                    </div>

                    {/* Footer price section */}
                    <div className={`px-5 py-4 border-t ${colors.border} flex justify-between items-center ${colors.bg} group-hover:shadow-inner transition-all`}>
                      <span className="text-xs text-gray-600 dark:text-gray-400 font-bold uppercase tracking-widest">From</span>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-2xl font-black ${colors.text}`}>{service.currency === 'INR' ? '₹' : '$'}</span>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">{service.price}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesListing;
