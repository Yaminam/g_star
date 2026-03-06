export type Role = 'director' | 'teamLead' | 'member';
export type Status = 'backlog' | 'inProgress' | 'done';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Department = 'Developer' | 'Design' | 'Social Media' | 'Business Development' | 'SEO';

export interface User {
  id: string;
  name: string;
  role: Role;
  department?: Department;
  avatar: string;
  userStatus: 'active' | 'away' | 'offline';
  email: string;
  tasksCompleted: number;
}

export interface Project {
  id: string;
  name: string;
  department: Department;
  owner: string;
  ownerId: string;
  status: Status;
  progress: number;
  dueDate: string;
  createdDate: string;
  team: string[];
  issues: { todo: number; active: number; done: number };
  priority: Priority;
  description: string;
  client: string;
}

export interface Task {
  id: string;
  title: string;
  projectId: string;
  project: string;
  department: Department;
  priority: Priority;
  status: Status;
  assigneeId: string;
  assignee: string;
  dueDate: string;
  description: string;
  createdById: string;
  createdBy: string;
}

export interface NotifItem {
  id: string;
  triggerUser: string;
  action: string;
  targetName: string;
  timestamp: number;
  unread: boolean;
  type: 'task_assigned' | 'project_created' | 'status_updated' | 'task_completed';
  forRoles: Role[];
  forUserId?: string;
}

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'error';
}
