import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Send, Search, User, MessageSquare, Phone, Video, MoreVertical, Paperclip, Smile, ShieldAlert, Loader2, Megaphone, ArrowLeft } from 'lucide-react';
import API from '../utils/api';

const Chat = () => {
   const { user: currentUser } = useSelector((state) => state.auth);
   const [searchParams] = useSearchParams();
   const [contacts, setContacts] = useState([]);
   const [announcements, setAnnouncements] = useState([]);
   const [messages, setMessages] = useState([]);
   const [activeChat, setActiveChat] = useState(null); // { type: 'private'|'group', data: user|null }
   const [message, setMessage] = useState('');
   const [loading, setLoading] = useState(true);
   const [sending, setSending] = useState(false);
   const [showSidebar, setShowSidebar] = useState(true);
   const scrollRef = useRef();

   useEffect(() => {
      fetchInitialData();
   }, []);

   const fetchInitialData = async () => {
      try {
         const [usersRes, annRes] = await Promise.all([
            API.get('/api/admin/users'),
            API.get('/api/chat/announcements')
         ]);
         
         const filteredContacts = usersRes.data.data.filter(u => u._id !== currentUser.id);
         setContacts(filteredContacts);
         setAnnouncements(annRes.data.data);

         // Handle direct chat from Team Management
         const directUserId = searchParams.get('userId');
         if (directUserId) {
            const targetUser = filteredContacts.find(u => u._id === directUserId);
            if (targetUser) {
               handleSelectChat('private', targetUser);
            }
         } else {
            // Default to Group Chat
            handleSelectChat('group', null);
         }

         setLoading(false);
      } catch (error) {
         console.error('Error fetching chat data:', error);
         setLoading(false);
      }
   };

   const handleSelectChat = async (type, data) => {
      setActiveChat({ type, data });
      if (window.innerWidth < 1024) {
         setShowSidebar(false);
      }
      if (type === 'private' && data) {
         try {
            const res = await API.get(`/api/chat/messages/${data._id}`);
            setMessages(res.data.data);
         } catch (error) {
            console.error('Error fetching messages:', error);
         }
      } else {
         // Re-fetch announcements for group chat
         try {
            const res = await API.get('/api/chat/announcements');
            setAnnouncements(res.data.data);
         } catch (error) {
            console.error('Error fetching announcements:', error);
         }
      }
   };

   const handleSendMessage = async (e) => {
      e.preventDefault();
      if (!message.trim()) return;

      setSending(true);
      try {
         if (activeChat.type === 'private') {
            const res = await API.post('/api/chat/messages', {
               receiver: activeChat.data._id,
               content: message
            });
            setMessages([...messages, res.data.data]);
         } else {
            const res = await API.post('/api/chat/announcements', {
               content: message,
               title: `${currentUser.role} Broadcast Directive`
            });
            setAnnouncements([res.data.data, ...announcements]);
         }
         setMessage('');
      } catch (error) {
         alert(error.response?.data?.message || 'Failed to transmit signal.');
      } finally {
         setSending(false);
      }
   };

   useEffect(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
   }, [messages, announcements]);

   // Polling for new messages/announcements
   useEffect(() => {
      const interval = setInterval(async () => {
         try {
            if (activeChat?.type === 'private' && activeChat?.data?._id) {
               const res = await API.get(`/api/chat/messages/${activeChat.data._id}`);
               setMessages(res.data.data);
            } else if (activeChat?.type === 'group') {
               const res = await API.get('/api/chat/announcements');
               setAnnouncements(res.data.data);
            }
         } catch (err) {
            console.error('Polling error:', err);
         }
      }, 5000);
      return () => clearInterval(interval);
   }, [activeChat]);

   if (loading) return (
      <div className="h-full flex items-center justify-center">
         <Loader2 className="animate-spin text-primary-500" size={48} />
      </div>
   );

   return (
      <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-4 md:gap-8 animate-in fade-in duration-500 relative">
         {/* Sidebar */}
         <div className={`${showSidebar ? 'flex' : 'hidden lg:flex'} w-full lg:w-96 bg-white rounded-[2rem] lg:rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden italic`}>
            <div className="p-8 border-b border-slate-50">
               <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-6 text-slate-900">Comms Center</h2>
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input className="input-field pl-12 bg-slate-50 border-none" placeholder="Search frequencies..." />
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
               {/* Group Channels */}
               <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-4">Global Channels</p>
                  <div 
                    onClick={() => handleSelectChat('group', null)}
                    className={`p-6 rounded-[2.5rem] cursor-pointer transition-all flex items-center space-x-4 ${activeChat?.type === 'group' ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/20' : 'hover:bg-slate-50'}`}
                  >
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${activeChat?.type === 'group' ? 'bg-white/20' : 'bg-primary-50 text-primary-500'}`}>
                        <Megaphone size={20} />
                     </div>
                     <div>
                        <p className="font-black uppercase tracking-tight text-sm">Announcement Hub</p>
                        <p className={`text-[10px] font-bold ${activeChat?.type === 'group' ? 'text-white/60' : 'text-slate-400'}`}>Organizational Broadcasts</p>
                     </div>
                  </div>
               </div>

               {/* Private Contacts */}
               <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-4">Private Terminals</p>
                  <div className="space-y-2">
                     {contacts.map(c => (
                        <div 
                           key={c._id} 
                           onClick={() => handleSelectChat('private', c)}
                           className={`p-5 rounded-[2.5rem] cursor-pointer transition-all flex items-center space-x-4 ${activeChat?.data?._id === c._id ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'hover:bg-slate-50'}`}
                        >
                           <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 overflow-hidden">
                              <img src={`https://ui-avatars.com/api/?name=${c.name}&background=f1f5f9&color=64748b&size=64`} alt="avatar" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="font-black uppercase tracking-tight text-xs truncate">{c.name}</p>
                              <p className={`text-[9px] font-bold uppercase tracking-widest ${activeChat?.data?._id === c._id ? 'text-white/40' : 'text-slate-400'}`}>{c.role}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         {/* Chat Area */}
         <div className={`${!showSidebar ? 'flex' : 'hidden lg:flex'} flex-1 bg-white rounded-[2rem] lg:rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden relative italic`}>
            <div className="p-4 md:p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/10">
               <div className="flex items-center space-x-3 md:space-x-4">
                  <button 
                     onClick={() => setShowSidebar(true)}
                     className="lg:hidden p-2 text-slate-400 hover:text-primary-500 transition-all"
                  >
                     <ArrowLeft size={20} />
                   </button>
                  <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl text-white flex items-center justify-center font-black italic shadow-lg ${activeChat.type === 'group' ? 'bg-primary-500 shadow-primary-500/20' : 'bg-slate-900 shadow-slate-900/20'}`}>
                     {activeChat.type === 'group' ? <Megaphone size={18} md:size={24} /> : activeChat.data.name.charAt(0)}
                  </div>
                  <div>
                     <h3 className="text-sm md:text-lg font-black text-slate-900 uppercase tracking-tight">{activeChat.type === 'group' ? 'Announcement Hub' : activeChat.data.name}</h3>
                     <p className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center ${activeChat.type === 'group' ? 'text-primary-500' : 'text-slate-400'}`}>
                        {activeChat.type === 'group' ? 'Global Channel' : activeChat.data.role}
                     </p>
                  </div>
               </div>
               <div className="flex items-center space-x-2 md:space-x-4">
                  <button className="p-2 md:p-3 text-slate-300 hover:text-primary-500 transition-all"><Phone size={18} md:size={20} /></button>
                  <button className="p-2 md:p-3 text-slate-300 hover:text-primary-500 transition-all"><MoreVertical size={18} md:size={20} /></button>
               </div>
            </div>

            <div className="flex-1 p-4 md:p-10 overflow-y-auto space-y-6 md:space-y-8 bg-slate-50/30">
               {activeChat.type === 'private' ? (
                  messages.map((m, idx) => (
                     <div key={idx} className={`flex ${String(m.sender) === String(currentUser.id) ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] md:max-w-md p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm ${String(m.sender) === String(currentUser.id) ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'}`}>
                           <p className="text-xs md:text-sm font-medium">{m.content}</p>
                           <p className={`text-[8px] md:text-[9px] font-black uppercase mt-2 ${String(m.sender) === String(currentUser.id) ? 'text-white/40 text-right' : 'text-slate-400'}`}>
                              {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </p>
                        </div>
                     </div>
                  ))
               ) : (
                  announcements.map((a, idx) => (
                     <div key={idx} className="flex justify-start w-full">
                        <div className="max-w-full md:max-w-xl w-full p-6 md:p-8 bg-white border border-slate-100 rounded-[2rem] md:rounded-[3rem] rounded-tl-none shadow-sm relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-4 opacity-5"><Megaphone size={32} md:size={48} /></div>
                           <div className="flex items-center space-x-3 mb-4">
                              <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded-full">Protocol Update</span>
                              <span className="text-[9px] md:text-[10px] font-bold text-slate-300 uppercase">{new Date(a.createdAt).toLocaleDateString()}</span>
                           </div>
                           <p className="text-xs md:text-sm text-slate-700 font-medium leading-relaxed">{a.content}</p>
                           <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-slate-50 flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                 <div className="w-6 h-6 rounded-lg bg-primary-500 text-white flex items-center justify-center text-[8px] font-black italic">{a.author?.name?.charAt(0)}</div>
                                 <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-900">{a.author?.name}</p>
                              </div>
                              <span className="text-[8px] md:text-[9px] font-black text-slate-300 uppercase tracking-widest">{a.author?.role}</span>
                           </div>
                        </div>
                     </div>
                  ))
               )}
               <div ref={scrollRef} />
            </div>

            <div className="p-4 md:p-8 bg-white border-t border-slate-50">
               {activeChat.type === 'group' && !['Admin', 'Manager', 'HR'].includes(currentUser.role) ? (
                  <div className="bg-slate-50 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center border border-slate-100 space-x-3 text-center">
                     <ShieldAlert size={16} className="text-slate-400 shrink-0" />
                     <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Broadcast Restricted</p>
                  </div>
               ) : (
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2 md:space-x-4 bg-slate-50 p-1.5 md:p-2 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100">
                     <button type="button" className="p-2 md:p-4 text-slate-400 hover:text-primary-500 transition-all"><Smile size={18} md:size={20} /></button>
                     <input 
                        className="flex-1 bg-transparent border-none focus:ring-0 font-bold text-xs md:text-sm text-slate-700 px-2" 
                        placeholder={activeChat.type === 'group' ? "Broadcast..." : "Transmit..."}
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        disabled={sending}
                     />
                     <button type="submit" disabled={sending} className={`p-3 md:p-5 text-white rounded-xl md:rounded-[2rem] shadow-lg transition-all hover:scale-105 ${activeChat.type === 'group' ? 'bg-primary-500 shadow-primary-500/20' : 'bg-slate-900 shadow-slate-900/20'}`}>
                        {sending ? <Loader2 size={18} md:size={20} className="animate-spin" /> : <Send size={18} md:size={20} />}
                     </button>
                  </form>
               )}
            </div>
         </div>
      </div>
   );
};

export default Chat;
