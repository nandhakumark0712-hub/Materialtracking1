import { useState, useEffect } from 'react';
import { 
  Truck, Search, Filter, Plus, Edit, Trash2, 
  ChevronRight, MoreHorizontal, Mail, Phone, 
  MapPin, CreditCard, ShieldCheck, TrendingUp,
  Star, Briefcase, ExternalLink, Loader2, AlertCircle
} from 'lucide-react';
import API from '../utils/api';
import Modal from '../components/Modal';

const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    gstId: '',
    category: 'Material',
    paymentTerms: 'Net 30',
    status: 'Active'
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const { data } = await API.get('/api/vendors');
      setVendors(data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (selectedVendor) {
        await API.put(`/api/vendors/${selectedVendor._id}`, formData);
      } else {
        await API.post('/api/vendors', formData);
      }
      setIsModalOpen(false);
      setSelectedVendor(null);
      fetchVendors();
      setFormData({ name: '', contactPerson: '', email: '', phone: '', address: '', gstId: '', category: 'Material', paymentTerms: 'Net 30', status: 'Active' });
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vendor record?')) {
      try {
        await API.delete(`/api/vendors/${id}`);
        fetchVendors();
      } catch (err) {
        alert('Failed to delete vendor');
      }
    }
  };

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.vendorId && v.vendorId.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (v.category && v.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center space-x-3 mb-2">
              <Truck className="text-primary-500" size={20} md:size={24} />
              <span className="text-primary-500 font-black uppercase text-[8px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em]">Supply Chain Matrix</span>
           </div>
           <h1 className="text-2xl md:text-4xl font-black text-slate-900 italic tracking-tight">Vendor Management</h1>
           <p className="text-slate-500 font-medium mt-1 text-xs md:text-sm">Orchestrate enterprise supplier relationships and procurement velocity.</p>
        </div>
        <button 
          onClick={() => { setSelectedVendor(null); setFormData({ name: '', contactPerson: '', email: '', phone: '', address: '', gstId: '', category: 'Material', paymentTerms: 'Net 30', status: 'Active' }); setIsModalOpen(true); }}
          className="w-full md:w-auto btn-primary px-8 py-3 md:py-4 flex items-center justify-center space-x-3 text-xs md:text-base"
        >
          <Plus size={20} />
          <span>Onboard Vendor</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
           { label: 'Active Partners', val: vendors.filter(v => v.status === 'Active').length, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
           { label: 'Total Registry', val: vendors.length, icon: Truck, color: 'text-primary-500', bg: 'bg-primary-50' },
           { label: 'Avg Rating', val: '4.8/5', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
           { label: 'Spending Mix', val: '12 Cats', icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        ].map((s, i) => (
           <div key={i} className="bg-white p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-4 md:mb-6">
                 <div className={`w-10 h-10 md:w-14 md:h-14 ${s.bg} ${s.color} rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <s.icon size={20} md:size={26} />
                 </div>
                 <div className="w-8 h-1 bg-slate-50 rounded-full hidden sm:block"></div>
              </div>
              <p className="text-slate-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest italic">{s.label}</p>
              <h3 className="text-xl md:text-3xl font-black text-slate-900 mt-1">{s.val}</h3>
           </div>
        ))}
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
         <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center bg-slate-50/20 gap-6">
            <div className="relative w-full md:w-96">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
               <input 
                  className="input-field pl-12" 
                  placeholder="Search by vendor name, ID, or category..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <div className="flex space-x-4 w-full md:w-auto">
               <button className="flex-1 md:flex-none p-4 bg-slate-50 text-slate-400 rounded-2xl border border-slate-100"><Filter size={20} /></button>
            </div>
         </div>
         
         <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
               <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                  <tr>
                     <th className="px-8 py-6">Identity</th>
                     <th className="px-8 py-6">Contact Point</th>
                     <th className="px-8 py-6">Category</th>
                     <th className="px-8 py-6">Status</th>
                     <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                       <td colSpan="5" className="py-20 text-center">
                          <Loader2 className="animate-spin text-primary-500 mx-auto" size={32} />
                       </td>
                    </tr>
                  ) : filteredVendors.map(v => (
                     <tr key={v._id} className="hover:bg-slate-50/50 group transition-all italic">
                        <td className="px-8 py-6">
                           <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-lg">
                                 {v.name.charAt(0)}
                              </div>
                              <div>
                                 <p className="font-black text-slate-900 text-lg leading-tight tracking-tight">{v.name}</p>
                                 <p className="text-[10px] text-slate-400 font-bold not-italic uppercase tracking-widest">{v.vendorId || 'LEGACY-SUP'}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="space-y-1 not-italic">
                              <p className="text-sm font-bold text-slate-700 flex items-center"><Mail size={12} className="mr-2 text-slate-300" /> {v.email}</p>
                              <p className="text-xs text-slate-400 flex items-center"><Phone size={12} className="mr-2 text-slate-300" /> {v.phone}</p>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className="px-4 py-1 bg-slate-100 text-[10px] font-black uppercase rounded-lg text-slate-500">{v.category || 'General'}</span>
                        </td>
                        <td className="px-8 py-6">
                           <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border ${
                              v.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                              v.status === 'Inactive' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                           }`}>
                              {v.status}
                           </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <div className="flex justify-end space-x-2">
                              <button 
                                onClick={() => { setSelectedVendor(v); setFormData({ ...v }); setIsModalOpen(true); }}
                                className="p-3 text-slate-300 hover:text-primary-500 hover:bg-white rounded-xl transition-all"
                              >
                                 <Edit size={18} />
                              </button>
                              <button 
                                onClick={() => handleDelete(v._id)}
                                className="p-3 text-slate-300 hover:text-rose-500 hover:bg-white rounded-xl transition-all"
                              >
                                 <Trash2 size={18} />
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Onboard/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedVendor ? 'Refine Supplier Intel' : 'Onboard Strategic Partner'}>
         <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Corporate Identity</label>
                  <input required className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Industrial Solutions Ltd" />
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Contact Authority</label>
                  <input className="input-field" value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} placeholder="Chief Procurement Officer" />
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Digital Mesh (Email)</label>
                  <input type="email" required className="input-field" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="suppliers@corp.com" />
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Direct Line</label>
                  <input required className="input-field" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91 98765 43210" />
               </div>
            </div>

            <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">GST / Tax Hub ID</label>
               <input className="input-field" value={formData.gstId} onChange={e => setFormData({...formData, gstId: e.target.value})} placeholder="22AAAAA0000A1Z5" />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Category Vector</label>
                  <select className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                     <option>Raw Material</option>
                     <option>Logistics</option>
                     <option>Safety Gear</option>
                     <option>Electronics</option>
                     <option>Maintenance</option>
                     <option>General</option>
                  </select>
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Payment Protocol</label>
                  <select className="input-field" value={formData.paymentTerms} onChange={e => setFormData({...formData, paymentTerms: e.target.value})}>
                     <option>Immediate</option>
                     <option>Net 15</option>
                     <option>Net 30</option>
                     <option>Net 60</option>
                     <option>Advance 50%</option>
                  </select>
               </div>
            </div>

            <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Physical Node (Address)</label>
               <textarea className="input-field min-h-[80px]" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Headquarters Location" />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Operational Status</label>
                  <select className="input-field" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                     <option>Active</option>
                     <option>Inactive</option>
                     <option>Pending</option>
                  </select>
               </div>
               <div className="flex items-end">
                  <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-4 shadow-xl shadow-primary-500/20">
                     {isSubmitting ? 'Syncing...' : selectedVendor ? 'Authorize Update' : 'Initialize Partner'}
                  </button>
               </div>
            </div>
         </form>
      </Modal>
    </div>
  );
};

export default VendorManagement;
