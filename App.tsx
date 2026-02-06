import React, { useState, useEffect, useRef } from 'react';
// --- FIREBASE IMPORTS ---
import { db } from './firebase'; 
// ADDED: GoogleAuthProvider and signInWithPopup
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
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
import { TimerState, Task, Project, Goal, Reminder, InboxTask, UserProfile } from './types';

// --- HELPER: Get ISO Week Number ---
const getWeekNumber = (d: Date) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

// --- AUTH COMPONENT (Login Screen with Google) ---
const AuthScreen = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = getAuth();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (isSignUp && password !== confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
    }

    try {
      if (isSignUp) {
        // checks if email is already in use by default in firebase
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      let msg = err.message;
      // Handle specific Firebase errors for better UX
      if (err.code === 'auth/email-already-in-use') {
          msg = "This email is already registered. Please sign in.";
      } else if (err.code === 'auth/weak-password') {
          msg = "Password should be at least 6 characters.";
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
          msg = "Invalid email or password.";
      }
      setError(msg.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
    } catch (err: any) {
        setError(err.message.replace('Firebase: ', ''));
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-6">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary">FocusFlow</h1>
          <p className="mt-2 text-muted-foreground">
            {isSignUp ? "Create your private workspace" : "Welcome back to your flow"}
          </p>
        </div>

        <div className="space-y-4">
            {/* GOOGLE SIGN IN BUTTON */}
            <button 
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full py-3 px-4 bg-white text-black border border-gray-300 font-bold rounded-xl transition-all hover:bg-gray-50 active:scale-95 flex items-center justify-center gap-2"
            >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                Sign in with Google
            </button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
                <input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-xl bg-muted border border-border focus:ring-2 focus:ring-primary outline-none transition-all"
                required 
                />
                <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-xl bg-muted border border-border focus:ring-2 focus:ring-primary outline-none transition-all"
                required 
                />
                {isSignUp && (
                    <input 
                    type="password" 
                    placeholder="Confirm Password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-3 rounded-xl bg-muted border border-border focus:ring-2 focus:ring-primary outline-none transition-all animate-in slide-in-from-top-2 duration-300"
                    required 
                    />
                )}
            </div>

            {error && <p className="text-sm text-red-500 text-center bg-red-500/10 p-2 rounded-lg">{error}</p>}

            <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 px-4 bg-primary hover:opacity-90 text-primary-foreground font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50"
            >
                {loading ? "Processing..." : (isSignUp ? "Sign Up" : "Sign In")}
            </button>
            </form>
        </div>

        <div className="text-center">
          <button 
            onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setConfirmPassword('');
                setPassword('');
            }}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};

function App() {
  // --- Auth State ---
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // --- App State ---
  const [activeView, setActiveView] = useState<'dashboard' | 'analytics' | 'project' | 'projects-list' | 'settings' | 'reminders' | 'activity-history' | 'help-support'>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // --- Data State ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [inboxTasks, setInboxTasks] = useState<InboxTask[]>([]);
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [reminders, setReminders] = useState<Reminder[]>(INITIAL_REMINDERS);
  
  const [dailyGoalTarget, setDailyGoalTarget] = useState(28800); 
  const [dailyProgress, setDailyProgress] = useState(0); 

  const [timerState, setTimerState] = useState<TimerState>({
    isActive: false, startTime: null, elapsedBeforeStart: 0, activeTaskId: null, activeProjectId: null,
  });
  
  const timerIntervalRef = useRef<number | null>(null);

  // --- AUTH LISTENER ---
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- 1. PERIODIC RESET LOGIC (PRIVATE SCOPE) ---
  useEffect(() => {
    if (!user || !db) return; // Only run if logged in

    const checkAndPerformResets = async () => {
       // Logic handled in Projects Listener to ensure data is loaded first
    };
    checkAndPerformResets();
  }, [user]);

  // --- 2. FIREBASE LISTENERS (PRIVATE SCOPE) ---
  
  // Listen for Settings and Profile Sync
  useEffect(() => {
    if (!user || !db) return;
    
    // Listen to User Preferences
    const prefUnsubscribe = onSnapshot(doc(db, "users", user.uid, "settings", "user_preferences"), (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            if (data.dailyGoalTarget) setDailyGoalTarget(data.dailyGoalTarget);
            if (data.isDarkMode !== undefined) setIsDarkMode(data.isDarkMode);
        }
    });

    // Listen/Create User Profile
    const profileRef = doc(db, "users", user.uid, "settings", "profile");
    const profileUnsubscribe = onSnapshot(profileRef, async (docSnap) => {
        if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
        } else {
            // Profile doesn't exist, create it based on Auth provider
            const newProfile: UserProfile = {
                name: user.displayName || 'New User',
                email: user.email || '',
                // Use Google Photo if available, otherwise a placeholder
                avatar: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName ? encodeURIComponent(user.displayName) : 'User'}&background=random`
            };
            await setDoc(profileRef, newProfile);
        }
    });

    return () => {
        prefUnsubscribe();
        profileUnsubscribe();
    };
  }, [user]);

  // Listen for Tasks
  useEffect(() => {
    if (!user || !db) return;
    const unsubscribe = onSnapshot(collection(db, "users", user.uid, "tasks"), (snapshot) => {
      const loadedTasks = snapshot.docs.map(doc => doc.data() as Task);
      setTasks(loadedTasks);
    });
    return () => unsubscribe();
  }, [user]);

  // Listen for Inbox
  useEffect(() => {
    if (!user || !db) return;
    const unsubscribe = onSnapshot(collection(db, "users", user.uid, "inbox"), (snapshot) => {
      const loadedInbox = snapshot.docs.map(doc => doc.data() as InboxTask);
      setInboxTasks(loadedInbox);
    });
    return () => unsubscribe();
  }, [user]);

  // Listen for Projects & Handle Resets
  useEffect(() => {
    if (!user || !db) return;
    const unsubscribe = onSnapshot(collection(db, "users", user.uid, "projects"), async (snapshot) => {
      const loadedProjects = snapshot.docs.map(doc => doc.data() as Project);
      
      // --- RESET LOGIC ---
      const metaRef = doc(db, "users", user.uid, "settings", "meta");
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
                  const ref = doc(db, "users", user.uid, "projects", p.id);
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

      // --- INITIALIZE FOR NEW USER ---
      if (loadedProjects.length === 0 && projects.length === 0) {
         if (!metaData.initialized) {
              // Create default projects in private DB
              const batch = writeBatch(db);
              INITIAL_PROJECTS.forEach(p => {
                  const ref = doc(db, "users", user.uid, "projects", p.id);
                  batch.set(ref, p);
              });
              batch.set(metaRef, { initialized: true }, { merge: true });
              await batch.commit();
         }
      } else {
        setProjects(loadedProjects);
      }
    });
    return () => unsubscribe();
  }, [user]); 

  // --- AUTO-CALCULATE PROGRESS ---
  useEffect(() => {
    if (projects.length > 0) {
        const totalToday = projects.reduce((acc, curr) => acc + (curr.stats?.today || 0), 0);
        const totalWeek = projects.reduce((acc, curr) => acc + (curr.stats?.week || 0), 0);
        const totalMonth = projects.reduce((acc, curr) => acc + (curr.stats?.month || 0), 0);
        
        setDailyProgress(totalToday);
        
        setGoals(prev => prev.map(g => {
            if (g.period === 'weekly') return { ...g, currentSeconds: totalWeek };
            if (g.period === 'monthly') return { ...g, currentSeconds: totalMonth };
            return g;
        }));
    }
  }, [projects]);


  // --- EFFECTS ---

  // Apply dark mode class whenever state changes
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  // Handle Timer Ticking (Visual Only)
  useEffect(() => {
    if (timerState.isActive) {
      timerIntervalRef.current = window.setInterval(() => {
        setTimerState(prev => ({ ...prev }));
        
        // 1. Task Visual Update
        if (timerState.activeTaskId) {
             setTasks(prev => prev.map(t => t.id === timerState.activeTaskId ? { ...t, totalTime: t.totalTime + 1 } : t));
        }

        // 2. Project Visual Update (All Stats)
        if (timerState.activeProjectId) {
             setProjects(prev => prev.map(p => {
                 if (p.id === timerState.activeProjectId) {
                     const stats = p.stats || { today: 0, week: 0, month: 0 };
                     return {
                         ...p,
                         totalTime: (p.totalTime || 0) + 1,
                         stats: {
                             ...stats,
                             today: (stats.today || 0) + 1,
                             week: (stats.week || 0) + 1,
                             month: (stats.month || 0) + 1
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


  // --- HANDLERS (SCOPED TO USER) ---

  const handleThemeToggle = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode); // Immediate UI update
    
    // Persist to DB
    if (user && db) {
      try {
        await setDoc(doc(db, "users", user.uid, "settings", "user_preferences"), { isDarkMode: newMode }, { merge: true });
      } catch (error) {
        console.error("Error saving theme preference:", error);
      }
    }
  };

  const toggleTimer = async (id?: string) => {
    if (!user) return; 

    if (timerState.isActive) {
        // STOPPING
        const now = Date.now();
        const startTime = timerState.startTime;
        const secondsElapsed = startTime ? Math.floor((now - startTime) / 1000) : 0;

        setTimerState({ isActive: false, startTime: null, elapsedBeforeStart: 0, activeTaskId: null, activeProjectId: null });

        if (secondsElapsed > 0 && db) {
            try {
                if (timerState.activeTaskId) {
                    const taskRef = doc(db, "users", user.uid, "tasks", timerState.activeTaskId);
                    updateDoc(taskRef, { totalTime: increment(secondsElapsed) });
                }
                if (timerState.activeProjectId) {
                    const projectRef = doc(db, "users", user.uid, "projects", timerState.activeProjectId);
                    updateDoc(projectRef, { 
                        totalTime: increment(secondsElapsed),
                        "stats.today": increment(secondsElapsed),
                        "stats.week": increment(secondsElapsed),
                        "stats.month": increment(secondsElapsed)
                    });
                }
            } catch (error) { console.error("Error saving timer:", error); }
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
            if (activeView === 'project' && selectedProjectId) targetProjectId = selectedProjectId;
            else targetProjectId = projects[0]?.id || 'default';
        }

        setTimerState({ isActive: true, startTime: now, elapsedBeforeStart: 0, activeTaskId: targetTaskId, activeProjectId: targetProjectId });
    }
  };

  const addTask = async (title: string, projectId: string) => {
    if (!user || !db) return;
    const newTask: Task = { id: `t-${Date.now()}`, projectId: projectId, title: title, status: 'active', totalTime: 0 };
    await setDoc(doc(db, "users", user.uid, "tasks", newTask.id), newTask);
  };

  const updateTask = async (updatedTask: Task) => {
    if (!user || !db) return;
    await setDoc(doc(db, "users", user.uid, "tasks", updatedTask.id), updatedTask);
  };

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    if (!user || !db) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const newSubtasks = task.subtasks?.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st);
    const taskRef = doc(db, "users", user.uid, "tasks", taskId);
    await updateDoc(taskRef, { subtasks: newSubtasks });
  };

  const addInboxTask = async (title: string) => {
    if (!user || !db) return;
    const newTask: InboxTask = { id: `i-${Date.now()}`, title, completed: false };
    await setDoc(doc(db, "users", user.uid, "inbox", newTask.id), newTask);
  };

  const toggleInboxTask = async (id: string) => {
    if (!user || !db) return;
    const task = inboxTasks.find(t => t.id === id);
    if (!task) return;
    const taskRef = doc(db, "users", user.uid, "inbox", id);
    await updateDoc(taskRef, { completed: !task.completed });
    setTimeout(async () => {
        if (!task.completed) { await deleteDoc(doc(db, "users", user.uid, "inbox", id)); }
    }, 2000);
  };

  const addProject = async (project: Project) => {
    if (!user || !db) return;
    await setDoc(doc(db, "users", user.uid, "projects", project.id), project);
  };

  const updateProject = async (updatedProject: Project) => {
     if (!user || !db) return;
     await setDoc(doc(db, "users", user.uid, "projects", updatedProject.id), updatedProject);
  };

  const deleteProjects = async (projectIds: string[]) => {
    if (!user || !db) return;
    projectIds.forEach(async (id) => { await deleteDoc(doc(db, "users", user.uid, "projects", id)); });
    const tasksToDelete = tasks.filter(t => projectIds.includes(t.projectId));
    tasksToDelete.forEach(async (t) => { await deleteDoc(doc(db, "users", user.uid, "tasks", t.id)); });
    
    if (selectedProjectId && projectIds.includes(selectedProjectId)) {
        setSelectedProjectId(null);
        setActiveView('projects-list');
    }
  };

  const updateDailyTarget = async (newTarget: number) => {
     if (!user || !db) return;
     setDailyGoalTarget(newTarget); 
     await setDoc(doc(db, "users", user.uid, "settings", "user_preferences"), { dailyGoalTarget: newTarget }, { merge: true });
  };

  const updateGoal = (id: string, newTarget: number) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, targetSeconds: newTarget } : g));
  };
  
  const addReminder = (reminder: Reminder) => { setReminders(prev => [...prev, reminder]); };
  const toggleReminder = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
    setTimeout(() => { setReminders(prev => prev.filter(r => r.id !== id || !r.completed)); }, 1000);
  };

  const updateUserProfile = async (updatedProfile: UserProfile) => {
    if (!user || !db) return;
    await setDoc(doc(db, "users", user.uid, "settings", "profile"), updatedProfile);
  };

  const handleSignOut = async () => {
    const auth = getAuth();
    try {
      // Clear all local state immediately which triggers "AuthScreen" render (redirect)
      setUser(null);
      setUserProfile(null);
      setActiveView('dashboard');
      setSelectedProjectId(null);
      setProjects([]);
      setTasks([]);
      setInboxTasks([]);
      setGoals(INITIAL_GOALS);
      setReminders(INITIAL_REMINDERS);
      setDailyGoalTarget(28800);
      setDailyProgress(0);
      setTimerState({
        isActive: false,
        startTime: null,
        elapsedBeforeStart: 0,
        activeTaskId: null,
        activeProjectId: null,
      });
      setIsDarkMode(false);
      
      // Then sign out from Firebase
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // --- RENDER ---

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  if (!user) return <AuthScreen onLogin={setUser} />;

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
      case 'dashboard': return <Dashboard timerState={timerState} goals={goals} dailyGoalTarget={dailyGoalTarget} dailyProgress={dailyProgress} recentTasks={tasks.slice(0, 3)} allTasks={tasks} projects={projects} reminders={reminders} inboxTasks={inboxTasks} onToggleTimer={toggleTimer} onNavigateToTask={(projectId) => navigateToProject(projectId)} onAddTask={addTask} onAddInboxTask={addInboxTask} onToggleInboxTask={toggleInboxTask} onNavigateToHistory={navigateToActivityHistory} onToggleSubtask={toggleSubtask} />;
      case 'analytics': return <Analytics goals={goals} dailyTarget={dailyGoalTarget} dailyProgress={dailyProgress} onUpdateGoal={updateGoal} onUpdateDailyTarget={updateDailyTarget} onNavigateToHistory={navigateToActivityHistory} />;
      case 'projects-list': return <ProjectsList projects={projects} tasks={tasks} inboxTasks={inboxTasks} onAddInboxTask={addInboxTask} onToggleInboxTask={toggleInboxTask} onSelectProject={navigateToProject} onDeleteProjects={deleteProjects} onAddProject={addProject} />;
      case 'settings': return <Settings isDarkMode={isDarkMode} toggleTheme={handleThemeToggle} onNavigateToHelp={navigateToHelpSupport} onSignOut={handleSignOut} userProfile={userProfile} onUpdateProfile={updateUserProfile} />;
      case 'reminders': return <Reminders reminders={reminders} onAddReminder={addReminder} onToggleReminder={toggleReminder} />;
      case 'activity-history': return <ActivityHistory tasks={tasks} projects={projects} onBack={navigateToDashboard} />;
      case 'help-support': return <HelpSupport onBack={navigateToSettings} />;
      case 'project': const project = projects.find(p => p.id === selectedProjectId); if (!project) return null; const projectTasks = tasks.filter(t => t.projectId === project.id); return <ProjectDetail project={project} tasks={projectTasks} timerState={timerState} onBack={navigateToProjectsList} onToggleTimer={toggleTimer} onUpdateTask={updateTask} onUpdateProject={updateProject} onAddReminder={addReminder} onAddTask={addTask} />;
      default: return null;
    }
  };

  return (
    <>
      {/* GAP FIX: CSS Reset */}
      <style>{`* { box-sizing: border-box; } html, body, #root { margin: 0; padding: 0; height: 100%; width: 100%; overflow-x: hidden; }`}</style>
      
      <div className="relative flex flex-col w-full min-h-[100dvh] bg-background text-foreground pb-0 overflow-x-hidden border-t border-transparent" style={{ margin: 0, padding: 0 }}>
        
        <div className="flex-1 w-full pb-20">
          {renderView()}
          <div className="w-full text-center py-8 text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em] select-none">Michael Fan made this</div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 w-full bg-background/90 backdrop-blur-2xl border-t border-border pb-4 z-40 transition-colors">
          <div className="flex justify-between items-center px-8 max-w-lg mx-auto">
            <button onClick={navigateToDashboard} className={`flex flex-col items-center gap-1 p-2 group transition-all duration-300 ${activeView === 'dashboard' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}><span className={`material-symbols-outlined text-[28px] transition-transform ${activeView === 'dashboard' ? 'scale-110 fill-1' : ''}`}>home</span></button>
            <button onClick={navigateToProjectsList} className={`flex flex-col items-center gap-1 p-2 group transition-all duration-300 ${activeView === 'projects-list' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}><span className={`material-symbols-outlined text-[28px] transition-transform ${activeView === 'projects-list' ? 'scale-110 fill-1' : ''}`}>folder_open</span></button>
            <button onClick={navigateToAnalytics} className={`flex flex-col items-center gap-1 p-2 group transition-all duration-300 ${activeView === 'analytics' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}><span className={`material-symbols-outlined text-[28px] transition-transform ${activeView === 'analytics' ? 'scale-110 fill-1' : ''}`}>bar_chart</span></button>
            <button onClick={navigateToReminders} className={`flex flex-col items-center gap-1 p-2 group transition-all duration-300 ${activeView === 'reminders' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}><span className={`material-symbols-outlined text-[28px] transition-transform ${activeView === 'reminders' ? 'scale-110 fill-1' : ''}`}>notifications</span></button>
            <button onClick={navigateToSettings} className={`flex flex-col items-center gap-1 p-2 group transition-all duration-300 ${activeView === 'settings' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}><span className={`material-symbols-outlined text-[28px] transition-transform ${activeView === 'settings' ? 'scale-110 fill-1' : ''}`}>settings</span></button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;