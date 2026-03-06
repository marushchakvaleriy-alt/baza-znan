import { useState, useEffect } from 'react';
import { articleService } from '../services/articles';
import { sectionService, type Section } from '../services/sections';
import { categoryService, type Category } from '../services/categories';
import type { Article } from '../data/handbook';
import { Edit, Trash2, Save, Search } from 'lucide-react';
import { ArticleEditor } from './ArticleEditor';
import { Modal } from './ui/Modal';

export function AllArticlesManager() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);
    const [moveModal, setMoveModal] = useState<Article | null>(null);
    const [moveSection, setMoveSection] = useState('');
    const [moveCategory, setMoveCategory] = useState('');

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        setLoading(true);
        try {
            const [arts, secs, cats] = await Promise.all([
                articleService.getAll(),
                sectionService.getAll(),
                categoryService.getAll(),
            ]);
            setArticles(arts);
            setSections(secs);
            setCategories(cats);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (article: Article) => {
        if (!confirm(`Видалити статтю "${article.title}"?`)) return;
        await articleService.delete(article.id);
        load();
    };

    const openMoveModal = (article: Article) => {
        setMoveModal(article);
        setMoveSection(article.sectionId || '');
        setMoveCategory(article.category || '');
    };

    const handleMove = async () => {
        if (!moveModal) return;
        try {
            await articleService.save({ ...moveModal, sectionId: moveSection || undefined, category: moveCategory });
            setMoveModal(null);
            load();
        } catch (e: any) {
            alert('Помилка: ' + e.message);
        }
    };

    const filtered = articles.filter(a =>
        a.title.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="p-4 text-center text-slate-500">Завантаження...</div>;

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Пошук статті..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50"
                />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="text-left px-4 py-3 font-semibold text-slate-600">Назва статті</th>
                            <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Розділ</th>
                            <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Підгрупа</th>
                            <th className="px-4 py-3 w-32"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtered.map(article => {
                            const sec = sections.find(s => s.id === article.sectionId);
                            const cat = categories.find(c => c.id === article.category);
                            return (
                                <tr key={article.id} className="hover:bg-slate-50 transition">
                                    <td className="px-4 py-3 font-medium text-slate-800">{article.title}</td>
                                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">
                                        {sec ? (
                                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{sec.label}</span>
                                        ) : (
                                            <span className="text-slate-400 italic text-xs">Без розділу</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        {cat ? (
                                            <span className={`px-2 py-0.5 rounded text-xs ${cat.color}`}>{cat.label}</span>
                                        ) : (
                                            <span className="text-slate-400 italic text-xs">{article.category}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1 justify-end">
                                            <button
                                                onClick={() => openMoveModal(article)}
                                                title="Перемістити до розділу"
                                                className="text-purple-600 hover:bg-purple-50 p-1.5 rounded transition"
                                            >
                                                <Save size={15} />
                                            </button>
                                            <button
                                                onClick={() => setEditingArticle(article)}
                                                title="Редагувати"
                                                className="text-blue-600 hover:bg-blue-50 p-1.5 rounded transition"
                                            >
                                                <Edit size={15} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(article)}
                                                title="Видалити"
                                                className="text-red-600 hover:bg-red-50 p-1.5 rounded transition"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="py-12 text-center text-slate-400">Статей не знайдено</div>
                )}
            </div>

            {/* Move article modal */}
            <Modal isOpen={!!moveModal} onClose={() => setMoveModal(null)} title="Перемістити статтю до розділу">
                <div className="space-y-4">
                    <p className="font-medium text-slate-800">"{moveModal?.title}"</p>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Розділ</label>
                        <select
                            value={moveSection}
                            onChange={e => { setMoveSection(e.target.value); setMoveCategory(''); }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        >
                            <option value="">Без розділу</option>
                            {sections.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Підгрупа (категорія)</label>
                        <select
                            value={moveCategory}
                            onChange={e => setMoveCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        >
                            <option value="">Оберіть підгрупу...</option>
                            {categories
                                .filter(c => !moveSection || c.sectionId === moveSection)
                                .map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={handleMove}
                            className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition font-medium"
                        >
                            Зберегти
                        </button>
                        <button
                            onClick={() => setMoveModal(null)}
                            className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg hover:bg-slate-200 transition font-medium"
                        >
                            Скасувати
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Article editor */}
            {editingArticle && (
                <ArticleEditor
                    isOpen={!!editingArticle}
                    article={editingArticle}
                    defaultSectionId={editingArticle.sectionId}
                    onClose={() => {
                        setEditingArticle(null);
                        load();
                    }}
                />
            )}
        </div>
    );
}
