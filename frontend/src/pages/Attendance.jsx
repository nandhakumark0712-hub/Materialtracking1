import { useState, useEffect } from 'react';
import { Clock, CheckCircle, LogOut as LogOutIcon, Calendar, ArrowRight } from 'lucide-react';
import API from '../utils/api';
import { format } from 'date-fns';

const Attendance = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayRecord, setTodayRecord] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchAttendance();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAttendance = async () => {
    try {
      const { data } = await API.get('/api/attendance/my');
      setHistory(data.data);
      
      const today = new Date().toISOString().split('T')[0];
      const todayRec = data.data.find(r => r.date === today);
      setTodayRecord(todayRec);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      console.log('Initiating Check-In Sequence...');
      const response = await API.post('/api/attendance/checkin');
      console.log('Check-In Successful:', response.data);
      fetchAttendance();
      alert('Mission Authorized: Unit is now on active duty.');
    } catch (error) {
      console.error('Check-In Failure:', error);
      const msg = error.response?.data?.message || 'Authorization failed during check-in sequence.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      await API.put('/api/attendance/checkout');
      fetchAttendance();
    } catch (error) {
      alert(error.response?.data?.message || 'Check-out failed');
    }
  };
  
  const exportAttendance = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Status,Check In,Check Out,Working Hours (hrs)\n"
      + history.map(rec => {
          const date = format(new Date(rec.date), 'MMM dd yyyy');
          const checkIn = format(new Date(rec.checkIn), 'hh:mm a');
          const checkOut = rec.checkOut ? format(new Date(rec.checkOut), 'hh:mm a') : 'N/A';
          return `${date},${rec.status},${checkIn},${checkOut},${rec.workingHours || 0}`;
      }).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Clock & Action Card */}
        <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mb-6">
            <Clock size={40} className="animate-pulse" />
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            {format(currentTime, 'hh:mm:ss a')}
          </h2>
          <p className="text-slate-500 font-medium mb-8">
            {format(currentTime, 'EEEE, MMMM do')}
          </p>
          
           {!todayRecord ? (
            <button 
              onClick={handleCheckIn}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center space-x-2"
            >
              <CheckCircle size={22} />
              <span>Check In Now</span>
            </button>
          ) : !todayRecord.checkOut ? (
            <button 
              onClick={handleCheckOut}
              className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-rose-500/20 transition-all active:scale-95 flex items-center justify-center space-x-2"
            >
              <LogOutIcon size={22} />
              <span>Check Out</span>
            </button>
          ) : (
            <div className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold flex items-center justify-center space-x-2">
              <CheckCircle size={22} />
              <span>Work Finished</span>
            </div>
          )}
          
          {todayRecord && (
            <div className="mt-8 w-full space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Checked In:</span>
                <span className="font-bold text-slate-900">{format(new Date(todayRecord.checkIn), 'hh:mm a')}</span>
              </div>
              {todayRecord.checkOut && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Checked Out:</span>
                  <span className="font-bold text-slate-900">{format(new Date(todayRecord.checkOut), 'hh:mm a')}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* History Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              <Calendar size={20} className="text-primary-500" />
              <span>Recent Attendance</span>
            </h3>
            <button 
              onClick={exportAttendance}
              className="text-sm font-bold text-primary-600 hover:underline"
            >
              Export Report
            </button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left min-w-[500px]">
              <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4 text-right">Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((rec) => (
                  <tr key={rec._id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{format(new Date(rec.date), 'MMM dd, yyyy')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase ${
                        rec.status === 'Present' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-600">
                      {rec.workingHours ? `${rec.workingHours} hrs` : '--:--'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-300 hover:text-primary-500 transition-colors">
                        <ArrowRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
