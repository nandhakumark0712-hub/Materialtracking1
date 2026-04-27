import { useState, useEffect } from 'react';
import { 
  Camera, Send, CheckCircle2, AlertCircle, Info, HardHat, 
  ClipboardCheck, Loader2, ListTodo, Target, ChevronRight,
  ShieldCheck, Package, Truck, Zap
} from 'lucide-react';
import API from '../utils/api';
import { useSelector } from 'react-redux';

const FieldReport = () => {
  const { user } = useSelector(state => state.auth);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  const [formData, setFormData] = useState({
    auditReport: '',
    checklist: [],
    image: null
  });

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    try {
      const { data } = await API.get('/api/tasks/my');
      setTasks(data.data.filter(t => t.status !== 'Completed'));
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSelectTask = (task) => {
    setSelectedTask(task);
    setFormData({
      ...formData,
      checklist: task.executionChecklist || []
    });
  };

  const handleToggleCheck = (index) => {
    const newChecklist = [...formData.checklist];
    newChecklist[index].isCompleted = !newChecklist[index].isCompleted;
    setFormData({ ...formData, checklist: newChecklist });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTask) return alert('Please select a mission to audit.');
    
    setIsSubmitting(true);
    try {
      // Update task with checklist and audit report
      await API.put(`/api/tasks/${selectedTask._id}/status`, { 
        status: 'Completed',
        executionChecklist: formData.checklist,
        auditReport: formData.auditReport
      });
      
      setIsSubmitting(false);
      setSubmitted(true);
      fetchMyTasks();
      setSelectedTask(null);
    } catch (error) {
      alert('Report synchronization failed');
      setIsSubmitting(false);
    }
  };

  if (loading) return (
     <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin text-primary-500 mb-4" size={48} />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Accessing Tactical Deployment Grid...</p>
     </div>
  );

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/20">
           <ShieldCheck size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 italic tracking-tight uppercase">Audit Transmitted</h2>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2 italic">Operational data synchronized with mission control.</p>
        <button 
           onClick={() => setSubmitted(false)}
           className="mt-10 btn-primary px-10 py-4 shadow-xl shadow-primary-500/20"
        >
           Initiate Next Audit
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="bg-slate-900 p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] text-white flex flex-col md:flex-row justify-between items-center relative overflow-hidden gap-6">
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full -mr-32 -mt-32"></div>
         <div>
            <div className="flex items-center space-x-3 mb-2">
               <Zap className="text-primary-500 fill-primary-500" size={16} />
               <span className="text-primary-500 font-black uppercase text-[10px] tracking-[0.3em]">Execution Phase</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black italic tracking-tight">Field Execution & Audit</h1>
            <p className="text-white/50 font-bold uppercase text-[8px] md:text-[10px] tracking-widest mt-2">Deploy verification for A/C, Mobiles, and Site Services.</p>
         </div>
         <HardHat size={56} className="text-primary-500 relative z-10 hidden md:block" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
               <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center">
                  <Target size={16} className="text-primary-500 mr-2" /> Active Missions
               </h3>
               <div className="space-y-3">
                  {tasks.map(task => (
                     <button 
                       key={task._id}
                       onClick={() => handleSelectTask(task)}
                       className={`w-full text-left p-5 rounded-2xl border transition-all flex items-center justify-between group ${
                          selectedTask?._id === task._id ? 'bg-primary-500 border-primary-500 text-white shadow-xl shadow-primary-500/20' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-primary-500/30 text-slate-600'
                       }`}
                     >
                        <div>
                           <p className="text-xs font-black uppercase italic tracking-tight">{task.title}</p>
                           <p className={`text-[9px] font-bold uppercase mt-1 ${selectedTask?._id === task._id ? 'text-white/50' : 'text-slate-400'}`}>
                              Deadline: {new Date(task.deadline).toLocaleDateString()}
                           </p>
                        </div>
                        <ChevronRight size={16} className={`${selectedTask?._id === task._id ? 'translate-x-1' : 'group-hover:translate-x-1'} transition-transform`} />
                     </button>
                  ))}
                  {tasks.length === 0 && (
                     <p className="text-[10px] font-black uppercase text-slate-300 italic py-10 text-center border border-dashed border-slate-100 rounded-2xl">No missions assigned.</p>
                  )}
               </div>
            </div>
         </div>

         <div className="lg:col-span-2">
            {selectedTask ? (
               <div className="bg-white p-8 md:p-12 rounded-[3rem] md:rounded-[4rem] shadow-sm border border-slate-100 animate-in slide-in-from-right duration-500">
                  <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-50">
                     <div>
                        <h2 className="text-2xl font-black italic text-slate-900 uppercase tracking-tight">{selectedTask.title}</h2>
                        <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest mt-1">Direct Operational Verification</p>
                     </div>
                     <ClipboardCheck className="text-primary-500" size={32} />
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-10">
                     <div className="space-y-4">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest italic px-2">Execution Checklist</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {formData.checklist.map((item, i) => (
                              <div 
                                 key={i} 
                                 onClick={() => handleToggleCheck(i)}
                                 className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex items-center space-x-4 ${
                                    item.isCompleted ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-lg shadow-emerald-500/5' : 'bg-slate-50 border-slate-100 text-slate-400 grayscale hover:grayscale-0'
                                 }`}
                              >
                                 <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                                    item.isCompleted ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white text-slate-200'
                                 }`}>
                                    <CheckCircle2 size={18} />
                                 </div>
                                 <span className="text-xs font-black uppercase tracking-tight italic">{item.item}</span>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="space-y-4">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest italic px-2">Final Audit Summary (Field Report)</label>
                        <textarea 
                           required
                           className="input-field h-40 focus:h-60 transition-all resize-none text-sm" 
                           placeholder="Describe the installation outcome, delivery status, or quality check findings..."
                           value={formData.auditReport}
                           onChange={e => setFormData({...formData, auditReport: e.target.value})}
                        />
                     </div>

                     <div className="pt-6">
                        <button 
                           type="submit" 
                           disabled={isSubmitting}
                           className="w-full btn-primary py-5 rounded-[2rem] flex items-center justify-center space-x-4 text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary-500/30"
                        >
                           <Send size={20} />
                           <span>{isSubmitting ? 'Transmitting Audit...' : 'Authorize Task Completion'}</span>
                        </button>
                     </div>
                  </form>
               </div>
            ) : (
               <div className="h-full bg-slate-50 rounded-[4rem] border border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center opacity-50">
                  <ListTodo size={64} className="text-slate-200 mb-6" />
                  <h3 className="text-xl font-black text-slate-400 uppercase italic">Select a Mission</h3>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">Choose an active assignment to initiate execution and audit reporting.</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default FieldReport;
