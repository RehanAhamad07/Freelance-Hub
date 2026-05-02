import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Star, Search as SearchIcon, Zap, Code, PenTool, Video, Pen, Music, MoreHorizontal, X, Filter, CheckCircle, Heart, MessageCircle } from 'lucide-react';

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

const allCategories = [
  'Programming & Tech',
  'Graphics & Design', 
  'Video & Animation',
  'Writing & Translation',
  'Music & Audio',
  'Other'
];

const ServicesListing = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const searchQuery = searchParams.get('search') || '';
  const categoryQuery = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minRating = searchParams.get('minRating') || '';
  
  const [filters, setFilters] = useState({
    search: searchQuery,
    category: categoryQuery,
    minPrice: minPrice,
    maxPrice: maxPrice,
    minRating: minRating,
  });
  
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { user, toggleSavedService } = useContext(AuthContext);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.category) params.category = filters.category;
        if (filters.minPrice) params.minPrice = filters.minPrice;
        if (filters.maxPrice) params.maxPrice = filters.maxPrice;
        if (filters.minRating) params.minRating = filters.minRating;
        
        const res = await api.get('/services', { params });
        setServices(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [filters]);

  const getColorScheme = (category) => categoryColors[category] || categoryColors['Other'];
  const getCategoryIcon = (category) => categoryIcons[category] || MoreHorizontal;
  
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    const params = new URLSearchParams();
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice);
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice);
    if (newFilters.minRating) params.set('minRating', newFilters.minRating);
    navigate(`?${params.toString()}`, { replace: true });
  };
  
  const clearFilters = () => {
    setFilters({ search: '', category: '', minPrice: '', maxPrice: '', minRating: '' });
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
            <div className="p-2.5 bg-pink-500 rounded-lg">
              <Zap size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Explore Services
            </h1>
          </div>
          
          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search services by title, skill, or freelancer..."
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
                    {(filters.search || filters.category || filters.minPrice || filters.maxPrice || filters.minRating) && (
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

                  {/* Price Filter */}
                  <div className="mb-8">
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-4">
                      Price Range ($)
                    </label>
                    <div className="space-y-3">
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</div>
                        <input
                          type="number"
                          placeholder="Minimum"
                          min="0"
                          value={filters.minPrice}
                          onChange={(e) => handleFilterChange({...filters, minPrice: e.target.value})}
                          className="w-full pl-8 pr-3 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm outline-none border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700 transition font-semibold"
                        />
                      </div>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</div>
                        <input
                          type="number"
                          placeholder="Maximum"
                          min="0"
                          value={filters.maxPrice}
                          onChange={(e) => handleFilterChange({...filters, maxPrice: e.target.value})}
                          className="w-full pl-8 pr-3 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm outline-none border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700 transition font-semibold"
                        />
                      </div>
                      {(filters.minPrice || filters.maxPrice) && (
                        <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold">
                            Showing prices from ${filters.minPrice || '0'} to ${filters.maxPrice || 'any'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div className="mb-8">
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                      Minimum Rating
                    </label>
                    <div className="space-y-2">
                      {[5, 4, 3].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handleFilterChange({...filters, minRating: filters.minRating === rating ? '' : rating})}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center gap-2 ${
                            filters.minRating === rating
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} className={i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                          ))}
                          <span>& up</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Filters */}
                  {(filters.search || filters.category || filters.minPrice || filters.maxPrice || filters.minRating) && (
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
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Services Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <motion.div 
                    key={i} 
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="bg-gray-200 dark:bg-gray-800 rounded-xl h-56 w-full"
                  ></motion.div>
                ))}
              </div>
            ) : services.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 bg-white dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700"
              >
                <Zap size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-xl text-gray-600 dark:text-gray-400 font-semibold">No services found</p>
                <p className="text-gray-500 dark:text-gray-500 mt-2">Try adjusting your search criteria</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {services.map((service, i) => {
                  const colors = getColorScheme(service.category);
                  const CategoryIcon = getCategoryIcon(service.category);
                  const isLiked = user?.savedServices?.includes(service._id);
                  
                  return (
                    <motion.div 
                      key={service._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6">
                        {/* Image Section */}
                        <Link to={`/service/${service._id}`} className="sm:col-span-1">
                          <div className="relative h-48 sm:h-full bg-gradient-to-br from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg overflow-hidden group/image">
                            {service.image ? (
                              <img 
                                src={service.image} 
                                alt={service.title} 
                                className="w-full h-full object-cover group-hover/image:scale-110 transition-transform duration-500" 
                              />
                            ) : (
                              <div className={`w-full h-full bg-gradient-to-br ${colors.gradient} opacity-30 flex items-center justify-center`}>
                                <CategoryIcon size={48} className={colors.text} />
                              </div>
                            )}
                            {/* Category Badge */}
                            <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold ${colors.badge} backdrop-blur-sm`}>
                              {service.category}
                            </div>
                          </div>
                        </Link>

                        {/* Content Section */}
                        <div className="sm:col-span-2 flex flex-col">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                              <Link to={`/service/${service._id}`} className="block group/title">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover/title:text-blue-600 dark:group-hover/title:text-blue-400 transition-colors line-clamp-1">
                                  {service.title}
                                </h3>
                              </Link>
                            </div>
                            <button
                              onClick={() => toggleSavedService(service._id)}
                              className="flex-shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                              <Heart 
                                size={20} 
                                className={isLiked ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-400'}
                              />
                            </button>
                          </div>

                          {/* Freelancer Info */}
                          <div className="flex items-center gap-3 mb-4">
                            {service.freelancer?.profilePicture ? (
                              <img 
                                src={service.freelancer.profilePicture} 
                                alt={service.freelancer.name} 
                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700" 
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center font-bold text-xs text-white">
                                {service.freelancer?.name?.charAt(0) || 'F'}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {service.freelancer?.name || 'Freelancer'}
                              </p>
                              <div className="flex items-center gap-2">
                                <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                                <span className="text-xs text-gray-600 dark:text-gray-400">Verified Seller</span>
                              </div>
                            </div>
                          </div>

                          {/* Rating and Reviews */}
                          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, idx) => (
                                <Star 
                                  key={idx} 
                                  size={14} 
                                  className={`transition-colors ${idx < Math.round(service.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                              {(service.rating || 0).toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ({service.reviewsCount || 0} reviews)
                            </span>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4 flex-1">
                            {service.description || 'Professional service'}
                          </p>

                          {/* Bottom Info */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {/* Price */}
                              <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">FROM</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                  {service.currency === 'INR' ? '₹' : '$'}{service.price}
                                </p>
                              </div>

                              {/* Delivery */}
                              {service.deliveryTime && (
                                <div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">DELIVERY</p>
                                  <p className="text-sm font-bold text-gray-900 dark:text-white">{service.deliveryTime}</p>
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                <MessageCircle size={18} className="text-gray-600 dark:text-gray-400" />
                              </button>
                              <Link
                                to={`/service/${service._id}`}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors whitespace-nowrap"
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

export default ServicesListing;
