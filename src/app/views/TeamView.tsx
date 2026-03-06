import { useApp } from '../context/AppContext';
import { USERS } from '../data';
import { DEPT_HEX, DEPT_ICONS } from '../constants';
import { Avatar } from '../shared/Avatar';
import { ProgressBar } from '../shared/ProgressBar';
import type { Department } from '../types';

export function TeamView() {
  const { loggedInUser, tasks } = useApp();

  const isDirector  = loggedInUser!.role === 'director';
  const departments: Department[] = ['Developer', 'Design', 'Social Media', 'Business Development', 'SEO'];
  const viewDepts   = isDirector ? departments : [loggedInUser!.department as Department];

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-1">Team</h1>
          <p className="text-gray-500">
            {isDirector ? 'All members across Garage Collective' : `Your ${loggedInUser!.department} team`}
          </p>
        </div>

        {viewDepts.map(dept => {
          const leads   = USERS.filter(u => u.role === 'teamLead' && u.department === dept);
          const members = USERS.filter(u => u.role === 'member'   && u.department === dept);
          const all     = [...leads, ...members];

          return (
            <div key={dept} className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: DEPT_HEX[dept] + '18', color: DEPT_HEX[dept] }}>
                  {DEPT_ICONS[dept]}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{dept}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-gray-100 text-gray-500">
                  {all.length} people
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {all.map(user => {
                  const userTasks     = tasks.filter(t => t.assigneeId === user.id);
                  const done          = userTasks.filter(t => t.status === 'done').length;
                  const active        = userTasks.filter(t => t.status === 'inProgress').length;
                  const total         = userTasks.length;
                  const completionPct = total ? Math.round((done / total) * 100) : 0;

                  return (
                    <div key={user.id}
                      className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-[#0D6B50]/20 transition-all">
                      <div className="flex items-start gap-3 mb-4">
                        <Avatar initials={user.avatar} size="lg" status={user.userStatus} />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold mt-1 inline-block
                            ${user.role === 'teamLead' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
                            {user.role === 'teamLead' ? 'Team Lead' : 'Member'}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                        <div className="bg-amber-50 rounded-xl py-2">
                          <p className="text-lg font-black text-amber-600">{userTasks.filter(t => t.status === 'backlog').length}</p>
                          <p className="text-xs text-amber-500 font-medium">To Do</p>
                        </div>
                        <div className="bg-blue-50 rounded-xl py-2">
                          <p className="text-lg font-black text-blue-600">{active}</p>
                          <p className="text-xs text-blue-500 font-medium">Active</p>
                        </div>
                        <div className="bg-green-50 rounded-xl py-2">
                          <p className="text-lg font-black text-green-600">{done}</p>
                          <p className="text-xs text-green-500 font-medium">Done</p>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">Completion</span>
                          <span className="font-bold text-gray-700">{completionPct}%</span>
                        </div>
                        <ProgressBar value={completionPct} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
