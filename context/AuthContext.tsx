import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    login: (email: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    const login = async (email: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        setUser({
            id: '1',
            name: 'Admin User',
            email: email,
            role: 'admin',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZkiVga_83D8i9DdG9zNzl-rZdFbqy7E7GwXh6TtB6GqbwHkMXWzAlFDUCjD4cqR8bN0ehLkitfSXui7DrtqfJ4evbG-HwfLuPujFx_i69nOXhDbS77kL-R2QUtLiVt1zeE68V2oQe4koRsrriSt5YhWeNSjT6KFZqrD0f6H148uCbD_5Sz7W7OyiNYFiecSpoCpXdIltAYG9JzFWKq3UUfKTZDgbl0PIORDXVn_symKXxEHy21UPGWyMD5_qMMR1IOJa-GSIeDL4'
        });
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
