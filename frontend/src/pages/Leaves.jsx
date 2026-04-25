import { useState, useEffect } from 'react';
import { 
  Calendar, Plus, Filter, Info, CheckCircle2, 
  Clock, XCircle, Loader2, User, Briefcase, 
  ArrowRight, ShieldCheck, AlertCircle
} from 'lucide-react';
import API from '../utils/api';
import Modal from '../components/Modal';
import { useSelector } from 'react-redux';

const Leaves = () => {
  const { user } = useSelector(state => state.auth);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    type: 'Annual Leave',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const isHR = user?.role === 'HR' || user?.role === 'Admin';

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const endpoint = isHR ? '/api/hrms/leaves' : '/api/hrms/leaves/my';
      const { data } = await API.get(endpoint);
      setLeaves(data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await API.post('/api/hrms/leaves/apply', form);
      setIsModalOpen(false);
      fetchLeaves();
      setForm({ type: 'Annual Leave', startDate: '', endDate: '', reason: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Error applying for leave');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
     try {
       await API.put(`/api/hrms/leaves/${id}`, { status });
       fetchLeaves();
     } catch (err) {
       alert('Failed to update leave status');
     }
  };

  if (loading) return (
     <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin text-primary-500 mb-4" size={48} />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Synchronizing Leave Ledger...</p>
     </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">Leave Management</h1>
          <p className="text-slate-500 font-medium mt-1">Schedule vacations, sick leaves, and manage time-off requests.</p>
        </div>
        {!isHR && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center space-x-3 px-8 py-4 shadow-xl shadow-primary-500/20"
          >
            <Plus size={22} />
            <span>Apply for Time-Off</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: 'Annual Entitlement', count: 24, color: 'primary', sub: 'Yearly Pool' },
           { label: 'Pending Requests', count: leaves.filter(l => l.status === 'Pending').length, color: 'amber', sub: 'In Authorization' },
           { label: 'Authorized Leaves', count: leaves.filter(l => l.status === 'Approved').length, color: 'emerald', sub: 'Confirmed Schedule' },
         ].map((s, i) => (
           <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group hover:shadow-xl transition-all relative overflow-hidden">
              <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${s.color}-500/5 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1 italic">{s.sub}</p>
              <h3 className="text-4xl font-black text-slate-900 mb-2">{s.count}</h3>
              <p className="text-slate-400 text-xs font-bold uppercase">{s.label}</p>
           </div>
         ))}
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
         <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
            <h3 className="text-xl font-black italic">{isHR ? 'Global Leave Registry' : 'My Leave Chronology'}</h3>
            <div className="flex items-center space-x-3">
               <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest italic font-bold">Encrypted Audit</span>
               <ShieldCheck className="text-primary-500" size={18} />
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                  <tr>
                     <th className="px-8 py-6 italic">{isHR ? 'Applicant' : 'Category'}</th>
                     <th className="px-8 py-6 italic">Scheduled Timeline</th>
                     <th className="px-8 py-6 italic">Authorization</th>
                     <th className="px-8 py-6 text-right italic">Departmental Policy</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {leaves.map((leave) => (
                     <tr key={leave._id} className="hover:bg-slate-50/50 group transition-all italic">
                        <td className="px-8 py-6">
                           <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-primary-500 shadow-sm font-black italic">
                                 {isHR ? leave.employee?.name.charAt(0) : leave.type.charAt(0)}
                              </div>
                              <div>
                                 <p className="font-black text-slate-900 leading-tight">{isHR ? leave.employee?.name : leave.type}</p>
                                 <p className="text-[10px] text-slate-400 font-bold not-italic font-bold uppercase mt-0.5">{isHR ? (leave.employee?.role || 'Staff') : 'Personal Leave'}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center space-x-3 text-slate-600 font-bold text-sm">
                              <Calendar size={16} className="text-primary-500" />
                              <span>{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                              leave.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                              leave.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                              'bg-amber-50 text-amber-600 border-amber-100'
                           }`}>
                              {leave.status}
                           </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                           {isHR && leave.status === 'Pending' ? (
                             <div className="flex items-center justify-end space-x-2">
                                <button 
                                  onClick={() => handleStatusUpdate(leave._id, 'Approved')}
                                  className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-110 transition-all font-bold"
                                >
                                   Accept
                                </button>
                                <button 
                                  onClick={() => handleStatusUpdate(leave._id, 'Rejected')}
                                  className="p-2.5 bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-500/20 hover:scale-110 transition-all font-bold"
                                >
                                   Decline
                                </button>
                             </div>
                           ) : (
                             <button 
                                onClick={() => setIsPolicyModalOpen(true)}
                                className="text-slate-300 hover:text-primary-500 transition-all p-2"
                             >
                                <ArrowRight size={20} />
                             </button>
                           )}
                        </td>
                     </tr>
                  ))}
                  {leaves.length === 0 && (
                     <tr>
                        <td colSpan="4" className="px-8 py-20 text-center text-slate-400 font-black italic uppercase tracking-widest text-xs">No active time-off requests found.</td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* Apply Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Time-Off">
          <form onSubmit={handleApply} className="space-y-6">
             <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Vacation Tier</label>
                <select 
                   className="input-field"
                   value={form.type}
                   onChange={e => setForm({...form, type: e.target.value})}
                >
                   <option>Annual Leave</option>
                   <option>Sick Leave</option>
                   <option>Casual Leave</option>
                </select>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Departure</label>
                   <input required type="date" className="input-field" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Return</label>
                   <input required type="date" className="input-field" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
                </div>
             </div>
             <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Context / Reason</label>
                <textarea 
                   required
                   className="input-field h-28" 
                   value={form.reason}
                   onChange={e => setForm({...form, reason: e.target.value})}
                   placeholder="E.g. Yearly visit to family..."
                />
             </div>
             <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex items-center space-x-4">
                <AlertCircle size={24} className="text-amber-500" />
                <p className="text-[9px] text-amber-900 font-bold leading-relaxed italic uppercase tracking-wider">
                   Policy Alert: Time-off requests are subject to departmental clearance. Please ensure all active projects are handed over before your departure.
                </p>
             </div>
             <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-4 mt-2">
                {isSubmitting ? 'Submitting Schedule...' : 'Authorize Request'}
             </button>
          </form>
      </Modal>

      {/* Policy Modal */}
      <Modal isOpen={isPolicyModalOpen} onClose={() => setIsPolicyModalOpen(false)} title="Departmental Leave Policy">
         <div className="space-y-6">
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
               <h4 className="text-sm font-black uppercase tracking-widest text-primary-500 mb-4 flex items-center">
                  <ShieldCheck size={18} className="mr-2" /> Directive 01: Entitlement
               </h4>
               <p className="text-xs text-slate-600 font-bold leading-relaxed italic">
                  All personnel are allocated 24 days of Annual Entitlement per fiscal cycle. Unused days will be archived and do not carry over to the next deployment period.
               </p>
            </div>
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
               <h4 className="text-sm font-black uppercase tracking-widest text-amber-500 mb-4 flex items-center">
                  <Clock size={18} className="mr-2" /> Directive 02: Notice Period
               </h4>
               <p className="text-xs text-slate-600 font-bold leading-relaxed italic">
                  Annual leave must be requested 14 days in advance. Sick leave requires medical confirmation for durations exceeding 48 hours.
               </p>
            </div>
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
               <h4 className="text-sm font-black uppercase tracking-widest text-rose-500 mb-4 flex items-center">
                  <AlertCircle size={18} className="mr-2" /> Directive 03: Blackout Dates
               </h4>
               <p className="text-xs text-slate-600 font-bold leading-relaxed italic">
                  Leaves may be restricted during critical project milestones or end-of-quarter audits to maintain operational integrity.
               </p>
            </div>
         </div>
      </Modal>
    </div>
  );
};

export default Leaves;
