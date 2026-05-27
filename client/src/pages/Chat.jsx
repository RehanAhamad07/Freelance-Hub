import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { showToast } from '../services/toast.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User as UserIcon, Image as ImageIcon, Smile, MoreVertical, Mic, Square, Play, Pause } from 'lucide-react';

const COMMON_EMOJIS = ["😀", "😂", "🥰", "😎", "🤔", "🥺", "😭", "👍", "🙏", "🔥", "❤️", "🎉", "✨", "💯", "👀", "✅"];

const CustomAudioPlayer = ({ audioSrc, isMe }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);
  
  // Static pseudo-random waveform generation
  const [bars] = useState(() => Array.from({ length: 35 }).map(() => 30 + Math.random() * 70));

  useEffect(() => {
    audioRef.current = new Audio(audioSrc);
    const audio = audioRef.current;
    
    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [audioSrc]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={`flex items-center gap-3 w-[220px] max-w-full ${isMe ? 'text-white' : 'text-gray-800 dark:text-white'}`}>
      <button onClick={togglePlay} className={`w-10 h-10 flex items-center justify-center rounded-full flex-shrink-0 transition-transform active:scale-95 ${isMe ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-primary/10 hover:bg-primary/20 text-primary'}`}>
        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
      </button>
      <div className="flex items-center gap-[2px] h-8 flex-1">
        {bars.map((height, i) => {
          const isActive = (i / bars.length) * 100 <= progress;
          return (
            <div 
              key={i} 
              className={`w-1 rounded-full transition-colors duration-150 ${isActive ? (isMe ? 'bg-white' : 'bg-primary') : (isMe ? 'bg-white/30' : 'bg-gray-300 dark:bg-gray-600')}`}
              style={{ height: `${height}%` }}
            ></div>
          );
        })}
      </div>
    </div>
  );
};

const Chat = () => {
  const { socket } = useContext(SocketContext);
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showChatMenu, setShowChatMenu] = useState(false);
  const scrollRef = useRef();
  const fileInputRef = useRef();
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const menuRef = useRef(null);

  const userId = String(user?.id || user?._id);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get('/chat/conversations');
        setConversations(res.data);
        if (location.state?.activeConversationId) {
          const activeCb = res.data.find(c => c._id === location.state.activeConversationId);
          if (activeCb) {
            setCurrentChat(activeCb);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (user) fetchConversations();
  }, [user, location.state]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (currentChat) {
        try {
          const res = await api.get(`/chat/${currentChat._id}/messages`);
          setMessages(res.data);
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchMessages();
  }, [currentChat]);

  useEffect(() => {
    if (!socket) return;
    const handleReceive = (message) => {
      if (currentChat && message.conversationId === currentChat._id) {
        setMessages((prev) => [...prev, message]);
      }
    };
    socket.on('receiveMessage', handleReceive);
    return () => {
      socket.off('receiveMessage', handleReceive);
    };
  }, [socket, currentChat]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowChatMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Voice Recording
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          sendMultimediaMessage(reader.result, 'audio');
        };
        audioChunksRef.current = [];
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone", error);
      alert("Microphone access is required for voice messages.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  // Handle Image Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        sendMultimediaMessage(reader.result, 'image');
      };
    }
  };

  const sendMultimediaMessage = (base64Data, type) => {
    if (!currentChat || !socket) return;
    const receiverId = currentChat.participants.find((p) => p._id !== userId)._id;
    const payload = {
      conversationId: currentChat._id,
      sender: userId,
      receiver: receiverId,
      text: ''
    };
    if (type === 'image') payload.image = base64Data;
    if (type === 'audio') payload.audio = base64Data;

    socket.emit('sendMessage', payload);
    setMessages((prev) => [...prev, { ...payload, createdAt: new Date() }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChat || !socket) return;

    const receiverId = currentChat.participants.find((p) => p._id !== userId)._id;

    const messageData = {
      conversationId: currentChat._id,
      sender: userId,
      receiver: receiverId,
      text: newMessage,
    };

    socket.emit('sendMessage', messageData);
    setMessages([...messages, { sender: userId, text: newMessage, createdAt: new Date() }]);
    setNewMessage('');
    setShowEmojiPicker(false);
  };

  const getUserDetails = (senderId) => {
    if (String(senderId) === userId) return user;
    return currentChat?.participants.find((p) => String(p._id || p) === String(senderId)) || {};
  };

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(c => {
    const otherUser = c.participants.find(p => String(p._id || p) !== userId);
    const name = otherUser?.name || 'Unknown User';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Handle menu actions
  const handleClearConversation = async () => {
    if (window.confirm('Are you sure you want to clear this conversation? This cannot be undone.')) {
      try {
        await api.delete(`/chat/${currentChat._id}/clear`);
        setMessages([]);
        setShowChatMenu(false);
        showToast.success('All messages have been removed', 'Conversation Cleared');
      } catch (error) {
        showToast.error(error.response?.data?.error || 'Failed to clear conversation', 'Error');
      }
    }
  };

  const handleBlockUser = async () => {
    if (window.confirm('Block this user? You won\'t see their messages.')) {
      try {
        const otherUser = currentChat.participants.find(p => String(p._id || p) !== userId);
        await api.post('/chat/block', { userToBlockId: otherUser._id });
        setShowChatMenu(false);
        showToast.success(`${otherUser.name} has been blocked`, 'User Blocked');
        // Remove conversation from list after 1 second
        setTimeout(() => {
          setConversations(conversations.filter(c => c._id !== currentChat._id));
          setCurrentChat(null);
        }, 1000);
      } catch (error) {
        showToast.error(error.response?.data?.error || 'Failed to block user', 'Error');
      }
    }
  };

  const handleMuteNotifications = async () => {
    try {
      await api.post('/chat/mute', { conversationId: currentChat._id });
      setShowChatMenu(false);
      showToast.success('Notifications muted for this conversation', 'Muted');
    } catch (error) {
      showToast.error(error.response?.data?.error || 'Failed to mute notifications', 'Error');
    }
  };

  const handleReportUser = async () => {
    const reason = prompt('Select reason:\n1. harassment\n2. abuse\n3. spam\n4. fraud\n5. other\n\nEnter number (1-5):');
    if (!reason) return;

    const reasonMap = { '1': 'harassment', '2': 'abuse', '3': 'spam', '4': 'fraud', '5': 'other' };
    const selectedReason = reasonMap[reason];

    if (!selectedReason) {
      showToast.error('Invalid reason selected', 'Invalid Selection');
      return;
    }

    const description = prompt('Provide additional details (optional):');

    try {
      const otherUser = currentChat.participants.find(p => String(p._id || p) !== userId);
      await api.post('/chat/report', {
        reportedUserId: otherUser._id,
        conversationId: currentChat._id,
        reason: selectedReason,
        description: description || ''
      });
      setShowChatMenu(false);
      showToast.success('Thank you for helping keep our community safe', 'User Reported');
    } catch (error) {
      showToast.error(error.response?.data?.error || 'Failed to report user', 'Error');
    }
  };

  const handleViewProfile = async () => {
    const otherUser = currentChat.participants.find(p => String(p._id || p) !== userId);
    setShowChatMenu(false);
    navigate(`/profile/${otherUser._id}`);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Chat Container */}
        <div className="h-[calc(100vh-140px)] flex bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          
          {/* Sidebar - Conversations List */}
          <div className="w-80 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 sticky top-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Messages</h1>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search conversations..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                />
                <svg className="absolute right-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Conversations List */}
            <div className="overflow-y-auto flex-1">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full px-6 py-12">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                    <UserIcon size={32} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-center font-medium">{searchQuery ? 'No conversations found' : 'No conversations yet'}</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs text-center mt-2">{searchQuery ? 'Try searching with a different name' : 'Start messaging with clients or freelancers'}</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredConversations.map((c) => {
                    const otherUser = c.participants.find(p => String(p._id || p) !== userId);
                    const isActive = currentChat?._id === c._id;
                    return (
                      <motion.button
                        whileHover={{ backgroundColor: isActive ? 'rgb(59, 130, 246)' : 'rgb(249, 250, 251)' }}
                        key={c._id} 
                        onClick={() => setCurrentChat(c)}
                        className={`w-full p-4 text-left transition-colors duration-200 ${isActive ? 'bg-blue-600 dark:bg-blue-700' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
                            {otherUser?.profilePicture ? (
                              <img 
                                src={otherUser.profilePicture} 
                                alt={otherUser.name} 
                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                              />
                            ) : (
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg ${isActive ? 'bg-blue-700' : 'bg-blue-600'}`}>
                                {otherUser?.name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                            )}
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline gap-2 mb-1">
                              <h4 className={`font-semibold truncate ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                {otherUser?.name || 'Unknown User'}
                              </h4>
                              <span className={`text-xs whitespace-nowrap ${isActive ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>
                                12:30
                              </span>
                            </div>
                            <p className={`text-sm truncate ${isActive ? 'text-blue-100' : 'text-gray-600 dark:text-gray-400'}`}>
                              {c.lastMessage || 'No messages yet'}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col h-full">
            {currentChat ? (
              <>
                {/* Chat Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                  <div className="flex items-center gap-4">
                    {currentChat.participants.find(p => String(p._id || p) !== userId)?.profilePicture ? (
                      <img 
                        src={currentChat.participants.find(p => String(p._id || p) !== userId)?.profilePicture} 
                        alt="Profile" 
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center font-bold text-white text-lg">
                        {currentChat.participants.find(p => String(p._id || p) !== userId)?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {currentChat.participants.find(p => String(p._id || p) !== userId)?.name || 'Unknown User'}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">Active now</span>
                      </div>
                    </div>
                  </div>
                  <div className="relative" ref={menuRef}>
                    <button 
                      onClick={() => setShowChatMenu(!showChatMenu)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-400">
                      <MoreVertical size={20} />
                    </button>
                    <AnimatePresence>
                      {showChatMenu && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-1"
                        >
                          <button 
                            onClick={handleViewProfile}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                          >
                            <UserIcon size={16} />
                            View Profile
                          </button>
                          <button 
                            onClick={handleMuteNotifications}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                          >
                            <svg size={16} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
                            Mute Notifications
                          </button>
                          <button 
                            onClick={handleClearConversation}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            Clear Conversation
                          </button>
                          <div className="my-1 border-t border-gray-200 dark:border-gray-700"></div>
                          <button 
                            onClick={handleBlockUser}
                            className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                            Block User
                          </button>
                          <button 
                            onClick={handleReportUser}
                            className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0-10a9 9 0 110 18 9 9 0 010-18zm0 0h.01"/></svg>
                            Report User
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-6 py-8 bg-gray-50 dark:bg-gray-950">
                  <div className="space-y-4 max-w-4xl">
                    <AnimatePresence>
                      {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-20">
                          <div className="text-center">
                            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Send size={40} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Start the conversation</h3>
                            <p className="text-gray-500 dark:text-gray-400">Send a message to discuss your project or service</p>
                          </div>
                        </div>
                      ) : (
                        messages.map((m, i) => {
                          const isMe = m.sender === userId;
                          const senderDetails = getUserDetails(m.sender);
                          return (
                            <motion.div 
                              key={i} 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              className={`flex gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                              {!isMe && (
                                <img 
                                  src={senderDetails?.profilePicture || `https://ui-avatars.com/api/?name=${senderDetails?.name || 'User'}&background=3B82F6&color=fff`}
                                  alt="Avatar"
                                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                />
                              )}
                              <div className={`max-w-xs ${isMe ? 'order-1' : ''}`}>
                                <div 
                                  className={`px-4 py-3 rounded-2xl ${isMe ? 'bg-blue-600 text-white rounded-br-none shadow-md' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-none'} ${m.flagged ? 'ring-2 ring-amber-400 dark:ring-amber-500' : ''}`}
                                >
                                  {m.image && (
                                    <img 
                                      src={m.image} 
                                      alt="Sent image" 
                                      className="max-w-xs rounded-lg mb-2 cursor-pointer hover:opacity-90 transition"
                                    />
                                  )}
                                  {m.audio && <CustomAudioPlayer audioSrc={m.audio} isMe={isMe} />}
                                  {m.text && <p className="text-sm leading-relaxed">{m.text}</p>}
                                </div>
                                {m.flagged && (
                                  <div className={`flex items-center gap-1 mt-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 ${isMe ? 'justify-end' : 'justify-start'}`} title={m.flagReasons?.join(', ')}>
                                    <span>⚠️</span>
                                    <span>Flagged for review</span>
                                  </div>
                                )}
                                <span className={`text-xs text-gray-500 dark:text-gray-400 mt-1 block ${isMe ? 'text-right' : 'text-left'}`}>
                                  {new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </motion.div>
                          )
                        })
                      )}
                    </AnimatePresence>
                  </div>
                  <div ref={scrollRef}></div>
                </div>

                {/* Input Area */}
                <div className="px-6 py-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                  <form onSubmit={handleSubmit} className="flex gap-3 items-end relative">
                    {/* File Input */}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageChange} 
                      accept="image/*" 
                      className="hidden" 
                    />

                    {/* Emoji, Image, Voice Buttons */}
                    <div className="flex gap-2">
                      <motion.button 
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        title="Attach image"
                      >
                        <ImageIcon size={20} />
                      </motion.button>
                      <motion.button 
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-yellow-500"
                        title="Add emoji"
                      >
                        <Smile size={20} />
                      </motion.button>
                      <motion.button 
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onMouseDown={handleStartRecording}
                        onMouseUp={handleStopRecording}
                        onTouchStart={handleStartRecording}
                        onTouchEnd={handleStopRecording}
                        className={`p-2.5 rounded-lg transition-colors ${isRecording ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400'}`}
                        title="Hold to record voice"
                      >
                        {isRecording ? <Square size={20} /> : <Mic size={20} />}
                      </motion.button>
                    </div>

                    {/* Emoji Picker */}
                    <AnimatePresence>
                      {showEmojiPicker && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute bottom-16 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-xl shadow-lg z-50 grid grid-cols-8 gap-1"
                        >
                          {COMMON_EMOJIS.map(emoji => (
                            <button 
                              key={emoji} 
                              type="button"
                              onClick={() => {
                                setNewMessage(p => p + emoji);
                                setShowEmojiPicker(false);
                              }}
                              className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition hover:scale-125 active:scale-95"
                            >
                              {emoji}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Message Input */}
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                    />

                    {/* Send Button */}
                    <motion.button 
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={!newMessage.trim()}
                      className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg transition-colors flex-shrink-0 disabled:cursor-not-allowed"
                      title="Send message"
                    >
                      <Send size={20} />
                    </motion.button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="text-center">
                  <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <UserIcon size={48} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your Messages</h2>
                  <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                    Select a conversation from the sidebar to start messaging with clients and freelancers about your projects.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
