import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { DollarSign, Clock, Calendar, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

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
      <div className="max-w-4xl mx-auto px-4 py-12 mt-8 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 w-3/4 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 w-1/4 rounded mb-8"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 w-full rounded mb-4"></div>
      </div>
    );
  }

  if (!job) {
    return <div className="text-center py-20 text-gray-500">Job not found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 mt-8">
      <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 mb-8 p-8 md:p-10">
        <div className="flex flex-col md:flex-row gap-8 justify-between items-start">
          <div className="flex-1">
            <span className="bg-primary/10 text-primary text-sm font-bold px-4 py-1.5 rounded-full mb-4 inline-block">
              {job.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              {job.title}
            </h1>
            
            <div className="flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-300 mb-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
               <div className="flex justify-center items-center gap-2">
                 <span className="font-bold text-primary text-xl leading-none">{job.currency === 'INR' ? '₹' : '$'}</span>
                 <span className="font-bold text-gray-900 dark:text-white text-lg">{job.budget} <span className="font-normal text-sm text-gray-500">Fixed-price</span></span>
               </div>
               <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
               <div className="flex justify-center items-center gap-2">
                 <Clock size={20} className="text-blue-500" />
                 <span className="font-bold text-gray-900 dark:text-white">{job.deliveryTime} <span className="font-normal text-sm text-gray-500">Delivery</span></span>
               </div>
               <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 hidden md:block"></div>
               <div className="flex justify-center items-center gap-2">
                 <Calendar size={20} className="text-purple-500" />
                 <span className="font-bold text-gray-900 dark:text-white text-sm">Posted <br /> <span className="font-normal text-xs text-gray-500">{new Date(job.createdAt).toLocaleDateString()}</span></span>
               </div>
            </div>

            <div className="prose dark:prose-invert max-w-none mb-8">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Job Description</h3>
              <p className="whitespace-pre-line text-gray-700 dark:text-gray-300 leading-relaxed">
                {job.description}
              </p>
            </div>

            {job.skills && job.skills.length > 0 && (
              <div className="mb-8">
                 <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Required Skills</h3>
                 <div className="flex flex-wrap gap-2">
                   {job.skills.map((skill, idx) => (
                     <span key={idx} className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 px-4 py-2 rounded-xl text-sm font-medium">
                       {skill}
                     </span>
                   ))}
                 </div>
              </div>
            )}
            
          </div>

          <div className="w-full md:w-80 flex-shrink-0">
             <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
                  About the Client
                </h3>
                
                <div className="flex items-center gap-4 mb-6">
                  {job.client?.profilePicture ? (
                    <img src={job.client.profilePicture} alt={job.client.name} className="w-16 h-16 rounded-full object-cover border-2 border-primary/20" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center font-bold text-white text-2xl">
                      {job.client?.name?.charAt(0) || 'C'}
                    </div>
                  )}
                  <div>
                    <Link to={`/profile/${job.client._id}`} className="font-bold text-gray-900 dark:text-white text-lg hover:text-primary transition-colors">
                      {job.client.name}
                    </Link>
                    <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <CheckCircle size={14} className="text-green-500" /> verified
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6 flex flex-col text-sm">
                   {job.client.country && (
                     <div className="flex justify-between">
                       <span className="text-gray-500">Location</span>
                       <span className="font-medium text-gray-900 dark:text-white">{job.client.country}</span>
                     </div>
                   )}
                   <div className="flex justify-between">
                     <span className="text-gray-500">Completed Jobs</span>
                     <span className="font-medium text-gray-900 dark:text-white">{job.client.completedJobs || 0}</span>
                   </div>
                </div>

                <button 
                  onClick={handleMessageClient}
                  className="w-full bg-primary hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-sm flex justify-center items-center gap-2"
                >
                  Message Info / Apply
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
