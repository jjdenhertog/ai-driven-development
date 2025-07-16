import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: 'admin' | 'user' | 'guest';
}

interface AppState {
  // State
  user: User | null;
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
  
  // Actions
  setUser: (user: User | null) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

interface Notification {
  readonly id: string;
  readonly type: 'success' | 'error' | 'warning' | 'info';
  readonly message: string;
  readonly timestamp: number;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      immer((set) => ({
        // Initial state
        user: null,
        sidebarOpen: true,
        theme: 'dark',
        notifications: [],
        
        // Actions
        setUser: (user) => set((state) => {
          state.user = user;
        }),
        
        toggleSidebar: () => set((state) => {
          state.sidebarOpen = !state.sidebarOpen;
        }),
        
        setTheme: (theme) => set((state) => {
          state.theme = theme;
          // Also update DOM for CSS variables
          document.documentElement.setAttribute('data-theme', theme);
        }),
        
        addNotification: (notification) => set((state) => {
          // Keep only last 10 notifications
          if (state.notifications.length >= 10)
            state.notifications.shift();
          
          state.notifications.push(notification);
        }),
        
        removeNotification: (id) => set((state) => {
          state.notifications = state.notifications.filter(n => n.id !== id);
        }),
        
        clearNotifications: () => set((state) => {
          state.notifications = [];
        }),
      })),
      {
        name: 'app-store',
        // Only persist theme and sidebar state
        partialize: (state) => ({ 
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    )
  )
);

// Selectors
export const useUser = () => useAppStore((state) => state.user);
export const useTheme = () => useAppStore((state) => state.theme);
export const useSidebarOpen = () => useAppStore((state) => state.sidebarOpen);
export const useNotifications = () => useAppStore((state) => state.notifications);

// Actions
export const useAppActions = () => {
  const setUser = useAppStore((state) => state.setUser);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const setTheme = useAppStore((state) => state.setTheme);
  const addNotification = useAppStore((state) => state.addNotification);
  const removeNotification = useAppStore((state) => state.removeNotification);
  const clearNotifications = useAppStore((state) => state.clearNotifications);
  
  return {
    setUser,
    toggleSidebar,
    setTheme,
    addNotification,
    removeNotification,
    clearNotifications,
  };
};

// Helper to create notifications
export function createNotification(type: Notification['type'], message: string): Notification {
  return {
    id: `${Date.now()}-${Math.random()}`,
    type,
    message,
    timestamp: Date.now(),
  };
}

// Example of a derived store for feature-specific state
interface FeatureState {
  selectedItems: string[];
  filter: 'all' | 'active' | 'inactive';
  sortBy: 'name' | 'date' | 'status';
  
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  toggleItem: (id: string) => void;
  clearSelection: () => void;
  setFilter: (filter: FeatureState['filter']) => void;
  setSortBy: (sortBy: FeatureState['sortBy']) => void;
}

export const useFeatureStore = create<FeatureState>()(
  immer((set) => ({
    // State
    selectedItems: [],
    filter: 'all',
    sortBy: 'name',
    
    // Actions
    selectItem: (id) => set((state) => {
      if (!state.selectedItems.includes(id))
        state.selectedItems.push(id);
    }),
    
    deselectItem: (id) => set((state) => {
      state.selectedItems = state.selectedItems.filter(item => item !== id);
    }),
    
    toggleItem: (id) => set((state) => {
      const index = state.selectedItems.indexOf(id);
      if (index === -1)
        state.selectedItems.push(id);
      else
        state.selectedItems.splice(index, 1);
    }),
    
    clearSelection: () => set((state) => {
      state.selectedItems = [];
    }),
    
    setFilter: (filter) => set((state) => {
      state.filter = filter;
    }),
    
    setSortBy: (sortBy) => set((state) => {
      state.sortBy = sortBy;
    }),
  }))
);