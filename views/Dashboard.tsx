
import React, { useState } from 'react';
import { Goal, Project, Task, TimerState, Reminder, InboxTask } from '../types';
import { TimerDisplay } from '../components/TimerDisplay';
import { ProgressRing } from '../components/ProgressRing';
import { formatDuration } from '../utils';

interface DashboardProps {
  timerState: TimerState;
  goals: Goal[];
  dailyGoalTarget: number;
  dailyProgress: number;
  recentTasks: Task[];
  allTasks: Task[]; 
  projects: Project[];
  reminders: Reminder[];
  inboxTasks: InboxTask[];
  onToggleTimer: (projectId?: string) => void;
  onNavigateToTask: (projectId: string) => void;
  onAddTask: (title: string, projectId: string) => void;
  onAddInboxTask: (title: string) => void;
  onToggleInboxTask: (id: string) => void;
  onNavigateToHistory: () => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  timerState, 
  goals,
  dailyGoalTarget,
  dailyProgress, 
  recentTasks,
  allTasks,
  projects,
  reminders,
  inboxTasks,
  onToggleTimer,
  onNavigateToTask,
  onAddTask,
  onAddInboxTask,
  onToggleInboxTask,
  onNavigateToHistory,
  onToggleSubtask
}) => {
  const [selectedTimerProject, setSelectedTimerProject] = useState<string>(projects[0]?.id || '');
  const [isInboxExpanded, setIsInboxExpanded] = useState(true); // Default open for visibility in grid
  const [inboxInput, setInboxInput] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set());
  
  const weeklyGoal = goals.find(g => g.period === 'weekly') || goals[0];
  const monthlyGoal = goals.find(g => g.period === 'monthly') || goals[1];

  const dailyPercent = Math.min(100, (dailyProgress / dailyGoalTarget) * 100);
  const weeklyPercent = Math.min(100, (weeklyGoal.currentSeconds / weeklyGoal.targetSeconds) * 100);
  const monthlyPercent = Math.min(100, (monthlyGoal.currentSeconds / monthlyGoal.targetSeconds) * 100);

  const selectedProjectDetails = projects.find(p => p.id === selectedTimerProject);

  const currentSessionSeconds = timerState.startTime 
    ? (Date.now() - timerState.startTime) / 1000 
    : 0;
  
  const totalDisplaySeconds = timerState.isActive 
    ? timerState.elapsedBeforeStart + currentSessionSeconds 
    : (selectedProjectDetails?.totalTime || 0);

  const handleInboxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inboxInput.trim()) {
      onAddInboxTask(inboxInput);
      setInboxInput('');
    }
  };

  const toggleTaskExpansion = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(expandedTaskIds);
    if (newSet.has(taskId)) {
        newSet.delete(taskId);
    } else {
        newSet.add(taskId);
    }
    setExpandedTaskIds(newSet);
  };

  const snapshotReminders = reminders
    .filter(r => !r.completed && r.type === 'short-term')
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-8 pb-32 animate-in fade-in duration-700 w-full">
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl px-6 pt-4 pb-4 flex items-end justify-between border-b border-border/50 transition-all">
         <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground leading-none">Dashboard</h1>
            <p className="text-sm font-semibold text-muted-foreground mt-1.5">Overview & Focus</p>
         </div>
      </div>

      <div className="px-6 flex flex-col lg:grid lg:grid-cols-12 lg:gap-8 max-w-7xl mx-auto w-full">

        {/* --- LEFT COLUMN (Main Focus) --- */}
        <div className="flex flex-col gap-8 lg:col-span-7 xl:col-span-8">
            
            {/* Hero Timer Card */}
            <div className="relative w-full rounded-[2.5rem] bg-primary text-primary-foreground p-8 sm:p-12 shadow-2xl shadow-primary/20 overflow-visible group transition-all duration-300 ring-1 ring-white/10">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="relative flex flex-col items-center gap-10 z-10">
                
                {/* Custom Project Selector */}
                {!timerState.isActive ? (
                    <div className="relative w-full max-w-[260px]">
                    <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full flex items-center justify-between bg-white/10 backdrop-blur-md border border-white/20 text-base font-bold text-primary-foreground rounded-2xl py-4 pl-6 pr-5 hover:bg-white/20 active:scale-[0.98] transition-all"
                    >
                        <span className="truncate">{selectedProjectDetails?.name || 'Select Project'}</span>
                        <span className={`material-symbols-outlined opacity-70 text-xl transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
                    </button>
                    
                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-popover text-popover-foreground rounded-2xl shadow-xl border border-border overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                            <div className="max-h-64 overflow-y-auto py-2">
                            {projects.map(p => (
                                <div 
                                key={p.id}
                                onClick={() => { setSelectedTimerProject(p.id); setIsDropdownOpen(false); }}
                                className={`px-5 py-4 text-sm font-medium cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-3 ${selectedTimerProject === p.id ? 'text-primary bg-secondary' : 'text-foreground'}`}
                                >
                                <span className="material-symbols-outlined text-lg opacity-70">{p.icon}</span>
                                {p.name}
                                </div>
                            ))}
                            </div>
                        </div>
                    )}
                    </div>
                ) : (
                    <div className="flex items-center gap-2 bg-white/10 px-8 py-3 rounded-full backdrop-blur-md border border-white/10 shadow-inner">
                    <span className="material-symbols-outlined text-base animate-pulse">timelapse</span>
                    <span className="text-base font-bold tracking-wide">
                        {projects.find(p => p.id === (timerState.activeProjectId || timerState.activeTaskId))?.name || 'Focusing...'}
                    </span>
                    </div>
                )}
                
                <div className="flex flex-col items-center">
                    <TimerDisplay seconds={totalDisplaySeconds} />
                    <p className="mt-5 text-xs font-bold uppercase tracking-[0.25em] opacity-60">
                    {timerState.isActive ? 'Session In Progress' : 'Total Focus Time'}
                    </p>
                </div>

                <button 
                    onClick={() => onToggleTimer(selectedTimerProject)}
                    className={`group/btn flex items-center gap-5 pl-8 pr-2 py-2.5 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl
                    ${timerState.isActive ? 'bg-white text-destructive' : 'bg-background text-foreground'}
                    `}
                >
                    <span className="text-sm font-bold uppercase tracking-widest pl-2">
                    {timerState.isActive ? 'Contribute Time' : 'Start Focus'}
                    </span>
                    <div className={`size-16 rounded-full flex items-center justify-center transition-all duration-500 ${timerState.isActive ? 'bg-destructive/10' : 'bg-primary text-primary-foreground group-hover/btn:rotate-90'}`}>
                    <span className={`material-symbols-outlined text-4xl fill-1 ${timerState.isActive ? 'text-destructive' : 'text-white'}`}>
                        {timerState.isActive ? 'check' : 'play_arrow'}
                    </span>
                    </div>
                </button>
                </div>
            </div>

            {/* Recent Tasks (Desktop: Below Timer) */}
            <div className="flex flex-col gap-3">
                <div className="flex items-end justify-between px-1">
                    <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Recent Activity</h2>
                    <button onClick={onNavigateToHistory} className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline">See All</button>
                </div>
                
                <div className="flex flex-col gap-4">
                {recentTasks.map(task => (
                    <div 
                    key={task.id}
                    onClick={() => onNavigateToTask(task.projectId)}
                    className="group flex items-center justify-between p-4 pr-6 bg-card rounded-[1.25rem] border border-border hover:border-primary/40 hover:shadow-md transition-all cursor-pointer"
                    >
                    <div className="flex items-center gap-5">
                        <div className="size-14 rounded-2xl bg-secondary border border-border/50 flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                        <span className="material-symbols-outlined text-2xl">
                            {projects.find(p => p.id === task.projectId)?.icon || 'assignment'}
                        </span>
                        </div>
                        <div>
                        <p className="font-bold text-base text-foreground">{task.title}</p>
                        <p className="text-xs font-bold text-muted-foreground mt-0.5 uppercase tracking-wide">{task.subtitle || 'Task'}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-bold tabular-nums text-sm">
                        {formatDuration(task.totalTime)}
                        </p>
                        {task.status === 'active' && (
                            <div className="flex items-center justify-end gap-1.5 mt-1.5">
                                <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-[10px] font-bold text-green-500 uppercase">Live</span>
                            </div>
                        )}
                    </div>
                    </div>
                ))}
                </div>
            </div>
        </div>

        {/* --- RIGHT COLUMN (Side Panel) --- */}
        <div className="flex flex-col gap-8 lg:col-span-5 xl:col-span-4">

            {/* Progress & Goals (Grid for desktop) */}
            <div className="flex flex-col gap-3">
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Progress & Goals</h2>
                <div className="flex gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-2 lg:overflow-visible lg:pb-0 snap-x snap-mandatory scrollbar-none">
                {/* Daily Goal Card */}
                <div className="snap-center shrink-0 w-[45%] lg:w-full min-w-[160px] flex flex-col items-center rounded-3xl bg-card p-6 border border-border shadow-sm hover:border-primary/20 transition-all cursor-default lg:col-span-2">
                    <div className="flex items-center gap-6 w-full justify-around">
                        <div className="text-primary relative shrink-0">
                            <ProgressRing radius={36} stroke={5} progress={dailyPercent} trackColor="hsl(var(--secondary))" />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="material-symbols-outlined text-primary/20 text-2xl">sunny</span>
                            </div>
                        </div>
                        <div className="text-left flex-1">
                             <h4 className="text-2xl font-bold leading-none tracking-tight">
                                {formatDuration(dailyProgress)}
                                <span className="text-sm text-muted-foreground font-medium ml-0.5">/ {formatDuration(dailyGoalTarget)}</span>
                            </h4>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">Daily Target</p>
                        </div>
                    </div>
                </div>

                <div className="snap-center shrink-0 w-[45%] lg:w-full min-w-[160px] flex flex-col items-center rounded-3xl bg-card p-5 border border-border shadow-sm hover:border-primary/20 transition-all cursor-default">
                    <div className="mb-3 text-primary relative">
                        <ProgressRing radius={30} stroke={4} progress={weeklyPercent} trackColor="hsl(var(--secondary))" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="material-symbols-outlined text-primary/20 text-xl">calendar_view_week</span>
                        </div>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Weekly</p>
                </div>
                
                <div className="snap-center shrink-0 w-[45%] lg:w-full min-w-[160px] flex flex-col items-center rounded-3xl bg-card p-5 border border-border shadow-sm hover:border-primary/20 transition-all cursor-default">
                    <div className="mb-3 text-primary relative">
                        <ProgressRing radius={30} stroke={4} progress={monthlyPercent} trackColor="hsl(var(--secondary))" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="material-symbols-outlined text-primary/20 text-xl">calendar_month</span>
                        </div>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Monthly</p>
                </div>
                </div>
            </div>
            
            {/* Quick Access Container: Reminders & Inbox Combined */}
            <div className="flex flex-col gap-4 bg-card/50 rounded-[2.5rem] p-6 lg:p-8 border border-border/50 shadow-sm backdrop-blur-sm lg:sticky lg:top-28">
                
                {/* Reminders Section */}
                <div>
                     <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">notifications</span>
                            Up Next
                        </h2>
                     </div>
                     <div className="flex flex-col gap-3">
                         {snapshotReminders.length > 0 ? (
                             snapshotReminders.map(r => (
                                <div key={r.id} className="flex items-center gap-4 p-4 bg-background border border-border rounded-2xl shadow-sm hover:shadow-md transition-all">
                                    <div className="flex flex-col items-center justify-center size-10 rounded-xl bg-secondary text-primary font-bold leading-none border border-border/50">
                                        <span className="text-[10px] uppercase">{r.dueTime.split(' ')[1]}</span>
                                        <span className="text-sm">{r.dueTime.split(':')[0]}</span>
                                    </div>
                                    <span className="text-sm font-bold text-foreground line-clamp-1">{r.title}</span>
                                </div>
                             ))
                         ) : (
                             <div className="text-xs text-muted-foreground italic p-2">No upcoming reminders.</div>
                         )}
                     </div>
                </div>

                <div className="h-px bg-border/50 w-full my-2"></div>

                {/* Inbox Section */}
                <div className="flex flex-col gap-2">
                    <div 
                        onClick={() => setIsInboxExpanded(!isInboxExpanded)}
                        className="flex items-center justify-between cursor-pointer py-2 group"
                    >
                        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 group-hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-lg">inbox</span>
                            Quick Capture
                        </h2>
                        <span className={`material-symbols-outlined text-muted-foreground text-lg transition-transform ${isInboxExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                    </div>

                    <div className={`flex flex-col gap-3 transition-all duration-300 ${isInboxExpanded ? 'opacity-100 max-h-[500px]' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                         <form onSubmit={handleInboxSubmit} className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder="Add quick task..." 
                                value={inboxInput}
                                onChange={(e) => setInboxInput(e.target.value)}
                                className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50"
                            />
                            <button 
                                type="submit"
                                className="bg-primary text-primary-foreground rounded-xl px-4 flex items-center justify-center shadow-sm hover:brightness-110 active:scale-95 transition-all"
                            >
                                <span className="material-symbols-outlined text-lg">add</span>
                            </button>
                        </form>
                        
                        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                            {inboxTasks.length === 0 ? (
                                <p className="text-center text-xs text-muted-foreground py-4 italic">Inbox zero.</p>
                            ) : (
                                inboxTasks.map(task => (
                                    <div 
                                        key={task.id} 
                                        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-500 bg-background border border-border/50 ${task.completed ? 'opacity-0 h-0 overflow-hidden m-0 p-0' : 'hover:border-primary/30'}`}
                                    >
                                        <button 
                                            onClick={() => onToggleInboxTask(task.id)}
                                            className={`size-6 rounded-lg border-2 flex items-center justify-center transition-colors cursor-pointer ${task.completed ? 'bg-primary border-primary' : 'border-muted-foreground/40 hover:border-primary'}`}
                                        >
                                            {task.completed && <span className="material-symbols-outlined text-sm text-primary-foreground">check</span>}
                                        </button>
                                        <span className={`text-sm font-bold truncate flex-1 ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                            {task.title}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </div>

      </div>
    </div>
  );
};
