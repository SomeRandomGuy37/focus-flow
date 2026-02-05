
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

interface SettingsProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  onNavigateToHelp: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ isDarkMode, toggleTheme, onNavigateToHelp }) => {
  // Test State
  const [testTableName, setTestTableName] = useState('tasks');
  const [testInputData, setTestInputData] = useState('New Supabase Task');
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [testResult, setTestResult] = useState<string>('');
  const [fetchedTasks, setFetchedTasks] = useState<any[]>([]);

  const handleTestConnection = async () => {
    if (!supabase) {
        setTestResult("Supabase client not initialized. Check internet or CDN.");
        return;
    }
    
    setTestStatus('loading');
    setTestResult('');
    setFetchedTasks([]);
    
    try {
        // 1. Insert Data
        if (testInputData.trim()) {
            const { error: insertError } = await supabase
                .from(testTableName)
                .insert([{ title: testInputData }]);

            if (insertError) throw insertError;
        }

        // 2. Fetch Data (Display)
        const { data: fetchData, error: fetchError } = await supabase
            .from(testTableName)
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        if (fetchError) throw fetchError;

        console.log("Supabase Fetch Response:", fetchData);

        setTestStatus('success');
        setFetchedTasks(fetchData || []);
        setTestResult(JSON.stringify(fetchData, null, 2));

    } catch (err: any) {
        console.error("Supabase Error:", err);
        setTestStatus('error');
        setTestResult(`Error: ${err.message || JSON.stringify(err)}`);
    }
  };

  const toggleSupabaseTask = async (task: any) => {
    if (!supabase) return;

    // Detect completion field (supports 'completed', 'is_complete', or 'status')
    let field = 'completed';
    let newVal: any = true;

    if ('is_complete' in task) {
        field = 'is_complete';
        newVal = !task.is_complete;
    } else if ('status' in task) {
        field = 'status';
        newVal = task.status === 'completed' ? 'active' : 'completed';
    } else {
        // Default to 'completed' boolean
        newVal = !task.completed;
    }

    // Optimistic Update
    const originalTasks = [...fetchedTasks];
    setFetchedTasks(prev => prev.map(t => t.id === task.id ? { ...t, [field]: newVal } : t));

    try {
        const { error } = await supabase
            .from(testTableName)
            .update({ [field]: newVal })
            .eq('id', task.id);

        if (error) throw error;
    } catch (err: any) {
        console.error("Update failed", err);
        // Revert
        setFetchedTasks(originalTasks);
        alert(`Failed to update task: ${err.message}`);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      {/* Sticky Header - Reduced top padding */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl px-6 pt-4 pb-4 flex items-end justify-between border-b border-border/50 transition-all">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground leading-none">Settings</h1>
          <p className="text-sm font-semibold text-muted-foreground mt-1.5">Preferences & Account</p>
        </div>
      </div>

      <main className="px-6 pb-32 pt-8 flex flex-col gap-10 max-w-xl mx-auto w-full">
          
          <section className="flex flex-col gap-4">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Profile</h2>
              <div className="flex items-center gap-5 p-5 bg-card border border-border rounded-[1.5rem] shadow-sm">
                  <div className="size-16 rounded-full bg-secondary overflow-hidden ring-2 ring-border">
                      <img src="https://picsum.photos/seed/user/200/200" alt="Profile" className="size-full object-cover" />
                  </div>
                  <div>
                      <h3 className="font-bold text-xl">Alex Designer</h3>
                      <p className="text-sm text-muted-foreground font-medium">alex@example.com</p>
                      <button className="text-primary text-xs font-bold uppercase mt-2 hover:underline tracking-wide">Edit Profile</button>
                  </div>
              </div>
          </section>

          <section className="flex flex-col gap-4">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Backend Integration Test</h2>
              <div className="flex flex-col gap-4 p-5 bg-card border border-border rounded-[1.5rem] shadow-sm">
                  <p className="text-sm text-muted-foreground">
                      Test the connection to your Supabase backend. Inserting a row will fetch the latest 5 items.
                  </p>
                  
                  <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Target Table</label>
                      <input 
                        type="text" 
                        value={testTableName}
                        onChange={(e) => setTestTableName(e.target.value)}
                        className="bg-background border border-border rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                      />
                  </div>

                  <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Task Title (Optional)</label>
                      <input 
                        type="text" 
                        value={testInputData}
                        onChange={(e) => setTestInputData(e.target.value)}
                        placeholder="Leave empty to just fetch"
                        className="bg-background border border-border rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                      />
                  </div>

                  <button 
                    onClick={handleTestConnection}
                    disabled={testStatus === 'loading'}
                    className={`mt-2 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all
                        ${testStatus === 'loading' ? 'bg-secondary text-muted-foreground cursor-wait' : 'bg-primary text-primary-foreground hover:brightness-110 active:scale-95'}
                    `}
                  >
                    {testStatus === 'loading' ? (
                        <>
                            <span className="size-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"></span>
                            Connecting...
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-lg">cloud_sync</span>
                            Test Connection
                        </>
                    )}
                  </button>

                  {/* Interactive Result List */}
                  {fetchedTasks.length > 0 && (
                      <div className="flex flex-col gap-2 mt-4">
                          <h3 className="text-xs font-bold uppercase text-muted-foreground mb-1">Latest Rows</h3>
                          {fetchedTasks.map((task, idx) => {
                              const isCompleted = task.completed || task.is_complete || task.status === 'completed';
                              return (
                                  <div key={task.id || idx} className="flex items-center gap-3 p-3 bg-background border border-border rounded-xl shadow-sm transition-all hover:border-primary/30">
                                      <button 
                                        onClick={() => toggleSupabaseTask(task)}
                                        className={`size-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isCompleted ? 'bg-green-500 border-green-500' : 'border-muted-foreground hover:border-primary'}`}
                                      >
                                          {isCompleted && <span className="material-symbols-outlined text-sm text-white font-bold animate-in zoom-in duration-200">check</span>}
                                      </button>
                                      <span className={`text-sm font-medium truncate flex-1 ${isCompleted ? 'line-through text-muted-foreground decoration-2 decoration-muted-foreground/50' : 'text-foreground'}`}>
                                          {task.title || task.name || <span className="italic text-muted-foreground">Untitled Task</span>}
                                      </span>
                                      <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-1 rounded">
                                          {task.id?.toString().slice(0,4)}...
                                      </span>
                                  </div>
                              );
                          })}
                      </div>
                  )}

                  {testResult && (
                      <div className="mt-2">
                          <details className="text-xs">
                              <summary className="cursor-pointer font-bold text-muted-foreground hover:text-primary mb-2">View Raw Response</summary>
                              <div className={`p-4 rounded-xl font-mono overflow-x-auto ${testStatus === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-foreground'}`}>
                                  <pre>{testResult}</pre>
                              </div>
                          </details>
                      </div>
                  )}
              </div>
          </section>

          <section className="flex flex-col gap-4">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">System UI</h2>
              
              <div className="flex flex-col gap-px bg-border rounded-[1.5rem] overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between p-5 bg-card hover:bg-secondary/20 transition-colors">
                      <div className="flex items-center gap-4">
                          <div className="p-2.5 rounded-xl bg-secondary text-foreground">
                              <span className="material-symbols-outlined block">contrast</span>
                          </div>
                          <span className="font-bold text-base">Dark Mode</span>
                      </div>
                      <button 
                        onClick={toggleTheme}
                        className={`w-14 h-8 rounded-full transition-colors relative flex items-center px-1 ${isDarkMode ? 'bg-primary' : 'bg-secondary border border-border'}`}
                      >
                          <div className={`size-6 bg-white rounded-full shadow-md transition-transform duration-300 ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                      </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-5 bg-card hover:bg-secondary/20 transition-colors">
                      <div className="flex items-center gap-4">
                          <div className="p-2.5 rounded-xl bg-secondary text-foreground">
                              <span className="material-symbols-outlined block">notifications</span>
                          </div>
                          <span className="font-bold text-base">Notifications</span>
                      </div>
                      <span className="text-xs font-bold text-muted-foreground uppercase bg-secondary/50 px-2 py-1 rounded-md">On</span>
                  </div>
              </div>
          </section>

          <section className="flex flex-col gap-4">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">General</h2>
              
              <div className="flex flex-col gap-px bg-border rounded-[1.5rem] overflow-hidden shadow-sm">
                  <div 
                    onClick={onNavigateToHelp}
                    className="flex items-center justify-between p-5 bg-card hover:bg-secondary/20 transition-colors cursor-pointer group"
                  >
                      <div className="flex items-center gap-4">
                          <div className="p-2.5 rounded-xl bg-secondary text-foreground">
                              <span className="material-symbols-outlined block">help</span>
                          </div>
                          <span className="font-bold text-base">Help & Support</span>
                      </div>
                      <span className="material-symbols-outlined text-muted-foreground group-hover:translate-x-1 transition-transform">chevron_right</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-5 bg-card hover:bg-secondary/20 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                          <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                              <span className="material-symbols-outlined block">logout</span>
                          </div>
                          {/* Increased visibility for dark mode */}
                          <span className="font-bold text-red-600 dark:text-red-400 text-base">Sign Out</span>
                      </div>
                  </div>
              </div>
          </section>

      </main>
    </div>
  );
};
