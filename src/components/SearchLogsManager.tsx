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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
                <div>
                    <h2 className="text-lg md:text-xl font-bold text-slate-800">Аналітика пошуку</h2>
                    <p className="text-xs text-slate-500">Запити, на які користувачі не знайшли відповіді.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={loadLogs}
                        className="flex-1 sm:flex-none p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition border border-slate-200 bg-white"
                        title="Оновити"
                    >
                        <RefreshCcw size={18} className="mx-auto" />
                    </button>
                    {logs.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            className="flex-[3] sm:flex-none flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition text-xs font-bold"
                        >
                            <Trash2 size={16} />
                            Очистити все
                        </button>
                    )}
                </div>
            </div>

            {logs.length === 0 ? (
                <div className="p-16 text-center text-slate-400">
                    <Search className="mx-auto mb-4 opacity-10" size={64} />
                    <p className="text-sm font-medium">Невдалих запитів поки що немає.</p>
                </div>
            ) : (
                <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-4 py-4 font-semibold text-slate-600 min-w-[150px]">Запит</th>
                                <th className="text-center px-4 py-4 font-semibold text-slate-600">К-сть</th>
                                <th className="text-right px-4 py-4 font-semibold text-slate-600">Остання спроба</th>
                                <th className="px-4 py-4 w-16"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50 transition active:bg-slate-100">
                                    <td className="px-4 py-4">
                                        <div className="font-bold text-slate-900">{log.query}</div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-[10px] font-black">
                                            {log.count}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-right text-[10px] text-slate-500 font-medium">
                                        {log.lastSearched?.toDate ? log.lastSearched.toDate().toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Невідомо'}
                                    </td>
                                    <td className="px-4 py-4">
                                        <button
                                            onClick={() => handleDelete(log.id)}
                                            className="text-slate-300 hover:text-red-500 transition p-2 active:scale-90"
                                        >
                                            <Trash2 size={16} />
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
