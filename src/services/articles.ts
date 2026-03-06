import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    deleteDoc,
    query,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import {
    ref,
    uploadBytes,
    getDownloadURL
} from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import type { Article } from '../data/handbook';

const COLLECTION_NAME = 'articles';

export const articleService = {
    // Отримати всі статті
    async getAll(): Promise<Article[]> {
        const q = query(collection(db, COLLECTION_NAME));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data() as Article);
    },

    // Отримати статтю за ID
    async getById(id: string): Promise<Article | null> {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? (docSnap.data() as Article) : null;
    },

    // Зберегти статтю (створити або оновити)
    async save(article: Article): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, article.id);
        await setDoc(docRef, {
            ...article,
            updatedAt: Timestamp.now()
        }, { merge: true });
    },

    // Завантажити зображення
    async uploadImage(file: File, articleId: string): Promise<string> {
        // Створюємо унікальне ім'я файлу щоб уникнути кешування
        const fileName = `${Date.now()}_${file.name}`;
        const storageRef = ref(storage, `articles/${articleId}/${fileName}`);

        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
    },

    // Видалити статтю
    async delete(id: string): Promise<void> {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    }
};
