import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, reset } from '../redux/slices/authSlice';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Loader2, AlertCircle } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f2f5f7] px-4 overflow-hidden relative">
      {/* Goibibo-style background accent */}
      <div className="absolute top-0 left-0 w-full h-[200px] md:h-[300px] bg-primary-500 rounded-b-[2rem] md:rounded-b-[4rem]"></div>
      
      <div className="max-w-md w-full z-10">
        <div className="text-center mb-6 md:mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl md:rounded-3xl mb-4 shadow-2xl shadow-primary-500/40 overflow-hidden">
            <img src="/logo.png" alt="Smart Track Logo" className="w-full h-full object-contain p-2" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight italic">Smart Track</h2>
          <p className="text-white/80 font-medium mt-1 text-sm md:text-base">Intelligent Material Management System</p>
        </div>

        <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-2xl shadow-slate-200 border border-white">
          <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">Login to Continue</h3>
          <p className="text-slate-400 text-xs md:text-sm mb-6 md:mb-8">Please enter your credentials</p>

          {isError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-3 text-red-600">
              <AlertCircle size={20} />
              <p className="text-sm font-bold">{message}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-4 text-slate-300" size={20} />
                <input
                  type="text"
                  name="username"
                  value={username}
                  onChange={onChange}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder-slate-300 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none font-medium"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 text-slate-300" size={20} />
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={onChange}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder-slate-300 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
               <button type="button" className="text-xs font-bold text-primary-500 hover:underline">Forgot password?</button>
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
             <p className="text-slate-400 text-xs font-medium">Don't have an account? <span className="text-primary-500 font-bold hover:underline cursor-pointer">Contact System Admin</span></p>
          </div>
        </div>
        
        <p className="text-center mt-8 text-slate-400 text-xs font-bold uppercase tracking-widest opacity-50">
          Powered by Smart Track Enterprise
        </p>
      </div>
    </div>
  );
};

export default Login;
