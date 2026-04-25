import React from 'react';
import { Target, TrendingUp, Award, Zap } from 'lucide-react';

const PerformanceWidget = ({ kpis, goals, rewards }) => {
  return (
    <div className="space-y-8">
      {/* KPI Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black italic mb-8 flex items-center">
            <Target className="mr-3 text-primary-500" /> Key Metrics
          </h3>
          <div className="space-y-6">
            {kpis.map((kpi, i) => (
              <div key={i}>
                <div className="flex justify-between items-end mb-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{kpi.title}</p>
                  <p className="text-sm font-black text-slate-900">{kpi.current} / {kpi.target}{kpi.unit}</p>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-300 transition-all duration-1000"
                    style={{ width: `${Math.min((kpi.current / kpi.target) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
            {kpis.length === 0 && <p className="text-center text-slate-400 italic py-10 font-bold">No KPIs assigned yet.</p>}
          </div>
        </div>

        <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full -mr-32 -mt-32"></div>
           <h3 className="text-xl font-black italic mb-8 flex items-center relative z-10">
            <Award className="mr-3 text-primary-500" /> Recent Accolades
          </h3>
          <div className="space-y-4 relative z-10">
             {rewards.map((reward, i) => (
               <div key={i} className="flex items-center space-x-4 p-4 bg-white/5 rounded-3xl border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-500">
                    <Zap size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-tight">{reward.badgeName}</p>
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{reward.reason}</p>
                  </div>
               </div>
             ))}
             {rewards.length === 0 && <p className="text-center text-white/20 italic py-10 font-bold">Awaiting recognition.</p>}
          </div>
        </div>
      </div>

      {/* Goals Section */}
      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-xl font-black italic mb-8 flex items-center">
          <TrendingUp className="mr-3 text-emerald-500" /> Strategic Goals
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {goals.map((goal, i) => (
             <div key={i} className="p-6 bg-slate-50 rounded-[2.5rem] border border-white hover:border-slate-200 transition-all">
                <div className="flex justify-between items-start mb-4">
                   <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${
                     goal.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-primary-100 text-primary-600'
                   }`}>
                     {goal.status}
                   </div>
                   <p className="text-[9px] font-black text-slate-400 uppercase">{goal.progress}%</p>
                </div>
                <h4 className="font-black text-slate-900 text-sm mb-2 uppercase tracking-tight">{goal.title}</h4>
                <div className="w-full h-1 bg-slate-200 rounded-full mt-4">
                   <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${goal.progress}%` }} />
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceWidget;
