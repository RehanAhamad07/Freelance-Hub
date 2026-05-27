import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Palette, Sparkles, Check, X, ImagePlus } from 'lucide-react';

const PRESET_COLORS = [
  { name: 'Ocean Blue', value: '#3B82F6' },
  { name: 'Emerald', value: '#10B981' },
  { name: 'Royal Purple', value: '#8B5CF6' },
  { name: 'Sunset Orange', value: '#F97316' },
  { name: 'Rose Pink', value: '#F43F5E' },
  { name: 'Amber Gold', value: '#F59E0B' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Fuchsia', value: '#D946EF' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Lime', value: '#84CC16' },
  { name: 'Slate', value: '#64748B' },
];

const PRESET_HEADERS = [
  { name: 'Cosmic Gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Sunset Blaze', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: 'Ocean Breeze', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { name: 'Northern Lights', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  { name: 'Midnight', value: 'linear-gradient(135deg, #0c0c1d 0%, #1a1a3e 50%, #2d1b69 100%)' },
  { name: 'Forest', value: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)' },
  { name: 'Lava', value: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)' },
  { name: 'Aurora', value: 'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)' },
];

const ProfileThemeCustomizer = ({ currentColor = '#3B82F6', currentHeader = '', onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(currentColor);
  const [selectedHeader, setSelectedHeader] = useState(currentHeader);
  const [customColor, setCustomColor] = useState(currentColor);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/analytics/theme', {
        themeColor: selectedColor,
        headerBackground: selectedHeader
      });
      toast.success('Profile theme updated!');
      if (onUpdate) onUpdate({ themeColor: selectedColor, headerBackground: selectedHeader });
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to update theme');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:shadow-md transition-all hover:border-purple-400 dark:hover:border-purple-500"
      >
        <Palette size={16} className="text-purple-500" />
        Customize Theme
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Customize Profile</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Personalize your profile appearance</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Preview */}
                <div className="rounded-xl overflow-hidden shadow-lg">
                  <div
                    className="h-24 w-full relative"
                    style={{ background: selectedHeader || `linear-gradient(135deg, ${selectedColor}, ${selectedColor}dd)` }}
                  >
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 flex items-center gap-3 -mt-6 relative z-10 mx-4 rounded-xl shadow-md">
                    <div className="w-12 h-12 rounded-full flex-shrink-0" style={{ background: selectedColor }}></div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">Your Profile Preview</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">This is how your profile will look</p>
                    </div>
                  </div>
                </div>

                {/* Accent Color */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Palette size={16} className="text-purple-500" /> Accent Color
                  </h3>
                  <div className="grid grid-cols-6 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => { setSelectedColor(color.value); setCustomColor(color.value); }}
                        className={`w-full aspect-square rounded-xl transition-all hover:scale-110 relative group ${
                          selectedColor === color.value ? 'ring-2 ring-offset-2 dark:ring-offset-gray-900 ring-gray-900 dark:ring-white scale-110' : ''
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      >
                        {selectedColor === color.value && (
                          <Check size={16} className="absolute inset-0 m-auto text-white drop-shadow-lg" />
                        )}
                      </button>
                    ))}
                  </div>
                  {/* Custom color picker */}
                  <div className="flex items-center gap-3 mt-3">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => { setCustomColor(e.target.value); setSelectedColor(e.target.value); }}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{selectedColor.toUpperCase()}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">Custom color</span>
                  </div>
                </div>

                {/* Header Background */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <ImagePlus size={16} className="text-purple-500" /> Header Background
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {/* No header option */}
                    <button
                      onClick={() => setSelectedHeader('')}
                      className={`h-14 rounded-xl transition-all border-2 border-dashed flex items-center justify-center text-xs text-gray-400 dark:text-gray-500 ${
                        selectedHeader === '' ? 'border-gray-900 dark:border-white bg-gray-100 dark:bg-gray-800' : 'border-gray-300 dark:border-gray-700 hover:border-gray-400'
                      }`}
                    >
                      Default
                    </button>
                    {PRESET_HEADERS.map((header) => (
                      <button
                        key={header.name}
                        onClick={() => setSelectedHeader(header.value)}
                        className={`h-14 rounded-xl transition-all relative group overflow-hidden ${
                          selectedHeader === header.value ? 'ring-2 ring-offset-2 dark:ring-offset-gray-900 ring-gray-900 dark:ring-white scale-105' : 'hover:scale-105'
                        }`}
                        style={{ background: header.value }}
                        title={header.name}
                      >
                        {selectedHeader === header.value && (
                          <Check size={14} className="absolute inset-0 m-auto text-white drop-shadow-lg" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl shadow-lg transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Theme'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProfileThemeCustomizer;
