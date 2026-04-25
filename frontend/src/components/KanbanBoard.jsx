import React from 'react';
import { MoreVertical, Clock, AlertCircle } from 'lucide-react';

const KanbanBoard = ({ tasks, onStatusChange }) => {
  const [activeMenu, setActiveMenu] = React.useState(null);

  const columns = [
    { id: 'To Do', title: 'To Do', color: 'slate' },
    { id: 'In Progress', title: 'In Progress', color: 'blue' },
    { id: 'Completed', title: 'Completed', color: 'emerald' }
  ];

  const handleStatusClick = (taskId, newStatus) => {
    onStatusChange(taskId, newStatus);
    setActiveMenu(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
      {columns.map((column) => (
        <div key={column.id} className="flex flex-col bg-slate-100/50 rounded-[2.5rem] p-6 border border-slate-200/50">
          <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="font-black uppercase tracking-widest text-[11px] text-slate-500 flex items-center">
              <span className={`w-2 h-2 rounded-full mr-3 bg-${column.color}-500`}></span>
              {column.title}
              <span className="ml-3 bg-white px-2 py-0.5 rounded-md text-[9px] shadow-sm">
                {tasks.filter(t => t.status === column.id).length}
              </span>
            </h3>
            <button className="p-1 hover:bg-white rounded-lg transition-all text-slate-400">
               <MoreVertical size={14} />
            </button>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
            {tasks.filter(t => t.status === column.id).map((task) => (
              <div 
                key={task._id} 
                className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 hover:border-primary-300 transition-all group cursor-pointer relative"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${
                    task.priority === 'High' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {task.priority}
                  </span>
                  <div className="text-[9px] font-bold text-slate-400 flex items-center">
                    <Clock size={10} className="mr-1" /> {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No Date'}
                  </div>
                </div>
                <h4 className="font-black text-slate-900 text-sm mb-2 group-hover:text-primary-500 transition-colors uppercase tracking-tight">
                  {task.title}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-4">
                  {task.description || 'No description provided for this mission.'}
                </p>
                <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                   <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-primary-500 border-2 border-white flex items-center justify-center text-[8px] text-white font-black">
                        {task.assignedTo?.name?.charAt(0) || 'U'}
                      </div>
                   </div>
                   <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(activeMenu === task._id ? null : task._id);
                        }}
                        className="text-[9px] font-black text-primary-500 uppercase hover:underline"
                      >
                        Update
                      </button>
                      
                      {activeMenu === task._id && (
                        <div className="absolute bottom-full right-0 mb-2 w-32 bg-slate-900 rounded-xl shadow-xl overflow-hidden z-20 border border-white/10">
                           {columns.map(col => (
                              <button
                                key={col.id}
                                onClick={(e) => {
                                   e.stopPropagation();
                                   handleStatusClick(task._id, col.id);
                                }}
                                className={`w-full text-left px-4 py-2 text-[8px] font-black uppercase tracking-widest hover:bg-primary-500 transition-colors ${
                                   task.status === col.id ? 'text-primary-500 bg-white/5' : 'text-white/70'
                                }`}
                              >
                                {col.title}
                              </button>
                           ))}
                        </div>
                      )}
                   </div>
                </div>
              </div>
            ))}
            {tasks.filter(t => t.status === column.id).length === 0 && (
              <div className="h-32 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center">
                <p className="text-[10px] font-bold text-slate-300 uppercase">Empty Sector</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
