import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { Plus, Package, MessageSquare, Briefcase, ChevronRight, User } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orderRes = await api.get('/orders');
        setOrders(orderRes.data);

        if (user.role === 'freelancer') {
          // fetch freelancer's own services (or filter via API)
          const serviceRes = await api.get('/services'); // For demo, getting all and filtering in client. Real app should have /services/me
          setServices(serviceRes.data.filter(s => s.freelancer._id === user.id || s.freelancer === user.id));
        }
      } catch (error) {
        console.error(error);
      }
    };
    if (user) fetchData();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mt-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome, {user?.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 capitalize">{user?.role} Dashboard</p>
        </div>
        {user?.role === 'freelancer' && (
          <Link to="/create-service" className="flex items-center gap-2 bg-primary hover:bg-green-600 text-white px-5 py-2.5 rounded-lg shadow font-medium transition-all">
            <Plus size={20} /> Create New Gig
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl"><Package size={28} /></div>
          <div>
            <p className="text-2xl font-bold dark:text-white">{orders.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
          </div>
        </motion.div>
        
        {user?.role === 'freelancer' && (
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.1}} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
            <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl"><Briefcase size={28} /></div>
            <div>
              <p className="text-2xl font-bold dark:text-white">{services.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Gigs</p>
            </div>
          </motion.div>
        )}

        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.2}} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className="p-4 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl"><MessageSquare size={28} /></div>
          <div>
            <p className="text-2xl font-bold dark:text-white">Active</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Messages</p>
          </div>
        </motion.div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Recent Orders</h2>
        {orders.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Service</th>
                  <th className="py-3 px-4 font-medium text-gray-600 dark:text-gray-300">
                    {user?.role === 'freelancer' ? 'Client' : 'Freelancer'}
                  </th>
                  <th className="py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Status</th>
                  <th className="py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Price</th>
                  <th className="py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Date</th>
                  <th className="py-3 px-4 font-medium text-gray-600 dark:text-gray-300 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const otherParty = user?.role === 'freelancer' ? o.client : o.freelancer;
                  return (
                    <tr key={o._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                      <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">{o.service?.title || 'Service Deleted'}</td>
                      <td className="py-3 px-4">
                        {otherParty ? (
                          <Link to={`/profile/${otherParty._id}`} className="flex items-center gap-2 group">
                            {otherParty.profilePicture ? (
                              <img src={otherParty.profilePicture} alt={otherParty.name} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                                {otherParty.name?.charAt(0) || <User size={14} />}
                              </div>
                            )}
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary transition">{otherParty.name}</span>
                          </Link>
                        ) : (
                          <span className="text-sm text-gray-500">Unknown User</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${o.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-bold">${o.price}</td>
                      <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-sm">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right">
                        {otherParty && (
                          <Link to={`/profile/${otherParty._id}`} className="inline-flex items-center gap-1 text-sm text-primary hover:text-green-600 font-medium transition">
                            View <ChevronRight size={16} />
                          </Link>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
