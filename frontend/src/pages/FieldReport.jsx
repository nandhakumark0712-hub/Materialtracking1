import { useState } from 'react';
import { Camera, Send, CheckCircle2, AlertCircle, Info, HardHat, ClipboardCheck } from 'lucide-react';

const FieldReport = () => {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: '',
    image: null
  });

  const questions = [
    "What is the current site productivity level? (1-10)",
    "Are there any safety hazards identified today?",
    "Is there a sufficient supply of raw materials for the next 24 hours?",
    "Are all active machinery units operating within normal parameters?",
    "Specify any technical bottlenecks encountered during this shift."
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/20">
           <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 italic tracking-tight">Mission Log Transmitted</h2>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">Field Data Synchronized with Management Hub</p>
        <button 
           onClick={() => setSubmitted(false)}
           className="mt-10 btn-primary px-10 py-4"
        >
           Submit New Report
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-slate-900 p-8 md:p-12 rounded-[2rem] md:rounded-[4rem] text-white flex justify-between items-center relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full -mr-32 -mt-32"></div>
         <div>
            <h1 className="text-2xl md:text-4xl font-black italic">Field Operations Report</h1>
            <p className="text-white/50 font-bold uppercase text-[8px] md:text-[10px] tracking-[0.1em] md:tracking-[0.2em] mt-2 italic">Real-time On-Site Intelligence Gathering</p>
         </div>
         <HardHat size={40} md:size={56} className="text-primary-500 relative z-10 hidden sm:block" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2">
            <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[4rem] shadow-sm border border-slate-100">
               <form onSubmit={handleSubmit} className="space-y-8">
                  {questions.map((q, i) => (
                     <div key={i} className="group">
                        <label className="block text-sm font-black text-slate-700 uppercase tracking-tight mb-4 flex items-center">
                           <span className="w-8 h-8 rounded-lg bg-slate-50 text-primary-500 flex items-center justify-center mr-3 text-xs border border-slate-100 group-hover:bg-primary-500 group-hover:text-white transition-colors">0{i+1}</span>
                           {q}
                        </label>
                        <textarea 
                           required
                           name={`q${i+1}`}
                           value={formData[`q${i+1}`]}
                           onChange={handleInputChange}
                           className="input-field h-24 focus:h-32 transition-all resize-none" 
                           placeholder="Enter observation details..."
                        />
                     </div>
                  ))}

                  <div className="pt-8 border-t border-slate-50">
                     <label className="block text-sm font-black text-slate-700 uppercase tracking-tight mb-6 flex items-center">
                        <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center mr-3 text-xs border border-emerald-100"><Camera size={14} /></span>
                        Visual Documentation Upload
                     </label>
                     <div className="relative group cursor-pointer">
                        <input 
                           type="file" 
                           accept="image/*"
                           onChange={handleImageChange}
                           className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" 
                        />
                        <div className="border-4 border-dashed border-slate-100 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 text-center group-hover:border-primary-500/30 group-hover:bg-slate-50 transition-all">
                           {formData.image ? (
                              <div className="flex flex-col items-center">
                                 <CheckCircle2 className="text-emerald-500 mb-2" size={32} />
                                 <p className="text-xs md:text-sm font-bold text-slate-900 uppercase truncate max-w-full px-4">{formData.image.name}</p>
                                 <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 italic">Click to replace file</p>
                              </div>
                           ) : (
                              <div className="flex flex-col items-center">
                                 <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Camera size={24} md:size={32} />
                                 </div>
                                 <p className="text-[11px] md:text-sm font-bold text-slate-400 uppercase tracking-widest">Snap or Upload Field Image</p>
                                 <p className="text-[9px] md:text-[10px] text-slate-300 font-bold uppercase mt-2 italic shadow-current">JPEG, PNG Max 10MB</p>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>

                  <button 
                     type="submit" 
                     disabled={isSubmitting}
                     className="w-full btn-primary py-5 rounded-[2rem] flex items-center justify-center space-x-3 text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary-500/30"
                  >
                     <Send size={20} />
                     <span>{isSubmitting ? 'Synchronizing Data...' : 'Finalize Field Report'}</span>
                  </button>
               </form>
            </div>
         </div>

         <div className="space-y-6">
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest italic mb-6 flex items-center">
                  <Info size={16} className="text-primary-500 mr-2" /> Protocol Guide
               </h3>
               <div className="space-y-4">
                  {[
                     "Observations must be verified by site lead.",
                     "Images should clearly show identified hazards.",
                     "Report is due 15 mins before shift end.",
                     "Technical anomalies require serial IDs."
                  ].map((tip, i) => (
                     <div key={i} className="flex items-start space-x-3 text-xs font-bold text-slate-500 leading-relaxed">
                        <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 shrink-0"></div>
                        <p>{tip}</p>
                     </div>
                  ))}
               </div>
            </div>

            <div className="bg-emerald-500 p-10 rounded-[3.5rem] text-white shadow-xl shadow-emerald-500/20">
               <ClipboardCheck size={32} className="mb-6 opacity-50" />
               <h3 className="text-xl font-black italic leading-tight">Daily Safety compliance reached 100%</h3>
               <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest mt-4">Keep it up, Team!</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default FieldReport;
