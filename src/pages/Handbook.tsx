import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Plus, Loader2, Trash2, Edit } from 'lucide-react';
import { useParams } from 'react-router-dom';
import type { Article } from '../data/handbook';
import { Modal } from '../components/ui/Modal';
import { ArticleEditor } from '../components/ArticleEditor';
import { useAuth } from '../context/AuthContext';
import { articleService } from '../services/articles';
import { categoryService, type Category } from '../services/categories';
import { sectionService, type Section } from '../services/sections';
import { subcategoryService, type Subcategory } from '../services/subcategories';
import { searchLogService } from '../services/searchLogs';

export function Handbook() {
    const { sectionId } = useParams<{ sectionId: string }>();
    const { isAdmin } = useAuth();
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [showEditor, setShowEditor] = useState(false);
    const [articleToEdit, setArticleToEdit] = useState<Article | undefined>(undefined);
    const [section, setSection] = useState<Section | null>(null);

    const [articles, setArticles] = useState<Article[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [subFilter, setSubFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showSlowLoadingMessage, setShowSlowLoadingMessage] = useState(false);

    useEffect(() => {
        setFilter('all'); // Reset filter when section changes
        loadArticles();
        loadCategories();
        loadSubcategories();
        if (sectionId) {
            sectionService.getById(sectionId).then(setSection).catch(console.error);
        }
    }, [sectionId]);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (loading) {
            timer = setTimeout(() => {
                setShowSlowLoadingMessage(true);
            }, 2000); // Якщо вантажиться довше 2 секунд
        } else {
            setShowSlowLoadingMessage(false);
        }
        return () => clearTimeout(timer);
    }, [loading]);

    const loadSubcategories = async () => {
        try {
            const data = await subcategoryService.getAll();
            setSubcategories(data);
        } catch (err: any) {
            console.error('Error loading subcategories:', err);
        }
    };

    const loadArticles = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await articleService.getAll();
            setArticles(data);
        } catch (err: any) {
            console.error(err);
            if (err.message && (err.message.includes('network') || err.message.code === 'unavailable')) {
                setError('⚠️ Браузер блокує доступ до бази даних (Err: Network). Вимкніть AdBlock/uBlock.');
            } else {
                setError('Не вдалося завантажити статті. Перевірте з\'єднання.');
            }
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const data = await categoryService.getAll();
            setCategories(data);
        } catch (err: any) {
            console.error('Error loading categories:', err);
            // Don't show error to user, just use empty categories
        }
    };

    const filtered = articles.filter(a => {
        // Filter by current section
        if (sectionId && a.sectionId !== sectionId) return false;
        
        const matchesCategory = filter === 'all' || a.category === filter;
        const matchesSubcategory = subFilter === 'all' || a.subcategoryId === subFilter;
        const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase());
        
        return matchesCategory && matchesSubcategory && matchesSearch;
    });

    // Logging failed searches
    useEffect(() => {
        if (!search.trim() || loading || filtered.length > 0) return;

        const timer = setTimeout(() => {
            searchLogService.log(search);
        }, 1500); // 1.5s debounce

        return () => clearTimeout(timer);
    }, [search, filtered.length, loading]);


    // Only show categories that belong to this section
    const sectionCategories = categories.filter(c => !sectionId || c.sectionId === sectionId);

    const handleEdit = (article: Article, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening article modal
        setArticleToEdit(article);
        setShowEditor(true);
    };

    const handleDelete = async (article: Article, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening article modal

        if (!confirm(`Ви впевнені, що хочете видалити статтю "${article.title}"?`)) {
            return;
        }

        try {
            await articleService.delete(article.id);
            alert('Статтю успішно видалено!');
            loadArticles(); // Reload list
        } catch (error: any) {
            console.error(error);
            alert('Помилка видалення: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64">
                <Loader2 className="animate-spin text-purple-600 mb-4" size={32} />
                {showSlowLoadingMessage && (
                    <div className="text-amber-600 text-center max-w-md animate-pulse p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="font-bold mb-1">⚠️ Завантаження триває довше ніж зазвичай...</p>
                        <p className="text-sm">Ваш браузер блокує з'єднання з базою даних (помилка <code>ERR_BLOCKED_BY_CLIENT</code>).</p>
                        <p className="text-sm mt-2 font-semibold">Будь ласка, вимкніть AdBlock/uBlock або спробуйте режим Інкогніто (Ctrl+Shift+N).</p>
                    </div>
                )}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-600 p-8 rounded-xl text-center">
                <p className="font-bold mb-2">Помилка</p>
                <p>{error}</p>
                <button
                    onClick={loadArticles}
                    className="mt-4 px-4 py-2 bg-red-100 rounded-lg hover:bg-red-200 transition"
                >
                    Спробувати знову
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-8">
            {/* Header */}
            <div className="bg-white p-4 md:p-8 rounded-xl md:rounded-2xl shadow-sm border border-slate-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <BookOpen className="text-purple-600 shrink-0" /> 
                        <span className="truncate">{section?.label || 'База Знань'}</span>
                    </h1>
                    {isAdmin && (
                        <button
                            onClick={() => setShowEditor(true)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-xl hover:bg-purple-700 transition shadow-lg shadow-purple-200 active:scale-95"
                        >
                            <Plus size={20} />
                            <span className="font-medium text-sm">Створити статтю</span>
                        </button>
                    )}
                </div>
                <p className="text-sm md:text-base text-slate-500 mb-6 leading-relaxed">Корисні матеріали, стандарти та чек-листи для конструктора.</p>

                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Пошук статті..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm transition-all focus:bg-white"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide -mx-2 px-2 sm:mx-0 sm:px-0">
                        <button
                            onClick={() => {
                                setFilter('all');
                                setSubFilter('all');
                            }}
                            className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all text-sm font-medium border ${
                                filter === 'all' 
                                    ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-100' 
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:text-purple-600'
                            }`}
                        >
                            Всі
                        </button>
                        {sectionCategories.map(category => (
                            <button
                                key={category.id}
                                onClick={() => {
                                    setFilter(category.id);
                                    setSubFilter('all');
                                }}
                                className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all text-sm font-medium border ${
                                    filter === category.id 
                                        ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-100' 
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:text-purple-600'
                                }`}
                            >
                                {category.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sub-tabs for sub-subcategories */}
                {filter !== 'all' && (
                    <div className="flex gap-2 overflow-x-auto mt-4 pt-4 border-t border-slate-100 scrollbar-hide -mx-2 px-2 sm:mx-0 sm:px-0">
                        <button
                            onClick={() => setSubFilter('all')}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all border ${
                                subFilter === 'all' 
                                    ? 'bg-slate-800 text-white border-slate-800' 
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            ВСІ ПІД-КАТЕГОРІЇ
                        </button>
                        {subcategories
                            .filter(sub => sub.parentCategoryId === filter)
                            .map(sub => (
                                <button
                                    key={sub.id}
                                    onClick={() => setSubFilter(sub.id)}
                                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all border ${
                                        subFilter === sub.id 
                                            ? 'bg-purple-600 text-white border-purple-600' 
                                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    {sub.label.toUpperCase()}
                                </button>
                            ))}
                    </div>
                )}
            </div>

            {/* Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(article => {
                    // Тимчасово, поки не збережемо іконки як рядки в БД, або використовуємо дефолтну
                    // const Icon = (Icons as any)[article.icon] || Icons.FileText;

                    return (
                        <div
                            key={article.id}
                            className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-all border border-slate-100 overflow-hidden relative"
                        >
                            <div
                                onClick={() => setSelectedArticle(article)}
                                className="cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wide font-bold ${categories.find(c => c.id === article.category)?.color || 'bg-gray-100 text-gray-800'}`}>
                                        {categories.find(c => c.id === article.category)?.label || article.category}
                                    </span>
                                    {/* <article.icon className="text-slate-300 group-hover:text-purple-500 transition-colors" /> */}
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-purple-600 transition-colors">{article.title}</h3>
                                <p className="text-sm text-slate-500 line-clamp-3">
                                    {article.content.find(block => block.type === 'text')?.value as string || "Натисніть щоб читати далі..."}
                                </p>
                            </div>

                            {/* Admin Actions */}
                            {isAdmin && (
                                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                                    <button
                                        onClick={(e) => handleEdit(article, e)}
                                        className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition text-sm"
                                    >
                                        <Edit size={14} />
                                        Редагувати
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(article, e)}
                                        className="flex items-center gap-1 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition text-sm"
                                    >
                                        <Trash2 size={14} />
                                        Видалити
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Article Viewer Modal */}
            <Modal
                isOpen={!!selectedArticle}
                onClose={() => setSelectedArticle(null)}
                title={selectedArticle?.title || ''}
            >
                {selectedArticle && selectedArticle.content && (
                    <div className="space-y-6">
                        {selectedArticle.content.map((block, idx) => {
                            switch (block.type) {
                                case 'header': return <h4 key={idx} className="text-lg font-bold text-slate-800 border-b border-slat-100 pb-2 mt-4">{block.value}</h4>;
                                case 'text': return <p key={idx} className="text-slate-600 leading-relaxed">{block.value}</p>;
                                case 'image': return <img key={idx} src={block.value as string} alt="Зображення" className="rounded-lg shadow-sm w-full my-4" />;
                                case 'warning': return (
                                    <div key={idx} className="bg-amber-50 border border-amber-100 p-4 rounded-lg text-amber-800 text-sm">
                                        <strong>Увага!</strong> {block.value}
                                    </div>
                                );
                                case 'list': return (
                                    <ul key={idx} className="list-disc pl-5 space-y-2 text-slate-600">
                                        {(block.value as string[]).map((item, i) => <li key={i}>{item}</li>)}
                                    </ul>
                                );
                                default: return null;
                            }
                        })}
                    </div>
                )}
            </Modal>

            {/* Редактор нових статей */}
            <ArticleEditor
                isOpen={showEditor}
                article={articleToEdit}
                defaultSectionId={sectionId}
                onClose={() => {
                    setShowEditor(false);
                    setArticleToEdit(undefined); // Reset edit mode
                    loadArticles(); // Оновити список після збереження
                }}
            />
        </div>
    );
}
