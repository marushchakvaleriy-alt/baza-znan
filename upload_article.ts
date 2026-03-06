import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, Timestamp } from "firebase/firestore";

// Config from src/lib/firebase.ts
const firebaseConfig = {
    apiKey: "AIzaSyCvX8znbelmAvQvfrZUyuhMRzDqIilHr5I",
    authDomain: "baza-znan-viyar.firebaseapp.com",
    projectId: "baza-znan-viyar",
    storageBucket: "baza-znan-viyar.firebasestorage.app",
    messagingSenderId: "173051062546",
    appId: "1:173051062546:web:ff93b6a706c38a135eebcb",
    measurementId: "G-MWQS6GMHYN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ergonomicsArticle = {
    id: 'schemes-ergonomics',
    title: 'Схеми: Ергономіка',
    category: 'constructive',
    icon: 'BookOpen',
    content: [
        {
            type: 'header',
            value: 'Схеми розташування та ергономіка',
        },
        {
            type: 'text',
            value: 'Цей розділ містить базові схеми та стандарти ергономіки для проектування меблів. Усі дані наведені у вигляді графічних схем.',
        },
        {
            type: 'image',
            value: '/articles/schemes-ergonomics/page_1_img_1.png',
        },
        {
            type: 'image',
            value: '/articles/schemes-ergonomics/page_2_img_1.png',
        },
        {
            type: 'image',
            value: '/articles/schemes-ergonomics/page_3_img_1.png',
        },
        {
            type: 'image',
            value: '/articles/schemes-ergonomics/page_4_img_1.png',
        },
        {
            type: 'image',
            value: '/articles/schemes-ergonomics/page_5_img_1.png',
        },
        {
            type: 'image',
            value: '/articles/schemes-ergonomics/page_6_img_1.png',
        },
        {
            type: 'image',
            value: '/articles/schemes-ergonomics/page_7_img_1.png',
        },
        {
            type: 'image',
            value: '/articles/schemes-ergonomics/page_8_img_1.png',
        },
        {
            type: 'image',
            value: '/articles/schemes-ergonomics/page_9_img_1.png',
        },
        {
            type: 'image',
            value: '/articles/schemes-ergonomics/page_10_img_1.png',
        },
        {
            type: 'image',
            value: '/articles/schemes-ergonomics/page_11_img_1.png',
        },
        {
            type: 'image',
            value: '/articles/schemes-ergonomics/page_12_img_1.png',
        },
        {
            type: 'image',
            value: '/articles/schemes-ergonomics/page_13_img_1.png',
        },
        {
            type: 'image',
            value: '/articles/schemes-ergonomics/page_14_img_1.png',
        },
        {
            type: 'image',
            value: '/articles/schemes-ergonomics/page_15_img_1.png',
        },
        {
            type: 'image',
            value: '/articles/schemes-ergonomics/page_16_img_1.png',
        },
        {
            type: 'image',
            value: '/articles/schemes-ergonomics/page_17_img_1.png',
        },
        {
            type: 'image',
            value: '/articles/schemes-ergonomics/page_18_img_1.png',
        },
    ],
    updatedAt: Timestamp.now()
};

async function upload() {
    console.log("Starting upload...");
    try {
        const docRef = doc(db, 'articles', ergonomicsArticle.id);
        await setDoc(docRef, ergonomicsArticle, { merge: true });
        console.log("Success! Article uploaded.");
        process.exit(0);
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
}

upload();
