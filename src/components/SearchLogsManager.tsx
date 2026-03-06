import { useState, useEffect } from 'react';
import { searchLogService, type SearchLog } from '../services/searchLogs';
import { Trash2, Search, Loader2, RefreshCcw } from 'lucide-react';

export function SearchLogsManager() {
    const [logs, setLogs] = useState<SearchLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const data = await searchLogService.getAll();
            setLogs(data);
        } catch (error) {
            console.error('Error loading logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Видалити цей запис?')) return;
        try {
            await searchLogService.delete(id);
            setLogs(logs.filter(l => l.id !== id));
        } catch (error) {
            console.error('Error deleting log:', error);
        }
    };

    const handleClearAll = async () => {
        if (!confirm('Ви впевнені, що хочете очистити ВСІ запити?')) return;
        try {
            await searchLogService.clearAll();
            setLogs([]);
        } catch (error) {
            console.error('Error clearing logs:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="animate-spin text-purple-600" size={32} />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Аналітика пошуку</h2>
                    <p className="text-sm text-slate-500">Запити, на які користувачі не знайшли відповіді.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={loadLogs}
                        className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition"
                        title="Оновити"
                    >
                        <RefreshCcw size={20} />
                    </button>
                    {logs.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                        >
                            <Trash2 size={18} />
                            Очистити все
                        </button>
                    )}
                </div>
            </div>

            {logs.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                    <Search className="mx-auto mb-4 opacity-20" size={48} />
                    <p>Невдалих запитів поки що немає. Це хороший знак!</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-6 py-3 font-semibold text-slate-600">Запит</th>
                                <th className="text-center px-6 py-3 font-semibold text-slate-600">Кількість</th>
                                <th className="text-right px-6 py-3 font-semibold text-slate-600">Остання спроба</th>
                                <th className="px-6 py-3 w-20"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{log.query}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
                                            {log.count}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm text-slate-500">
                                        {log.lastSearched?.toDate ? log.lastSearched.toDate().toLocaleString('uk-UA') : 'Невідомо'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleDelete(log.id)}
                                            className="text-slate-400 hover:text-red-600 transition p-1"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
