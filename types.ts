
export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  deadline?: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  subtitle?: string; // e.g. "Design Phase 1"
  status: 'active' | 'completed' | 'pending' | 'review';
  totalTime: number; // in seconds
  assigneeAvatar?: string;
  assigneeInitials?: string;
  subtasks?: SubTask[];
  notes?: string;
  dueDate?: string;
  isPriority?: boolean;
  order?: number;
}

export interface InboxTask {
  id: string;
  title: string;
  completed: boolean;
  order?: number;
}

export interface ProjectStats {
  today: number;
  week: number;
  month: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  icon: string;
  themeColor?: string;
  progress: number; // 0-100
  deadline?: string;
  totalTime: number; // Lifetime total seconds
  stats: ProjectStats;
}

export interface Goal {
  id: string;
  period: 'weekly' | 'monthly';
  targetSeconds: number;
  currentSeconds: number;
}

export interface TimerState {
  isActive: boolean;
  startTime: number | null; // Timestamp when timer started
  elapsedBeforeStart: number; // Seconds accumulated before current session
  activeTaskId: string | null; // If null, it's a general project focus or general focus
  activeProjectId: string | null; // Track which project receives time if no specific task is selected
}

export interface Reminder {
  id: string;
  title: string;
  type: 'short-term' | 'long-term';
  dueTime: string; // ISO string or simple time string
  completed: boolean;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  seconds: number;
}

export interface UserSettings {
  name: string;
  avatar: string;
  theme: 'light' | 'dark' | 'system';
  email: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}
