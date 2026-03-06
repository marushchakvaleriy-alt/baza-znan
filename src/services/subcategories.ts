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

export type Subcategory = {
    id: string;
    parentCategoryId: string; // belongs to Category
    sectionId?: string;       // belongs to Section (optional, for convenience)
    label: string;
    color: string;
    order: number;
    createdAt?: any;
};

const COLLECTION_NAME = 'subcategories';

export const subcategoryService = {
    async getAll(): Promise<Subcategory[]> {
        const q = query(collection(db, COLLECTION_NAME), orderBy('order', 'asc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subcategory));
    },

    async getById(id: string): Promise<Subcategory | null> {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Subcategory) : null;
    },

    async save(subcategory: Subcategory): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, subcategory.id);
        await setDoc(docRef, {
            ...subcategory,
            createdAt: subcategory.createdAt || Timestamp.now()
        }, { merge: true });
    },

    async delete(id: string): Promise<void> {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    },

    async updateOrder(subcategories: Subcategory[]): Promise<void> {
        const batch = writeBatch(db);
        subcategories.forEach((sub, index) => {
            const ref = doc(db, COLLECTION_NAME, sub.id);
            batch.update(ref, { order: index + 1 });
        });
        await batch.commit();
    }
};
