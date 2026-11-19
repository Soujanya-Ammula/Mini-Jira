import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiFolder, 
  FiCheckSquare, 
  FiUsers, 
  FiLogOut, 
  FiChevronDown, 
  FiPlus, 
  FiSearch,
  FiBell,
  FiHelpCircle,
  FiSettings,
  FiSun,
  FiGlobe,
  FiLayers,
  FiBriefcase
} from 'react-icons/fi';
import { authService, organizationsService } from '../services/api';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [currentOrg, setCurrentOrg] = useState(null);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [showCreateWsModal, setShowCreateWsModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newWsName, setNewWsName] = useState('');

  useEffect(() => {
    let active = true;
    const fetchInitialData = async () => {
      try {
        const userData = await authService.getMe();
        if (active) setUser(userData);

        const orgs = await organizationsService.getOrganizations();
        if (active && orgs && orgs.length > 0) {
          setOrganizations(orgs);
          const savedOrgId = localStorage.getItem('flowtrack_current_org_id');
          const matchedOrg = orgs.find(o => String(o.id) === savedOrgId) || orgs[0];
          setCurrentOrg(matchedOrg);

          if (matchedOrg.workspaces && matchedOrg.workspaces.length > 0) {
            const savedWsId = localStorage.getItem('flowtrack_current_ws_id');
            const matchedWs = matchedOrg.workspaces.find(w => String(w.id) === savedWsId) || matchedOrg.workspaces[0];
            setCurrentWorkspace(matchedWs);
          }
        }
      } catch (err) {
        console.error('Failed to load user or organization state', err);
        authService.removeToken();
        navigate('/login');
      }
    };

    fetchInitialData();
    return () => { active = false; };
  }, [navigate]);

  const handleSelectWorkspace = (org, ws) => {
    setCurrentOrg(org);
    setCurrentWorkspace(ws);
    localStorage.setItem('flowtrack_current_org_id', org.id);
    localStorage.setItem('flowtrack_current_ws_id', ws.id);
    setDropdownOpen(false);
  };

  const handleLogout = () => {
    authService.removeToken();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0] ? parts[0][0].toUpperCase() : 'U';
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <FiHome className="w-4 h-4" /> },
    { name: 'Projects', path: '/projects', icon: <FiFolder className="w-4 h-4" /> },
    { name: 'Issues & Tasks', path: '/tasks', icon: <FiCheckSquare className="w-4 h-4" /> },
    ...((user?.role === 'admin' || user?.role === 'manager') ? [{ name: 'Team & Roles', path: '/users', icon: <FiUsers className="w-4 h-4" /> }] : []),
  ];

  return (
    <div className="flex h-screen bg-[#f1f5f9] text-slate-800 font-sans selection:bg-blue-600 selection:text-white">
      {/* Deep Blue Enterprise Sidebar (Matching 2nd Image) */}
      <aside className="w-64 bg-[#081226] text-white flex flex-col border-r border-[#0f2142] shadow-2xl relative z-30 shrink-0 hidden md:flex select-none">
        {/* Brand & Workspace Header */}
        <div className="p-5 border-b border-white/5 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 p-0.5 shadow-md shadow-blue-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-[#081226] rounded-[10px] flex items-center justify-center">
                  <svg className="w-5 h-5 text-sky-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 12l5 5L20 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M16 10h4M17 14h3M18 18h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">
                Mini Jira
              </span>
            </div>

            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              title="Switch Workspace"
            >
              <FiChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Current Workspace Tagline */}
          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="truncate max-w-[170px] font-medium text-slate-300">
              {currentWorkspace?.name || currentOrg?.name || 'Workspace'}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-sky-400 border border-blue-400/20 uppercase">
              Pro
            </span>
          </div>

          {/* Switcher Dropdown */}
          {dropdownOpen && (
            <div className="absolute top-20 left-4 right-4 bg-[#0d1d3d] rounded-2xl shadow-2xl border border-blue-500/30 p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-2 mb-2 flex items-center justify-between">
                <span>Workspaces</span>
                <button 
                  onClick={() => setShowCreateOrgModal(true)} 
                  className="text-sky-400 hover:text-sky-300 font-bold text-xs"
                >
                  + new
                </button>
              </div>

              <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                {organizations.map((org) => (
                  <div key={org.id} className="border-b border-white/5 pb-1.5 last:border-b-0">
                    <div className="text-xs font-bold text-slate-300 px-2 py-1 flex items-center justify-between">
                      <span className="truncate">{org.name}</span>
                    </div>

                    <div className="pl-2 space-y-0.5 mt-0.5">
                      {org.workspaces?.map((ws) => {
                        const isSelected = currentWorkspace?.id === ws.id;
                        return (
                          <button
                            key={ws.id}
                            onClick={() => handleSelectWorkspace(org, ws)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition ${
                              isSelected
                                ? 'bg-blue-600 text-white font-bold'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <span className="truncate">{ws.name}</span>
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Primary Navigation */}
        <div className="flex-1 p-4 space-y-6 overflow-y-auto">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Menu
            </div>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition text-xs font-medium ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/30'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Favorites / Workflows like Curoky / Jira */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Favorite Projects
            </div>
            <div className="space-y-1">
              <Link to="/tasks" className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:bg-white/5 hover:text-white transition">
                <FiGlobe className="w-3.5 h-3.5 text-sky-400" />
                <span className="truncate">General Workspace</span>
              </Link>
              <Link to="/tasks" className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:bg-white/5 hover:text-white transition">
                <FiLayers className="w-3.5 h-3.5 text-indigo-400" />
                <span className="truncate">UI/UX Sprint</span>
              </Link>
              <Link to="/tasks" className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:bg-white/5 hover:text-white transition">
                <FiBriefcase className="w-3.5 h-3.5 text-emerald-400" />
                <span className="truncate">Web Development</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Tenant Info & Sign Out (Matching 2nd Image) */}
        <div className="p-4 border-t border-white/5 space-y-3">
          {/* Active Tenant Box */}
          <div className="p-3 bg-[#0d1c3b] rounded-2xl border border-blue-500/20">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Active Tenant</span>
            </div>
            <p className="text-xs text-white font-semibold mt-1 truncate">
              {currentOrg?.name || 'Mini Jira Platform'}
            </p>
            <button
              onClick={handleLogout}
              className="mt-2.5 w-full flex items-center justify-center gap-2 py-1.5 text-[11px] font-semibold text-rose-300 hover:bg-rose-500/20 rounded-xl transition cursor-pointer border border-rose-500/20"
            >
              <FiLogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>

          {/* Weather / Status Indicator */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-medium">
            <div className="flex items-center gap-2">
              <FiSun className="text-amber-400" />
              <span>22°C Clear</span>
            </div>
            <span className="text-[10px] text-slate-500">v1.2 SaaS</span>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Modern Top Header (Matching 1st and 2nd Images) */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 py-3.5 flex justify-between items-center shadow-xs">
          {/* Mobile Brand */}
          <div className="text-slate-900 font-bold md:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-extrabold">MJ</div>
            Mini Jira
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center gap-2.5 bg-slate-100 hover:bg-slate-200/60 px-3.5 py-2 rounded-2xl w-80 text-xs text-slate-600 transition">
            <FiSearch className="text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search projects, tasks, or members..." 
              className="bg-transparent border-none outline-none w-full text-xs text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition cursor-pointer">
              <FiBell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100 py-1.5 px-3 rounded-full border border-slate-200/80 transition cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-xs">
                {getInitials(user?.full_name)}
              </div>
              <div className="hidden sm:block text-left pr-1">
                <span className="text-xs font-bold text-slate-800 block leading-tight">
                  {user ? user.full_name : 'Loading...'}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 capitalize block leading-none mt-0.5">
                  {user?.role || 'Member'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8 bg-[#f8fafc]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
