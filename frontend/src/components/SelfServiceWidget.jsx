import React from 'react';
import { FileText, CreditCard, LifeBuoy, Download, Plus, ArrowRight } from 'lucide-react';

const SelfServiceWidget = ({ expenses, tickets, payslips }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Expenses */}
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black italic flex items-center">
              <CreditCard className="mr-3 text-rose-500" /> Expense Claims
            </h3>
            <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center hover:scale-105 transition-transform">
              <Plus size={16} className="mr-2" /> New Request
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="pb-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Category</th>
                  <th className="pb-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Amount</th>
                  <th className="pb-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                  <th className="pb-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {expenses.map((exp, i) => (
                  <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 font-bold text-slate-900 text-sm">{exp.category}</td>
                    <td className="py-4 font-black text-slate-900 text-sm">₹{exp.amount}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                        exp.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 
                        exp.status === 'Rejected' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {exp.status}
                      </span>
                    </td>
                    <td className="py-4 text-[10px] font-bold text-slate-400 uppercase">{new Date(exp.date).toLocaleDateString()}</td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-10 text-center text-slate-400 italic font-bold">No expense records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* HR Tickets */}
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black italic flex items-center">
              <LifeBuoy className="mr-3 text-primary-500" /> Support Desk
            </h3>
            <button className="text-[10px] font-black text-primary-500 uppercase hover:underline flex items-center">
              View History <ArrowRight size={14} className="ml-2" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {tickets.map((ticket, i) => (
               <div key={i} className="p-5 bg-slate-50 rounded-3xl border border-white hover:border-slate-200 transition-all">
                  <div className="flex justify-between mb-2">
                    <span className="text-[8px] font-black uppercase text-primary-500 tracking-widest">{ticket.category}</span>
                    <span className="text-[8px] font-black uppercase text-slate-400">{ticket.status}</span>
                  </div>
                  <p className="font-black text-slate-900 text-xs uppercase tracking-tight mb-1">{ticket.subject}</p>
                  <p className="text-[10px] text-slate-500 line-clamp-1">{ticket.description}</p>
               </div>
             ))}
             {tickets.length === 0 && <p className="col-span-2 text-center text-slate-400 italic py-6 font-bold">No active tickets.</p>}
          </div>
        </div>
      </div>

      {/* Payslips Sidebar */}
      <div className="space-y-8">
        <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white">
           <h3 className="text-xl font-black italic mb-8 flex items-center">
            <FileText className="mr-3 text-primary-500" /> Documents
          </h3>
          <div className="space-y-4">
             {payslips.map((slip, i) => (
               <div key={i} className="flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 rounded-3xl transition-all group cursor-pointer border border-white/5">
                  <div className="flex items-center space-x-4">
                     <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                        <FileText size={18} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-tight">{slip.month} {slip.year}</p>
                        <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Released: {new Date(slip.createdAt).toLocaleDateString()}</p>
                     </div>
                  </div>
                  <Download size={18} className="text-slate-500 group-hover:text-primary-500 transition-colors" />
               </div>
             ))}
             {payslips.length === 0 && <p className="text-center text-white/20 italic py-10 font-bold">No documents available.</p>}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-primary-600 to-indigo-600 p-10 rounded-[3.5rem] text-white shadow-xl shadow-primary-500/20">
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-4">Total Reimbursements</p>
           <h4 className="text-4xl font-black italic">₹4,250</h4>
           <p className="text-[9px] font-bold text-white/60 mt-4 uppercase tracking-widest">Calculated for current fiscal year</p>
        </div>
      </div>
    </div>
  );
};

export default SelfServiceWidget;
