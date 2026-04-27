import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Package, Users, TrendingUp, AlertTriangle, ArrowUpRight, 
  Clock, Calendar, CheckCircle, Bell, Activity, ShieldCheck,
  Layers, UserCheck, Timer, LogOut, CheckCircle2, ListTodo,
  FileText, ExternalLink, ArrowRight, Briefcase, DollarSign,
  UserPlus, UserMinus, HardHat, Zap, Download, Target, PieChart,
  BarChart3, MessageSquare, Star, ShoppingCart, IndianRupee,
  Award, Trophy, Phone
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import API from '../utils/api';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import KanbanBoard from '../components/KanbanBoard';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [extraData, setExtraData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isClocking, setIsClocking] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const [employees, setEmployees] = useState([]);
  const [attendanceTrends, setAttendanceTrends] = useState({ days: [], counts: [] });
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setError(null);
    try {
      if (user?.role === 'Admin') {
        const [statsRes, empRes, trendRes] = await Promise.all([
          API.get('/api/admin/stats'),
          API.get('/api/hrms/employees'),
          API.get('/api/hrms/attendance/trends')
        ]);
        setStats(statsRes.data.data);
        setEmployees(empRes.data.data);
        setAttendanceTrends(trendRes.data.data);
      } else if (user?.role === 'Manager') {
        const [statsRes, taskRes, empRes] = await Promise.all([
          API.get('/api/manager/stats'),
          API.get('/api/tasks/my'),
          API.get('/api/hrms/employees')
        ]);
        setStats(statsRes.data.data);
        setExtraData(taskRes.data.data);
        setEmployees(empRes.data.data);
      } else if (user?.role === 'HR') {
        const [statsRes, empRes, trendRes] = await Promise.all([
          API.get('/api/hrms/stats'),
          API.get('/api/hrms/employees'),
          API.get('/api/hrms/attendance/trends')
        ]);
        setStats(statsRes.data.data);
        setEmployees(empRes.data.data);
        setAttendanceTrends(trendRes.data.data);
      } else if (user?.role === 'Sales Team') {
        const [crmRes, dealsRes, followRes] = await Promise.all([
          API.get('/api/crm/stats'),
          API.get('/api/crm/deals'),
          API.get('/api/crm/followups')
        ]);
        setStats(crmRes.data.data);
        setExtraData({
          deals: dealsRes.data.data,
          followups: followRes.data.data
        });
      } else {
        const [attRes, taskRes, materialRes] = await Promise.all([
          API.get('/api/attendance/my'),
          API.get('/api/tasks/my'),
          API.get('/api/materials').catch(() => ({ data: { data: [] } }))
        ]);
        const today = new Date().toISOString().split('T')[0];
        const attData = attRes.data?.data || [];
        const taskData = taskRes.data?.data || [];
        
        setStats({
           attendance: attData.find(r => r.date === today),
           allAttendance: attData,
           taskCounts: {
              pending: taskData.filter(t => t.status === 'To Do').length,
              completed: taskData.filter(t => t.status === 'Completed').length,
              total: taskData.length
           }
        });
        setExtraData(taskData);
        setAssets(materialRes.data.data || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Dashboard Sync Error:', error);
      setError('Connection failure. Please ensure the backend server is operational.');
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setIsClocking(true);
    try {
      await API.post('/api/attendance/checkin');
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || 'Check-in failed');
    } finally {
      setIsClocking(false);
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await API.put(`/api/tasks/${taskId}`, { status: newStatus });
      fetchDashboardData();
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  if (loading) return (
     <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Synchronizing Matrix...</p>
     </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
       <div className="bg-rose-50 p-8 rounded-[3rem] border border-rose-100 max-w-md">
          <AlertTriangle size={48} className="text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-900 mb-2 italic">Sync Error</h2>
          <p className="text-slate-500 text-sm font-medium mb-6">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all"
          >
            Retry Connection
          </button>
       </div>
    </div>
  );

  if (!stats) return null;

  // --- SALES TEAM VIEW (Professional CRM Dashboard) ---
  if (user?.role === 'Sales Team') {
     const revenueProgress = Math.min((((stats?.revenueGenerated || 0) / (stats?.target || 1000000)) * 100).toFixed(0), 100);
     
     return (
        <div className="space-y-8 animate-in fade-in duration-700">
           {/* Professional CRM Greeting */}
           <div className="bg-slate-900 p-8 md:p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[100px] -mr-32 -mt-32 transition-all duration-1000 group-hover:scale-150"></div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                 <div>
                    <div className="flex items-center space-x-3 mb-4">
                       <span className="px-4 py-1.5 bg-primary-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-primary-500/20 italic">Sales Intelligence v4.0</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter leading-tight">Welcome back, {user.name.split(' ')[0]}</h1>
                    <p className="text-white/50 font-bold uppercase text-[10px] tracking-[0.3em] mt-3 flex items-center">
                       <TrendingUp size={14} className="mr-2 text-primary-500" /> Revenue Mission Control / {format(new Date(), 'MMMM d, yyyy')}
                    </p>
                 </div>
                 <div className="flex bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-[2.5rem] gap-8">
                    <div className="text-center">
                       <p className="text-[9px] font-black uppercase text-white/40 tracking-widest mb-1 italic">Conversion Rate</p>
                       <h4 className="text-3xl font-black italic tracking-tighter text-emerald-400">{stats?.conversionRate || 0}%</h4>
                    </div>
                    <div className="w-px bg-white/10 h-10 self-center"></div>
                    <div className="text-center">
                       <p className="text-[9px] font-black uppercase text-white/40 tracking-widest mb-1 italic">Monthly Yield</p>
                       <h4 className="text-3xl font-black italic tracking-tighter text-primary-500">₹{((stats?.revenueGenerated || 0)/1000).toFixed(0)}k</h4>
                    </div>
                 </div>
              </div>
           </div>

           {/* Summary KPI Matrix */}
           <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {[
                { label: 'Total Leads', val: stats?.totalLeads || 0, icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-50' },
                { label: 'Qualified Prospects', val: stats?.prospects || 0, icon: Target, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                { label: 'Active Pipeline', val: stats?.activeDeals || 0, icon: Briefcase, color: 'text-amber-500', bg: 'bg-amber-50' },
                { label: 'Deals Won', val: stats?.wonDeals || 0, icon: Trophy, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                { label: 'Pipeline Value', val: `₹${((stats?.pipelineValue || 0)/1000).toFixed(0)}k`, icon: IndianRupee, color: 'text-primary-500', bg: 'bg-primary-50' },
              ].map((s, i) => (
                <div key={i} className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
                   <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:rotate-6`}>
                      {s.icon === Trophy ? <Award size={22} /> : <s.icon size={22} />}
                   </div>
                   <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest italic">{s.label}</p>
                   <h3 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">{s.val}</h3>
                </div>
              ))}
           </div>

           {/* Analytics Row */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-10 rounded-[4rem] shadow-sm border border-slate-100">
                 <div className="flex items-center justify-between mb-10">
                    <h3 className="text-xl font-black italic flex items-center"><BarChart3 className="mr-3 text-primary-500" /> Revenue Stream Overview</h3>
                    <div className="flex items-center space-x-2">
                       <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                       <span className="text-[10px] font-black uppercase text-slate-400 italic">Yield Progression</span>
                    </div>
                 </div>
                 <div className="h-80">
                    <Bar 
                       data={{
                          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                          datasets: [{
                             label: 'Revenue',
                             data: [(stats?.revenueGenerated || 0) * 0.2, (stats?.revenueGenerated || 0) * 0.5, (stats?.revenueGenerated || 0) * 0.8, (stats?.revenueGenerated || 0)],
                             backgroundColor: '#ff6d2e',
                             borderRadius: 12,
                             barThickness: 40
                          }]
                       }}
                       options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { display: false } },
                          scales: { y: { display: false }, x: { grid: { display: false } } }
                       }}
                    />
                 </div>
              </div>

              <div className="bg-white p-10 rounded-[4rem] shadow-sm border border-slate-100 flex flex-col items-center">
                 <h3 className="text-xl font-black italic mb-10 w-full text-left"><PieChart className="mr-3 text-primary-500 inline" /> Lead Funnel</h3>
                 <div className="h-64 w-full relative">
                    <Doughnut 
                       data={{
                          labels: ['Leads', 'Prospects', 'Deals'],
                          datasets: [{
                             data: [stats?.totalLeads || 0, stats?.prospects || 0, stats?.activeDeals || 0],
                             backgroundColor: ['#0ea5e9', '#6366f1', '#ff6d2e'],
                             borderWidth: 0,
                             cutout: '80%'
                          }]
                       }}
                       options={{ 
                          maintainAspectRatio: false, 
                          plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { weight: 'bold' } } } } 
                       }}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-6">
                       <span className="text-3xl font-black text-slate-900">{(stats?.totalLeads || 0) + (stats?.prospects || 0) + (stats?.activeDeals || 0)}</span>
                       <span className="text-[8px] font-black uppercase text-slate-400 tracking-[0.2em]">Active Matrix</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Operational Table & Widgets */}
           <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 bg-white p-10 rounded-[4rem] shadow-sm border border-slate-100">
                 <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black italic flex items-center"><Zap className="mr-3 text-primary-500" /> Recent Opportunity Log</h3>
                    <Link to="/crm" className="text-[10px] font-black text-primary-500 uppercase tracking-widest hover:underline">Full Pipeline</Link>
                 </div>
                 <div className="space-y-4">
                    {extraData.deals?.slice(0, 5).map(deal => (
                       <div key={deal._id} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[2.5rem] border border-white hover:border-slate-100 transition-all group">
                          <div className="flex items-center space-x-5">
                             <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 text-primary-500 flex items-center justify-center font-black italic shadow-sm group-hover:bg-primary-500 group-hover:text-white transition-all">
                                {deal.title.charAt(0)}
                             </div>
                             <div>
                                <p className="font-black text-slate-900 text-sm italic">{deal.title}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{deal.customer?.name} • {deal.status}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="font-black text-slate-900 italic">₹{((deal.value || 0)/1000).toFixed(0)}k</p>
                             <span className="text-[8px] font-black uppercase text-primary-500 tracking-widest">Revenue Potential</span>
                          </div>
                       </div>
                    ))}
                    {extraData.deals?.length === 0 && <p className="text-center py-10 text-slate-400 font-black italic text-xs uppercase tracking-widest">Awaiting deal telemetry.</p>}
                 </div>
              </div>

              <div className="space-y-8">
                 {/* Follow-up Widget */}
                 <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl group-hover:scale-150 transition-all duration-1000"></div>
                    <div className="flex justify-between items-center mb-8 relative z-10">
                       <h3 className="text-lg font-black italic uppercase tracking-tighter">Strategic Outreach</h3>
                       <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-primary-500 font-black">{stats?.followUpsToday || 0}</div>
                    </div>
                    <div className="space-y-4 relative z-10">
                       {extraData.followups?.filter(f => f.status === 'Pending').slice(0, 3).map(follow => (
                          <div key={follow._id} className="p-5 bg-white/5 hover:bg-white/10 rounded-[2rem] border border-white/5 transition-all">
                             <div className="flex items-center space-x-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${follow.type === 'Call' ? 'bg-blue-500/20 text-blue-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                                   {follow.type === 'Call' ? <Phone size={18} /> : <Users size={18} />}
                                </div>
                                <div>
                                   <p className="text-xs font-black italic">{follow.title}</p>
                                   <p className="text-[9px] font-black uppercase text-white/30 tracking-widest mt-1">Lead: {follow.lead?.name || 'N/A'}</p>
                                </div>
                             </div>
                          </div>
                       ))}
                       {extraData.followups?.length === 0 && <p className="text-white/20 font-black uppercase text-[9px] tracking-widest italic text-center py-6">No pending outreach missions.</p>}
                    </div>
                 </div>

                 {/* Target Progress Widget */}
                 <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                       <h3 className="text-lg font-black italic uppercase tracking-tighter">Yield Target</h3>
                       <Target className="text-primary-500" size={20} />
                    </div>
                    <div className="space-y-6">
                       <div className="flex justify-between items-end">
                          <div>
                             <p className="text-4xl font-black italic text-slate-900">{revenueProgress}%</p>
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Of ₹{(stats.target/1000).toFixed(0)}k Objective</p>
                          </div>
                          <TrendingUp className="text-emerald-500 mb-2" size={24} />
                       </div>
                       <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                          <div className="h-full bg-primary-500 shadow-lg shadow-primary-500/50 transition-all duration-1000" style={{ width: `${revenueProgress}%` }}></div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
     );
  }

  // --- ADMIN VIEW ---
  if (user?.role === 'Admin' && stats) {
     return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 p-10 rounded-[3.5rem] text-white gap-6">
              <div>
                 <h1 className="text-4xl font-black italic">System Oversight</h1>
                 <p className="text-white/50 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Global Master Dashboard</p>
              </div>
              <div className="flex flex-wrap gap-4">
                 <a href={`${API.defaults.baseURL}/api/reports/inventory`} target="_blank" rel="noreferrer" className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border border-white/10 flex items-center">
                    <Download size={14} className="mr-2" /> Inventory
                 </a>
                 <a href={`${API.defaults.baseURL}/api/reports/sales`} target="_blank" rel="noreferrer" className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border border-white/10 flex items-center">
                    <Download size={14} className="mr-2" /> Sales
                 </a>
                 <a href={`${API.defaults.baseURL}/api/reports/procurement`} target="_blank" rel="noreferrer" className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border border-white/10 flex items-center">
                    <Download size={14} className="mr-2" /> Procurement
                 </a>
              </div>
              <ShieldCheck size={48} className="text-primary-500 hidden xl:block" />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                 { label: 'Global Identities', val: stats.totalUsers, icon: Users, color: 'primary' },
                 { label: 'Pending Leaves', val: stats.pendingLeaves, icon: Calendar, color: 'emerald' },
                 { label: 'Material Exhaustion', val: stats.lowStockMaterials, icon: AlertTriangle, color: 'rose' },
                 { label: 'Operational Vectors', val: stats.totalTasks, icon: Layers, color: 'amber' },
              ].map((s, i) => (
                 <div key={i} className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 group hover:-translate-y-1 transition-all">
                    <div className="w-12 h-12 bg-slate-50 text-primary-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                       <s.icon size={22} />
                    </div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic">{s.label}</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">{s.val}</h3>
                 </div>
              ))}
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 bg-white p-10 rounded-[4rem] shadow-sm border border-slate-100">
                  <h3 className="text-xl font-black italic flex items-center mb-10"><Zap className="mr-3 text-primary-500" /> Operational Engagement</h3>
                  <div className="h-80">
                     <Line 
                       data={{
                         labels: attendanceTrends.days,
                         datasets: [{
                           label: 'Activity',
                           data: attendanceTrends.counts,
                           borderColor: '#0ea5e9',
                           backgroundColor: 'rgba(14, 165, 233, 0.1)',
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
                  </div>
               </div>
              <div className="bg-white p-10 rounded-[4rem] shadow-sm border border-slate-100">
                 <h3 className="text-xl font-black italic mb-8">Recent Security Logs</h3>
                 <div className="space-y-6">
                    {stats.recentLogs?.slice(0, 5).map(log => (
                       <div key={log._id} className="flex space-x-4 border-l-4 border-primary-500 pl-4">
                          <div>
                             <p className="text-xs font-bold text-slate-700">{log.details}</p>
                             <p className="text-[9px] text-slate-400 font-black uppercase mt-1">{format(new Date(log.createdAt), 'HH:mm - MMM d')}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
     );
  }

  // --- MANAGER VIEW ---
  if (user?.role === 'Manager' && stats) {
     return (
        <div className="space-y-8 animate-in fade-in duration-500">
           <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                 <h1 className="text-4xl font-black text-slate-900 italic">Department Hub</h1>
                 <p className="text-slate-500 font-medium mt-1">Operational command for team leads and managers.</p>
              </div>
              <div className="bg-primary-500 px-8 py-4 rounded-[2rem] text-white shadow-xl shadow-primary-500/20">
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Team Strength</p>
                 <h2 className="text-2xl font-black">{stats.teamCount} Active Personnel</h2>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                 { label: 'Active Missions', val: stats.totalTasks, icon: Layers, color: 'primary' },
                 { label: 'Leave Auth', val: stats.pendingLeaves, icon: Calendar, color: 'emerald', link: '/leaves' },
                 { label: 'Material Auth', val: stats.pendingMaterials, icon: Package, color: 'amber', link: '/materials' },
                 { label: 'Yield Rate', val: '94%', icon: TrendingUp, color: 'rose' },
              ].map((s, i) => (
                 <Link key={i} to={s.link || '#'} className={`bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 transition-all ${s.link ? 'hover:border-primary-500 cursor-pointer' : ''}`}>
                    <div className="flex justify-between items-start mb-6">
                       <div className="w-12 h-12 bg-slate-50 text-primary-500 rounded-2xl flex items-center justify-center">
                          <s.icon size={22} />
                       </div>
                       {s.link && <ArrowUpRight size={18} className="text-slate-300" />}
                    </div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic">{s.label}</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">{s.val}</h3>
                 </Link>
              ))}
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-10 rounded-[4rem] shadow-sm border border-slate-100 shadow-xl overflow-hidden">
                 <div className="flex justify-between items-center mb-10">
                    <h3 className="text-xl font-black italic">Recent Tactical Missions</h3>
                    <Link to="/tasks" className="text-xs font-black text-primary-500 uppercase hover:underline">Full Grid</Link>
                 </div>
                 <div className="space-y-4">
                    {extraData.slice(0, 5).map(task => (
                       <div key={task._id} className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-white hover:border-slate-100 transition-all">
                          <div className="flex items-center space-x-4">
                             <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-primary-500 font-black">
                                {task.title.charAt(0)}
                             </div>
                             <div>
                                <p className="font-bold text-slate-900">{task.title}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{task.status}</p>
                             </div>
                          </div>
                          <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase ${task.priority === 'High' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>{task.priority}</span>
                       </div>
                    ))}
                 </div>
              </div>
              <div className="bg-slate-900 p-10 rounded-[4rem] text-white">
                 <h3 className="text-xl font-black italic mb-8">Manager Toolkit</h3>
                 <div className="space-y-4">
                    {[
                       { label: 'Assign Mission', icon: UserPlus, link: '/tasks' },
                       { label: 'Team Attendance', icon: UserCheck, link: '/attendance' },
                       { label: 'Resource Registry', icon: Package, link: '/materials' },
                       { label: 'Staff Dossier', icon: FileText, link: '/team' },
                    ].map((tool, i) => (
                       <Link key={i} to={tool.link} className="flex items-center space-x-4 p-5 bg-white/5 hover:bg-white/10 rounded-3xl transition-all border border-white/5">
                          <tool.icon size={20} className="text-primary-500" />
                          <span className="text-xs font-bold uppercase tracking-widest">{tool.label}</span>
                       </Link>
                    ))}
                 </div>
              </div>
           </div>
        </div>
     );
  }

  // --- HR VIEW ---
  if (user?.role === 'HR' && stats) {
     return (
        <div className="space-y-8 animate-in fade-in duration-500">
           <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-12 rounded-[4rem] text-white shadow-2xl">
              <h1 className="text-4xl font-black italic">HR Command</h1>
              <p className="text-white/70 font-bold uppercase text-[10px] tracking-widest mt-2">{stats.totalEmployees} Active Human Assets</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                 { label: 'Total Payroll', val: `₹${(stats.totalPayroll/1000).toFixed(0)}K`, icon: DollarSign, color: 'primary' },
                 { label: 'New Apps', val: stats.newApplications, icon: UserPlus, color: 'emerald' },
                 { label: 'Open Positions', val: stats.openPositions, icon: Briefcase, color: 'amber' },
                 { label: 'Pending Auth', val: stats.pendingLeaves, icon: Clock, color: 'rose' },
              ].map((s, i) => (
                 <div key={i} className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 group transition-all">
                    <div className="w-12 h-12 bg-slate-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                       <s.icon size={22} />
                    </div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic">{s.label}</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">{s.val}</h3>
                 </div>
              ))}
           </div>

            <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-slate-100">
               <h3 className="text-xl font-black italic mb-10">Personnel Allocation Matrix</h3>
               <div className="h-96 relative">
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
                     options={{ 
                        maintainAspectRatio: false,
                        cutout: '80%',
                        plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { weight: 'bold' } } } }
                     }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-10">
                     <span className="text-4xl font-black text-slate-900">{stats.totalEmployees}</span>
                     <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Staff</span>
                  </div>
               </div>
            </div>
        </div>
     );
  }

  // --- EMPLOYEE VIEW (Enterprise Version) ---
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Premium Hero Section */}
      <div className="relative bg-white p-6 md:p-12 rounded-[2.5rem] md:rounded-[4.5rem] border border-slate-100 shadow-sm overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-50 rounded-full -mr-48 -mt-48 group-hover:scale-110 transition-transform duration-1000"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <span className="px-4 py-1.5 bg-primary-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-primary-500/20">Active Session</span>
              <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Unit ID: {user?._id?.slice(-8)}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 italic uppercase tracking-tighter leading-tight md:leading-none mb-2">
              Commander <span className="text-primary-500">{user?.name.split(' ')[0]}</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase text-[9px] md:text-[11px] tracking-[0.2em] md:tracking-[0.3em] italic flex items-center">
              <Activity size={14} className="mr-2 text-primary-500 animate-pulse" /> Operational Footprint / {format(new Date(), 'MMMM d, yyyy')}
            </p>
          </div>
          
          <div className="mt-8 md:mt-0 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            {!stats?.attendance ? (
              <button 
                onClick={handleCheckIn}
                disabled={isClocking}
                className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-6 bg-slate-900 hover:bg-black text-white rounded-[1.5rem] md:rounded-[2.5rem] font-black uppercase text-[10px] md:text-xs tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center space-x-4 group/btn"
              >
                <Zap size={20} className="text-primary-500 group-hover/btn:animate-bounce" />
                <span>{isClocking ? 'Authorizing...' : 'Initialize Shift'}</span>
              </button>
            ) : (
              <div className="flex flex-col items-end">
                <div className="bg-emerald-50 px-8 py-5 rounded-[2rem] border border-emerald-100 text-emerald-600 font-black uppercase text-[10px] tracking-widest flex items-center mb-2">
                  <Clock size={16} className="mr-3" /> Shift Active: {stats?.attendance?.checkIn ? format(new Date(stats.attendance.checkIn), 'HH:mm') : '--:--'}
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-4">Total Uptime: 4h 32m</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enterprise Tab Navigation */}
      <div className="flex flex-wrap justify-center gap-2 bg-slate-200/50 p-2 rounded-[1.5rem] md:rounded-[2.5rem] w-full md:w-max mx-auto shadow-inner">
        {['Overview', 'Missions', 'Logistics'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 md:flex-none px-4 md:px-8 py-3 md:py-4 rounded-[1rem] md:rounded-[2.5rem] text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab 
                ? 'bg-white text-slate-900 shadow-xl scale-105' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content Rendering */}
      <div className="mt-12">
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
               <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-center mb-10">
                     <h3 className="text-xl font-black italic uppercase tracking-tight">Active Deployment Grid</h3>
                     <button onClick={() => setActiveTab('Missions')} className="text-[9px] font-black text-primary-500 uppercase tracking-widest hover:underline">Expand View</button>
                  </div>
                  <div className="space-y-4">
                      {extraData.slice(0, 4).map(task => (
                        <div 
                          key={task._id} 
                          onClick={() => setActiveTab('Missions')}
                          className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[2.5rem] border border-white hover:border-slate-200 transition-all group cursor-pointer"
                        >
                           <div className="flex items-center space-x-5">
                              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary-500 font-black italic shadow-sm border border-slate-50 group-hover:rotate-6 transition-all">
                                 {task.title.charAt(0)}
                              </div>
                              <div>
                                 <p className="font-black text-slate-900 group-hover:text-primary-500 transition-colors uppercase tracking-tight text-sm">{task.title}</p>
                                 <div className="flex items-center mt-1 space-x-3">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">{task.status}</span>
                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                    <span className={`text-[9px] font-black uppercase tracking-widest italic ${task.priority === 'High' ? 'text-rose-500' : 'text-slate-400'}`}>{task.priority} Class</span>
                                 </div>
                              </div>
                           </div>
                           <ArrowRight size={20} className="text-slate-300 group-hover:translate-x-2 transition-all" />
                        </div>
                     ))}
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white">
                     <h3 className="text-lg font-black italic mb-6 uppercase tracking-tighter">Strategic Assets</h3>
                     <div className="space-y-4">
                        {assets.slice(0, 2).map((asset, i) => (
                           <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-3xl">
                              <p className="text-xs font-bold uppercase tracking-tight">{asset.name}</p>
                              <span className="text-[8px] font-black text-primary-500 uppercase">{asset.status}</span>
                           </div>
                        ))}
                        <button onClick={() => setActiveTab('Logistics')} className="w-full py-4 border border-dashed border-white/20 rounded-3xl text-[9px] font-black uppercase tracking-widest hover:bg-white/5 transition-all mt-4">View All Inventory</button>
                     </div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-10 rounded-[3.5rem] text-white shadow-xl shadow-emerald-500/20">
                     <h3 className="text-lg font-black italic mb-4 uppercase tracking-tighter">Growth Matrix</h3>
                     <p className="text-4xl font-black mb-2">84%</p>
                     <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Efficiency Index</p>
                     <div className="w-full h-1.5 bg-white/20 rounded-full mt-8 overflow-hidden">
                        <div className="h-full bg-white w-[84%]" />
                     </div>
                  </div>
               </div>
            </div>

            <div className="space-y-8">
               <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-black italic mb-8 uppercase tracking-tighter">Identity Card</h3>
                  <div className="flex items-center space-x-6">
                     <div className="w-20 h-20 rounded-3xl bg-slate-100 border-2 border-primary-500 overflow-hidden shadow-xl">
                        <img src={`https://ui-avatars.com/api/?name=${user?.name}&background=0ea5e9&color=fff&size=128`} alt="user" />
                     </div>
                     <div>
                        <p className="font-black text-xl text-slate-900 uppercase tracking-tight">{user?.name}</p>
                        <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest mt-1 italic">ID: {user?.employeeID || user?._id?.slice(-8).toUpperCase()}</p>
                     </div>
                  </div>
               </div>

               <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-black italic mb-6 uppercase tracking-tighter">Announcements</h3>
                  <div className="space-y-6">
                     <div className="border-l-4 border-rose-500 pl-4 py-1">
                        <p className="text-xs font-black text-slate-900 uppercase">Q3 Planning Sync</p>
                        <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tight">Today, 14:00 • Boardroom 1</p>
                     </div>
                     <div className="border-l-4 border-primary-500 pl-4 py-1">
                        <p className="text-xs font-black text-slate-900 uppercase">System Maintenance</p>
                        <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tight">Sunday, 00:00 - 04:00</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'Missions' && (
           <div className="h-[65vh] animate-in slide-in-from-bottom duration-500">
              <KanbanBoard tasks={extraData} onStatusChange={handleStatusUpdate} />
           </div>
        )}

        {activeTab === 'Logistics' && (
           <div className="animate-in slide-in-from-bottom duration-500">
              {/* Asset list */}
              <div className="bg-white p-10 rounded-[4rem] border border-slate-100">
                 <h3 className="text-xl font-black italic mb-8">Assigned Resource Inventory</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assets.map((asset, i) => (
                       <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-white flex justify-between items-center">
                          <div>
                             <p className="font-black text-slate-900 uppercase text-xs">{asset.name}</p>
                             <p className="text-[10px] font-black text-slate-400 mt-1 uppercase">{asset.category || 'Asset'}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-sm font-black text-primary-500 italic">{asset.quantity}</p>
                             <span className="text-[8px] font-black uppercase text-slate-300">Units</span>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
