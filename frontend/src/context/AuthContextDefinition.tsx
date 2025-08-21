import { createContext } from 'react';

export interface AuthContextType {
    isAuthenticated: boolean;
    loginUser: () => void;
    logoutUser: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
