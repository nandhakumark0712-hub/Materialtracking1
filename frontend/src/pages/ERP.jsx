import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, Truck, CreditCard, PieChart, FileText, 
  Plus, Search, Download, Loader2, ArrowRight, Package,
  DollarSign, Briefcase, TrendingUp, Clock, CheckCircle2,
  XCircle, AlertCircle, ShieldCheck, MoreHorizontal, Edit, Trash2
} from 'lucide-react';
import API from '../utils/api';
import Modal from '../components/Modal';

const ERP = () => {
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('Orders');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  
  const [requestForm, setRequestForm] = useState({
    itemName: '',
    quantity: 1,
    vendor: '',
    amount: 0,
    description: '',
    priority: 'Medium'
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const [ordRes, venRes, reqRes, statsRes] = await Promise.all([
        API.get('/api/erp/orders'),
        API.get('/api/erp/vendors'),
        API.get('/api/erp/purchase-requests'),
        API.get('/api/erp/stats')
      ]);
      setOrders(ordRes.data.data);
      setVendors(venRes.data.data);
      setRequests(reqRes.data.data);
      setStats(statsRes.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await API.post('/api/erp/purchase-requests', requestForm);
      setIsModalOpen(false);
      fetchData();
      setRequestForm({
        itemName: '', quantity: 1, vendor: '', amount: 0, description: '', priority: 'Medium'
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Error submitting request');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDeleteOrder = async (id) => {
    if (window.confirm('Are you sure you want to delete this purchase order? This action cannot be undone.')) {
      try {
        await API.delete(`/api/erp/orders/${id}`);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete order');
      }
    }
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setIsEditModalOpen(true);
    setActiveMenu(null);
  };

  const handleUpdateOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await API.put(`/api/erp/orders/${selectedOrder._id}`, selectedOrder);
      setIsEditModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Failed to update order');
    } finally {
      setIsSubmitting(false);
    }
  };
  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40">
       <Loader2 className="animate-spin text-primary-500 mb-4" size={48} />
       <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Accessing ERP Procurement Grid...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
           <div className="flex items-center space-x-3 mb-2">
              <ShoppingCart className="text-primary-500" size={16} md:size={20} />
              <span className="text-primary-500 font-black uppercase text-[8px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em]">Procurement Protocol</span>
           </div>
           <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight italic">Procurement Hub</h1>
           <p className="text-slate-500 font-medium text-xs md:text-sm">Manage enterprise vendors and purchase authorizations.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
           <div className="flex bg-white p-1 rounded-xl md:rounded-2xl border border-slate-100 shadow-sm italic w-full sm:w-auto">
              {['Orders', 'Requests'].map(tab => (
                 <button 
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`flex-1 sm:flex-none px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${
                     activeTab === tab ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-900'
                   }`}
                 >
                   {tab}
                 </button>
              ))}
           </div>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="btn-primary px-6 md:px-8 py-3 md:py-4 flex items-center justify-center text-xs md:text-base w-full sm:w-auto"
           >
             <Plus size={18} md:size={20} className="mr-2" />
             <span>New Request</span>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
           { label: 'Pending Requests', val: requests.filter(r => r.status === 'Pending').length, icon: Clock, sub: 'Approval Queue', color: 'text-amber-500' },
           { label: 'Active Vendors', val: vendors.length, icon: Truck, sub: 'Global Registry', color: 'text-blue-500' },
           { label: 'Monthly Spending', val: `₹${((stats?.monthlySpending || 0)/1000).toFixed(1)}K`, icon: DollarSign, sub: 'Authorized Flow', color: 'text-emerald-500' },
           { label: 'Utilization', val: `${stats?.budgetUtilized || 0}%`, icon: TrendingUp, sub: 'Safety Margin', color: 'text-indigo-500' },
        ].map((s, i) => (
           <div key={i} className={`p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 bg-white hover:shadow-xl transition-all group`}>
              <div className="flex justify-between items-start mb-4 md:mb-6">
                 <div className={`w-10 h-10 md:w-14 md:h-14 bg-slate-50 ${s.color} rounded-2xl md:rounded-3xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                    <s.icon size={20} md:size={28} />
                 </div>
                 <span className="text-[8px] md:text-[9px] font-black uppercase text-slate-300 tracking-widest italic hidden sm:block">{s.sub}</span>
              </div>
              <p className="text-slate-500 text-[8px] md:text-[10px] font-black uppercase tracking-wider">{s.label}</p>
              <h3 className="text-xl md:text-4xl font-black text-slate-900 mt-1">{s.val}</h3>
           </div>
        ))}
      </div>

      {activeTab === 'Orders' ? (
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h3 className="text-xl font-black italic">Authorized Purchase Orders</h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-4 py-1.5 rounded-full">Active Procurements</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                <tr>
                  <th className="px-8 py-6">Purchase ID</th>
                  <th className="px-8 py-6">Vendor Hub</th>
                  <th className="px-8 py-6">Category Assets</th>
                  <th className="px-8 py-6">Net Value</th>
                  <th className="px-8 py-6 text-center">Status</th>
                  <th className="px-8 py-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/50 group transition-all italic relative">
                    <td className="px-8 py-6 font-black text-primary-500">#{order.orderID}</td>
                    <td className="px-8 py-6">
                       <p className="font-black text-slate-900">{order.vendor?.name}</p>
                       <p className="text-[10px] text-slate-400 font-bold not-italic uppercase">Enterprise Supplier</p>
                    </td>
                    <td className="px-8 py-6 text-slate-600 font-bold">{order.items?.length || 1} Items</td>
                    <td className="px-8 py-6 font-black text-slate-900 text-lg">₹{order.totalAmount?.toLocaleString()}</td>
                    <td className="px-8 py-6 text-center">
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${
                          order.status === 'Received' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                       }`}>
                          {order.status}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-right relative">
                       <button 
                         onClick={() => setActiveMenu(activeMenu === order._id ? null : order._id)}
                         className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-primary-500 transition-all"
                       >
                          <MoreHorizontal size={18} />
                       </button>
                       
                       {activeMenu === order._id && (
                         <div className="absolute right-8 top-16 bg-white border border-slate-100 shadow-2xl rounded-2xl p-2 z-50 w-40 animate-in zoom-in-95 duration-200">
                            <button 
                              onClick={() => handleEditOrder(order)}
                              className="w-full flex items-center space-x-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                               <Edit size={14} className="text-primary-500" />
                               <span>Edit Order</span>
                            </button>
                            <button 
                              onClick={() => handleDeleteOrder(order._id)}
                              className="w-full flex items-center space-x-3 px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                               <Trash2 size={14} />
                               <span>Delete</span>
                            </button>
                         </div>
                       )}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                   <tr>
                      <td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-bold italic">No active procurement orders found.</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {requests.map(req => (
                 <div key={req._id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex justify-between items-start mb-6">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                          req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 
                          req.status === 'Rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                       }`}>
                          {req.status === 'Approved' ? <CheckCircle2 size={24} /> : 
                           req.status === 'Rejected' ? <XCircle size={24} /> : <Clock size={24} />}
                       </div>
                       <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                          req.priority === 'High' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500'
                       }`}>{req.priority}</span>
                    </div>
                    
                    <h4 className="text-xl font-black text-slate-900 italic mb-1">{req.itemName}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Vendor: {req.vendor?.name}</p>
                    
                    <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                       <div>
                          <p className="text-[9px] font-black uppercase text-slate-300 tracking-widest">Estimate</p>
                          <p className="text-lg font-black text-slate-900">₹{req.amount.toLocaleString()}</p>
                       </div>
                       <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${
                          req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 
                          req.status === 'Rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                       }`}>{req.status}</span>
                    </div>
                    {req.adminComments && (
                      <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <p className="text-[9px] font-black uppercase text-primary-500 mb-1">Admin Feedback</p>
                         <p className="text-xs text-slate-600 italic">"{req.adminComments}"</p>
                      </div>
                    )}
                 </div>
              ))}
           </div>
           {requests.length === 0 && (
             <div className="py-40 bg-white rounded-[4rem] border border-dashed border-slate-200 flex flex-col items-center justify-center">
                <AlertCircle size={64} className="text-slate-100 mb-6" />
                <p className="text-slate-400 font-black uppercase tracking-[0.2em] italic">No procurement requests in log.</p>
             </div>
           )}
        </div>
      )}

      {/* New Purchase Request Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Generate Procurement Request">
         <form onSubmit={handleSubmitRequest} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Item/Material Name</label>
                  <input 
                    required
                    className="input-field" 
                    value={requestForm.itemName} 
                    onChange={(e) => setRequestForm({...requestForm, itemName: e.target.value})}
                    placeholder="e.g. Steel Girders"
                  />
                </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Target Vendor</label>
                  <select 
                     required
                     className="input-field"
                     value={requestForm.vendor}
                     onChange={(e) => setRequestForm({...requestForm, vendor: e.target.value})}
                  >
                     <option value="">Select Registry Vendor</option>
                     {vendors.map(v => (
                        <option key={v._id} value={v._id}>{v.name}</option>
                     ))}
                  </select>
               </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Quantity</label>
                  <input 
                    type="number"
                    required
                    className="input-field" 
                    value={requestForm.quantity} 
                    onChange={(e) => setRequestForm({...requestForm, quantity: e.target.value})}
                  />
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Estimated Budget</label>
                  <input 
                    type="number"
                    required
                    className="input-field" 
                    value={requestForm.amount} 
                    onChange={(e) => setRequestForm({...requestForm, amount: e.target.value})}
                  />
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Urgency Matrix</label>
                  <select 
                     className="input-field"
                     value={requestForm.priority}
                     onChange={(e) => setRequestForm({...requestForm, priority: e.target.value})}
                  >
                     <option>Low</option>
                     <option>Medium</option>
                     <option>High</option>
                     <option>Urgent</option>
                  </select>
               </div>
            </div>

            <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Procurement Rationale (Description)</label>
               <textarea 
                 className="input-field min-h-[100px]" 
                 placeholder="Why is this purchase required at this time?"
                 value={requestForm.description}
                 onChange={(e) => setRequestForm({...requestForm, description: e.target.value})}
               />
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest mb-1 flex items-center"><ShieldCheck size={14} className="mr-2" /> Approval Protocol</p>
               <p className="text-[10px] text-slate-500 italic">Submitting this request will initiate an administrative review. Orders only activate after Admin authorization.</p>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-5 mt-4 shadow-xl shadow-primary-500/20">
               {isSubmitting ? 'Initiating Authorization...' : 'Submit Procurement Request'}
            </button>
         </form>
      </Modal>

      {/* Edit Order Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Refine Purchase Order">
         {selectedOrder && (
           <form onSubmit={handleUpdateOrder} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Order Identifier</label>
                    <input className="input-field bg-slate-50" readOnly value={selectedOrder.orderID} />
                  </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Dispatch Status</label>
                    <select 
                       className="input-field"
                       value={selectedOrder.status}
                       onChange={(e) => setSelectedOrder({...selectedOrder, status: e.target.value})}
                    >
                       <option>Approved</option>
                       <option>Placed</option>
                       <option>In Transit</option>
                       <option>Received</option>
                       <option>Cancelled</option>
                    </select>
                 </div>
              </div>

              <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Adjust Net Value</label>
                 <input 
                   type="number"
                   className="input-field" 
                   value={selectedOrder.totalAmount}
                   onChange={(e) => setSelectedOrder({...selectedOrder, totalAmount: e.target.value})}
                 />
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 italic">
                 <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest mb-1 flex items-center"><AlertCircle size={14} className="mr-2" /> Modification Protocol</p>
                 <p className="text-[10px] text-slate-500">Updating this order will refine the financial ledger. Ensure all physical documentation matches these changes.</p>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-5 mt-4 shadow-xl shadow-primary-500/20">
                 {isSubmitting ? 'Syncing Ledger...' : 'Commit Operational Changes'}
              </button>
           </form>
         )}
      </Modal>
    </div>
  );
};

export default ERP;
