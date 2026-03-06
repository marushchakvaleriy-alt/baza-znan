import React from 'react';
import { Ruler, ArrowUpSquare, Wrench } from 'lucide-react';
import { ShelfDeflection } from '../components/calculators/ShelfDeflection';
import { HafeleLifter } from '../components/calculators/HafeleLifter';

export function Tools() {
    const [activeTool, setActiveTool] = React.useState<string | null>(null);

    const tools = [
        {
            id: 'shelf-deflection',
            title: 'Прогин полиці',
            description: 'Розрахунок прогину полиці під навантаженням для ДСП/МДФ.',
            icon: Ruler,
            component: ShelfDeflection
        },
        {
            id: 'hafele-lifter',
            title: 'Häfele Lifter',
            description: 'Калькулятор підбору моделі підіймача Free Flap та Free Space.',
            icon: ArrowUpSquare,
            component: HafeleLifter
        }
    ];

    if (activeTool) {
        const ToolComponent = tools.find(t => t.id === activeTool)?.component;
        return (
            <div className="space-y-6">
                <button 
                    onClick={() => setActiveTool(null)}
                    className="text-blue-500 hover:text-blue-600 font-medium flex items-center gap-2 mb-4"
                >
                    &larr; Назад до інструментів
                </button>
                {ToolComponent && <ToolComponent />}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 mb-8 text-white shadow-xl">
                <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
                    <Wrench className="text-blue-400" size={32} />
                    Інструменти та Розрахунки
                </h1>
                <p className="text-slate-300 max-w-2xl text-lg">
                    Професійні калькулятори для конструкторів меблів. Виберіть потрібний інструмент для швидкого і точного розрахунку.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool) => (
                    <button
                        key={tool.id}
                        onClick={() => setActiveTool(tool.id)}
                        className="group bg-white rounded-2xl p-6 text-left border border-slate-200 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 rounded-full -mr-16 -mt-16 group-hover:bg-blue-50/50 transition-colors"></div>
                        
                        <div className="flex items-center gap-4 mb-4 relative z-10">
                            <div className="bg-slate-100 group-hover:bg-blue-100 p-4 rounded-xl text-slate-600 group-hover:text-blue-600 transition-colors">
                                <tool.icon size={28} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{tool.title}</h2>
                        </div>
                        
                        <p className="text-slate-500 text-sm leading-relaxed relative z-10">
                            {tool.description}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
}
