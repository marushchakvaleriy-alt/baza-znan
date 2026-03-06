import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    deleteDoc,
    query,
    orderBy,
    Timestamp,
    writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export type Category = {
    id: string;
    sectionId?: string;
    label: string;
    color: string;
    order: number;
    createdAt?: any;
};

const COLLECTION_NAME = 'categories';

export const categoryService = {
    // Get all categories
    async getAll(): Promise<Category[]> {
        const q = query(collection(db, COLLECTION_NAME), orderBy('order', 'asc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Category));
    },

    // Get category by ID
    async getById(id: string): Promise<Category | null> {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Category) : null;
    },

    // Save category (create or update)
    async save(category: Category): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, category.id);
        await setDoc(docRef, {
            ...category,
            createdAt: category.createdAt || Timestamp.now()
        }, { merge: true });
    },

    // Delete category
    async delete(id: string): Promise<void> {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    },

    // Batch update order
    async updateOrder(categories: Category[]): Promise<void> {
        const batch = writeBatch(db);
        categories.forEach((category, index) => {
            const catRef = doc(db, COLLECTION_NAME, category.id);
            batch.update(catRef, { order: index + 1 });
        });
        await batch.commit();
    }
};
