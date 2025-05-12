import { 
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { 
    doc,
    setDoc,
    getDoc
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const modalLoginBtn = document.getElementById('modalLoginBtn');
const createProjectBtn = document.getElementById('createProjectBtn');
const authModal = document.getElementById('authModal');

// Initialize Google Auth Provider
const provider = new GoogleAuthProvider();

// Auth State Observer
onAuthStateChanged(window.auth, async (user) => {
    if (user) {
        // User is signed in
        loginBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        createProjectBtn.classList.remove('hidden');
        authModal.classList.add('hidden');

        // Create or update user profile
        const userRef = doc(window.db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            await setDoc(userRef, {
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                createdAt: new Date()
            });
        }
    } else {
        // User is signed out
        loginBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
        createProjectBtn.classList.add('hidden');
    }
});

// Sign in with Google
async function signInWithGoogle() {
    try {
        await signInWithPopup(window.auth, provider);
    } catch (error) {
        console.error('Error signing in with Google:', error);
        showToast('Error signing in with Google', 'error');
    }
}

// Sign out
async function handleSignOut() {
    try {
        await signOut(window.auth);
    } catch (error) {
        console.error('Error signing out:', error);
        showToast('Error signing out', 'error');
    }
}

// Event Listeners
loginBtn.addEventListener('click', signInWithGoogle);
modalLoginBtn.addEventListener('click', signInWithGoogle);
logoutBtn.addEventListener('click', handleSignOut);

// Toast Message
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Export auth for use in other modules
export const auth = window.auth; 