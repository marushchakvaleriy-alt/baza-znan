import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { calculatorService, CalculatorConfig } from '../services/calculators';
import { CalculatorEngine } from '../components/CalculatorEngine';
import { ArrowLeft, Loader2 } from 'lucide-react';

export function CalculatorPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [config, setConfig] = useState<CalculatorConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            loadCalculator(id);
        }
    }, [id]);

    const loadCalculator = async (calcId: string) => {
        setLoading(true);
        try {
            const data = await calculatorService.getById(calcId);
            if (data) {
                setConfig(data);
            } else {
                setError('Калькулятор не знайдено');
            }
        } catch (err) {
            console.error(err);
            setError('Помилка завантаження');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="animate-spin text-purple-600" size={32} />
            </div>
        );
    }

    if (error || !config) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <p className="text-red-500 font-medium">{error || 'Невідома помилка'}</p>
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft size={16} /> На головну
                </button>
            </div>
        );
    }

    return (
        <div className="py-8">
            <div className="max-w-4xl mx-auto mb-6 px-4 md:px-0">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition mb-4"
                >
                    <ArrowLeft size={20} />
                    Назад
                </button>
            </div>

            <CalculatorEngine config={config} />
        </div>
    );
}
