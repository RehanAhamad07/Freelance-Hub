import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Code, Palette, Video, PenTool, Music } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const categories = [
  { name: 'Programming & Tech', icon: <Code size={32} />, image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=400' },
  { name: 'Graphics & Design', icon: <Palette size={32} />, image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=400' },
  { name: 'Video & Animation', icon: <Video size={32} />, image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=400' },
  { name: 'Writing & Translation', icon: <PenTool size={32} />, image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=400' },
  { name: 'Music & Audio', icon: <Music size={32} />, image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=400' },
];

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if(searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative w-full h-[600px] flex items-center justify-center bg-dark text-white overflow-hidden">
        {/* Background gradient blob */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            Find the right <span className="font-serif italic text-primary">freelance</span> service, right away
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-2xl mx-auto relative mt-8"
          >
            <form onSubmit={handleSearch} className="flex items-center w-full bg-white rounded-full overflow-hidden shadow-2xl">
              <div className="pl-6 text-gray-400"><Search size={24} /></div>
              <input 
                type="text" 
                placeholder="Search for any service..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-4 px-4 text-gray-800 outline-none text-lg"
              />
              <button type="submit" className="bg-primary hover:bg-green-600 text-white px-8 py-4 font-semibold transition-colors">
                Search
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold mb-10 text-gray-900 dark:text-white">Popular Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map((cat, index) => (
            <Link to={`/services?category=${encodeURIComponent(cat.name)}`} key={cat.name}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl cursor-pointer border border-gray-100 dark:border-gray-700 transition-all h-48"
              >
                <div className="absolute inset-0 bg-gray-900/40 group-hover:bg-gray-900/60 transition-colors z-10"></div>
                <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-4">
                  <div className="text-white mb-3 group-hover:scale-110 transition-transform">{cat.icon}</div>
                  <h3 className="font-bold text-white text-lg tracking-wide">{cat.name}</h3>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary/10 dark:bg-primary/5 py-24">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">Ready to start building your dream project?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10">Join thousands of businesses testing and hiring freelancers quickly.</p>
          <Link to="/register" className="bg-primary hover:bg-green-600 text-white px-10 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105 inline-block shadow-lg shadow-primary/30">
            Join FreelanceHub Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
