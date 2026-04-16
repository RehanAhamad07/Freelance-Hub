import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
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
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef();
  const fileInputRef = useRef();
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

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

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-100px)] flex bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-800 mt-8 overflow-hidden relative">
      
      {/* Background Decorators */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Sidebar */}
      <div className="w-1/3 border-r border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 flex flex-col z-10">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md sticky top-0">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Messages</h2>
          <div className="mt-4 relative">
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-gray-100/80 dark:bg-gray-800/80 border-none rounded-2xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-white transition-all shadow-sm inset-1"
            />
          </div>
        </div>
        <div className="overflow-y-auto h-full px-3 py-4 space-y-2">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
              <UserIcon size={48} className="mb-4" />
              <p>No conversations yet.</p>
            </div>
          ) : (
            conversations.map((c) => {
              const otherUser = c.participants.find(p => String(p._id || p) !== userId);
              const isActive = currentChat?._id === c._id;
              return (
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  key={c._id} 
                  onClick={() => setCurrentChat(c)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 ${isActive ? 'bg-primary shadow-lg shadow-primary/30' : 'hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-100 dark:hover:border-gray-700/50 hover:shadow-sm'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {otherUser?.profilePicture ? (
                        <img src={otherUser.profilePicture} alt="User" className="w-12 h-12 rounded-full object-cover shadow-sm" />
                      ) : (
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${isActive ? 'bg-white/20 text-white' : 'bg-green-100 dark:bg-gray-700 text-primary'}`}>
                          {otherUser?.name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 ${isActive ? 'border-primary' : 'border-white dark:border-gray-900'} bg-green-500`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className={`font-bold truncate ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{otherUser?.name || 'User'}</h4>
                        <span className={`text-xs font-semibold ${isActive ? 'text-white/80' : 'text-gray-400'}`}>12:30</span>
                      </div>
                      <p className={`text-sm truncate ${isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>{c.lastMessage || 'Start the conversation...'}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </div>

      {/* Chat Box */}
      <div className="flex-1 flex flex-col h-full relative z-10 bg-transparent">
        {currentChat ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md flex justify-between items-center z-10 sticky top-0 shadow-sm">
               <div className="flex items-center gap-4">
                 {currentChat.participants.find(p => String(p._id || p) !== userId)?.profilePicture ? (
                   <img src={currentChat.participants.find(p => String(p._id || p) !== userId)?.profilePicture} alt="Profile" className="w-12 h-12 rounded-full object-cover shadow-sm border border-gray-100 dark:border-gray-700" />
                 ) : (
                   <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-black text-lg">
                     {currentChat.participants.find(p => String(p._id || p) !== userId)?.name?.charAt(0) || 'U'}
                   </div>
                 )}
                 <div>
                   <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                     {currentChat.participants.find(p => String(p._id || p) !== userId)?.name || 'Unknown User'}
                   </h3>
                   <div className="flex items-center gap-1.5 mt-0.5">
                     <span className="w-2 h-2 rounded-full bg-green-500"></span>
                     <span className="text-xs font-medium text-green-600 dark:text-green-400">Online now</span>
                   </div>
                 </div>
               </div>
               <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                 <MoreVertical size={20} />
               </button>
            </div>
            
            {/* Chat Messages Container */}
            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 bg-gray-50/50 dark:bg-gray-900/10">
              <AnimatePresence>
                {messages.map((m, i) => {
                  const isMe = m.sender === userId;
                  const senderDetails = getUserDetails(m.sender);

                  return (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className={`flex items-end gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMe && (
                        <div className="flex-shrink-0 mb-1">
                          {senderDetails?.profilePicture ? (
                            <img src={senderDetails.profilePicture} alt="Avatar" className="w-8 h-8 rounded-full object-cover shadow-sm" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                              {senderDetails?.name?.charAt(0) || 'U'}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className={`max-w-[70%] group relative ${isMe ? 'order-1' : 'order-2'}`}>
                        <div 
                          className={`p-4 shadow-sm text-[15px] leading-relaxed overflow-hidden ${isMe ? 'bg-gradient-to-br from-primary to-green-500 text-white rounded-3xl rounded-br-sm' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-3xl rounded-bl-sm'}`}
                        >
                          {m.image && <img src={m.image} alt="Sent file" className="max-w-full rounded-2xl mb-2 cursor-pointer hover:opacity-90 transition" />}
                          {m.audio && <CustomAudioPlayer audioSrc={m.audio} isMe={isMe} />}
                          {m.text && <p className="leading-snug">{m.text}</p>}
                        </div>
                        <span className={`text-[10px] text-gray-400 font-medium absolute -bottom-5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ${isMe ? 'right-1' : 'left-1'}`}>
                          {new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
              <div ref={scrollRef}></div>
            </div>

            {/* Input Box */}
            <div className="p-4 md:p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 relative">
              {/* Emoji Picker Overlay */}
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-[80px] left-16 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 rounded-3xl shadow-xl w-64 z-50 grid grid-cols-4 gap-3"
                  >
                    {COMMON_EMOJIS.map(emoji => (
                      <button 
                        key={emoji} 
                        type="button"
                        onClick={() => setNewMessage(p => p + emoji)}
                        className="text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-xl transition cursor-pointer flex items-center justify-center transform hover:scale-125 active:scale-95"
                      >
                        {emoji}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="flex gap-3 items-center">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-gray-400 hover:text-primary transition p-2.5 bg-gray-100 dark:bg-gray-800 rounded-full flex-shrink-0">
                  <ImageIcon size={20} />
                </button>
                
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full pl-5 pr-12 py-3 md:py-4 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  />
                  <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-500 transition">
                    <Smile size={20} />
                  </button>
                </div>
                
                {isRecording ? (
                  <button 
                    type="button" 
                    onClick={handleStopRecording} 
                    className="bg-red-500 hover:bg-red-600 animate-pulse text-white font-bold h-12 w-12 md:h-14 md:w-14 rounded-full flex items-center justify-center transition-all flex-shrink-0"
                  >
                    <Square size={18} fill="currentColor" />
                  </button>
                ) : (
                  <button 
                    type="button" 
                    onClick={handleStartRecording} 
                    className="bg-gray-100 dark:bg-gray-800 hover:text-red-500 text-gray-500 font-bold h-12 w-12 md:h-14 md:w-14 rounded-full flex items-center justify-center transition-all flex-shrink-0"
                  >
                    <Mic size={20} />
                  </button>
                )}

                <button 
                  disabled={!newMessage.trim()} 
                  type="submit" 
                  className="bg-primary hover:bg-green-600 text-white font-bold h-12 w-12 md:h-14 md:w-14 rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:scale-95 hover:shadow-lg hover:shadow-primary/30 flex-shrink-0"
                >
                  <Send size={20} className="ml-1" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col">
            <div className="w-32 h-32 bg-primary/5 rounded-full flex items-center justify-center mb-6">
              <Send size={48} className="text-primary/40 -ml-2" />
            </div>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-3">Your Messages</h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-center max-w-sm">
              Select a conversation from the sidebar to start discussing your next big project.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
