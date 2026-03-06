import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Crown, Users, User as UserIcon } from 'lucide-react';
import { USERS } from '../../data';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../../shared/Avatar';
import type { Role } from '../../types';

const ROLE_META: Record<Role, {
  label: string;
  badge: string;
  icon: React.ReactElement;
  color: string;
  bg: string;
  border: string;
  perks: string[];
}> = {
  director: {
    label: 'Director',
    badge: 'BOSS',
    icon: <Crown size={20} />,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    perks: [
      'Full platform access & oversight',
      'Create and manage all projects',
      'View all department analytics',
      'Add / remove team members',
      'Access billing & settings',
    ],
  },
  teamLead: {
    label: 'Team Lead',
    badge: 'LEAD',
    icon: <Users size={20} />,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    perks: [
      'Manage your department\'s projects',
      'Assign and track team tasks',
      'View team performance reports',
      'Update task and project statuses',
    ],
  },
  member: {
    label: 'Member',
    badge: 'EMP',
    icon: <UserIcon size={20} />,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    perks: [
      'View and update your assigned tasks',
      'See project progress in your department',
      'Receive task assignment notifications',
      'Mark tasks done and add updates',
    ],
  },
};

export function RoleConfirmStep() {
  const navigate = useNavigate();
  const { setLoggedInUser } = useApp();

  const authRaw = sessionStorage.getItem('gtrack_auth');
  const auth = authRaw ? JSON.parse(authRaw) as { userId: string; email: string; otp: string; verified?: boolean } : null;

  if (!auth?.verified) {
    navigate('/login', { replace: true });
    return null;
  }

  const user = USERS.find(u => u.id === auth.userId);
  if (!user) {
    navigate('/login', { replace: true });
    return null;
  }

  const meta = ROLE_META[user.role];

  function enterDashboard() {
    setLoggedInUser(user!);
    navigate('/app/dashboard', { replace: true });
  }

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-[#0D6B50] rounded-xl flex items-center justify-center">
              <span className="text-white text-lg font-black">G</span>
            </div>
            <span className="text-white text-2xl font-black tracking-tight">G-Track</span>
          </div>
          <p className="text-gray-400 text-sm">Garage Collective · Project Management</p>
        </div>

        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden">
          {/* Header banner */}
          <div className={`${meta.bg} border-b ${meta.border} px-8 py-5`}>
            <div className="flex items-center gap-3">
              <div className={`${meta.color} ${meta.bg} border ${meta.border} w-10 h-10 rounded-xl flex items-center justify-center`}>
                {meta.icon}
              </div>
              <div>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Your Role</p>
                <p className={`text-lg font-bold ${meta.color}`}>{meta.label}</p>
              </div>
              <span className={`ml-auto text-xs font-black px-3 py-1.5 rounded-full ${meta.bg} border ${meta.border} ${meta.color} tracking-widest`}>
                {meta.badge}
              </span>
            </div>
          </div>

          <div className="p-8">
            {/* User identity card */}
            <div className="flex items-center gap-4 mb-7 p-4 bg-[#111111] rounded-xl border border-white/5">
              <Avatar initials={user.avatar} size="lg" status={user.userStatus} />
              <div className="min-w-0">
                <p className="text-white font-bold text-lg leading-tight">{user.name}</p>
                <p className="text-gray-400 text-sm">{user.email}</p>
                {user.department && (
                  <p className="text-gray-500 text-xs mt-0.5">{user.department} Department</p>
                )}
              </div>
              <CheckCircle2 size={20} className="ml-auto text-[#0D6B50] flex-shrink-0" />
            </div>

            {/* Access level breakdown */}
            <div className="mb-7">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-3">Your Access Level</p>
              <ul className="space-y-2">
                {meta.perks.map(perk => (
                  <li key={perk} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <div className="w-4 h-4 rounded-full bg-[#0D6B50]/20 border border-[#0D6B50]/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0D6B50]" />
                    </div>
                    {perk}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={enterDashboard}
              className="w-full bg-[#0D6B50] hover:bg-[#0a5a42] text-white font-bold py-3 rounded-xl transition-colors text-sm tracking-wide"
            >
              Enter Dashboard →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
