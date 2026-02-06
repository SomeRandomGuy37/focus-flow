
import React, { useState } from 'react';
import { Project, Task, InboxTask } from '../types';
import { formatDuration } from '../utils';
import { Modal } from '../components/Modal';

interface ProjectsListProps {
  projects: Project[];
  tasks: Task[];
  inboxTasks: InboxTask[];
  onAddInboxTask: (title: string) => void;
  onToggleInboxTask: (id: string) => void;
  onSelectProject: (id: string) => void;
  onDeleteProjects: (ids: string[]) => void;
  onAddProject: (project: Project) => void;
}

export const ProjectsList: React.FC<ProjectsListProps> = ({ 
    projects, 
    tasks, 
    inboxTasks,
    onAddInboxTask,
    onToggleInboxTask,
    onSelectProject, 
    onDeleteProjects,
    onAddProject
}) => {
  const [inboxInput, setInboxInput] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set());

  // New Project Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('bg-blue-500');
  const [newProjectIcon, setNewProjectIcon] = useState('folder');

  // Confirmation Modal State
  const [modalConfig, setModalConfig] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void, variant?: 'default' | 'destructive'}>({
    isOpen: false, title: '', message: '', onConfirm: () => {}
  });

  const icons = ['folder', 'business', 'smartphone', 'palette', 'terminal', 'lightbulb', 'star', 'rocket', 'home', 'work', 'school', 'fitness_center'];
  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-slate-500', 'bg-green-500', 'bg-red-500', 'bg-pink-500', 'bg-yellow-500', 'bg-teal-500', 'bg-indigo-500'];

  const handleAddInboxTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (inboxInput.trim()) {
        onAddInboxTask(inboxInput);
        setInboxInput('');
    }
  };

  const toggleProjectSelection = (id: string) => {
    const newSet = new Set(selectedProjectIds);
    if (newSet.has(id)) {
        newSet.delete(id);
    } else {
        newSet.add(id);
    }
    setSelectedProjectIds(newSet);
  };

  const toggleEditMode = () => {
    if (isEditMode) {
        // Exit edit mode, clear selection
        setIsEditMode(false);
        setSelectedProjectIds(new Set());
    } else {
        setIsEditMode(true);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedProjectIds.size > 0) {
        setModalConfig({
            isOpen: true,
            title: 'Delete Projects?',
            message: `Are you sure you want to delete ${selectedProjectIds.size} projects? This action cannot be undone.`,
            variant: 'destructive',
            onConfirm: () => {
                onDeleteProjects(Array.from(selectedProjectIds));
                setIsEditMode(false);
                setSelectedProjectIds(new Set());
            }
        });
    }
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const newProject: Project = {
        id: `p-${Date.now()}`,
        name: newProjectName,
        description: newProjectDesc,
        icon: newProjectIcon,
        themeColor: newProjectColor,
        progress: 0,
        totalTime: 0,
        stats: { today: 0, week: 0, month: 0 }
    };
    onAddProject(newProject);
    setIsModalOpen(false);
    // Reset form
    setNewProjectName('');
    setNewProjectDesc('');
    setNewProjectColor('bg-blue-500');
    setNewProjectIcon('folder');
  };

  const handleProjectDone = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    setModalConfig({
        isOpen: true,
        title: 'Complete Project?',
        message: 'Mark this project as complete? It will be removed from your active projects list.',
        variant: 'default',
        onConfirm: () => {
            onDeleteProjects([projectId]);
        }
    });
  };

  return (
    <div className="flex flex-col w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
       
       {/* Sticky Header - Standardized */}
       <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl px-6 py-4 flex items-center justify-between border-b border-border/50 transition-all">
         <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground leading-none">Projects</h1>
            <p className="text-sm font-semibold text-muted-foreground mt-1">Manage Workflows</p>
         </div>
         
         <div className="flex items-center gap-2">
            {isEditMode ? (
                <>
                    <button 
                        onClick={toggleEditMode}
                        className="flex items-center gap-2 bg-secondary text-foreground px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:brightness-95 transition-all"
                    >
                        Cancel
                    </button>
                    {selectedProjectIds.size > 0 && (
                        <button 
                            onClick={handleDeleteSelected}
                            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20 animate-in zoom-in-95 duration-200"
                        >
                            <span className="material-symbols-outlined text-sm">check</span>
                            Done ({selectedProjectIds.size})
                        </button>
                    )}
                </>
            ) : (
                <>
                    <button 
                        onClick={toggleEditMode}
                        className="flex items-center gap-2 bg-secondary text-foreground px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:brightness-95 transition-all"
                    >
                        <span className="material-symbols-outlined text-sm">edit</span>
                        Edit
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        New
                    </button>
                </>
            )}
         </div>
       </div>

       <div className="flex flex-col gap-8 px-6 pt-8 pb-32 max-w-7xl mx-auto w-full">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map(project => {
                const projectTasks = tasks.filter(t => t.projectId === project.id);
                const activeCount = projectTasks.filter(t => t.status === 'active' || t.status === 'review').length;
                const completedCount = projectTasks.filter(t => t.status === 'completed').length;
                const totalProjectTime = projectTasks.reduce((acc, t) => acc + t.totalTime, 0);
                const isSelected = selectedProjectIds.has(project.id);
                
                return (
                <div 
                    key={project.id}
                    onClick={() => isEditMode ? toggleProjectSelection(project.id) : onSelectProject(project.id)}
                    className={`group flex flex-col gap-6 p-8 rounded-[2.5rem] border shadow-sm transition-all duration-300 cursor-pointer h-full justify-between relative overflow-hidden min-h-[320px]
                        ${isEditMode && isSelected 
                            ? 'bg-primary/5 border-primary ring-1 ring-primary' 
                            : 'bg-card border-border hover:shadow-xl hover:border-primary/30'}
                        ${isEditMode ? 'hover:scale-[0.98]' : ''}
                    `}
                >
                    {isEditMode && (
                        <div className={`absolute top-6 right-6 size-8 rounded-full border-2 flex items-center justify-center transition-colors z-10 ${isSelected ? 'bg-primary border-primary' : 'bg-background border-muted-foreground/30'}`}>
                            {isSelected && <span className="material-symbols-outlined text-sm text-primary-foreground font-bold">check</span>}
                        </div>
                    )}

                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-5">
                                <div className={`size-16 rounded-2xl flex items-center justify-center text-white shadow-md ${project.themeColor || 'bg-primary'}`}>
                                    <span className="material-symbols-outlined text-3xl">{project.icon}</span>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold line-clamp-1">{project.name}</h3>
                                    <p className="text-sm text-muted-foreground font-medium mt-1 line-clamp-1">{project.description}</p>
                                </div>
                            </div>
                            
                            {!isEditMode && (
                                <span className="material-symbols-outlined text-muted-foreground/30 group-hover:text-primary transition-colors text-3xl">arrow_forward</span>
                            )}
                        </div>

                        <div className="h-px w-full bg-border/50"></div>
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            <div className="flex items-center gap-3">
                                <span className="bg-secondary px-3 py-1.5 rounded-lg text-foreground">{activeCount} Active</span>
                                <span>{completedCount} Done</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-base">schedule</span>
                                {formatDuration(totalProjectTime)}
                            </div>
                        </div>

                        {/* Done with Project Button - Bottom of card, large to be distinct from arrow */}
                        {!isEditMode && (
                            <button
                                onClick={(e) => handleProjectDone(e, project.id)}
                                className="w-full mt-2 py-3 rounded-xl border border-dashed border-border text-muted-foreground hover:border-green-500 hover:text-green-600 hover:bg-green-500/10 transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100"
                            >
                                <span className="material-symbols-outlined text-lg">check_circle</span>
                                Done with Project
                            </button>
                        )}
                    </div>
                </div>
                );
            })}
          </div>

          {/* Inbox Section - Hide in Edit Mode to focus on projects */}
          {!isEditMode && (
            <div className="flex flex-col gap-4 mt-4 lg:grid lg:grid-cols-12 lg:gap-8 animate-in fade-in">
                <div className="lg:col-span-12">
                    <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-4">Inbox & Quick Tasks</h2>
                    <div className="bg-card border border-border rounded-[2rem] p-6 shadow-sm">
                        <form onSubmit={handleAddInboxTask} className="flex gap-3 mb-6">
                            <input 
                                type="text" 
                                placeholder="Add a temporary task..." 
                                value={inboxInput}
                                onChange={(e) => setInboxInput(e.target.value)}
                                className="flex-1 bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm focus:ring-primary focus:border-primary outline-none"
                            />
                            <button type="submit" className="bg-secondary text-foreground p-3 rounded-xl hover:bg-secondary/80 transition-colors font-bold">
                                <span className="material-symbols-outlined">add</span>
                            </button>
                        </form>

                        <div className="flex flex-col gap-2">
                            {inboxTasks.length === 0 ? (
                                <div className="text-center py-6 text-muted-foreground italic text-sm">No quick tasks.</div>
                            ) : (
                                inboxTasks.map(task => (
                                    <div 
                                        key={task.id} 
                                        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-500 ${task.completed ? 'opacity-0 h-0 overflow-hidden m-0 p-0' : 'hover:bg-secondary/30'}`}
                                    >
                                        <button 
                                            onClick={() => onToggleInboxTask(task.id)}
                                            className={`size-6 rounded-lg border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-primary border-primary' : 'border-muted-foreground/40'}`}
                                        >
                                            {task.completed && <span className="material-symbols-outlined text-sm text-primary-foreground">check</span>}
                                        </button>
                                        <span className={`text-sm font-bold ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task.title}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
          )}

       </div>

       {/* Create Project Modal */}
       {isModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               {/* Backdrop */}
               <div 
                 className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity" 
                 onClick={() => setIsModalOpen(false)}
               ></div>

               {/* Modal Content */}
               <div className="relative bg-card border border-border rounded-[2rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 p-8 flex flex-col gap-6">
                   <div className="flex justify-between items-center">
                       <h2 className="text-2xl font-bold tracking-tight">New Project</h2>
                       <button onClick={() => setIsModalOpen(false)} className="size-8 rounded-full bg-secondary flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors">
                           <span className="material-symbols-outlined text-lg">close</span>
                       </button>
                   </div>
                   
                   <form onSubmit={handleCreateProject} className="flex flex-col gap-6">
                       <div className="flex flex-col gap-4">
                           <div className="flex flex-col gap-2">
                               <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Project Name</label>
                               <input 
                                 type="text" 
                                 required
                                 placeholder="e.g. Website Redesign"
                                 className="w-full bg-background border border-border rounded-xl px-4 py-3 text-base font-bold outline-none focus:ring-1 focus:ring-primary placeholder:font-normal placeholder:text-muted-foreground/50"
                                 value={newProjectName}
                                 onChange={e => setNewProjectName(e.target.value)}
                               />
                           </div>

                           <div className="flex flex-col gap-2">
                               <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Description</label>
                               <input 
                                 type="text" 
                                 placeholder="Short description..."
                                 className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
                                 value={newProjectDesc}
                                 onChange={e => setNewProjectDesc(e.target.value)}
                               />
                           </div>
                           
                           <div className="grid grid-cols-2 gap-6">
                               <div className="flex flex-col gap-2">
                                   <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Theme Color</label>
                                   <div className="grid grid-cols-5 gap-2">
                                       {colors.map(color => (
                                           <div 
                                             key={color}
                                             onClick={() => setNewProjectColor(color)}
                                             className={`aspect-square rounded-full cursor-pointer ${color} ${newProjectColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'opacity-70 hover:opacity-100'} transition-all`}
                                           ></div>
                                       ))}
                                   </div>
                               </div>
                               
                               <div className="flex flex-col gap-2">
                                   <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Icon</label>
                                   <div className="grid grid-cols-4 gap-2 h-fit">
                                       {icons.map(icon => (
                                           <div 
                                             key={icon}
                                             onClick={() => setNewProjectIcon(icon)}
                                             className={`aspect-square rounded-lg flex items-center justify-center cursor-pointer border ${newProjectIcon === icon ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-muted-foreground border-transparent hover:bg-secondary/80'} transition-all`}
                                           >
                                               <span className="material-symbols-outlined text-lg">{icon}</span>
                                           </div>
                                       ))}
                                   </div>
                               </div>
                           </div>
                       </div>

                       <div className="flex justify-end gap-3 pt-2">
                           <button 
                             type="button" 
                             onClick={() => setIsModalOpen(false)}
                             className="px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-wider hover:bg-secondary transition-colors"
                           >
                               Cancel
                           </button>
                           <button 
                             type="submit" 
                             className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold uppercase text-xs tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all"
                           >
                               Create Project
                           </button>
                       </div>
                   </form>
               </div>
           </div>
       )}

       {/* Global Confirmation Modal for this view */}
       <Modal 
         isOpen={modalConfig.isOpen}
         onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
         title={modalConfig.title}
         message={modalConfig.message}
         type="confirm"
         onConfirm={modalConfig.onConfirm}
         variant={modalConfig.variant}
         confirmText="Confirm"
       />
    </div>
  );
};
