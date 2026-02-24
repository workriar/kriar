// Firebase Configuration — Kriar
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDJfHbeSUUTF1wOWyu04CfJK7dr8euH1w8",
    authDomain: "kriar-df9c1.firebaseapp.com",
    projectId: "kriar-df9c1",
    storageBucket: "kriar-df9c1.firebasestorage.app",
    messagingSenderId: "870486120689",
    appId: "1:870486120689:web:e08ef360685da279f33150",
    measurementId: "G-71QVY7FXWQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Expõe funções globalmente para uso em scripts inline das páginas
window.kriarAuth = {

    // Cadastro com e-mail e senha
    signUp: async (email, password) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    },

    // Login com e-mail e senha
    login: async (email, password) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    },

    // Login com Google (popup)
    loginGoogle: async () => {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    },

    // Recuperação de senha
    resetPassword: async (email) => {
        await sendPasswordResetEmail(auth, email);
    },

    // Logout
    logout: async () => {
        await signOut(auth);
        window.location.href = 'login.html';
    },

    // Observador de estado de autenticação
    // Callback recebe `user` (logado) ou `null` (não logado)
    checkAuthState: (callback) => {
        onAuthStateChanged(auth, callback);
    }
};
