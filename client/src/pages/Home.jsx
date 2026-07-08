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
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#060a12] via-[#0c1222] to-[#070b14] text-white">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-purple/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 animate-pulse-slow"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0zMCAwdjYwTTAgMzBoNjAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwuMDI1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] bg-fixed opacity-60"></div>
 
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-28 md:py-36 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <span className="inline-block px-4 py-2 bg-brand-indigo/10 border border-brand-indigo/25 rounded-full text-indigo-300 text-xs font-semibold tracking-wider uppercase mb-6 shadow-3d-sm">
              ✨ Trusted by millions of freelancers worldwide
            </span>
          </motion.div>
 
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-7xl font-display font-extrabold mb-6 leading-tight tracking-tight text-white"
          >
            The <span className="bg-gradient-to-r from-brand-green via-emerald-400 to-brand-blue bg-clip-text text-transparent">World's Work</span> Marketplace
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-300 mb-10 max-w-3xl mx-auto font-medium"
          >
            Connect with skilled freelancers and grow your business. Find experts in any skill for any project, anytime.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full max-w-2xl mx-auto relative px-2 sm:px-0"
          >
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-dark-card rounded-2xl overflow-hidden shadow-3d-lg dark:shadow-3d-dark-lg p-2 border border-slate-100 dark:border-dark-border/80">
              <div className="pl-3 text-gray-400 hidden sm:block"><Search size={22} /></div>
              <input 
                type="text" 
                placeholder="What service are you looking for?" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:flex-1 py-3 px-3 sm:px-2 text-gray-800 dark:text-white dark:bg-transparent outline-none text-base font-semibold"
              />
              <button 
                type="submit" 
                className="w-full sm:w-auto btn-success px-8 py-3 rounded-xl font-bold hover:scale-103 whitespace-nowrap"
              >
                Search
              </button>
            </form>
          </motion.div>
 
          {/* Quick Browse */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 flex flex-wrap justify-center items-center gap-3"
          >
            <span className="text-slate-400 text-sm">Quick browse:</span>
            <Link to="/jobs" className="text-brand-blue hover:text-brand-purple text-sm font-bold transition">
              Browse Jobs
            </Link>
            <span className="text-slate-600 font-bold">•</span>
            <Link to="/services" className="text-brand-blue hover:text-brand-purple text-sm font-bold transition">
              Browse Services
            </Link>
          </motion.div>
        </div>
 
        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto px-4 py-16 border-t border-slate-800/40"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-3xl md:text-4xl font-display font-extrabold text-white mb-2 bg-gradient-to-br from-white to-slate-300 bg-clip-text text-transparent">{stat.number}</p>
              <p className="text-slate-400 text-xs font-bold tracking-wider uppercase">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50/50 dark:bg-dark/20 border-y border-slate-100 dark:border-dark-border/40">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-gray-900 dark:text-white mb-4">Why Choose Us?</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400">Everything you need to succeed on one platform</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white dark:bg-dark-card rounded-2xl p-8 hover-3d border border-gray-100 dark:border-dark-border/60 text-center shadow-3d-sm"
                >
                  <div className="w-14 h-14 bg-brand-indigo/10 dark:bg-brand-indigo/20 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-3d-sm">
                    <Icon size={26} className="text-brand-indigo dark:text-brand-indigo" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-extrabold mb-4 text-gray-900 dark:text-white">Explore Popular Categories</h2>
          <p className="text-lg text-slate-500 dark:text-slate-400">Find the right talent for every type of work</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map((cat, index) => {
            const Icon = cat.icon;
            return (
              <Link to={`/services?category=${encodeURIComponent(cat.name)}`} key={cat.name}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="group relative rounded-2xl overflow-hidden shadow-3d-md hover:shadow-3d-lg cursor-pointer border border-gray-200/40 dark:border-dark-border/50 transition-all h-48 bg-white dark:bg-dark-card"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/45 to-gray-950/20 group-hover:from-gray-950/90 group-hover:via-gray-950/60 group-hover:to-gray-950/30 transition-colors duration-300 z-10"></div>
                  <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-end text-center p-5">
                    <div className="text-white mb-2.5 group-hover:scale-110 transition-transform duration-300">
                      <Icon size={32} className="text-brand-green" />
                    </div>
                    <h3 className="font-display font-bold text-white text-sm sm:text-base leading-snug tracking-tight">{cat.name}</h3>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-20 my-8 bg-gradient-to-br from-brand-indigo via-brand-purple to-brand-pink rounded-3xl mx-4 max-w-6xl md:mx-auto border border-white/10 shadow-3d-lg dark:shadow-3d-dark-lg">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl font-display font-extrabold mb-6 text-white leading-tight"
          >
            Ready to Start Your Next Project?
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg md:text-xl text-indigo-50/90 mb-10 max-w-2xl mx-auto"
          >
            Join thousands of businesses hiring talented freelancers. Start your project today and see results in days.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/register" className="w-full sm:w-auto bg-white hover:bg-slate-100 text-brand-purple px-8 py-3.5 rounded-xl font-bold text-base transition-all hover:scale-105 inline-block shadow-lg">
              Get Started Today
            </Link>
            <Link to="/jobs" className="w-full sm:w-auto border border-white/60 hover:bg-white/15 text-white px-8 py-3.5 rounded-xl font-bold text-base transition-all inline-block hover:scale-105">
              Browse Jobs Now
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer Help */}
      <section className="bg-slate-950 dark:bg-dark-card border-t border-slate-900 dark:border-dark-border/40 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-display font-bold mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Questions? We're Here to Help</h3>
          <p className="text-slate-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">Contact our support team 24/7 for any assistance you need on the platform</p>
          <button className="btn-primary hover:shadow-glow-blue font-bold px-8 py-3.5 rounded-xl">
            Contact Support
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
