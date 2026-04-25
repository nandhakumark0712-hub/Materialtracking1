import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Materials from './pages/Materials';
import HRMS from './pages/HRMS';
import ERP from './pages/ERP';
import CRM from './pages/CRM';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Tasks from './pages/Tasks';
import UserManagement from './pages/UserManagement';
import TeamManagement from './pages/TeamManagement';
import Salary from './pages/Salary';
import FieldReport from './pages/FieldReport';
import FieldVisit from './pages/FieldVisit';
import ApprovalCenter from './pages/ApprovalCenter';
import VendorManagement from './pages/VendorManagement';
import Profile from './pages/Profile';
import Layout from './layouts/MainLayout';
import Chat from './pages/Chat';
import Announcements from './pages/Announcements';

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        
        <Route path="/" element={user ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="team" element={<TeamManagement />} />
          <Route path="leaves" element={<Leaves />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="materials" element={<Materials />} />
          <Route path="hrms" element={<HRMS />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="erp" element={<ERP />} />
          <Route path="crm" element={<CRM />} />
          <Route path="salary" element={<Salary />} />
          <Route path="field" element={<FieldVisit />} />
          <Route path="approvals" element={<ApprovalCenter />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="vendors" element={<VendorManagement />} />
          <Route path="performance" element={<Dashboard />} /> {/* Will handle in Dashboard or new page */}
          <Route path="self-service" element={<Dashboard />} />
          <Route path="assets" element={<Dashboard />} />
          <Route path="chat" element={<Chat />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
