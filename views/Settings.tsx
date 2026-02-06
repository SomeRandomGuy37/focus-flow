
import React, { useState } from 'react';
import { Modal } from '../components/Modal';

interface SettingsProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  onNavigateToHelp: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ isDarkMode, toggleTheme, onNavigateToHelp }) => {
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'alert' as 'alert' | 'confirm',
    onConfirm: undefined as undefined | (() => void),
    variant: 'default' as 'default' | 'destructive'
  });

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  const handleEditProfile = () => {
    setModalConfig({
        isOpen: true,
        title: 'Coming Soon',
        message: 'Profile editing is coming in the next update!',
        type: 'alert',
        onConfirm: undefined,
        variant: 'default'
    });
  };

  const handleSignOut = () => {
    setModalConfig({
        isOpen: true,
        title: 'Sign Out',
        message: 'Are you sure you want to sign out of your account?',
        type: 'confirm',
        variant: 'destructive',
        onConfirm: () => {
            // Actual sign out logic would go here
            setTimeout(() => {
                setModalConfig({
                    isOpen: true,
                    title: 'Signed Out',
                    message: 'You have been successfully signed out.',
                    type: 'alert',
                    onConfirm: undefined,
                    variant: 'default'
                });
            }, 300);
        }
    });
  };

  const handleNotificationsToggle = () => {
      setModalConfig({
          isOpen: true,
          title: 'Notifications',
          message: 'Notification settings have been updated successfully.',
          type: 'alert',
          onConfirm: undefined,
          variant: 'default'
      });
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
                      <button 
                        onClick={handleEditProfile}
                        className="text-primary text-xs font-bold uppercase mt-2 hover:underline tracking-wide"
                      >
                          Edit Profile
                      </button>
                  </div>
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
                  
                  <div 
                    onClick={handleNotificationsToggle}
                    className="flex items-center justify-between p-5 bg-card hover:bg-secondary/20 transition-colors cursor-pointer"
                  >
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
                  
                  <div 
                    onClick={handleSignOut}
                    className="flex items-center justify-between p-5 bg-card hover:bg-secondary/20 transition-colors cursor-pointer"
                  >
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

      <Modal 
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        variant={modalConfig.variant}
      />
    </div>
  );
};
