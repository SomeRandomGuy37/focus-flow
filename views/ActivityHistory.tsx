
import React from 'react';
import { Task, Project } from '../types';
import { formatDuration } from '../utils';

interface ActivityHistoryProps {
  tasks: Task[];
  projects: Project[];
  onBack: () => void;
}

export const ActivityHistory: React.FC<ActivityHistoryProps> = ({ tasks, projects, onBack }) => {
  // Sort by tasks that have time logged (simulating history)
  // In a real app this would query a separate 'ActivityLog' entity
  const activeHistory = tasks.filter(t => t.totalTime > 0).sort((a, b) => b.totalTime - a.totalTime);

  return (
    <div className="animate-in slide-in-from-right-8 duration-500 w-full">
      {/* Sticky Header - Standardized */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl px-6 py-4 flex items-center justify-between border-b border-border/50 transition-all">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 -ml-3 rounded-full hover:bg-secondary active:scale-95 transition-all text-muted-foreground hover:text-foreground">
                <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground leading-none">History</h1>
                <p className="text-sm font-semibold text-muted-foreground mt-2">Past Activity</p>
            </div>
        </div>
      </div>

      <main className="px-6 pb-32 pt-6 flex flex-col gap-6 max-w-xl mx-auto w-full">
          {activeHistory.map(task => {
              const project = projects.find(p => p.id === task.projectId);
              return (
                  <div key={task.id} className="flex flex-col gap-2 p-5 bg-card border border-border rounded-2xl shadow-sm">
                      <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4">
                              <div className={`size-12 rounded-xl bg-secondary flex items-center justify-center text-foreground`}>
                                  <span className="material-symbols-outlined text-xl">{project?.icon || 'task'}</span>
                              </div>
                              <div>
                                  <h3 className="font-bold text-base">{task.title}</h3>
                                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{project?.name}</p>
                              </div>
                          </div>
                          <span className="font-mono font-bold text-sm bg-secondary px-3 py-1 rounded-lg">
                              {formatDuration(task.totalTime)}
                          </span>
                      </div>
                      <div className="h-px bg-border/50 w-full my-2"></div>
                      <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase tracking-wide font-bold">
                          <span>Logged Recently</span>
                          <span className="text-green-500 flex items-center gap-1">
                             <span className="material-symbols-outlined text-sm">check_circle</span>
                             Completed
                          </span>
                      </div>
                  </div>
              )
          })}
          
          {activeHistory.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                  <p>No activity recorded yet.</p>
              </div>
          )}
      </main>
    </div>
  );
};
