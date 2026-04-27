import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, UserCheck, Clock, Award, Star, 
  Search, Mail, Phone, Calendar, ArrowRight,
  MessageSquare, BarChart3, Filter, MoreHorizontal,
  Loader2
} from 'lucide-react';
import API from '../utils/api';
import Modal from '../components/Modal';

const TeamManagement = () => {
  const [team, setTeam] = useState([]);
  const [teamSummary, setTeamSummary] = useState({ activeToday: 0, avgPerformance: '0%' });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeMenu, setActiveMenu] = useState(null);
  const [newStaff, setNewStaff] = useState({
    name: '', username: '', password: 'password123', role: 'Employee', phone: '', employeeID: ''
  });

  useEffect(() => {
    fetchTeam();
    const closeMenu = () => setActiveMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const fetchTeam = async () => {
    try {
      const { data } = await API.get('/api/manager/team');
      setTeam(data.data);
      if (data.summary) setTeamSummary(data.summary);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching team:', error);
      setLoading(false);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();

    const idRegex = /^EMP-\d{3}$/;
    if (newStaff.employeeID && !idRegex.test(newStaff.employeeID)) {
       alert('Access Denied: ID Number must follow the protocol EMP-XXX (e.g., EMP-001).');
       return;
    }

    setIsSubmitting(true);
    try {
      await API.post('/api/admin/users', newStaff);
      setIsAssignModalOpen(false);
      await fetchTeam();
      alert('Mission Accomplished: New staff assigned to departmental grid.');
      setNewStaff({ name: '', username: '', password: 'password123', role: 'Employee', phone: '', employeeID: '' });
    } catch (error) {
      const msg = error.response?.data?.message || 'Authorization failed during staff provisioning.';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTeam = team.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || (m.username && m.username.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = activeFilter === 'All' || m.role === activeFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight italic">Team Hub</h1>
          <p className="text-slate-500 font-medium mt-1 text-xs md:text-sm">Real-time oversight of department performance and staff status.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 flex-1 lg:max-w-xl justify-end w-full">
           <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search team..." 
                className="w-full input-field pl-12 py-3 md:py-4 bg-white shadow-sm text-sm md:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <button 
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center justify-center space-x-2 px-6 py-3 md:py-0 bg-white border border-slate-100 rounded-xl md:rounded-2xl shadow-sm hover:shadow-md transition-all text-slate-600 font-bold text-xs md:text-base"
           >
              <Filter size={18} className={activeFilter !== 'All' ? 'text-primary-500' : ''} />
              <span>{activeFilter === 'All' ? 'Filter' : activeFilter}</span>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
         <div className="bg-primary-500 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] text-white shadow-xl shadow-primary-500/20 flex items-center justify-between">
            <div>
               <p className="text-white/70 text-[10px] md:text-xs font-black uppercase tracking-widest">Total Staff</p>
               <h3 className="text-2xl md:text-3xl font-black mt-1">{team.length}</h3>
            </div>
            <div className="p-3 md:p-4 bg-white/20 rounded-xl md:rounded-2xl"><Users size={24} md:size={28} /></div>
         </div>
         <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
               <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest">Active Today</p>
               <h3 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">{teamSummary.activeToday}</h3>
            </div>
            <div className="p-3 md:p-4 bg-emerald-50 text-emerald-600 rounded-xl md:rounded-2xl"><UserCheck size={24} md:size={28} /></div>
         </div>
         <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
               <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest">Avg Performance</p>
               <h3 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">{teamSummary.avgPerformance}</h3>
            </div>
            <div className="p-3 md:p-4 bg-amber-50 text-amber-600 rounded-xl md:rounded-2xl"><Award size={24} md:size={28} /></div>
         </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
           <Loader2 className="animate-spin text-primary-500 mb-4" size={48} />
           <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Initializing Team Data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredTeam.map((member) => (
            <div key={member._id} className="card group hover:border-primary-500/50 p-6 flex flex-col h-full bg-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 rounded-bl-[4rem] transform translate-x-4 -translate-y-4 transition-transform group-hover:scale-110"></div>
               
               <div className="flex items-start justify-between mb-6 relative">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-white shadow-md overflow-hidden">
                     <img src={`https://ui-avatars.com/api/?name=${member.name}&background=ff6d2e&color=fff&size=128`} alt="avatar" />
                  </div>
                  <div className="relative">
                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         setActiveMenu(activeMenu === member._id ? null : member._id);
                       }}
                       className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                     >
                        <MoreHorizontal size={20} />
                     </button>
                     
                     {activeMenu === member._id && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in duration-200">
                           <button 
                             onClick={() => {
                               setSelectedMember(member);
                               setIsDetailModalOpen(true);
                             }}
                             className="w-full px-5 py-2.5 text-left text-[10px] font-black uppercase text-slate-500 hover:bg-slate-50 hover:text-primary-500"
                           >
                              View Dossier
                           </button>
                           <button 
                             className="w-full px-5 py-2.5 text-left text-[10px] font-black uppercase text-slate-500 hover:bg-slate-50 hover:text-primary-500"
                             onClick={() => {
                                alert('Redirecting to Mission Control for Identity Modification...');
                                window.location.href = '/users';
                             }}
                           >
                              Modify Identity
                           </button>
                           <button className="w-full px-5 py-2.5 text-left text-[10px] font-black uppercase text-rose-500 hover:bg-rose-50 border-t border-slate-50">
                              Terminate Link
                           </button>
                        </div>
                     )}
                  </div>
               </div>

               <div className="mb-6">
                  <h3 className="text-xl font-black text-slate-900 leading-tight">{member.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                     <span className="text-[10px] font-black uppercase tracking-widest text-primary-500 py-0.5 px-2 bg-primary-50 rounded-full">
                        {member.role === 'Sales Team' ? 'Sales' : member.role}
                     </span>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 italic">
                     <p className="text-[9px] font-black text-slate-400 uppercase">Attendance</p>
                     <p className="text-sm font-black text-slate-800">{member.attendanceRate || '0%'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 italic">
                     <p className="text-[9px] font-black text-slate-400 uppercase">Task Yield</p>
                     <p className="text-sm font-black text-slate-800">{member.taskYield || '0/0'}</p>
                  </div>
               </div>

               <div className="mt-auto space-y-4">
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                     <div className="flex -space-x-2">
                        {[1,2,3].map(i => (
                           <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-black uppercase">
                              {member.name.charAt(0)}
                           </div>
                        ))}
                     </div>
                     <Link to={`/chat?userId=${member._id}`} className="flex items-center text-xs font-black uppercase tracking-widest text-primary-500 hover:text-primary-600 transition-all hover:scale-105">
                        Transmit Signal <MessageSquare size={14} className="ml-2" />
                     </Link>
                  </div>
               </div>
            </div>
          ))}

          <div 
             onClick={() => setIsAssignModalOpen(true)}
             className="border-2 border-dashed border-slate-200 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-primary-500 transition-all cursor-pointer group min-h-[300px]"
          >
             <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary-50 group-hover:text-primary-500 transition-all">
                <Users size={32} />
             </div>
             <p className="font-black text-slate-600 uppercase tracking-widest text-sm">Assign New Staff</p>
             <p className="text-xs text-slate-400 mt-2 font-medium">Link new employees to your departmental grid</p>
          </div>
        </div>
      )}

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Employee Performance: ${selectedMember?.name}`}
      >
         <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-3xl flex items-center space-x-6 border border-slate-100">
               <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                  <BarChart3 size={40} className="text-primary-500" />
               </div>
               <div>
                  <p className="text-sm font-bold text-slate-800">Operational Yield</p>
                  <p className="text-xs text-slate-400 mt-1">Based on last 30 days of activity logs.</p>
                  <div className="mt-4 w-48 h-2 bg-white rounded-full overflow-hidden border border-slate-100">
                     <div className="h-full bg-primary-500 w-[94%]"></div>
                  </div>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white border-2 border-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Consistency</p>
                  <h4 className="text-xl font-black text-slate-900 mt-1">EXCEPTIONAL</h4>
               </div>
               <div className="bg-white border-2 border-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Growth Potential</p>
                  <h4 className="text-xl font-black text-slate-900 mt-1">HIGH (A+)</h4>
               </div>
            </div>
            <button className="w-full btn-primary py-4 mt-4">Download PDF Dossier</button>
         </div>
      </Modal>

      <Modal 
        isOpen={isAssignModalOpen} 
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign New Staff Member"
      >
        <form onSubmit={handleAddStaff} className="space-y-6">
           <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Full Name</label>
                 <input 
                    required
                    className="input-field" 
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                    placeholder="John Doe" 
                 />
              </div>
              <div>
                 <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Role</label>
                 <select 
                    className="input-field"
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
                 >
                    <option>Employee</option>
                    <option>Manager</option>
                    <option>HR</option>
                    <option>Sales Team</option>
                 </select>
              </div>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Username</label>
                 <input 
                    required
                    type="text"
                    className="input-field" 
                    value={newStaff.username}
                    onChange={(e) => setNewStaff({...newStaff, username: e.target.value})}
                    placeholder="e.g. staff_member" 
                 />
              </div>
              <div>
                 <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">ID Number</label>
                 <input 
                    required
                    className="input-field" 
                    value={newStaff.employeeID}
                    onChange={(e) => setNewStaff({...newStaff, employeeID: e.target.value})}
                    placeholder="e.g. EMP-001" 
                 />
              </div>
           </div>
           <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Temporary Password</label>
              <input 
                 required
                 type="password"
                 className="input-field" 
                 value={newStaff.password}
                 onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
              />
           </div>
           <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn-primary w-full py-4 mt-4"
           >
              {isSubmitting ? 'Assigning...' : 'Assign Staff to Department'}
           </button>
        </form>
      </Modal>

      <Modal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Team Members"
      >
         <div className="space-y-4">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Select Role to Filter</p>
            <div className="grid grid-cols-2 gap-3">
               {['All', 'Employee', 'Manager', 'HR', 'Sales Team'].map(role => (
                  <button 
                     key={role}
                     onClick={() => {
                        setActiveFilter(role);
                        setIsFilterOpen(false);
                     }}
                     className={`px-4 py-3 rounded-2xl text-sm font-bold transition-all border ${
                        activeFilter === role 
                        ? 'bg-primary-500 text-white border-primary-500' 
                        : 'bg-white text-slate-600 border-slate-100 hover:border-primary-500/50'
                     }`}
                  >
                     {role}
                  </button>
               ))}
            </div>
         </div>
      </Modal>
    </div>
  );
};

export default TeamManagement;
