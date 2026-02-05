
import { Goal, Project, Task, Reminder, DailyLog } from './types';

export const INITIAL_PROJECTS: Project[] = [
  { 
    id: 'p-1', 
    name: 'My First Project', 
    description: 'Start adding tasks to track time...', 
    icon: 'rocket', 
    themeColor: 'bg-blue-500',
    progress: 0,
    totalTime: 0,
    stats: { today: 0, week: 0, month: 0 }
  }
];

export const INITIAL_TASKS: Task[] = [];

export const INITIAL_GOALS: Goal[] = [
  { id: 'g-1', period: 'weekly', targetSeconds: 144000, currentSeconds: 0 }, 
  { id: 'g-2', period: 'monthly', targetSeconds: 576000, currentSeconds: 0 }, 
];

export const INITIAL_REMINDERS: Reminder[] = [];

// Empty logs for a fresh start
export const INITIAL_LOGS: DailyLog[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - i);
  return {
    date: date.toISOString().split('T')[0],
    seconds: 0,
  };
});
