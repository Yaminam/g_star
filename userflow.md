# G-Track — User Flows by Role

This document describes every screen and interaction available to each of the three roles in G-Track: **Director**, **Team Lead**, and **Member**.

---

## Authentication Flow (all roles)

All users share the same login sequence before reaching their role-specific dashboard.

```
[/login]  Enter email address
    ↓
[/otp]    Enter 6-digit OTP  (any 6 digits accepted in demo)
    ↓
[/welcome] Role confirmation screen — shows name, role badge, department
    ↓
[/app/dashboard]  Redirected to role dashboard
```

**Logout:** Available at any time via the avatar menu in the top-right navbar → "Sign out" → redirected back to `/login`.

---

## Role 1 — Director

**Example account:** Rajan Kapoor (`rajan@garagecollective.io`)  
**Scope:** Full company visibility across all 5 departments and all 12 seed projects.

---

### Dashboard (`/app/dashboard`)

The Director lands on the **Company Overview** page.

```
Company Overview
├── [+ New Project] button  →  opens NewProjectModal
├── KPI Cards (4)
│   ├── Total Projects  (count + active count)
│   ├── Total Tasks     (count + in-progress count)
│   ├── Critical Issues (projects with critical priority)
│   └── On Track        (projects not overdue)
├── Department Health grid (5 columns)
│   └── Each dept: avg progress %, project count, member count, critical pulse dot
└── All Projects grid (2-column cards)
    ├── Filters: search, status, department, priority
    └── Each card → click → navigates to /app/projects/:id
```

**New Project Modal:**
- Fields: name, client, department, priority, status, due date, description, assign team leads
- Creates project immediately; notification sent to all team leads

---

### Tasks (`/app/tasks`)

Sees **all tasks** across all departments.

```
Tasks — "All Tasks"
├── View toggle: [Table] [Kanban]
├── Filters: search, status, priority, assignee (all members)
├── Bulk actions (when rows checked): Mark Done | Delete
│
├── TABLE VIEW
│   ├── Sortable columns: Task, Assignee, Priority, Due Date, Status
│   ├── Checkbox per row for bulk selection
│   ├── Edit pencil → opens EditTaskModal
│   └── Overdue rows highlighted red
│
└── KANBAN VIEW
    ├── 3 columns: Backlog | In Progress | Done
    ├── Drag card between columns → status updates instantly
    └── Click card → opens EditTaskModal
```

**Edit Task Modal:**
- Edit: title, priority, status, due date, assignee, description
- Delete task with confirmation prompt
- Director can reassign to any member

---

### Project Detail (`/app/projects/:id`)

Reached by clicking any project card on the dashboard.

```
Project Detail — [Project Name]
├── Back button  →  /app/dashboard
├── Header: project name, status badge, priority badge, [Edit Project] button
├── 4 stat cards: Progress % | Backlog | In Progress | Done
│
├── Kanban Board (3 columns)
│   ├── Cards draggable between columns (status update on drop)
│   └── Click card → EditTaskModal
│
└── Right Sidebar
    ├── Project details: client, department, due date, description
    ├── Team members (avatars + names)
    └── Priority breakdown chart
```

**Edit Project Modal (from [Edit Project] button):**
- Edit: name, client, department, status, priority, due date, progress slider, description
- Delete project (cascades — removes all associated tasks) with confirmation

---

### Team (`/app/team`)

```
Team Directory
├── All 12 users listed
├── Filter by department, role, status
├── Each member card: avatar, name, role, department, status dot, task stats
└── (read-only — no add/remove in demo)
```

---

### Analytics (`/app/analytics`)

Director sees **company-wide** charts.

```
Analytics
├── KPI row: Total Tasks | Completed | Overdue | Total Projects
├── Tasks by Department  (stacked bar: backlog/inProgress/done per dept)
├── Status Distribution  (donut pie chart)
├── Member Workload      (horizontal stacked bar per member)
└── Project Progress     (horizontal bar per project, coloured by dept)
```

---

### Calendar (`/app/calendar`)

```
Calendar
├── Month navigation: ← [Month Year] → | [Today]
├── Monthly grid
│   ├── Project deadline dots (coloured by department)
│   └── Task due-date dots
├── Click a day → right panel lists all due projects & tasks for that day
└── Month summary: project deadlines count | tasks due count | overdue count
```

---

### Profile (`/app/profile`)

```
Profile
├── Avatar (xl), name, role badge, email
├── Status changer: [Active] [Away] [Offline]
├── Completion rate progress bar
├── 4 stat cards: To Do | Active | Done | Overdue
├── Active tasks list (overdue ones highlighted)
├── My Projects grid
└── Completed tasks list
```

---

### Global Search (`Ctrl+K` / `⌘K`)

Triggered from the navbar search button or keyboard shortcut.

```
Search overlay
├── Type to search across: Projects | Tasks | Members
├── ↑ ↓  navigate results
├── Enter  jump to result
└── Esc    close
```

---

## Role 2 — Team Lead

**Example accounts:** Priya Shah (Developer), Pooja Nair (Design), Kavita Joshi (Social Media), Arjun Patel (BizDev), Shreya Iyer (SEO)  
**Scope:** Department-level visibility — sees only their own department's projects and tasks.

---

### Dashboard (`/app/dashboard`)

```
[Department] Dashboard  (e.g. "Developer Dashboard")
├── [Assign Task] button  →  opens AssignTaskModal
├── [+ New Project] button  →  opens NewProjectModal
├── KPI Cards (4)
│   ├── Department Projects
│   ├── Total Tasks (dept)
│   ├── In Progress (dept)
│   └── Completed (dept)
│
├── Department Projects grid  (left, 2/3 width)
│   ├── Filter by status
│   └── Each project card → click → /app/projects/:id
│
└── Sidebar (right, 1/3 width)
    ├── Team Members  (only dept members, with status dot + task counts)
    └── Recent Tasks  (last 6 dept tasks with inline status dropdowns)
```

**Assign Task Modal:**
- Fields: title, project (dept projects only), assignee (dept members only), priority, due date, description
- Triggers notification to assigned member

**New Project Modal:**
- Same as Director's — department pre-filled with team lead's department

---

### Tasks (`/app/tasks`)

Sees **department tasks only**.

```
Tasks — "Department Tasks"
├── View toggle: [Table] [Kanban]
├── Filters: search, status, priority, assignee (dept members only)
├── Bulk actions: Mark Done | Delete
│
├── TABLE VIEW
│   ├── Sortable columns: Task, Assignee, Priority, Due Date, Status
│   ├── Edit pencil → EditTaskModal
│   └── Inline status dropdown per row
│
└── KANBAN VIEW
    ├── 3 columns: Backlog | In Progress | Done
    ├── Drag to change status
    └── Click card → EditTaskModal
```

**Edit Task Modal** (team lead can edit any task in their department):
- Edit all fields; can reassign to any dept member
- Delete with confirmation

---

### Project Detail (`/app/projects/:id`)

```
Project Detail
├── Back button  →  /app/dashboard
├── Header + [Edit Project] (only visible if owner or director)
├── Stat cards, Kanban board (drag-and-drop), sidebar
└── Edit Project Modal → edit dept project fields, delete with cascade
```

---

### Team (`/app/team`)

```
Team Directory
├── Shows all users (read-only)
└── Team leads can filter to see their department
```

---

### Analytics (`/app/analytics`)

Team lead sees **their department only**.

```
Analytics
├── KPI row scoped to dept tasks and projects
├── Tasks by Department chart (only their dept bar highlighted)
├── Status Distribution (dept tasks only)
├── Member Workload (dept members only)
└── Project Progress (dept projects only)
```

---

### Calendar (`/app/calendar`)

```
Calendar
├── Shows project deadlines from their department
├── Task dots for dept tasks only
└── Day detail panel shows dept items only
```

---

### Profile (`/app/profile`)

```
Profile
├── Avatar, name, "Team Lead" badge, department badge, email
├── Status changer: Active | Away | Offline
├── Completion stats and task breakdown
├── Active tasks (dept tasks assigned to them)
└── My Projects grid (projects they own)
```

---

## Role 3 — Member

**Example accounts:** Rohit Verma, Anjali Desai, Suresh Kumar, Neha Gupta, Vivek Sharma, Divya Reddy  
**Scope:** Personal visibility — sees only tasks assigned to them. No project creation or task assignment.

---

### Dashboard (`/app/dashboard`)

```
My Dashboard
├── KPI Cards (4)
│   ├── My Tasks (total assigned)
│   ├── In Progress
│   ├── Completed
│   └── Overdue
│
├── My Tasks list  (tasks assigned to me, sorted by due date)
│   └── Inline status dropdown per task
│
└── My Projects section  (projects I'm part of — read-only, progress bars)
```

---

### Tasks (`/app/tasks`)

Sees **only their own assigned tasks**.

```
Tasks — "My Tasks"
├── View toggle: [Table] [Kanban]
├── Filters: search, status, priority
│   (no assignee filter — all tasks belong to them)
├── Bulk action: Mark Done  (no delete — members can't delete)
│
├── TABLE VIEW
│   ├── Sortable columns: Task, Priority, Due Date, Status
│   ├── No assignee column (redundant)
│   ├── Checkbox for bulk "Mark Done"
│   ├── Edit pencil → EditTaskModal (view-only detail; status change only)
│   └── Inline status dropdown
│
└── KANBAN VIEW
    ├── 3 columns: Backlog | In Progress | Done
    ├── Drag cards to change own task status
    └── Click card → task detail (read-only fields except status)
```

> **Note:** Members see the EditTaskModal in read-only mode for metadata fields. They can only change the status of their assigned tasks.

---

### Project Detail (`/app/projects/:id`)

Members can navigate to project detail pages (e.g., via Global Search or Calendar).

```
Project Detail
├── Back button
├── Header: project name, status, priority (no Edit Project button)
├── Stat cards, Kanban (only their tasks are draggable)
└── Sidebar: project details, team members (read-only)
```

---

### Analytics (`/app/analytics`)

Member sees **their department** data.

```
Analytics
├── KPI row: their own assigned task counts
├── Department charts (read-only, dept-scoped)
└── Workload chart highlights their name
```

---

### Calendar (`/app/calendar`)

```
Calendar
├── Shows due dates of tasks assigned to them
├── Project deadline dots for projects they are part of
└── Day detail shows their personal tasks due that day
```

---

### Profile (`/app/profile`)

```
Profile
├── Avatar, name, "Employee" badge, department badge, email
├── Status changer: Active | Away | Offline  (updates visible to team lead)
├── Completion rate progress bar
├── 4 stat cards: To Do | Active | Done | Overdue
├── Active tasks list
└── Completed tasks list
```

---

### Global Search (`Ctrl+K`)

```
Search overlay
├── Projects: shows only projects they are part of
├── Tasks: shows only their assigned tasks
├── Members: shows all users (read-only navigation)
└── Keyboard nav: ↑ ↓ Enter Esc
```

---

## Navigation Summary

```
Navbar (all roles)
├── G-Track logo
├── Dashboard    →  /app/dashboard
├── Team         →  /app/team          [Director + Team Lead only]
├── Tasks        →  /app/tasks         [red badge = overdue count]
├── Analytics    →  /app/analytics
├── Calendar     →  /app/calendar
├── Search bar   →  opens Ctrl+K overlay
├── 🌙/☀ toggle  →  dark / light mode
├── 🔔 bell      →  notification panel (role-scoped)
└── Avatar menu
    ├── My Profile  →  /app/profile
    └── Sign out    →  /login
```

---

## Notification Triggers

| Event | Who gets notified |
|---|---|
| Project created | Director + all Team Leads |
| Task assigned | The assigned member only |
| Task marked done | Director + Team Leads |
| Status update | Director + Team Leads |

Notifications appear in:
- The bell panel (top-right navbar)
- A slide-in toast (bottom-right, auto-dismisses after 3.5 s)
- Unread dot badge on the bell icon
