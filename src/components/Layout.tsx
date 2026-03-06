import { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Calculator, BookOpen, LogOut, Menu, X, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { sectionService, type Section } from '../services/sections';

export function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [sections, setSections] = useState<Section[]>([]);
    const { user, signOut, isAdmin } = useAuth();

    useEffect(() => {
        sectionService.getAll().then(setSections).catch(console.error);
    }, []);

    return (
        <>
            {/* Mobile Toggle */}
            <button
                className="md:hidden fixed top-4 right-4 z-50 p-2.5 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 active:scale-95 transition-transform"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Content */}
            <aside className={cn(
                "fixed top-0 left-0 h-full w-72 bg-slate-900 text-white z-40 transition-transform duration-300 md:translate-x-0 flex flex-col shadow-2xl md:shadow-none",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6 border-b border-slate-800 shrink-0 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <BookOpen className="text-blue-500" />
                            <span>База Знань</span>
                        </h1>
                        <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-widest">Довідник ВіЯр</p>
                    </div>
                    {/* Inner Close Button for Mobile */}
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="md:hidden p-2 hover:bg-slate-800 rounded-lg text-slate-400"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
                    {/* Fixed item: Tools */}
                    <NavLink
                        to="/tools"
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                            isActive
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        )}
                    >
                        <Calculator size={20} className="shrink-0" />
                        <span className="font-medium truncate">Інструменти</span>
                    </NavLink>

                    {/* Dynamic sections from Firestore */}
                    {sections.length > 0 && (
                        <div className="mt-3 mb-1">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-1">База Знань</p>
                        </div>
                    )}
                    {sections.map((section) => (
                        <NavLink
                            key={section.id}
                            to={`/section/${section.id}`}
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                                isActive
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <BookOpen size={20} className="shrink-0" />
                            <span className="font-medium truncate">{section.label}</span>
                        </NavLink>
                    ))}

                    {/* Admin Dashboard link */}
                    {isAdmin && (
                        <div className="mt-3 pt-3 border-t border-slate-800">
                            <NavLink
                                to="/admin"
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) => cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                                    isActive
                                        ? "bg-purple-600 text-white shadow-lg shadow-purple-900/20"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                )}
                            >
                                <LayoutDashboard size={20} className="shrink-0" />
                                <span className="font-medium truncate">Адмін-панель</span>
                            </NavLink>
                        </div>
                    )}
                </nav>

                <div className="p-4 border-t border-slate-800 bg-slate-900 shrink-0">
                    {user && (
                        <div className="mb-4 flex items-center gap-3 px-2 overflow-hidden">
                            {user.photoURL ? (
                                <img src={user.photoURL} className="w-8 h-8 rounded-full border border-slate-700" alt="User" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                                    {user.email?.[0].toUpperCase()}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-white truncate" title={user.email || ''}>{user.email}</p>
                                <p className="text-[10px] text-slate-500 truncate">{isAdmin ? 'Адміністратор' : 'Користувач'}</p>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors mb-4"
                    >
                        <LogOut size={18} />
                        <span className="text-sm font-medium">Вийти</span>
                    </button>

                    <div className="bg-slate-800/50 rounded-lg p-3">
                        <p className="text-xs text-slate-400">Версія 1.1.0</p>
                        <p className="text-[10px] text-slate-500 mt-1">Розроблено для профес іоналів</p>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="md:ml-64 min-h-screen pt-16 md:pt-0">
                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </>
    );
}
