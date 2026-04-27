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
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const toggleMobileMenu = () => setMobileMenuOpen(!isMobileMenuOpen);

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
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } bg-slate-900 transition-all duration-300 flex flex-col fixed inset-y-0 left-0 z-50 lg:relative lg:translate-x-0 shadow-2xl lg:shadow-none`}
      >
        <div className="p-6 flex items-center justify-between">
          <div className={`flex items-center space-x-3 ${(isMobileMenuOpen || isSidebarOpen) ? '' : 'lg:hidden'}`}>
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm overflow-hidden">
              <img src="/logo.png" alt="Smart Track Logo" className="w-full h-full object-contain p-1" />
            </div>
            <span className="text-white font-black text-2xl tracking-tighter">Smart Track</span>
          </div>
          <button 
            onClick={isMobileMenuOpen ? () => setMobileMenuOpen(false) : toggleSidebar}
            className="text-slate-400 hover:text-white"
          >
            {isMobileMenuOpen || isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <div key={item.to} onClick={() => setMobileMenuOpen(false)}>
              <SidebarItem 
                to={item.to} 
                icon={item.icon} 
                label={item.label} 
                active={window.location.pathname === item.to} 
              />
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 text-slate-400 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            {(isSidebarOpen || isMobileMenuOpen) && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden text-slate-600 hover:text-primary-500 transition-colors"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-sm md:text-xl font-bold md:font-semibold text-slate-800 uppercase tracking-wide truncate max-w-[150px] md:max-w-none">
              {navItems.find(i => i.to === window.location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-3 md:space-x-6">
            <button className="relative text-slate-500 hover:text-primary-600 transition-colors">
              <Bell size={20} md:size={22} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">3</span>
            </button>
            <div className="flex items-center space-x-2 md:space-x-3 border-l pl-3 md:pl-6">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-none">{user?.name}</p>
                <p className="text-[10px] text-slate-500 mt-1">{user?.role}</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-200 rounded-full border-2 border-primary-500 overflow-hidden shrink-0">
                <img src={`https://ui-avatars.com/api/?name=${user?.name}&background=0ea5e9&color=fff`} alt="avatar" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
