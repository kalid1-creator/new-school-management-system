import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface NotificationContextType {
    showSuccess: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notification, setNotification] = useState<{ message: string; visible: boolean }>({
        message: '',
        visible: false
    });

    const showSuccess = useCallback((message: string) => {
        setNotification({ message, visible: true });
        // Auto-dismiss after 3 seconds
        setTimeout(() => {
            setNotification(prev => ({ ...prev, visible: false }));
        }, 3000);
    }, []);

    return (
        <NotificationContext.Provider value={{ showSuccess }}>
            {children}
            {notification.visible && <Toast message={notification.message} onClose={() => setNotification(prev => ({ ...prev, visible: false }))} />}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}

import { CheckCircle2, X } from 'lucide-react';

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[320px] max-w-md border border-green-500/20">
                <div className="bg-white/20 p-2 rounded-full shadow-inner ring-1 ring-white/30">
                    <CheckCircle2 size={24} className="text-white drop-shadow-sm" />
                </div>
                <div className="flex-1">
                    <p className="font-bold text-lg leading-tight drop-shadow-sm">Success</p>
                    <p className="text-green-50 text-base font-medium opacity-90 mt-0.5">{message}</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-white/20 rounded-xl transition-colors active:scale-90"
                    title="Close"
                >
                    <X size={20} className="text-white/80" />
                </button>
            </div>
            {/* Smooth progress bar at the bottom */}
            <div className="absolute bottom-1.5 left-4 right-4 h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white/60 animate-progress origin-left" />
            </div>
        </div>
    );
}
