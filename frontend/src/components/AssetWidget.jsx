import { useState, useEffect } from 'react';
import { Package, Smartphone, Monitor, Laptop, RefreshCw, QrCode, ArrowLeft, Send, Loader2 } from 'lucide-react';
import API from '../utils/api';

const AssetWidget = ({ assets }) => {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestForm, setRequestForm] = useState({
    material: '',
    quantity: '',
    reason: ''
  });

  useEffect(() => {
    if (showRequestForm) {
      fetchMaterials();
    }
  }, [showRequestForm]);

  const fetchMaterials = async () => {
    try {
      const { data } = await API.get('/api/materials');
      setMaterials(data.data);
    } catch (err) {
      console.error('Failed to fetch materials');
    }
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await API.post('/api/materials/request', requestForm);
      alert('Success: Resource request submitted to management for review.');
      setShowRequestForm(false);
      setRequestForm({ material: '', quantity: '', reason: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Laptop': return <Laptop size={20} />;
      case 'Mobile': return <Smartphone size={20} />;
      case 'Monitor': return <Monitor size={20} />;
      default: return <Package size={20} />;
    }
  };

  if (showRequestForm) {
    return (
      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl animate-in slide-in-from-right duration-500 max-w-4xl mx-auto">
        <div className="flex items-center space-x-4 mb-10">
          <button 
            type="button"
            onClick={() => setShowRequestForm(false)}
            className="p-4 bg-slate-100 rounded-2xl text-slate-500 hover:text-primary-500 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter">New Resource Request</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Direct Operational Authorization</p>
          </div>
        </div>

        <form onSubmit={handleRequest} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Select Material Asset *</label>
              <select 
                required 
                className="w-full px-6 py-5 bg-slate-50 border-none rounded-[2rem] text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all appearance-none" 
                value={requestForm.material} 
                onChange={e => setRequestForm({...requestForm, material: e.target.value})}
              >
                <option value="">{materials.length > 0 ? 'Choose item...' : 'No items available in inventory'}</option>
                {materials.map(m => (
                  <option key={m._id} value={m._id}>{m.name} ({m.quantity} {m.unit} in stock)</option>
                ))}
              </select>
              {materials.length === 0 && (
                <p className="text-[10px] text-rose-500 font-bold uppercase mt-1 ml-2">Inventory is currently empty. Please contact Admin.</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Quantity Required *</label>
              <input 
                required 
                type="number" 
                placeholder="0"
                className="w-full px-6 py-5 bg-slate-50 border-none rounded-[2rem] text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all" 
                value={requestForm.quantity} 
                onChange={e => setRequestForm({...requestForm, quantity: e.target.value})} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Business Justification *</label>
            <textarea 
              required 
              rows="4"
              className="w-full px-6 py-5 bg-slate-50 border-none rounded-[2.5rem] text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all resize-none" 
              value={requestForm.reason} 
              onChange={e => setRequestForm({...requestForm, reason: e.target.value})} 
              placeholder="Provide a brief explanation for this resource request..." 
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full py-6 bg-slate-900 hover:bg-black text-white rounded-[2.5rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl transition-all flex items-center justify-center space-x-4 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Send size={18} className="text-primary-500" />
                <span>Transmit Request</span>
              </>
            )}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
         <div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter">Inventory Control</h3>
            <p className="text-slate-500 text-sm font-medium mt-1">Manage and track your assigned company assets.</p>
         </div>
         <div className="flex space-x-4">
            <button type="button" className="bg-slate-100 p-4 rounded-2xl text-slate-600 hover:bg-slate-200 transition-all">
               <QrCode size={24} />
            </button>
            <button 
               type="button"
               onClick={() => setShowRequestForm(true)}
               className="bg-primary-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary-500/20"
            >
               Request Material
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {assets.map((asset, i) => (
          <div key={i} className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 group hover:border-primary-300 transition-all">
             <div className="w-14 h-14 bg-slate-50 text-primary-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {getIcon(asset.type)}
             </div>
             <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest italic">{asset.type}</p>
             <h4 className="text-lg font-black text-slate-900 mt-1 uppercase tracking-tight">{asset.name}</h4>
             <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">SN: {asset.serialNumber}</p>
             
             <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${
                  asset.condition === 'New' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {asset.condition}
                </span>
                <button type="button" className="text-[9px] font-black text-primary-500 uppercase hover:underline flex items-center">
                   <RefreshCw size={12} className="mr-1" /> Return
                </button>
             </div>
          </div>
        ))}
        {assets.length === 0 && (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
             <Package size={48} className="mx-auto text-slate-200 mb-4" />
             <p className="text-slate-400 font-bold italic uppercase">No assets currently assigned to your unit.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetWidget;
