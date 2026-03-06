import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { User, Project, Task, NotifItem, Toast, Status } from '../types';
import { SEED_PROJECTS, SEED_TASKS, SEED_NOTIFS } from '../data';
import { playNotifSound } from '../helpers';

interface AppContextType {
  loggedInUser: User | null;
  setLoggedInUser: (user: User | null) => void;
  projects: Project[];
  tasks: Task[];
  notifs: NotifItem[];
  toasts: Toast[];
  addToast: (title: string, message: string, type?: Toast['type']) => void;
  handleNewProject: (p: Omit<Project, 'id' | 'createdDate'>) => void;
  handleAssignTask: (t: Omit<Task, 'id'>) => void;
  handleTaskStatusChange: (taskId: string, status: Status) => void;
  handleEditTask: (taskId: string, updates: Partial<Task>) => void;
  handleDeleteTask: (taskId: string) => void;
  handleEditProject: (projectId: string, updates: Partial<Project>) => void;
  handleDeleteProject: (projectId: string) => void;
  updateUserStatus: (status: User['userStatus']) => void;
  markAllRead: () => void;
  myNotifs: NotifItem[];
  unreadCount: number;
  logout: () => void;
  projectTaskStats: Record<string, { todo: number; active: number; done: number; progress: number }>;
  darkMode: boolean;
  toggleDarkMode: () => void;
  overdueCount: number;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>(SEED_PROJECTS);
  const [tasks, setTasks] = useState<Task[]>(SEED_TASKS);
  const [notifs, setNotifs] = useState<NotifItem[]>(SEED_NOTIFS);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    localStorage.setItem('darkMode', String(darkMode));
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => setDarkMode(p => !p), []);

  const addToast = useCallback((title: string, message: string, type: Toast['type'] = 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, title, message, type }]);
    playNotifSound();
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const handleNewProject = useCallback((p: Omit<Project, 'id' | 'createdDate'>) => {
    const newProject: Project = {
      ...p,
      id: `p${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
    };
    setProjects(prev => [newProject, ...prev]);
    const notif: NotifItem = {
      id: `n${Date.now()}`,
      triggerUser: loggedInUser?.name ?? 'Director',
      action: 'created project',
      targetName: newProject.name,
      timestamp: Date.now(),
      unread: true,
      type: 'project_created',
      forRoles: ['director', 'teamLead'],
    };
    setNotifs(prev => [notif, ...prev]);
    addToast('Project Created', `"${newProject.name}" added successfully.`);
  }, [loggedInUser, addToast]);

  const handleAssignTask = useCallback((t: Omit<Task, 'id'>) => {
    const newTask: Task = { ...t, id: `t${Date.now()}` };
    setTasks(prev => [newTask, ...prev]);
    const notif: NotifItem = {
      id: `n${Date.now()}`,
      triggerUser: loggedInUser?.name ?? 'Team Lead',
      action: 'assigned you a task in',
      targetName: newTask.project,
      timestamp: Date.now(),
      unread: true,
      type: 'task_assigned',
      forRoles: ['member'],
      forUserId: newTask.assigneeId,
    };
    setNotifs(prev => [notif, ...prev]);
    addToast('Task Assigned', `"${newTask.title}" assigned to ${newTask.assignee}.`);
  }, [loggedInUser, addToast]);

  const handleTaskStatusChange = useCallback((taskId: string, status: Status) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    if (status === 'done') {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const notif: NotifItem = {
          id: `n${Date.now()}`,
          triggerUser: loggedInUser?.name ?? 'Member',
          action: 'completed task in',
          targetName: task.project,
          timestamp: Date.now(),
          unread: true,
          type: 'task_completed',
          forRoles: ['director', 'teamLead'],
        };
        setNotifs(prev => [notif, ...prev]);
        addToast('Task Done!', `"${task.title}" marked as complete.`);
      }
    }
  }, [tasks, loggedInUser, addToast]);

  const handleEditTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    addToast('Task Updated', 'Task details saved successfully.');
  }, [addToast]);

  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    addToast('Task Deleted', 'Task removed successfully.', 'error');
  }, [addToast]);

  const handleEditProject = useCallback((projectId: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates } : p));
    addToast('Project Updated', 'Project details saved.');
  }, [addToast]);

  const handleDeleteProject = useCallback((projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setTasks(prev => prev.filter(t => t.projectId !== projectId));
    addToast('Project Deleted', 'Project and its tasks removed.', 'error');
  }, [addToast]);

  const updateUserStatus = useCallback((status: User['userStatus']) => {
    setLoggedInUser(prev => prev ? { ...prev, userStatus: status } : prev);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifs(prev => prev.map(n => ({ ...n, unread: false })));
  }, []);

  const logout = useCallback(() => {
    setLoggedInUser(null);
    sessionStorage.clear();
  }, []);

  const myNotifs = loggedInUser
    ? notifs.filter(n =>
        n.forRoles.includes(loggedInUser.role) &&
        (n.forUserId === undefined || n.forUserId === loggedInUser.id)
      )
    : [];

  const unreadCount = myNotifs.filter(n => n.unread).length;

  const overdueCount = useMemo(() => {
    if (!loggedInUser) return 0;
    const today = new Date().toISOString().slice(0, 10);
    const base = loggedInUser.role === 'member'
      ? tasks.filter(t => t.assigneeId === loggedInUser.id)
      : loggedInUser.role === 'teamLead'
      ? tasks.filter(t => t.department === loggedInUser.department)
      : tasks;
    return base.filter(t => t.status !== 'done' && t.dueDate < today).length;
  }, [tasks, loggedInUser]);

  const projectTaskStats = useMemo(() => {
    const map: Record<string, { todo: number; active: number; done: number; progress: number }> = {};
    tasks.forEach(t => {
      if (!map[t.projectId]) map[t.projectId] = { todo: 0, active: 0, done: 0, progress: 0 };
      if      (t.status === 'backlog')    map[t.projectId].todo++;
      else if (t.status === 'inProgress') map[t.projectId].active++;
      else if (t.status === 'done')       map[t.projectId].done++;
    });
    Object.values(map).forEach(s => {
      const total = s.todo + s.active + s.done;
      s.progress = total ? Math.round((s.done / total) * 100) : 0;
    });
    return map;
  }, [tasks]);

  return (
    <AppContext.Provider value={{
      loggedInUser, setLoggedInUser,
      projects, tasks, notifs, toasts,
      addToast,
      handleNewProject, handleAssignTask, handleTaskStatusChange,
      handleEditTask, handleDeleteTask, handleEditProject, handleDeleteProject,
      updateUserStatus,
      markAllRead,
      myNotifs, unreadCount,
      logout,
      projectTaskStats,
      darkMode, toggleDarkMode,
      overdueCount,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
