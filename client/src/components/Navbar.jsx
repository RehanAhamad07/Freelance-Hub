import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { Menu, X, Moon, Sun, Search as SearchIcon, Bell, CheckCircle2, MessageSquare, Heart } from 'lucide-react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (user) {
      api.get('/notifications').then(res => {
        setNotifications(res.data);
        setUnreadCount(res.data.filter(n => !n.isRead).length);
      }).catch(err => console.log('Notif fetch err', err));
    }
  }, [user]);

  useEffect(() => {
    if (socket) {
      const handleNewNotif = (notif) => {
        setNotifications(prev => [notif, ...prev]);
        setUnreadCount(prev => prev + 1);
        // Toast is handled globally or here, let's keep it simple
      };
      socket.on('newNotification', handleNewNotif);
      return () => socket.off('newNotification', handleNewNotif);
    }
  }, [socket]);

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await api.put('/notifications/all/read');
      setNotifications(prev => prev.map(n => ({...n, isRead: true})));
      setUnreadCount(0);
    } catch (error) {
      console.log('Error marking all read', error);
    }
  };
  
  const handleNotifClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await api.put(`/notifications/${notif._id}/read`);
        setNotifications(prev => prev.map(n => n._id === notif._id ? {...n, isRead: true} : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) { console.log(err); }
    }
    setIsNotifOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if(searchQuery.trim()) {
      navigate(`/services?search=${searchQuery}`);
      setIsOpen(false);
    }
  };

  return (
    <nav className="fixed w-full z-50 bg-white/80 dark:bg-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-black text-primary tracking-tighter">
              freelance<span className="text-gray-900 dark:text-white">hub.</span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <button onClick={toggleDarkMode} className="text-gray-600 dark:text-gray-300 hover:text-primary transition mt-1">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <form onSubmit={handleSearch} className="relative flex items-center">
              <input 
                type="text" 
                placeholder="Find services" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-full pl-4 pr-10 py-1.5 outline-none text-sm border border-transparent focus:border-primary transition-all w-48 focus:w-64"
              />
              <button type="submit" className="absolute right-3 text-gray-500 hover:text-primary">
                <SearchIcon size={16} />
              </button>
            </form>

            <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-primary font-medium transition">Home</Link>
            <Link to="/services" className="text-gray-700 dark:text-gray-300 hover:text-primary font-medium transition">Services</Link>
            <Link to="/jobs" className="text-gray-700 dark:text-gray-300 hover:text-primary font-medium transition">Jobs</Link>
            
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2 mr-2">
                <Link to="/chat" className="relative p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 rounded-full transition duration-300 group" title="Messages">
                  <MessageSquare size={22} strokeWidth={1.75} className="group-hover:scale-110 transition-transform" />
                </Link>
                <Link to="/saved" className="relative p-2.5 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 dark:hover:text-red-400 rounded-full transition duration-300 group" title="Saved Items">
                  <Heart size={22} strokeWidth={1.75} className="group-hover:scale-110 transition-transform" />
                </Link>

                {/* Wallet Balance */}
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 ml-2 mr-2">
                  <span className="text-sm font-bold text-primary">${user.walletBalance !== undefined ? user.walletBalance : '...'}</span>
                </div>
                
                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                  <button 
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className={`relative p-2.5 text-gray-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 dark:hover:text-orange-400 rounded-full transition duration-300 group ${isNotifOpen ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                  >
                    <Bell size={22} strokeWidth={1.75} className="group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex items-center justify-center min-w-[20px] h-[20px] px-1.5 text-[11px] font-black text-white bg-red-500 border-2 border-white dark:border-gray-900 rounded-full transform translate-x-1/4 -translate-y-1/4 shadow-sm">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {isNotifOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden"
                      >
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                          <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                          {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">
                              Mark all as read
                            </button>
                          )}
                        </div>
                        <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800/50">
                          {notifications.length === 0 ? (
                            <div className="p-6 text-center text-sm text-gray-500">No notifications yet.</div>
                          ) : notifications.map(notif => (
                            <div 
                              key={notif._id} 
                              onClick={() => handleNotifClick(notif)}
                              className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/80 transition flex gap-3 items-start ${!notif.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                            >
                              <div className={`mt-0.5 p-2 rounded-full shrink-0 ${!notif.isRead ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                                {notif.type === 'transaction_credit' || notif.type === 'proposal_accepted' ? <CheckCircle2 size={16} /> : <Bell size={16} />}
                              </div>
                              <div className="flex-1">
                                <p className={`text-sm ${!notif.isRead ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-600 dark:text-gray-300'}`}>
                                  {notif.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(notif.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                                </p>
                              </div>
                              {!notif.isRead && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-3 ml-2 border-l border-gray-200 dark:border-gray-700 pl-4 hover:opacity-80 transition cursor-pointer outline-none focus:outline-none bg-transparent"
                  >
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-white text-xs">
                        {user.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <span className="text-sm font-semibold text-gray-900 dark:text-white hidden lg:block">{user.name}</span>
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden"
                      >
                        <div className="py-2">
                          <Link 
                            to={`/profile/${user.id || user._id}`} 
                            onClick={() => setIsDropdownOpen(false)}
                            className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                          >
                            Profile
                          </Link>
                          <Link 
                            to="/dashboard" 
                            onClick={() => setIsDropdownOpen(false)}
                            className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                          >
                            Dashboard
                          </Link>
                          <Link 
                            to="/transactions" 
                            onClick={() => setIsDropdownOpen(false)}
                            className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                          >
                            Transactions
                          </Link>
                          {((user.roles || []).includes('admin') || user.isAdmin) && (
                            <Link 
                              to="/admin" 
                              onClick={() => setIsDropdownOpen(false)}
                              className="block px-4 py-2.5 text-sm text-purple-600 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                            >
                              Admin Portal
                            </Link>
                          )}
                          <Link 
                            to="/create-job" 
                            onClick={() => setIsDropdownOpen(false)}
                            className="block px-4 py-2.5 text-sm text-primary font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                          >
                            Post a Job
                          </Link>
                          <Link 
                            to="/create-service" 
                            onClick={() => setIsDropdownOpen(false)}
                            className="block px-4 py-2.5 text-sm text-primary font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                          >
                            Post a Gig
                          </Link>
                          <div className="h-px bg-gray-100 dark:bg-gray-800 my-1"></div>
                          <button 
                            onClick={() => {
                              logout();
                              setIsDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition font-medium"
                          >
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 dark:text-gray-300 hover:text-primary font-medium transition">Sign in</Link>
                <Link to="/register" className="bg-primary hover:bg-green-600 text-white px-5 py-2 rounded-full font-medium transition-all transform hover:scale-105 active:scale-95">
                  Join
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            <button onClick={toggleDarkMode} className="text-gray-600 dark:text-gray-300">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 dark:text-gray-300">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-dark border-t border-gray-100 dark:border-gray-800"
          >
            <div className="px-4 py-6 space-y-4">
              <Link to="/" onClick={() => setIsOpen(false)} className="block text-gray-700 dark:text-gray-300 font-medium">Home</Link>
              <Link to="/services" onClick={() => setIsOpen(false)} className="block text-gray-700 dark:text-gray-300 font-medium">Services</Link>
              <Link to="/jobs" onClick={() => setIsOpen(false)} className="block text-gray-700 dark:text-gray-300 font-medium">Jobs</Link>
              {user ? (
                <>
                  <Link to="/chat" onClick={() => setIsOpen(false)} className="block text-gray-700 dark:text-gray-300 font-medium">Messages</Link>
                  <Link to="/saved" onClick={() => setIsOpen(false)} className="block text-gray-700 dark:text-gray-300 font-medium">Saved Items</Link>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block text-gray-700 dark:text-gray-300 font-medium">Dashboard</Link>
                  <Link to="/transactions" onClick={() => setIsOpen(false)} className="block text-gray-700 dark:text-gray-300 font-medium">Transactions</Link>
                  {((user.roles || []).includes('admin') || user.isAdmin) && (
                    <Link to="/admin" onClick={() => setIsOpen(false)} className="block text-purple-600 font-semibold">Admin Portal</Link>
                  )}
                  <button onClick={() => { logout(); setIsOpen(false); }} className="block text-red-500 font-medium w-full text-left">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="block text-gray-700 dark:text-gray-300 font-medium">Sign in</Link>
                  <Link to="/register" onClick={() => setIsOpen(false)} className="block text-primary font-medium">Join</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
