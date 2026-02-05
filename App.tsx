import React, { useState, useEffect, useRef } from 'react';
// --- FIREBASE IMPORTS ---
import { db } from './firebase'; 
import { 
  collection, 
  onSnapshot, 
  setDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  increment, 
  getDoc, 
  writeBatch 
} from 'firebase/firestore';

// --- VIEW IMPORTS ---
import { Dashboard } from './views/Dashboard';
import { ProjectDetail } from './views/ProjectDetail';
import { Analytics } from './views/Analytics';
import { ProjectsList } from './views/ProjectsList';
import { Settings } from './views/Settings';
import { Reminders } from './views/Reminders';
import { ActivityHistory } from './views/ActivityHistory';
import { HelpSupport } from './views/HelpSupport';
import { INITIAL_PROJECTS, INITIAL_GOALS, INITIAL_REMINDERS } from './constants';
import { TimerState, Task, Project, Goal, Reminder, InboxTask } from './types';

// --- HELPER: Get ISO Week Number ---
const getWeekNumber = (d: Date) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

function App() {
  // --- State ---
  const [activeView, setActiveView] = useState<'dashboard' | 'analytics' | 'project' | 'projects-list' | 'settings' | 'reminders' | 'activity-history' | 'help-support'>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // --- FIREBASE DATA STATE ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [inboxTasks, setInboxTasks] = useState<InboxTask[]>([]);
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [reminders, setReminders] = useState<Reminder[]>(INITIAL_REMINDERS);
  
  // Daily Goal & Progress
  const [dailyGoalTarget, setDailyGoalTarget] = useState(28800); 
  const [dailyProgress, setDailyProgress] = useState(0); 

  // Timer State
  const [timerState, setTimerState] = useState<TimerState>({
    isActive: false,
    startTime: null,
    elapsedBeforeStart: 0,
    activeTaskId: null,
    activeProjectId: null,
  });
  
  const timerIntervalRef = useRef<number | null>(null);

  // --- 1. PERIODIC RESET LOGIC ---
  useEffect(() => {
    const checkAndPerformResets = async () => {
      if (!db) return;
      // We rely on the projects listener below to perform the actual reset logic
    };
    checkAndPerformResets();
  }, []);

  // --- 2. FIREBASE LISTENERS ---
  
  // Listen for Settings
  useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshot(doc(db, "settings", "user_preferences"), (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            if (data.dailyGoalTarget) setDailyGoalTarget(data.dailyGoalTarget);
        }
    });
    return () => unsubscribe();
  }, []);

  // Listen for Tasks
  useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshot(collection(db, "tasks"), (snapshot) => {
      const loadedTasks = snapshot.docs.map(doc => doc.data() as Task);
      setTasks(loadedTasks);
    });
    return () => unsubscribe();
  }, []);

  // Listen for Inbox
  useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshot(collection(db, "inbox"), (snapshot) => {
      const loadedInbox = snapshot.docs.map(doc => doc.data() as InboxTask);
      setInboxTasks(loadedInbox);
    });
    return () => unsubscribe();
  }, []);

  // Listen for Projects AND Handle Resets
  useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshot(collection(db, "projects"), async (snapshot) => {
      const loadedProjects = snapshot.docs.map(doc => doc.data() as Project);
      
      // --- RESET LOGIC ---
      const metaRef = doc(db, "settings", "meta");
      const metaSnap = await getDoc(metaRef);
      const metaData = metaSnap.data() || {};
      
      const now = new Date();
      const currentDayStr = now.toDateString();
      const currentWeekNum = getWeekNumber(now);
      const currentMonthNum = now.getMonth();
      const currentYear = now.getFullYear();

      const resetDaily = metaData.lastDailyReset !== currentDayStr;
      const resetWeekly = metaData.lastWeeklyReset !== currentWeekNum || metaData.lastYear !== currentYear;
      const resetMonthly = metaData.lastMonthlyReset !== currentMonthNum || metaData.lastYear !== currentYear;

      if ((resetDaily || resetWeekly || resetMonthly) && loadedProjects.length > 0) {
          const batch = writeBatch(db);
          let hasUpdates = false;

          loadedProjects.forEach(p => {
              const updates: any = {};
              if (resetDaily) updates["stats.today"] = 0;
              if (resetWeekly) updates["stats.week"] = 0;
              if (resetMonthly) updates["stats.month"] = 0;
              
              if (Object.keys(updates).length > 0) {
                  const ref = doc(db, "projects", p.id);
                  batch.update(ref, updates);
                  hasUpdates = true;
              }
          });

          if (hasUpdates) {
              batch.set(metaRef, {
                  lastDailyReset: currentDayStr,
                  lastWeeklyReset: currentWeekNum,
                  lastMonthlyReset: currentMonthNum,
                  lastYear: currentYear
              }, { merge: true });
              await batch.commit();
          }
      }

      if (loadedProjects.length === 0 && projects.length === 0) {
        setProjects(INITIAL_PROJECTS); 
      } else {
        setProjects(loadedProjects);
      }
    });
    return () => unsubscribe();
  }, []); 

  // --- AUTO-CALCULATE PROGRESS ---
  useEffect(() => {
    if (projects.length > 0) {
        const totalToday = projects.reduce((acc, curr) => acc + (curr.stats?.today || 0), 0);
        setDailyProgress(totalToday);

        setGoals(prev => prev.map(g => {
            if (g.id === 'daily') return { ...g, currentSeconds: totalToday };
            return g;
        }));
    }
  }, [projects]);


  // --- EFFECTS ---

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handle Timer Ticking (VISUAL UPDATES)
  useEffect(() => {
    if (timerState.isActive) {
      timerIntervalRef.current = window.setInterval(() => {
        setTimerState(prev => ({ ...prev }));
        
        // 1. Update Task Timer
        if (timerState.activeTaskId) {
             setTasks(prev => prev.map(t => t.id === timerState.activeTaskId ? { ...t, totalTime: t.totalTime + 1 } : t));
        }

        // 2. Update Project Stats
        if (timerState.activeProjectId) {
             setProjects(prev => prev.map(p => {
                 if (p.id === timerState.activeProjectId) {
                     const currentStats = p.stats || { today: 0, week: 0, month: 0 };
                     return {
                         ...p,
                         totalTime: (p.totalTime || 0) + 1,
                         stats: {
                             ...currentStats,
                             today: (currentStats.today || 0) + 1,
                             week: (currentStats.week || 0) + 1,
                             month: (currentStats.month || 0) + 1
                         }
                     };
                 }
                 return p;
             }));
        }

        setDailyProgress(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [timerState.isActive, timerState.activeTaskId, timerState.activeProjectId]);


  // --- HANDLERS ---

  const toggleTimer = async (id?: string) => {
    if (timerState.isActive) {
        // STOPPING
        const now = Date.now();
        const startTime = timerState.startTime;
        const secondsElapsed = startTime ? Math.floor((now - startTime) / 1000) : 0;

        setTimerState({
            isActive: false,
            startTime: null,
            elapsedBeforeStart: 0,
            activeTaskId: null,
            activeProjectId: null
        });

        if (secondsElapsed > 0 && db) {
            try {
                if (timerState.activeTaskId) {
                    const taskRef = doc(db, "tasks", timerState.activeTaskId);
                    updateDoc(taskRef, { totalTime: increment(secondsElapsed) });
                }
                if (timerState.activeProjectId) {
                    const projectRef = doc(db, "projects", timerState.activeProjectId);
                    updateDoc(projectRef, { 
                        totalTime: increment(secondsElapsed),
                        "stats.today": increment(secondsElapsed),
                        "stats.week": increment(secondsElapsed),
                        "stats.month": increment(secondsElapsed)
                    });
                }
            } catch (error) {
                console.error("Error saving timer:", error);
            }
        }
    } else {
        // STARTING
        let targetTaskId: string | null = null;
        let targetProjectId: string | null = null;
        const now = Date.now();
        const isTask = tasks.find(t => t.id === id);
        
        if (isTask) {
            targetTaskId = id!;
            targetProjectId = isTask.projectId;
        } else if (id) {
            targetProjectId = id;
        } else {
            if (activeView === 'project' && selectedProjectId) {
                targetProjectId = selectedProjectId;
            } else {
               targetProjectId = projects[0]?.id || 'default';
            }
        }

        setTimerState({
          isActive: true,
          startTime: now,
          elapsedBeforeStart: 0, 
          activeTaskId: targetTaskId,
          activeProjectId: targetProjectId 
        });
    }
  };

  const addTask = async (title: string, projectId: string) => {
    const newTask: Task = {
        id: `t-${Date.now()}`,
        projectId: projectId,
        title: title,
        status: 'active',
        totalTime: 0
    };
    if (db) await setDoc(doc(db, "tasks", newTask.id), newTask);
    else setTasks(prev => [newTask, ...prev]);
  };

  const updateTask = async (updatedTask: Task) => {
    if (db) await setDoc(doc(db, "tasks", updatedTask.id), updatedTask);
    else setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const newSubtasks = task.subtasks?.map(st => 
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    if (db) {
        const taskRef = doc(db, "tasks", taskId);
        await updateDoc(taskRef, { subtasks: newSubtasks });
    } else {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, subtasks: newSubtasks } : t));
    }
  };

  const addInboxTask = async (title: string) => {
    const newTask: InboxTask = { id: `i-${Date.now()}`, title, completed: false };
    if (db) await setDoc(doc(db, "inbox", newTask.id), newTask);
    else setInboxTasks(prev => [newTask, ...prev]);
  };

  const toggleInboxTask = async (id: string) => {
    const task = inboxTasks.find(t => t.id === id);
    if (!task) return;
    if (db) {
        const taskRef = doc(db, "inbox", id);
        await updateDoc(taskRef, { completed: !task.completed });
        setTimeout(async () => {
            if (!task.completed) { await deleteDoc(doc(db, "inbox", id)); }
        }, 2000);
    } else {
        setInboxTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
        setTimeout(() => {
             setInboxTasks(prev => prev.filter(t => t.id !== id || !t.completed));
        }, 2000);
    }
  };

  const addProject = async (project: Project) => {
    if (db) await setDoc(doc(db, "projects", project.id), project);
    else setProjects(prev => [project, ...prev]);
  };

  const updateProject = async (updatedProject: Project) => {
     if (db) await setDoc(doc(db, "projects", updatedProject.id), updatedProject);
     else setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const deleteProjects = async (projectIds: string[]) => {
    if (db) {
        projectIds.forEach(async (id) => { await deleteDoc(doc(db, "projects", id)); });
        const tasksToDelete = tasks.filter(t => projectIds.includes(t.projectId));
        tasksToDelete.forEach(async (t) => { await deleteDoc(doc(db, "tasks", t.id)); });
    } else {
        setProjects(prev => prev.filter(p => !projectIds.includes(p.id)));
        setTasks(prev => prev.filter(t => !projectIds.includes(t.projectId)));
    }
    if (selectedProjectId && projectIds.includes(selectedProjectId)) {
        setSelectedProjectId(null);
        setActiveView('projects-list');
    }
  };

  const updateDailyTarget = async (newTarget: number) => {
     setDailyGoalTarget(newTarget); 
     if (db) {
         await setDoc(doc(db, "settings", "user_preferences"), {
             dailyGoalTarget: newTarget
         }, { merge: true });
     }
  };

  const updateGoal = (id: string, newTarget: number) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, targetSeconds: newTarget } : g));
  };
  
  const addReminder = (reminder: Reminder) => {
    setReminders(prev => [...prev, reminder]);
  };
  const toggleReminder = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
    setTimeout(() => {
        setReminders(prev => prev.filter(r => r.id !== id || !r.completed));
    }, 1000);
  };

  // Navigation
  const navigateToProject = (projectId: string) => { setSelectedProjectId(projectId); setActiveView('project'); };
  const navigateToDashboard = () => { setActiveView('dashboard'); setSelectedProjectId(null); };
  const navigateToAnalytics = () => { setActiveView('analytics'); setSelectedProjectId(null); };
  const navigateToProjectsList = () => { setActiveView('projects-list'); setSelectedProjectId(null); };
  const navigateToSettings = () => { setActiveView('settings'); setSelectedProjectId(null); };
  const navigateToReminders = () => { setActiveView('reminders'); setSelectedProjectId(null); };
  const navigateToActivityHistory = () => { setActiveView('activity-history'); setSelectedProjectId(null); };
  const navigateToHelpSupport = () => { setActiveView('help-support'); setSelectedProjectId(null); };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard
            timerState={timerState}
            goals={goals}
            dailyGoalTarget={dailyGoalTarget}
            dailyProgress={dailyProgress}
            recentTasks={tasks.slice(0, 3)}
            allTasks={tasks}
            projects={projects}
            reminders={reminders}
            inboxTasks={inboxTasks}
            onToggleTimer={toggleTimer} 
            onNavigateToTask={(projectId) => navigateToProject(projectId)}
            onAddTask={addTask}
            onAddInboxTask={addInboxTask}
            onToggleInboxTask={toggleInboxTask}
            onNavigateToHistory={navigateToActivityHistory}
            onToggleSubtask={toggleSubtask}
          />
        );
      case 'analytics':
        return (
          <Analytics 
            goals={goals} 
            dailyTarget={dailyGoalTarget} 
            onUpdateGoal={updateGoal} 
            onUpdateDailyTarget={updateDailyTarget} 
            onNavigateToHistory={navigateToActivityHistory}
          />
        );
      case 'projects-list':
        return <ProjectsList 
          projects={projects} 
          tasks={tasks} 
          inboxTasks={inboxTasks}
          onAddInboxTask={addInboxTask}
          onToggleInboxTask={toggleInboxTask}
          onSelectProject={navigateToProject} 
          onDeleteProjects={deleteProjects}
          onAddProject={addProject}
        />;
      case 'settings':
        return <Settings 
          isDarkMode={isDarkMode} 
          toggleTheme={() => setIsDarkMode(!isDarkMode)} 
          onNavigateToHelp={navigateToHelpSupport}
        />;
      case 'reminders':
        return <Reminders reminders={reminders} onAddReminder={addReminder} onToggleReminder={toggleReminder} />;
      case 'activity-history':
        return <ActivityHistory tasks={tasks} projects={projects} onBack={navigateToDashboard} />;
      case 'help-support':
        return <HelpSupport onBack={navigateToSettings} />;
      case 'project':
        const project = projects.find(p => p.id === selectedProjectId);
        if (!project) return null;
        const projectTasks = tasks.filter(t => t.projectId === project.id);
        return (
          <ProjectDetail
            project={project}
            tasks={projectTasks}
            timerState={timerState}
            onBack={navigateToProjectsList}
            onToggleTimer={toggleTimer}
            onUpdateTask={updateTask}
            onUpdateProject={updateProject}
            onAddReminder={addReminder}
            onAddTask={addTask}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* NUCLEAR CSS RESET */}
      <style>{`
        * { box-sizing: border-box; }
        html, body, #root { margin: 0; padding: 0; height: 100%; width: 100%; overflow-x: hidden; }
      `}</style>
      
      {/* 1. border-t border-transparent: Prevents margin collapse
          2. min-h-[100dvh]: Ensures it fills mobile screens exactly
          3. pt-0, mt-0: Ensures no top spacing
      */}
      <div 
        className="relative flex flex-col w-full min-h-[100dvh] bg-background text-foreground pb-0 overflow-x-hidden border-t border-transparent" 
        style={{ margin: 0, padding: 0 }}
      >
        <div className="flex-1 w-full pb-20">
          {renderView()}
          
          {/* Subtle Watermark */}
          <div className="w-full text-center py-8 text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em] select-none">
              Michael Fan made this
          </div>
        </div>

        {/* Bottom Navigation Dock */}
        <div className="fixed bottom-0 left-0 w-full bg-background/90 backdrop-blur-2xl border-t border-border pb-4 z-40 transition-colors">
          <div className="flex justify-between items-center px-8 max-w-lg mx-auto">
            {/* Dashboard Button */}
            <button 
              onClick={navigateToDashboard}
              className={`flex flex-col items-center gap-1 p-2 group transition-all duration-300 ${activeView === 'dashboard' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
            >
              <span className={`material-symbols-outlined text-[28px] transition-transform ${activeView === 'dashboard' ? 'scale-110 fill-1' : ''}`}>home</span>
            </button>
            
            {/* Projects Button */}
            <button 
              onClick={navigateToProjectsList}
              className={`flex flex-col items-center gap-1 p-2 group transition-all duration-300 ${activeView === 'projects-list' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
            >
               <span className={`material-symbols-outlined text-[28px] transition-transform ${activeView === 'projects-list' ? 'scale-110 fill-1' : ''}`}>folder_open</span>
            </button>
            
            {/* Analytics Button */}
            <button 
              onClick={navigateToAnalytics}
              className={`flex flex-col items-center gap-1 p-2 group transition-all duration-300 ${activeView === 'analytics' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
            >
               <span className={`material-symbols-outlined text-[28px] transition-transform ${activeView === 'analytics' ? 'scale-110 fill-1' : ''}`}>bar_chart</span>
            </button>

            {/* Reminders Button */}
            <button 
              onClick={navigateToReminders}
              className={`flex flex-col items-center gap-1 p-2 group transition-all duration-300 ${activeView === 'reminders' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
            >
               <span className={`material-symbols-outlined text-[28px] transition-transform ${activeView === 'reminders' ? 'scale-110 fill-1' : ''}`}>notifications</span>
            </button>
            
            {/* Settings Button */}
            <button 
                onClick={navigateToSettings}
                className={`flex flex-col items-center gap-1 p-2 group transition-all duration-300 ${activeView === 'settings' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
            >
              <span className={`material-symbols-outlined text-[28px] transition-transform ${activeView === 'settings' ? 'scale-110 fill-1' : ''}`}>settings</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;