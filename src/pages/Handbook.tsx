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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showSlowLoadingMessage, setShowSlowLoadingMessage] = useState(false);

    useEffect(() => {
        setFilter('all'); // Reset filter when section changes
        loadArticles();
        loadCategories();
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
        const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

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
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <BookOpen className="text-purple-600" /> {section?.label || 'База Знань'}
                    </h1>
                    {isAdmin && (
                        <button
                            onClick={() => setShowEditor(true)}
                            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                        >
                            <Plus size={20} />
                            Створити статтю
                        </button>
                    )}
                </div>
                <p className="text-slate-500 mb-6">Корисні матеріали, стандарти та чек-листи для конструктора.</p>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Пошук статті..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            Всі
                        </button>
                        {sectionCategories.map(category => (
                            <button
                                key={category.id}
                                onClick={() => setFilter(category.id)}
                                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${filter === category.id ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                {category.label}
                            </button>
                        ))}
                    </div>
                </div>
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
                {selectedArticle && (
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
                onClose={() => {
                    setShowEditor(false);
                    setArticleToEdit(undefined); // Reset edit mode
                    loadArticles(); // Оновити список після збереження
                }}
            />
        </div>
    );
}
