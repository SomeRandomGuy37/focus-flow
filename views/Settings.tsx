
import React, { useState, useEffect } from 'react';
import { Modal } from '../components/Modal';
import { UserProfile } from '../types';

interface SettingsProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  onNavigateToHelp: () => void;
  onSignOut: () => void;
  userProfile: UserProfile | null;
  onUpdateProfile: (profile: UserProfile) => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
    isDarkMode, 
    toggleTheme, 
    onNavigateToHelp, 
    onSignOut,
    userProfile,
    onUpdateProfile
}) => {
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'alert' as 'alert' | 'confirm',
    onConfirm: undefined as undefined | (() => void),
    variant: 'default' as 'default' | 'destructive'
  });

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  
  // Initialize form with existing profile or defaults
  const [editForm, setEditForm] = useState<UserProfile>({
    name: '',
    email: '',
    avatar: ''
  });

  // Sync form with prop when loaded
  useEffect(() => {
    if (userProfile) {
        setEditForm(userProfile);
    }
  }, [userProfile]);

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  const handleEditProfile = () => {
    if (userProfile) setEditForm(userProfile);
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(editForm);
    setIsEditProfileOpen(false);
    setModalConfig({
        isOpen: true,
        title: 'Profile Updated',
        message: 'Your profile details have been saved successfully.',
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
             // Immediately call parent handler to sign out and redirect
             onSignOut();
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

  if (!userProfile) return <div className="p-6">Loading profile...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      {/* Sticky Header - Standardized */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl px-6 py-4 flex items-center justify-between border-b border-border/50 transition-all">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground leading-none">Settings</h1>
          <p className="text-sm font-semibold text-muted-foreground mt-1">Preferences & Account</p>
        </div>
      </div>

      <main className="px-6 pb-32 pt-8 flex flex-col gap-10 max-w-xl mx-auto w-full">
          
          <section className="flex flex-col gap-4">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Profile</h2>
              <div className="flex items-center gap-5 p-5 bg-card border border-border rounded-[1.5rem] shadow-sm">
                  <div className="size-16 rounded-full bg-secondary overflow-hidden ring-2 ring-border shrink-0">
                      <img src={userProfile.avatar} alt="Profile" className="size-full object-cover" />
                  </div>
                  <div className="overflow-hidden">
                      <h3 className="font-bold text-xl truncate">{userProfile.name}</h3>
                      <p className="text-sm text-muted-foreground font-medium truncate">{userProfile.email}</p>
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
                        className={`w-14 h-8 rounded-full transition-colors relative flex items-center px-1 border ${isDarkMode ? 'bg-primary border-primary' : 'bg-secondary border-border'}`}
                      >
                          <div className={`size-6 rounded-full shadow-md transition-transform duration-300 ${isDarkMode ? 'translate-x-6 bg-background' : 'translate-x-0 bg-white'}`}></div>
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
                          <span className="font-bold text-red-600 dark:text-red-400 text-base">Sign Out</span>
                      </div>
                  </div>
              </div>
          </section>

      </main>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               {/* Backdrop */}
               <div 
                   className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" 
                   onClick={() => setIsEditProfileOpen(false)}
               />
               
               {/* Modal Content */}
               <div className="relative bg-card border border-border rounded-[2rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 p-8 flex flex-col gap-6">
                   <div className="flex justify-between items-center">
                       <h2 className="text-2xl font-bold tracking-tight">Edit Profile</h2>
                       <button onClick={() => setIsEditProfileOpen(false)} className="size-8 rounded-full bg-secondary flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors">
                           <span className="material-symbols-outlined text-lg">close</span>
                       </button>
                   </div>
                   
                   <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
                       <div className="flex flex-col items-center gap-4 p-4 bg-secondary/20 rounded-2xl border border-dashed border-border">
                          <div className="size-24 rounded-full bg-secondary overflow-hidden ring-4 ring-background shadow-md">
                              <img src={editForm.avatar} alt="Preview" className="size-full object-cover" />
                          </div>
                          <div className="w-full">
                               <label className="text-xs font-bold uppercase text-muted-foreground ml-1 mb-1 block">Avatar URL</label>
                               <input 
                                   type="text" 
                                   placeholder="https://..."
                                   className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
                                   value={editForm.avatar}
                                   onChange={e => setEditForm({...editForm, avatar: e.target.value})}
                               />
                          </div>
                       </div>

                       <div className="flex flex-col gap-2">
                           <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Display Name</label>
                           <input 
                               type="text" 
                               required
                               placeholder="Your Name"
                               className="w-full bg-background border border-border rounded-xl px-4 py-3 text-base font-bold outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
                               value={editForm.name}
                               onChange={e => setEditForm({...editForm, name: e.target.value})}
                           />
                       </div>

                       <div className="flex flex-col gap-2">
                           <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Email Address</label>
                           <input 
                               type="email" 
                               required
                               placeholder="email@example.com"
                               className="w-full bg-background border border-border rounded-xl px-4 py-3 text-base font-bold outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
                               value={editForm.email}
                               onChange={e => setEditForm({...editForm, email: e.target.value})}
                           />
                       </div>

                       <div className="flex justify-end gap-3 pt-2">
                           <button type="button" onClick={() => setIsEditProfileOpen(false)} className="px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-wider hover:bg-secondary transition-colors">Cancel</button>
                           <button type="submit" className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold uppercase text-xs tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all">Save Changes</button>
                       </div>
                   </form>
               </div>
           </div>
      )}

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
