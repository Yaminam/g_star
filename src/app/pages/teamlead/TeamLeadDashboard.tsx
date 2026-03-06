import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, FolderKanban, CheckSquare, Activity, CheckCircle2, ListTodo,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { USERS } from '../../data';
import { DEPT_HEX, DEPT_ICONS, STATUS_HEX, PRIORITY_HEX } from '../../constants';
import { Avatar } from '../../shared/Avatar';
import { StatusBadge } from '../../shared/StatusBadge';
import { PriorityBadge } from '../../shared/PriorityBadge';
import { ProgressBar } from '../../shared/ProgressBar';
import type { Department, Status } from '../../types';

export function TeamLeadDashboard({
  onNewProject,
  onAssignTask,
}: {
  onNewProject: () => void;
  onAssignTask: () => void;
}) {
  const { loggedInUser, projects, tasks, handleTaskStatusChange, projectTaskStats } = useApp();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');

  const dept         = loggedInUser!.department as Department;
  const deptProjects = projects.filter(p => p.department === dept);
  const deptTasks    = tasks.filter(t => t.department === dept);
  const teamMembers  = USERS.filter(u => u.department === dept && u.role === 'member');

  const filteredProjects = statusFilter === 'all'
    ? deptProjects
    : deptProjects.filter(p => p.status === statusFilter);

  const allIssues = {
    todo:   deptTasks.filter(t => t.status === 'backlog').length,
    active: deptTasks.filter(t => t.status === 'inProgress').length,
    done:   deptTasks.filter(t => t.status === 'done').length,
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: DEPT_HEX[dept] + '18', color: DEPT_HEX[dept] }}>
                {DEPT_ICONS[dept]}
              </div>
              <h1 className="text-3xl font-black text-gray-900">{dept} Dashboard</h1>
            </div>
            <p className="text-gray-500">Manage your team, projects and task assignments</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onAssignTask}
              className="flex items-center gap-2 px-4 py-2.5 border border-[#0D6B50] text-[#0D6B50] rounded-xl font-semibold hover:bg-[#0D6B50]/5 transition-all">
              <ListTodo size={16} /> Assign Task
            </button>
            <button onClick={onNewProject}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0D6B50] text-white rounded-xl font-semibold hover:bg-[#0a5540] transition-all shadow-sm">
              <Plus size={16} /> New Project
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Department Projects', value: deptProjects.length,                          icon: <FolderKanban size={20}/>, color: '#6366F1', bg: 'bg-indigo-50' },
            { label: 'Total Tasks',          value: allIssues.todo + allIssues.active + allIssues.done, icon: <CheckSquare size={20}/>,  color: '#3B82F6', bg: 'bg-blue-50'   },
            { label: 'In Progress',          value: allIssues.active,                            icon: <Activity size={20}/>,     color: '#F59E0B', bg: 'bg-amber-50'  },
            { label: 'Completed',            value: allIssues.done,                              icon: <CheckCircle2 size={20}/>, color: '#10B981', bg: 'bg-green-50'  },
          ].map(({ label, value, icon, color, bg }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`} style={{ color }}>{icon}</div>
              <p className="text-3xl font-black text-gray-900">{value}</p>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Projects */}
          <div className="col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Department Projects</h2>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:border-[#0D6B50] bg-white">
                <option value="all">All Status</option>
                <option value="backlog">Backlog</option>
                <option value="inProgress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="p-5 space-y-4">
              {filteredProjects.map(proj => (
                <div key={proj.id}
                  onClick={() => navigate(`/app/projects/${proj.id}`)}
                  className="border border-gray-100 rounded-xl p-4 hover:border-[#0D6B50]/30 hover:shadow-sm transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{proj.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{proj.client}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={proj.priority} />
                      <StatusBadge   status={proj.status} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Progress</span>
                      <span className="font-bold text-gray-700">{projectTaskStats[proj.id]?.progress ?? proj.progress}%</span>
                    </div>
                    <ProgressBar value={projectTaskStats[proj.id]?.progress ?? proj.progress} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs font-medium">
                      <span className="text-amber-500">{projectTaskStats[proj.id]?.todo ?? proj.issues.todo} todo</span>
                      <span className="text-blue-500">{projectTaskStats[proj.id]?.active ?? proj.issues.active} active</span>
                      <span className="text-green-500">{projectTaskStats[proj.id]?.done ?? proj.issues.done} done</span>
                    </div>
                    <div className="flex -space-x-2">
                      {proj.team.map((a, i) => (
                        <Avatar key={i} initials={a} size="sm" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Team */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Team Members</h2>
              </div>
              <div className="p-4 space-y-3">
                {teamMembers.map(member => {
                  const mt = deptTasks.filter(t => t.assigneeId === member.id);
                  return (
                    <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <Avatar initials={member.avatar} size="md" status={member.userStatus} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{member.name}</p>
                        <p className="text-xs text-gray-400">
                          {mt.filter(t => t.status === 'inProgress').length} active · {mt.filter(t => t.status === 'done').length} done
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                        ${member.userStatus === 'active'  ? 'bg-green-50 text-green-600'
                        : member.userStatus === 'away'    ? 'bg-yellow-50 text-yellow-600'
                        :                                   'bg-gray-100 text-gray-500'}`}>
                        {member.userStatus}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent tasks */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Recent Tasks</h2>
              </div>
              <div className="p-4 space-y-3">
                {deptTasks.slice(0, 6).map(task => (
                  <div key={task.id} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: PRIORITY_HEX[task.priority] }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{task.title}</p>
                      <p className="text-xs text-gray-400">{task.assignee}</p>
                    </div>
                    <select
                      value={task.status}
                      onChange={e => handleTaskStatusChange(task.id, e.target.value as Status)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-[#0D6B50] bg-white"
                      style={{ color: STATUS_HEX[task.status] }}
                    >
                      <option value="backlog">Backlog</option>
                      <option value="inProgress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
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
