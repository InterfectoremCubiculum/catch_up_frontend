import axiosInstance from "../../axiosConfig";
import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import Cookies from "js-cookie";

interface User {
    id?: string;
    name?: string;
    surname?: string;
    email?: string;
    type?: string;
    position?: string;
}

interface AuthContextType {
    accessToken: string | null;
    refreshToken: string | null;
    user: User | null;
    setAccessToken: (newToken: string | null) => void;
    setRefreshToken: (newRefreshToken: string | null) => void;
    setUser: (newUser: User | null) => void;
    logout: () => void;
    getRole: (userId: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
    const [accessToken, setAccessToken_] = useState<string | null>(Cookies.get('accessToken') || null);
    const [refreshToken, setRefreshToken_] = useState<string | null>(Cookies.get('refreshToken') || null);
    const [user, setUser_] = useState<User | null>(() => {
        const storedUser = Cookies.get('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [roleCache, setRoleCache] = useState<Record<string, string>>({});

    const setAccessToken = (newToken: string | null) => {
        setAccessToken_(newToken);
        if (newToken) {
            Cookies.set('accessToken', newToken, {
                path: '/',
                secure: true
            });
        } else {
            Cookies.remove('accessToken');
        }
    };

    const setRefreshToken = (newRefreshToken: string | null) => {
        setRefreshToken_(newRefreshToken);
        if (newRefreshToken) {
            Cookies.set('refreshToken', newRefreshToken, {
                path: '/',
                secure: true
            });
        } else {
            Cookies.remove('refreshToken');
        }
    };

    const setUser = (newUser: User | null) => {
        if (newUser) {
            const { ...userToStore } = newUser;
            Cookies.set('user', JSON.stringify(userToStore), {
                path: '/',
                secure: true
            });
            setUser_(userToStore);
        } else {
            Cookies.remove('user');
        }
    };

    const logout = () => {
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
        setRoleCache({});
    };

    const getRole = (userId: string): string => {
        if (!userId) return 'User';

        if (roleCache[userId]) {
            return roleCache[userId];
        }

        try {
            const fetchRole = async () => {
                try {
                    const response = await axiosInstance.get(`User/GetRole/${userId}`);
                    const role = response.data || 'User';
                    setRoleCache((prev) => ({ ...prev, [userId]: role }));
                    return role;
                } catch (error) {
                    console.error('Error fetching user role:', error);
                    return 'User';
                }
            };

            fetchRole();
            return roleCache[userId] || 'User';
        } catch (error) {
            console.error('Error in getRole:', error);
            return 'User';
        }
    };

    const contextValue = useMemo(
        () => ({
            accessToken,
            refreshToken,
            user,
            setAccessToken,
            setRefreshToken,
            setUser,
            logout,
            getRole
        }),
        [accessToken, refreshToken, user, roleCache]
    );

    return (
        <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export default AuthProvider;