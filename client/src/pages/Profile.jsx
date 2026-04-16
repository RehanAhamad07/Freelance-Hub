import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Phone, GraduationCap, MapPin, Star, Briefcase, ChevronRight, MessageSquare, Edit2, X, Save, Camera } from 'lucide-react';
import { toast } from 'react-toastify';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, login } = useContext(AuthContext); // get login to update overall user state if desired, but we might just update locally.
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

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

  const isFreelancer = profile.role === 'freelancer';
  const isOwnProfile = user && ((user.id || user._id) === profile._id);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 mt-8">
      {/* Hero Section */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden mb-8"
      >
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/20 to-primary/5 dark:from-primary/10 dark:to-transparent"></div>
        <div className="relative flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-xl overflow-hidden bg-gray-100 dark:bg-gray-700 mx-auto md:mx-0 flex-shrink-0 z-10">
            {profile.profilePicture ? (
              <img src={profile.profilePicture} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-black text-gray-500">
                {profile.name.charAt(0)}
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left z-10">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-3">
              {profile.name} 
              {isFreelancer && <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-widest font-bold">Freelancer</span>}
            </h1>
            {profile.country && (
              <div className="flex items-center justify-center md:justify-start gap-1 text-gray-500 mt-2">
                <MapPin size={16} /> <span>{profile.country}</span>
              </div>
            )}
            
            {isFreelancer && (
              <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                <div className="flex items-center gap-1 text-yellow-500 font-bold bg-yellow-50 dark:bg-yellow-900/10 px-3 py-1 rounded-lg">
                  <Star size={16} className="fill-yellow-500" />
                  <span>{profile.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg font-bold">
                  <Briefcase size={16} />
                  <span>{profile.completedJobs} Jobs Done</span>
                </div>
              </div>
            )}
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3 z-10">
            {isOwnProfile ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold px-6 py-3 rounded-xl transition shadow-sm border border-gray-200 dark:border-gray-600"
              >
                <Edit2 size={18} /> Edit Profile
              </button>
            ) : (
              <>
                <a 
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${profile.email}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold px-6 py-3 rounded-xl transition"
                >
                  <Mail size={18} /> Email
                </a>
                <button 
                  onClick={handleMessageClick}
                  className="flex items-center justify-center gap-2 bg-primary hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-primary/30"
                >
                  <MessageSquare size={18} /> Message
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Details */}
        <div className="space-y-8">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <h3 className="font-black text-gray-900 dark:text-white mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
              Information
            </h3>
            <ul className="space-y-4">
              {profile.phone && (
                <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <Phone size={18} className="text-gray-400" />
                  <span className="font-medium">{profile.phone}</span>
                </li>
              )}
              {profile.education?.length > 0 && (
                <li className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                  <GraduationCap size={18} className="text-gray-400 mt-1" />
                  <div className="flex flex-col gap-1">
                    {profile.education.map((edu, i) => (
                      <span key={i} className="font-medium">{edu}</span>
                    ))}
                  </div>
                </li>
              )}
              {!profile.phone && !profile.education?.length && (
                <p className="text-gray-400 italic font-medium text-sm">No additional information provided.</p>
              )}
            </ul>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <h3 className="font-black text-gray-900 dark:text-white mb-6 uppercase tracking-wider text-sm">Skills</h3>
            {profile.skills?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, i) => (
                  <span key={i} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl text-sm font-bold">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic font-medium">No skills listed</p>
            )}
          </motion.div>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <h3 className="font-black text-gray-900 dark:text-white mb-6 uppercase tracking-wider text-sm">Languages</h3>
            {profile.languages?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.languages.map((lang, i) => (
                  <span key={i} className="bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-xl text-sm font-bold">
                    {lang}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic font-medium">Not specified</p>
            )}
          </motion.div>
        </div>

        {/* Right Column - Main Content */}
        <div className="md:col-span-2 space-y-8">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <h3 className="font-black text-gray-900 dark:text-white mb-6 uppercase tracking-wider text-sm">About {profile.name}</h3>
            {profile.bio ? (
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-medium whitespace-pre-wrap">{profile.bio}</p>
            ) : (
              <p className="text-gray-400 italic font-medium">This user hasn't written a bio yet.</p>
            )}
          </motion.div>

          {isFreelancer && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <h3 className="font-black text-gray-900 dark:text-white mb-6 uppercase tracking-wider text-sm flex items-center justify-between">
                <span>Active Gigs</span>
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 px-3 py-1 rounded-lg">{services.length}</span>
              </h3>
              
              {services.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {services.map(gig => (
                    <Link key={gig._id} to={`/service/${gig._id}`} className="group block h-full">
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 transition hover:border-primary h-full flex flex-col shadow-sm hover:shadow-md">
                        <div className="aspect-video w-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center relative overflow-hidden">
                          {gig.image ? (
                            <img src={gig.image} alt={gig.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                          ) : (
                            <span className="text-gray-400 font-black uppercase tracking-widest text-xs">{gig.category}</span>
                          )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <h4 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight group-hover:text-primary transition">{gig.title}</h4>
                          <div className="flex items-center justify-between mt-4">
                            <span className="font-black text-lg text-gray-900 dark:text-white">${gig.price}</span>
                            <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition shadow-sm">
                              <ChevronRight size={16} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="w-full h-40 bg-gray-50 dark:bg-gray-700/30 rounded-2xl flex items-center justify-center flex-col text-gray-400 font-medium">
                  <Briefcase className="mb-2 opacity-50" size={32}/>
                  <p>No active gigs visible right now.</p>
                </div>
              )}
            </motion.div>
          )}

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
    </div>
  );
};

export default Profile;
