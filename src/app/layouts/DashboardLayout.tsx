import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import {
  Bell, LogOut, Home, Users, CheckSquare, X, ChevronDown,
  BarChart2, CalendarDays, User, Sun, Moon, Search,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Avatar } from '../shared/Avatar';
import { DirectorDashboard }  from '../pages/director/DirectorDashboard';
import { TeamLeadDashboard }  from '../pages/teamlead/TeamLeadDashboard';
import { MemberDashboard }    from '../pages/member/MemberDashboard';
import { TeamView }           from '../views/TeamView';
import { TasksView }          from '../views/TasksView';
import { NewProjectModal }    from '../modals/NewProjectModal';
import { AssignTaskModal }    from '../modals/AssignTaskModal';
import { GlobalSearch }       from '../components/GlobalSearch';
import { ProjectDetail }      from '../pages/projects/ProjectDetail';
import { AnalyticsPage }      from '../pages/analytics/AnalyticsPage';
import { CalendarPage }       from '../pages/calendar/CalendarPage';
import { ProfilePage }        from '../pages/profile/ProfilePage';
import { timeAgo }            from '../helpers';

export function DashboardLayout() {
  const navigate = useNavigate();
  const { loggedInUser, toasts, myNotifs, unreadCount, overdueCount, markAllRead, logout, darkMode, toggleDarkMode } = useApp();

  const [showNotifPanel,  setShowNotifPanel]  = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNewProject,  setShowNewProject]  = useState(false);
  const [showAssignTask,  setShowAssignTask]  = useState(false);
  const [showSearch,      setShowSearch]      = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setShowSearch(true); }
      if (e.key === 'Escape') setShowSearch(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!loggedInUser) {
    return <Navigate to="/login" replace />;
  }

  const role    = loggedInUser.role;
  const navBase = 'flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150';
  const navActive   = `${navBase} bg-[#0D6B50] text-white shadow-sm`;
  const navInactive = `${navBase} text-gray-600 hover:bg-gray-100 hover:text-gray-900`;

  const ROLE_BADGE: Record<string, string> = {
    director: 'BOSS',
    teamLead: 'LEAD',
    member:   'EMP',
  };

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* ── Navbar ─────────────────────────────────────────────── */}
      <header className={`border-b shadow-sm sticky top-0 z-30 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-[#0D6B50] rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-black">G</span>
            </div>
            <span className={`font-black text-lg tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>G-Track</span>
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            <NavLink to="/app/dashboard" className={({ isActive }) => isActive ? navActive : navInactive}>
              <Home size={15} /> Dashboard
            </NavLink>
            {(role === 'director' || role === 'teamLead') && (
              <NavLink to="/app/team" className={({ isActive }) => isActive ? navActive : navInactive}>
                <Users size={15} /> Team
              </NavLink>
            )}
            <NavLink to="/app/tasks" className={({ isActive }) => isActive ? navActive : navInactive}>
              <CheckSquare size={15} /> Tasks
              {overdueCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[9px] font-black bg-red-500 text-white rounded-full leading-none">
                  {overdueCount}
                </span>
              )}
            </NavLink>
            <NavLink to="/app/analytics" className={({ isActive }) => isActive ? navActive : navInactive}>
              <BarChart2 size={15} /> Analytics
            </NavLink>
            <NavLink to="/app/calendar" className={({ isActive }) => isActive ? navActive : navInactive}>
              <CalendarDays size={15} /> Calendar
            </NavLink>
          </nav>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-2">
            {/* Search button */}
            <button onClick={() => setShowSearch(true)}
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm transition-colors ${darkMode ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}>
              <Search size={14} />
              <span className="text-xs">Search</span>
              <kbd className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-400' : 'border-gray-200 bg-gray-50 text-gray-500'}`}>⌘K</kbd>
            </button>

            {/* Dark mode toggle */}
            <button onClick={toggleDarkMode}
              className={`p-2 rounded-xl transition-colors ${darkMode ? 'text-yellow-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
              title={darkMode ? 'Light mode' : 'Dark mode'}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifPanel(p => !p); setShowProfileMenu(false); }}
                className={`relative p-2 rounded-xl transition-colors ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#EE0D08] rounded-full text-white text-[9px] font-black flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification panel */}
              {showNotifPanel && (
                <div className={`absolute right-0 top-11 w-80 border rounded-2xl shadow-2xl z-50 overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                  <div className={`flex items-center justify-between px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <span className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>Notifications</span>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-[10px] text-[#0D6B50] hover:underline font-medium">
                          Mark all read
                        </button>
                      )}
                      <button onClick={() => setShowNotifPanel(false)} className={darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}>
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {myNotifs.length === 0 ? (
                      <div className={`text-center py-10 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No notifications</div>
                    ) : myNotifs.map(n => (
                      <div key={n.id}
                        className={`flex items-start gap-3 px-4 py-3 border-b transition-colors ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-50 hover:bg-gray-50'} ${n.unread ? 'bg-[#0D6B50]/5' : ''}`}>
                        <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${n.unread ? 'bg-[#0D6B50]' : 'bg-transparent'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs leading-snug ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <span className="font-semibold">{n.triggerUser}</span> {n.action}{' '}
                            <span className="text-[#0D6B50] font-medium">{n.targetName}</span>
                          </p>
                          <p className={`text-[10px] mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{timeAgo(n.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile menu */}
            <div className="relative">
              <button
                onClick={() => { setShowProfileMenu(p => !p); setShowNotifPanel(false); }}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-xl transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <Avatar initials={loggedInUser.avatar} size="sm" status={loggedInUser.userStatus} />
                <span className={`text-sm font-semibold hidden sm:block ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{loggedInUser.name.split(' ')[0]}</span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-[#0D6B50]/10 text-[#0D6B50]">
                  {ROLE_BADGE[role]}
                </span>
                <ChevronDown size={12} className={`hidden sm:block ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              </button>

              {showProfileMenu && (
                <div className={`absolute right-0 top-11 w-52 border rounded-2xl shadow-2xl z-50 overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                  <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <p className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{loggedInUser.name}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{loggedInUser.email}</p>
                    {loggedInUser.department && (
                      <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{loggedInUser.department}</p>
                    )}
                  </div>
                  <div className="p-2">
                    <button onClick={() => { setShowProfileMenu(false); navigate('/app/profile'); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition-colors ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                      <User size={14} /> My Profile
                    </button>
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 font-medium hover:bg-red-50 rounded-xl transition-colors">
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Page content ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-0">
        <Routes>
          <Route path="dashboard" element={
            role === 'director'
              ? <DirectorDashboard onNewProject={() => setShowNewProject(true)} />
              : role === 'teamLead'
              ? <TeamLeadDashboard onNewProject={() => setShowNewProject(true)} onAssignTask={() => setShowAssignTask(true)} />
              : <MemberDashboard />
          } />
          <Route path="team"             element={<TeamView />} />
          <Route path="tasks"            element={<TasksView />} />
          <Route path="projects/:id"     element={<ProjectDetail />} />
          <Route path="analytics"        element={<AnalyticsPage />} />
          <Route path="calendar"         element={<CalendarPage />} />
          <Route path="profile"          element={<ProfilePage />} />
          <Route path="*"                element={<Navigate to="dashboard" replace />} />
        </Routes>
      </div>

      {/* ── Modals ──────────────────────────────────────────────── */}
      {showNewProject && <NewProjectModal onClose={() => setShowNewProject(false)} />}
      {showAssignTask && <AssignTaskModal onClose={() => setShowAssignTask(false)} />}
      {showSearch     && <GlobalSearch onClose={() => setShowSearch(false)} />}

      {/* ── Toast stack ─────────────────────────────────────────── */}
      <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-50 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id}
            className="pointer-events-auto flex items-start gap-3 bg-white border border-gray-100 rounded-xl shadow-2xl px-4 py-3 min-w-[260px] max-w-sm animate-in slide-in-from-right duration-300">
            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
              toast.type === 'success' ? 'bg-green-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
            }`} />
            <div>
              <p className="text-sm font-bold text-gray-900">{toast.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{toast.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Click-outside overlay for dropdowns */}
      {(showNotifPanel || showProfileMenu) && (
        <div className="fixed inset-0 z-20" onClick={() => { setShowNotifPanel(false); setShowProfileMenu(false); }} />
      )}
    </div>
  );
}
