import { useState, useEffect } from 'react';
import { 
  Users, Target, DollarSign, TrendingUp, Search, 
  Plus, Phone, Mail, Calendar, ArrowRight, 
  CheckCircle, Clock, Layout, Loader2, Briefcase,
  PieChart, Shield, MoreHorizontal, MessageSquare,
  Award, BarChart3, Star, Filter, ArrowUpRight,
  UserPlus, Zap, History, Bell, IndianRupee, Trash2, Edit, Inbox
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import API from '../utils/api';
import Modal from '../components/Modal';

const CRM = () => {
  const [customers, setCustomers] = useState([]);
  const [deals, setDeals] = useState([]);
  const [stats, setStats] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [pipelineData, setPipelineData] = useState([]);
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isManageLeadModalOpen, setIsManageLeadModalOpen] = useState(false);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [isManageDealModalOpen, setIsManageDealModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [leadForm, setLeadForm] = useState({
    name: '', email: '', phone: '', company: '', status: 'New', source: 'Direct', score: 50
  });

  const [dealForm, setDealForm] = useState({
    title: '', customer: '', value: 0, status: 'Pending'
  });

  const [followUpForm, setFollowUpForm] = useState({
    title: '', date: '', type: 'Call', notes: '', priority: 'Medium', lead: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const [resCust, resDeals, resStats, resFollows, resLead, resPipe] = await Promise.all([
        API.get('/api/crm/customers'),
        API.get('/api/crm/deals'),
        API.get('/api/crm/stats'),
        API.get('/api/crm/followups'),
        API.get('/api/crm/leaderboard'),
        API.get('/api/crm/pipeline')
      ]);
      setCustomers(resCust.data.data);
      setDeals(resDeals.data.data);
      setStats(resStats.data.data);
      setFollowUps(resFollows.data.data);
      setLeaderboard(resLead.data.data);
      setPipelineData(resPipe.data.data);
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
      fetchData();
      setLeadForm({ name: '', email: '', phone: '', company: '', status: 'New', source: 'Direct', score: 50 });
    } catch (error) {
       alert(error.response?.data?.message || 'Error creating lead');
    } finally {
       setIsSubmitting(false);
    }
  };

  const handleUpdateLead = async (leadId, updateData) => {
    try {
      await API.put(`/api/crm/customers/${leadId}`, updateData);
      setIsManageLeadModalOpen(false);
      fetchData();
    } catch (error) {
      alert('Error updating lead');
    }
  };

  const handleCreateDeal = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await API.post('/api/crm/deals', dealForm);
      setIsDealModalOpen(false);
      fetchData();
      setDealForm({ title: '', customer: '', value: 0, status: 'Pending' });
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

  const handleCreateFollowUp = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await API.post('/api/crm/followups', followUpForm);
      setIsFollowUpModalOpen(false);
      fetchData();
      setFollowUpForm({ title: '', date: '', type: 'Call', notes: '', priority: 'Medium', lead: '' });
    } catch (err) {
      alert('Failed to schedule follow-up');
    } finally {
      setIsSubmitting(false);
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
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
           <div className="flex items-center space-x-3 mb-2">
              <Zap className="text-primary-500 fill-primary-500" size={16} md:size={20} />
              <span className="text-primary-500 font-black uppercase text-[8px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em]">Sales Engine Pro</span>
           </div>
           <h1 className="text-2xl md:text-4xl font-black text-slate-900 italic tracking-tight">CRM Command Center</h1>
           <p className="text-slate-500 font-medium mt-1 text-xs md:text-sm">Intelligence-driven acquisition and pipeline optimization.</p>
        </div>
        <div className="flex bg-white p-1 md:p-2 rounded-[1rem] md:rounded-[1.5rem] shadow-sm border border-slate-100 italic overflow-x-auto scrollbar-hide w-full xl:w-auto">
           {['Overview', 'Leads', 'Pipeline', 'Follow-ups', 'Performance'].map(tab => (
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
           <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs italic">Syncing CRM Neural Grid...</p>
        </div>
      ) : activeTab === 'Overview' && stats ? (
        <div className="space-y-8">
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[
                { label: 'Total Leads', val: stats.totalLeads, icon: Target, color: 'text-blue-500', bg: 'bg-blue-50' },
                { label: 'Active Deals', val: stats.activeDeals, icon: Briefcase, color: 'text-amber-500', bg: 'bg-amber-50' },
                { label: 'Revenue Expected', val: `₹${((stats.revenueExpected || 0)/1000).toFixed(1)}K`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                { label: 'Follow-ups', val: stats.followUpsToday, icon: Clock, color: 'text-indigo-500', bg: 'bg-indigo-50' },
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
                    <h3 className="text-xl font-black italic flex items-center"><TrendingUp className="mr-3 text-primary-500" /> Revenue Velocity</h3>
                    <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full">+12.5% vs Last Period</span>
                 </div>
                 <div className="h-80">
                    <Line 
                      data={{
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                        datasets: [{
                          label: 'Revenue',
                          data: [32000, 45000, 42000, 58000, 65000, 72000],
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
                    <Award className="mr-3 text-primary-500" /> Top Performers
                 </h3>
                 <div className="space-y-8 relative z-10">
                    {leaderboard.slice(0, 4).map((p, i) => (
                       <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black italic border ${
                                i === 0 ? 'bg-primary-500 border-primary-500 text-white' : 'bg-white/5 border-white/10 text-white/50'
                             }`}>
                                {i+1}
                             </div>
                             <div>
                                <p className="font-extrabold text-sm tracking-wide">{p.name}</p>
                                <p className="text-[9px] text-white/40 font-black uppercase tracking-widest mt-0.5">Won: {p.deals} Deals</p>
                             </div>
                          </div>
                          <p className="text-primary-500 font-black italic text-sm">₹{(p.revenue/1000).toFixed(1)}k</p>
                       </div>
                    ))}
                    {leaderboard.length === 0 && <p className="text-white/20 font-black uppercase text-[10px] tracking-widest italic text-center py-10">No conversion data yet.</p>}
                 </div>
                 <button 
                   onClick={() => setActiveTab('Performance')}
                   className="w-full mt-12 py-5 bg-white/5 hover:bg-primary-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 flex items-center justify-center space-x-3 group"
                 >
                    <span>Full Leaderboard</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                 </button>
              </div>
           </div>
        </div>
      ) : activeTab === 'Leads' ? (
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
           <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center bg-slate-50/20 gap-6">
              <div className="relative w-full md:w-96">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                 <input 
                    className="input-field pl-12" 
                    placeholder="Search leads by company or name..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
              <div className="flex space-x-4 w-full md:w-auto">
                 <button className="flex-1 md:flex-none p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-primary-500 transition-all border border-slate-100"><Filter size={20} /></button>
                 <button 
                   onClick={() => setIsLeadModalOpen(true)}
                   className="flex-1 md:flex-none btn-primary flex items-center justify-center space-x-3 px-8"
                 >
                    <UserPlus size={20} />
                    <span className="whitespace-nowrap">Capture Lead</span>
                 </button>
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                    <tr>
                       <th className="px-8 py-6 italic">Prospect Entity</th>
                       <th className="px-8 py-6 italic">Lead Score</th>
                       <th className="px-8 py-6 italic">Source</th>
                       <th className="px-8 py-6 italic">Pipeline Stage</th>
                       <th className="px-8 py-6 text-right italic">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {filteredLeads.map(c => (
                       <tr key={c._id} className="hover:bg-slate-50/50 group transition-all italic">
                          <td className="px-8 py-6">
                             <div className="flex items-center space-x-4">
                                <div className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-100 text-primary-500 flex items-center justify-center font-black text-xl shadow-sm group-hover:bg-primary-500 group-hover:text-white group-hover:border-primary-500 transition-all duration-500">
                                   {c.name.charAt(0)}
                                </div>
                                <div>
                                   <p className="font-black text-slate-900 leading-tight tracking-tight text-lg">{c.name}</p>
                                   <p className="text-[10px] text-slate-400 font-bold not-italic mt-0.5 uppercase tracking-widest">{c.company || 'Private Portfolio'}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center space-x-2">
                                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                   <div className={`h-full rounded-full ${c.score > 70 ? 'bg-emerald-500' : c.score > 40 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${c.score || 50}%` }}></div>
                                </div>
                                <span className="text-[10px] font-black text-slate-400">{c.score || 50}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <span className="text-[10px] font-black uppercase text-slate-400 px-3 py-1 bg-slate-50 rounded-lg">{c.source || 'Direct'}</span>
                          </td>
                          <td className="px-8 py-6">
                             <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                ['Converted', 'Qualified'].includes(c.status) ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                ['Negotiation', 'Prospect'].includes(c.status) ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                'bg-primary-50 text-primary-500 border-primary-100'
                             }`}>
                                {c.status}
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
                 <h3 className="text-2xl font-black italic tracking-tight">Deal Pipeline Board</h3>
                 <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Movement of capital through sales vectors</p>
              </div>
              <button onClick={() => setIsDealModalOpen(true)} className="btn-primary px-8 py-4 flex items-center space-x-3">
                 <Plus size={20} />
                 <span>New Opportunity</span>
              </button>
           </div>
           
           <div className="flex space-x-6 overflow-x-auto pb-8 scrollbar-hide">
              {['Pending', 'Approved', 'Won', 'Lost'].map(stage => (
                 <div key={stage} className="flex-shrink-0 w-80 bg-slate-50/50 rounded-[2.5rem] p-4 border border-dashed border-slate-200">
                    <div className="flex items-center justify-between mb-6 px-4 py-2 bg-white rounded-2xl shadow-sm border border-slate-100">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">{stage} Matrix</span>
                       <span className="w-6 h-6 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] font-black">
                          {deals.filter(d => d.status === stage).length}
                       </span>
                    </div>
                    
                    <div className="space-y-4">
                       {deals.filter(d => d.status === stage).map(deal => (
                          <div key={deal._id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-16 h-1 bg-primary-500 opacity-20"></div>
                             <h4 className="text-sm font-black text-slate-900 italic leading-tight mb-2 pr-6">{deal.title}</h4>
                             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-6">Client: {deal.customer?.name}</p>
                             
                             <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                                <span className="text-lg font-black text-slate-900">₹{(deal.value/1000).toFixed(0)}k</span>
                                <button 
                                   onClick={() => { setSelectedDeal(deal); setIsManageDealModalOpen(true); }}
                                   className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
                                >
                                   <ArrowRight size={14} />
                                </button>
                             </div>
                          </div>
                       ))}
                       {deals.filter(d => d.status === stage).length === 0 && (
                          <div className="py-20 flex flex-col items-center justify-center text-slate-200">
                             <Inbox size={32} strokeWidth={1} />
                             <p className="text-[9px] font-black uppercase mt-4">Empty Vector</p>
                          </div>
                       )}
                    </div>
                 </div>
              ))}
           </div>
        </div>
      ) : activeTab === 'Follow-ups' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           <div className="lg:col-span-1 space-y-6">
              <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl">
                 <h4 className="text-lg font-black italic mb-6">Task Actions</h4>
                 <button 
                   onClick={() => setIsFollowUpModalOpen(true)}
                   className="w-full btn-primary py-4 mb-4 flex items-center justify-center space-x-3"
                 >
                    <Calendar size={18} />
                    <span>Log Activity</span>
                 </button>
                 <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all">Export Task List</button>
              </div>
              
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                 <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6 italic">Risk Indicators</h4>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-bold">
                       <span className="text-slate-500 italic">High Priority</span>
                       <span className="text-rose-500 font-black">{followUps.filter(f => f.priority === 'High' && f.status === 'Pending').length}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold">
                       <span className="text-slate-500 italic">Due Today</span>
                       <span className="text-amber-500 font-black">{followUps.filter(f => f.status === 'Pending').length}</span>
                    </div>
                 </div>
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
                       <button className="px-6 py-3 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-600 transition-all flex items-center">
                          <CheckCircle size={14} className="mr-2" /> Done
                       </button>
                    </div>
                 </div>
              ))}
              {followUps.length === 0 && (
                <div className="py-40 bg-white rounded-[4rem] border border-dashed border-slate-100 flex flex-col items-center justify-center">
                   <Zap size={64} className="text-slate-50 mb-6" strokeWidth={1} />
                   <p className="text-slate-300 font-black uppercase text-xs italic tracking-[0.3em]">No pending outreach vectors detected.</p>
                </div>
              )}
           </div>
        </div>
      ) : activeTab === 'Performance' ? (
        <div className="space-y-8">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
                 <h3 className="text-xl font-black italic mb-10 flex items-center"><PieChart className="mr-3 text-primary-500" /> Pipeline Funnel</h3>
                 <div className="h-80 flex items-center justify-center">
                    <Doughnut data={pipelineChartData} options={{ maintainAspectRatio: false, cutout: '75%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, font: { weight: 'bold' } } } } }} />
                 </div>
              </div>
              <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
                 <h3 className="text-xl font-black italic mb-10 flex items-center"><BarChart3 className="mr-3 text-primary-500" /> Lead Conversion Mix</h3>
                 <div className="h-80">
                    <Bar 
                      data={{
                        labels: ['New', 'Contacted', 'Qualified', 'Negotiation', 'Won'],
                        datasets: [{
                          data: [stats.totalLeads, 12, 8, 5, leaderboard.reduce((acc, curr) => acc + curr.deals, 0)],
                          backgroundColor: '#0ea5e9',
                          borderRadius: 12,
                        }]
                      }}
                      options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { grid: { display: false } } } }}
                    />
                 </div>
              </div>
           </div>

           <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px]"></div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 relative z-10">
                 <div>
                    <h3 className="text-3xl font-black italic tracking-tighter">Leaderboard Matrix</h3>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-2">Historical conversion performance by agent</p>
                 </div>
                 <div className="flex bg-white/5 p-2 rounded-2xl border border-white/5">
                    <button className="px-6 py-2 bg-primary-500 text-white rounded-xl text-[10px] font-black uppercase">This Month</button>
                    <button className="px-6 py-2 text-white/40 rounded-xl text-[10px] font-black uppercase">All Time</button>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                 {leaderboard.map((agent, i) => (
                    <div key={i} className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-all group">
                       <div className="flex justify-between items-start mb-6">
                          <div className="w-16 h-16 rounded-[2rem] bg-white border-2 border-primary-500 overflow-hidden">
                             <img src={`https://ui-avatars.com/api/?name=${agent.name}&background=0ea5e9&color=fff`} alt={agent.name} />
                          </div>
                          <span className="text-[2rem] font-black text-white/5 italic group-hover:text-primary-500 transition-colors">#{i+1}</span>
                       </div>
                       <h4 className="text-xl font-black italic mb-1">{agent.name}</h4>
                       <p className="text-primary-500 font-black uppercase text-[10px] tracking-widest mb-8">Agent Level 0{4-i}</p>
                       
                       <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                          <div>
                             <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Revenue</p>
                             <p className="text-lg font-black italic">₹{(agent.revenue/1000).toFixed(1)}k</p>
                          </div>
                          <div>
                             <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Efficiency</p>
                             <p className="text-lg font-black italic">94%</p>
                          </div>
                       </div>
                    </div>
                 ))}
                 {leaderboard.length === 0 && <p className="col-span-full py-20 text-center text-white/10 font-black uppercase text-xs tracking-widest italic border border-dashed border-white/10 rounded-[3rem]">Awaiting conversion metrics...</p>}
              </div>
           </div>
        </div>
      ) : null}

      {/* Capture Lead Modal */}
      <Modal isOpen={isLeadModalOpen} onClose={() => setIsLeadModalOpen(false)} title="Capture Sales Prospect">
         <form onSubmit={handleCreateLead} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Lead Identity</label>
                  <input required className="input-field" value={leadForm.name} onChange={(e) => setLeadForm({...leadForm, name: e.target.value})} placeholder="Alex Johnson" />
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Corporate Entity</label>
                  <input className="input-field" value={leadForm.company} onChange={(e) => setLeadForm({...leadForm, company: e.target.value})} placeholder="NexGen Tech" />
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Communication Hub (Email)</label>
                  <input required type="email" className="input-field" value={leadForm.email} onChange={(e) => setLeadForm({...leadForm, email: e.target.value})} placeholder="alex@nexgen.com" />
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Direct Line</label>
                  <input className="input-field" value={leadForm.phone} onChange={(e) => setLeadForm({...leadForm, phone: e.target.value})} placeholder="+91 98765 43210" />
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Source Vector</label>
                  <select className="input-field" value={leadForm.source} onChange={e => setLeadForm({...leadForm, source: e.target.value})}>
                     <option>Direct</option>
                     <option>Social Media</option>
                     <option>Referral</option>
                     <option>Event</option>
                     <option>Cold Call</option>
                  </select>
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Initial Score</label>
                  <input type="number" className="input-field" value={leadForm.score} onChange={e => setLeadForm({...leadForm, score: e.target.value})} />
               </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-5 mt-4 shadow-xl shadow-primary-500/20">
               {isSubmitting ? 'Establishing Protocol...' : 'Activate Lead Profile'}
            </button>
         </form>
      </Modal>

      {/* Log FollowUp Modal */}
      <Modal isOpen={isFollowUpModalOpen} onClose={() => setIsFollowUpModalOpen(false)} title="Log Outreach Vector">
         <form onSubmit={handleCreateFollowUp} className="space-y-6">
            <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Task Headline</label>
               <input required className="input-field" value={followUpForm.title} onChange={e => setFollowUpForm({...followUpForm, title: e.target.value})} placeholder="Final Negotiation Call" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Target Prospect</label>
                  <select required className="input-field" value={followUpForm.lead} onChange={e => setFollowUpForm({...followUpForm, lead: e.target.value})}>
                     <option value="">Select Lead</option>
                     {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Execution Date</label>
                  <input required type="date" className="input-field" value={followUpForm.date} onChange={e => setFollowUpForm({...followUpForm, date: e.target.value})} />
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Medium</label>
                  <select className="input-field" value={followUpForm.type} onChange={e => setFollowUpForm({...followUpForm, type: e.target.value})}>
                     <option>Call</option>
                     <option>Meeting</option>
                     <option>Email</option>
                     <option>Other</option>
                  </select>
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Priority Matrix</label>
                  <select className="input-field" value={followUpForm.priority} onChange={e => setFollowUpForm({...followUpForm, priority: e.target.value})}>
                     <option>Low</option>
                     <option>Medium</option>
                     <option>High</option>
                  </select>
               </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-5 mt-4">
               {isSubmitting ? 'Logging Task...' : 'Establish Task Vector'}
            </button>
         </form>
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
                     value={dealForm.customer}
                     onChange={(e) => setDealForm({...dealForm, customer: e.target.value})}
                  >
                     <option value="">Select Lead</option>
                     {customers.map(c => (
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
            <p className="text-[10px] font-bold text-slate-400 italic px-2">Note: All new opportunities require administrative authorization before final execution.</p>
            <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-5 mt-4 shadow-xl shadow-primary-500/20">
               {isSubmitting ? 'Submitting for Review...' : 'Establish Opportunity Vector'}
            </button>
         </form>
      </Modal>

      {/* Manage Deal Modal */}
      <Modal isOpen={isManageDealModalOpen} onClose={() => setIsManageDealModalOpen(false)} title="Opportunity Command">
         {selectedDeal && (
            <div className="space-y-8">
               <div className="bg-slate-900 p-8 rounded-[3rem] text-white">
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
                  <div className="mt-8 pt-8 border-t border-white/5">
                     <p className="text-4xl font-black text-primary-500">₹{selectedDeal.value.toLocaleString()}</p>
                  </div>
               </div>
               
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1 italic">Transition Pipeline Status</label>
                  <div className="grid grid-cols-5 gap-3">
                     {['Pending', 'Approved', 'Won', 'Lost'].map(status => (
                        <button 
                           key={status}
                           disabled={
                              (status === 'Won' || status === 'Lost') && selectedDeal.status !== 'Approved' && selectedDeal.status !== 'Won' && selectedDeal.status !== 'Lost'
                           }
                           onClick={() => handleUpdateDeal(selectedDeal._id, status)}
                           className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                              selectedDeal.status === status 
                                 ? 'bg-primary-500 text-white border-primary-500 shadow-xl shadow-primary-500/20' 
                                 : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed'
                           }`}
                        >
                           {status}
                        </button>
                     ))}
                  </div>
                  {selectedDeal.status === 'Pending' && <p className="text-[9px] text-amber-500 font-bold mt-4 italic">* Awaiting Admin Authorization to unlock Won/Lost capability.</p>}
                  {selectedDeal.status === 'Approved' && <p className="text-[9px] text-emerald-500 font-bold mt-4 italic">* Deal Approved! You can now move this to Won to recognize revenue.</p>}
               </div>

               <div className="pt-6 border-t border-slate-100 flex gap-4">
                  <button 
                    className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:text-rose-500 transition-all flex items-center justify-center space-x-2"
                    onClick={() => {
                       if(window.confirm('Delete this deal record?')) {
                          API.delete(`/api/crm/deals/${selectedDeal._id}`).then(() => { setIsManageDealModalOpen(false); fetchData(); });
                       }
                    }}
                  >
                     <Trash2 size={16} />
                     <span>Remove Record</span>
                  </button>
               </div>
            </div>
         )}
      </Modal>

      {/* Manage Lead Modal */}
      <Modal isOpen={isManageLeadModalOpen} onClose={() => setIsManageLeadModalOpen(false)} title="Lead Command">
         {selectedLead && (
            <div className="space-y-8">
               <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5"><Target size={80} /></div>
                  <h4 className="text-2xl font-black text-slate-900 italic mb-1">{selectedLead.name}</h4>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic mb-6">{selectedLead.company || 'Individual Client'}</p>
                  
                  <div className="flex items-center space-x-4">
                     <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">Score: {selectedLead.score}%</span>
                     <span className="text-[10px] font-black text-slate-400 bg-white px-4 py-1.5 rounded-full border border-slate-100">{selectedLead.source}</span>
                  </div>
               </div>
               
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1 italic">Transition Pipeline Stage</label>
                  <div className="grid grid-cols-3 gap-3">
                     {['New', 'Qualified', 'Converted'].map(status => (
                        <button 
                           key={status}
                           onClick={() => handleUpdateLead(selectedLead._id, { status, isCustomer: status === 'Converted' })}
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

               <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                  <button className="py-5 bg-white border border-slate-100 text-slate-500 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:border-primary-500 hover:text-primary-500 transition-all flex items-center justify-center space-x-2">
                     <Edit size={16} />
                     <span>Edit Intel</span>
                  </button>
                  <button 
                    className="py-5 bg-rose-50 text-rose-500 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center justify-center space-x-2"
                    onClick={() => {
                       if(window.confirm('Remove lead record?')) {
                          API.delete(`/api/crm/customers/${selectedLead._id}`).then(() => { setIsManageLeadModalOpen(false); fetchData(); });
                       }
                    }}
                  >
                     <Trash2 size={16} />
                     <span>Purge Record</span>
                  </button>
               </div>
            </div>
         )}
      </Modal>
    </div>
  );
};

export default CRM;
