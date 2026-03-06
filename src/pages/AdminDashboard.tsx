import { useState } from 'react';
import { SectionManager } from '../components/SectionManager';
import { CategoryManager } from '../components/CategoryManager';
import { SubcategoryManager } from '../components/SubcategoryManager';
import { AllArticlesManager } from '../components/AllArticlesManager';
import { SearchLogsManager } from '../components/SearchLogsManager';
import { LayoutDashboard, FolderTree, FileText, BarChart3 } from 'lucide-react';

export function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'sections' | 'categories' | 'subcategories' | 'articles' | 'search_logs'>('sections');

    return (
        <div className="space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mb-6">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Дашборд Адміністратора</h1>
                <p className="text-slate-500">Керування меню, розділами та статтями Бази Знань.</p>
                
                <div className="flex gap-4 mt-6 border-b border-slate-200 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('sections')}
                        className={`flex items-center gap-2 pb-3 px-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
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
                        className={`flex items-center gap-2 pb-3 px-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                            activeTab === 'categories' 
                                ? 'border-purple-600 text-purple-600' 
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <FolderTree size={18} />
                        2. Підгрупи (Категорії)
                    </button>
                    <button
                        onClick={() => setActiveTab('subcategories')}
                        className={`flex items-center gap-2 pb-3 px-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                            activeTab === 'subcategories' 
                                ? 'border-purple-600 text-purple-600' 
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <FolderTree size={18} className="rotate-90" />
                        3. Під-підгрупи
                    </button>
                    <button
                        onClick={() => setActiveTab('articles')}
                        className={`flex items-center gap-2 pb-3 px-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                            activeTab === 'articles' 
                                ? 'border-purple-600 text-purple-600' 
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <FileText size={18} />
                        4. Усі статті
                    </button>
                    <button
                        onClick={() => setActiveTab('search_logs')}
                        className={`flex items-center gap-2 pb-3 px-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                            activeTab === 'search_logs' 
                                ? 'border-purple-600 text-purple-600' 
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <BarChart3 size={18} />
                        5. Запити пошуку
                    </button>
                </div>
            </div>

            <div className="mt-6">
                {activeTab === 'sections' && <SectionManager />}
                {activeTab === 'categories' && <CategoryManager />}
                {activeTab === 'subcategories' && <SubcategoryManager />}
                {activeTab === 'articles' && <AllArticlesManager />}
                {activeTab === 'search_logs' && <SearchLogsManager />}
            </div>
        </div>
    );
}
