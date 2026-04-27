import { useState, useEffect } from 'react';
import { 
  Package, Plus, Search, Filter, ArrowUpRight, 
  AlertTriangle, MoreVertical, Loader2, Download,
  CheckCircle2, XCircle, Clock, Inbox, Send, ShieldCheck,
  Trash2, Edit
} from 'lucide-react';
import API from '../utils/api';
import { useSelector } from 'react-redux';
import Modal from '../components/Modal';

const Materials = () => {
  const { user } = useSelector(state => state.auth);
  const [materials, setMaterials] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Inventory');
  
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeActionMenu, setActiveActionMenu] = useState(null);

  const [requestForm, setRequestForm] = useState({
    material: '',
    quantity: '',
    reason: ''
  });

  const [addForm, setAddForm] = useState({
    name: '',
    sku: '',
    category: 'Row Material',
    quantity: '',
    unit: 'kg',
    lowStockThreshold: 10
  });

  const isManagement = ['Admin', 'Manager'].includes(user?.role);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const matRes = await API.get('/api/materials');
      setMaterials(matRes.data.data);
      
      const endpoint = isManagement ? '/api/materials/requests' : '/api/materials/requests/my';
      const reqRes = await API.get(endpoint);
      setRequests(reqRes.data.data);
      
      setLoading(false);
    } catch (err) {
      console.error('Data sync failed:', err);
      setLoading(false);
    }
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await API.post('/api/materials/request', requestForm);
      setIsRequestModalOpen(false);
      alert('Success: Resource request submitted to management for review.');
      setActiveTab('Requests');
      setRequestForm({ material: '', quantity: '', reason: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Remove sensitive fields if they exist from a previous edit
      const { _id, createdAt, updatedAt, __v, createdBy, ...formData } = addForm;
      
      if (selectedMaterialId) {
        await API.put(`/api/materials/${selectedMaterialId}`, formData);
      } else {
        await API.post('/api/materials', formData);
      }
      
      setIsAddModalOpen(false);
      setSelectedMaterialId(null);
      fetchData();
      setAddForm({ name: '', sku: '', category: 'Row Material', quantity: '', unit: 'kg', lowStockThreshold: 10 });
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing material record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm('Are you sure you want to delete this material? This action cannot be undone.')) return;
    try {
      await API.delete(`/api/materials/${id}`);
      fetchData();
      setActiveActionMenu(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete material');
    }
  };

  const handleApproveReject = async (id, status) => {
    try {
      await API.put(`/api/approvals/material/${id}`, { status });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update request status');
    }
  };

  const exportInventory = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Category,Quantity,Unit\n"
      + materials.map(m => `${m.name},${m.category},${m.quantity},${m.unit}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inventory_report.csv");
    document.body.appendChild(link);
    link.click();
  };

  if (loading) return (
     <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin text-primary-500 mb-4" size={48} />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing Asset Registry...</p>
     </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight italic">Asset Registry</h1>
          <p className="text-slate-500 font-medium mt-1 text-xs md:text-sm">Manage physical resources and procurement requests.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
           {isManagement ? (
             <button onClick={() => setIsAddModalOpen(true)} className="btn-primary flex items-center justify-center space-x-3 px-6 md:px-8 py-3 md:py-4 shadow-xl shadow-primary-500/20 text-xs md:text-base">
                <Plus size={20} md:size={22} />
                <span>Add Material</span>
             </button>
           ) : (
             <button onClick={() => setIsRequestModalOpen(true)} className="btn-primary flex items-center justify-center space-x-3 px-6 md:px-8 py-3 md:py-4 shadow-xl shadow-primary-500/20 text-xs md:text-base">
                <Send size={20} md:size={22} />
                <span>Request Material</span>
             </button>
           )}
           <div className="flex bg-white p-1 md:p-2 rounded-[1rem] md:rounded-[1.5rem] shadow-sm border border-slate-100 italic w-full sm:w-auto">
              {['Inventory', 'Requests'].map(tab => (
                 <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 sm:flex-none px-4 md:px-8 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${
                      activeTab === tab ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-slate-500 hover:bg-slate-50'
                    }`}
                 >
                    {tab}
                 </button>
              ))}
           </div>
        </div>
      </div>

      {activeTab === 'Inventory' ? (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { label: 'Total Items', val: materials.length, icon: Package, color: 'primary' },
              { label: 'Low Stock', val: materials.filter(m => m.quantity <= m.minStock).length, icon: AlertTriangle, color: 'rose' },
              { label: 'Active Requests', val: requests.filter(r => r.status === 'Pending').length || '0', icon: Clock, color: 'amber' },
              { label: 'Export Data', val: 'CSV', icon: Download, color: 'emerald', action: exportInventory },
            ].map((s, i) => (
              <div key={i} onClick={s.action} className={`bg-white p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group ${s.action ? 'cursor-pointer' : ''}`}>
                 <div className="flex justify-between items-start mb-4 md:mb-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 text-primary-500 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                       <s.icon size={18} md:size={22} />
                    </div>
                 </div>
                 <p className="text-slate-500 text-[8px] md:text-[10px] font-black uppercase tracking-widest italic">{s.label}</p>
                 <h3 className="text-xl md:text-3xl font-black text-slate-900 mt-1">{s.val}</h3>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
             <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between gap-6 bg-slate-50/10">
                <div className="relative w-full md:w-96">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                   <input 
                      className="input-field pl-12" 
                      placeholder="Search inventory..." 
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                   />
                </div>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                   <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                      <tr>
                         <th className="px-8 py-6 italic">Material Identity</th>
                         <th className="px-8 py-6 italic">Category</th>
                         <th className="px-8 py-6 italic">Stock Level</th>
                         <th className="px-8 py-6 italic">Status</th>
                         <th className="px-8 py-6 text-right italic">Action</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {materials.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).map(m => (
                         <tr key={m._id} className="hover:bg-slate-50/50 group transition-all">
                            <td className="px-8 py-7">
                               <div className="flex items-center space-x-4">
                                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-primary-500 shadow-sm font-black italic">
                                     {m.name.charAt(0)}
                                  </div>
                                  <p className="font-black text-slate-900 uppercase tracking-tight">{m.name}</p>
                               </div>
                            </td>
                            <td className="px-8 py-7">
                               <span className="text-[10px] font-black uppercase text-slate-400 px-3 py-1 bg-slate-50 rounded-lg">{m.category}</span>
                            </td>
                            <td className="px-8 py-7 font-black text-slate-900 text-lg">
                               {m.quantity} <span className="text-[10px] text-slate-300 uppercase">{m.unit}</span>
                            </td>
                            <td className="px-8 py-7">
                               <div className={`flex items-center text-[10px] font-black uppercase ${m.quantity <= (m.lowStockThreshold || 10) ? 'text-rose-500' : 'text-emerald-500'}`}>
                                  <div className={`w-2 h-2 rounded-full mr-2 ${m.quantity <= (m.lowStockThreshold || 10) ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                                  {m.quantity <= (m.lowStockThreshold || 10) ? 'Low Supply' : 'Optimized'}
                               </div>
                            </td>
                            <td className="px-8 py-7 text-right relative">
                               <button 
                                 onClick={() => setActiveActionMenu(activeActionMenu === m._id ? null : m._id)}
                                 className="text-slate-300 hover:text-primary-500 transition-all p-2 hover:bg-slate-50 rounded-xl"
                               >
                                 <MoreVertical size={20} />
                               </button>

                               {activeActionMenu === m._id && (
                                 <div className="absolute right-8 top-full -mt-4 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 w-48 z-50 animate-in fade-in zoom-in duration-200">
                                   <button 
                                     className="w-full px-6 py-2.5 text-left text-[10px] font-black uppercase text-slate-500 hover:bg-slate-50 hover:text-primary-500 flex items-center"
                                     onClick={() => {
                                       setAddForm({ ...m, lowStockThreshold: m.lowStockThreshold || 10 });
                                       setSelectedMaterialId(m._id);
                                       setIsAddModalOpen(true);
                                       setActiveActionMenu(null);
                                     }}
                                   >
                                     <Edit size={14} className="mr-3" /> Edit Item
                                   </button>
                                   <button 
                                     onClick={() => handleDeleteMaterial(m._id)}
                                     className="w-full px-6 py-2.5 text-left text-[10px] font-black uppercase text-rose-500 hover:bg-rose-50 flex items-center transition-all"
                                   >
                                     <Trash2 size={14} className="mr-3" /> Remove Record
                                   </button>
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
      ) : (
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
           <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h3 className="text-lg font-black italic flex items-center">
                 <Inbox className="mr-3 text-primary-500" /> Resource Requests
              </h3>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                 <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                    <tr>
                       <th className="px-8 py-6 italic">{isManagement ? 'Requested By' : 'Material Requested'}</th>
                       <th className="px-8 py-6 italic">Quantity</th>
                       <th className="px-8 py-6 italic">Date</th>
                       <th className="px-8 py-6 italic">Status</th>
                       <th className="px-8 py-6 text-right italic">Action</th>
                    </tr>
                 </thead>
                  <tbody className="divide-y divide-slate-50">
                    {requests.map((r) => (
                       <tr key={r._id} className="hover:bg-slate-50/50 transition-all">
                          <td className="px-8 py-7">
                             <p className="font-black text-slate-900 uppercase">{isManagement ? r.employee?.name : r.material?.name}</p>
                             <p className="text-[9px] text-slate-400 font-bold uppercase">{isManagement ? r.employee?.role : 'ID: ' + r.material?._id?.slice(-4)}</p>
                             {r.adminComment && (
                               <p className="text-[10px] text-primary-500 font-bold italic mt-2 border-l-2 border-primary-500 pl-2">
                                 Admin Note: {r.adminComment}
                               </p>
                             )}
                          </td>
                          <td className="px-8 py-7 font-black text-slate-900">{r.quantity} {r.material?.unit}</td>
                          <td className="px-8 py-7 text-slate-400 text-xs font-bold">{new Date(r.createdAt).toLocaleDateString()}</td>
                          <td className="px-8 py-7">
                             <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${
                                r.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                                r.status === 'Rejected' ? 'bg-rose-50 text-rose-600' :
                                'bg-amber-50 text-amber-600'
                             }`}>
                                {r.status}
                             </span>
                             {r.status !== 'Pending' && (
                               <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">
                                 {r.status === 'Approved' ? 'Approved' : 'Rejected'} on {new Date(r.updatedAt).toLocaleDateString()}
                               </p>
                             )}
                          </td>
                          <td className="px-8 py-7 text-right">
                             {isManagement && r.status === 'Pending' ? (
                               <div className="flex items-center justify-end space-x-2">
                                  <button onClick={() => handleApproveReject(r._id, 'Approved')} className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-110 transition-all"><CheckCircle2 size={16} /></button>
                                  <button onClick={() => handleApproveReject(r._id, 'Rejected')} className="p-3 bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-500/20 hover:scale-110 transition-all"><XCircle size={16} /></button>
                               </div>
                             ) : (
                               <button className="text-slate-300 hover:text-primary-500"><Download size={18} /></button>
                             )}
                          </td>
                       </tr>
                    ))}
                    {requests.length === 0 && (
                       <tr>
                          <td colSpan="5" className="px-8 py-20 text-center text-slate-300 font-black uppercase text-[10px]">No active requests found.</td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {/* Resource Request Modal */}
      <Modal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} title="Request Resource">
         <form onSubmit={handleRequest} className="space-y-6">
            <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Select Material</label>
               <select 
                 required 
                 className="input-field" 
                 value={requestForm.material} 
                 onChange={e => setRequestForm({...requestForm, material: e.target.value})}
               >
                  <option value="">Choose item...</option>
                  {materials.map(m => (
                    <option key={m._id} value={m._id}>{m.name} ({m.quantity} {m.unit} in stock)</option>
                  ))}
               </select>
            </div>
            <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Quantity Needed</label>
               <input required type="number" className="input-field" value={requestForm.quantity} onChange={e => setRequestForm({...requestForm, quantity: e.target.value})} />
            </div>
            <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Reason for Request</label>
               <textarea required className="input-field h-24" value={requestForm.reason} onChange={e => setRequestForm({...requestForm, reason: e.target.value})} placeholder="Operational requirement..." />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-4 mt-2">
               {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
         </form>
      </Modal>

      {/* Add Material Modal */}
       <Modal 
         isOpen={isAddModalOpen} 
         onClose={() => {
           setIsAddModalOpen(false);
           setSelectedMaterialId(null);
           setAddForm({ name: '', sku: '', category: 'Row Material', quantity: '', unit: 'kg', lowStockThreshold: 10 });
         }} 
         title={selectedMaterialId ? "Modify Material Record" : "Register New Material"}
       >
         <form onSubmit={handleAddMaterial} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Name</label>
                  <input required className="input-field" value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} />
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">SKU (Stock Keeping Unit)</label>
                  <input required className="input-field" value={addForm.sku} onChange={e => setAddForm({...addForm, sku: e.target.value})} placeholder="e.g. MAT-001" />
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                  <select className="input-field" value={addForm.category} onChange={e => setAddForm({...addForm, category: e.target.value})}>
                     <option>Row Material</option>
                     <option>Finished Goods</option>
                     <option>Tools</option>
                  </select>
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Low Stock Alert at</label>
                  <input required type="number" className="input-field" value={addForm.lowStockThreshold} onChange={e => setAddForm({...addForm, lowStockThreshold: e.target.value})} />
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Initial Quantity</label>
                  <input required type="number" className="input-field" value={addForm.quantity} onChange={e => setAddForm({...addForm, quantity: e.target.value})} />
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Unit</label>
                  <input required className="input-field" value={addForm.unit} onChange={e => setAddForm({...addForm, unit: e.target.value})} placeholder="kg, meters, etc." />
               </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-4 mt-2">
               {isSubmitting ? 'Registering...' : 'Add to Inventory'}
            </button>
         </form>
      </Modal>
    </div>
  );
};

export default Materials;
