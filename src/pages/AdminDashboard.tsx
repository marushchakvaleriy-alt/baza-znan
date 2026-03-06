import { useState } from 'react';
import { SectionManager } from '../components/SectionManager';
import { CategoryManager } from '../components/CategoryManager';
import { LayoutDashboard, FolderTree, FileText } from 'lucide-react';

export function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'sections' | 'categories' | 'articles'>('sections');

    return (
        <div className="space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mb-6">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Дашборд Адміністратора</h1>
                <p className="text-slate-500">Керування меню, розділами та статтями Бази Знань.</p>
                
                <div className="flex gap-4 mt-6 border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('sections')}
                        className={`flex items-center gap-2 pb-3 px-2 border-b-2 font-medium transition-colors ${
                            activeTab === 'sections' 
                                ? 'border-purple-600 text-purple-600' 
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <LayoutDashboard size={18} />
                        1. Розділи (Меню зліва)
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`flex items-center gap-2 pb-3 px-2 border-b-2 font-medium transition-colors ${
                            activeTab === 'categories' 
                                ? 'border-purple-600 text-purple-600' 
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <FolderTree size={18} />
                        2. Підгрупи (Категорії)
                    </button>
                    <button
                        onClick={() => setActiveTab('articles')}
                        className={`flex items-center gap-2 pb-3 px-2 border-b-2 font-medium transition-colors ${
                            activeTab === 'articles' 
                                ? 'border-purple-600 text-purple-600' 
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <FileText size={18} />
                        3. Усі статті
                    </button>
                </div>
            </div>

            <div className="mt-6">
                {activeTab === 'sections' && <SectionManager />}
                {activeTab === 'categories' && <CategoryManager />}
                {activeTab === 'articles' && (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-slate-500">
                        <p>Щоб керувати статтями, перейдіть до відповідного розділу меню зліва.</p>
                        <p className="text-sm mt-2">Або можете додати сюди загальну таблицю всіх статей пізніше.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
