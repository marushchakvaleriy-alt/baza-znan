import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface UserData {
    role?: 'admin' | 'user';
    [key: string]: any;
}

interface AuthContextType {
    user: User | null;
    userData: UserData | null;
    loading: boolean;
    isAdmin: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userData: null,
    loading: true,
    isAdmin: false,
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("AuthProvider: init");
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            console.log("AuthProvider: auth changed", currentUser?.email);
            setUser(currentUser);

            if (currentUser) {
                // Отримуємо додаткові дані користувача з Firestore (роль)
                try {
                    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                    if (userDoc.exists()) {
                        setUserData(userDoc.data() as UserData);
                    } else {
                        setUserData({ role: 'user' }); // Дефолтна роль
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setUserData(null);
                }
            } else {
                setUserData(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signOut = async () => {
        await firebaseSignOut(auth);
    };

    const isAdmin = userData?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, userData, loading, isAdmin, signOut }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
