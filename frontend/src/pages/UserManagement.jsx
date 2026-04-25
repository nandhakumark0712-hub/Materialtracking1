import { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Search, Edit2, Trash2, Shield, 
  CheckCircle, XCircle, MoreVertical, Mail, Phone, Filter,
  Loader2, Download, X, UserCog, IndianRupee, DollarSign,
  CheckCircle2, CreditCard, Send, ShieldCheck
} from 'lucide-react';
import API from '../utils/api';
import Modal from '../components/Modal';

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState('Identities');
  const [users, setUsers] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editUser, setEditUser] = useState(null);
  
   const [formData, setFormData] = useState({
    name: '', username: '', password: 'password123', role: 'Employee', phone: '', employeeID: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'Identities') {
        const { data } = await API.get('/api/admin/users');
        setUsers(data.data);
      } else {
        const { data } = await API.get('/api/hrms/payroll/all');
        setPayrolls(data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleEditClick = (u) => {
    setEditUser(u);
    setFormData({
       name: u.name,
       username: u.username || '',
       role: u.role,
       phone: u.phone || '',
       employeeID: u.employeeID || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Strict ID Format Validation: EMP- followed by exactly 3 digits (e.g., EMP-001)
    const idRegex = /^EMP-\d{3}$/;
    if (formData.employeeID && !idRegex.test(formData.employeeID)) {
       alert('Access Denied: ID Number must follow the protocol EMP-XXX (e.g., EMP-001, EMP-099).');
       return;
    }

    setIsSubmitting(true);
    try {
      if (editUser) {
        await API.put(`/api/admin/users/${editUser._id}`, formData);
        alert('Identity Updated: Changes have been verified and sealed.');
      } else {
        await API.post('/api/admin/users', formData);
        alert('Provisioning Success: New identity has been established.');
      }
      setIsModalOpen(false);
      setEditUser(null);
      setFormData({ name: '', username: '', password: 'password123', role: 'Employee', phone: '', employeeID: '' });
      await fetchData(); // Ensure data is fully refreshed
    } catch (error) {
       alert(error.response?.data?.message || 'Authorization failed.');
    } finally {
       setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Terminate account?')) {
      try {
        await API.delete(`/api/admin/users/${id}`);
        fetchData();
      } catch (error) {
        alert('Error deleting user');
      }
    }
  };

  const rolesList = ['All', 'Admin', 'Manager', 'HR', 'Employee', 'Sales Team'];

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (u.employeeID && u.employeeID.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = activeFilter === 'All' || u.role === activeFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">Mission Control</h1>
          <p className="text-slate-500 font-medium mt-1">Identity management and global financial authorizations.</p>
        </div>
        <div className="flex bg-white p-2 rounded-[1.5rem] shadow-sm border border-slate-100 italic">
           {['Identities', 'Payroll List'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
           ))}
        </div>
      </div>

      {activeTab === 'Identities' ? (
        <>
          <div className="flex justify-end">
             <button 
               onClick={() => {
                 setEditUser(null);
                 setFormData({ name: '', username: '', password: 'password123', role: 'Employee', phone: '', employeeID: '' });
                 setIsModalOpen(true);
               }} 
               className="btn-primary flex items-center space-x-3 px-8 py-4"
             >
                <UserPlus size={20} />
                <span>Provision Identity</span>
             </button>
          </div>
          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden italic">
             <div className="p-8 border-b border-slate-50 flex justify-between gap-6 bg-slate-50/20">
                <div className="relative flex-1">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input type="text" placeholder="Search by name, username or ID..." className="input-field pl-12 py-4" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                      <tr>
                         <th className="px-8 py-6 italic">Identity</th>
                         <th className="px-8 py-6 italic">ID Number</th>
                         <th className="px-8 py-6 italic">Access Role</th>
                         <th className="px-8 py-6 italic">Status</th>
                         <th className="px-8 py-6 text-right">Action</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {filteredUsers.map(u => (
                         <tr key={u._id} className="hover:bg-slate-50/50 group transition-all">
                            <td className="px-8 py-6 flex items-center space-x-4">
                               <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 text-primary-500 font-black flex items-center justify-center text-xl shadow-sm">{u.name.charAt(0)}</div>
                               <div>
                                  <p className="font-black text-slate-900 group-hover:text-primary-500 transition-colors uppercase">{u.name}</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">{u.username}</p>
                               </div>
                            </td>
                            <td className="px-8 py-6 font-bold text-slate-500 text-xs tracking-widest uppercase">{u.employeeID || 'NOT SET'}</td>
                            <td className="px-8 py-6"><span className="px-4 py-1.5 bg-slate-50 border rounded-full text-[10px] font-black uppercase text-slate-600">{u.role}</span></td>
                            <td className="px-8 py-6"><div className="flex items-center text-emerald-600 font-black text-[10px] uppercase tracking-widest"><div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div> Authorized</div></td>
                            <td className="px-8 py-6 text-right space-x-2">
                               <button onClick={() => handleEditClick(u)} className="p-3 text-slate-300 hover:text-primary-500 transition-all"><Edit2 size={18} /></button>
                               <button onClick={() => handleDeleteUser(u._id)} className="p-3 text-slate-300 hover:text-rose-600 transition-all"><Trash2 size={18} /></button>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </>
      ) : (
        <div className="space-y-6">
           <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white flex justify-between items-center">
              <div>
                 <h2 className="text-3xl font-black italic">Financial Authorization Center</h2>
                 <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mt-2 uppercase">Validate and seal departmental disbursement requests.</p>
              </div>
              <ShieldCheck size={48} className="text-primary-500" />
           </div>

           <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50 bg-slate-50/20">
                 <h3 className="text-xl font-black italic">Pending Disbursement Queue</h3>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                       <tr>
                          <th className="px-8 py-6 italic">Beneficiary</th>
                          <th className="px-8 py-6 italic">Amount</th>
                          <th className="px-8 py-6 italic">Status</th>
                          <th className="px-8 py-6 text-right italic pr-12">Authorization</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {payrolls.map(p => (
                          <tr key={p._id} className="hover:bg-slate-50/50 transition-all">
                             <td className="px-8 py-7">
                                <p className="font-black text-slate-900 uppercase">{p.employee?.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase italic">{p.employee?.role} • {p.month}</p>
                             </td>
                             <td className="px-8 py-7 font-black text-2xl text-slate-900">₹{p.netSalary}</td>
                             <td className="px-8 py-7">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${
                                   p.status === 'Credited' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600 animate-pulse'
                                }`}>
                                   {p.status}
                                </span>
                             </td>
                             <td className="px-8 py-7 text-right pr-12">
                                {p.status === 'Pending' ? (
                                   <button 
                                      onClick={() => handleApprovePayroll(p._id)}
                                      className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
                                   >
                                      Seal & Credit
                                   </button>
                                ) : (
                                   <div className="flex items-center justify-end text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                                      <CheckCircle2 size={16} className="mr-2" /> Verified
                                   </div>
                                )}
                             </td>
                          </tr>
                       ))}
                       {payrolls.length === 0 && (
                          <tr><td colSpan="4" className="text-center py-20 text-slate-300 font-black uppercase text-[10px] italic">No pending disbursement requests detected.</td></tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {/* User Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editUser ? "Modify Identity" : "Provision Identity"}>
        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Legal Name</label>
                 <input required className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. John Doe" />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Access Role</label>
                 <select className="input-field" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    {rolesList.slice(1).map(r => <option key={r} value={r}>{r}</option>)}
                 </select>
              </div>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Identity Username</label>
                 <input required className="input-field" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="e.g. admin_staff" />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">ID Number</label>
                 <input required className="input-field" value={formData.employeeID} onChange={e => setFormData({...formData, employeeID: e.target.value})} placeholder="e.g. EMP-2024-001" />
              </div>
           </div>
           <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Contact Link</label>
              <input className="input-field" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91 XXXX XXXX" />
           </div>
           {!editUser && (
              <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Initial Security Key</label>
                 <input required type="password" className="input-field" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="********" />
              </div>
           )}
           <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-4 mt-2">
              {isSubmitting ? 'Syncing Matrix...' : (editUser ? 'Authorize Modification' : 'Authorize Provisioning')}
           </button>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;
