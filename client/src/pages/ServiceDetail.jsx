import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Star, Clock, CheckCircle, Heart, Award } from 'lucide-react';
import { toast } from 'react-toastify';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, toggleSavedService } = useContext(AuthContext);
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [selectedAddons, setSelectedAddons] = useState([]);

  useEffect(() => {
    const fetchServiceAndReviews = async () => {
      try {
        const [serviceRes, reviewsRes] = await Promise.all([
          api.get(`/services/${id}`),
          api.get(`/reviews/${id}`)
        ]);
        setService(serviceRes.data);
        setReviews(reviewsRes.data);
      } catch (error) {
        console.error(error);
        toast.error('Service not found');
        navigate('/services');
      } finally {
        setLoading(false);
      }
    };
    fetchServiceAndReviews();
  }, [id, navigate]);

  const handleMessageClick = async () => {
    if (!user) {
      toast.info('Please log in to send a message');
      navigate('/login');
      return;
    }
    const userId = user?.id || user?._id;
    if (userId === service.freelancer._id) {
      toast.error('You cannot message yourself');
      return;
    }
    try {
      const res = await api.post('/chat/conversations', { receiverId: service.freelancer._id });
      navigate('/chat', { state: { activeConversationId: res.data._id } });
    } catch (error) {
      toast.error('Failed to initiate chat');
    }
  };

  const handleOrder = async () => {
    if (!user) {
      toast.info('Please log in to place an order');
      navigate('/login');
      return;
    }
    // Restriction removed: anyone can place an order

    try {
      await api.post('/orders', { serviceId: id, addons: selectedAddons });
      toast.success('Order placed successfully! Redirecting to Dashboard...');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to place order');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.info('Please log in to leave a review.');
    
    try {
      const res = await api.post('/reviews', { 
        serviceId: id, 
        rating: reviewForm.rating, 
        comment: reviewForm.comment 
      });
      toast.success('Review posted successfully!');
      setReviews([res.data, ...reviews]);
      setReviewForm({ rating: 5, comment: '' });
      // Fetch updated service explicitly to get new rating
      const serviceRes = await api.get(`/services/${id}`);
      setService(serviceRes.data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to post review');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!service) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 mt-8 flex flex-col md:flex-row gap-10">
      <Helmet>
        <title>{service.title} | FreelanceHub</title>
        <meta name="description" content={service.description?.substring(0, 150)} />
        <meta property="og:title" content={service.title} />
        <meta property="og:description" content={service.description?.substring(0, 150)} />
        <meta property="og:image" content={service.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80'} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={service.title} />
        <meta name="twitter:description" content={service.description?.substring(0, 150)} />
        <meta name="twitter:image" content={service.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80'} />
      </Helmet>
      {/* Main Content */}
      <div className="flex-1">
        <div className="flex items-start justify-between gap-4 mb-6">
          <h1 className="text-3xl md:text-5xl font-display font-extrabold text-gray-900 dark:text-white leading-tight">
            {service.title}
          </h1>
          <button 
            onClick={() => toggleSavedService(service._id)}
            className="p-3 bg-gray-50 hover:bg-slate-100 dark:bg-dark-card dark:hover:bg-slate-800/40 border border-gray-200/50 dark:border-dark-border/60 rounded-2xl transition-all flex-shrink-0 shadow-3d-sm"
          >
            <Heart 
              size={24} 
              className={user?.savedServices?.includes(service._id) ? "text-brand-pink fill-brand-pink" : "text-gray-400 hover:text-brand-pink"} 
            />
          </button>
        </div>
        
        <Link 
          to={`/profile/${service.freelancer?._id}`}
          className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100 dark:border-dark-border/40 transition-opacity hover:opacity-90"
        >
          {service.freelancer?.profilePicture ? (
            <img src={service.freelancer.profilePicture} alt="Profile" className="w-12 h-12 rounded-full object-cover border border-slate-200/50 dark:border-dark-border" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center font-bold text-xl text-white">
              {service.freelancer?.name?.charAt(0)}
            </div>
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display font-bold text-gray-900 dark:text-white text-lg hover:underline">{service.freelancer?.name || 'Freelancer'}</h3>
              {service.freelancer?.verificationStatus === 'verified' && (
                <span className="px-2.5 py-0.5 bg-green-50/80 dark:bg-green-950/20 text-brand-green dark:text-brand-green/90 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-0.5 border border-green-100 dark:border-green-900/40">
                  <CheckCircle size={10} /> Verified Seller
                </span>
              )}
              {service.freelancer?.isTopRated && (
                <span className="px-2.5 py-0.5 bg-amber-50/80 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-0.5 border border-amber-100 dark:border-amber-900/40">
                  <Award size={10} /> Top Rated
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-yellow-500 mt-0.5">
              <Star size={15} className="fill-yellow-500 text-yellow-500" />
              <span className="font-bold text-sm text-gray-900 dark:text-white">{service.rating.toFixed(1)}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">({service.reviewsCount} reviews)</span>
            </div>
          </div>
        </Link>
 
        <div className="flex gap-4 mb-8 pb-8 border-b border-slate-100 dark:border-dark-border/40">
          <a 
            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${service.freelancer?.email}&su=Inquiry%20from%20FreelanceHub:%20${encodeURIComponent(service.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex flex-1 justify-center items-center gap-2 text-sm font-bold shadow-3d-sm hover:scale-102 py-3 rounded-xl"
          >
            Email Freelancer
          </a>
          <button 
            onClick={handleMessageClick}
            className="btn-primary flex-1 text-sm font-bold shadow-3d-sm hover:scale-102 py-3 rounded-xl"
          >
            Message on Hub
          </button>
        </div>
 
        <div className="w-full aspect-video bg-indigo-50/50 dark:bg-dark-card/60 rounded-3xl mb-10 flex flex-col items-center justify-center relative overflow-hidden text-gray-400 dark:text-gray-500 border border-slate-200/50 dark:border-dark-border/60 shadow-3d-lg dark:shadow-3d-dark-lg">
          {service.image ? (
            <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
          ) : (
            <>
              <span className="font-display font-extrabold text-2xl uppercase tracking-widest opacity-25">{service.category}</span>
              <span className="mt-2 text-xs opacity-40">No Image Available</span>
            </>
          )}
        </div>
 
        <div className="mb-12">
          <h2 className="text-2xl font-display font-bold mb-4 text-gray-900 dark:text-white">About This Gig</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">
            {service.description}
          </p>
        </div>
 
        {/* Reviews Section */}
        <div className="pt-8 border-t border-slate-100 dark:border-dark-border/40">
          <h2 className="text-2xl font-display font-bold mb-6 text-gray-900 dark:text-white">Reviews ({reviews.length})</h2>
          
          {user && (
            <form onSubmit={handleReviewSubmit} className="mb-10 card p-6 bg-slate-50/30 dark:bg-dark-card/30 border border-slate-100 dark:border-dark-border/50">
              <h4 className="font-display font-bold text-gray-900 dark:text-white mb-4">Leave a Review</h4>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Rating:</span>
                <select 
                  value={reviewForm.rating} 
                  onChange={e => setReviewForm({...reviewForm, rating: Number(e.target.value)})}
                  className="bg-white dark:bg-dark/40 border border-gray-200 dark:border-dark-border rounded-xl px-4 py-1.5 outline-none text-sm font-semibold text-gray-900 dark:text-white focus:border-brand-blue"
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Good</option>
                  <option value={3}>3 - Average</option>
                  <option value={2}>2 - Poor</option>
                  <option value={1}>1 - Terrible</option>
                </select>
              </div>
              <textarea 
                value={reviewForm.comment}
                onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}
                required
                placeholder="Share your experience working with this freelancer..."
                className="input-primary w-full h-24 mb-4 focus:ring-1 focus:ring-brand-blue"
                rows={3}
              ></textarea>
              <button type="submit" className="btn-success px-6 py-2.5 shadow-3d-sm hover:scale-102 rounded-xl text-sm font-bold">
                Post Review
              </button>
            </form>
          )}

          <div className="space-y-6">
            {reviews.map((rev) => (
              <div key={rev._id} className="pb-6 border-b border-slate-100 dark:border-dark-border/40 last:border-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue to-brand-indigo flex items-center justify-center font-bold text-white text-sm">
                    {rev.clientName?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h5 className="font-display font-bold text-gray-900 dark:text-white text-sm">{rev.clientName}</h5>
                    <div className="flex items-center gap-1 text-yellow-500 text-xs mt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className={i < rev.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300 dark:text-gray-600"} />
                      ))}
                      <span className="text-slate-400 ml-2 font-semibold">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-300 ml-13 text-sm font-medium leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar / Checkout Card */}
      <div className="w-full md:w-[400px]">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-8 sticky top-24 shadow-3d-lg dark:shadow-3d-dark-lg hover-3d"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display font-extrabold text-xl text-gray-900 dark:text-white">Standard Package</h3>
            <span className="text-3xl font-display font-extrabold text-gray-900 dark:text-white">${service.price}</span>
          </div>
          
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-6">
            Includes high quality delivery based on exactly what you need.
          </p>

          <div className="flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200 mb-8 text-sm">
            <Clock size={18} className="text-slate-400" />
            <span>{service.deliveryTime} Delivery</span>
          </div>

          <ul className="space-y-4 mb-8 text-sm">
            <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-semibold"><CheckCircle size={18} className="text-brand-green"/> Source File Included</li>
            <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-semibold"><CheckCircle size={18} className="text-brand-green"/> High Resolution</li>
            <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-semibold"><CheckCircle size={18} className="text-brand-green"/> Revisions</li>
          </ul>

          {/* Add-ons */}
          {service.addons && service.addons.length > 0 && (
            <div className="mb-6">
              <p className="font-display font-bold text-sm text-gray-800 dark:text-gray-200 mb-3">💎 Boost Your Order</p>
              <div className="space-y-2">
                {service.addons.map(addon => (
                  <label key={addon._id} className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedAddons.includes(addon._id) 
                      ? 'border-brand-blue bg-blue-50/50 dark:bg-blue-950/20' 
                      : 'border-slate-200/50 dark:border-dark-border/60 hover:border-brand-blue/40'
                  }`}>
                    <input type="checkbox" className="w-4 h-4 accent-brand-blue rounded" 
                      checked={selectedAddons.includes(addon._id)}
                      onChange={e => {
                        if (e.target.checked) setSelectedAddons([...selectedAddons, addon._id]);
                        else setSelectedAddons(selectedAddons.filter(a => a !== addon._id));
                      }} />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{addon.title}</p>
                      {addon.description && <p className="text-xs text-gray-500 mt-0.5">{addon.description}</p>}
                    </div>
                    <span className="text-sm font-black text-brand-green">+${addon.price}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Total */}
          {selectedAddons.length > 0 && (
            <div className="flex justify-between items-center mb-6 py-4 border-t border-slate-100 dark:border-dark-border/40">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Total</span>
              <span className="text-2xl font-display font-extrabold text-gray-900 dark:text-white">
                ${service.price + (service.addons || []).filter(a => selectedAddons.includes(a._id)).reduce((s, a) => s + a.price, 0)}
              </span>
            </div>
          )}

          <button 
            onClick={handleOrder}
            className="w-full btn-success py-4 hover:scale-[1.02] shadow-3d-md hover:shadow-glow-primary rounded-2xl text-base font-bold flex items-center justify-center gap-2"
          >
            Continue to Order{selectedAddons.length > 0 ? ` ($${service.price + (service.addons || []).filter(a => selectedAddons.includes(a._id)).reduce((s, a) => s + a.price, 0)})` : ''}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default ServiceDetail;
