import { useState, ReactNode } from 'react';

import { AuthContext } from './AuthContextDefinition';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('accessToken'));

    const loginUser = () => setIsAuthenticated(true);
    const logoutUser = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
}
