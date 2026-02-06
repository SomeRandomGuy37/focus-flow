
import React, { useState, useRef } from 'react';
import { Project, Task, TimerState, SubTask, Reminder } from '../types';
import { TimerDisplay } from '../components/TimerDisplay';
import { ProgressRing } from '../components/ProgressRing';
import { formatDuration } from '../utils';
import { Modal } from '../components/Modal';

interface ProjectDetailProps {
  project: Project;
  tasks: Task[];
  timerState: TimerState;
  onBack: () => void;
  onToggleTimer: (taskId?: string) => void;
  onUpdateTask: (task: Task) => void;
  onUpdateProject: (project: Project) => void;
  onAddReminder: (reminder: Reminder) => void;
  onAddTask: (title: string, projectId: string, details?: { notes?: string, dueDate?: string, isPriority?: boolean }) => void;
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
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  
  // New Task Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState(false);
  
  // Drag and Drop State
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const dragItemRef = useRef<number | null>(null);
  const dragOverItemRef = useRef<number | null>(null);

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
        onAddTask(newTaskTitle, project.id, { notes: newTaskNotes, dueDate: newTaskDueDate, isPriority: newTaskPriority });
        // Reset and close
        setNewTaskTitle('');
        setNewTaskNotes('');
        setNewTaskDueDate('');
        setNewTaskPriority(false);
        setIsTaskModalOpen(false);
    }
  };

  const handleNotesChange = (task: Task, notes: string) => {
    onUpdateTask({ ...task, notes });
  };

  const handleTaskCompletion = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    const newStatus = task.status === 'completed' ? 'active' : 'completed';
    onUpdateTask({ ...task, status: newStatus });
  };

  const handleTaskPriority = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    onUpdateTask({ ...task, isPriority: !task.isPriority });
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
    setIsAlertOpen(true);
  };

  // --- Drag and Drop Logic ---
  const handleDragStart = (e: React.DragEvent, index: number, taskId: string) => {
    setDraggedTaskId(taskId);
    dragItemRef.current = index;
    // Set transparency or effect
    e.dataTransfer.effectAllowed = 'move';
    // Firefox requires this
    e.dataTransfer.setData("text/html", taskId);
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
      dragOverItemRef.current = index;
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    if (dragItemRef.current === null || dragOverItemRef.current === null) return;
    dragItemRef.current = null;
    dragOverItemRef.current = null;
  };

  return (
    <div className="animate-in slide-in-from-right-8 duration-500">
      
      {/* Sticky Header - Standardized */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl px-6 py-4 flex items-center justify-between border-b border-border/50 transition-all">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 -ml-3 rounded-full hover:bg-secondary active:scale-95 transition-all text-muted-foreground hover:text-foreground">
                <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground leading-none">{project.name}</h1>
                <p className="text-sm font-semibold text-muted-foreground mt-1">Project Overview</p>
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
            
            <div className="flex flex-col gap-0">
                {tasks.length === 0 ? (
                    <div 
                        onClick={() => setIsTaskModalOpen(true)}
                        className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-2xl bg-secondary/5 hover:bg-secondary/20 hover:border-primary/50 hover:text-primary transition-all cursor-pointer group"
                    >
                        <div className="bg-background size-14 rounded-full mx-auto mb-3 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-3xl opacity-50 group-hover:opacity-100">add</span>
                        </div>
                        <p className="text-sm font-bold">No tasks yet.</p>
                        <p className="text-xs mt-1">Click to create your first task.</p>
                    </div>
                ) : (
                    tasks.map((task, index) => {
                    const isActive = timerState.activeTaskId === task.id;
                    const isExpanded = expandedTaskId === task.id;
                    const isDragging = draggedTaskId === task.id;
                    const isPriority = task.isPriority;
                    
                    return (
                        <div key={task.id}>
                            {/* Insert Zone (Slide in) */}
                            <div className="h-4 -my-2 w-full flex items-center justify-center opacity-0 hover:opacity-100 hover:h-8 transition-all group/insert cursor-pointer z-10 relative">
                                <div 
                                    className="w-full h-px bg-primary/20 group-hover/insert:bg-primary shadow-sm"
                                    onClick={() => {
                                        setNewTaskTitle(''); // Or open specific modal
                                        setIsTaskModalOpen(true);
                                    }}
                                ></div>
                                <div 
                                    className="absolute bg-background border border-primary text-primary rounded-full size-6 flex items-center justify-center shadow-sm transform scale-0 group-hover/insert:scale-100 transition-transform"
                                    onClick={() => setIsTaskModalOpen(true)}
                                >
                                    <span className="material-symbols-outlined text-sm font-bold">add</span>
                                </div>
                            </div>

                            <div 
                                draggable
                                onDragStart={(e) => handleDragStart(e, index, task.id)}
                                onDragEnter={(e) => handleDragEnter(e, index)}
                                onDragEnd={handleDragEnd}
                                className={`group relative flex flex-col rounded-2xl border transition-all shadow-sm overflow-hidden mb-5 select-none
                                    ${isActive ? 'bg-card border-primary ring-1 ring-primary' : (isPriority ? 'border-red-200 dark:border-red-900/50 hover:border-red-300' : 'bg-card border-border hover:border-primary/50')}
                                    ${isPriority ? 'bg-red-50/50 dark:bg-red-900/10' : 'bg-card'}
                                    ${isDragging ? 'opacity-50 scale-[0.98]' : 'opacity-100'}
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
                                            <div className="flex items-center gap-2">
                                                <h4 className={`font-bold text-lg leading-tight transition-all ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>{task.title}</h4>
                                                {isPriority && (
                                                    <span className="material-symbols-outlined text-red-500 text-base" title="High Priority">flag</span>
                                                )}
                                            </div>
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
                                    <div className="flex items-center gap-2">
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
                                        
                                        {/* Drag Handle */}
                                        <div 
                                            className="p-2 cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-foreground"
                                            onClick={e => e.stopPropagation()}
                                        >
                                            <span className="material-symbols-outlined">drag_indicator</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Active Indicator & Meta */}
                                <div className="flex items-center justify-between mt-1">
                                    <div className="flex items-center gap-2">
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
                                        
                                        {/* Priority Toggle Button */}
                                        <button 
                                            onClick={(e) => handleTaskPriority(e, task)}
                                            className={`px-3 py-1 rounded-lg border flex items-center gap-1 transition-colors ${isPriority ? 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400' : 'border-transparent hover:bg-secondary text-muted-foreground hover:text-foreground'}`}
                                            title={isPriority ? "Unmark Importance" : "Mark as Important"}
                                        >
                                            <span className={`material-symbols-outlined text-sm ${isPriority ? 'fill-1' : ''}`}>flag</span>
                                            {isPriority && <span className="text-[10px] font-bold uppercase tracking-wide">Important</span>}
                                        </button>
                                    </div>
                                    
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
                    className="w-full accent-primary h-4 bg-secondary rounded-full appearance-none cursor-pointer"
                    style={{
                        background: `linear-gradient(to right, hsl(var(--primary)) ${project.progress}%, hsl(var(--secondary)) ${project.progress}%)`
                    }}
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
                    
                    <div className="flex flex-col gap-2">
                         <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Due Date</label>
                         <input 
                            type="date"
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-1 focus:ring-primary"
                            value={newTaskDueDate}
                            onChange={e => setNewTaskDueDate(e.target.value)}
                         />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Priority</label>
                        <div 
                            onClick={() => setNewTaskPriority(!newTaskPriority)}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${newTaskPriority ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-background border-border hover:border-primary/50'}`}
                        >
                            <div className={`size-5 rounded-full border flex items-center justify-center ${newTaskPriority ? 'bg-red-500 border-red-500' : 'border-muted-foreground'}`}>
                                {newTaskPriority && <span className="material-symbols-outlined text-white text-xs">check</span>}
                            </div>
                            <span className={`text-sm font-bold ${newTaskPriority ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>Mark as Important</span>
                            {newTaskPriority && <span className="material-symbols-outlined text-red-500 ml-auto">flag</span>}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Notes</label>
                        <textarea 
                            placeholder="Add detailed notes..."
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-1 focus:ring-primary min-h-[100px] resize-none placeholder:text-muted-foreground/50"
                            value={newTaskNotes}
                            onChange={e => setNewTaskNotes(e.target.value)}
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

      {/* Reminder Success Modal */}
      <Modal 
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        title="Reminder Set"
        message="Your reminder has been added to the dashboard."
        type="alert"
        variant="default"
      />
    </div>
  );
};
