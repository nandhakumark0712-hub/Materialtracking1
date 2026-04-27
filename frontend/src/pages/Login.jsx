import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, reset } from '../redux/slices/authSlice';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Loader2, AlertCircle, ShieldAlert, Phone, Mail, CheckCircle2 } from 'lucide-react';
import Modal from '../components/Modal';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotStatus, setForgotStatus] = useState('idle'); // idle, loading, success

  const { username, password } = formData;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isLoading, isError, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
    dispatch(reset());
  }, [user, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ username, password }));
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setForgotStatus('loading');
    // Simulate API call
    setTimeout(() => {
      setForgotStatus('success');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f2f5f7] px-4 overflow-hidden relative">
      {/* Goibibo-style background accent */}
      <div className="absolute top-0 left-0 w-full h-[250px] md:h-[300px] bg-primary-500 rounded-b-[2rem] md:rounded-b-[4rem]"></div>
      
      <div className="max-w-md w-full z-10">
        <div className="text-center mb-6 md:mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl md:rounded-3xl mb-4 shadow-2xl shadow-primary-500/40 overflow-hidden">
            <img src="/logo.png" alt="Smart Track Logo" className="w-full h-full object-contain p-2" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight italic">Smart Track</h2>
          <p className="text-white/70 font-bold mt-1 text-sm md:text-base">Intelligent Material Management System</p>
        </div>

        <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-2xl shadow-slate-200 border border-white">
          <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">Login to Continue</h3>
          <p className="text-slate-500 text-xs md:text-sm mb-6 md:mb-8">Please enter your credentials</p>

          {isError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-3 text-red-600">
              <AlertCircle size={20} />
              <p className="text-sm font-bold">{message}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-4 text-slate-400" size={20} />
                <input
                  type="text"
                  name="username"
                  value={username}
                  onChange={onChange}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none font-medium"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={onChange}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
               <button 
                  type="button" 
                  onClick={() => {
                     setIsForgotModalOpen(true);
                     setForgotStatus('idle');
                     setForgotUsername('');
                  }}
                  className="text-xs font-bold text-primary-500 hover:underline"
               >
                  Forgot password?
               </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white font-black rounded-full shadow-2xl shadow-primary-500/30 transition-all flex items-center justify-center space-x-2 transform hover:-translate-y-1 uppercase tracking-widest text-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Login to Account</span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 text-center">
             <p className="text-slate-500 text-xs font-medium">
                Don't have an account? <span onClick={() => setIsContactModalOpen(true)} className="text-primary-500 font-bold hover:underline cursor-pointer">Contact System Admin</span>
             </p>
          </div>
        </div>
        
        <p className="text-center mt-8 text-slate-500 text-xs font-bold uppercase tracking-widest opacity-60">
          Powered by Smart Track Enterprise
        </p>
      </div>


      {/* Forgot Password Modal */}
      <Modal 
         isOpen={isForgotModalOpen} 
         onClose={() => setIsForgotModalOpen(false)} 
         title="Password Recovery"
      >
         {forgotStatus === 'success' ? (
            <div className="text-center space-y-6 py-4">
               <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 size={40} />
               </div>
               <div className="space-y-2">
                  <h4 className="text-lg font-black text-slate-900 uppercase italic">Request Transmitted</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed italic px-4">
                     Security protocol initiated for <span className="text-primary-500 font-black">{forgotUsername}</span>. 
                     Please contact your Department Head or the IT Command Center to verify your identity and receive your temporary access key.
                  </p>
               </div>
               <button 
                  onClick={() => setIsForgotModalOpen(false)}
                  className="w-full btn-primary py-4 shadow-xl shadow-primary-500/20"
               >
                  Return to Base
               </button>
            </div>
         ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-6">
               <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex items-start space-x-4">
                  <ShieldAlert size={24} className="text-amber-500 shrink-0 mt-1" />
                  <p className="text-[10px] text-amber-900 font-bold leading-relaxed italic uppercase tracking-wider">
                     Verification Required: Password resets must be authorized by a System Admin to maintain organizational integrity.
                  </p>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Personnel Username / ID</label>
                  <input 
                     required
                     className="input-field py-4" 
                     placeholder="e.g. EMP-001 or jdoe"
                     value={forgotUsername}
                     onChange={e => setForgotUsername(e.target.value)}
                  />
               </div>
               <button 
                  type="submit" 
                  disabled={forgotStatus === 'loading'}
                  className="w-full btn-primary py-4 flex items-center justify-center space-x-3 shadow-xl shadow-primary-500/20"
               >
                  {forgotStatus === 'loading' ? (
                     <Loader2 size={18} className="animate-spin" />
                  ) : (
                     <span>Authorize Reset Request</span>
                  )}
               </button>
            </form>
         )}
      </Modal>

      {/* Contact Admin Modal */}
      <Modal 
         isOpen={isContactModalOpen} 
         onClose={() => setIsContactModalOpen(false)} 
         title="IT Command Center"
      >
         <div className="space-y-8">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
               <h4 className="text-sm font-black uppercase tracking-widest text-primary-400 mb-4 italic">Operational Support</h4>
               <p className="text-xs text-white/60 font-medium leading-relaxed italic">
                  For account activation, role upgrades, or system errors, contact the central administration desk.
               </p>
            </div>

            <div className="space-y-4">
               <div className="flex items-center space-x-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:border-primary-500/30 transition-all">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary-500 shadow-sm border border-slate-50 group-hover:scale-110 transition-transform">
                     <Mail size={20} />
                  </div>
                  <div>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Secure Email</p>
                     <p className="text-sm font-black text-slate-900 tracking-tight mt-0.5 italic">admin@smarttrack.com</p>
                  </div>
               </div>

               <div className="flex items-center space-x-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:border-emerald-500/30 transition-all">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm border border-slate-50 group-hover:scale-110 transition-transform">
                     <Phone size={20} />
                  </div>
                  <div>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Direct Line</p>
                     <p className="text-sm font-black text-slate-900 tracking-tight mt-0.5 italic">+91 98765 43210</p>
                  </div>
               </div>
            </div>

            <button 
               onClick={() => setIsContactModalOpen(false)}
               className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/20"
            >
               Close Transmission
            </button>
         </div>
      </Modal>
    </div>
  );
};

export default Login;
