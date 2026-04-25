import { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  History, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  User, 
  Calendar,
  AlertCircle,
  ChevronRight,
  Zap,
  Loader2,
  Send,
  ArrowLeft
} from 'lucide-react';
import API from '../utils/api';
import { format } from 'date-fns';

const FieldVisit = () => {
  const [view, setView] = useState('form');
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    clientName: '',
    remarks: '',
    responses: {
      clientAvailable: '',
      inspectionCompleted: '',
      clientApproved: '',
      issuesReported: '',
      followUpRequired: ''
    }
  });

  const questions = [
    { id: 'clientAvailable', label: 'Was the client available during the visit?' },
    { id: 'inspectionCompleted', label: 'Was material/product inspection completed successfully?' },
    { id: 'clientApproved', label: 'Did the client approve the work or service?' },
    { id: 'issuesReported', label: 'Were there any issues reported by the client?' },
    { id: 'followUpRequired', label: 'Is follow-up action required?' }
  ];

  useEffect(() => {
    if (view === 'history') {
      fetchVisits();
    }
  }, [view]);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/api/field-visits/my');
      setVisits(data.data);
    } catch (error) {
      console.error('Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (id, value) => {
    setFormData(prev => ({
      ...prev,
      responses: {
        ...prev.responses,
        [id]: value
      }
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const allAnswered = Object.values(formData.responses).every(val => val !== '');
    if (!allAnswered || !formData.clientName) {
      alert('Please fill all mandatory fields and answer all 5 questions.');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('clientName', formData.clientName);
      data.append('remarks', formData.remarks);
      data.append('responses', JSON.stringify(formData.responses));
      if (image) {
        data.append('image', image);
      }

      await API.post('/api/field-visits', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess(true);
      setFormData({
        clientName: '',
        remarks: '',
        responses: {
          clientAvailable: '',
          inspectionCompleted: '',
          clientApproved: '',
          issuesReported: '',
          followUpRequired: ''
        }
      });
      setImage(null);
      setImagePreview(null);
      setTimeout(() => {
        setSuccess(false);
        setView('history');
      }, 2000);
    } catch (error) {
      console.error('Submission Error:', error.response?.data || error);
      alert(error.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">Field Operations</h1>
          <p className="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-widest">Client Engagement & Technical Verification</p>
        </div>
        
        <div className="flex bg-white p-2 rounded-[1.5rem] shadow-sm border border-slate-100 italic">
          <button 
            onClick={() => setView('form')}
            className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center ${
              view === 'form' ? 'bg-primary-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Plus size={14} className="mr-2" /> New Visit
          </button>
          <button 
            onClick={() => setView('history')}
            className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center ${
              view === 'history' ? 'bg-primary-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <History size={14} className="mr-2" /> Logs
          </button>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-500 text-white p-6 rounded-[2rem] shadow-xl shadow-emerald-500/20 flex items-center justify-between animate-in slide-in-from-top">
          <div className="flex items-center space-x-4">
            <CheckCircle2 size={32} />
            <div>
              <p className="font-black uppercase tracking-tighter text-xl italic">Verification Transmitted</p>
              <p className="text-[10px] font-bold uppercase opacity-80">Documentation successfully synchronized with HQ</p>
            </div>
          </div>
        </div>
      )}

      {view === 'form' ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-10">
              <div className="space-y-6">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center">
                  <ClipboardCheck className="mr-4 text-primary-500" /> Visit Checklist
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Client Identity *</label>
                     <div className="relative">
                        <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                          required
                          className="w-full pl-14 pr-8 py-5 bg-slate-50 border-none rounded-[2rem] text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all"
                          placeholder="Full Client/Site Name"
                          value={formData.clientName}
                          onChange={e => setFormData({...formData, clientName: e.target.value})}
                        />
                     </div>
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Visit Date</label>
                     <div className="relative">
                        <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                          disabled
                          className="w-full pl-14 pr-8 py-5 bg-slate-50 border-none rounded-[2rem] text-sm font-bold opacity-60"
                          value={format(new Date(), 'eeee, MMM d, yyyy')}
                        />
                     </div>
                   </div>
                </div>

                <div className="space-y-4 pt-4">
                  {questions.map((q) => (
                    <div key={q.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50/50 rounded-[2rem] border border-transparent hover:border-slate-100 transition-all">
                      <p className="text-sm font-bold text-slate-700 uppercase tracking-tight mb-4 md:mb-0">{q.label}</p>
                      <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
                        {['Yes', 'No'].map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => handleResponseChange(q.id, option)}
                            className={`px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                              formData.responses[q.id] === option 
                                ? option === 'Yes' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                                : 'text-slate-400 hover:bg-slate-50'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Field Evidence / Photo *</label>
                 <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
                    <div className="relative group">
                       <div className="w-40 h-40 rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary-500">
                          {imagePreview ? (
                             <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                          ) : (
                             <Zap size={32} className="text-slate-200 group-hover:text-primary-500 transition-colors" />
                          )}
                       </div>
                       <input 
                         type="file" 
                         accept="image/*"
                         onChange={handleImageChange}
                         className="absolute inset-0 opacity-0 cursor-pointer"
                       />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                       <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Upload Proof of Visit</p>
                       <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest leading-relaxed">
                          Visual documentation is required for all field visits. <br/> Max size: 5MB (JPG, PNG)
                       </p>
                    </div>
                 </div>
              </div>

              <div className="space-y-4 pt-6">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Additional Field Observations</label>
                <textarea 
                  className="w-full p-8 bg-slate-50 border-none rounded-[3rem] text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all min-h-[150px] resize-none"
                  placeholder="Log any critical remarks, technical issues, or follow-up details..."
                  value={formData.remarks}
                  onChange={e => setFormData({...formData, remarks: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full py-6 bg-slate-900 hover:bg-black text-white rounded-[2.5rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl transition-all flex items-center justify-center space-x-4 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <Send size={18} className="text-primary-500" />
                    <span>Synchronize Visit Data</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="space-y-8">
            <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white relative overflow-hidden group">
               <Zap className="absolute -right-8 -bottom-8 text-white/5 group-hover:scale-125 transition-transform duration-700" size={200} />
               <h3 className="text-xl font-black italic uppercase tracking-tighter mb-4">Verification Policy</h3>
               <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <li className="flex items-start"><CheckCircle2 size={14} className="mr-3 text-primary-500 flex-shrink-0" /> All questions must be answered for successful submission.</li>
                  <li className="flex items-start"><CheckCircle2 size={14} className="mr-3 text-primary-500 flex-shrink-0" /> Geolocation data is captured automatically upon sync.</li>
                  <li className="flex items-start"><CheckCircle2 size={14} className="mr-3 text-primary-500 flex-shrink-0" /> Intentional false reporting may lead to disciplinary action.</li>
               </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40">
               <Loader2 className="animate-spin text-primary-500 mb-4" size={48} />
               <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Retrieving Field Records...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {visits.map((visit) => (
                <div key={visit._id} className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8">
                     <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">{format(new Date(visit.createdAt), 'MMM d, yyyy • HH:mm')}</p>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-primary-500 border border-white shadow-sm overflow-hidden">
                         {visit.imageUrl ? (
                           <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${visit.imageUrl}`} alt="visit" className="w-full h-full object-cover" />
                         ) : (
                           <User size={24} />
                         )}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{visit.clientName}</h3>
                        <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest mt-1">Field Documentation ID: {visit._id.slice(-8)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 mt-6 md:mt-0">
                       <div className="flex -space-x-1">
                          {Object.values(visit.responses).map((res, i) => (
                             <div key={i} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white ${res === 'Yes' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                {res === 'Yes' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                             </div>
                          ))}
                       </div>
                       <button type="button" className="bg-slate-100 p-4 rounded-2xl text-slate-400 group-hover:text-primary-500 group-hover:bg-primary-50 transition-all">
                          <ChevronRight size={20} />
                       </button>
                    </div>
                  </div>
                  {visit.remarks && (
                    <div className="mt-8 pt-6 border-t border-slate-50">
                       <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                         <MessageSquare size={14} className="mr-2 text-primary-500" /> Field Observation
                       </p>
                       <p className="text-sm text-slate-600 mt-2 font-medium italic">"{visit.remarks}"</p>
                    </div>
                  )}
                </div>
              ))}
              {visits.length === 0 && (
                <div className="bg-white py-24 text-center rounded-[4rem] border-2 border-dashed border-slate-100">
                   <AlertCircle size={48} className="mx-auto text-slate-200 mb-4" />
                   <h3 className="text-slate-400 font-black uppercase italic">No Field Documentation Found</h3>
                   <p className="text-slate-300 text-xs font-bold mt-1 uppercase tracking-widest">Start a new visit to log data</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FieldVisit;
