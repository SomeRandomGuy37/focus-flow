
import React, { useState } from 'react';
import { Reminder } from '../types';

interface RemindersProps {
  reminders: Reminder[];
  onAddReminder: (reminder: Reminder) => void;
  onToggleReminder: (id: string) => void;
}

export const Reminders: React.FC<RemindersProps> = ({ reminders, onAddReminder, onToggleReminder }) => {
  const [activeTab, setActiveTab] = useState<'short-term' | 'long-term'>('short-term');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');

  const filteredReminders = reminders.filter(r => r.type === activeTab);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle && newTime) {
        onAddReminder({
            id: `r-${Date.now()}`,
            title: newTitle,
            dueTime: newTime,
            type: activeTab,
            completed: false
        });
        setNewTitle('');
        setNewTime('');
        setIsAdding(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      {/* Sticky Header - Standardized */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl px-6 pt-8 pb-4 flex flex-col gap-5 border-b border-border/50 transition-all">
        <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground leading-none">Reminders</h1>
            <p className="text-sm font-semibold text-muted-foreground mt-1.5">Scheduled Tasks</p>
        </div>
        
        <div className="flex p-1.5 bg-secondary rounded-xl">
            <button 
                onClick={() => setActiveTab('short-term')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'short-term' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
                Daily
            </button>
            <button 
                onClick={() => setActiveTab('long-term')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'long-term' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
                Long Term
            </button>
        </div>
      </div>

      <main className="px-6 pb-32 pt-8 flex flex-col gap-5 max-w-xl mx-auto w-full">
          
          {filteredReminders.map(reminder => (
              <div 
                key={reminder.id}
                onClick={() => onToggleReminder(reminder.id)}
                className={`flex items-center gap-5 p-5 rounded-2xl border transition-all cursor-pointer ${reminder.completed ? 'bg-secondary/30 border-transparent opacity-60' : 'bg-card border-border shadow-sm hover:border-primary/40'}`}
              >
                  <div className={`size-7 rounded-full border-2 flex items-center justify-center transition-colors ${reminder.completed ? 'bg-primary border-primary' : 'border-muted-foreground/30'}`}>
                      {reminder.completed && <span className="material-symbols-outlined text-sm text-primary-foreground font-bold">check</span>}
                  </div>
                  <div className="flex-1">
                      <p className={`font-bold text-base ${reminder.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{reminder.title}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-muted-foreground uppercase tracking-wide">
                          <span className="material-symbols-outlined text-sm">alarm</span>
                          {reminder.dueTime}
                      </div>
                  </div>
              </div>
          ))}

          {isAdding ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 bg-secondary/20 border border-dashed border-primary/30 rounded-3xl animate-in zoom-in-95 duration-200">
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="Reminder title..." 
                    className="bg-transparent border-b border-border p-2 outline-none font-bold text-lg placeholder:font-normal placeholder:text-muted-foreground/50"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                  />
                  <div className="flex gap-3">
                      <input 
                        type="time" 
                        className="bg-background rounded-xl border border-border px-4 py-3 text-sm font-bold outline-none focus:ring-1 focus:ring-primary"
                        value={newTime}
                        onChange={e => setNewTime(e.target.value)}
                      />
                      <div className="flex-1 flex justify-end gap-3">
                          <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-3 text-xs font-bold uppercase hover:bg-secondary rounded-xl transition-colors">Cancel</button>
                          <button type="submit" className="px-6 py-3 bg-primary text-primary-foreground text-xs font-bold uppercase rounded-xl shadow-md hover:brightness-110 active:scale-95 transition-all">Set</button>
                      </div>
                  </div>
              </form>
          ) : (
            <button 
                onClick={() => setIsAdding(true)}
                className="flex items-center justify-center gap-3 p-5 rounded-[1.5rem] border border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-secondary/20 transition-all font-bold group"
            >
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform">add_alert</span>
                Add Reminder
            </button>
          )}

      </main>
    </div>
  );
};
