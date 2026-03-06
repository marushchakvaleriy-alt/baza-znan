 

export type ContentBlock = {
    type: 'text' | 'image' | 'warning' | 'list' | 'header' | 'html';
    value: string | string[];
};

export type Article = {
    id: string;
    sectionId?: string;
    title: string;
    category: string;       // parentCategoryId (підгрупа)
    subcategoryId?: string; // під-підгрупа
    icon?: any;
    order?: number; // Для сортування
    content: ContentBlock[];
};

// Типи даних для статей
// Самі статті тепер завантажуються з Firebase Firestore
export const articles: Article[] = [];

export const categories: Record<string, { label: string; color: string }> = {
    constructive: { label: 'Конструктив', color: 'bg-blue-100 text-blue-700' },
    production: { label: 'Виробництво', color: 'bg-green-100 text-green-700' },
    general: { label: 'Загальне', color: 'bg-slate-100 text-slate-700' },
};
