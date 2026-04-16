import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Menu, X, Moon, Sun, Search as SearchIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

            <Link to="/services" className="text-gray-700 dark:text-gray-300 hover:text-primary font-medium transition">Services</Link>
            <Link to="/jobs" className="text-gray-700 dark:text-gray-300 hover:text-primary font-medium transition">Jobs</Link>
            
            {user ? (
              <>
                <Link to="/chat" className="text-gray-700 dark:text-gray-300 hover:text-primary font-medium transition">Messages</Link>
                
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
                          {user.role === 'client' && (
                            <Link 
                              to="/create-job" 
                              onClick={() => setIsDropdownOpen(false)}
                              className="block px-4 py-2.5 text-sm text-primary font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                            >
                              Post a Job
                            </Link>
                          )}
                          {user.role === 'freelancer' && (
                            <Link 
                              to="/create-service" 
                              onClick={() => setIsDropdownOpen(false)}
                              className="block px-4 py-2.5 text-sm text-primary font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                            >
                              Post a Gig
                            </Link>
                          )}
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
              </>
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
              <Link to="/services" onClick={() => setIsOpen(false)} className="block text-gray-700 dark:text-gray-300 font-medium">Services</Link>
              <Link to="/jobs" onClick={() => setIsOpen(false)} className="block text-gray-700 dark:text-gray-300 font-medium">Jobs</Link>
              {user ? (
                <>
                  <Link to="/chat" onClick={() => setIsOpen(false)} className="block text-gray-700 dark:text-gray-300 font-medium">Messages</Link>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block text-gray-700 dark:text-gray-300 font-medium">Dashboard</Link>
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
