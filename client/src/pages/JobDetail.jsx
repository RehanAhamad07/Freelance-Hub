import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { DollarSign, Clock, Calendar, CheckCircle, MapPin, Star, ArrowLeft, Share2, Heart, X, Users, Wand2, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalCount, setProposalCount] = useState(0);
  const [submittingProposal, setSubmittingProposal] = useState(false);
  const [aiProposalLoading, setAiProposalLoading] = useState(false);
  const { user, toggleSavedJob } = useContext(AuthContext);
  const navigate = useNavigate();

  const [proposalForm, setProposalForm] = useState({
    title: '',
    description: '',
    bidAmount: '',
    deliveryTime: '7',
    coverLetter: '',
  });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${id}`);
        setJob(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  useEffect(() => {
    const fetchProposalCount = async () => {
      try {
        const res = await api.get(`/proposals/job/${id}/count`);
        setProposalCount(res.data.count);
      } catch (error) {
        console.error('Error fetching proposal count:', error);
      }
    };
    if (id) {
      fetchProposalCount();
    }
  }, [id]);

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.info('Please log in to submit a proposal');
      navigate('/login');
      return;
    }

    if (!proposalForm.title || !proposalForm.description || !proposalForm.bidAmount) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmittingProposal(true);
    try {
      await api.post('/proposals', {
        jobId: id,
        title: proposalForm.title,
        description: proposalForm.description,
        bidAmount: parseFloat(proposalForm.bidAmount),
        deliveryTime: proposalForm.deliveryTime,
        coverLetter: proposalForm.coverLetter,
      });
      
      toast.success('Proposal submitted successfully!');
      setShowProposalForm(false);
      setProposalForm({
        title: '',
        description: '',
        bidAmount: '',
        deliveryTime: '7',
        coverLetter: '',
      });
      
      // Refresh proposal count
      const res = await api.get(`/proposals/job/${id}/count`);
      setProposalCount(res.data.count);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit proposal');
    } finally {
      setSubmittingProposal(false);
    }
  };

  const handleMessageClient = async () => {
    if (!user) {
      toast.info('Please log in to message the client');
      navigate('/login');
      return;
    }
    if (user.id === job.client._id || user._id === job.client._id) {
       toast.info('This is your own job post');
       return;
    }
    try {
      const res = await api.post('/chat/conversations', {
        senderId: user.id || user._id,
        receiverId: job.client._id,
      });
      navigate('/chat');
    } catch (error) {
      toast.error('Failed to start conversation');
    }
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto px-4 py-12 mt-8 animate-pulse"
      >
        <div className="h-8 bg-gray-200 dark:bg-gray-700 w-3/4 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 w-1/4 rounded mb-8"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 w-full rounded mb-4"></div>
      </motion.div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">Job not found</p>
        <Link to="/jobs" className="text-blue-600 hover:text-blue-700 font-semibold mt-4 inline-block">
          Back to Jobs
        </Link>
      </div>
    );
  }

  const statusColor = {
    'OPEN': 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800',
    'IN_PROGRESS': 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
    'CLOSED': 'bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800',
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20"
    >
      <Helmet>
        <title>{job.title} | FreelanceHub Jobs</title>
        <meta name="description" content={job.description?.substring(0, 150)} />
        <meta property="og:title" content={job.title} />
        <meta property="og:description" content={job.description?.substring(0, 150)} />
        <meta property="og:image" content={job.client?.profilePicture || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80'} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={job.title} />
        <meta name="twitter:description" content={job.description?.substring(0, 150)} />
        <meta name="twitter:image" content={job.client?.profilePicture || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80'} />
      </Helmet>

      {/* Breadcrumb and Actions */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate('/jobs')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-semibold transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Jobs
          </button>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <Share2 size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button 
              onClick={() => toggleSavedJob(job._id)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Heart 
                size={20} 
                className={user?.savedJobs?.includes(job._id) ? 'text-red-500 fill-red-500' : 'text-gray-600 dark:text-gray-400'} 
              />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor[job.status] || statusColor['OPEN']}`}>
                        {job.status === 'OPEN' ? '● Open' : job.status === 'IN_PROGRESS' ? '● In Progress' : '● Closed'}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold">
                        {job.category}
                      </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                      {job.title}
                    </h1>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign size={18} className="text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Budget</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {job.currency === 'INR' ? '₹' : '$'}{job.budget}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Clock size={18} className="text-purple-600 dark:text-purple-400" />
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Timeline</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{job.deliveryTime}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar size={18} className="text-orange-600 dark:text-orange-400" />
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Posted</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-10 border-b border-gray-200 dark:border-gray-800 pb-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Job Description</h2>
                <p className="whitespace-pre-line text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                  {job.description}
                </p>
              </div>

              {/* Required Skills */}
              {job.skills && job.skills.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Required Skills</h2>
                  <div className="flex flex-wrap gap-3">
                    {job.skills.map((skill, idx) => (
                      <span 
                        key={idx} 
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Proposals Section */}
              <div className="mt-10 pt-10 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Users size={24} className="text-blue-600 dark:text-blue-400" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Proposals</h2>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-bold">
                      {proposalCount}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {proposalCount === 0 
                    ? 'No proposals yet. Be the first to submit one!' 
                    : `${proposalCount} freelancer${proposalCount !== 1 ? 's have' : ' has'} submitted proposal${proposalCount !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Client Card */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">About the Client</h2>
              
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
                  {job.client?.profilePicture ? (
                    <img 
                      src={job.client.profilePicture} 
                      alt={job.client.name} 
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700" 
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center font-bold text-white text-2xl">
                      {job.client?.name?.charAt(0) || 'C'}
                    </div>
                  )}
                  <div className="flex-1">
                    <Link 
                      to={`/profile/${job.client._id}`} 
                      className="font-bold text-gray-900 dark:text-white text-lg hover:text-blue-600 dark:hover:text-blue-400 transition-colors block"
                    >
                      {job.client.name}
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-green-600 dark:text-green-400">
                      <div className="flex items-center gap-1">
                        <CheckCircle size={14} />
                        <span className="font-medium">Verified Employer</span>
                      </div>
                      {job.client.paymentVerified !== false && (
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded text-[11px] font-bold uppercase tracking-wider border border-green-200 dark:border-green-800/50">
                          💳 Payment Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Client Stats */}
                <div className="space-y-4">
                  {job.client.country && (
                    <div className="flex items-center gap-3">
                      <MapPin size={18} className="text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Location</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{job.client.country}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <Star size={18} className="text-yellow-500" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Rating</p>
                      <p className="font-semibold text-gray-900 dark:text-white">4.9 ★ (120 reviews)</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-green-500" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Jobs Posted</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{job.client.completedJobs || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <button 
                onClick={() => {
                  if (!user) {
                    toast.info('Please log in to submit a proposal');
                    navigate('/login');
                  } else if (user.id === job.client._id || user._id === job.client._id) {
                    toast.info('You cannot apply to your own job');
                  } else {
                    setShowProposalForm(true);
                  }
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-lg transition-all transform hover:shadow-lg mb-3"
              >
                Apply
              </button>
              <button 
                onClick={handleMessageClient}
                className="w-full border-2 border-gray-300 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-500 text-gray-900 dark:text-white font-bold py-3 rounded-lg transition-colors"
              >
                Message Client
              </button>

              {/* Trust Badges */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-3">Safe & Secure</p>
                <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-500" />
                    <span>Verified Employer</span>
                  </div>
                  {job.client.paymentVerified !== false && (
                    <div className="flex items-center gap-2 font-semibold text-green-700 dark:text-green-400">
                      <CheckCircle size={14} className="text-green-500" />
                      <span>Payment Method Verified</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-500" />
                    <span>Secure Payments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-500" />
                    <span>24/7 Support</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Proposal Form Modal */}
      {showProposalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Submit Your Proposal</h2>
              <button
                onClick={() => setShowProposalForm(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleProposalSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Proposal Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., I will create a professional website for you"
                  value={proposalForm.title}
                  onChange={(e) => setProposalForm({ ...proposalForm, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Proposal Description *
                </label>
                <textarea
                  placeholder="Tell the client why you're the perfect fit for this job and how you'll complete it..."
                  value={proposalForm.description}
                  onChange={(e) => setProposalForm({ ...proposalForm, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-800 dark:text-white h-28 resize-none"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {proposalForm.description.length}/500 characters
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Bid Amount ({job?.currency}) *
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={proposalForm.bidAmount}
                    onChange={(e) => setProposalForm({ ...proposalForm, bidAmount: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Delivery Time (Days) *
                  </label>
                  <select
                    value={proposalForm.deliveryTime}
                    onChange={(e) => setProposalForm({ ...proposalForm, deliveryTime: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="1">1 Day</option>
                    <option value="3">3 Days</option>
                    <option value="7">7 Days</option>
                    <option value="14">14 Days</option>
                    <option value="30">30 Days</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                    Cover Letter
                  </label>
                  <button
                    type="button"
                    disabled={aiProposalLoading}
                    onClick={async () => {
                      setAiProposalLoading(true);
                      try {
                        const res = await api.post('/ai/generate-proposal', {
                          jobTitle: job.title,
                          jobDescription: job.description
                        });
                        setProposalForm({ ...proposalForm, coverLetter: res.data.coverLetter });
                        toast.success('AI cover letter generated!');
                      } catch (error) {
                        toast.error(error.response?.data?.error || 'Failed to generate cover letter');
                      } finally {
                        setAiProposalLoading(false);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-xs font-bold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {aiProposalLoading ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />}
                    {aiProposalLoading ? 'Writing...' : '✨ AI Write'}
                  </button>
                </div>
                <textarea
                  placeholder="Add a personal message to the client (optional)"
                  value={proposalForm.coverLetter}
                  onChange={(e) => setProposalForm({ ...proposalForm, coverLetter: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-800 dark:text-white h-32 resize-none"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowProposalForm(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProposal}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingProposal ? 'Submitting...' : 'Submit Proposal'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default JobDetail;
