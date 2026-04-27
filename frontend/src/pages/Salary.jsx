import { useState, useEffect } from 'react';
import { 
  DollarSign, Download, Calendar, ArrowUpRight, 
  Wallet, TrendingUp, CreditCard, Loader2, ShieldCheck,
  FileCheck
} from 'lucide-react';
import API from '../utils/api';

const Salary = () => {
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayroll();
  }, []);

  const fetchPayroll = async () => {
    try {
      const { data } = await API.get('/api/hrms/payroll/my');
      setPayroll(data.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const totalEarnings = payroll.reduce((acc, p) => acc + p.netSalary, 0);

  const exportPayroll = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Cycle,Base Salary,Incentives,Deductions,Net Salary\n"
      + payroll.map(p => `${p.month} ${p.year},${p.baseSalary},${p.bonus},${p.deductions},${p.netSalary}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `full_financial_statement_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const exportSinglePayslip = (p) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Description,Amount\n"
      + `Billing Cycle,${p.month} ${p.year}\n`
      + `Base Payout,₹${p.baseSalary}\n`
      + `Incentives,₹${p.bonus || 0}\n`
      + `Deductions,₹${p.deductions || 0}\n`
      + `Net Disbursed,₹${p.netSalary}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `payslip_${p.month}_${p.year}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  if (loading) return (
     <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Accessing Financial Ledger...</p>
     </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight italic">Financial Ledger</h1>
          <p className="text-slate-500 font-medium mt-1 text-xs md:text-sm">Review your personal payroll, bonuses, and tax deductions.</p>
        </div>
        <div className="bg-white px-8 py-4 rounded-[2rem] border border-slate-100 shadow-sm flex items-center space-x-4">
           <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
              <ShieldCheck size={20} />
           </div>
           <div>
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Financial Integrity</p>
              <p className="text-xs font-bold text-slate-700">Audit Status: Verified</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
         {[
           { label: 'Total Payout', val: `₹${(totalEarnings/1000).toFixed(1)}K`, icon: Wallet, color: 'emerald', sub: 'Cumulative' },
           { label: 'Last Disbursed', val: payroll[0] ? `₹${(payroll[0].netSalary/1000).toFixed(1)}K` : '₹0', icon: CreditCard, color: 'primary', sub: payroll[0]?.month || 'N/A' },
           { label: 'YTD Growth', val: '+12.5%', icon: TrendingUp, color: 'amber', sub: 'Projected' },
           { label: 'Tax Registry', val: 'Digital', icon: FileCheck, color: 'rose', sub: 'Form 16' },
         ].map((s, i) => (
           <div key={i} className="bg-white p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-4 md:mb-6">
                 <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 text-slate-400 group-hover:text-emerald-500 rounded-xl md:rounded-2xl flex items-center justify-center transition-colors">
                    <s.icon size={20} md:size={22} />
                 </div>
                 <ArrowUpRight size={16} md:size={18} className="text-slate-200" />
              </div>
              <p className="text-slate-500 text-[8px] md:text-[10px] font-black uppercase tracking-widest italic leading-none mb-2">{s.label}</p>
              <h3 className="text-xl md:text-3xl font-black text-slate-900 leading-none mb-2">{s.val}</h3>
              <p className="text-slate-400 text-[8px] md:text-[9px] font-bold uppercase tracking-widest italic">{s.sub}</p>
           </div>
         ))}
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
         <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
            <h3 className="text-xl font-black italic">Payroll Chronology</h3>
            <button 
              onClick={exportPayroll}
              className="flex items-center space-x-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline"
            >
               <Download size={16} />
               <span>Statement Export</span>
            </button>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
               <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                  <tr>
                     <th className="px-8 py-6 italic">Billing Cycle</th>
                     <th className="px-8 py-6 italic">Base Payout</th>
                     <th className="px-8 py-6 italic">Incentives</th>
                     <th className="px-8 py-6 italic">Deductions</th>
                     <th className="px-8 py-6 italic">Net Disbursed</th>
                     <th className="px-8 py-6 text-right italic">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {payroll.map((p) => (
                     <tr key={p._id} className="hover:bg-slate-50/50 transition-all font-bold">
                        <td className="px-8 py-6">
                           <div className="flex items-center space-x-3">
                              <Calendar size={18} className="text-slate-300" />
                              <span className="text-slate-900">{p.month} {p.year}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6 text-slate-600">₹{p.baseSalary}</td>
                        <td className="px-8 py-6 text-emerald-600">+₹{p.bonus || 0}</td>
                        <td className="px-8 py-6 text-rose-600">-₹{p.deductions || 0}</td>
                        <td className="px-8 py-6 font-black text-lg text-slate-900">₹{p.netSalary}</td>
                        <td className="px-8 py-6 text-right">
                           <button 
                              onClick={() => exportSinglePayslip(p)}
                              className="p-2.5 bg-slate-50 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                           >
                              <Download size={18} />
                           </button>
                        </td>
                     </tr>
                  ))}
                  {payroll.length === 0 && (
                     <tr>
                        <td colSpan="6" className="px-8 py-20 text-center text-slate-300 font-black uppercase text-[10px] italic">No transaction history detected in the vault.</td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default Salary;
