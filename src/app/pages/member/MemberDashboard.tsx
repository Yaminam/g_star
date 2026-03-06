import {
  ListTodo, Activity, CheckCircle2, CheckSquare, AlertCircle,
  Calendar, FolderKanban,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PRIORITY_HEX, PRIORITY_LABELS } from '../../constants';
import { StatusBadge } from '../../shared/StatusBadge';
import { ProgressBar } from '../../shared/ProgressBar';
import type { Priority, Status } from '../../types';

export function MemberDashboard() {
  const { loggedInUser, tasks, projects, handleTaskStatusChange } = useApp();

  const myTasks    = tasks.filter(t => t.assigneeId === loggedInUser!.id);
  const myProjects = projects.filter(p => p.team.includes(loggedInUser!.avatar));

  const stats = {
    todo:       myTasks.filter(t => t.status === 'backlog').length,
    inProgress: myTasks.filter(t => t.status === 'inProgress').length,
    done:       myTasks.filter(t => t.status === 'done').length,
    total:      myTasks.length,
  };

  const today       = new Date().toISOString().slice(0, 10);
  const urgentTasks = myTasks.filter(
    t => t.status !== 'done' && t.dueDate <= new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
  );

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-1">My Dashboard</h1>
          <p className="text-gray-500">All your tasks, priorities, and project updates in one place</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          {[
            { label: 'To Do',       value: stats.todo,       icon: <ListTodo size={20}/>,     color: '#F59E0B', bg: 'bg-amber-50'  },
            { label: 'In Progress', value: stats.inProgress, icon: <Activity size={20}/>,     color: '#3B82F6', bg: 'bg-blue-50'   },
            { label: 'Completed',   value: stats.done,       icon: <CheckCircle2 size={20}/>, color: '#10B981', bg: 'bg-green-50'  },
            { label: 'Total Tasks', value: stats.total,      icon: <CheckSquare size={20}/>,  color: '#6366F1', bg: 'bg-indigo-50' },
          ].map(({ label, value, icon, color, bg }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`} style={{ color }}>{icon}</div>
              <p className="text-3xl font-black text-gray-900">{value}</p>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Urgent banner */}
        {urgentTasks.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle size={20} className="text-red-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-red-700">
                {urgentTasks.length} task{urgentTasks.length > 1 ? 's' : ''} due within 48 hours
              </p>
              <p className="text-xs text-red-500 mt-0.5">{urgentTasks.map(t => t.title).join(' · ')}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          {/* Tasks by priority */}
          <div className="col-span-2 space-y-6">
            {(['critical', 'high', 'medium', 'low'] as Priority[]).map(priority => {
              const pt = myTasks.filter(t => t.priority === priority);
              if (!pt.length) return null;
              return (
                <div key={priority}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PRIORITY_HEX[priority] }} />
                    <h3 className="font-bold text-gray-900">{PRIORITY_LABELS[priority]} Priority</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">{pt.length}</span>
                  </div>
                  <div className="space-y-3">
                    {pt.map(task => {
                      const isOverdue = task.status !== 'done' && task.dueDate < today;
                      return (
                        <div key={task.id}
                          className={`bg-white border rounded-xl p-4 hover:shadow-md transition-all
                            ${isOverdue ? 'border-red-200 bg-red-50/30' : 'border-gray-100 hover:border-[#0D6B50]/30'}`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0 mr-3">
                              <h4 className="font-bold text-gray-900 text-sm">{task.title}</h4>
                              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                <FolderKanban size={12} /> {task.project}
                              </p>
                              {task.description && <p className="text-xs text-gray-400 mt-1">{task.description}</p>}
                            </div>
                            <StatusBadge status={task.status} />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs" style={{ color: isOverdue ? '#EF4444' : '#6B7280' }}>
                              <Calendar size={12} />
                              <span className={isOverdue ? 'font-bold' : ''}>
                                {isOverdue ? 'Overdue: ' : 'Due: '}{task.dueDate}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {task.status === 'backlog' && (
                                <button onClick={() => handleTaskStatusChange(task.id, 'inProgress')}
                                  className="px-3 py-1.5 bg-[#0D6B50] text-white text-xs font-semibold rounded-lg hover:bg-[#0a5540] transition-colors">
                                  Start Task
                                </button>
                              )}
                              {task.status === 'inProgress' && (
                                <button onClick={() => handleTaskStatusChange(task.id, 'done')}
                                  className="px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600 transition-colors">
                                  Mark Done
                                </button>
                              )}
                              {task.status === 'done' && (
                                <span className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                                  <CheckCircle2 size={14} /> Completed
                                </span>
                              )}
                              <select value={task.status}
                                onChange={e => handleTaskStatusChange(task.id, e.target.value as Status)}
                                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#0D6B50] bg-white text-gray-600">
                                <option value="backlog">Backlog</option>
                                <option value="inProgress">In Progress</option>
                                <option value="done">Done</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {myTasks.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <CheckSquare size={40} className="mx-auto mb-3 opacity-40" />
                <p className="font-medium">No tasks assigned yet</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* My Projects */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">My Projects</h2>
              </div>
              <div className="p-4 space-y-3">
                {myProjects.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No projects assigned</p>}
                {myProjects.map(proj => (
                  <div key={proj.id} className="p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                    <p className="text-xs font-bold text-gray-900 mb-1 truncate">{proj.name}</p>
                    <ProgressBar value={proj.progress} />
                    <div className="flex justify-between mt-1.5">
                      <StatusBadge status={proj.status} />
                      <span className="text-xs text-gray-400 font-medium">{proj.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Completed */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Completed</h2>
              </div>
              <div className="p-4 space-y-2">
                {myTasks.filter(t => t.status === 'done').length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">No completed tasks yet</p>
                )}
                {myTasks.filter(t => t.status === 'done').map(task => (
                  <div key={task.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50">
                    <CheckSquare size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-700">{task.title}</p>
                      <p className="text-xs text-gray-400">{task.project}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
