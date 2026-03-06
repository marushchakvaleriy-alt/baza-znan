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
        <div className="space-y-4 md:space-y-8">
            <div className="bg-white p-4 md:p-8 rounded-xl md:rounded-2xl shadow-sm border border-slate-100 mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Адмін-панель</h1>
                <p className="text-sm text-slate-500 leading-relaxed">Керування структурою та контентом Бази Знань.</p>
                
                <div className="flex gap-4 mt-6 border-b border-slate-200 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                    <button
                        onClick={() => setActiveTab('sections')}
                        className={`flex items-center gap-2 pb-3 px-2 border-b-2 font-medium transition-all whitespace-nowrap text-sm ${
                            activeTab === 'sections' 
                                ? 'border-purple-600 text-purple-600' 
                                : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        <LayoutDashboard size={18} />
                        1. Розділи
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`flex items-center gap-2 pb-3 px-2 border-b-2 font-medium transition-all whitespace-nowrap text-sm ${
                            activeTab === 'categories' 
                                ? 'border-purple-600 text-purple-600' 
                                : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        <FolderTree size={18} />
                        2. Підгрупи
                    </button>
                    <button
                        onClick={() => setActiveTab('subcategories')}
                        className={`flex items-center gap-2 pb-3 px-2 border-b-2 font-medium transition-all whitespace-nowrap text-sm ${
                            activeTab === 'subcategories' 
                                ? 'border-purple-600 text-purple-600' 
                                : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        <FolderTree size={18} className="rotate-90" />
                        3. Під-підгрупи
                    </button>
                    <button
                        onClick={() => setActiveTab('articles')}
                        className={`flex items-center gap-2 pb-3 px-2 border-b-2 font-medium transition-all whitespace-nowrap text-sm ${
                            activeTab === 'articles' 
                                ? 'border-purple-600 text-purple-600' 
                                : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        <FileText size={18} />
                        4. Статті
                    </button>
                    <button
                        onClick={() => setActiveTab('search_logs')}
                        className={`flex items-center gap-2 pb-3 px-2 border-b-2 font-medium transition-all whitespace-nowrap text-sm ${
                            activeTab === 'search_logs' 
                                ? 'border-purple-600 text-purple-600' 
                                : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        <BarChart3 size={18} />
                        5. Пошук
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
