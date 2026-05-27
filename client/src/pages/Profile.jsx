import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Phone, GraduationCap, MapPin, Star, Briefcase, ChevronRight, MessageSquare, Edit2, X, Save, Camera, CheckCircle, Award, Plus, ExternalLink, Layers } from 'lucide-react';
import { toast } from 'react-toastify';
import ProfileThemeCustomizer from '../components/ProfileThemeCustomizer';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, login } = useContext(AuthContext); // get login to update overall user state if desired, but we might just update locally.
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  // Trust & Verification States
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationUrl, setVerificationUrl] = useState('');
  const [activeTab, setActiveTab] = useState('about'); // 'about' or 'portfolio'
  const [portfolioForm, setPortfolioForm] = useState({ title: '', link: '', description: '', mediaUrl: '' });
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: '', phone: '', country: '', education: '', skills: '', languages: '', profilePicture: ''
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [profileRes, servicesRes] = await Promise.all([
          api.get(`/auth/public/${id}`),
          api.get(`/services?freelancer=${id}`)
        ]);
        setProfile(profileRes.data);
        setEditForm({
          bio: profileRes.data.bio || '',
          phone: profileRes.data.phone || '',
          country: profileRes.data.country || '',
          education: profileRes.data.education?.join(', ') || '',
          skills: profileRes.data.skills?.join(', ') || '',
          languages: profileRes.data.languages?.join(', ') || '',
          profilePicture: profileRes.data.profilePicture || ''
        });
        setServices(servicesRes.data);
      } catch (error) {
        toast.error('Profile not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [id, navigate]);

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    if (!verificationUrl.trim()) return toast.error('Please enter a valid document or portfolio URL');
    try {
      const res = await api.post('/auth/verification/request', { documentUrl: verificationUrl });
      setProfile(res.data.user || res.data);
      setShowVerificationModal(false);
      setVerificationUrl('');
      toast.success('Verification request submitted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit verification request');
    }
  };

  const handlePortfolioSubmit = async (e) => {
    e.preventDefault();
    if (!portfolioForm.title.trim() || !portfolioForm.link.trim()) {
      return toast.error('Please fill in the project title and link');
    }
    try {
      const updatedItems = [...(profile.portfolioItems || []), portfolioForm];
      const res = await api.put('/auth/profile', { portfolioItems: updatedItems });
      setProfile(res.data);
      setShowPortfolioModal(false);
      setPortfolioForm({ title: '', link: '', description: '', mediaUrl: '' });
      toast.success('Portfolio item added successfully!');
    } catch (error) {
      toast.error('Failed to add portfolio item');
    }
  };

  const handleMessageClick = async () => {
    if (!user) {
      toast.info('Please log in to send a message');
      navigate('/login');
      return;
    }
    const userId = user?.id || user?._id;
    if (userId === profile._id) {
      toast.error('You cannot message yourself');
      return;
    }
    try {
      const res = await api.post('/chat/conversations', { receiverId: profile._id });
      navigate('/chat', { state: { activeConversationId: res.data._id } });
    } catch (error) {
      toast.error('Failed to initiate chat');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm({ ...editForm, profilePicture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        bio: editForm.bio,
        phone: editForm.phone,
        country: editForm.country,
        profilePicture: editForm.profilePicture,
        education: editForm.education.split(',').map(s => s.trim()).filter(s => s),
        skills: editForm.skills.split(',').map(s => s.trim()).filter(s => s),
        languages: editForm.languages.split(',').map(s => s.trim()).filter(s => s)
      };
      const res = await api.put('/auth/profile', payload);
      setProfile(res.data);
      if (login && user) {
          // Soft-update the AuthContext if it expects token in login function
          // Actually, since Navbar relies on `user` state, reloading or just letting localStorage update is complex if login() demands token.
          // The best approach is a manual window reload to sync navbar, OR just relying on the database refresh.
      }
      setIsEditing(false);
      toast.success('Profile updated successfully!');
      
      // We trigger a slight reload to sync the Navigation Avatar seamlessly.
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!profile) return null;

  const isFreelancer = true; // All users can be freelancers now
  const isOwnProfile = user && ((user.id || user._id) === profile._id);

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section with Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-8 sm:p-12 mb-12 overflow-hidden relative"
          style={{
            background: profile.headerBackground 
              ? profile.headerBackground
              : undefined
          }}
        >
          {!profile.headerBackground && (
            <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"></div>
          )}
          {profile.headerBackground && (
            <div className="absolute inset-0 bg-black/10"></div>
          )}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
              {/* Profile Picture */}
              <div className="relative flex-shrink-0">
                <div className="w-40 h-40 rounded-2xl shadow-xl overflow-hidden border-4 border-white dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  {profile.profilePicture ? (
                    <img src={profile.profilePicture} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-6xl font-black text-gray-400">{profile.name.charAt(0)}</div>
                  )}
                </div>
                {isFreelancer && (
                  <div className="absolute -bottom-2 -right-2 bg-green-500 w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-900" title="Verified">
                    <Star size={24} className="text-white fill-white" />
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col gap-3 mb-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
                    {profile.verificationStatus === 'verified' ? (
                      <span className="px-4 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 border border-green-200 dark:border-green-800/40">
                        <CheckCircle size={12} /> Verified Talent
                      </span>
                    ) : profile.verificationStatus === 'pending' ? (
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider">
                        Verification Pending
                      </span>
                    ) : null}
                    {profile.isTopRated && (
                      <span className="px-4 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 border border-amber-200 dark:border-amber-800/40">
                        <Award size={12} /> Top Rated
                      </span>
                    )}
                  </div>
                  {profile.country && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-lg">
                      <MapPin size={20} className="text-blue-600" />
                      <span className="font-semibold">{profile.country}</span>
                    </div>
                  )}
                </div>

                {/* Stats for Freelancers */}
                {isFreelancer && (
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{(profile.rating || 0).toFixed(1)}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-semibold flex items-center gap-1">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" /> Rating
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{profile.completedJobs || 0}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-semibold flex items-center gap-1">
                        <Briefcase size={14} /> Jobs Done
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{services.length}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Active Gigs</div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  {isOwnProfile ? (
                    <>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg"
                      >
                        <Edit2 size={18} /> Edit Profile
                      </motion.button>
                      <ProfileThemeCustomizer 
                        currentColor={profile.themeColor || '#3B82F6'}
                        currentHeader={profile.headerBackground || ''}
                        onUpdate={(theme) => setProfile({ ...profile, ...theme })}
                      />
                      {(!profile.verificationStatus || profile.verificationStatus === 'unverified' || profile.verificationStatus === 'rejected') && (
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowVerificationModal(true)}
                          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg"
                        >
                          <CheckCircle size={18} /> Get Verified
                        </motion.button>
                      )}
                    </>
                  ) : (
                    <>
                      <motion.a 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${profile.email}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold px-6 py-3 rounded-lg transition-all"
                      >
                        <Mail size={18} /> Email
                      </motion.a>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleMessageClick}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg"
                      >
                        <MessageSquare size={18} /> Message
                      </motion.button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {isOwnProfile && profile.verificationStatus !== 'verified' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-8 p-6 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm ${
              profile.verificationStatus === 'pending' 
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200'
                : profile.verificationStatus === 'rejected'
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200'
                : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
            }`}
          >
            <div>
              <h4 className="font-bold text-lg flex items-center gap-2">
                {profile.verificationStatus === 'pending' && '⏳ Verification Application Under Review'}
                {profile.verificationStatus === 'rejected' && '❌ Verification Application Rejected'}
                {(!profile.verificationStatus || profile.verificationStatus === 'unverified') && '🛡️ Unlock Premium Rates & Credibility'}
              </h4>
              <p className="text-sm mt-1 opacity-90">
                {profile.verificationStatus === 'pending' && 'Our moderation team is currently reviewing your identity documents and submitted portfolio items. You will be notified soon.'}
                {profile.verificationStatus === 'rejected' && 'Unfortunately, your previous application did not meet our verification criteria. Please ensure your provided document links are publicly accessible and valid.'}
                {(!profile.verificationStatus || profile.verificationStatus === 'unverified') && 'Verified profiles command up to 3x higher conversion rates. Submit a government ID or valid portfolio credentials to earn your badge.'}
              </p>
            </div>
            {profile.verificationStatus !== 'pending' && (
              <button
                onClick={() => setShowVerificationModal(true)}
                className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-sm hover:opacity-90 transition flex-shrink-0 shadow"
              >
                Submit Evidence
              </button>
            )}
          </motion.div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Left Sidebar */}
          <div className="space-y-6">
            
            {/* Information Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-800"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Phone size={20} className="text-blue-600" />
                Contact Information
              </h3>
              <div className="space-y-4">
                {profile.phone && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <Phone size={18} className="text-blue-600 flex-shrink-0" />
                    <span className="font-semibold text-gray-900 dark:text-white">{profile.phone}</span>
                  </div>
                )}
                {profile.email && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <Mail size={18} className="text-blue-600 flex-shrink-0" />
                    <span className="font-semibold text-gray-900 dark:text-white text-sm truncate">{profile.email}</span>
                  </div>
                )}
                {!profile.phone && !profile.email && (
                  <p className="text-gray-500 text-sm italic">No contact info provided</p>
                )}
              </div>
            </motion.div>

            {/* Education Card */}
            {profile.education?.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-800"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <GraduationCap size={20} className="text-purple-600" />
                  Education
                </h3>
                <div className="space-y-3">
                  {profile.education.map((edu, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-900/30">
                      <GraduationCap size={18} className="text-purple-600 flex-shrink-0 mt-1" />
                      <span className="font-semibold text-gray-900 dark:text-white">{edu}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Skills Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-800"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Briefcase size={20} className="text-blue-600" />
                Skills
              </h3>
              {profile.skills?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, i) => (
                    <span 
                      key={i} 
                      className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg text-sm font-bold border border-blue-200 dark:border-blue-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">No skills listed yet</p>
              )}
            </motion.div>

            {/* Languages Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-800"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Languages</h3>
              {profile.languages?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((lang, i) => (
                    <span 
                      key={i} 
                      className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-lg text-sm font-bold border border-green-200 dark:border-green-800"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">Not specified</p>
              )}
            </motion.div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tabs Selector */}
            <div className="flex border-b border-gray-200 dark:border-gray-800 gap-8 px-2">
              <button
                onClick={() => setActiveTab('about')}
                className={`pb-4 font-bold text-lg transition border-b-2 ${
                  activeTab === 'about'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Overview & Gigs
              </button>
              <button
                onClick={() => setActiveTab('portfolio')}
                className={`pb-4 font-bold text-lg transition border-b-2 flex items-center gap-2 ${
                  activeTab === 'portfolio'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Layers size={18} />
                Portfolio Showcase
                <span className="ml-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-xs rounded-full text-gray-600 dark:text-gray-400">
                  {profile.portfolioItems?.length || 0}
                </span>
              </button>
            </div>

            {activeTab === 'about' ? (
              <>
                {/* About Section */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-md border border-gray-200 dark:border-gray-800"
                >
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">About</h3>
                  {profile.bio ? (
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">{profile.bio}</p>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <Mail size={32} className="text-gray-400" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">This user hasn't written a bio yet</p>
                    </div>
                  )}
                </motion.div>

                {/* Active Gigs Section */}
                {isFreelancer && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-md border border-gray-200 dark:border-gray-800"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Active Gigs</h3>
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full font-bold text-sm">
                        {services.length} {services.length === 1 ? 'Gig' : 'Gigs'}
                      </span>
                    </div>
                    
                    {services.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {services.map(gig => (
                          <motion.div
                            key={gig._id}
                            whileHover={{ y: -5 }}
                            className="group"
                          >
                            <Link to={`/service/${gig._id}`} className="block h-full">
                              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-sm hover:shadow-lg h-full flex flex-col">
                                
                                {/* Gig Image */}
                                <div className="aspect-video w-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center relative overflow-hidden">
                                  {gig.image ? (
                                    <img src={gig.image} alt={gig.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                                  ) : (
                                    <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                                      <Briefcase size={32} className="mb-2 opacity-50" />
                                      <span className="text-xs font-bold uppercase tracking-widest">{gig.category}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Gig Info */}
                                <div className="p-5 flex-1 flex flex-col justify-between">
                                  <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                                      {gig.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">{gig.description}</p>
                                  </div>

                                  {/* Footer */}
                                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <div>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Starting at</p>
                                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">${gig.price}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-600 transition">
                                      <ChevronRight size={20} />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                          <Briefcase size={40} className="text-gray-400" />
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 font-medium text-center">No active gigs yet</p>
                        <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Start creating gigs to showcase your services</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </>
            ) : (
              /* Portfolio Showcase Section */
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-md border border-gray-200 dark:border-gray-800"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Rich Media Portfolio</h3>
                    <p className="text-sm text-gray-500 mt-1">Showcasing completed orders, Figma prototypes, code repos, and media</p>
                  </div>
                  {isOwnProfile && (
                    <button
                      onClick={() => setShowPortfolioModal(true)}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition shadow"
                    >
                      <Plus size={16} /> Add Project
                    </button>
                  )}
                </div>

                {profile.portfolioItems?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {profile.portfolioItems.map((item, index) => (
                      <motion.div 
                        key={index}
                        whileHover={{ y: -4 }}
                        className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800/50 flex flex-col justify-between group"
                      >
                        <div>
                          {item.mediaUrl ? (
                            <div className="aspect-video w-full bg-gray-200 dark:bg-gray-800 overflow-hidden relative">
                              {item.mediaUrl.includes('youtube.com') || item.mediaUrl.includes('youtu.be') ? (
                                <iframe 
                                  src={item.mediaUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')} 
                                  className="w-full h-full"
                                  allowFullScreen 
                                  title={item.title}
                                />
                              ) : (
                                <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                              )}
                            </div>
                          ) : (
                            <div className="aspect-video w-full bg-gradient-to-tr from-blue-600/10 to-purple-600/10 flex items-center justify-center border-b border-gray-200 dark:border-gray-800">
                              <Layers size={36} className="text-blue-500 opacity-60" />
                            </div>
                          )}
                          <div className="p-5">
                            <h4 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2 line-clamp-1">
                              {item.title}
                            </h4>
                            {item.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-3">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="p-5 pt-0">
                          <a 
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <ExternalLink size={14} /> View Live Project / Link
                          </a>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
                      <Layers size={32} />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">No portfolio items uploaded yet</p>
                    {isOwnProfile && (
                      <button
                        onClick={() => setShowPortfolioModal(true)}
                        className="mt-3 text-sm font-bold text-blue-600 hover:underline"
                      >
                        Upload your first project showcase
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700"
          >
            <div className="sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center z-10">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">Edit Profile</h2>
              <button 
                onClick={() => setIsEditing(false)}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-red-100 hover:text-red-500 transition text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-8 space-y-6">
              
              {/* Profile Image Editor */}
              <div className="flex flex-col items-center justify-center space-y-4 mb-6">
                <div className="relative w-32 h-32 rounded-full border-4 border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden bg-gray-50 dark:bg-gray-800 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {editForm.profilePicture ? (
                    <img src={editForm.profilePicture} alt="Upload" className="w-full h-full object-cover group-hover:brightness-75 transition" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition">
                      <Camera size={24} />
                      <span className="text-xs font-bold mt-1">Upload</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <Camera className="text-white" size={28} />
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                <p className="text-sm text-gray-500 font-medium">Click to change profile picture (Max 5MB)</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">About Me (Bio)</label>
                <textarea 
                  value={editForm.bio}
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-gray-900 dark:text-white"
                  rows={4}
                  placeholder="Tell clients about your expertise..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Phone Code / Number</label>
                  <input 
                    type="text" 
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-gray-900 dark:text-white"
                    placeholder="e.g. +1 555-0192"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Country / Location</label>
                  <input 
                    type="text" 
                    value={editForm.country}
                    onChange={(e) => setEditForm({...editForm, country: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-gray-900 dark:text-white"
                    placeholder="e.g. United States"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                  <p className="text-sm text-blue-800 dark:text-blue-300 flex items-center gap-2 font-medium">
                    <span className="font-black">PRO TIP:</span> Separate arrays multiple entries using commas! (e.g. "React, UI Design, Marketing")
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Education Details</label>
                  <input 
                    type="text" 
                    value={editForm.education}
                    onChange={(e) => setEditForm({...editForm, education: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-gray-900 dark:text-white"
                    placeholder="e.g. BS Computer Science, MS Design"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Professional Skills</label>
                  <input 
                    type="text" 
                    value={editForm.skills}
                    onChange={(e) => setEditForm({...editForm, skills: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-gray-900 dark:text-white"
                    placeholder="e.g. JavaScript, Logo Design, Video Editing"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Languages Spoken</label>
                  <input 
                    type="text" 
                    value={editForm.languages}
                    onChange={(e) => setEditForm({...editForm, languages: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-gray-900 dark:text-white"
                    placeholder="e.g. English, Spanish, German"
                  />
                </div>
              </div>

              <div className="pt-6 sticky bottom-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm -mx-8 -mb-8 p-8 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-4 rounded-b-3xl">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex items-center gap-2 bg-primary hover:bg-green-600 text-white font-bold px-8 py-3 rounded-xl transition shadow-lg shadow-primary/30"
                >
                  <Save size={18} /> Save Settings
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Request Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-700 relative"
          >
            <button 
              onClick={() => setShowVerificationModal(false)}
              className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-red-100 hover:text-red-500 transition text-gray-500"
            >
              <X size={18} />
            </button>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={24} />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Request Verification</h3>
              <p className="text-xs text-gray-500 mt-1">Submit your verification document or portfolio evidence URL to earn the Verified Talent badge.</p>
            </div>
            <form onSubmit={handleVerificationSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Document / Proof URL</label>
                <input 
                  type="url" 
                  required
                  value={verificationUrl}
                  onChange={(e) => setVerificationUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/... or figma.com/..."
                  className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm text-gray-900 dark:text-white"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">Provide a public link to your photo ID, certificate, or professional profile.</span>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowVerificationModal(false)}
                  className="px-4 py-2 font-bold text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shadow"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Portfolio Item Modal */}
      {showPortfolioModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg p-6 border border-gray-100 dark:border-gray-700 relative max-h-[90vh] overflow-y-auto"
          >
            <button 
              onClick={() => setShowPortfolioModal(false)}
              className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-red-100 hover:text-red-500 transition text-gray-500"
            >
              <X size={18} />
            </button>
            <div className="mb-6">
              <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Layers size={20} className="text-blue-600" /> Add Portfolio Project
              </h3>
              <p className="text-xs text-gray-500 mt-1">Showcase your best completed work, videos, or code prototypes.</p>
            </div>
            <form onSubmit={handlePortfolioSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Project Title *</label>
                <input 
                  type="text" 
                  required
                  value={portfolioForm.title}
                  onChange={(e) => setPortfolioForm({...portfolioForm, title: e.target.value})}
                  placeholder="e.g. E-Commerce Mobile App UI"
                  className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Project/Live URL *</label>
                <input 
                  type="url" 
                  required
                  value={portfolioForm.link}
                  onChange={(e) => setPortfolioForm({...portfolioForm, link: e.target.value})}
                  placeholder="https://github.com/... or https://mydesign.com"
                  className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Media URL (YouTube link or Image URL)</label>
                <input 
                  type="url" 
                  value={portfolioForm.mediaUrl}
                  onChange={(e) => setPortfolioForm({...portfolioForm, mediaUrl: e.target.value})}
                  placeholder="https://youtube.com/watch?v=... or image link"
                  className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm text-gray-900 dark:text-white"
                />
                <span className="text-[11px] text-gray-400 mt-0.5 block">Embeds YouTube videos automatically or displays images natively.</span>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Description</label>
                <textarea 
                  value={portfolioForm.description}
                  onChange={(e) => setPortfolioForm({...portfolioForm, description: e.target.value})}
                  placeholder="Briefly describe your role, challenges, or technologies used..."
                  rows={3}
                  className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <button 
                  type="button" 
                  onClick={() => setShowPortfolioModal(false)}
                  className="px-4 py-2 font-bold text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition shadow"
                >
                  Save Project
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Profile;
