import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Content */}
            <div className="relative bg-white sm:rounded-2xl shadow-2xl w-full max-w-4xl h-full sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom sm:zoom-in duration-300">
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100 bg-white sticky top-0 z-10 shrink-0">
                    <h3 className="text-lg md:text-xl font-bold text-slate-800 truncate pr-4">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-4 md:p-8 overflow-y-auto flex-1 overscroll-contain">
                    <div className="max-w-3xl mx-auto">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
