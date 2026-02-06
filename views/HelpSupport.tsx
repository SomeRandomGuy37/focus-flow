
import React from 'react';

interface HelpSupportProps {
  onBack: () => void;
}

export const HelpSupport: React.FC<HelpSupportProps> = ({ onBack }) => {
  return (
    <div className="animate-in slide-in-from-right-8 duration-500 w-full min-h-screen bg-background">
      {/* Sticky Header - Standardized */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl px-6 py-4 flex items-center gap-4 border-b border-border/50 transition-all">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>
        <h1 className="text-xl font-extrabold tracking-tight text-foreground">Help & Support</h1>
      </div>

      <main className="p-6 max-w-2xl mx-auto space-y-8 pb-32">
        <section className="space-y-3">
            <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">rocket_launch</span>
                </div>
                <h2 className="text-lg font-bold">Getting Started</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
                FocusFlow is designed to help you manage your projects and track your time seamlessly. 
                Start by creating a project and adding tasks to it.
            </p>
        </section>

        <section className="space-y-3">
            <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">timer</span>
                </div>
                <h2 className="text-lg font-bold">Using the Timer</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
                Click the <strong>Play</strong> button on any task or project card to start tracking time. 
                Your sessions are automatically logged and contribute to your daily and weekly goals.
                You can view your progress in the <strong>Analytics</strong> tab.
            </p>
        </section>

        <section className="space-y-3">
            <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">check_circle</span>
                </div>
                <h2 className="text-lg font-bold">Managing Tasks</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
                Tasks can have subtasks, notes, and deadlines. Click on any task card to expand it and view more details.
                Use the <strong>Inbox</strong> on the dashboard for quick, one-off tasks that don't belong to a specific project yet.
            </p>
        </section>
        
        <section className="space-y-3">
            <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">tune</span>
                </div>
                <h2 className="text-lg font-bold">Goals & Settings</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
                Navigate to the <strong>Analytics</strong> tab to adjust your daily, weekly, or monthly time targets.
                You can customize your experience, including Dark Mode, in the Settings.
            </p>
        </section>

        <div className="p-4 rounded-2xl bg-secondary/50 border border-border text-xs text-muted-foreground text-center mt-8">
            Version 1.0.0
        </div>
      </main>
    </div>
  );
};
