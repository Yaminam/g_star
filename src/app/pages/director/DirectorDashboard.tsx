import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Layers, CheckSquare, AlertCircle, CheckCircle2,
  Calendar, FolderKanban,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { USERS } from '../../data';
import { DEPT_HEX, DEPT_ICONS, STATUS_HEX, PRIORITY_HEX, PRIORITY_LABELS } from '../../constants';
import { StatusBadge } from '../../shared/StatusBadge';
import { PriorityBadge } from '../../shared/PriorityBadge';
import { ProgressBar } from '../../shared/ProgressBar';
import type { Department, Priority } from '../../types';

export function DirectorDashboard({ onNewProject }: { onNewProject: () => void }) {
  const { projects, tasks, projectTaskStats } = useApp();
  const navigate = useNavigate();

  const [statusFilter,   setStatusFilter]   = useState('all');
  const [deptFilter,     setDeptFilter]     = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [search,         setSearch]         = useState('');

  const departments: Department[] = ['Developer', 'Design', 'Social Media', 'Business Development', 'SEO'];

  const allIssues = {
    todo:   tasks.filter(t => t.status === 'backlog').length,
    active: tasks.filter(t => t.status === 'inProgress').length,
    done:   tasks.filter(t => t.status === 'done').length,
  };
  const totalTasks    = allIssues.todo + allIssues.active + allIssues.done;
  const criticalCount = projects.filter(p => p.priority === 'critical').length;
  const onTrack       = projects.filter(p => p.status !== 'done' && new Date(p.dueDate) > new Date()).length;

  const filtered = projects.filter(p => {
    if (statusFilter   !== 'all' && p.status     !== statusFilter)   return false;
    if (deptFilter     !== 'all' && p.department !== deptFilter)     return false;
    if (priorityFilter !== 'all' && p.priority   !== priorityFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.client.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-1">Company Overview</h1>
            <p className="text-gray-500">Monitor all projects and teams across Garage Collective</p>
          </div>
          <button onClick={onNewProject}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0D6B50] text-white rounded-xl font-semibold hover:bg-[#0a5540] transition-all shadow-sm hover:shadow-md">
            <Plus size={16} /> New Project
          </button>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Total Projects',  value: projects.length, sub: `${projects.filter(p => p.status === 'inProgress').length} active`,  icon: <Layers size={20}/>,        color: '#6366F1', bg: 'bg-indigo-50' },
            { label: 'Total Tasks',     value: totalTasks,      sub: `${allIssues.active} in progress`,                                   icon: <CheckSquare size={20}/>,    color: '#3B82F6', bg: 'bg-blue-50'   },
            { label: 'Critical Issues', value: criticalCount,   sub: 'Need immediate action',                                             icon: <AlertCircle size={20}/>,    color: '#EF4444', bg: 'bg-red-50'    },
            { label: 'On Track',        value: onTrack,         sub: `${projects.filter(p => p.status === 'done').length} completed`,      icon: <CheckCircle2 size={20}/>,   color: '#10B981', bg: 'bg-green-50'  },
          ].map(({ label, value, sub, icon, color, bg }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`} style={{ color }}>{icon}</div>
              <p className="text-3xl font-black text-gray-900">{value}</p>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* Department health */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Department Health</h2>
          <div className="grid grid-cols-5 gap-4">
            {departments.map(dept => {
              const dp      = projects.filter(p => p.department === dept);
              const members = USERS.filter(u => u.department === dept && u.role === 'member').length;
              const avgP    = dp.length ? Math.round(dp.reduce((a, p) => a + (projectTaskStats[p.id]?.progress ?? p.progress), 0) / dp.length) : 0;
              const hasCrit = dp.some(p => p.priority === 'critical' && p.status !== 'done');
              return (
                <div key={dept} className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: DEPT_HEX[dept] + '18', color: DEPT_HEX[dept] }}>
                      {DEPT_ICONS[dept]}
                    </div>
                    {hasCrit && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Critical" />}
                  </div>
                  <p className="text-xs font-bold text-gray-700 mb-1 leading-tight">{dept}</p>
                  <p className="text-2xl font-black text-gray-900">{avgP}%</p>
                  <ProgressBar value={avgP} />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>{dp.length} proj</span>
                    <span>{members} members</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Projects table */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 p-5 border-b border-gray-100 flex-wrap">
            <h2 className="text-lg font-bold text-gray-900 flex-shrink-0">All Projects</h2>
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              <div className="relative">
                <Search size={14} className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0D6B50] w-40" />
              </div>
              {[
                { val: statusFilter,   set: setStatusFilter,   opts: [['all','All Status'],['backlog','Backlog'],['inProgress','In Progress'],['done','Done']] },
                { val: deptFilter,     set: setDeptFilter,     opts: [['all','All Depts'], ...departments.map(d => [d, d])] },
                { val: priorityFilter, set: setPriorityFilter, opts: [['all','All Priority'],['critical','Critical'],['high','High'],['medium','Medium'],['low','Low']] },
              ].map(({ val, set, opts }, i) => (
                <select key={i} value={val} onChange={e => set(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#0D6B50] bg-white">
                  {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              ))}
            </div>
          </div>
          <div className="p-5">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FolderKanban size={40} className="mx-auto mb-3 opacity-40" />
                <p className="font-medium">No projects match filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {filtered.map(project => (
                  <div key={project.id}
                    onClick={() => navigate(`/app/projects/${project.id}`)}
                    className="border border-gray-100 rounded-xl p-5 hover:border-[#0D6B50]/30 hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0 mr-3">
                        <h3 className="font-bold text-gray-900 group-hover:text-[#0D6B50] transition-colors truncate">{project.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{project.client} · {project.owner}</p>
                      </div>
                      <StatusBadge status={project.status} />
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs px-2.5 py-1 rounded-md font-semibold flex items-center gap-1"
                        style={{ background: DEPT_HEX[project.department] + '15', color: DEPT_HEX[project.department] }}>
                        {DEPT_ICONS[project.department]} {project.department}
                      </span>
                      <PriorityBadge priority={project.priority} />
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-gray-500 font-medium">Progress</span>
                        <span className="font-bold text-gray-700">{projectTaskStats[project.id]?.progress ?? project.progress}%</span>
                      </div>
                      <ProgressBar value={projectTaskStats[project.id]?.progress ?? project.progress} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs font-medium">
                        <span className="text-amber-500">{projectTaskStats[project.id]?.todo ?? project.issues.todo} todo</span>
                        <span className="text-blue-500">{projectTaskStats[project.id]?.active ?? project.issues.active} active</span>
                        <span className="text-green-500">{projectTaskStats[project.id]?.done ?? project.issues.done} done</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar size={12} /> {project.dueDate}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
