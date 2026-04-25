import { useState, useEffect } from 'react';
import { 
  ShieldCheck, Clock, CheckCircle2, XCircle, 
  Search, Filter, ArrowRight, Briefcase, 
  Package, UserPlus, Zap, MessageSquare, AlertCircle,
  ShoppingCart
} from 'lucide-react';
import API from '../utils/api';
import Modal from '../components/Modal';

const ApprovalCenter = () => {
  const [requests, setRequests] = useState({ general: [], deals: [], materials: [], purchases: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Pending');
  const [filterType, setFilterType] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);
  const [adminComment, setAdminComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await API.get('/api/approvals/pending');
      setRequests(data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleAction = async (type, id, status) => {
    setIsSubmitting(true);
    try {
      let endpoint = '';
      if (type === 'Deal') endpoint = `/api/approvals/deal/${id}`;
      else if (type === 'Material') endpoint = `/api/approvals/material/${id}`;
      else if (type === 'Order') endpoint = `/api/approvals/order/${id}`;
      else if (type === 'Purchase') endpoint = `/api/erp/purchase-requests/${id}/approval`;
      else if (type === 'MaterialCreation') endpoint = `/api/approvals/material-creation/${id}`;
      else endpoint = `/api/approvals/general/${id}`;

      await API.put(endpoint, { status, adminComment });
      setSelectedItem(null);
      setAdminComment('');
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const RequestCard = ({ item, type }) => (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
       <div className="flex justify-between items-start mb-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
            type === 'Deal' ? 'bg-amber-50 text-amber-600' : 
            type === 'Material' ? 'bg-blue-50 text-blue-600' : 
            type === 'Order' ? 'bg-rose-50 text-rose-600' : 
            type === 'Purchase' ? 'bg-indigo-50 text-indigo-600' :
            type === 'MaterialCreation' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
          }`}>
             {type === 'Deal' ? <Briefcase size={24} /> : 
              type === 'Order' ? <ShoppingCart size={24} /> :
              type === 'Material' || type === 'MaterialCreation' ? <Package size={24} /> : <Zap size={24} />}
          </div>
          <span className="px-3 py-1 bg-slate-100 text-[9px] font-black uppercase tracking-widest rounded-lg">{type === 'MaterialCreation' ? 'New Material' : type} Request</span>
       </div>
       
       <h4 className="text-lg font-black text-slate-900 italic mb-1">{item.title || item.name || item.material?.name || item.itemName || item.orderID || 'Standard Request'}</h4>
       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
         From: {item.assignedTo?.name || item.employee?.name || item.requester?.name || item.createdBy?.name || 'System User'}
       </p>

       <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
          <div>
             <p className="text-[9px] font-black uppercase text-slate-300 tracking-widest">Priority</p>
             <p className="text-xs font-black text-slate-700 uppercase">Medium Risk</p>
          </div>
          <button 
             onClick={() => setSelectedItem({ ...item, type })}
             className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-500 transition-all"
          >
             Review
          </button>
       </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center space-x-3 mb-2">
              <ShieldCheck className="text-primary-500" size={24} />
              <span className="text-primary-500 font-black uppercase text-[10px] tracking-[0.3em]">Guardian Protocol</span>
           </div>
           <h1 className="text-4xl font-black text-slate-900 italic tracking-tight">Approval Center</h1>
           <p className="text-slate-500 font-medium mt-1">Master oversight for deals, materials, and role-based operational requests.</p>
        </div>

        <div className="flex bg-white p-2 rounded-[1.5rem] shadow-sm border border-slate-100 italic">
           {['Pending', 'History'].map(tab => (
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center space-x-6">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center"><Clock size={22} /></div>
            <div>
               <p className="text-[10px] font-black uppercase text-slate-400">Total Pending</p>
               <h3 className="text-2xl font-black text-slate-900">
               {requests.general.length + requests.deals.length + (requests.mrUsage?.length || 0) + (requests.orders?.length || 0) + (requests.materials?.length || 0) + (requests.purchases?.length || 0)}
               </h3>
            </div>
         </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
           <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Syncing Pending Vectors...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {requests.deals.map(deal => <RequestCard key={deal._id} item={deal} type="Deal" />)}
           {requests.orders?.map(order => <RequestCard key={order._id} item={order} type="Order" />)}
           {requests.materials?.map(mat => <RequestCard key={mat._id} item={mat} type="MaterialCreation" />)}
           {requests.mrUsage?.map(mat => <RequestCard key={mat._id} item={mat} type="Material" />)}
           {requests.general.map(gen => <RequestCard key={gen._id} item={gen} type="General" />)}
           {requests.purchases?.map(p => <RequestCard key={p._id} item={p} type="Purchase" />)}
           
           {(requests.deals.length === 0 && (!requests.orders || requests.orders.length === 0) && (!requests.materials || requests.materials.length === 0) && (!requests.mrUsage || requests.mrUsage.length === 0) && (!requests.purchases || requests.purchases.length === 0) && requests.general.length === 0) && (
             <div className="col-span-full py-40 bg-white rounded-[4rem] border border-dashed border-slate-200 flex flex-col items-center justify-center">
                <CheckCircle2 size={64} className="text-slate-100 mb-6" />
                <p className="text-slate-400 font-black uppercase tracking-[0.2em] italic">All operational vectors cleared.</p>
             </div>
           )}
        </div>
      )}

      {/* Review Modal */}
      <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} title="Operational Review">
         {selectedItem && (
            <div className="space-y-8">
               <div className="bg-slate-900 p-8 rounded-[3rem] text-white">
                  <div className="flex justify-between items-start mb-6">
                     <span className="px-4 py-1.5 bg-white/10 text-[9px] font-black uppercase tracking-widest rounded-full">{selectedItem.type} Vector</span>
                     <AlertCircle size={20} className="text-primary-500" />
                  </div>
                  <h4 className="text-2xl font-black italic mb-2 leading-tight">{selectedItem.title || selectedItem.material?.name}</h4>
                  <p className="text-white/50 font-bold uppercase text-[10px] tracking-widest italic">Authorization Required by Admin</p>
                  
                  {selectedItem.type === 'Material' && (
                    <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10">
                       <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest mb-1">Request Payload</p>
                       <p className="text-sm font-bold">Quantity: {selectedItem.quantity} units</p>
                    </div>
                  )}

                  {(selectedItem.type === 'Deal' || selectedItem.type === 'Purchase') && (
                    <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10">
                       <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest mb-1">{selectedItem.type === 'Deal' ? 'Financial Payload' : 'Estimated Budget'}</p>
                       <p className="text-xl font-black">₹{(selectedItem.value || selectedItem.amount)?.toLocaleString()}</p>
                       {selectedItem.type === 'Purchase' && (
                         <p className="text-[10px] text-white/30 mt-2 italic">Item: {selectedItem.itemName} ({selectedItem.quantity} qty) | Vendor: {selectedItem.vendor?.name}</p>
                       )}
                    </div>
                  )}
               </div>

               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1 italic">Administrative Directives (Comments)</label>
                  <textarea 
                    className="input-field min-h-[120px] py-4" 
                    placeholder="Enter approval/rejection rationale..."
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                  />
               </div>

               <div className="grid grid-cols-2 gap-4 pt-4">
                  <button 
                    onClick={() => handleAction(selectedItem.type, selectedItem._id, 'Rejected')}
                    disabled={isSubmitting}
                    className="py-5 bg-rose-50 text-rose-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-100 transition-all flex items-center justify-center space-x-3"
                  >
                     <XCircle size={18} />
                     <span>Deny Protocol</span>
                  </button>
                  <button 
                    onClick={() => handleAction(selectedItem.type, selectedItem._id, 'Approved')}
                    disabled={isSubmitting}
                    className="py-5 bg-primary-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary-500/20 hover:bg-primary-600 transition-all flex items-center justify-center space-x-3"
                  >
                     <CheckCircle2 size={18} />
                     <span>Authorize Execution</span>
                  </button>
               </div>
            </div>
         )}
      </Modal>
    </div>
  );
};

export default ApprovalCenter;
