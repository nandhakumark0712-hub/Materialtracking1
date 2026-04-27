import { useState, useEffect } from 'react';
import { 
  Users, Target, DollarSign, TrendingUp, Search, 
  Plus, Phone, Mail, Calendar, ArrowRight, 
  CheckCircle, Clock, Layout, Loader2, Briefcase,
  PieChart, Shield, MoreHorizontal, MessageSquare,
  Award, BarChart3, Star, Filter, ArrowUpRight,
  UserPlus, Zap, History, Bell, IndianRupee, Trash2, Edit, Inbox,
  ShieldCheck, XCircle, CheckCircle2, Building2, MapPin, 
  ChevronRight, ChevronLeft, Info, Activity, User as UserIcon
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import API from '../utils/api';
import Modal from '../components/Modal';
import { useSelector } from 'react-redux';

const CRM = () => {
  const { user } = useSelector(state => state.auth);
  const [customers, setCustomers] = useState([]);
  const [deals, setDeals] = useState([]);
  const [stats, setStats] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [pipelineData, setPipelineData] = useState([]);
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [materials, setMaterials] = useState([]);
  const [salesExecutives, setSalesExecutives] = useState([]);
  
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadStep, setLeadStep] = useState(1);
  const [isManageLeadModalOpen, setIsManageLeadModalOpen] = useState(false);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [isManageDealModalOpen, setIsManageDealModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [leadForm, setLeadForm] = useState({
    name: '', 
    contactPerson: '',
    jobTitle: '',
    email: '', 
    phone: '', 
    company: '', 
    industry: '',
    companySize: '',
    source: 'Direct',
    productInterested: 'None',
    quantityRequired: 0,
    budgetRange: '',
    expectedTimeline: '',
    deliveryLocation: '',
    installationRequired: false,
    priority: 'Medium',
    status: 'New',
    estimatedDealValue: 0,
    closeProbability: 0,
    nextFollowUpDate: '',
    preferredContactTime: '',
    assignedSalesExecutive: '',
    notes: '',
    score: 50
  });

  const [dealForm, setDealForm] = useState({
    title: '', customer: '', value: 0, status: 'Pending', items: []
  });

  const [followUpForm, setFollowUpForm] = useState({
    title: '', date: '', type: 'Call', notes: '', priority: 'Medium', lead: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const [resCust, resDeals, resStats, resFollows, resLead, resPipe, resMat, resStaff] = await Promise.all([
        API.get('/api/crm/customers'),
        API.get('/api/crm/deals'),
        API.get('/api/crm/stats'),
        API.get('/api/crm/followups'),
        API.get('/api/crm/leaderboard'),
        API.get('/api/crm/pipeline'),
        API.get('/api/materials'),
        API.get('/api/hrms/employees')
      ]);
      setCustomers(resCust.data.data);
      setDeals(resDeals.data.data);
      setStats(resStats.data.data);
      setFollowUps(resFollows.data.data);
      setLeaderboard(resLead.data.data);
      setPipelineData(resPipe.data.data);
      setMaterials(resMat.data.data);
      setSalesExecutives(resStaff.data.data.filter(e => ['Sales Team', 'Manager'].includes(e.role)));
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await API.post('/api/crm/customers', leadForm);
      setIsLeadModalOpen(false);
      setLeadStep(1);
      fetchData();
      resetLeadForm();
    } catch (error) {
       alert(error.response?.data?.message || 'Error creating prospect');
    } finally {
       setIsSubmitting(false);
    }
  };

  const resetLeadForm = () => {
    setLeadForm({
        name: '', contactPerson: '', jobTitle: '', email: '', phone: '', company: '', 
        industry: '', companySize: '', source: 'Direct', productInterested: 'None',
        quantityRequired: 0, budgetRange: '', expectedTimeline: '', deliveryLocation: '',
        installationRequired: false, priority: 'Medium', status: 'New', 
        estimatedDealValue: 0, closeProbability: 0, nextFollowUpDate: '',
        preferredContactTime: '', assignedSalesExecutive: '', notes: '', score: 50
    });
  };

  const handleUpdateLead = async (leadId, updateData) => {
    try {
      await API.put(`/api/crm/customers/${leadId}`, updateData);
      setIsManageLeadModalOpen(false);
      fetchData();
    } catch (error) {
      alert('Error updating prospect');
    }
  };

  const handleApproveLead = async (leadId, status) => {
    try {
      await API.put(`/api/crm/lead-approval/${leadId}`, { approvalStatus: status });
      setIsManageLeadModalOpen(false);
      fetchData();
    } catch (error) {
      alert('Error in approval process');
    }
  };

  const handleCreateDeal = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await API.post('/api/crm/deals', dealForm);
      setIsDealModalOpen(false);
      fetchData();
      setDealForm({ title: '', customer: '', value: 0, status: 'Pending', items: [] });
    } catch (error) {
       alert(error.response?.data?.message || 'Error creating deal');
    } finally {
       setIsSubmitting(false);
    }
  };

  const handleUpdateDeal = async (dealId, status) => {
    try {
      await API.put(`/api/crm/deals/${dealId}`, { status });
      setIsManageDealModalOpen(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating deal status');
    }
  };

  const pipelineChartData = {
    labels: pipelineData.map(p => p._id),
    datasets: [{
      data: pipelineData.map(p => p.count),
      backgroundColor: ['#0ea5e9', '#f59e0b', '#10b981', '#f43f5e', '#6366f1'],
      borderWidth: 0
    }]
  };

  const filteredLeads = customers.filter(c => 
    !c.isCustomer && (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.contactPerson && c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  const filteredCustomers = customers.filter(c => 
    c.isCustomer && (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  const isManagement = ['Admin', 'Manager'].includes(user?.role);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
           <div className="flex items-center space-x-3 mb-2">
              <Zap className="text-primary-500 fill-primary-500" size={16} md:size={20} />
               <span className="text-primary-500 font-black uppercase text-[8px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em]">CRM Intelligence v4.0</span>
           </div>
           <h1 className="text-2xl md:text-4xl font-black text-slate-900 italic tracking-tight">Lead Command Center</h1>
           <p className="text-slate-500 font-medium mt-1 text-xs md:text-sm">Manage entire sales lifecycle from discovery to conversion.</p>
        </div>
        <div className="flex bg-white p-1 md:p-2 rounded-[1rem] md:rounded-[1.5rem] shadow-sm border border-slate-100 italic overflow-x-auto scrollbar-hide w-full xl:w-auto">
           {['Overview', 'Leads', 'Customers', 'Pipeline', 'Follow-ups', 'Performance'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 xl:flex-none px-4 md:px-8 py-2 md:py-3 rounded-lg md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
           ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40">
           <Loader2 className="animate-spin text-primary-500 mb-6" size={64} />
           <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs italic">Mapping CRM Neural Grid...</p>
        </div>
      ) : (activeTab === 'Overview' && stats) ? (
        <div className="space-y-8">
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[
                { label: 'Qualified Prospects', val: stats.totalLeads, icon: Target, color: 'text-blue-500', bg: 'bg-blue-50' },
                { label: 'Active Pipeline', val: stats.activeDeals, icon: Briefcase, color: 'text-amber-500', bg: 'bg-amber-50' },
                { label: 'Revenue Expected', val: `₹${((stats.revenueExpected || 0)/1000).toFixed(1)}K`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                { label: 'Today outreach', val: stats.followUpsToday, icon: Clock, color: 'text-indigo-500', bg: 'bg-indigo-50' },
              ].map((s, i) => (
                <div key={i} className="bg-white p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 group hover:shadow-xl transition-all">
                   <div className="flex justify-between items-start mb-4 md:mb-6">
                      <div className={`w-10 h-10 md:w-14 md:h-14 ${s.bg} ${s.color} rounded-xl md:rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                         <s.icon size={20} md:size={26} />
                      </div>
                      <TrendingUp size={16} md:size={20} className="text-slate-100" />
                   </div>
                   <p className="text-slate-400 text-[8px] md:text-[9px] font-black uppercase tracking-widest italic">{s.label}</p>
                   <h3 className="text-xl md:text-3xl font-black text-slate-900 mt-1">
                      {typeof s.val === 'number' && s.val < 10 ? `0${s.val}` : s.val}
                   </h3>
                </div>
              ))}
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                 <div className="flex items-center justify-between mb-10">
                    <h3 className="text-xl font-black italic flex items-center"><TrendingUp className="mr-3 text-primary-500" /> Lead Velocity Index</h3>
                    <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full">+12.5% Conversion Lift</span>
                 </div>
                 <div className="h-80">
                    <Line 
                      data={{
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                        datasets: [{
                          label: 'Leads',
                          data: [45, 52, 48, 70, 85, 92],
                          borderColor: '#ff6d2e',
                          backgroundColor: 'rgba(255, 109, 46, 0.05)',
                          fill: true,
                          tension: 0.4,
                          borderWidth: 4,
                          pointRadius: 6,
                          pointBackgroundColor: '#fff',
                          pointBorderWidth: 4,
                        }]
                      }} 
                      options={{ 
                        maintainAspectRatio: false, 
                        plugins: { legend: { display: false } },
                        scales: { y: { display: false }, x: { grid: { display: false } } } 
                      }} 
                    />
                 </div>
              </div>

              <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-500/20 rounded-full blur-3xl group-hover:scale-150 transition-all duration-1000"></div>
                 <h3 className="text-xl font-black mb-10 italic tracking-tight flex items-center">
                    <Award className="mr-3 text-primary-500" /> Sales Champions
                 </h3>
                 <div className="space-y-8 relative z-10">
                    {leaderboard.slice(0, 4).map((p, i) => (
                       <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black italic border ${
                                i === 0 ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-white/5 border-white/10 text-white/50'
                             }`}>
                                {i+1}
                             </div>
                             <div>
                                <p className="font-extrabold text-sm tracking-wide">{p.name}</p>
                                <p className="text-[9px] text-white/40 font-black uppercase tracking-widest mt-0.5">Yield: {p.deals} Won</p>
                             </div>
                          </div>
                          <p className="text-primary-500 font-black italic text-sm">₹{(p.revenue/1000).toFixed(1)}k</p>
                       </div>
                    ))}
                    {leaderboard.length === 0 && <p className="text-white/20 font-black uppercase text-[10px] tracking-widest italic text-center py-10">Awaiting performance telemetry.</p>}
                 </div>
              </div>
           </div>
        </div>
      ) : (activeTab === 'Leads' || activeTab === 'Customers') ? (
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
           <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center bg-slate-50/20 gap-6">
              <div className="relative w-full md:w-96">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                 <input 
                    className="input-field pl-12" 
                    placeholder={`Search ${activeTab.toLowerCase()} by entity, company or contact...`} 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
              <div className="flex space-x-4 w-full md:w-auto">
                 {activeTab === 'Leads' && (
                   <button 
                     onClick={() => { resetLeadForm(); setIsLeadModalOpen(true); }}
                     className="flex-1 md:flex-none btn-primary flex items-center justify-center space-x-3 px-8 shadow-xl shadow-primary-500/20"
                   >
                      <UserPlus size={20} />
                      <span className="whitespace-nowrap font-black uppercase text-xs tracking-widest">Capture Prospect</span>
                   </button>
                 )}
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[1000px]">
                 <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                    <tr>
                       <th className="px-8 py-6 italic">Prospect Entity</th>
                       <th className="px-8 py-6 italic">Requirements</th>
                       <th className="px-8 py-6 italic">Value Potential</th>
                       <th className="px-8 py-6 italic">Lead Phase</th>
                       <th className="px-8 py-6 italic">Authorization</th>
                       <th className="px-8 py-6 text-right italic">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {(activeTab === 'Leads' ? filteredLeads : filteredCustomers).map(c => (
                       <tr key={c._id} className="hover:bg-slate-50/50 group transition-all italic">
                          <td className="px-8 py-6">
                             <div className="flex items-center space-x-4">
                                <div className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-100 text-primary-500 flex items-center justify-center font-black text-xl shadow-sm group-hover:bg-primary-500 group-hover:text-white group-hover:border-primary-500 transition-all duration-500">
                                   {c.name.charAt(0)}
                                </div>
                                <div>
                                   <p className="font-black text-slate-900 leading-tight tracking-tight text-lg">{c.name}</p>
                                   <p className="text-[10px] text-slate-400 font-bold not-italic mt-0.5 uppercase tracking-widest">{c.company || 'Private Portfolio'} • {c.contactPerson || 'Direct'}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex flex-col space-y-1">
                                <span className="text-[10px] font-black uppercase text-slate-900">{c.productInterested || 'No Intent'}</span>
                                <span className="text-[9px] text-slate-400 font-bold not-italic">Qty: {c.quantityRequired || 0} units</span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex flex-col">
                                <span className="text-sm font-black text-slate-900 italic">₹{((c.estimatedDealValue || 0)/1000).toFixed(1)}k</span>
                                <div className="flex items-center space-x-2 mt-1">
                                   <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                                      <div className="h-full bg-primary-500" style={{ width: `${c.closeProbability || 0}%` }}></div>
                                   </div>
                                   <span className="text-[9px] font-black text-slate-400">{c.closeProbability || 0}% Prob</span>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                c.status === 'Qualified' ? 'bg-sky-50 text-sky-600 border-sky-100' : 
                                c.status === 'Converted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                'bg-primary-50 text-primary-500 border-primary-100'
                             }`}>
                                {c.status}
                             </span>
                          </td>
                          <td className="px-8 py-6">
                             <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                c.approvalStatus === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                c.approvalStatus === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                'bg-rose-50 text-rose-600 border-rose-100'
                             }`}>
                                {c.approvalStatus || 'New'}
                             </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                              <button 
                                 onClick={() => { setSelectedLead(c); setIsManageLeadModalOpen(true); }}
                                 className="p-3 text-slate-300 hover:text-primary-500 hover:bg-slate-100 rounded-xl transition-all"
                              >
                                 <MoreHorizontal size={20} />
                              </button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      ) : activeTab === 'Pipeline' ? (
        <div className="space-y-8">
           <div className="flex justify-between items-end">
              <div>
                 <h3 className="text-2xl font-black italic tracking-tight">Financial Pipeline</h3>
                 <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Velocity tracking for pending and closed deal vectors</p>
              </div>
              <button onClick={() => setIsDealModalOpen(true)} className="btn-primary px-8 py-4 flex items-center space-x-3 shadow-lg shadow-primary-500/20">
                 <Plus size={20} />
                 <span className="font-black uppercase text-xs">New Opportunity</span>
              </button>
           </div>
           
           <div className="flex space-x-6 overflow-x-auto pb-8 scrollbar-hide">
              {['Pending', 'Approved', 'Won', 'Lost'].map(stage => (
                 <div key={stage} className="flex-shrink-0 w-80 bg-slate-50/50 rounded-[2.5rem] p-4 border border-dashed border-slate-200">
                    <div className="flex items-center justify-between mb-6 px-4 py-2 bg-white rounded-2xl shadow-sm border border-slate-100">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">{stage} Phase</span>
                       <span className="w-6 h-6 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] font-black">
                          {deals.filter(d => d.status === stage).length}
                       </span>
                    </div>
                    
                    <div className="space-y-4">
                       {deals.filter(d => d.status === stage).map(deal => (
                          <div key={deal._id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-16 h-1 bg-primary-500 opacity-20"></div>
                             <h4 className="text-sm font-black text-slate-900 italic leading-tight mb-2 pr-6">{deal.title}</h4>
                             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-6">Entity: {deal.customer?.name}</p>
                             
                             <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                                <span className="text-lg font-black text-slate-900 italic">₹{(deal.value/1000).toFixed(0)}k</span>
                                <button 
                                   onClick={() => { setSelectedDeal(deal); setIsManageDealModalOpen(true); }}
                                   className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-lg"
                                >
                                   <ArrowRight size={14} />
                                </button>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              ))}
           </div>
        </div>
      ) : activeTab === 'Follow-ups' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           <div className="lg:col-span-1 space-y-6">
              <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl"></div>
                 <h4 className="text-lg font-black italic mb-6 relative z-10">Outreach Protocol</h4>
                 <button 
                   onClick={() => setIsFollowUpModalOpen(true)}
                   className="w-full btn-primary py-4 mb-4 flex items-center justify-center space-x-3 shadow-xl shadow-primary-500/20 relative z-10"
                 >
                    <Calendar size={18} />
                    <span className="font-black uppercase text-xs">Log Outreach</span>
                 </button>
              </div>
           </div>

           <div className="lg:col-span-3 space-y-6">
              {followUps.map(task => (
                 <div key={task._id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                    <div className="flex items-center space-x-6">
                       <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                          task.type === 'Call' ? 'bg-blue-50 text-blue-500' : 
                          task.type === 'Meeting' ? 'bg-indigo-50 text-indigo-500' : 'bg-emerald-50 text-emerald-500'
                       }`}>
                          {task.type === 'Call' ? <Phone size={24} /> : task.type === 'Meeting' ? <Users size={24} /> : <Mail size={24} />}
                       </div>
                       <div>
                          <h4 className="text-lg font-black text-slate-900 italic mb-1 group-hover:text-primary-500 transition-colors">{task.title}</h4>
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                             <span className="flex items-center text-slate-900"><UserPlus size={12} className="mr-2" /> {task.lead?.name}</span>
                             <span className="flex items-center"><Calendar size={12} className="mr-2" /> {new Date(task.date).toLocaleDateString()}</span>
                             <span className={`flex items-center ${task.priority === 'High' ? 'text-rose-500' : 'text-slate-400'}`}>
                                <Star size={12} className="mr-2" /> {task.priority} Priority
                             </span>
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center space-x-4">
                       <button className="px-6 py-3 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-600 transition-all flex items-center shadow-sm">
                          <CheckCircle size={14} className="mr-2" /> Mark Complete
                       </button>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      ) : null}

      {/* Advanced Capture Prospect Modal - Multi-Step Form */}
      <Modal 
        isOpen={isLeadModalOpen} 
        onClose={() => { setIsLeadModalOpen(false); setLeadStep(1); }} 
        title={leadStep === 1 ? "Prospect: Identity & Source" : leadStep === 2 ? "Prospect: Requirements & Valuation" : "Prospect: Final Logistics"}
      >
         <div className="mb-8 flex items-center justify-between px-2">
            {[1, 2, 3].map(step => (
               <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black italic transition-all ${
                     leadStep === step ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 
                     leadStep > step ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                     {leadStep > step ? <CheckCircle2 size={18} /> : step}
                  </div>
                  {step < 3 && <div className={`w-12 h-1 mx-2 rounded-full ${leadStep > step ? 'bg-emerald-500' : 'bg-slate-100'}`}></div>}
               </div>
            ))}
         </div>

         <form onSubmit={handleCreateLead} className="space-y-8">
            {leadStep === 1 && (
               <div className="space-y-6 animate-in slide-in-from-right duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Company / Entity Name</label>
                        <div className="relative">
                           <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                           <input required className="input-field pl-12" value={leadForm.name} onChange={(e) => setLeadForm({...leadForm, name: e.target.value})} placeholder="E.g. Global Tech Solutions" />
                        </div>
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Contact Person Name</label>
                        <div className="relative">
                           <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                           <input required className="input-field pl-12" value={leadForm.contactPerson} onChange={(e) => setLeadForm({...leadForm, contactPerson: e.target.value})} placeholder="E.g. John Doe" />
                        </div>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Email (Hub)</label>
                        <div className="relative">
                           <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                           <input required type="email" className="input-field pl-12" value={leadForm.email} onChange={(e) => setLeadForm({...leadForm, email: e.target.value})} placeholder="john@company.com" />
                        </div>
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Direct Line (Phone)</label>
                        <div className="relative">
                           <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                           <input required className="input-field pl-12" value={leadForm.phone} onChange={(e) => setLeadForm({...leadForm, phone: e.target.value})} placeholder="+91 98765 43210" />
                        </div>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Industry Type</label>
                        <select className="input-field" value={leadForm.industry} onChange={e => setLeadForm({...leadForm, industry: e.target.value})}>
                           <option value="">Select Industry</option>
                           <option>Technology</option>
                           <option>Retail</option>
                           <option>Healthcare</option>
                           <option>Real Estate</option>
                           <option>Manufacturing</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Lead Source</label>
                        <select className="input-field" value={leadForm.source} onChange={e => setLeadForm({...leadForm, source: e.target.value})}>
                           <option>Website</option>
                           <option>Referral</option>
                           <option>Cold Call</option>
                           <option>Social Media</option>
                           <option>Existing Customer</option>
                           <option>Trade Show</option>
                           <option>Direct</option>
                        </select>
                     </div>
                  </div>
                  <button type="button" onClick={() => setLeadStep(2)} className="w-full btn-primary py-5 mt-6 flex items-center justify-center space-x-3 shadow-xl shadow-primary-500/20">
                     <span>Continue to Requirements</span>
                     <ChevronRight size={18} />
                  </button>
               </div>
            )}

            {leadStep === 2 && (
               <div className="space-y-6 animate-in slide-in-from-right duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Product Interested</label>
                        <select className="input-field" value={leadForm.productInterested} onChange={e => setLeadForm({...leadForm, productInterested: e.target.value})}>
                           <option value="None">Choose Product</option>
                           <option>A/C</option>
                           <option>Mobile</option>
                           <option>Both</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Quantity Required</label>
                        <input type="number" className="input-field" value={leadForm.quantityRequired} onChange={e => setLeadForm({...leadForm, quantityRequired: e.target.value})} />
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Est. Deal Value (INR)</label>
                        <div className="relative">
                           <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                           <input type="number" className="input-field pl-12" value={leadForm.estimatedDealValue} onChange={e => setLeadForm({...leadForm, estimatedDealValue: e.target.value})} />
                        </div>
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Close Probability (%)</label>
                        <input type="number" className="input-field" value={leadForm.closeProbability} onChange={e => setLeadForm({...leadForm, closeProbability: e.target.value})} />
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Priority Vector</label>
                        <select className="input-field" value={leadForm.priority} onChange={e => setLeadForm({...leadForm, priority: e.target.value})}>
                           <option>Low</option>
                           <option>Medium</option>
                           <option>High</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Current Lead Status</label>
                        <select className="input-field" value={leadForm.status} onChange={e => setLeadForm({...leadForm, status: e.target.value})}>
                           <option>New</option>
                           <option>Contacted</option>
                           <option>Qualified</option>
                        </select>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <button type="button" onClick={() => setLeadStep(1)} className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center space-x-2 font-black uppercase text-[10px] tracking-widest border border-slate-100 italic">
                        <ChevronLeft size={18} />
                        <span>Back</span>
                     </button>
                     <button type="button" onClick={() => setLeadStep(3)} className="flex-[2] btn-primary py-5 flex items-center justify-center space-x-3 shadow-xl shadow-primary-500/20">
                        <span>Continue to Logistics</span>
                        <ChevronRight size={18} />
                     </button>
                  </div>
               </div>
            )}

            {leadStep === 3 && (
               <div className="space-y-6 animate-in slide-in-from-right duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Expected Purchase Timeline</label>
                        <select className="input-field" value={leadForm.expectedTimeline} onChange={e => setLeadForm({...leadForm, expectedTimeline: e.target.value})}>
                           <option value="">Choose Timeline</option>
                           <option>Immediate (1 week)</option>
                           <option>Short Term (1 month)</option>
                           <option>Medium Term (3 months)</option>
                           <option>Future Planning</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Delivery Site Location</label>
                        <div className="relative">
                           <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                           <input className="input-field pl-12" value={leadForm.deliveryLocation} onChange={e => setLeadForm({...leadForm, deliveryLocation: e.target.value})} placeholder="City, State" />
                        </div>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Next Follow-up Vector</label>
                        <input type="date" className="input-field" value={leadForm.nextFollowUpDate} onChange={e => setLeadForm({...leadForm, nextFollowUpDate: e.target.value})} />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Assign Sales Executive</label>
                        <select className="input-field" value={leadForm.assignedSalesExecutive} onChange={e => setLeadForm({...leadForm, assignedSalesExecutive: e.target.value})}>
                           <option value="">Choose Executive</option>
                           {salesExecutives.map(e => <option key={e._id} value={e._id}>{e.name} ({e.role})</option>)}
                        </select>
                     </div>
                  </div>
                  <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Mission Notes / Technical Remarks</label>
                     <textarea className="input-field h-32" value={leadForm.notes} onChange={e => setLeadForm({...leadForm, notes: e.target.value})} placeholder="Bulk installation requirements for 10 units..." />
                  </div>
                  <div className="flex gap-4 mt-8">
                     <button type="button" onClick={() => setLeadStep(2)} className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center space-x-2 font-black uppercase text-[10px] tracking-widest border border-slate-100 italic">
                        <ChevronLeft size={18} />
                        <span>Back</span>
                     </button>
                     <button type="submit" disabled={isSubmitting} className="flex-[2] btn-primary py-5 flex items-center justify-center space-x-3 shadow-xl shadow-primary-500/20">
                        <ShieldCheck size={20} />
                        <span>{isSubmitting ? 'Transmitting Data...' : 'Authorize Global Prospect'}</span>
                     </button>
                  </div>
               </div>
            )}
         </form>
      </Modal>

      {/* Lead Management Modal */}
      <Modal isOpen={isManageLeadModalOpen} onClose={() => setIsManageLeadModalOpen(false)} title="Prospect Management Dashboard">
         {selectedLead && (
            <div className="space-y-8 pb-4">
               <div className="bg-slate-900 p-8 md:p-10 rounded-[3rem] text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-primary-500/20 transition-all duration-1000"></div>
                  <div className="flex justify-between items-start mb-8">
                     <div className="w-16 h-16 rounded-[2rem] bg-white text-primary-500 flex items-center justify-center text-3xl font-black italic shadow-2xl">
                        {selectedLead.name.charAt(0)}
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-primary-500 tracking-widest mb-1 italic">Est. Revenue Potential</p>
                        <h4 className="text-3xl font-black italic tracking-tighter">₹{(selectedLead.estimatedDealValue || 0).toLocaleString()}</h4>
                     </div>
                  </div>
                  <h4 className="text-2xl font-black italic mb-1 leading-tight">{selectedLead.name}</h4>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-[10px] font-black uppercase tracking-widest text-white/40">
                     <span className="flex items-center italic text-primary-500"><Building2 size={12} className="mr-2" /> {selectedLead.industry || 'General Industry'}</span>
                     <span className="flex items-center"><UserIcon size={12} className="mr-2" /> {selectedLead.contactPerson || 'Direct'}</span>
                     <span className="flex items-center"><MapPin size={12} className="mr-2" /> {selectedLead.deliveryLocation || 'Field'}</span>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 italic">Intent & Requirement</label>
                     <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                           <span className="text-[9px] font-black uppercase text-slate-400">Product Line</span>
                           <span className="text-xs font-black italic text-slate-900">{selectedLead.productInterested}</span>
                        </div>
                        <div className="flex items-center justify-between mb-4">
                           <span className="text-[9px] font-black uppercase text-slate-400">Units Required</span>
                           <span className="text-xs font-black italic text-slate-900">{selectedLead.quantityRequired} Units</span>
                        </div>
                        <div className="flex items-center justify-between">
                           <span className="text-[9px] font-black uppercase text-slate-400">Timeline</span>
                           <span className="text-xs font-black italic text-primary-500">{selectedLead.expectedTimeline || 'TBD'}</span>
                        </div>
                     </div>
                  </div>
                  <div className="space-y-4">
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 italic">Pipeline Status Matrix</label>
                     <div className="grid grid-cols-3 gap-3">
                        {['New', 'Qualified', 'Converted'].map(status => (
                           <button 
                              key={status}
                              onClick={() => handleUpdateLead(selectedLead._id, { status })}
                              className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                                 selectedLead.status === status 
                                    ? 'bg-primary-500 text-white border-primary-500 shadow-xl shadow-primary-500/20' 
                                    : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
                              }`}
                           >
                              {status}
                           </button>
                        ))}
                     </div>
                  </div>
               </div>

               {isManagement && (selectedLead.status === 'Qualified' || selectedLead.status === 'Converted') && selectedLead.approvalStatus !== 'Approved' && (
                  <div className="space-y-4 p-8 bg-amber-50/30 rounded-[3rem] border border-amber-100 border-dashed">
                     <div className="flex items-center space-x-3 mb-2">
                        <Shield className="text-amber-500" size={18} />
                        <label className="block text-[10px] font-black text-amber-600 uppercase tracking-widest italic">Administrative Authorization Protocol</label>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <button 
                           onClick={() => handleApproveLead(selectedLead._id, 'Approved')}
                           className="py-5 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20"
                        >
                           <ShieldCheck size={18} />
                           <span>Approve Lead</span>
                        </button>
                        <button 
                           onClick={() => handleApproveLead(selectedLead._id, 'Rejected')}
                           className="py-5 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-rose-500/20"
                        >
                           <XCircle size={18} />
                           <span>Reject</span>
                        </button>
                     </div>
                  </div>
               )}

               <div className="pt-6 border-t border-slate-100 flex gap-4">
                  <button 
                    className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-100 hover:text-rose-600 transition-all flex items-center justify-center space-x-2 border border-slate-100"
                    onClick={() => {
                       if(window.confirm('Execute permanent deletion of lead matrix?')) {
                          API.delete(`/api/crm/customers/${selectedLead._id}`).then(() => { setIsManageLeadModalOpen(false); fetchData(); });
                       }
                    }}
                  >
                     <Trash2 size={16} />
                     <span>Purge Record</span>
                  </button>
                  <button 
                    className="flex-1 py-5 bg-primary-500 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-primary-500/20"
                    onClick={() => {
                        setSelectedDeal({ 
                            customer: selectedLead,
                            title: `Deal with ${selectedLead.name}`,
                            value: selectedLead.estimatedDealValue
                        });
                        setIsDealModalOpen(true);
                        setIsManageLeadModalOpen(false);
                    }}
                  >
                     <ArrowUpRight size={16} />
                     <span>Convert to Deal</span>
                  </button>
               </div>
            </div>
         )}
      </Modal>

      {/* Register Deal Modal */}
      <Modal isOpen={isDealModalOpen} onClose={() => setIsDealModalOpen(false)} title="Negotiate New Opportunity">
         <form onSubmit={handleCreateDeal} className="space-y-6">
            <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Deal Headline</label>
               <input required className="input-field" value={dealForm.title} onChange={(e) => setDealForm({...dealForm, title: e.target.value})} placeholder="Enterprise Licensing - Q3" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Link Lead Matrix</label>
                  <select 
                     required 
                     className="input-field"
                     value={dealForm.customer?._id || dealForm.customer}
                     onChange={(e) => setDealForm({...dealForm, customer: e.target.value})}
                  >
                     <option value="">Select Approved Customer</option>
                     {customers.filter(c => c.isCustomer).map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                     ))}
                  </select>
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Contract Value (INR)</label>
                  <div className="relative">
                     <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                     <input type="number" required className="input-field pl-12" value={dealForm.value} onChange={(e) => setDealForm({...dealForm, value: e.target.value})} />
                  </div>
               </div>
            </div>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic px-1">Inventory Allocation (A/C, Mobile Units)</label>
                    <button 
                      type="button"
                      className="text-primary-500 font-black text-[10px] uppercase flex items-center"
                      onClick={() => setDealForm({...dealForm, items: [...dealForm.items, { material: '', quantity: 1 }]})}
                    >
                      <Plus size={14} className="mr-1" /> Add Allocation
                    </button>
                </div>
                {dealForm.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4 items-end animate-in fade-in duration-300">
                        <div className="col-span-7">
                            <select 
                                className="input-field"
                                value={item.material}
                                onChange={(e) => {
                                    const newItems = [...dealForm.items];
                                    newItems[index].material = e.target.value;
                                    setDealForm({...dealForm, items: newItems});
                                }}
                            >
                                <option value="">Select Item</option>
                                {materials.map(m => (
                                    <option key={m._id} value={m._id}>{m.name} ({m.quantity} in stock)</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-3">
                            <input 
                                type="number" 
                                className="input-field text-center" 
                                value={item.quantity}
                                onChange={(e) => {
                                    const newItems = [...dealForm.items];
                                    newItems[index].quantity = parseInt(e.target.value);
                                    setDealForm({...dealForm, items: newItems});
                                }}
                            />
                        </div>
                        <div className="col-span-2">
                            <button 
                                type="button"
                                onClick={() => setDealForm({...dealForm, items: dealForm.items.filter((_, i) => i !== index)})}
                                className="p-4 text-rose-500 hover:bg-rose-50 rounded-xl"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-5 mt-4 shadow-xl shadow-primary-500/20 font-black uppercase text-xs">
               {isSubmitting ? 'Transmitting Data...' : 'Authorize Opportunity Vector'}
            </button>
         </form>
      </Modal>

      {/* Manage Deal Modal */}
      <Modal isOpen={isManageDealModalOpen} onClose={() => setIsManageDealModalOpen(false)} title="Opportunity Mission Control">
         {selectedDeal && (
            <div className="space-y-8">
               <div className="bg-slate-900 p-8 rounded-[3rem] text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-primary-500/20 transition-all duration-1000"></div>
                  <div className="flex justify-between items-start mb-6">
                     <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        selectedDeal.status === 'Won' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                        selectedDeal.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-white/5 text-white/50 border-white/10'
                     }`}>
                        {selectedDeal.status} Phase
                     </span>
                     <Briefcase className="text-primary-500" size={24} />
                  </div>
                  <h4 className="text-2xl font-black italic mb-1 leading-tight">{selectedDeal.title}</h4>
                  <p className="text-[10px] font-black uppercase text-white/40 tracking-widest italic">Prospect: {selectedDeal.customer?.name}</p>
                  <div className="mt-8 pt-8 border-t border-white/5 space-y-3">
                     <p className="text-4xl font-black text-primary-500 tracking-tighter">₹{selectedDeal.value?.toLocaleString()}</p>
                  </div>
               </div>
               
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1 italic">Transition Pipeline Status</label>
                  <div className="grid grid-cols-4 gap-3">
                     {['Pending', 'Approved', 'Won', 'Lost'].map(status => (
                        <button 
                           key={status}
                           onClick={() => handleUpdateDeal(selectedDeal._id, status)}
                           className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                              selectedDeal.status === status 
                                 ? 'bg-primary-500 text-white border-primary-500 shadow-xl shadow-primary-500/20' 
                                 : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
                           }`}
                        >
                           {status}
                        </button>
                     ))}
                  </div>
               </div>
            </div>
         )}
      </Modal>

      {/* Follow-up Modal */}
      <Modal isOpen={isFollowUpModalOpen} onClose={() => setIsFollowUpModalOpen(false)} title="Establish Outreach Vector">
         <form onSubmit={handleCreateFollowUp} className="space-y-6">
            <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Mission Objective</label>
               <input required className="input-field" value={followUpForm.title} onChange={e => setFollowUpForm({...followUpForm, title: e.target.value})} placeholder="E.g. Finalize AC units quantity" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Target Entity</label>
                  <select required className="input-field" value={followUpForm.lead} onChange={e => setFollowUpForm({...followUpForm, lead: e.target.value})}>
                     <option value="">Choose Prospect</option>
                     {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Protocol Date</label>
                  <input required type="date" className="input-field" value={followUpForm.date} onChange={e => setFollowUpForm({...followUpForm, date: e.target.value})} />
               </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-5 mt-4 shadow-xl shadow-primary-500/20 font-black uppercase text-xs">
                {isSubmitting ? 'Establishing Connection...' : 'Authorize outreach'}
            </button>
         </form>
      </Modal>
    </div>
  );
};

export default CRM;
