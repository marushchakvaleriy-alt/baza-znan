import { 
    collection, 
    doc, 
    getDocs, 
    setDoc, 
    deleteDoc, 
    query, 
    orderBy, 
    Timestamp,
    getDoc,
    limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export type SearchLog = {
    id: string; // the search query itself (normalized)
    query: string;
    count: number;
    lastSearched: any;
};

const COLLECTION_NAME = 'search_logs';

export const searchLogService = {
    async getAll(): Promise<SearchLog[]> {
        const q = query(
            collection(db, COLLECTION_NAME), 
            orderBy('count', 'desc'),
            limit(100)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SearchLog));
    },

    async log(queryText: string): Promise<void> {
        if (!queryText.trim()) return;
        
        const normalizedQuery = queryText.trim().toLowerCase();
        const docRef = doc(db, COLLECTION_NAME, normalizedQuery);
        
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            await setDoc(docRef, {
                query: queryText.trim(),
                count: (data.count || 0) + 1,
                lastSearched: Timestamp.now()
            }, { merge: true });
        } else {
            await setDoc(docRef, {
                query: queryText.trim(),
                count: 1,
                lastSearched: Timestamp.now()
            });
        }
    },

    async delete(id: string): Promise<void> {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    },

    async clearAll(): Promise<void> {
        const snapshot = await getDocs(collection(db, COLLECTION_NAME));
        const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
        await Promise.all(deletePromises);
    }
};
