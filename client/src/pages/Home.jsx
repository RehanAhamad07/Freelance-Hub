import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Code, Palette, Video, PenTool, Music, Zap, Shield, Users, TrendingUp, CheckCircle, Globe } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const categories = [
  { name: 'Programming & Tech', icon: Code, image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=400' },
  { name: 'Graphics & Design', icon: Palette, image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=400' },
  { name: 'Video & Animation', icon: Video, image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=400' },
  { name: 'Writing & Translation', icon: PenTool, image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=400' },
  { name: 'Music & Audio', icon: Music, image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=400' },
];

const features = [
  { icon: Zap, title: 'Fast & Easy', description: 'Post a job and get quality proposals in minutes' },
  { icon: Shield, title: 'Secure Payment', description: 'Payments are held safe until work is complete' },
  { icon: Users, title: 'Top Talent', description: 'Access verified freelancers with proven expertise' },
  { icon: TrendingUp, title: 'Grow Faster', description: 'Scale your business with skilled professionals' },
];

const stats = [
  { number: '5M+', label: 'Active Freelancers' },
  { number: '1000+', label: 'Job Categories' },
  { number: '98%', label: 'Client Satisfaction' },
  { number: '24/7', label: 'Support' },
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
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 animate-pulse"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0zMCAwdjYwTTAgMzBoNjAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] bg-fixed opacity-50"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <span className="inline-block px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-sm font-semibold mb-6">
              ✨ Trusted by millions of freelancers worldwide
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            The <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">World's Work</span> Marketplace
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto"
          >
            Connect with skilled freelancers and grow your business. Find experts in any skill for any project, anytime.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full max-w-2xl mx-auto relative"
          >
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3 bg-white rounded-xl overflow-hidden shadow-2xl p-2">
              <div className="pl-4 text-gray-400"><Search size={24} /></div>
              <input 
                type="text" 
                placeholder="What service are you looking for?" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 py-3 px-2 text-gray-800 outline-none text-lg"
              />
              <button 
                type="submit" 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 font-semibold rounded-lg transition-all hover:shadow-lg whitespace-nowrap"
              >
                Search
              </button>
            </form>
          </motion.div>

          {/* Quick Browse */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex flex-wrap justify-center gap-3"
          >
            <span className="text-gray-400 text-sm">Quick browse:</span>
            <Link to="/jobs" className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition">
              Browse Jobs
            </Link>
            <span className="text-gray-600">•</span>
            <Link to="/services" className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition">
              Browse Services
            </Link>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto px-4 py-16 border-t border-gray-700/50"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Why Choose Us?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Everything you need to succeed on one platform</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow text-center border border-gray-200 dark:border-gray-700"
                >
                  <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon size={28} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Explore Popular Categories</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">Find the right talent for every type of work</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map((cat, index) => {
            const Icon = cat.icon;
            return (
              <Link to={`/services?category=${encodeURIComponent(cat.name)}`} key={cat.name}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl cursor-pointer border border-gray-200 dark:border-gray-700 transition-all h-48 bg-white dark:bg-gray-800"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 to-gray-900/40 group-hover:from-gray-900/40 group-hover:to-gray-900/60 transition-colors z-10"></div>
                  <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-4">
                    <div className="text-white mb-3 group-hover:scale-110 transition-transform text-4xl">
                      <Icon size={40} />
                    </div>
                    <h3 className="font-bold text-white text-sm sm:text-base leading-snug">{cat.name}</h3>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-24 mt-12 bg-gradient-to-r from-blue-600 to-blue-800">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold mb-6 text-white"
          >
            Ready to Start Your Next Project?
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-xl text-blue-100 mb-10"
          >
            Join thousands of businesses hiring talented freelancers. Start your project today and see results in days.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/register" className="bg-white hover:bg-gray-100 text-blue-600 px-10 py-4 rounded-lg font-bold text-lg transition-all hover:scale-105 inline-block shadow-xl">
              Get Started Today
            </Link>
            <Link to="/jobs" className="border-2 border-white hover:bg-white/10 text-white px-10 py-4 rounded-lg font-bold text-lg transition-all inline-block">
              Browse Jobs Now
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-gray-900 dark:bg-gray-950 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Questions? We're Here to Help</h3>
          <p className="text-gray-400 mb-6">Contact our support team 24/7 for any assistance you need</p>
          <button className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors">
            Contact Support
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
