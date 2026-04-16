import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Star, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

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
      await api.post('/orders', { serviceId: id });
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
      {/* Main Content */}
      <div className="flex-1">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          {service.title}
        </h1>
        
        <Link 
          to={`/profile/${service.freelancer?._id}`}
          className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200 dark:border-gray-800 transition-opacity hover:opacity-80"
        >
          {service.freelancer?.profilePicture ? (
            <img src={service.freelancer.profilePicture} alt="Profile" className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center font-bold text-xl text-gray-700">
              {service.freelancer?.name?.charAt(0)}
            </div>
          )}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg hover:underline">{service.freelancer?.name || 'Freelancer'}</h3>
            <div className="flex items-center gap-1 text-yellow-500">
              <Star size={16} className="fill-yellow-500" />
              <span className="font-bold">{service.rating.toFixed(1)}</span>
              <span className="text-gray-500 dark:text-gray-400">({service.reviewsCount} reviews)</span>
            </div>
          </div>
        </Link>

        <div className="flex gap-4 mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
          <a 
            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${service.freelancer?.email}&su=Inquiry%20from%20FreelanceHub:%20${encodeURIComponent(service.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 justify-center items-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            Email Freelancer
          </a>
          <button 
            onClick={handleMessageClick}
            className="flex-1 border border-primary text-primary hover:bg-primary hover:text-white font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            Message on Hub
          </button>
        </div>

        <div className="w-full aspect-video bg-indigo-100 dark:bg-gray-800 rounded-3xl mb-10 flex flex-col items-center justify-center relative overflow-hidden text-gray-500 dark:text-gray-400">
          {service.image ? (
            <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
          ) : (
            <>
              <span className="font-bold text-2xl uppercase tracking-widest opacity-30">{service.category}</span>
              <span className="mt-2 opacity-50">Image Placeholder</span>
            </>
          )}
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">About This Gig</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-medium whitespace-pre-wrap">
            {service.description}
          </p>
        </div>

        {/* Reviews Section */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Reviews ({reviews.length})</h2>
          
          {user?.role === 'client' && (
            <form onSubmit={handleReviewSubmit} className="mb-10 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Leave a Review</h4>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-gray-700 dark:text-gray-300">Rating:</span>
                <select 
                  value={reviewForm.rating} 
                  onChange={e => setReviewForm({...reviewForm, rating: Number(e.target.value)})}
                  className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-3 py-1 outline-none text-gray-900 dark:text-white"
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
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary mb-4"
                rows={3}
              ></textarea>
              <button type="submit" className="bg-primary hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                Post Review
              </button>
            </form>
          )}

          <div className="space-y-6">
            {reviews.map((rev) => (
              <div key={rev._id} className="pb-6 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-500">
                    {rev.clientName?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 dark:text-white">{rev.clientName}</h5>
                    <div className="flex items-center gap-1 text-yellow-500 text-sm">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < rev.rating ? "fill-yellow-500" : "text-gray-300 dark:text-gray-600"} />
                      ))}
                      <span className="text-gray-500 ml-2">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 ml-13 font-medium">
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
          className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-xl sticky top-24"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl text-gray-900 dark:text-white">Standard Package</h3>
            <span className="text-3xl font-black text-gray-900 dark:text-white">${service.price}</span>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 font-medium mb-6">
            Includes high quality delivery based on exactly what you need.
          </p>

          <div className="flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200 mb-8">
            <Clock size={20} className="text-gray-500" />
            <span>{service.deliveryTime} Delivery</span>
          </div>

          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300"><CheckCircle size={20} className="text-primary"/> Source File Included</li>
            <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300"><CheckCircle size={20} className="text-primary"/> High Resolution</li>
            <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300"><CheckCircle size={20} className="text-primary"/> Revisions</li>
          </ul>

          <button 
            onClick={handleOrder}
            className="w-full bg-primary hover:bg-green-600 text-white font-bold py-4 rounded-xl text-lg transition-all transform hover:scale-[1.02] shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
          >
            Continue to Order
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default ServiceDetail;
