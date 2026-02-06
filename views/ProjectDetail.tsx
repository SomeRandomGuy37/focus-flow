
import React, { useState, useEffect, useRef } from 'react';
import { Project, Task, TimerState, SubTask, Reminder } from '../types';
import { TimerDisplay } from '../components/TimerDisplay';
import { ProgressRing } from '../components/ProgressRing';
import { formatDuration } from '../utils';
import { Modal } from '../components/Modal';
import { DatePicker } from '../components/DatePicker';

interface ProjectDetailProps {
  project: Project;
  tasks: Task[];
  timerState: TimerState;
  onBack: () => void;
  onToggleTimer: (taskId?: string) => void;
  onUpdateTask: (task: Task) => void;
  onUpdateProject: (project: Project) => void;
  onAddReminder: (reminder: Reminder) => void;
  onAddTask: (title: string, projectId: string, details?: { notes?: string, dueDate?: string, isPriority?: boolean, order?: number }) => void;
  onReorderTasks: (tasks: Task[]) => void;
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
  onAddTask,
  onReorderTasks
}) => {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  
  // New Task Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState(false);
  const [newTaskInsertIndex, setNewTaskInsertIndex] = useState<number | null>(null);
  
  // Custom Date Picker State for Task Editing
  const [activeDatePickerTaskId, setActiveDatePickerTaskId] = useState<string | null>(null);
  const [isNewTaskDatePickerOpen, setIsNewTaskDatePickerOpen] = useState(false);

  // Sort tasks by order initially
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  
  // Drag and Drop State
  const [draggedItem, setDraggedItem] = useState<Task | null>(null);
  const dragOverItemRef = useRef<Task | null>(null);

  useEffect(() => {
      // Split and sort tasks
      const active = tasks.filter(t => t.status !== 'completed').sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const completed = tasks.filter(t => t.status === 'completed').sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime());
      
      setActiveTasks(active);
      setCompletedTasks(completed);
  }, [tasks]);

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
        // Calculate appropriate order
        let order = Date.now();
        if (newTaskInsertIndex !== null && activeTasks.length > 0) {
            // Insert at start
            if (newTaskInsertIndex === 0) {
                order = (activeTasks[0].order ?? Date.now()) - 1000;
            } 
            // Insert at end
            else if (newTaskInsertIndex >= activeTasks.length) {
                order = (activeTasks[activeTasks.length - 1].order ?? Date.now()) + 1000;
            }
            // Insert between
            else {
                const prev = activeTasks[newTaskInsertIndex - 1].order ?? 0;
                const next = activeTasks[newTaskInsertIndex].order ?? 0;
                order = (prev + next) / 2;
            }
        }

        onAddTask(newTaskTitle, project.id, { 
            notes: newTaskNotes, 
            dueDate: newTaskDueDate, 
            isPriority: newTaskPriority,
            order: order
        });
        
        // Reset and close
        setNewTaskTitle('');
        setNewTaskNotes('');
        setNewTaskDueDate('');
        setNewTaskPriority(false);
        setNewTaskInsertIndex(null);
        setIsTaskModalOpen(false);
    }
  };

  const openTaskModal = (insertIndex: number | null = null) => {
      setNewTaskInsertIndex(insertIndex);
      setIsTaskModalOpen(true);
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

  // --- Drag and Drop Logic (Magnetic) ---
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedItem(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData("text/html", task.id); // Required for Firefox
  };

  const handleDragEnter = (e: React.DragEvent, targetTask: Task) => {
      e.preventDefault();
      if (!draggedItem || draggedItem.id === targetTask.id) return;
      // Only reorder within active tasks
      if (targetTask.status === 'completed') return;

      const currentList = [...activeTasks];
      const draggedIndex = currentList.findIndex(t => t.id === draggedItem.id);
      const targetIndex = currentList.findIndex(t => t.id === targetTask.id);

      if (draggedIndex !== -1 && targetIndex !== -1) {
          // Remove dragged item
          currentList.splice(draggedIndex, 1);
          // Insert at target index
          currentList.splice(targetIndex, 0, draggedItem);
          setActiveTasks(currentList);
      }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    dragOverItemRef.current = null;
    onReorderTasks(activeTasks);
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault(); // Necessary to allow dropping
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
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground leading-none">{project.name}</h1>
                <p className="text-sm font-semibold text-muted-foreground mt-2">Project Overview</p>
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
                    <span className="bg-secondary text-foreground text-xs font-bold px-2.5 py-1 rounded-lg">{activeTasks.length}</span>
                </div>
                <button 
                    onClick={() => openTaskModal(activeTasks.length)}
                    className="flex items-center gap-1.5 text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors"
                >
                    <span className="material-symbols-outlined text-lg">add_task</span>
                    <span className="text-xs font-bold uppercase tracking-wider">New Task</span>
                </button>
            </div>
            
            <div className="flex flex-col gap-0 min-h-[100px]">
                {activeTasks.length === 0 && (
                    <div 
                        onClick={() => openTaskModal(0)}
                        className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-2xl bg-secondary/5 hover:bg-secondary/20 hover:border-primary/50 hover:text-primary transition-all cursor-pointer group mb-4"
                    >
                        <div className="bg-background size-14 rounded-full mx-auto mb-3 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-3xl opacity-50 group-hover:opacity-100">add</span>
                        </div>
                        <p className="text-sm font-bold">No active tasks.</p>
                        <p className="text-xs mt-1">Click to create a task.</p>
                    </div>
                )}

                {activeTasks.map((task, index) => {
                    const isActive = timerState.activeTaskId === task.id;
                    const isExpanded = expandedTaskId === task.id;
                    const isDragging = draggedItem?.id === task.id;
                    const isPriority = task.isPriority;
                    
                    return (
                        <div key={task.id} className="transition-all duration-500 ease-in-out">
                            {/* Insert Zone (Slide in) */}
                            <div 
                                className="group/insert relative w-full h-2 hover:h-16 transition-all duration-300 ease-out flex items-center justify-center -my-1 z-10 cursor-pointer overflow-hidden"
                                onClick={() => openTaskModal(index)}
                            >
                                <div className="w-full h-px bg-primary/10 group-hover/insert:bg-primary/50 transition-colors absolute"></div>
                                <div className="opacity-0 group-hover/insert:opacity-100 transform translate-y-4 group-hover/insert:translate-y-0 transition-all duration-300 flex items-center gap-2 bg-background border border-primary text-primary px-4 py-2 rounded-full shadow-lg z-20">
                                    <span className="material-symbols-outlined text-lg font-bold">add</span>
                                    <span className="text-xs font-bold uppercase tracking-wider">Insert Task Here</span>
                                </div>
                            </div>

                            <div 
                                draggable
                                onDragStart={(e) => handleDragStart(e, task)}
                                onDragEnter={(e) => handleDragEnter(e, task)}
                                onDragEnd={handleDragEnd}
                                onDragOver={handleDragOver}
                                className={`group relative flex flex-col rounded-2xl border transition-all duration-300 shadow-sm overflow-hidden mb-4 select-none
                                    ${isActive ? 'bg-card border-primary ring-1 ring-primary' : (isPriority ? 'border-red-200 dark:border-red-900/50 hover:border-red-300' : 'bg-card border-border hover:border-primary/50')}
                                    ${isPriority ? 'bg-red-50/50 dark:bg-red-900/10' : 'bg-card'}
                                    ${isDragging ? 'opacity-20 scale-[0.98] ring-2 ring-primary border-transparent' : 'opacity-100'}
                                    hover:shadow-md
                                `}
                            >
                            {/* Task Main Row */}
                            <div className="p-6 flex flex-col gap-5 cursor-pointer" onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}>
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4 items-start flex-1">
                                        <button 
                                            onClick={(e) => handleTaskCompletion(e, task)}
                                            className={`mt-1 shrink-0 size-7 rounded-full flex items-center justify-center transition-all duration-300 border-2 border-muted-foreground/30 text-transparent hover:border-green-500/50 hover:bg-green-500/10`}
                                        >
                                            <span className="material-symbols-outlined text-base font-bold">check</span>
                                        </button>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-lg leading-tight transition-all">{task.title}</h4>
                                                {isPriority && (
                                                    <span className="material-symbols-outlined text-red-500 text-base" title="High Priority">flag</span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-2 items-center">
                                                {task.subtitle && <p className="text-muted-foreground text-xs font-bold uppercase tracking-wide">{task.subtitle}</p>}
                                                {task.dueDate && (
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${new Date(task.dueDate) < new Date() ? 'bg-red-500/10 text-red-600 border-red-500/20' : 'bg-secondary text-muted-foreground border-transparent'}`}>
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
                                        <div 
                                            className="p-2 cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
                                            onMouseDown={e => e.stopPropagation()} 
                                        >
                                            <span className="material-symbols-outlined">drag_indicator</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-1">
                                    <div className="flex items-center gap-2">
                                        {isActive ? (
                                            <div className="px-3 py-1 rounded-lg bg-primary flex items-center gap-2 shadow-sm">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground animate-pulse"></div>
                                            <span className="text-primary-foreground text-[10px] font-bold uppercase tracking-widest">Tracking</span>
                                            </div>
                                        ) : (
                                            <div className="px-3 py-1 rounded-lg border border-border flex items-center gap-1 bg-secondary/30">
                                            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wide">Active</span>
                                            </div>
                                        )}
                                        
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
                                    <div className="flex flex-col gap-3">
                                        <h5 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Schedule</h5>
                                        <div 
                                            className="flex items-center gap-4 p-3 bg-background border border-border rounded-xl shadow-sm cursor-pointer hover:border-primary transition-colors"
                                            onClick={() => setActiveDatePickerTaskId(task.id)}
                                        >
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <span className="material-symbols-outlined">calendar_month</span>
                                                <span className="text-sm font-bold">Due Date</span>
                                            </div>
                                            <span className="flex-1 text-right font-bold text-sm text-foreground">
                                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Set Date'}
                                            </span>
                                        </div>
                                    </div>

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
                })}
                
                {/* Insert Zone at Bottom */}
                {activeTasks.length > 0 && (
                    <div 
                        className="group/insert relative w-full h-2 hover:h-16 transition-all duration-300 ease-out flex items-center justify-center -my-1 z-10 cursor-pointer overflow-hidden mb-8"
                        onClick={() => openTaskModal(activeTasks.length)}
                    >
                        <div className="w-full h-px bg-primary/10 group-hover/insert:bg-primary/50 transition-colors absolute"></div>
                        <div className="opacity-0 group-hover/insert:opacity-100 transform translate-y-4 group-hover/insert:translate-y-0 transition-all duration-300 flex items-center gap-2 bg-background border border-primary text-primary px-4 py-2 rounded-full shadow-lg z-20">
                            <span className="material-symbols-outlined text-lg font-bold">add</span>
                            <span className="text-xs font-bold uppercase tracking-wider">Add Last Task</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Completed Tasks Toggle Section */}
            {completedTasks.length > 0 && (
                <div className="flex flex-col gap-4 mt-4 animate-in fade-in duration-500">
                    <button 
                        onClick={() => setShowCompleted(!showCompleted)}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-bold text-xs uppercase tracking-widest w-fit"
                    >
                        <span className={`material-symbols-outlined text-lg transition-transform duration-300 ${showCompleted ? 'rotate-180' : ''}`}>expand_more</span>
                        {completedTasks.length} Completed Tasks
                    </button>
                    
                    {showCompleted && (
                        <div className="flex flex-col gap-4 animate-in slide-in-from-top-2 duration-300">
                            {completedTasks.map(task => (
                                <div key={task.id} className="flex items-center justify-between p-4 bg-secondary/20 border border-border/50 rounded-2xl opacity-60 hover:opacity-100 transition-opacity">
                                     <div className="flex items-center gap-4">
                                        <button 
                                            onClick={(e) => handleTaskCompletion(e, task)}
                                            className="shrink-0 size-6 rounded-full bg-green-500 text-white flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                                        >
                                            <span className="material-symbols-outlined text-sm font-bold">check</span>
                                        </button>
                                        <div>
                                            <h4 className="font-bold text-sm line-through text-muted-foreground">{task.title}</h4>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">Completed {new Date(task.completedAt || Date.now()).toLocaleDateString()}</p>
                                        </div>
                                     </div>
                                     <span className="text-xs font-mono text-muted-foreground">{formatDuration(task.totalTime)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
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
                         <div 
                            onClick={() => setIsNewTaskDatePickerOpen(true)}
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-1 focus:ring-primary cursor-pointer flex justify-between items-center"
                         >
                            {newTaskDueDate || <span className="text-muted-foreground/50">Select date</span>}
                            <span className="material-symbols-outlined text-muted-foreground">calendar_today</span>
                         </div>
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

      {/* Date Pickers */}
      {isNewTaskDatePickerOpen && (
          <DatePicker 
             selectedDate={newTaskDueDate}
             onChange={(d) => setNewTaskDueDate(d)}
             onClose={() => setIsNewTaskDatePickerOpen(false)}
          />
      )}

      {activeDatePickerTaskId && (
          <DatePicker 
             selectedDate={activeTasks.find(t => t.id === activeDatePickerTaskId)?.dueDate || ''}
             onChange={(d) => {
                 const t = activeTasks.find(task => task.id === activeDatePickerTaskId);
                 if (t) handleTaskDueDate(t, d);
             }}
             onClose={() => setActiveDatePickerTaskId(null)}
          />
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
