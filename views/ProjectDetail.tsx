
import React, { useState } from 'react';
import { Project, Task, TimerState, SubTask, Reminder } from '../types';
import { TimerDisplay } from '../components/TimerDisplay';
import { ProgressRing } from '../components/ProgressRing';
import { formatDuration } from '../utils';

interface ProjectDetailProps {
  project: Project;
  tasks: Task[];
  timerState: TimerState;
  onBack: () => void;
  onToggleTimer: (taskId?: string) => void;
  onUpdateTask: (task: Task) => void;
  onUpdateProject: (project: Project) => void;
  onAddReminder: (reminder: Reminder) => void;
  onAddTask: (title: string, projectId: string) => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ 
  project, 
  tasks, 
  timerState, 
  onBack, 
  onToggleTimer,
  onUpdateTask,
  onUpdateProject,
  onAddReminder,
  onAddTask
}) => {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  // Stats
  const { stats } = project;
  const projectTotalTime = project.totalTime || 0; 
  
  const activeTask = tasks.find(t => t.id === timerState.activeTaskId);
  const isProjectTimerActive = timerState.isActive && timerState.activeProjectId === project.id;
  const isProjectActive = !!activeTask || isProjectTimerActive;

  // Handlers
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
        onAddTask(newTaskTitle, project.id);
        setNewTaskTitle('');
        setIsTaskModalOpen(false);
    }
  };

  const handleSubtaskToggle = (task: Task, subtaskId: string) => {
    const updatedSubtasks = task.subtasks?.map(st => 
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
    ) || [];
    onUpdateTask({ ...task, subtasks: updatedSubtasks });
  };

  const handleAddSubtask = (task: Task, title: string) => {
    const newSubtask: SubTask = {
        id: `st-${Date.now()}`,
        title,
        completed: false
    };
    onUpdateTask({ ...task, subtasks: [...(task.subtasks || []), newSubtask] });
  };

  const handleSubtaskDeadline = (task: Task, subtaskId: string, deadline: string) => {
    const updatedSubtasks = task.subtasks?.map(st => 
        st.id === subtaskId ? { ...st, deadline } : st
    ) || [];
    onUpdateTask({ ...task, subtasks: updatedSubtasks });
  };

  const handleNotesChange = (task: Task, notes: string) => {
    onUpdateTask({ ...task, notes });
  };

  const handleTaskCompletion = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    const newStatus = task.status === 'completed' ? 'active' : 'completed';
    onUpdateTask({ ...task, status: newStatus });
  };

  const handleTaskDueDate = (task: Task, date: string) => {
    onUpdateTask({ ...task, dueDate: date });
  };

  const handleProgressChange = (newProgress: number) => {
    onUpdateProject({ ...project, progress: newProgress });
  };

  const handleDeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateProject({ ...project, deadline: e.target.value });
  };

  const handleAddProjectReminder = () => {
    const reminder: Reminder = {
        id: `r-p-${Date.now()}`,
        title: `Work on: ${project.name}`,
        dueTime: '09:00 AM', // Default
        type: 'short-term',
        completed: false
    };
    onAddReminder(reminder);
    alert('Reminder added to Dashboard!');
  };

  return (
    <div className="animate-in slide-in-from-right-8 duration-500">
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl px-6 pt-8 pb-4 flex items-end justify-between border-b border-border/50 transition-all">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 -ml-3 rounded-full hover:bg-secondary active:scale-95 transition-all text-muted-foreground hover:text-foreground">
                <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground leading-none">{project.name}</h1>
                <p className="text-sm font-semibold text-muted-foreground mt-1.5">Project Overview</p>
            </div>
        </div>
      </div>

      <main className="flex flex-col gap-10 p-6 pb-32 max-w-7xl mx-auto w-full lg:grid lg:grid-cols-12 lg:gap-12">
        
        {/* LEFT COLUMN: TASKS */}
        <section className="flex flex-col gap-6 lg:col-span-7 lg:order-1">
            
            {/* Project Description */}
            {project.description && (
                <div className="bg-secondary/20 border border-border/50 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                        <span className="material-symbols-outlined text-lg">description</span>
                        <span className="text-xs font-bold uppercase tracking-widest">About this Project</span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-foreground/90 whitespace-pre-wrap">
                        {project.description}
                    </p>
                </div>
            )}

            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold tracking-tight">Active Tasks</h3>
                    <span className="bg-secondary text-foreground text-xs font-bold px-2.5 py-1 rounded-lg">{tasks.length}</span>
                </div>
                <button 
                    onClick={() => setIsTaskModalOpen(true)}
                    className="flex items-center gap-1.5 text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors"
                >
                    <span className="material-symbols-outlined text-lg">add_task</span>
                    <span className="text-xs font-bold uppercase tracking-wider">New Task</span>
                </button>
            </div>
            
            <div className="flex flex-col gap-5">
                {tasks.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-2xl bg-secondary/5">
                        <span className="material-symbols-outlined text-3xl opacity-50 mb-2">task</span>
                        <p className="text-sm font-medium">No tasks yet. Create one to get started!</p>
                    </div>
                ) : (
                    tasks.map(task => {
                    const isActive = timerState.activeTaskId === task.id;
                    const isExpanded = expandedTaskId === task.id;
                    
                    return (
                        <div 
                        key={task.id}
                        className={`group relative flex flex-col rounded-2xl border transition-all shadow-sm overflow-hidden
                            ${isActive ? 'bg-card border-primary ring-1 ring-primary' : 'bg-card border-border hover:border-primary/50'}
                        `}
                        >
                        {/* Task Main Row */}
                        <div className="p-6 flex flex-col gap-5 cursor-pointer" onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}>
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4 items-start flex-1">
                                    <button 
                                        onClick={(e) => handleTaskCompletion(e, task)}
                                        className={`mt-1 shrink-0 size-7 rounded-full flex items-center justify-center transition-all duration-300 ${task.status === 'completed' ? 'bg-green-500 text-white shadow-md scale-105' : 'border-2 border-muted-foreground/30 text-transparent hover:border-green-500/50 hover:bg-green-500/10'}`}
                                    >
                                        <span className="material-symbols-outlined text-base font-bold">check</span>
                                    </button>
                                    <div className="flex flex-col gap-1">
                                        <h4 className={`font-bold text-lg leading-tight transition-all ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>{task.title}</h4>
                                        <div className="flex flex-wrap gap-2 items-center">
                                            {task.subtitle && <p className="text-muted-foreground text-xs font-bold uppercase tracking-wide">{task.subtitle}</p>}
                                            {task.dueDate && (
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${new Date(task.dueDate) < new Date() && task.status !== 'completed' ? 'bg-red-500/10 text-red-600 border-red-500/20' : 'bg-secondary text-muted-foreground border-transparent'}`}>
                                                    {new Date(task.dueDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleTimer(task.id);
                                    }}
                                    className={`rounded-full p-3 transition-colors flex items-center justify-center ${isActive ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' : 'bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary'}`}
                                >
                                    <span className="material-symbols-outlined text-xl">
                                    {isActive ? 'pause' : 'play_arrow'}
                                    </span>
                                </button>
                            </div>

                            {/* Active Indicator & Meta */}
                            <div className="flex items-center justify-between mt-1">
                                {isActive ? (
                                    <div className="px-3 py-1 rounded-lg bg-primary flex items-center gap-2 shadow-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground animate-pulse"></div>
                                    <span className="text-primary-foreground text-[10px] font-bold uppercase tracking-widest">Tracking</span>
                                    </div>
                                ) : (
                                    <div className="px-3 py-1 rounded-lg border border-border flex items-center gap-1 bg-secondary/30">
                                    <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wide">{task.status}</span>
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 text-muted-foreground ml-2">
                                    <span className="material-symbols-outlined text-lg">schedule</span>
                                    <span className="text-xs font-bold font-mono pt-0.5">
                                        {formatDuration(task.totalTime)}
                                    </span>
                                    </div>
                                    <span className={`material-symbols-outlined text-muted-foreground transition-transform duration-300 text-xl ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                                </div>
                            </div>
                        </div>

                        {/* Expanded Edit View */}
                        {isExpanded && (
                            <>
                            <div className="h-px w-full bg-border"></div>
                            <div className="p-6 flex flex-col gap-8 bg-secondary/10 animate-in slide-in-from-top-2 duration-300">
                                
                                {/* Schedule (Task Due Date) */}
                                <div className="flex flex-col gap-3">
                                    <h5 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Schedule</h5>
                                    <div className="flex items-center gap-4 p-3 bg-background border border-border rounded-xl shadow-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <span className="material-symbols-outlined">calendar_month</span>
                                            <span className="text-sm font-bold">Due Date</span>
                                        </div>
                                        <input 
                                            type="date"
                                            value={task.dueDate || ''}
                                            onChange={(e) => handleTaskDueDate(task, e.target.value)}
                                            className="flex-1 bg-transparent text-right font-bold text-sm outline-none cursor-pointer text-foreground"
                                        />
                                    </div>
                                </div>

                                {/* Subtasks Editing */}
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <h5 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Subtasks</h5>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        {task.subtasks?.map(st => (
                                        <div key={st.id} className="flex flex-col gap-2 p-3 rounded-xl bg-background border border-border/50 hover:border-primary/30 transition-colors group/item shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <input 
                                                    type="checkbox" 
                                                    checked={st.completed}
                                                    onChange={() => handleSubtaskToggle(task, st.id)}
                                                    className="size-5 rounded-md border-muted-foreground/50 text-primary focus:ring-primary bg-transparent cursor-pointer"
                                                />
                                                <span className={`text-sm font-semibold flex-1 ${st.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                                    {st.title}
                                                </span>
                                                
                                                {/* Compact Date Picker Trigger */}
                                                <div className="relative group/date">
                                                    <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border transition-all cursor-pointer ${st.deadline ? 'bg-secondary/50 border-primary/20 text-foreground' : 'bg-transparent border-transparent text-muted-foreground hover:bg-secondary'}`}>
                                                        <span className="material-symbols-outlined text-[16px]">event</span>
                                                        {st.deadline && (
                                                            <span className="text-[10px] font-bold uppercase">
                                                                {new Date(st.deadline).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {/* Hidden input overlay for native picker */}
                                                    <input 
                                                        type="date" 
                                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                                        value={st.deadline || ''}
                                                        onChange={(e) => handleSubtaskDeadline(task, st.id, e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        ))}
                                        {/* Add Subtask Input */}
                                        <div className="flex items-center gap-3 mt-1 p-2">
                                            <span className="material-symbols-outlined text-muted-foreground">add</span>
                                            <input 
                                                type="text" 
                                                placeholder="Add new subtask..."
                                                className="bg-transparent border-none focus:ring-0 text-sm font-medium w-full placeholder:text-muted-foreground/70"
                                                onKeyDown={(e) => {
                                                    if(e.key === 'Enter') {
                                                        handleAddSubtask(task, e.currentTarget.value);
                                                        e.currentTarget.value = '';
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Description Editing */}
                                <div className="flex flex-col gap-3">
                                    <h5 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Notes</h5>
                                    <textarea 
                                        className="w-full bg-background border border-border rounded-xl p-4 text-sm font-medium focus:ring-primary focus:border-primary min-h-[120px] resize-none"
                                        value={task.notes || ''}
                                        onChange={(e) => handleNotesChange(task, e.target.value)}
                                        placeholder="Add notes or description..."
                                    />
                                </div>
                            </div>
                            </>
                        )}
                        </div>
                    );
                    })
                )}
            </div>
        </section>

        {/* RIGHT COLUMN: TIMER & STATS */}
        <div className="flex flex-col gap-10 lg:col-span-5 lg:order-2 lg:sticky lg:top-28 h-fit">
            {/* Project Timer Control */}
            <section className="flex flex-col items-center gap-8 bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                <TimerDisplay 
                seconds={isProjectActive ? timerState.elapsedBeforeStart + (Date.now() - (timerState.startTime || Date.now())) / 1000 : projectTotalTime} 
                variant="card" 
                />
                
                <div className="flex items-center justify-center gap-4 w-full">
                {isProjectActive ? (
                    <button 
                        onClick={() => onToggleTimer(undefined)}
                        className="group flex cursor-pointer items-center justify-center gap-3 rounded-full px-8 py-4 shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 bg-white text-destructive border-2 border-destructive/10 w-full"
                    >
                        <span className="text-sm font-bold uppercase tracking-widest">Contribute</span>
                        <span className="material-symbols-outlined text-2xl">check_circle</span>
                    </button>
                ) : (
                    <button 
                        onClick={() => onToggleTimer(undefined)} 
                        className="group flex cursor-pointer items-center justify-center gap-3 rounded-full px-8 py-4 shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 bg-primary text-primary-foreground w-full"
                    >
                        <span className="text-sm font-bold uppercase tracking-widest">Start Focus</span>
                        <span className="material-symbols-outlined text-2xl group-hover:translate-x-1 transition-transform">play_arrow</span>
                    </button>
                )}
                </div>
            </section>

             {/* Project Time Analytics */}
            <section className="flex flex-col gap-4 bg-background border border-border rounded-2xl p-4">
                <div className="flex gap-4 items-center justify-center py-2">
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-xl font-bold tabular-nums">{formatDuration(stats.today)}</span>
                        <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider">Today</span>
                    </div>
                    <div className="h-8 w-px bg-border"></div>
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-xl font-bold tabular-nums">{formatDuration(stats.week)}</span>
                        <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider">Week</span>
                    </div>
                    <div className="h-8 w-px bg-border"></div>
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-xl font-bold tabular-nums">{formatDuration(stats.month)}</span>
                        <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider">Month</span>
                    </div>
                </div>
            </section>

            {/* Progress & Deadline */}
            <section className="bg-card border border-border rounded-[2rem] p-8 shadow-sm flex flex-col gap-6">
                <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Progress</h3>
                    <div className="text-4xl font-extrabold text-foreground">{project.progress}%</div>
                </div>
                <div className="size-16 text-primary">
                    <ProgressRing radius={32} stroke={4} progress={project.progress} trackColor="hsl(var(--secondary))" />
                </div>
                </div>
                
                <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={project.progress}
                    onChange={(e) => handleProgressChange(Number(e.target.value))}
                    className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                />
                
                <div className="flex flex-col gap-3 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="material-symbols-outlined text-lg">event</span>
                        <span className="text-xs font-bold uppercase tracking-wide">Deadline</span>
                    </div>
                    <input 
                        type="date" 
                        value={project.deadline || ''}
                        onChange={handleDeadlineChange}
                        className="bg-transparent text-right font-bold text-sm outline-none text-foreground cursor-pointer"
                    />
                </div>
                <button onClick={handleAddProjectReminder} className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors justify-start mt-2">
                    <span className="material-symbols-outlined text-lg">add_alert</span>
                    <span className="text-xs font-bold uppercase tracking-wide">Set Reminder</span>
                </button>
                </div>
            </section>
        </div>

      </main>

      {/* Create Task Modal */}
      {isTaskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity" onClick={() => setIsTaskModalOpen(false)} />
            <div className="relative bg-card border border-border rounded-[2rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 p-8 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold tracking-tight">Create New Task</h2>
                    <button onClick={() => setIsTaskModalOpen(false)} className="size-8 rounded-full bg-secondary flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors">
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>
                <form onSubmit={handleCreateTask} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Task Title</label>
                        <input 
                            autoFocus
                            type="text" 
                            required
                            placeholder="What needs to be done?"
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-base font-bold outline-none focus:ring-1 focus:ring-primary placeholder:font-normal placeholder:text-muted-foreground/50"
                            value={newTaskTitle}
                            onChange={e => setNewTaskTitle(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsTaskModalOpen(false)} className="px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-wider hover:bg-secondary transition-colors">Cancel</button>
                        <button type="submit" className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold uppercase text-xs tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all">Create Task</button>
                    </div>
                </form>
            </div>
          </div>
      )}
    </div>
  );
};
