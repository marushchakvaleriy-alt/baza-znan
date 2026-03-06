import { useState, useEffect } from 'react';
import { sectionService, type Section } from '../services/sections';
import { GripVertical, Edit, Trash2, X, Save } from 'lucide-react';

export function SectionManager() {
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ id: '', label: '', icon: '' });
    const [draggedItem, setDraggedItem] = useState<Section | null>(null);

    useEffect(() => {
        loadSections();
    }, []);

    const loadSections = async () => {
        setLoading(true);
        try {
            const data = await sectionService.getAll();
            setSections(data);
        } catch (error) {
            console.error('Error loading sections:', error);
            alert('Помилка завантаження розділів');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.id.trim() || !formData.label.trim()) {
            alert(`Заповніть обов'язкові поля (ID та Назва)`);
            return;
        }

        try {
            const id = editingId || formData.id.toLowerCase().replace(/[^a-zа-яі0-9]+/g, '-');
            const existingSection = editingId ? sections.find(s => s.id === editingId) : null;

            const section: Section = {
                id,
                label: formData.label,
                icon: formData.icon || 'BookOpen', // Default icon
                order: existingSection?.order || Date.now(),
                createdAt: existingSection?.createdAt
            };

            await sectionService.save(section);
            alert(editingId ? 'Розділ оновлено!' : 'Розділ створено!');

            setEditingId(null);
            setFormData({ id: '', label: '', icon: '' });
            loadSections();
        } catch (error: any) {
            console.error(error);
            alert('Помилка збереження: ' + error.message);
        }
    };

    const handleEdit = (section: Section, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setEditingId(section.id);
        setFormData({ id: section.id, label: section.label, icon: section.icon || '' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Ви впевнені, що хочете видалити розділ?')) {
            return;
        }

        try {
            await sectionService.delete(id);
            alert('Розділ видалено!');
            loadSections();
        } catch (error: any) {
            console.error(error);
            alert('Помилка видалення: ' + error.message);
        }
    };

    const handleSaveOrder = async () => {
        try {
            await sectionService.updateOrder(sections);
            alert('Порядок збережено!');
        } catch (error: any) {
            console.error(error);
            alert('Помилка збереження порядку: ' + error.message);
        }
    };

    const handleDragStart = (e: React.DragEvent, item: Section) => {
        setDraggedItem(item);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (!draggedItem) return;

        const draggedIndex = sections.findIndex(s => s.id === draggedItem.id);
        if (draggedIndex === index) return;

        const newSections = [...sections];
        newSections.splice(draggedIndex, 1);
        newSections.splice(index, 0, draggedItem);
        setSections(newSections);
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
    };

    if (loading) return <div className="p-4 text-center text-slate-500">Завантаження...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                    {editingId ? 'Редагувати розділ' : 'Додати новий розділ меню'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ID (англійською)</label>
                        <input
                            type="text"
                            value={formData.id}
                            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                            disabled={!!editingId}
                            placeholder="приклад: bazis-mebliar"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none disabled:bg-slate-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Назва в меню</label>
                        <input
                            type="text"
                            value={formData.label}
                            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                            placeholder="Базис Мебляр"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Іконка (назва з lucide-react)</label>
                        <input
                            type="text"
                            value={formData.icon}
                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                            placeholder="Напр. BookOpen, Box, Settings"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        />
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
                                setFormData({ id: '', label: '', icon: '' });
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
                    <h3 className="text-lg font-bold text-slate-900">Існуючі розділи</h3>
                    <button
                        onClick={handleSaveOrder}
                        className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
                    >
                        Зберегти порядок
                    </button>
                </div>
                <div className="space-y-2">
                    {sections.map((section, index) => (
                        <div
                            key={section.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, section)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`flex items-center gap-3 p-3 border rounded-lg transition ${draggedItem?.id === section.id ? 'opacity-50 bg-blue-50' : 'hover:border-slate-300'}`}
                        >
                            <div className="text-slate-400 cursor-grab active:cursor-grabbing">
                                <GripVertical size={18} />
                            </div>
                            <span className="px-3 py-1 font-bold">{section.label}</span>
                            <span className="text-xs text-slate-400 font-mono flex-1">ID: {section.id}</span>
                            <button onClick={(e) => handleEdit(section, e)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition" type="button">
                                <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(section.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition" type="button">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
