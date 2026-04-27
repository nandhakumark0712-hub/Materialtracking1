import { useState, useEffect } from 'react';
import { Megaphone, Calendar, User, ShieldAlert, Loader2, Info, ArrowRight } from 'lucide-react';
import API from '../utils/api';

const Announcements = () => {
   const [announcements, setAnnouncements] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      fetchAnnouncements();
   }, []);

   const fetchAnnouncements = async () => {
      try {
         const { data } = await API.get('/api/chat/announcements');
         setAnnouncements(data.data);
         setLoading(false);
      } catch (error) {
         console.error('Error fetching announcements:', error);
         setLoading(false);
      }
   };

   if (loading) return (
      <div className="h-[70vh] flex items-center justify-center">
         <Loader2 className="animate-spin text-primary-500" size={48} />
      </div>
   );

   return (
      <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
               <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none mb-4 text-slate-900">Announcement Hub</h1>
               <p className="text-slate-500 font-bold uppercase text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] italic flex items-center">
                  <Info size={14} md:size={16} className="mr-2 md:mr-3 text-primary-500" /> Organizational Directives
               </p>
            </div>
            <div className="bg-white px-6 md:px-8 py-3 md:py-4 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 shadow-sm flex items-center space-x-4 italic w-max">
               <div className="w-8 h-8 md:w-10 md:h-10 bg-primary-50 text-primary-500 rounded-xl md:rounded-2xl flex items-center justify-center">
                  <Megaphone size={18} md:size={20} />
               </div>
               <div>
                  <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Broadcasts</p>
                  <p className="text-base md:text-lg font-black text-slate-900 leading-none mt-0.5 md:mt-1">{announcements.length}</p>
               </div>
            </div>
         </div>

         {announcements.length === 0 ? (
            <div className="bg-white p-20 rounded-[4rem] border border-slate-100 shadow-sm text-center">
               <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                  <Megaphone size={40} />
               </div>
               <h3 className="text-2xl font-black text-slate-900 uppercase italic mb-2 tracking-tight">No Active Signals</h3>
               <p className="text-slate-400 font-medium italic">Establishing connection to the organizational grid...</p>
            </div>
         ) : (
            <div className="grid gap-6 md:gap-8">
               {announcements.map((a) => (
                  <div key={a._id} className="group relative bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[4rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary-500/20 transition-all duration-500 overflow-hidden">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     
                     <div className="flex flex-col md:flex-row gap-8 relative z-10">
                        <div className="md:w-48 space-y-4">
                           <div className="flex items-center space-x-3">
                              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                 a.priority === 'High' 
                                 ? 'bg-rose-50 text-rose-500 border-rose-100' 
                                 : 'bg-primary-50 text-primary-500 border-primary-100'
                              }`}>
                                 {a.priority || 'Normal'}
                              </span>
                           </div>
                           <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 italic">Broadcast Date</p>
                              <div className="flex items-center text-slate-900 font-black text-xs uppercase italic">
                                 <Calendar size={14} className="mr-2 text-primary-500" /> {new Date(a.createdAt).toLocaleDateString()}
                              </div>
                           </div>
                        </div>

                        <div className="flex-1 space-y-4 md:space-y-6">
                           <div>
                              <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase italic tracking-tight leading-tight group-hover:text-primary-500 transition-colors">{a.title}</h3>
                              <div className="mt-4 md:mt-6 p-6 md:p-8 bg-slate-50 rounded-[2rem] md:rounded-[3rem] rounded-tl-none border border-slate-100 italic relative">
                                 <div className="hidden md:block absolute -left-2 top-0 w-4 h-4 bg-slate-50 rotate-45 border-l border-t border-slate-100"></div>
                                 <p className="text-xs md:text-sm text-slate-700 font-medium leading-relaxed">{a.content}</p>
                              </div>
                           </div>

                           <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                              <div className="flex items-center space-x-4">
                                 <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black italic shadow-lg">
                                    {a.author?.name?.charAt(0)}
                                 </div>
                                 <div>
                                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{a.author?.name}</p>
                                    <p className="text-[9px] font-black text-primary-500 uppercase tracking-widest">{a.author?.role}</p>
                                 </div>
                              </div>
                              <div className="flex items-center space-x-2 text-slate-300 group-hover:text-primary-500 transition-colors">
                                 <span className="text-[9px] font-black uppercase tracking-widest italic">Acknowledge Directive</span>
                                 <ArrowRight size={14} />
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         )}

         <div className="bg-slate-900 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-[100px]"></div>
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 relative z-10 text-center md:text-left">
               <div className="w-16 h-16 md:w-20 md:h-20 bg-primary-500 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-xl shadow-primary-500/20 shrink-0">
                  <ShieldAlert size={32} md:size={40} />
               </div>
               <div>
                  <h4 className="text-lg md:text-xl font-black italic uppercase tracking-tight mb-2">Protocol Enforcement</h4>
                  <p className="text-white/40 text-xs md:text-sm font-medium italic leading-relaxed max-w-2xl">
                     All announcements cataloged here are binding departmental directives. Please ensure full operational compliance with all protocol updates transmitted through this hub.
                  </p>
               </div>
            </div>
         </div>
      </div>
   );
};

export default Announcements;
