import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { 
  LayoutDashboard, Package, Users, UserCheck, 
  ShoppingCart, UserCircle, LogOut, Menu, X, 
  Bell, Clock, Calendar, FileText, Shield, 
  Zap, IndianRupee, ShieldCheck, Truck, MessageSquare, Megaphone 
} from 'lucide-react';
import { useState } from 'react';

const SidebarItem = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
      active 
        ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/20' 
        : 'text-slate-400 hover:bg-white/5 hover:text-white'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

const MainLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const allNavItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['Admin', 'Manager', 'HR', 'Employee', 'Sales Team'] },
    { to: '/team', icon: UserCheck, label: 'My Team', roles: ['Admin', 'Manager'] },
    { to: '/attendance', icon: Clock, label: 'Attendance', roles: ['Manager', 'HR', 'Employee', 'Sales Team'] },
    { to: '/leaves', icon: Calendar, label: 'Leaves', roles: ['Manager', 'HR', 'Employee', 'Sales Team'] },
    { to: '/tasks', icon: FileText, label: 'Tasks', roles: ['Manager', 'Employee'] },
    { to: '/materials', icon: Package, label: 'Materials', roles: ['Admin', 'Manager'] },
    { to: '/hrms', icon: Users, label: 'HRMS', roles: ['Admin', 'HR'] },
    { to: '/erp', icon: ShoppingCart, label: 'ERP', roles: ['Admin', 'Manager'] },
    { to: '/crm', icon: UserCircle, label: 'CRM', roles: ['Admin', 'Sales Team'] },
    { to: '/salary', icon: IndianRupee, label: 'Salary', roles: ['Employee'] },
    { to: '/field', icon: Zap, label: 'Field Operations', roles: ['Employee'] },
    { to: '/vendors', icon: Truck, label: 'Vendor Management', roles: ['Admin'] },
    { to: '/users', icon: Shield, label: 'Manage Users', roles: ['Admin'] },
    { to: '/approvals', icon: ShieldCheck, label: 'Approval Center', roles: ['Admin'] },
    { to: '/chat', icon: MessageSquare, label: 'Announcement Hub', roles: ['Admin', 'Manager'] },
    { to: '/profile', icon: UserCircle, label: 'Profile', roles: ['Admin', 'Manager', 'HR', 'Employee', 'Sales Team'] },
    { to: '/announcements', icon: Megaphone, label: 'Bulletins', roles: ['Admin', 'Manager', 'HR', 'Employee', 'Sales Team'] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 transition-all duration-300 flex flex-col`}
      >
        <div className="p-6 flex items-center justify-between">
          <div className={`flex items-center space-x-3 ${!isSidebarOpen && 'hidden'}`}>
            <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center shadow-md">
              <span className="text-primary-500 font-extrabold text-xl">S</span>
            </div>
            <span className="text-white font-black text-2xl tracking-tighter">SMT</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="text-slate-400 hover:text-white"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <SidebarItem 
              key={item.to} 
              {...item} 
              active={window.location.pathname === item.to} 
            />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 text-slate-400 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h1 className="text-xl font-semibold text-slate-800 uppercase tracking-wide">
            {navItems.find(i => i.to === window.location.pathname)?.label || 'Dashboard'}
          </h1>
          
          <div className="flex items-center space-x-6">
            <button className="relative text-slate-500 hover:text-primary-600 transition-colors">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">3</span>
            </button>
            <div className="flex items-center space-x-3 border-l pl-6">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.role}</p>
              </div>
              <div className="w-10 h-10 bg-slate-200 rounded-full border-2 border-primary-500 overflow-hidden">
                <img src={`https://ui-avatars.com/api/?name=${user?.name}&background=0ea5e9&color=fff`} alt="avatar" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
