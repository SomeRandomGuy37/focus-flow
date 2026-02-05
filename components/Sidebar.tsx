import React from 'react';
import { Project } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onSelectProject: (id: string) => void;
  currentViewId: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, projects, onSelectProject, currentViewId }) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed inset-y-0 left-0 z-[70] w-3/4 max-w-[280px] bg-background p-8 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-border ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col gap-10">
          <div className="flex items-center gap-3 mt-12">
             <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-primary-foreground text-lg">folder_open</span>
             </div>
             <h2 className="text-lg font-bold tracking-tight">All Projects</h2>
          </div>

          <div className="space-y-4">
            <ul className="flex flex-col gap-2">
              {projects.map(proj => (
                <li 
                  key={proj.id}
                  onClick={() => { onSelectProject(proj.id); onClose(); }}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 border border-transparent cursor-pointer transition-all duration-200
                    ${currentViewId === proj.id ? 'bg-secondary text-foreground border-border font-bold shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-foreground hover:font-medium'}
                  `}
                >
                  <span className={`material-symbols-outlined text-xl ${currentViewId === proj.id ? 'fill-1' : ''}`}>{proj.icon}</span>
                  <div className="flex flex-col">
                    <span className="text-sm">{proj.name}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <button className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors w-full px-2 py-2 rounded-lg hover:bg-secondary/50">
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-bold">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};
