import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    deleteDoc,
    query,
    orderBy,
    writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Section {
    id: string; // e.g., 'bazis', 'technolog'
    label: string; // e.g., 'Базис Мебляр'
    icon?: string; // e.g., 'BookOpen'
    order: number;
    createdAt?: number;
}

const COLLECTION_NAME = 'sections';

export const sectionService = {
    async getAll(): Promise<Section[]> {
        const q = query(collection(db, COLLECTION_NAME), orderBy('order'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data() as Section);
    },

    async getById(id: string): Promise<Section | null> {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? (docSnap.data() as Section) : null;
    },

    async save(section: Section): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, section.id);
        await setDoc(docRef, {
            ...section,
            createdAt: section.createdAt || Date.now()
        }, { merge: true });
    },

    async delete(id: string): Promise<void> {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    },

    async updateOrder(sections: Section[]): Promise<void> {
        const batch = writeBatch(db);
        sections.forEach((section, index) => {
            const docRef = doc(db, COLLECTION_NAME, section.id);
            batch.update(docRef, { order: index });
        });
        await batch.commit();
    }
};
