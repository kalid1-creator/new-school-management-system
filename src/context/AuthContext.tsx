import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { security } from '../lib/security';

interface AuthContextType {
    isAuthenticated: boolean;
    isSetupComplete: boolean; // True if Admin Account exists
    isDeviceTrusted: boolean; // True if Developer PIN entered on this device
    initLoading: boolean;
    login: () => void;
    logout: () => void;
    markSetupComplete: () => void;
    trustCurrentDevice: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isSetupComplete, setIsSetupComplete] = useState(false);
    const [isDeviceTrusted, setIsDeviceTrusted] = useState(false);
    const [initLoading, setInitLoading] = useState(true);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        // Check if Admin exists
        const creds = await security.getAdminCredentials();
        setIsSetupComplete(!!creds);

        // Check if device is trusted
        const trusted = await security.isDeviceTrusted();
        setIsDeviceTrusted(trusted);

        // Check active session (simple sessionStorage for session persistence)
        const session = sessionStorage.getItem('auth_session');
        setIsAuthenticated(session === 'active');

        setInitLoading(false);
    };

    const login = () => {
        sessionStorage.setItem('auth_session', 'active');
        setIsAuthenticated(true);
    };

    const logout = () => {
        sessionStorage.removeItem('auth_session');
        setIsAuthenticated(false);
    };

    const markSetupComplete = () => {
        setIsSetupComplete(true);
    };

    const trustCurrentDevice = async () => {
        await security.trustDevice();
        setIsDeviceTrusted(true);
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            isSetupComplete,
            isDeviceTrusted,
            initLoading,
            login,
            logout,
            markSetupComplete,
            trustCurrentDevice
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
