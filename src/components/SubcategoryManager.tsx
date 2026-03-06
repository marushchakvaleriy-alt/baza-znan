import { useState, useEffect } from 'react';
import { subcategoryService, type Subcategory } from '../services/subcategories';
import { categoryService, type Category } from '../services/categories';
import { sectionService, type Section } from '../services/sections';
import { GripVertical, Edit, Trash2, X, Save } from 'lucide-react';

export function SubcategoryManager() {
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ id: '', label: '', color: '', sectionId: '', parentCategoryId: '' });
    const [draggedItem, setDraggedItem] = useState<Subcategory | null>(null);

    const colorOptions = [
        { value: 'bg-blue-100 text-blue-700', label: 'Синій' },
        { value: 'bg-green-100 text-green-700', label: 'Зелений' },
        { value: 'bg-purple-100 text-purple-700', label: 'Фіолетовий' },
        { value: 'bg-orange-100 text-orange-700', label: 'Помаранчевий' },
        { value: 'bg-red-100 text-red-700', label: 'Червоний' },
        { value: 'bg-slate-100 text-slate-700', label: 'Сірий' },
        { value: 'bg-yellow-100 text-yellow-700', label: 'Жовтий' },
    ];

    useEffect(() => { load(); }, []);

    const load = async () => {
        setLoading(true);
        try {
            const [subs, secs, cats] = await Promise.all([
                subcategoryService.getAll(),
                sectionService.getAll(),
                categoryService.getAll(),
            ]);
            setSubcategories(subs);
            setSections(secs);
            setCategories(cats);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleSave = async () => {
        if (!formData.id.trim() || !formData.label.trim() || !formData.parentCategoryId) {
            alert(`Заповніть обов'язкові поля (ID, Назва та Підгрупа)`);
            return;
        }
        try {
            const id = editingId || formData.id.toLowerCase().replace(/[^a-zа-яі0-9]+/g, '-');
            const existing = editingId ? subcategories.find(s => s.id === editingId) : null;
            await subcategoryService.save({
                id,
                label: formData.label,
                color: formData.color || 'bg-slate-100 text-slate-700',
                parentCategoryId: formData.parentCategoryId,
                sectionId: formData.sectionId || undefined,
                order: existing?.order || Date.now(),
                createdAt: existing?.createdAt
            });
            alert(editingId ? 'Оновлено!' : 'Створено!');
            setEditingId(null);
            setFormData({ id: '', label: '', color: '', sectionId: '', parentCategoryId: '' });
            load();
        } catch (e: any) { alert('Помилка: ' + e.message); }
    };

    const handleEdit = (sub: Subcategory, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setEditingId(sub.id);
        setFormData({ id: sub.id, label: sub.label, color: sub.color, sectionId: sub.sectionId || '', parentCategoryId: sub.parentCategoryId });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Видалити під-підгрупу?')) return;
        await subcategoryService.delete(id);
        load();
    };

    const handleSaveOrder = async () => {
        await subcategoryService.updateOrder(subcategories);
        alert('Порядок збережено!');
    };

    const handleDragStart = (e: React.DragEvent, item: Subcategory) => {
        setDraggedItem(item);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (!draggedItem) return;
        const from = subcategories.findIndex(s => s.id === draggedItem.id);
        if (from === index) return;
        const newSubs = [...subcategories];
        newSubs.splice(from, 1);
        newSubs.splice(index, 0, draggedItem);
        setSubcategories(newSubs);
    };

    const filteredCats = formData.sectionId
        ? categories.filter(c => c.sectionId === formData.sectionId)
        : categories;

    if (loading) return <div className="p-4 text-center text-slate-500">Завантаження...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4">{editingId ? 'Редагувати під-підгрупу' : 'Додати під-підгрупу'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Розділ (для фільтрації)</label>
                        <select value={formData.sectionId} onChange={e => setFormData({ ...formData, sectionId: e.target.value, parentCategoryId: '' })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
                            <option value="">Всі розділи</option>
                            {sections.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Підгрупа (батьківська) *</label>
                        <select value={formData.parentCategoryId} onChange={e => setFormData({ ...formData, parentCategoryId: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
                            <option value="">Оберіть підгрупу...</option>
                            {filteredCats.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ID (англійською) *</label>
                        <input type="text" value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value })} disabled={!!editingId} placeholder="napriklad: kriplennia" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none disabled:bg-slate-100" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Назва *</label>
                        <input type="text" value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value })} placeholder="Кріплення" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Колір</label>
                        <select value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
                            <option value="">Оберіть колір</option>
                            {colorOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex gap-2 mt-4">
                    <button onClick={handleSave} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                        <Save size={16} /> {editingId ? 'Оновити' : 'Створити'}
                    </button>
                    {editingId && (
                        <button onClick={() => { setEditingId(null); setFormData({ id: '', label: '', color: '', sectionId: '', parentCategoryId: '' }); }} className="flex items-center gap-2 bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition">
                            <X size={16} /> Скасувати
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900">Існуючі під-підгрупи</h3>
                    <button onClick={handleSaveOrder} className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition">Зберегти порядок</button>
                </div>
                <div className="space-y-2">
                    {subcategories.map((sub, index) => {
                        const parentCat = categories.find(c => c.id === sub.parentCategoryId);
                        const sec = sections.find(s => s.id === sub.sectionId);
                        return (
                            <div key={sub.id} draggable onDragStart={e => handleDragStart(e, sub)} onDragOver={e => handleDragOver(e, index)} onDragEnd={() => setDraggedItem(null)}
                                className={`flex items-center gap-3 p-3 border rounded-lg transition ${draggedItem?.id === sub.id ? 'opacity-50 bg-blue-50' : 'hover:border-slate-300'}`}>
                                <div className="text-slate-400 cursor-grab active:cursor-grabbing"><GripVertical size={18} /></div>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${sub.color}`}>{sub.label}</span>
                                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                    {sec?.label || ''}{sec && parentCat ? ' → ' : ''}{parentCat?.label || ''}
                                </span>
                                <span className="text-xs text-slate-400 font-mono flex-1 text-right">ID: {sub.id}</span>
                                <button onClick={e => handleEdit(sub, e)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition"><Edit size={16} /></button>
                                <button onClick={() => handleDelete(sub.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"><Trash2 size={16} /></button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
