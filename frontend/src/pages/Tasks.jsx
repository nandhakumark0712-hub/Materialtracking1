import { useState, useEffect } from 'react';
import { 
  CheckCircle2, Clock, AlertCircle, Calendar, 
  MessageSquare, Paperclip, MoreVertical, Plus,
  Loader2, Filter, ChevronRight, User as UserIcon,
  Tag, Send, Target
} from 'lucide-react';
import API from '../utils/api';
import { useSelector } from 'react-redux';
import Modal from '../components/Modal';

const Tasks = () => {
  const { user } = useSelector(state => state.auth);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    deadline: '',
    assignedTo: '',
    executionChecklist: []
  });

  const isManagement = ['Admin', 'Manager', 'HR'].includes(user?.role);

  useEffect(() => {
    fetchTasks();
    if (isManagement) {
       fetchEmployees();
    }
  }, []);

  const fetchTasks = async () => {
    try {
      const endpoint = isManagement ? '/api/tasks' : '/api/tasks/my';
      const { data } = await API.get(endpoint);
      setTasks(data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
     try {
       const { data } = await API.get('/api/hrms/employees'); // Assuming this endpoint gives us list of employees
       setEmployees(data.data);
     } catch (err) {
       console.error(err);
     }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await API.post('/api/tasks', form);
      setIsModalOpen(false);
      fetchTasks();
      setForm({ title: '', description: '', priority: 'Medium', deadline: '', assignedTo: '', executionChecklist: [] });
    } catch (err) {
      alert(err.response?.data?.message || 'Error assigning task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await API.put(`/api/tasks/${taskId}/status`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  const filteredTasks = tasks.filter(t => filter === 'All' || t.status === filter);

  if (loading) return (
     <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin text-primary-500 mb-4" size={48} />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Accessing Tactical Assignment Grid...</p>
     </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight italic">Mission Controls</h1>
          <p className="text-slate-500 font-medium mt-1 text-xs md:text-sm">Direct assignments, track operational milestones, and manage workflows.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
           {isManagement && (
             <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto btn-primary flex items-center justify-center space-x-2 px-6 py-3 md:py-4 shadow-xl shadow-primary-500/20 text-xs md:text-base"
             >
                <Plus size={20} />
                <span>Assign Mission</span>
             </button>
           )}
           <div className="flex bg-white p-1 md:p-2 rounded-[1rem] md:rounded-[1.5rem] shadow-sm border border-slate-100 italic overflow-x-auto scrollbar-hide w-full sm:w-auto">
              {['All', 'Pending', 'In Progress', 'Completed'].map(f => (
                <button 
                   key={f}
                   onClick={() => setFilter(f)}
                   className={`flex-1 sm:flex-none px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                     filter === f ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-slate-500 hover:bg-slate-50'
                   }`}
                >
                   {f}
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <div key={task._id} className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
             <div className="absolute top-0 right-0 w-20 h-20 md:w-24 md:h-24 bg-slate-50 rounded-bl-[3rem] md:rounded-bl-[4rem] flex items-center justify-center group-hover:bg-primary-50 transition-colors">
                <button className="text-slate-300 hover:text-primary-500"><MoreVertical size={16} md:size={18} /></button>
             </div>

             <div className="flex mb-6">
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                   task.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                   task.status === 'In Progress' ? 'bg-sky-50 text-sky-600 border-sky-100' :
                   'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                   {task.status}
                </span>
             </div>

             <h3 className="text-xl font-black text-slate-900 mb-3 italic group-hover:text-primary-500 transition-colors">{task.title}</h3>
             <p className="text-slate-400 text-xs font-bold leading-relaxed mb-8 line-clamp-2 not-italic">{task.description || 'Global project directive for operational excellence.'}</p>

             <div className="mt-auto space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <div className="flex items-center text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      <Calendar size={14} className="mr-2 text-primary-500" />
                      {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'TBD'}
                   </div>
                   <div className={`flex items-center text-[10px] font-black uppercase justify-end italic ${
                      task.priority === 'High' ? 'text-rose-500' : task.priority === 'Medium' ? 'text-amber-500' : 'text-slate-400'
                   }`}>
                      <Tag size={14} className="mr-2" />
                      {task.priority || 'Standard'} Priority
                   </div>
                </div>

                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                   <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-primary-500 shadow-sm">
                         <UserIcon size={18} />
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{isManagement ? 'Assignee' : 'Assigner'}</p>
                         <p className="text-xs font-black text-slate-900 italic mt-1">
                            {isManagement ? (task.assignedTo?.name || 'Staff') : (task.assignedBy?.name || 'Manager')}
                         </p>
                      </div>
                   </div>
                   <div className="flex items-center">
                      <select 
                         className="text-[10px] font-black uppercase tracking-widest bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 focus:outline-none"
                         value={task.status}
                         onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      >
                         <option value="Pending">Queue</option>
                         <option value="In Progress">Active</option>
                         <option value="Completed">Resolved</option>
                      </select>
                   </div>
                </div>
             </div>
          </div>
        ))}
        
        {filteredTasks.length === 0 && (
          <div className="col-span-full py-40 text-center bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
             <AlertCircle className="mx-auto text-slate-300 mb-4" size={48} />
             <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No active deployments in the {filter} pool.</p>
          </div>
        )}
      </div>

      {/* Assign Task Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Deploy Mission Directive">
         <form onSubmit={handleCreateTask} className="space-y-6">
            <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Mission Headline</label>
               <input 
                 required 
                 className="input-field" 
                 value={form.title} 
                 onChange={e => setForm({...form, title: e.target.value})} 
                 placeholder="E.g. Inventory Audit - Wing B" 
               />
            </div>
            <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Detailed Directive</label>
               <textarea 
                 required 
                 className="input-field h-28" 
                 value={form.description} 
                 onChange={e => setForm({...form, description: e.target.value})} 
                 placeholder="Provide comprehensive objectives..." 
               />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Priority Tier</label>
                  <select 
                     className="input-field"
                     value={form.priority}
                     onChange={e => setForm({...form, priority: e.target.value})}
                  >
                     <option>High</option>
                     <option>Medium</option>
                     <option>Low</option>
                  </select>
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Deadline Date</label>
                  <input required type="date" className="input-field" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} />
               </div>
            </div>

            <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Execution Checklist (A/C, Mobile Audit Steps)</label>
               <div className="space-y-3">
                  {form.executionChecklist.map((item, index) => (
                     <div key={index} className="flex gap-2">
                        <input 
                           className="input-field flex-1" 
                           value={item.item} 
                           onChange={(e) => {
                              const newChecklist = [...form.executionChecklist];
                              newChecklist[index].item = e.target.value;
                              setForm({...form, executionChecklist: newChecklist});
                           }}
                           placeholder="Step description (e.g. A/C unit installation check)"
                        />
                        <button 
                           type="button"
                           onClick={() => setForm({...form, executionChecklist: form.executionChecklist.filter((_, i) => i !== index)})}
                           className="p-4 bg-rose-50 text-rose-500 rounded-xl"
                        >
                           <Trash2 size={16} />
                        </button>
                     </div>
                  ))}
                  <button 
                     type="button"
                     className="text-[10px] font-black text-primary-500 uppercase flex items-center"
                     onClick={() => setForm({...form, executionChecklist: [...form.executionChecklist, { item: '', isCompleted: false }]})}
                  >
                     <Plus size={14} className="mr-2" /> Add Audit Step
                  </button>
               </div>
            </div>
            <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Select Field Staff</label>
               <div className="relative">
                  <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <select 
                    required 
                    className="input-field pl-12"
                    value={form.assignedTo}
                    onChange={e => setForm({...form, assignedTo: e.target.value})}
                  >
                     <option value="">Choose Target Assignee</option>
                     {employees.map(emp => (
                        <option key={emp._id} value={emp._id}>{emp.name} ({emp.role})</option>
                     ))}
                  </select>
               </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-4 mt-2 flex items-center justify-center space-x-3">
               <Send size={18} />
               <span>{isSubmitting ? 'Transmitting Data...' : 'Authorize Global Assignment'}</span>
            </button>
         </form>
      </Modal>
    </div>
  );
};

export default Tasks;
