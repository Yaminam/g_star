import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { USERS } from '../../data';
import { DEPT_HEX } from '../../constants';
import type { Department } from '../../types';

const DEPARTMENTS: Department[] = ['Developer', 'Design', 'Social Media', 'Business Development', 'SEO'];
const STATUS_COLORS = { backlog: '#F59E0B', inProgress: '#3B82F6', done: '#10B981' };

export function AnalyticsPage() {
  const { tasks, projects, loggedInUser } = useApp();
  const today = new Date().toISOString().slice(0, 10);

  const isDirector = loggedInUser?.role === 'director';
  const dept = loggedInUser?.department;

  const viewDepts = isDirector ? DEPARTMENTS : (dept ? [dept] : DEPARTMENTS);

  /* Department task stats */
  const deptTaskData = viewDepts.map(d => ({
    dept: d.replace(' ', '\n'),
    deptFull: d,
    backlog:    tasks.filter(t => t.department === d && t.status === 'backlog').length,
    inProgress: tasks.filter(t => t.department === d && t.status === 'inProgress').length,
    done:       tasks.filter(t => t.department === d && t.status === 'done').length,
  }));

  /* Status distribution */
  const statusDist = [
    { name: 'Backlog',     value: tasks.filter(t => t.status === 'backlog').length,    color: STATUS_COLORS.backlog    },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'inProgress').length, color: STATUS_COLORS.inProgress },
    { name: 'Done',        value: tasks.filter(t => t.status === 'done').length,       color: STATUS_COLORS.done       },
  ];

  /* Member workload */
  const memberData = USERS
    .filter(u => u.role === 'member' && (isDirector || u.department === dept))
    .map(u => {
      const ut = tasks.filter(t => t.assigneeId === u.id);
      return {
        name: u.name.split(' ')[0],
        fullName: u.name,
        total:      ut.length,
        done:       ut.filter(t => t.status === 'done').length,
        inProgress: ut.filter(t => t.status === 'inProgress').length,
        backlog:    ut.filter(t => t.status === 'backlog').length,
        overdue:    ut.filter(t => t.status !== 'done' && t.dueDate < today).length,
      };
    })
    .sort((a, b) => b.total - a.total);

  /* Project progress */
  const projectData = projects
    .filter(p => isDirector || p.department === dept)
    .map(p => ({
      name: p.name.length > 18 ? p.name.slice(0, 18) + '…' : p.name,
      progress: p.progress,
      fill: DEPT_HEX[p.department],
    }))
    .slice(0, 8);

  /* KPI top-line */
  const totalTasks   = tasks.length;
  const doneTasks    = tasks.filter(t => t.status === 'done').length;
  const overdueTasks = tasks.filter(t => t.status !== 'done' && t.dueDate < today).length;
  const completionRate = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400">Performance overview across {isDirector ? 'all departments' : dept}</p>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Total Tasks',     value: totalTasks,      color: '#6366F1', sub: 'across all projects' },
            { label: 'Completed',       value: doneTasks,        color: '#10B981', sub: `${completionRate}% completion rate` },
            { label: 'Overdue',         value: overdueTasks,     color: '#EF4444', sub: 'need immediate action' },
            { label: 'Total Projects',  value: projects.filter(p => isDirector || p.department === dept).length, color: '#3B82F6', sub: `${projects.filter(p => p.status === 'done' && (isDirector || p.department === dept)).length} completed` },
          ].map(({ label, value, color, sub }) => (
            <div key={label} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
              <p className="text-3xl font-black" style={{ color }}>{value}</p>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-0.5">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Task status by dept */}
          <div className="col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 dark:text-white mb-5">Tasks by Department</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deptTaskData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="dept" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  labelFormatter={(_, p) => p[0]?.payload?.deptFull ?? ''}
                />
                <Bar dataKey="done"       name="Done"        stackId="a" fill={STATUS_COLORS.done}       radius={[0,0,0,0]} />
                <Bar dataKey="inProgress" name="In Progress" stackId="a" fill={STATUS_COLORS.inProgress} />
                <Bar dataKey="backlog"    name="Backlog"     stackId="a" fill={STATUS_COLORS.backlog}    radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-5 justify-center mt-3">
              {Object.entries(STATUS_COLORS).map(([k, c]) => (
                <div key={k} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
                  <span className="text-xs text-gray-500 capitalize">{k === 'inProgress' ? 'In Progress' : k}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status distribution pie */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 dark:text-white mb-5">Status Distribution</h2>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusDist} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                  dataKey="value" nameKey="name" paddingAngle={3}>
                  {statusDist.map(entry => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {statusDist.map(d => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{d.name}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Member workload */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 dark:text-white mb-5">Member Workload</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={memberData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={55} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={(v, n) => [v, n]}
                />
                <Bar dataKey="done"       name="Done"        stackId="b" fill="#10B981" />
                <Bar dataKey="inProgress" name="In Progress" stackId="b" fill="#3B82F6" />
                <Bar dataKey="backlog"    name="Backlog"     stackId="b" fill="#F59E0B" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Project progress */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 dark:text-white mb-5">Project Progress</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={projectData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={110} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={v => [`${v}%`, 'Progress']}
                />
                <Bar dataKey="progress" name="Progress" radius={[0, 4, 4, 0]}>
                  {projectData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
