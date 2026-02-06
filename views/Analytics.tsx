
import React, { useState } from 'react';
import { Goal, DailyLog } from '../types';
import { Calendar } from '../components/Calendar';
import { ProgressRing } from '../components/ProgressRing';
import { INITIAL_LOGS } from '../constants';
import { formatDuration } from '../utils';

interface AnalyticsProps {
  goals: Goal[];
  dailyTarget: number;
  dailyProgress: number; // Added prop
  onUpdateGoal: (id: string, newTarget: number) => void;
  onUpdateDailyTarget: (newTarget: number) => void;
  onNavigateToHistory: () => void;
}

export const Analytics: React.FC<AnalyticsProps> = ({ 
    goals, 
    dailyTarget, 
    dailyProgress, // Destructure prop
    onUpdateGoal, 
    onUpdateDailyTarget, 
    onNavigateToHistory 
}) => {
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Use real data passed from App
  const dailyPercent = Math.min(100, (dailyProgress / dailyTarget) * 100);

  // Helper to calculate remaining time
  const getRemainingTime = (target: number, current: number) => {
    const remaining = Math.max(0, target - current);
    return formatDuration(remaining);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl px-6 pt-8 pb-4 flex items-end justify-between border-b border-border/50 transition-all">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground leading-none">Analytics</h1>
          <p className="text-sm font-semibold text-muted-foreground mt-1.5">Performance & Trends</p>
        </div>
      </div>

      <main className="flex flex-col gap-10 px-6 pb-32 pt-8 max-w-7xl mx-auto w-full lg:grid lg:grid-cols-12 lg:gap-12">
        
        {/* Left Column (Desktop) */}
        <div className="flex flex-col gap-10 lg:col-span-8">
            {/* Big Goals Circles Section */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-end px-1">
                    <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Goal Progress</h2>
                    <button onClick={onNavigateToHistory} className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline">Full History</button>
                </div>
                
                <div className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scrollbar-none lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0">
                    {/* Daily Ring */}
                    <div className="snap-center shrink-0 w-52 lg:w-full flex flex-col items-center p-8 bg-card border border-border rounded-[2rem] shadow-sm">
                        <div className="mb-6 text-primary">
                        <ProgressRing radius={70} stroke={8} progress={dailyPercent} trackColor="hsl(var(--secondary))" />
                        </div>
                        
                        <span className="material-symbols-outlined text-primary/80 text-3xl mb-3">sunny</span>
                        
                        <div className="text-center w-full">
                            <span className="text-xs font-bold uppercase text-muted-foreground">Daily</span>
                            <div className="text-3xl font-bold mt-1 tracking-tight">{formatDuration(dailyProgress)}</div>
                            <div className="text-xs text-muted-foreground font-bold mt-1">Target: {formatDuration(dailyTarget)}</div>
                            
                            <div className="mt-4 px-3 py-2 bg-secondary/50 rounded-xl">
                            <p className="text-xs font-bold text-foreground">
                                {getRemainingTime(dailyTarget, dailyProgress)} left
                            </p>
                            </div>
                        </div>
                    </div>

                    {/* Other Goals Rings */}
                    {goals.map(goal => {
                        const progress = Math.min(100, (goal.currentSeconds / goal.targetSeconds) * 100);
                        const remainingTime = getRemainingTime(goal.targetSeconds, goal.currentSeconds);
                        
                        return (
                            <div key={goal.id} className="snap-center shrink-0 w-52 lg:w-full flex flex-col items-center p-8 bg-card border border-border rounded-[2rem] shadow-sm">
                                <div className="mb-6 text-primary">
                                    <ProgressRing radius={70} stroke={8} progress={progress} trackColor="hsl(var(--secondary))" />
                                </div>

                                <span className="material-symbols-outlined text-primary/80 text-3xl mb-3">
                                    {goal.period === 'weekly' ? 'calendar_view_week' : 'calendar_month'}
                                </span>

                                <div className="text-center w-full">
                                    <span className="text-xs font-bold uppercase text-muted-foreground capitalize">{goal.period}</span>
                                    <div className="text-3xl font-bold mt-1 tracking-tight">{formatDuration(goal.currentSeconds)}</div>
                                    <div className="text-xs text-muted-foreground font-bold mt-1">Target: {formatDuration(goal.targetSeconds)}</div>

                                    <div className="mt-4 px-3 py-2 bg-secondary/50 rounded-xl">
                                        <p className="text-xs font-bold text-foreground">
                                            {remainingTime} left
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

             {/* Calendar Section */}
            <div className="flex flex-col gap-4 pt-2">
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Monthly Usage</h2>
                <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                    <Calendar logs={INITIAL_LOGS} />
                </div>
            </div>
        </div>

        {/* Right Column (Desktop) */}
        <div className="flex flex-col gap-8 lg:col-span-4 lg:sticky lg:top-28 h-fit">
            
            {/* Target Settings Summary Table */}
             <div className="flex flex-col gap-4">
                 <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Target Overview</h2>
                 <div className="bg-card border border-border rounded-[1.5rem] overflow-hidden shadow-sm">
                     <table className="w-full text-sm text-left">
                         <thead className="bg-secondary/50 text-muted-foreground font-bold uppercase text-[10px]">
                             <tr>
                                 <th className="px-5 py-3">Goal</th>
                                 <th className="px-5 py-3 text-right">Target</th>
                                 <th className="px-5 py-3 text-right">Actual</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-border">
                             <tr>
                                 <td className="px-5 py-3 font-bold">Daily</td>
                                 <td className="px-5 py-3 text-right font-mono text-muted-foreground">{formatDuration(dailyTarget)}</td>
                                 <td className="px-5 py-3 text-right font-mono font-bold">{formatDuration(dailyProgress)}</td>
                             </tr>
                             {goals.map(g => (
                                 <tr key={g.id}>
                                     <td className="px-5 py-3 font-bold capitalize">{g.period}</td>
                                     <td className="px-5 py-3 text-right font-mono text-muted-foreground">{formatDuration(g.targetSeconds)}</td>
                                     <td className="px-5 py-3 text-right font-mono font-bold">{formatDuration(g.currentSeconds)}</td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                     <div className="p-4 bg-secondary/10">
                        <button 
                            onClick={() => setIsAdjusting(!isAdjusting)}
                            className={`w-full text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition-all ${isAdjusting ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-background border border-border hover:bg-secondary'}`}
                        >
                            {isAdjusting ? 'Close Adjustments' : 'Adjust Goals'}
                        </button>
                     </div>
                 </div>
             </div>
             
             {/* Collapsible Adjustments Panel */}
             {isAdjusting && (
                 <div className="flex flex-col gap-5 animate-in slide-in-from-top-2 fade-in duration-300">
                    <div className="flex flex-col gap-4 p-6 bg-card border border-border rounded-3xl shadow-sm">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-bold">Daily Target</h3>
                            <span className="text-xl font-mono font-bold text-primary">{formatDuration(dailyTarget)}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            {(() => {
                                const min = 1;
                                const max = 1440;
                                const val = Math.floor(dailyTarget / 60);
                                const percentage = ((val - min) * 100) / (max - min);
                                return (
                                    <input 
                                        type="range" 
                                        min={min} 
                                        max={max} 
                                        step="1"
                                        value={val}
                                        onChange={(e) => onUpdateDailyTarget(Number(e.target.value) * 60)}
                                        className="w-full accent-primary h-4 bg-secondary rounded-full appearance-none cursor-pointer"
                                        style={{
                                            background: `linear-gradient(to right, hsl(var(--primary)) ${percentage}%, hsl(var(--secondary)) ${percentage}%)`
                                        }}
                                    />
                                );
                            })()}
                            <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">
                                <span>1m</span>
                                <span>24h</span>
                            </div>
                        </div>
                    </div>

                    {goals.map(goal => (
                        <div key={goal.id} className="flex flex-col gap-4 p-5 bg-card border border-border rounded-2xl transition-colors">
                            <div className="flex justify-between items-center">
                                <span className="font-bold capitalize text-sm">{goal.period} Goal</span>
                                <span className="font-mono font-bold text-sm">{formatDuration(goal.targetSeconds)}</span>
                            </div>
                            {(() => {
                                const min = 10;
                                const max = goal.period === 'weekly' ? 6000 : 25000;
                                const val = Math.floor(goal.targetSeconds / 60);
                                const percentage = ((val - min) * 100) / (max - min);
                                return (
                                    <input 
                                        type="range" 
                                        min={min} 
                                        max={max}
                                        step="5"
                                        value={val}
                                        onChange={(e) => onUpdateGoal(goal.id, Number(e.target.value) * 60)}
                                        className="w-full accent-primary h-4 bg-secondary rounded-full appearance-none cursor-pointer"
                                        style={{
                                            background: `linear-gradient(to right, hsl(var(--primary)) ${percentage}%, hsl(var(--secondary)) ${percentage}%)`
                                        }}
                                    />
                                );
                            })()}
                        </div>
                    ))}
                 </div>
             )}
        </div>

      </main>
    </div>
  );
};
