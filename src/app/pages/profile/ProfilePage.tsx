import { CheckCircle2, Clock, ListTodo, Briefcase, Mail, Activity } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DEPT_HEX } from '../../constants';
import { Avatar } from '../../shared/Avatar';
import { ProgressBar } from '../../shared/ProgressBar';
import { StatusBadge } from '../../shared/StatusBadge';
import { PriorityBadge } from '../../shared/PriorityBadge';

const STATUS_OPTIONS: { value: 'active' | 'away' | 'offline'; label: string; color: string }[] = [
  { value: 'active',  label: 'Active',  color: 'bg-green-500'  },
  { value: 'away',    label: 'Away',    color: 'bg-yellow-400' },
  { value: 'offline', label: 'Offline', color: 'bg-gray-400'   },
];

export function ProfilePage() {
  const { loggedInUser, tasks, projects, updateUserStatus } = useApp();
  if (!loggedInUser) return null;

  const myTasks    = tasks.filter(t => t.assigneeId === loggedInUser.id);
  const myProjects = projects.filter(p => p.team.includes(loggedInUser.avatar));
  const today      = new Date().toISOString().slice(0, 10);

  const stats = {
    total:      myTasks.length,
    todo:       myTasks.filter(t => t.status === 'backlog').length,
    inProgress: myTasks.filter(t => t.status === 'inProgress').length,
    done:       myTasks.filter(t => t.status === 'done').length,
    overdue:    myTasks.filter(t => t.status !== 'done' && t.dueDate < today).length,
  };
  const completionRate = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;

  const ROLE_LABEL: Record<string, string> = {
    director: 'Director (BOSS)',
    teamLead: 'Team Lead',
    member:   'Team Member',
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">My Profile</h1>
          <p className="text-gray-500 dark:text-gray-400">Your account details and task overview</p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Profile card */}
          <div className="col-span-1 space-y-5">
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm text-center">
              <div className="flex justify-center mb-4">
                <Avatar initials={loggedInUser.avatar} size="xl" status={loggedInUser.userStatus} />
              </div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">{loggedInUser.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{ROLE_LABEL[loggedInUser.role]}</p>
              {loggedInUser.department && (
                <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full font-semibold"
                  style={{ background: DEPT_HEX[loggedInUser.department] + '18', color: DEPT_HEX[loggedInUser.department] }}>
                  {loggedInUser.department}
                </span>
              )}
              <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-gray-400">
                <Mail size={12} /> {loggedInUser.email}
              </div>
            </div>

            {/* Status changer */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">Set Status</p>
              <div className="space-y-2">
                {STATUS_OPTIONS.map(opt => (
                  <button key={opt.value}
                    onClick={() => updateUserStatus(opt.value)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all
                      ${loggedInUser.userStatus === opt.value
                        ? 'bg-[#0D6B50]/10 text-[#0D6B50] border border-[#0D6B50]/30'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                    <div className={`w-2.5 h-2.5 rounded-full ${opt.color}`} />
                    {opt.label}
                    {loggedInUser.userStatus === opt.value && (
                      <CheckCircle2 size={14} className="ml-auto text-[#0D6B50]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Completion rate */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Activity size={14} className="text-[#0D6B50]" />
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Completion Rate</p>
              </div>
              <p className="text-4xl font-black text-[#0D6B50] mb-2">{completionRate}%</p>
              <ProgressBar value={completionRate} />
              <p className="text-xs text-gray-400 mt-2">{stats.done} of {stats.total} tasks done</p>
            </div>
          </div>

          {/* Stats + tasks */}
          <div className="col-span-2 space-y-5">
            {/* Task stats */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'To Do',       value: stats.todo,       icon: <ListTodo size={16}/>,     color: '#F59E0B', bg: 'bg-amber-50 dark:bg-amber-900/20'  },
                { label: 'Active',      value: stats.inProgress, icon: <Clock size={16}/>,        color: '#3B82F6', bg: 'bg-blue-50 dark:bg-blue-900/20'    },
                { label: 'Done',        value: stats.done,       icon: <CheckCircle2 size={16}/>, color: '#10B981', bg: 'bg-green-50 dark:bg-green-900/20'  },
                { label: 'Overdue',     value: stats.overdue,    icon: <Briefcase size={16}/>,    color: '#EF4444', bg: 'bg-red-50 dark:bg-red-900/20'      },
              ].map(({ label, value, icon, color, bg }) => (
                <div key={label} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
                  <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-2`} style={{ color }}>{icon}</div>
                  <p className="text-2xl font-black" style={{ color }}>{value}</p>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">{label}</p>
                </div>
              ))}
            </div>

            {/* Active tasks */}
            {myTasks.filter(t => t.status !== 'done').length > 0 && (
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                  <h2 className="font-bold text-gray-900 dark:text-white">Active Tasks</h2>
                </div>
                <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                  {myTasks.filter(t => t.status !== 'done').map(task => {
                    const isOverdue = task.dueDate < today;
                    return (
                      <div key={task.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-colors
                          ${isOverdue ? 'border-red-200 bg-red-50/30 dark:bg-red-900/10' : 'border-gray-100 dark:border-gray-700 hover:border-[#0D6B50]/20'}`}>
                        <PriorityBadge priority={task.priority} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{task.title}</p>
                          <p className="text-xs text-gray-400 truncate">{task.project}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <StatusBadge status={task.status} />
                          <span className={`text-xs ${isOverdue ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                            {isOverdue ? '⚠ ' : ''}{task.dueDate}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* My projects */}
            {myProjects.length > 0 && (
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                  <h2 className="font-bold text-gray-900 dark:text-white">My Projects</h2>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                  {myProjects.map(proj => (
                    <div key={proj.id} className="p-3 border border-gray-100 dark:border-gray-700 rounded-xl hover:border-[#0D6B50]/30 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-xs font-bold text-gray-900 dark:text-white leading-snug">{proj.name}</p>
                        <StatusBadge status={proj.status} />
                      </div>
                      <ProgressBar value={proj.progress} />
                      <p className="text-[10px] text-gray-400 mt-1">{proj.progress}% · {proj.client}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed tasks */}
            {stats.done > 0 && (
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                  <h2 className="font-bold text-gray-900 dark:text-white">Completed Tasks ({stats.done})</h2>
                </div>
                <div className="p-4 space-y-2 max-h-48 overflow-y-auto">
                  {myTasks.filter(t => t.status === 'done').map(task => (
                    <div key={task.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-500 line-through truncate">{task.title}</p>
                        <p className="text-[10px] text-gray-400">{task.project}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
