import { useState, useEffect } from 'react';
import { Calculator, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '../Layout';
import { HAFELE_DATA, interpolate, findModel } from '../../data/calculators/hafele';

export function HafeleLifter() {
    const [liftType, setLiftType] = useState('ff315');
    const [height, setHeight] = useState(400);
    const [width, setWidth] = useState(600);
    const [thickness, setThickness] = useState(18);
    const [handleWeight, setHandleWeight] = useState(0.2);
    const [materialDensity, setMaterialDensity] = useState(700); // 700 for DSP, 750 for MDF
    
    // Extras based on main type
    const [ffType, setFfType] = useState('ff315');
    const [ffColor, setFfColor] = useState('grey');
    const [fsType, setFsType] = useState('fs111');
    const [fsColor, setFsColor] = useState('white');

    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        calculate();
    }, [liftType, height, width, thickness, handleWeight, materialDensity, ffType, ffColor, fsType, fsColor]);

    const calculate = () => {
        const volume = (height * width * thickness) / 1000000000;
        const totalW = volume * materialDensity + handleWeight;
        
        // Resolve actual data key
        let dataKey = liftType;
        if (liftType === 'fs111') dataKey = fsType;
        if (liftType === 'ff315') dataKey = ffType;

        const d = HAFELE_DATA[dataKey];
        if (!d) return;

        const [hMin, hMax] = d.heightRange;
        const selectedColor = liftType === 'ff315' ? ffColor : fsColor;

        let model = null;
        let outOfRange = false;
        let message = '';
        let isSuccess = false;

        if (height < hMin || height > hMax) {
            outOfRange = true;
            message = `Висота ${height} мм поза допустимим діапазоном ${hMin}–${hMax} мм для ${d.name}.`;
        } else if (dataKey === 'ff15') {
            // Complex ff15 logic omitted for brevity here since the user's specific HTMl had it mostly as a sub-case, 
            // but we can implement it if needed. The provided HTML was missing ff15 data object in the first block, 
            // so let's stick to standard interpolation for everything else.
            const ranges = interpolate(d.table, height, d.modelOrder);
            model = findModel(ranges, totalW);
        } else {
            const ranges = interpolate(d.table, height, d.modelOrder);
            model = findModel(ranges, totalW);
        }

        if (model && !outOfRange) {
            isSuccess = true;
            message = `Вага ${totalW.toFixed(2)} кг підходить для ${d.name} Модель ${model}.`;
        } else if (!outOfRange) {
            if (totalW < 0.5) {
                message = 'Вага фасаду занадто мала.';
            } else {
                const ranges = interpolate(d.table, height, d.modelOrder);
                const vals = Object.values(ranges).filter(v => v);
                if (vals.length === 0) {
                    message = `Немає даних для такої висоти.`;
                } else {
                    const maxRange = Math.max(...vals.map(v => v[1]));
                    const minRange = Math.min(...vals.map(v => v[0]));
                    if (totalW > maxRange) {
                        message = `Фасад (${totalW.toFixed(2)} кг) важчий за максимум (${maxRange.toFixed(1)} кг).`;
                    } else {
                        message = `Фасад (${totalW.toFixed(2)} кг) легший за мінімум (${minRange.toFixed(1)} кг).`;
                    }
                }
            }
        }

        let article = null;
        if (isSuccess && model && d.articles && d.articles[model as string] && d.articles[model as string][selectedColor]) {
            article = d.articles[model as string][selectedColor];
        }

        let widthWarning = null;
        if (width > 1200) widthWarning = `Ширина ${width} мм перевищує рекомендовану. Ризик значного прогину!`;
        else if (width > 900) widthWarning = `Ширина ${width} мм > 900 мм! Ризик прогину.`;

        // Alternatives calculation
        let alternatives = [];
        if (!isSuccess) {
            const allTypeKeys = ['ff17', 'ff315', 'ffh15_90', 'ffh15_75', 'ffh15_110', 'ffh15p_90', 'ffh15p_75', 'ffh15p_110', 'fs111', 'fs615', 'fs18p', 'fs515p'];
            for (const type of allTypeKeys) {
                if (type === dataKey) continue;
                const td = HAFELE_DATA[type];
                if (!td) continue;
                const [mn, mx] = td.heightRange;
                if (height < mn || height > mx) continue;
                const r = interpolate(td.table, height, td.modelOrder);
                const m = findModel(r, totalW);
                if (m) alternatives.push(`${td.name} Модель ${m}`);
            }
        }

        setResult({
            weight: totalW,
            model,
            isSuccess,
            message,
            color: model && d.modelColors ? d.modelColors[model] : null,
            article,
            widthWarning,
            alternatives
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
                <header className="mb-8 border-b border-slate-100 pb-6 text-center">
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
                        <Calculator className="text-blue-500" />
                        Калькулятор Hafele Lifter
                    </h2>
                    <p className="text-slate-500 mt-2">Підбір моделі підіймача Free Flap / Free Space</p>
                </header>

                <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
                    <button 
                        className={cn("flex-1 py-2 font-medium rounded-lg text-sm transition-all", liftType === 'ff315' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                        onClick={() => setLiftType('ff315')}
                    >
                        Free Flap
                    </button>
                    <button 
                        className={cn("flex-1 py-2 font-medium rounded-lg text-sm transition-all", liftType === 'fs111' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                        onClick={() => setLiftType('fs111')}
                    >
                        Free Space
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* INPUTS */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Висота фасаду (мм)</label>
                            <input type="number" value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Ширина (мм)</label>
                                <input type="number" value={width} onChange={e => setWidth(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Товщина (мм)</label>
                                <input type="number" value={thickness} onChange={e => setThickness(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Вага ручки (кг)</label>
                                <input type="number" step="0.1" value={handleWeight} onChange={e => setHandleWeight(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Матеріал</label>
                                <select value={materialDensity} onChange={e => setMaterialDensity(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                                    <option value={700}>ДСП (~700 кг/м³)</option>
                                    <option value={750}>МДФ (~750 кг/м³)</option>
                                </select>
                            </div>
                        </div>

                        {/* EXTRAS */}
                        {liftType === 'ff315' && (
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Тип / серія Free Flap</label>
                                    <select value={ffType} onChange={e => setFfType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm">
                                        <option value="ff17">Free Flap 1.7 (200-450мм)</option>
                                        <option value="ff315">Free Flap 3.15 (350-650мм)</option>
                                        <optgroup label="З ручкою">
                                            <option value="ffh15_90">Free Flap H 1.5 - 90°</option>
                                            <option value="ffh15_75">Free Flap H 1.5 - 75°</option>
                                            <option value="ffh15_110">Free Flap H 1.5 - 110°</option>
                                        </optgroup>
                                        <optgroup label="Push-to-Open">
                                            <option value="ffh15p_90">Free Flap H 1.5 Push 90°</option>
                                            <option value="ffh15p_75">Free Flap H 1.5 Push 75°</option>
                                            <option value="ffh15p_110">Free Flap H 1.5 Push 110°</option>
                                        </optgroup>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Колір ковпачків</label>
                                    <select value={ffColor} onChange={e => setFfColor(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                                        <option value="grey">Сірий</option>
                                        <option value="white">Білий</option>
                                        <option value="anthr">Антрацит</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {liftType === 'fs111' && (
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Тип / серія Free Space</label>
                                    <select value={fsType} onChange={e => setFsType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm">
                                        <option value="fs111">Free Space 1.11 (стандарт)</option>
                                        <option value="fs615">Free Space 6.15 (важкий)</option>
                                        <option value="fs18p">Free Space 1.8 Push</option>
                                        <option value="fs515p">Free Space 5.15 Push (важкий)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Колір механізму</label>
                                    <select value={fsColor} onChange={e => setFsColor(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                                        <option value="white">Білий</option>
                                        <option value="lgrey">Світло-сірий</option>
                                        <option value="anthr">Антрацит</option>
                                        <option value="black">Чорний</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RESULTS */}
                    {result && (
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col">
                            <h3 className="font-semibold text-slate-800 mb-4">Результати:</h3>
                            
                            <div className="space-y-3 flex-1">
                                <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                    <span className="text-slate-500 text-sm">Вага фасаду (з ручкою)</span>
                                    <span className="font-bold text-lg">{result.weight.toFixed(2)} <span className="text-slate-400 text-sm font-normal">кг</span></span>
                                </div>

                                <div className={cn("flex justify-between items-center p-3 rounded-xl border shadow-sm", result.isSuccess ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100")}>
                                    <span className="text-slate-700 text-sm font-medium">Рекомендована модель</span>
                                    <span 
                                        className="text-white px-3 py-1 rounded-lg font-bold shadow-sm"
                                        style={{ backgroundColor: result.color || (result.isSuccess ? '#16a34a' : '#ef4444') }}
                                    >
                                        {result.model ? `Модель ${result.model}` : "Не підходить"}
                                    </span>
                                </div>

                                {result.article && (
                                    <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                        <span className="text-slate-500 text-sm">Артикул</span>
                                        <span className="font-mono font-bold tracking-wider text-blue-700">{result.article}</span>
                                    </div>
                                )}
                            </div>

                            <div className={cn("mt-6 p-4 rounded-xl text-sm flex gap-3", result.isSuccess ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")}>
                                {result.isSuccess ? <CheckCircle2 className="shrink-0" /> : <AlertTriangle className="shrink-0" />}
                                <span>{result.message}</span>
                            </div>

                            {result.widthWarning && (
                                <div className="mt-3 p-3 rounded-xl text-sm flex gap-3 bg-amber-100 text-amber-800">
                                    <AlertTriangle className="shrink-0" />
                                    <span>{result.widthWarning}</span>
                                </div>
                            )}

                            {result.alternatives && result.alternatives.length > 0 && (
                                <div className="mt-4 p-4 rounded-xl text-sm bg-blue-50 text-blue-800 border border-blue-100">
                                    <span className="font-semibold block mb-1">💡 Альтернативи:</span>
                                    {result.alternatives.join(' або ')}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
