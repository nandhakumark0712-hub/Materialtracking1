import { useState, useEffect } from 'react';
import { 
  Users, UserPlus, DollarSign, Briefcase, FileText, 
  Search, Filter, Plus, PieChart, TrendingUp, AlertCircle,
  Loader2, Mail, Phone, Shield, CheckCircle2, XCircle, CreditCard,
  Send, UserCheck, IndianRupee, Activity, Target, MessageSquare,
  History, Globe, Award, Calendar, ChevronRight, Zap
} from 'lucide-react';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import io from 'socket.io-client';
import API from '../utils/api';
import Modal from '../components/Modal';
import { useSelector } from 'react-redux';

const HRMS = () => {
  const { user } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('Overview');
  const [employees, setEmployees] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [attendanceTrends, setAttendanceTrends] = useState({ days: [], counts: [] });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [jobFormData, setJobFormData] = useState({
    title: '', description: '', salary: '', type: 'Full-time', location: 'Remote'
  });

  const [formData, setFormData] = useState({
    name: '', username: '', password: 'password123', role: 'Employee', phone: ''
  });

  const [payrollForm, setPayrollForm] = useState({
    employeeId: '',
    month: 'May',
    year: '2024',
    baseSalary: 50000,
    bonus: 0,
    deductions: 0
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const [empRes, statsRes] = await Promise.all([
        API.get('/api/hrms/employees'),
        API.get('/api/hrms/stats')
      ]);
      setEmployees(empRes.data.data);
      setStats(statsRes.data.data);
      
      if (activeTab === 'Payroll') {
        const payRes = await API.get('/api/hrms/payroll/all');
        setPayrolls(payRes.data.data);
      } else if (activeTab === 'Recruitment') {
        const candRes = await API.get('/api/hrms/candidates');
        setCandidates(candRes.data.data);
      } else if (activeTab === 'Performance') {
        const perfRes = await API.get('/api/hrms/performance');
        setPerformance(perfRes.data.data);
      } else if (activeTab === 'Tickets') {
        const tickRes = await API.get('/api/hrms/tickets');
        setTickets(tickRes.data.data);
      }
      
      // Always fetch trends for Overview
      if (activeTab === 'Overview') {
        const trendRes = await API.get('/api/hrms/attendance/trends');
        setAttendanceTrends(trendRes.data.data);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await API.post('/api/admin/users', formData);
      setIsModalOpen(false);
      fetchData();
      setFormData({ name: '', username: '', password: 'password123', role: 'Employee', phone: '' });
      alert('Verification Complete: Employee successfully integrated into the corporate grid.');
    } catch (error) {
       alert(error.response?.data?.message || 'Onboarding failed.');
    } finally {
       setIsSubmitting(false);
    }
  };

  const handleGeneratePayroll = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await API.post('/api/hrms/payroll/generate', payrollForm);
      setIsPayrollModalOpen(false);
      fetchData();
      alert('Success: Salary request generated and transmitted to Admin for authorization.');
    } catch (err) {
      alert('Deployment Failed: Payroll generation halted.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprovePayroll = async (id) => {
    try {
      await API.put(`/api/hrms/payroll/${id}/approve`);
      fetchData();
      alert('Mission Authorized: Salary successfully credited to employee account.');
    } catch (err) {
      alert('Authorization Failed: Disbursement halted.');
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await API.post('/api/hrms/jobs', jobFormData);
      setIsJobModalOpen(false);
      setJobFormData({ title: '', description: '', salary: '', type: 'Full-time', location: 'Remote' });
      alert('Mission Success: New job requisition live in the talent grid.');
      fetchData();
    } catch (err) {
      alert('Failed to deploy job posting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.username && e.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">Human Resources</h1>
          <p className="text-slate-500 font-medium mt-1">Manage employee lifecycle, payroll, and recruitment.</p>
        </div>
        <div className="flex bg-white p-2 rounded-[1.5rem] shadow-sm border border-slate-100 italic overflow-x-auto">
           {['Overview', 'Employees', 'Payroll', 'Recruitment'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
           ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
           <Loader2 className="animate-spin text-primary-500 mb-4" size={48} />
           <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Syncing HR Database...</p>
        </div>
      ) : activeTab === 'Overview' && stats ? (
        <div className="space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Staff Count', val: stats.totalEmployees, icon: Users, color: 'text-primary-500' },
                { label: 'New Applicants', val: stats.newApplications, icon: Briefcase, color: 'text-amber-500' },
                { label: 'Pending Leaves', val: stats.pendingLeaves, icon: Calendar, color: 'text-rose-500' },
              ].map((s, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
                   <div className={`w-14 h-14 bg-slate-50 ${s.color} rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <s.icon size={28} />
                   </div>
                   <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider">{s.label}</p>
                   <h3 className="text-3xl font-black text-slate-900 mt-1">{s.val}</h3>
                </div>
              ))}
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100">
                 <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black italic uppercase tracking-tighter">Engagement Analytics</h3>
                    <span className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black uppercase tracking-widest">7-Day Activity</span>
                 </div>
                 <div className="h-80">
                    {attendanceTrends.days.length > 0 ? (
                      <Line 
                        data={{
                          labels: attendanceTrends.days,
                          datasets: [{
                            label: 'Attendance',
                            data: attendanceTrends.counts,
                            borderColor: '#3b82f6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            fill: true,
                            tension: 0.4
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { display: false } },
                          scales: { 
                            y: { beginAtZero: true, ticks: { stepSize: 1 } }, 
                            x: { grid: { display: false } } 
                          }
                        }}
                      />
                    ) : (
                       <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-20">
                          <Activity size={48} className="animate-pulse" />
                          <p className="text-[10px] font-black uppercase tracking-widest">Synchronizing Data...</p>
                       </div>
                    )}
                 </div>
              </div>

              <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                 <div>
                    <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8">Personnel Allocation Matrix</h3>
                    <div className="h-64 relative">
                       <Doughnut 
                         data={{
                           labels: ['Manager', 'Employee', 'HR', 'Sales Team'],
                           datasets: [{
                             data: [
                               employees.filter(e => e.role === 'Manager').length,
                               employees.filter(e => e.role === 'Employee').length,
                               employees.filter(e => e.role === 'HR').length,
                               employees.filter(e => e.role === 'Sales Team').length,
                             ],
                             backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#6366f1'],
                             borderWidth: 0
                           }]
                         }}
                         options={{ cutout: '85%', plugins: { legend: { position: 'bottom', labels: { boxWidth: 8, padding: 20, font: { size: 10, weight: '900' } } } } }}
                       />
                       <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-10">
                          <span className="text-3xl font-black text-slate-900">{stats.totalEmployees}</span>
                          <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Total Staff</span>
                       </div>
                    </div>
                 </div>
                 <div className="pt-6 border-t border-slate-50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">System capacity utilized at {((stats.totalEmployees / 50) * 100).toFixed(1)}% based on current staff registry.</p>
                 </div>
              </div>
           </div>
        </div>
      ) : activeTab === 'Employees' ? (
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
           <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div className="relative w-96">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                 <input className="input-field pl-12" placeholder="Search staff..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center space-x-3 px-8 py-4">
                 <Plus size={20} />
                 <span>Onboard Staff</span>
              </button>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                    <tr>
                       <th className="px-8 py-6 italic">Identity</th>
                       <th className="px-8 py-6 italic">Role</th>
                       <th className="px-8 py-6 italic">Status</th>
                       <th className="px-8 py-6 text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {filteredEmployees.map(e => (
                       <tr key={e._id} className="hover:bg-slate-50/50 group transition-all">
                          <td className="px-8 py-6">
                             <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-primary-500 shadow-sm font-black italic">{e.name.charAt(0)}</div>
                                <div>
                                   <p className="font-black text-slate-900 group-hover:text-primary-500 transition-colors uppercase">{e.name}</p>
                                   <p className="text-[10px] text-slate-400 font-bold">{e.username}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <span className="px-4 py-1.5 bg-slate-50 border border-slate-100 text-slate-600 text-[10px] font-black uppercase rounded-full">{e.role}</span>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div> Active
                             </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <button className="text-[10px] font-black text-primary-500 uppercase hover:underline">View Dossier</button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      ) : activeTab === 'Payroll' ? (
        <div className="space-y-6">
           <div className="flex justify-between items-center bg-slate-900 p-10 rounded-[3.5rem] text-white">
              <div>
                 <h2 className="text-3xl font-black italic">Financial Disbursal Hub</h2>
                 <p className="text-white/50 text-[10px] font-black font-bold uppercase tracking-widest mt-2 italic uppercase">Authorization pipeline: HR ➔ ADMIN ➔ CREDIT</p>
              </div>
              {user?.role === 'HR' && (
                 <button 
                  onClick={() => setIsPayrollModalOpen(true)}
                  className="px-8 py-4 bg-primary-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary-500/20 hover:scale-105 transition-all"
                 >
                    Provide Salary
                 </button>
              )}
           </div>

           <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50 bg-slate-50/20">
                 <h3 className="text-xl font-black italic">Recent Disbursement Requests</h3>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                       <tr>
                          <th className="px-8 py-6 italic">Beneficiary</th>
                          <th className="px-8 py-6 italic">Cycle</th>
                          <th className="px-8 py-6 italic">Net Salary</th>
                          <th className="px-8 py-6 italic">Status</th>
                          <th className="px-8 py-6 text-right italic md:pr-12">Authorization</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {payrolls.map(p => (
                          <tr key={p._id} className="hover:bg-slate-50/50 transition-all font-bold">
                             <td className="px-8 py-6">
                                <p className="font-black text-slate-900 uppercase tracking-tight">{p.employee?.name}</p>
                                <p className="text-[9px] text-slate-400 uppercase font-black italic">{p.employee?.role}</p>
                             </td>
                             <td className="px-8 py-6 text-slate-600">{p.month} {p.year}</td>
                             <td className="px-8 py-6 font-black text-lg text-slate-900">₹{p.netSalary}</td>
                             <td className="px-8 py-6">
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${
                                   p.status === 'Credited' ? 'bg-emerald-50 text-emerald-600' :
                                   p.status === 'Pending' ? 'bg-amber-50 text-amber-600 animate-pulse' :
                                   'bg-slate-50 text-slate-400'
                                }`}>
                                   {p.status}
                                </span>
                             </td>
                             <td className="px-8 py-6 text-right md:pr-12">
                                {p.status === 'Pending' ? (
                                   user?.role === 'Admin' ? (
                                      <button 
                                         onClick={() => handleApprovePayroll(p._id)}
                                         className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
                                      >
                                         Seal & Credit
                                      </button>
                                   ) : (
                                      <p className="text-[9px] font-black text-amber-500 uppercase italic">Awaiting Admin Signature</p>
                                   )
                                ) : (
                                   <div className="flex items-center justify-end text-emerald-500 space-x-2">
                                      <Shield size={14} />
                                      <span className="text-[9px] font-black uppercase">Mission Confirmed</span>
                                   </div>
                                )}
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      ) : activeTab === 'Recruitment' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                 <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <h3 className="text-xl font-black italic">Active Talent Pipeline</h3>
                    <button onClick={() => setIsJobModalOpen(true)} className="text-[10px] font-black uppercase text-primary-500 hover:underline">New Job Posting</button>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                          <tr>
                             <th className="px-8 py-6">Candidate</th>
                             <th className="px-8 py-6">Target Role</th>
                             <th className="px-8 py-6">Pipeline Stage</th>
                             <th className="px-8 py-6 text-right">Action</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {candidates.map(c => (
                             <tr key={c._id} className="hover:bg-slate-50/50 transition-all font-bold">
                                <td className="px-8 py-6">
                                   <p className="font-black text-slate-900 uppercase">{c.name}</p>
                                   <p className="text-[9px] text-slate-400 italic">{c.email}</p>
                                </td>
                                <td className="px-8 py-6">
                                   <span className="text-[10px] font-black uppercase text-slate-600">{c.job?.title || 'General'}</span>
                                </td>
                                <td className="px-8 py-6">
                                   <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${
                                      c.status === 'Hired' ? 'bg-emerald-50 text-emerald-600' : 
                                      c.status === 'Interview' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'
                                   }`}>{c.status}</span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                   <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-primary-500 transition-all"><ChevronRight size={16} /></button>
                                </td>
                             </tr>
                          ))}
                          {candidates.length === 0 && (
                             <tr><td colSpan="4" className="px-8 py-20 text-center text-slate-300 font-bold italic">No candidates in current pipeline</td></tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>
           
           <div className="space-y-6">
              <div className="bg-primary-500 p-10 rounded-[3.5rem] text-white">
                 <Globe className="mb-6 opacity-20" size={48} />
                 <h3 className="text-xl font-black italic mb-2">Hiring Velocity</h3>
                 <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest leading-relaxed">System is optimized for rapid talent acquisition. Average time-to-hire: 12 days.</p>
              </div>
           </div>
        </div>
      ) : null}

      {/* Provide Salary Modal */}
      <Modal isOpen={isPayrollModalOpen} onClose={() => setIsPayrollModalOpen(false)} title="Initialize Salary Disbursement">
         <form onSubmit={handleGeneratePayroll} className="space-y-6">
            <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Selected Beneficiary</label>
               <select required className="input-field" value={payrollForm.employeeId} onChange={e => setPayrollForm({...payrollForm, employeeId: e.target.value})}>
                  <option value="">Select Employee...</option>
                  {employees.map(e => (
                    <option key={e._id} value={e._id}>{e.name} ({e.role})</option>
                  ))}
               </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Base Salary</label>
                  <input type="number" className="input-field" value={payrollForm.baseSalary} onChange={e => setPayrollForm({...payrollForm, baseSalary: e.target.value})} />
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Bonus/Incentive</label>
                  <input type="number" className="input-field" value={payrollForm.bonus} onChange={e => setPayrollForm({...payrollForm, bonus: e.target.value})} />
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Billing Month</label>
                  <select className="input-field" value={payrollForm.month} onChange={e => setPayrollForm({...payrollForm, month: e.target.value})}>
                     {["Jan", "Feb", "March", "April", "May", "June", "July", "August", "Sept", "Oct", "Nov", "Dec"].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Total Deductions</label>
                  <input type="number" className="input-field" value={payrollForm.deductions} onChange={e => setPayrollForm({...payrollForm, deductions: e.target.value})} />
               </div>
            </div>
            <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex items-center space-x-4">
               <Send size={24} className="text-amber-500" />
               <p className="text-[10px] text-amber-900 font-bold leading-relaxed italic uppercase">
                  Note: Upon submission, a request will be triggered to the Administrative Grid for final signature and credit clearance.
               </p>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-4 mt-2">
               {isSubmitting ? 'Transmitting Request...' : 'Authorize Disbursement Request'}
            </button>
         </form>
      </Modal>

      {/* Onboard Employee Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Onboard New Employee">
        <form onSubmit={handleAddEmployee} className="space-y-6">
           <div className="grid grid-cols-2 gap-4">
              <input required className="input-field" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Full Name" />
              <select className="input-field" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                 <option>Employee</option><option>Manager</option><option>HR</option><option>Sales Team</option>
              </select>
           </div>
           <input required type="text" className="input-field" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} placeholder="Username" />
           <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-4 mt-2">Authorize & Onboard Staff</button>
        </form>
      </Modal>

      {/* New Job Posting Modal */}
      <Modal isOpen={isJobModalOpen} onClose={() => setIsJobModalOpen(false)} title="Create New Job Requisition">
         <form onSubmit={handleCreateJob} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Job Title</label>
                  <input required className="input-field" value={jobFormData.title} onChange={e => setJobFormData({...jobFormData, title: e.target.value})} placeholder="e.g. Senior Architect" />
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Employment Type</label>
                  <select className="input-field" value={jobFormData.type} onChange={e => setJobFormData({...jobFormData, type: e.target.value})}>
                     <option>Full-time</option><option>Contract</option><option>Part-time</option>
                  </select>
               </div>
            </div>
            <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Location / Workspace</label>
               <input required className="input-field" value={jobFormData.location} onChange={e => setJobFormData({...jobFormData, location: e.target.value})} placeholder="e.g. Remote / Bangalore" />
            </div>
            <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Description & Requirements</label>
               <textarea required className="input-field min-h-[100px] py-4" value={jobFormData.description} onChange={e => setJobFormData({...jobFormData, description: e.target.value})} placeholder="Outline the mission scope..." />
            </div>
            <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Salary Range</label>
               <input className="input-field" value={jobFormData.salary} onChange={e => setJobFormData({...jobFormData, salary: e.target.value})} placeholder="e.g. ₹12L - ₹18L PA" />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-4 mt-2">
               {isSubmitting ? 'Deploying Requisition...' : 'Authorize & Post Job'}
            </button>
         </form>
      </Modal>
    </div>
  );
};

export default HRMS;
