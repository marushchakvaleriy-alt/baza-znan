import { useState, useEffect } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { Modal } from './ui/Modal';
import type { ContentBlock, Article } from '../data/handbook';
import { articleService } from '../services/articles';
import { categoryService, type Category } from '../services/categories';
import { sectionService, type Section } from '../services/sections';

interface ArticleEditorProps {
    isOpen: boolean;
    onClose: () => void;
    article?: Article; // Optional article for edit mode
    defaultSectionId?: string; // Pre-select section when creating from a section page
}

export function ArticleEditor({ isOpen, onClose, article, defaultSectionId }: ArticleEditorProps) {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('general');
    const [sectionId, setSectionId] = useState(defaultSectionId || '');
    const [icon, setIcon] = useState('FileText');
    const [blocks, setBlocks] = useState<ContentBlock[]>([]);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [sections, setSections] = useState<Section[]>([]);

    // Load categories on mount
    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const [catData, secData] = await Promise.all([
                categoryService.getAll(),
                sectionService.getAll()
            ]);
            setCategories(catData);
            setSections(secData);
            // Set default category if none selected
            if (!category && catData.length > 0) {
                setCategory(catData[0].id);
            }
        } catch (err: any) {
            console.error('Error loading categories:', err);
        }
    };

    // Initialize form with article data if editing
    useEffect(() => {
        if (article) {
            setTitle(article.title);
            setCategory(article.category);
            setSectionId(article.sectionId || defaultSectionId || '');
            setIcon(article.icon || 'FileText');
            setBlocks(article.content || []);
        } else {
            // Reset form when creating new article
            setTitle('');
            setCategory(categories.length > 0 ? categories[0].id : 'general');
            setSectionId(defaultSectionId || '');
            setIcon('FileText');
            setBlocks([]);
        }
    }, [article, isOpen, categories]);

    const generateId = (title: string) => {
        return title.toLowerCase().replace(/[^a-zа-яі0-9]+/g, '-').replace(/^-+|-+$/g, '');
    };

    const addBlock = (type: ContentBlock['type']) => {
        setBlocks([...blocks, { type, value: type === 'list' ? [] : '' }]);
    };

    const updateBlock = (index: number, value: string | string[]) => {
        const newBlocks = [...blocks];
        newBlocks[index].value = value;
        setBlocks(newBlocks);
    };

    const removeBlock = (index: number) => {
        setBlocks(blocks.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!title.trim()) {
            alert('Введіть назву статті');
            return;
        }

        // Use existing ID if editing, generate new if creating
        const articleId = article?.id || generateId(title);

        const articleData = {
            id: articleId,
            title,
            category,
            sectionId: sectionId || undefined,
            icon,
            content: blocks,
            order: article?.order || Date.now() // Preserve order or set new
        };

        setSaving(true);
        try {
            await articleService.save(articleData);
            alert(article ? 'Статтю успішно оновлено!' : 'Статтю успішно збережено!');
            onClose();
        } catch (error: any) {
            console.error(error);
            alert('Помилка збереження: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Створити статтю">
            <div className="space-y-4">
                {/* Основна інформація */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Назва статті</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        placeholder="Наприклад: Стандарти кромкування"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Розділ</label>
                        <select
                            value={sectionId}
                            onChange={(e) => setSectionId(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        >
                            <option value="">Не визначено</option>
                            {sections.map(sec => (
                                <option key={sec.id} value={sec.id}>{sec.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Підгрупа (категорія)</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as any)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        >
                            {categories
                                .filter(cat => !sectionId || cat.sectionId === sectionId)
                                .map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                                ))}
                        </select>
                    </div>
                </div>

                {/* Блоки контенту */}
                <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-slate-800">Контент</h3>
                        <div className="flex gap-2">
                            <button onClick={() => addBlock('header')} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">+ Заголовок</button>
                            <button onClick={() => addBlock('text')} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200">+ Текст</button>
                            <button onClick={() => addBlock('image')} className="text-xs px-2 py-1 bg-pink-100 text-pink-700 rounded hover:bg-pink-200">+ Картинка</button>
                            <button onClick={() => addBlock('warning')} className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded hover:bg-amber-200">+ Увага</button>
                            <button onClick={() => addBlock('list')} className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200">+ Список</button>
                        </div>
                    </div>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {blocks.map((block, index) => (
                            <div key={index} className="border border-slate-200 rounded-lg p-3 relative">
                                <button
                                    onClick={() => removeBlock(index)}
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                >
                                    <Trash2 size={16} />
                                </button>

                                <div className="text-xs font-bold text-slate-500 mb-2">{block.type.toUpperCase()}</div>

                                {block.type === 'image' ? (
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={block.value as string}
                                            onChange={(e) => updateBlock(index, e.target.value)}
                                            className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                                            placeholder="Або вставте посилання на картинку (URL)"
                                        />
                                        <div className="text-center py-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-pink-400 hover:bg-pink-50 transition">
                                            <label className="cursor-pointer">
                                                <span className="text-sm text-slate-600">📁 Натисніть щоб вибрати файл</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        
                                                        // Fallback Base64 (Гарантовано працює)
                                                        const reader = new FileReader();
                                                        reader.onload = (evt) => {
                                                            const base64 = evt.target?.result as string;
                                                            if (base64) updateBlock(index, base64);
                                                        };
                                                        reader.onerror = () => alert('Помилка читання файлу локально. Спробуйте ще раз.');
                                                        reader.readAsDataURL(file);
                                                    }}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                        {block.value && (
                                            <img
                                                src={block.value as string}
                                                alt="Preview"
                                                className="max-w-full h-32 object-cover rounded border"
                                            />
                                        )}
                                    </div>


                                ) : block.type === 'list' ? (
                                    <textarea
                                        value={(block.value as string[]).join('\n')}
                                        onChange={(e) => updateBlock(index, e.target.value.split('\n'))}
                                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                                        rows={3}
                                        placeholder="Кожен пункт з нового рядка"
                                    />
                                ) : (
                                    <textarea
                                        value={block.value as string}
                                        onChange={(e) => updateBlock(index, e.target.value)}
                                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                                        rows={block.type === 'text' ? 3 : 1}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Кнопка збереження */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:bg-slate-400 font-medium"
                >
                    {saving ? (
                        <span className="flex items-center justify-center gap-2">
                            <Loader2 className="animate-spin" size={20} />
                            Збереження...
                        </span>
                    ) : 'Зберегти статтю'}
                </button>
            </div>
        </Modal>
    );
}
