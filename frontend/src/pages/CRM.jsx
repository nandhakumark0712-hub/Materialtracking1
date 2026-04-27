import { useState, useEffect } from 'react';
import { 
  Users, Target, DollarSign, TrendingUp, Search, 
  Plus, Phone, Mail, Calendar, ArrowRight, 
  CheckCircle, Clock, Layout, Loader2, Briefcase,
  PieChart, Shield, MoreHorizontal, MessageSquare,
  Award, BarChart3, Star, Filter, ArrowUpRight,
  UserPlus, Zap, History, Bell, IndianRupee, Trash2, Edit, Inbox,
  ShieldCheck, XCircle, CheckCircle2, Building2, MapPin, 
  ChevronRight, ChevronLeft, Info, Activity, User as UserIcon,
  Tag, Layers, CreditCard, ShoppingCart
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
  const [pipelineData, setPipelineData] = useState([]);
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [materials, setMaterials] = useState([]);
  
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isManageLeadModalOpen, setIsManageLeadModalOpen] = useState(false);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [isManageDealModalOpen, setIsManageDealModalOpen] = useState(false);
  
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [leadForm, setLeadForm] = useState({
    name: '', 
    email: '', 
    phone: '', 
    company: '', 
    industry: '',
    source: 'Direct',
    productInterested: '',
    quantityRequired: 0,
    expectedTimeline: '',
    deliveryLocation: '',
    estimatedDealValue: 0,
    status: 'New'
  });

  const [dealForm, setDealForm] = useState({
    title: '', customer: '', value: 0, status: 'Pending', items: []
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const results = await Promise.allSettled([
        API.get('/api/crm/customers'),
        API.get('/api/crm/deals'),
        API.get('/api/crm/stats'),
        API.get('/api/crm/followups'),
        API.get('/api/crm/pipeline'),
        API.get('/api/materials')
      ]);

      if (results[0].status === 'fulfilled') setCustomers(results[0].value.data.data);
      if (results[1].status === 'fulfilled') setDeals(results[1].value.data.data);
      if (results[2].status === 'fulfilled') setStats(results[2].value.data.data);
      if (results[3].status === 'fulfilled') setFollowUps(results[3].value.data.data);
      if (results[4].status === 'fulfilled') setPipelineData(results[4].value.data.data);
      if (results[5].status === 'fulfilled') setMaterials(results[5].value.data.data);

      setLoading(false);
    } catch (err) {
      console.error('CRM Fetch Error:', err);
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
      setLeadForm({
        name: '', email: '', phone: '', company: '', industry: '',
        source: 'Direct', productInterested: '', quantityRequired: 0,
        expectedTimeline: '', deliveryLocation: '', estimatedDealValue: 0, status: 'New'
      });
    } catch (error) {
       alert(error.response?.data?.message || 'Error creating prospect');
    } finally {
       setIsSubmitting(false);
    }
  };

  const handleUpdateLead = async (leadId, updateData) => {
    try {
      await API.put(`/api/crm/customers/${leadId}`, updateData);
      // Update selectedLead locally to show changes immediately in modal
      if (selectedLead && selectedLead._id === leadId) {
        setSelectedLead({...selectedLead, ...updateData});
      }
      fetchData();
    } catch (error) {
      alert('Error updating prospect');
    }
  };

  const handleCreateDeal = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await API.post('/api/crm/deals', dealForm);
      setIsDealModalOpen(false);
      fetchData();
    } catch (error) {
       alert(error.response?.data?.message || 'Error creating deal');
    } finally {
       setIsSubmitting(false);
    }
  };

  const filteredLeads = customers.filter(c => 
    !c.isCustomer && (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  const filteredCustomers = customers.filter(c => c.isCustomer);

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl md:text-4xl font-black text-slate-900 italic tracking-tight">Lead Command Center</h1>
           <p className="text-slate-500 font-medium mt-1">Manage entire sales lifecycle from discovery to conversion.</p>
        </div>
        <div className="flex bg-white p-2 rounded-[1.5rem] shadow-sm border border-slate-100 overflow-x-auto scrollbar-hide">
           {['Overview', 'Leads', 'Customers', 'Pipeline'].map(tab => (
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
        <div className="flex flex-col items-center justify-center py-40">
           <Loader2 className="animate-spin text-primary-500 mb-6" size={64} />
           <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs italic">Syncing CRM Vectors...</p>
        </div>
      ) : activeTab === 'Overview' ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
           {[
             { label: 'Total Leads', val: stats?.totalLeads || 0, icon: Target, color: 'text-blue-500', bg: 'bg-blue-50' },
             { label: 'Active Deals', val: stats?.activeDeals || 0, icon: Briefcase, color: 'text-amber-500', bg: 'bg-amber-50' },
             { label: 'Revenue Expected', val: `₹${((stats?.revenueExpected || 0)/1000).toFixed(1)}K`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
             { label: 'Outreach Today', val: stats?.followUpsToday || 0, icon: Clock, color: 'text-indigo-500', bg: 'bg-indigo-50' },
           ].map((s, i) => (
             <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group hover:shadow-xl transition-all">
                <div className={`w-14 h-14 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center mb-6`}>
                   <s.icon size={26} />
                </div>
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest italic">{s.label}</p>
                <h3 className="text-3xl font-black text-slate-900 mt-1">{s.val}</h3>
             </div>
           ))}
        </div>
      ) : (activeTab === 'Leads' || activeTab === 'Customers') ? (
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
           <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
              <div className="relative w-96">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                 <input className="input-field pl-12" placeholder="Search prospects..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              {activeTab === 'Leads' && (
                <button onClick={() => setIsLeadModalOpen(true)} className="btn-primary flex items-center space-x-3 px-8">
                   <Plus size={20} />
                   <span className="font-black uppercase text-xs">Capture Prospect</span>
                </button>
              )}
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[1000px]">
                 <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                    <tr>
                       <th className="px-8 py-6">Prospect</th>
                       <th className="px-8 py-6">Value</th>
                       <th className="px-8 py-6">Status</th>
                       <th className="px-8 py-6 text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {(activeTab === 'Leads' ? filteredLeads : filteredCustomers).map(c => (
                       <tr key={c._id} className="hover:bg-slate-50/50 transition-all">
                          <td className="px-8 py-6">
                             <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-500 flex items-center justify-center font-black text-xl">
                                   {c.name.charAt(0)}
                                </div>
                                <div>
                                   <p className="font-black text-slate-900 text-lg leading-none">{c.name}</p>
                                   <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{c.company || 'Private'}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <span className="text-lg font-black text-slate-900 italic">₹{((c.estimatedDealValue || 0)/1000).toFixed(1)}k</span>
                          </td>
                          <td className="px-8 py-6">
                             <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                c.status === 'Converted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-primary-50 text-primary-500 border-primary-100'
                             }`}>
                                {c.status}
                             </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                              <button onClick={() => { setSelectedLead(c); setIsManageLeadModalOpen(true); }} className="p-3 text-slate-300 hover:text-primary-500 hover:bg-slate-100 rounded-xl transition-all">
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
        <div className="flex space-x-6 overflow-x-auto pb-8 scrollbar-hide">
           {['Pending', 'Approved', 'Won'].map(stage => (
              <div key={stage} className="flex-shrink-0 w-80 bg-slate-50/50 rounded-[2.5rem] p-4 border border-dashed border-slate-200">
                 <div className="flex items-center justify-between mb-6 px-4 py-2 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stage}</span>
                    <span className="w-6 h-6 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] font-black">
                       {deals.filter(d => d.status === stage).length}
                    </span>
                 </div>
                 <div className="space-y-4">
                    {deals.filter(d => d.status === stage).map(deal => (
                       <div key={deal._id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                          <h4 className="text-sm font-black text-slate-900 italic mb-2">{deal.title}</h4>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Entity: {deal.customer?.name}</p>
                          <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                             <span className="text-lg font-black text-slate-900 italic">₹{(deal.value/1000).toFixed(0)}k</span>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           ))}
        </div>
      ) : null}

      {/* Capture Lead Modal */}
      <Modal isOpen={isLeadModalOpen} onClose={() => setIsLeadModalOpen(false)} title="Capture Sales Prospect">
         <form onSubmit={handleCreateLead} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Prospect Name</label>
                  <input required className="input-field" value={leadForm.name} onChange={e => setLeadForm({...leadForm, name: e.target.value})} placeholder="E.g. Poorvika Ltd" />
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Industry</label>
                  <input className="input-field" value={leadForm.industry} onChange={e => setLeadForm({...leadForm, industry: e.target.value})} placeholder="E.g. Retail" />
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Lead Type / Source</label>
                  <select className="input-field" value={leadForm.source} onChange={e => setLeadForm({...leadForm, source: e.target.value})}>
                     <option value="Direct">Direct</option>
                     <option value="Field">Field</option>
                  </select>
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Revenue Potential (INR)</label>
                  <input type="number" className="input-field" value={leadForm.estimatedDealValue} onChange={e => setLeadForm({...leadForm, estimatedDealValue: Number(e.target.value)})} />
               </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
               <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Product Line</label>
                  <input className="input-field" value={leadForm.productInterested} onChange={e => setLeadForm({...leadForm, productInterested: e.target.value})} placeholder="A/C Unit" />
               </div>
               <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Units Required</label>
                  <input type="number" className="input-field" value={leadForm.quantityRequired} onChange={e => setLeadForm({...leadForm, quantityRequired: Number(e.target.value)})} />
               </div>
               <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Timeline</label>
                  <input className="input-field" value={leadForm.expectedTimeline} onChange={e => setLeadForm({...leadForm, expectedTimeline: e.target.value})} placeholder="Immediate" />
               </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-5 shadow-xl shadow-primary-500/20 font-black uppercase text-xs">
               {isSubmitting ? 'Processing...' : 'Save Prospect Record'}
            </button>
         </form>
      </Modal>

      {/* FIXED Prospect Management Dashboard Modal - EXACT MATCH TO UI IMAGE */}
      <Modal isOpen={isManageLeadModalOpen} onClose={() => setIsManageLeadModalOpen(false)} title="Prospect Management Dashboard">
         {selectedLead && (
            <div className="space-y-8 pb-4">
               {/* Top Prospect Card */}
               <div className="bg-[#0f172a] p-10 rounded-[3rem] text-white relative overflow-hidden">
                  <div className="flex justify-between items-start mb-8">
                     <div className="flex items-center space-x-6">
                        <div className="w-16 h-16 rounded-full bg-white text-[#0f172a] flex items-center justify-center text-3xl font-black italic">
                           {selectedLead.name.charAt(0)}
                        </div>
                        <div>
                           <h4 className="text-3xl font-black italic tracking-tighter">{selectedLead.name}</h4>
                           <div className="flex items-center space-x-4 mt-2 text-[10px] font-black uppercase tracking-widest text-primary-500">
                              <span className="flex items-center"><Building2 size={12} className="mr-2" /> {selectedLead.industry || 'GENERAL INDUSTRY'}</span>
                              <span className="flex items-center text-white/40"><UserIcon size={12} className="mr-2" /> {selectedLead.source === 'Direct' ? 'DIRECT' : 'FIELD'}</span>
                              <span className="flex items-center text-white/40"><MapPin size={12} className="mr-2" /> {selectedLead.source === 'Field' ? 'FIELD' : 'DIRECT'}</span>
                           </div>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-primary-500 tracking-widest mb-1 italic">EST. REVENUE POTENTIAL</p>
                        <h4 className="text-4xl font-black italic tracking-tighter text-white">₹{(selectedLead.estimatedDealValue || 0).toLocaleString()}</h4>
                     </div>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Intent & Requirement */}
                  <div className="space-y-4">
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 italic">INTENT & REQUIREMENT</label>
                     <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200/50">
                           <span className="text-[10px] font-black uppercase text-slate-400">PRODUCT LINE</span>
                           <span className="text-xs font-black italic text-slate-900">{selectedLead.productInterested || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200/50">
                           <span className="text-[10px] font-black uppercase text-slate-400">UNITS REQUIRED</span>
                           <span className="text-xs font-black italic text-slate-900">{selectedLead.quantityRequired || 0} Units</span>
                        </div>
                        <div className="flex items-center justify-between">
                           <span className="text-[10px] font-black uppercase text-slate-400">TIMELINE</span>
                           <span className="text-xs font-black italic text-primary-500 uppercase">{selectedLead.expectedTimeline || 'TBD'}</span>
                        </div>
                     </div>
                  </div>

                  {/* Pipeline Status Matrix */}
                  <div className="space-y-4">
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 italic">PIPELINE STATUS MATRIX</label>
                     <div className="grid grid-cols-3 gap-3">
                        {['New', 'Qualified', 'Converted'].map(status => (
                           <button 
                              key={status}
                              onClick={() => handleUpdateLead(selectedLead._id, { status })}
                              className={`py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                 selectedLead.status === status 
                                    ? 'bg-primary-500 text-white border-primary-500 shadow-xl shadow-primary-500/20' 
                                    : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'
                              }`}
                           >
                              {status}
                           </button>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Bottom Buttons */}
               <div className="pt-6 border-t border-slate-100 flex gap-4">
                  <button 
                    className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center justify-center space-x-2 border border-slate-100"
                    onClick={() => {
                       if(window.confirm('PURGE RECORD?')) {
                          API.delete(`/api/crm/customers/${selectedLead._id}`).then(() => { setIsManageLeadModalOpen(false); fetchData(); });
                       }
                    }}
                  >
                     <Trash2 size={16} />
                     <span>PURGE RECORD</span>
                  </button>
                  <button 
                    className="flex-1 py-5 bg-primary-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-primary-500/20"
                    onClick={() => {
                        setDealForm({ 
                            customer: selectedLead._id,
                            title: `Deal: ${selectedLead.name}`,
                            value: selectedLead.estimatedDealValue
                        });
                        setIsDealModalOpen(true);
                        setIsManageLeadModalOpen(false);
                    }}
                  >
                     <ArrowUpRight size={16} />
                     <span>CONVERT TO DEAL</span>
                  </button>
               </div>
            </div>
         )}
      </Modal>

      {/* Register Deal Modal */}
      <Modal isOpen={isDealModalOpen} onClose={() => setIsDealModalOpen(false)} title="Convert to Commercial Deal">
         <form onSubmit={handleCreateDeal} className="space-y-6">
            <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Deal Title</label>
               <input required className="input-field" value={dealForm.title} onChange={(e) => setDealForm({...dealForm, title: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Deal Value (INR)</label>
                  <input type="number" required className="input-field" value={dealForm.value} onChange={(e) => setDealForm({...dealForm, value: e.target.value})} />
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 italic">Link Customer</label>
                  <div className="input-field bg-slate-50 flex items-center">{selectedLead?.name}</div>
               </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-5 shadow-xl shadow-primary-500/20 font-black uppercase text-xs">
               Authorize Deal Creation
            </button>
         </form>
      </Modal>
    </div>
  );
};

export default CRM;
