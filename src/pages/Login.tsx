import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, db, googleProvider } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { KeyRound, Mail, AlertCircle, Chrome } from 'lucide-react';

export function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // @ts-ignore
    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                // Реєстрація
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);

                // Створюємо запис користувача з дефолтною роллю 'user'
                await setDoc(doc(db, 'users', userCredential.user.uid), {
                    email: userCredential.user.email,
                    role: 'user',
                    createdAt: new Date().toISOString()
                });
            }
            navigate(from, { replace: true });
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Невірний email або пароль');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('Цей email вже зареєстрований');
            } else if (err.code === 'auth/weak-password') {
                setError('Пароль занадто слабкий (мінімум 6 символів)');
            } else if (err.message && (err.message.includes('network') || err.message.includes('fetch') || err.message.includes('offset'))) {
                setError('⚠️ Браузер або мережа блокує доступ. Перевірте VPN/AdBlock.');
            } else {
                setError('Помилка: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            // Перевіряємо, чи є запис користувача, якщо ні - створюємо
            const userDoc = await getDoc(doc(db, 'users', result.user.uid));
            if (!userDoc.exists()) {
                await setDoc(doc(db, 'users', result.user.uid), {
                    email: result.user.email,
                    role: 'user',
                    createdAt: new Date().toISOString()
                });
            }
            navigate(from, { replace: true });
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/popup-closed-by-user') {
                return; // Ігноруємо закриття вікна
            }
            setError('Помилка входу через Google: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <KeyRound className="text-purple-600" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {isLogin ? 'Вхід в систему' : 'Реєстрація'}
                    </h1>
                    <p className="text-slate-500 mt-2">
                        {isLogin ? 'Увійдіть, щоб продовжити' : 'Створіть акаунт користувача'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 flex items-center gap-2 text-sm">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {/* Google Sign In Button */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    type="button"
                    className="w-full bg-white text-slate-700 border border-slate-300 py-2.5 rounded-lg hover:bg-slate-50 transition flex items-center justify-center gap-2 mb-4 font-medium"
                >
                    <Chrome size={20} className="text-red-500" />
                    Увійти через Google (Chrome)
                </button>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-slate-500">або через пошту</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                placeholder="example@viyar.ua"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Пароль</label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purple-600 text-white py-2.5 rounded-lg hover:bg-purple-700 transition disabled:bg-purple-300 font-medium"
                    >
                        {loading ? 'Завантаження...' : (isLogin ? 'Увійти' : 'Зареєструватися')}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500">
                    {isLogin ? 'Немає акаунту? ' : 'Вже є акаунт? '}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-purple-600 hover:text-purple-700 font-medium"
                    >
                        {isLogin ? 'Зареєструватися' : 'Увійти'}
                    </button>
                </div>
            </div>
        </div>
    );
}
