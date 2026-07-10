import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  Type, AlignLeft, DollarSign, Clock, Send, Sparkles, ChevronDown, Image,
  Code, PenTool, Video, Pen, Music, MoreHorizontal 
} from 'lucide-react';

const currencySymbols = {
  'USD': '$',
  'INR': '₹'
};

const colorMap = {
  'text-blue-500': { bg: 'bg-blue-500', borderText: 'text-blue-500', shadow: 'shadow-blue-500/30', gradient: 'from-blue-500 to-blue-600', lightGradient: 'from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900', accent: 'bg-gradient-to-r from-blue-400 to-blue-500' },
  'text-pink-500': { bg: 'bg-pink-500', borderText: 'text-pink-500', shadow: 'shadow-pink-500/30', gradient: 'from-pink-500 to-pink-600', lightGradient: 'from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900', accent: 'bg-gradient-to-r from-pink-400 to-pink-500' },
  'text-purple-500': { bg: 'bg-purple-500', borderText: 'text-purple-500', shadow: 'shadow-purple-500/30', gradient: 'from-purple-500 to-purple-600', lightGradient: 'from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900', accent: 'bg-gradient-to-r from-purple-400 to-purple-500' },
  'text-orange-500': { bg: 'bg-orange-500', borderText: 'text-orange-500', shadow: 'shadow-orange-500/30', gradient: 'from-orange-500 to-orange-600', lightGradient: 'from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900', accent: 'bg-gradient-to-r from-orange-400 to-orange-500' },
  'text-teal-500': { bg: 'bg-teal-500', borderText: 'text-teal-500', shadow: 'shadow-teal-500/30', gradient: 'from-teal-500 to-teal-600', lightGradient: 'from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900', accent: 'bg-gradient-to-r from-teal-400 to-teal-500' },
  'text-gray-500': { bg: 'bg-gray-500', borderText: 'text-gray-500', shadow: 'shadow-gray-500/30', gradient: 'from-gray-500 to-gray-600', lightGradient: 'from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900', accent: 'bg-gradient-to-r from-gray-400 to-gray-500' },
};

const categories = [
  { name: 'Programming & Tech', icon: Code, color: 'text-blue-500', bgHover: 'hover:bg-blue-50 dark:hover:bg-blue-500/10', border: 'focus-within:border-blue-500 focus-within:ring-blue-500/20' },
  { name: 'Graphics & Design', icon: PenTool, color: 'text-pink-500', bgHover: 'hover:bg-pink-50 dark:hover:bg-pink-500/10', border: 'focus-within:border-pink-500 focus-within:ring-pink-500/20' },
  { name: 'Video & Animation', icon: Video, color: 'text-purple-500', bgHover: 'hover:bg-purple-50 dark:hover:bg-purple-500/10', border: 'focus-within:border-purple-500 focus-within:ring-purple-500/20' },
  { name: 'Writing & Translation', icon: Pen, color: 'text-orange-500', bgHover: 'hover:bg-orange-50 dark:hover:bg-orange-500/10', border: 'focus-within:border-orange-500 focus-within:ring-orange-500/20' },
  { name: 'Music & Audio', icon: Music, color: 'text-teal-500', bgHover: 'hover:bg-teal-50 dark:hover:bg-teal-500/10', border: 'focus-within:border-teal-500 focus-within:ring-teal-500/20' },
  { name: 'Other', icon: MoreHorizontal, color: 'text-gray-500', bgHover: 'hover:bg-gray-100 dark:hover:bg-gray-700', border: 'focus-within:border-gray-500 focus-within:ring-gray-500/20' },
];

const CreateService = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'USD',
    deliveryTime: '',
    category: categories[0],
    image: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [addons, setAddons] = useState([]);
  const [newAddon, setNewAddon] = useState({ title: '', price: '', description: '' });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        category: formData.category.name,
        addons: addons.map(a => ({ title: a.title, price: Number(a.price), description: a.description })),
      };
      await api.post('/services', payload);
      toast.success('Service created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create service');
      setIsSubmitting(false);
    }
  };

  const currentCategory = formData.category;

  return (
    <div className="min-h-screen py-12 sm:py-20 pb-24 sm:pb-40 bg-[#fafafa] dark:bg-[#0f1115] relative font-sans">
      {/* Decorative gradient orbs mapped to the selected category color */}
      <div className={`absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b opacity-20 dark:opacity-10 pointer-events-none transition-colors duration-1000 ${formData.category.color.replace('text-', 'from-').replace('-500', '-400')} to-transparent`}></div>
      <div className={`absolute top-32 -left-32 w-96 h-96 rounded-full blur-[100px] opacity-20 pointer-events-none transition-colors duration-1000 ${formData.category.color.replace('text-', 'bg-')}`}></div>
      <div className={`absolute top-64 -right-32 w-96 h-96 rounded-full blur-[100px] opacity-20 pointer-events-none transition-colors duration-1000 ${formData.category.color.replace('text-', 'bg-')}`}></div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gradient-to-r from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 p-5 sm:p-8 md:p-14 relative overflow-hidden"
        >
          {/* Decorative corner gradient */}
          <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-5 pointer-events-none ${colorMap[formData.category.color].accent}`}></div>
          <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-5 pointer-events-none ${colorMap[formData.category.color].accent}`}></div>
          
          <div className="flex flex-col items-center text-center mb-12 relative z-10">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl mb-6 transition-all duration-500 ${formData.category.color.replace('text-', 'bg-')} bg-opacity-20 text-current ring-2 ${formData.category.color.replace('text-', 'ring-').replace('-500', '-400')}`}
            >
              <formData.category.icon size={40} className={formData.category.color} strokeWidth={1.5} />
            </motion.div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight mb-3 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Create a New Gig
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 font-medium max-w-lg">
              Showcase your skills, set your price, and connect with clients instantly.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10\">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Title */}
              <div className="col-span-1 md:col-span-2 group">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Gig Title</label>
                <div className={`relative flex items-center rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 border-2 border-transparent transition-all duration-300 ${formData.category.border} group-focus-within:shadow-lg`}>
                  <div className="pl-5 flex items-center pointer-events-none">
                    <Type size={20} className="text-gray-400 group-focus-within:text-gray-700 dark:group-focus-within:text-gray-300 transition-colors" />
                  </div>
                  <input 
                    type="text" name="title" value={formData.title} onChange={handleChange} required
                    placeholder="I will do something I'm really good at"
                    className="w-full bg-transparent pl-4 pr-5 py-4 text-gray-900 dark:text-white placeholder-gray-400 outline-none font-medium text-lg"
                  />
                </div>
              </div>

              {/* Category Dropdown (Custom) */}
              <div className="col-span-1 md:col-span-2 relative group" ref={dropdownRef}>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Category</label>
                <div 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`relative flex items-center justify-between rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 border-2 border-transparent cursor-pointer transition-all duration-300 py-4 px-5 hover:shadow-lg ${isDropdownOpen ? formData.category.border.split(' ')[0].replace('focus-within:', '') + ' shadow-lg' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <formData.category.icon size={22} className={formData.category.color} />
                    <span className="font-bold text-gray-900 dark:text-white text-lg">{formData.category.name}</span>
                  </div>
                  <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }} className="text-gray-400">
                    <ChevronDown size={20} />
                  </motion.div>
                </div>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
                      animate={{ opacity: 1, y: 0, scaleY: 1 }}
                      exit={{ opacity: 0, y: -10, scaleY: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute z-50 w-full mt-2 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden transform origin-top"
                    >
                      <div className="p-2 space-y-1">
                        {categories.map((cat, idx) => {
                          const Icon = cat.icon;
                          const isSelected = formData.category.name === cat.name;
                          return (
                            <div 
                              key={idx}
                              onClick={() => {
                                setFormData({ ...formData, category: cat });
                                setIsDropdownOpen(false);
                              }}
                              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${cat.bgHover} ${isSelected ? `bg-gradient-to-r ${colorMap[cat.color].lightGradient} ring-2 ${cat.color.replace('text-', 'ring-').replace('-500', '-400')}` : ''}`}
                            >
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cat.color.replace('text-', 'bg-')} bg-opacity-20 dark:bg-opacity-30`}>
                                <Icon size={20} className={cat.color} />
                              </div>
                              <span className={`font-semibold ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                {cat.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Description */}
              <div className="col-span-1 md:col-span-2 group">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Description</label>
                <div className={`relative flex items-start rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 border-2 border-transparent transition-all duration-300 ${formData.category.border} group-focus-within:shadow-lg`}>
                  <div className="pl-5 pt-5 flex items-center pointer-events-none">
                    <AlignLeft size={20} className="text-gray-400 group-focus-within:text-gray-700 dark:group-focus-within:text-gray-300 transition-colors" />
                  </div>
                  <textarea 
                    name="description" value={formData.description} onChange={handleChange} required rows={5}
                    placeholder="Describe your service in detail..."
                    className="w-full bg-transparent pl-4 pr-5 py-5 text-gray-900 dark:text-white placeholder-gray-400 outline-none resize-none font-medium text-lg leading-relaxed"
                  ></textarea>
                </div>
              </div>

              {/* Gig Image */}
              <div className="col-span-1 md:col-span-2 group">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Gig Image</label>
                <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 border-2 border-dashed ${formData.category.color.replace('text-', 'border-').replace('-500', '-400')} dark:border-gray-600 transition-all duration-300 cursor-pointer hover:shadow-lg min-h-[200px] overflow-hidden group-focus-within:shadow-lg`}>
                  {formData.image ? (
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8">
                      <Image size={40} className={formData.category.color + ' mb-3'} />
                      <label className="cursor-pointer">
                        <span className="font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">Click to upload image</span>
                        <input 
                          type="file" accept="image/*" onChange={handleImageChange} required
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                  {formData.image && (
                    <input 
                      type="file" accept="image/*" onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="col-span-1 group">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Price</label>
                <div className={`relative flex items-center rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 border-2 border-transparent transition-all duration-300 ${formData.category.border} overflow-hidden group-focus-within:shadow-lg`}>
                  <div className="pl-5 flex items-center pointer-events-none text-xl font-bold">
                    <span className={`${formData.category.color} transition-colors`}>{currencySymbols[formData.currency]}</span>
                  </div>
                  <input 
                    type="number" name="price" value={formData.price} onChange={handleChange} required min="5"
                    placeholder="0.00"
                    className="w-full min-w-0 bg-transparent pl-3 pr-2 py-4 text-gray-900 dark:text-white placeholder-gray-400 outline-none font-bold text-xl"
                  />
                  <select 
                    name="currency" 
                    value={formData.currency} 
                    onChange={handleChange}
                    className="bg-transparent border-l border-gray-200 dark:border-gray-600 py-4 pl-3 pr-5 text-gray-700 dark:text-gray-300 font-bold outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <option value="USD">$ USD</option>
                    <option value="INR">₹ INR</option>
                  </select>
                </div>
              </div>

              {/* Delivery Time */}
              <div className="col-span-1 group">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Delivery Time (Days)</label>
                <div className={`relative flex items-center rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 border-2 border-transparent transition-all duration-300 ${formData.category.border} group-focus-within:shadow-lg`}>
                  <div className="pl-5 flex items-center pointer-events-none">
                    <Clock size={20} className="text-gray-400 group-focus-within:text-gray-700 dark:group-focus-within:text-gray-300 transition-colors" />
                  </div>
                  <input 
                    type="text" name="deliveryTime" value={formData.deliveryTime} onChange={handleChange} required
                    placeholder="e.g., 7 Days"
                    className="w-full bg-transparent pl-4 pr-5 py-4 text-gray-900 dark:text-white placeholder-gray-400 outline-none font-bold text-xl"
                  />
                </div>
              </div>
            </div>

            {/* Add-ons Builder */}
            <div className="pt-4">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 ml-1">💎 Service Add-ons (Upsells)</label>
              <div className="space-y-2 mb-3">
                {addons.map((addon, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 border border-gray-200 dark:border-gray-600">
                    <div className="flex-1">
                      <p className="font-bold text-sm text-gray-900 dark:text-white">{addon.title}</p>
                      {addon.description && <p className="text-xs text-gray-500">{addon.description}</p>}
                    </div>
                    <span className="text-sm font-black text-green-600">+${addon.price}</span>
                    <button type="button" onClick={() => setAddons(addons.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 text-sm font-bold">✕</button>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:grid sm:grid-cols-12 gap-2">
                <input type="text" placeholder="Add-on title (e.g., Source Files)" value={newAddon.title} onChange={e => setNewAddon({...newAddon, title: e.target.value})}
                  className="w-full sm:col-span-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-indigo-500" />
                <input type="number" placeholder="Price" value={newAddon.price} onChange={e => setNewAddon({...newAddon, price: e.target.value})}
                  className="w-full sm:col-span-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-indigo-500" />
                <input type="text" placeholder="Description (optional)" value={newAddon.description} onChange={e => setNewAddon({...newAddon, description: e.target.value})}
                  className="w-full sm:col-span-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-indigo-500" />
                <button type="button" onClick={() => { if (newAddon.title && newAddon.price) { setAddons([...addons, newAddon]); setNewAddon({title:'', price:'', description:''}); } }}
                  className="w-full sm:col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition py-2.5 sm:py-0">+ Add</button>
              </div>
            </div>

            <div className="pt-8">
              <motion.button 
                type="submit" 
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full relative overflow-hidden text-white font-black text-lg py-5 rounded-2xl shadow-2xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group bg-gradient-to-r ${colorMap[formData.category.color].gradient} ${colorMap[formData.category.color].shadow} hover:shadow-2xl`}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Send size={20} strokeWidth={2.5} />
                  Publish Gig
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-700"></div>
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateService;
