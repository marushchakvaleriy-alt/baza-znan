import { useState, useEffect } from 'react';
import { categoryService, type Category } from '../services/categories';
import { GripVertical, Plus, Edit, Trash2, Save, X } from 'lucide-react';

export function CategoryManager() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ id: '', label: '', color: '' });
    const [draggedItem, setDraggedItem] = useState<Category | null>(null);

    const colorOptions = [
        { value: 'bg-blue-100 text-blue-700', label: 'Синій' },
        { value: 'bg-green-100 text-green-700', label: 'Зелений' },
        { value: 'bg-purple-100 text-purple-700', label: 'Фіолетовий' },
        { value: 'bg-orange-100 text-orange-700', label: 'Помаранчевий' },
        { value: 'bg-red-100 text-red-700', label: 'Червоний' },
        { value: 'bg-slate-100 text-slate-700', label: 'Сірий' },
    ];

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const data = await categoryService.getAll();
            setCategories(data);
        } catch (error) {
            console.error('Error loading categories:', error);
            alert('Помилка завантаження категорій');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.id.trim() || !formData.label.trim() || !formData.color) {
            alert('Заповніть всі поля');
            return;
        }

        try {
            // Use existing ID if editing, otherwise sanitize new ID
            const id = editingId || formData.id.toLowerCase().replace(/[^a-zа-яі0-9]+/g, '-');

            // Get existing category to preserve metadata like order
            const existingCategory = editingId ? categories.find(c => c.id === editingId) : null;

            const category: Category = {
                id,
                label: formData.label,
                color: formData.color,
                order: existingCategory?.order || Date.now(),
                // Keep existing createdAt or let service handle it (service sets it if missing)
                createdAt: existingCategory?.createdAt
            };

            await categoryService.save(category);
            alert(editingId ? 'Категорію оновлено!' : 'Категорію створено!');

            // Reset form
            setEditingId(null);
            setFormData({ id: '', label: '', color: '' });
            loadCategories();
        } catch (error: any) {
            console.error(error);
            alert('Помилка збереження: ' + error.message);
        }
    };

    const handleEdit = (category: Category, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setEditingId(category.id);
        setFormData({ id: category.id, label: category.label, color: category.color });

        // Scroll to form to ensure user sees validation/input area
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Ви впевнені, що хочете видалити категорію? Переконайтеся, що немає статей з цією категорією.')) {
            return;
        }

        try {
            await categoryService.delete(id);
            alert('Категорію видалено!');
            loadCategories();
        } catch (error: any) {
            console.error(error);
            alert('Помилка видалення: ' + error.message);
        }
    };

    const handleSaveOrder = async () => {
        try {
            await categoryService.updateOrder(categories);
            alert('Порядок збережено!');
        } catch (error: any) {
            console.error(error);
            alert('Помилка збереження порядку: ' + error.message);
        }
    };

    // Drag and drop handlers
    const handleDragStart = (e: React.DragEvent, item: Category) => {
        setDraggedItem(item);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();

        if (!draggedItem) return;

        const draggedIndex = categories.findIndex(c => c.id === draggedItem.id);
        if (draggedIndex === index) return;

        const newCategories = [...categories];
        newCategories.splice(draggedIndex, 1);
        newCategories.splice(index, 0, draggedItem);

        setCategories(newCategories);
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
    };

    if (loading) {
        return <div className="p-4 text-center text-slate-500">Завантаження...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                    {editingId ? 'Редагувати категорію' : 'Додати категорію'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            ID (англійською)
                        </label>
                        <input
                            type="text"
                            value={formData.id}
                            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                            disabled={!!editingId}
                            placeholder="constructive"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none disabled:bg-slate-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Назва
                        </label>
                        <input
                            type="text"
                            value={formData.label}
                            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                            placeholder="Конструктив"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Колір
                        </label>
                        <select
                            value={formData.color}
                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        >
                            <option value="">Виберіть колір</option>
                            {colorOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex gap-2 mt-4">
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                    >
                        <Save size={16} />
                        {editingId ? 'Оновити' : 'Створити'}
                    </button>
                    {editingId && (
                        <button
                            onClick={() => {
                                setEditingId(null);
                                setFormData({ id: '', label: '', color: '' });
                            }}
                            className="flex items-center gap-2 bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition"
                        >
                            <X size={16} />
                            Скасувати
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900">Існуючі категорії</h3>
                    <button
                        onClick={handleSaveOrder}
                        className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
                    >
                        Зберегти порядок
                    </button>
                </div>

                <div className="space-y-2">
                    {categories.map((category, index) => (
                        <div
                            key={category.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, category)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`
                                flex items-center gap-3 p-3 border rounded-lg transition
                                ${draggedItem?.id === category.id ? 'opacity-50 bg-blue-50' : 'hover:border-slate-300'}
                            `}
                        >
                            <div className="text-slate-400 cursor-grab active:cursor-grabbing">
                                <GripVertical size={18} />
                            </div>

                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${category.color}`}>
                                {category.label}
                            </span>

                            <span className="text-xs text-slate-400 font-mono flex-1">
                                ID: {category.id}
                            </span>

                            <button
                                onClick={(e) => handleEdit(category, e)}
                                className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition"
                                type="button"
                            >
                                <Edit size={16} />
                            </button>

                            <button
                                onClick={() => handleDelete(category.id)}
                                className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                                type="button"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
