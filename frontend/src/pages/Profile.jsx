import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  User, Mail, Phone, MapPin, Calendar, 
  Briefcase, Shield, Camera, Lock, Save,
  CheckCircle, AlertCircle, Loader2, Building,
  Users, Target, Zap, MessageSquare, Send
} from 'lucide-react';
import API from '../utils/api';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('View');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Chat with Admin State
  const [messages, setMessages] = useState([]);
  const [adminId, setAdminId] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Forms
  const [editForm, setEditForm] = useState({
    name: '', phone: '', address: '', bio: '', dob: '', gender: '', skills: ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchProfile();
    if (user?.role !== 'Admin') {
      fetchAdminAndMessages();
    }
  }, []);

  // Poll for new messages when Chat tab is active
  useEffect(() => {
    let interval;
    if (activeTab === 'Chat' && adminId) {
      interval = setInterval(async () => {
        try {
          const { data: msgData } = await API.get(`/api/chat/messages/${adminId}`);
          setMessages(msgData.data);
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [activeTab, adminId]);

  const fetchAdminAndMessages = async () => {
    try {
      const { data: adminData } = await API.get('/api/chat/admin-profile');
      const admin = adminData.data;
      if (admin) {
        const id = admin._id || admin.id;
        setAdminId(id);
        const { data: msgData } = await API.get(`/api/chat/messages/${id}`);
        setMessages(msgData.data);
      }
    } catch (err) {
      console.error('Error fetching admin or messages:', err);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data } = await API.get('/api/users/profile');
      setProfileData(data.data);
      setEditForm({
        name: data.data.name || '',
        phone: data.data.phone || '',
        address: data.data.address || '',
        bio: data.data.bio || '',
        dob: data.data.dob ? data.data.dob.split('T')[0] : '',
        gender: data.data.gender || 'Not Specified',
        skills: data.data.skills?.join(', ') || ''
      });
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSendToAdmin = async (e) => {
    e.preventDefault();
    const cleanMsg = chatMessage.trim();
    if (!cleanMsg) return;
    
    if (!adminId) {
      alert('Establishing HQ connection... please try again in a moment.');
      fetchAdminAndMessages();
      return;
    }

    setChatLoading(true);
    try {
      const { data } = await API.post('/api/chat/messages', {
        receiver: adminId,
        content: cleanMsg
      });
      setMessages(prev => [...prev, data.data]);
      setChatMessage('');
    } catch (err) {
      alert('Signal transmission failed. HQ may be offline.');
    } finally {
      setChatLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formattedData = {
        ...editForm,
        skills: editForm.skills.split(',').map(s => s.trim()).filter(s => s)
      };
      await API.put('/api/users/profile', formattedData);
      setIsEditing(false);
      fetchProfile();
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return alert('New passwords do not match');
    }
    setIsSubmitting(true);
    try {
      await API.put('/api/users/change-password', passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Password changed successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Password change failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) return;
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('profileImg', imageFile);
    try {
      await API.put('/api/users/profile/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImageFile(null);
      fetchProfile();
      alert('Profile image updated!');
    } catch (err) {
      alert('Image upload failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[70vh]">
      <Loader2 className="animate-spin text-primary-500" size={48} />
    </div>
  );

  const tabs = user?.role === 'Admin' ? ['View', 'Edit', 'Security'] : ['View', 'Edit', 'Chat', 'Security'];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Profile Header */}
      <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-[100px]"></div>
        <div className="flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-10 relative z-10">
          <div className="relative group">
            <div className="w-40 h-40 rounded-[3rem] bg-white border-4 border-primary-500 overflow-hidden shadow-2xl transition-transform group-hover:scale-105 duration-500">
              <img 
                src={imagePreview || (profileData?.profileImg ? `http://localhost:5000/uploads/field-visits/${profileData.profileImg}` : `https://ui-avatars.com/api/?name=${user?.name}&background=0ea5e9&color=fff&size=256`)} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <label className="absolute bottom-2 right-2 w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-primary-600 transition-all shadow-xl">
               <Camera size={20} />
               <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
            </label>
            {imageFile && (
              <button 
                onClick={handleImageUpload}
                disabled={isSubmitting}
                className="absolute -bottom-14 left-1/2 -translate-x-1/2 px-6 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg"
              >
                {isSubmitting ? 'Uploading...' : 'Save Photo'}
              </button>
            )}
          </div>
          
          <div className="text-center md:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
              <span className="px-4 py-1.5 bg-primary-500/20 text-primary-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-primary-500/30">
                {profileData?.role}
              </span>
              <span className="px-4 py-1.5 bg-white/5 text-white/50 text-[10px] font-black uppercase tracking-widest rounded-full border border-white/10 italic">
                ID: {profileData?.employeeID || profileData?._id?.slice(-8).toUpperCase()}
              </span>
            </div>
            <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none mb-4">{profileData?.name}</h1>
            <p className="text-white/40 font-bold uppercase text-xs tracking-[0.3em] italic flex items-center justify-center md:justify-start">
               <Briefcase size={16} className="mr-3 text-primary-500" /> {profileData?.designation || 'Specialist'} / {profileData?.department || 'Operations'}
            </p>
          </div>
          
          <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 text-center backdrop-blur-xl">
             <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Performance</p>
             <h3 className="text-2xl font-black text-primary-500 italic">{profileData?.totalPoints || 0} PTS</h3>
             <p className="text-[9px] font-bold text-white/20 mt-2 uppercase italic">{profileData?.badges?.length || 0} Badges Earned</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-white p-2 rounded-[2rem] w-max shadow-sm border border-slate-100 italic">
         {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-10 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-primary-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
         ))}
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {activeTab === 'View' && (
            <div className="space-y-8">
              {/* Basic Info */}
              <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-black italic mb-10 flex items-center uppercase tracking-tight">
                  <User className="mr-4 text-primary-500" /> Dossier Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InfoItem icon={Mail} label="Communication Hub" value={profileData?.email} />
                  <InfoItem icon={Phone} label="Direct Line" value={profileData?.phone || 'Not Registered'} />
                  <InfoItem icon={Calendar} label="Deployment Date" value={profileData?.joiningDate ? new Date(profileData.joiningDate).toLocaleDateString() : 'N/A'} />
                  <InfoItem icon={MapPin} label="Base Location" value={profileData?.address || 'Not Specified'} />
                </div>
              </div>

              {/* Work Details & Role Specific */}
              <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-black italic mb-10 flex items-center uppercase tracking-tight">
                  <Shield className="mr-4 text-primary-500" /> Operational Context
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <InfoItem icon={Building} label="Sector/Dept" value={profileData?.department || 'Operations'} />
                   <InfoItem icon={Users} label="Reporting To" value={profileData?.reportingManager?.name || 'System Admin'} />
                   
                   {/* Role specific content */}
                   {profileData?.role === 'Manager' && (
                      <InfoItem icon={Users} label="Personnel Under Command" value="12 Active Staff" />
                   )}
                   {profileData?.role === 'Sales Team' && (
                      <InfoItem icon={Target} label="Current Vector Target" value="₹12.5M" />
                   )}
                </div>
                
                <div className="mt-12 pt-10 border-t border-slate-50">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 italic">Personnel Skills & Proficiencies</p>
                   <div className="flex flex-wrap gap-3">
                      {profileData?.skills?.map((skill, i) => (
                         <span key={i} className="px-6 py-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100">
                            {skill}
                         </span>
                      )) || <p className="text-xs text-slate-300 italic">No skills cataloged.</p>}
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Edit' && (
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-xl font-black italic mb-10 uppercase tracking-tight">Update Profile Parameters</h3>
              <form onSubmit={handleUpdateProfile} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Full Name</label>
                    <input className="input-field" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Phone</label>
                    <input className="input-field" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">DOB</label>
                    <input type="date" className="input-field" value={editForm.dob} onChange={e => setEditForm({...editForm, dob: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Gender</label>
                    <select className="input-field" value={editForm.gender} onChange={e => setEditForm({...editForm, gender: e.target.value})}>
                       <option>Male</option>
                       <option>Female</option>
                       <option>Other</option>
                       <option>Not Specified</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Base Address</label>
                  <textarea className="input-field min-h-[100px] py-4" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Skills (Comma separated)</label>
                  <input className="input-field" value={editForm.skills} onChange={e => setEditForm({...editForm, skills: e.target.value})} placeholder="React, Node.js, Logistics" />
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-5 text-xs tracking-[0.2em] shadow-xl shadow-primary-500/20">
                   {isSubmitting ? 'Syncing...' : 'Authorize Profile Update'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'Chat' && (
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col h-[600px] italic">
               <h3 className="text-xl font-black italic mb-10 uppercase tracking-tight flex items-center">
                  <MessageSquare className="mr-4 text-primary-500" /> Admin Consultation
               </h3>
               
               <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-4 custom-scrollbar">
                  {messages.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-slate-300">
                        <Zap size={48} className="mb-4 opacity-10" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Establishing secure link...</p>
                     </div>
                  ) : (
                     messages.map((m, idx) => (
                        <div key={idx} className={`flex ${String(m.sender) === String(user.id) ? 'justify-end' : 'justify-start'}`}>
                           <div className={`max-w-[80%] p-5 rounded-[2rem] shadow-sm ${String(m.sender) === String(user.id) ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-slate-50 border border-slate-100 text-slate-700 rounded-tl-none'}`}>
                              <p className="text-xs font-bold leading-relaxed">{m.content}</p>
                              <p className={`text-[8px] font-black uppercase mt-2 ${String(m.sender) === String(user.id) ? 'text-white/40 text-right' : 'text-slate-400'}`}>
                                 {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                           </div>
                        </div>
                     ))
                  )}
               </div>

               <form onSubmit={handleSendToAdmin} className="relative mt-auto">
                  <input 
                     className="input-field pr-16 py-5 bg-slate-50 border-none italic font-bold text-xs" 
                     placeholder="Transmit inquiry to HQ..." 
                     value={chatMessage}
                     onChange={e => setChatMessage(e.target.value)}
                     disabled={chatLoading}
                  />
                  <button 
                     type="submit" 
                     disabled={chatLoading || !chatMessage.trim()}
                     className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-primary-500 text-white rounded-2xl flex items-center justify-center hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20"
                  >
                     {chatLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  </button>
               </form>
            </div>
          )}

          {activeTab === 'Security' && (
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-xl font-black italic mb-10 uppercase tracking-tight flex items-center">
                <Lock className="mr-4 text-primary-500" /> Security Protocol
              </h3>
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Current Access Key</label>
                   <input type="password" required className="input-field" value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">New Access Key</label>
                   <input type="password" required className="input-field" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Verify New Key</label>
                   <input type="password" required className="input-field" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-xl">
                   Update Access Credentials
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
           <div className="bg-slate-50 p-10 rounded-[3.5rem] border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Zap size={80} /></div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 italic">Personnel Health</h4>
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                       <span>Profile Completion</span>
                       <span className="text-primary-500">85%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                       <div className="h-full bg-primary-500 w-[85%]" />
                    </div>
                 </div>
                 <div className="pt-6 border-t border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-4">Last Activity Grid</p>
                    <div className="space-y-4">
                       <ActivityRow label="Dashboard Sync" time="2m ago" />
                       <ActivityRow label="Profile Review" time="15m ago" />
                       <ActivityRow label="System Login" time="4h ago" />
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="bg-emerald-50 p-10 rounded-[3.5rem] border border-emerald-100">
              <div className="flex items-center space-x-4 mb-6">
                 <CheckCircle className="text-emerald-500" />
                 <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Account Status</h4>
              </div>
              <p className="text-xs font-bold text-slate-700 mb-2 italic">Your account is fully verified and optimized for all operational protocols.</p>
              <p className="text-[9px] text-slate-400 uppercase font-black">Active Since: {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'N/A'}</p>
           </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center space-x-6 p-6 bg-slate-50 rounded-[2.5rem] border border-white hover:border-slate-100 transition-all">
    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary-500 shadow-sm border border-slate-50">
      <Icon size={20} />
    </div>
    <div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{label}</p>
      <p className="text-sm font-black text-slate-900 tracking-tight mt-0.5">{value || 'N/A'}</p>
    </div>
  </div>
);

const ActivityRow = ({ label, time }) => (
  <div className="flex justify-between items-center text-[10px]">
     <span className="font-bold text-slate-600 italic">{label}</span>
     <span className="text-slate-400 font-medium">{time}</span>
  </div>
);

export default Profile;
