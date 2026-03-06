import React, { useState } from 'react';
import { Ruler, Weight, ArrowDownToLine, Maximize2 } from 'lucide-react';
import { cn } from '../Layout'; // Re-using the utility

export function ShelfDeflection() {
    const [length, setLength] = useState(800); // mm
    const [depth, setDepth] = useState(500); // mm
    const [thickness, setThickness] = useState<'18' | '36'>('18');
    const [load, setLoad] = useState(20); // kg

    // Basic calculation for uniformly distributed load on a simply supported beam
    // Deflection = (5 * W * L^3) / (384 * E * I)
    // E (Modulus of Elasticity) for particle board (ДСП) is approx 3000 MPa (N/mm^2)
    // I (Moment of Inertia) = (b * h^3) / 12
    const calculateDeflection = () => {
        const E = 3000; // N/mm^2 
        const W = load * 9.81; // Convert kg to Newtons (Total load W)
        const L = length; // mm
        const b = depth; // width of beam in mm
        const h = parseInt(thickness); // height of beam in mm

        const I = (b * Math.pow(h, 3)) / 12;
        const deflection = (5 * W * Math.pow(L, 3)) / (384 * E * I);
        
        return deflection.toFixed(2);
    };

    const deflectionMm = calculateDeflection();
    const isDangerous = parseFloat(deflectionMm) > 3.0; // Assume > 3mm is starting to look bad

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Ruler className="text-blue-500" />
                    Розрахунок прогину полиці (ДСП)
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Ввід даних */}
                    <div className="space-y-6">
                        <div>
                            <label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-2">
                                <span className="flex items-center gap-2"><Maximize2 size={16}/> Довжина полиці (L)</span>
                                <span className="text-blue-600 font-bold">{length} мм</span>
                            </label>
                            <input
                                type="range"
                                min="200"
                                max="2000"
                                step="50"
                                value={length}
                                onChange={(e) => setLength(Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>

                        <div>
                            <label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-2">
                                <span className="flex items-center gap-2"><Maximize2 size={16} className="rotate-90"/> Глибина полиці (b)</span>
                                <span className="text-blue-600 font-bold">{depth} мм</span>
                            </label>
                            <input
                                type="range"
                                min="100"
                                max="1000"
                                step="50"
                                value={depth}
                                onChange={(e) => setDepth(Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Товщина ДСП (h)
                            </label>
                            <div className="flex gap-4">
                                {(["18", "36"] as const).map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setThickness(t)}
                                        className={cn(
                                            "flex-1 py-2 px-4 rounded-xl border-2 font-medium transition-all",
                                            thickness === t 
                                                ? "border-blue-500 bg-blue-50 justify-center text-blue-700" 
                                                : "border-slate-200 text-slate-600 hover:border-slate-300"
                                        )}
                                    >
                                        {t} мм
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-2">
                                <span className="flex items-center gap-2"><Weight size={16}/> Рівномірне навантаження</span>
                                <span className="text-blue-600 font-bold">{load} кг</span>
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="150"
                                step="1"
                                value={load}
                                onChange={(e) => setLoad(Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>
                    </div>

                    {/* Результат */}
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col justify-center items-center text-center">
                        <ArrowDownToLine size={48} className={cn("mb-4", isDangerous ? "text-red-500" : "text-green-500")} />
                        
                        <h3 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wide">Розрахунковий прогин</h3>
                        
                        <div className={cn(
                            "text-6xl font-black tracking-tighter mb-4",
                            isDangerous ? "text-red-600" : "text-slate-800"
                        )}>
                            {deflectionMm} <span className="text-2xl text-slate-400 font-medium">мм</span>
                        </div>
                        
                        <p className={cn(
                            "text-sm font-medium px-4 py-2 rounded-full",
                            isDangerous ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                        )}>
                            {isDangerous 
                                ? "Увага! Прогин завеликий, полиця може деформуватися." 
                                : "Нормально. Прогин візуально непомітний."}
                        </p>

                        <div className="mt-8 text-xs text-slate-400 text-left w-full space-y-1">
                            <p>* Розрахунок ведеться для ДСП E=3000 МПа.</p>
                            <p>* Враховано рівномірно розподілене навантаження.</p>
                            <p>* Кріплення вважається шарнірним по двох кінцях.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
