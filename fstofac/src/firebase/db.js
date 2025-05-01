import { initializeApp } from "https://www.gstatic.com/firebasejs/9.7.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    query, 
    where, 
    addDoc, 
    doc, 
    setDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.7.0/firebase-firestore.js";
import { firebaseConfig } from './config.js';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { 
    db, 
    collection, 
    getDocs, 
    query, 
    where, 
    addDoc, 
    doc, 
    setDoc,
    deleteDoc,
    serverTimestamp 
};