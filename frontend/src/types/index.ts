export interface Company {
  code: string;
  name: string;
}

export interface Branch {
  code: string;
  name: string;
}

export interface UserSession {
  token: string;
  userCode: string;
  fullName: string;
  email?: string;
  photoUrl?: string;
  company: string;
  branch: string;
  branchName: string;
  expiresAt: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: string;
  color: string;
  owner: string;
  createdAt: string;
  totalTasks: number;
  doneTasks: number;
}

export interface BoardColumn {
  id: number;
  boardId: number;
  name: string;
  order: number;
  color: string;
  wipLimit: number;
  tasks?: Task[];
}

export interface Board {
  id: number;
  projectId: number;
  name: string;
  description?: string;
  createdAt: string;
  columns: BoardColumn[];
}

export interface Task {
  id: number;
  columnId: number;
  boardId: number;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: string;
  assignedTo?: string;
  assignedName?: string;
  reporter: string;
  sortOrder: number;
  dueDate?: string;
  startDate?: string;
  createdAt: string;
}

export interface TaskComment {
  id: number;
  taskId: number;
  userCode: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  color: string;
}

export interface CreateTaskDto {
  columnId: number;
  boardId: number;
  title: string;
  description?: string;
  priority: string;
  assignedTo?: string;
  dueDate?: string;
  startDate?: string;
}

export interface UpdateTaskDto {
  title: string;
  description?: string;
  priority: string;
  status: string;
  assignedTo?: string;
  dueDate?: string;
  startDate?: string;
}