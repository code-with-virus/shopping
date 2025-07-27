import React, { useState, useEffect } from 'react';
import BillingPage from './BillingPage';

// FIREBASE IMPORTS (Moved to the correct location at the top)
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,import React, { useState, useEffect } from 'react';
import BillingPage from './BillingPage';

// FIREBASE IMPORTS
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// =================================================================================
// PASTE YOUR FIREBASE CONFIGURATION HERE
// =================================================================================
const firebaseConfig = {
   apiKey: "AIzaSyDXWtUOAGubvW30oMtJ3TU6-cLXAgrRoaw",
  authDomain: "smart-billing-e6aaa.firebaseapp.com",
  projectId: "smart-billing-e6aaa",
  storageBucket: "smart-billing-e6aaa.firebasestorage.app",
  messagingSenderId: "931796749105",
  appId: "1:931796749105:web:ee78202f14fe65d9bb7e10",
 
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Custom Modal Component for Notifications
const Modal = ({ message, onClose }) => {
    if (!message) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm w-full">
                <p className="mb-4 text-gray-700">{message}</p>
                <button
                    onClick={onClose}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setUser({ uid: currentUser.uid, ...userDoc.data() });
                } else {
                    setUser({ uid: currentUser.uid, email: currentUser.email });
                }
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const createUserDocument = async (userAuth, additionalData) => {
        if (!userAuth) return;
        const userDocRef = doc(db, "users", userAuth.uid);
        const snapshot = await getDoc(userDocRef);
        if (!snapshot.exists()) {
            const { email } = userAuth;
            const createdAt = new Date();
            try {
                await setDoc(userDocRef, { email, createdAt, ...additionalData });
            } catch (error) {
                setNotification(`Error creating user document: ${error.message}`);
            }
        }
    };

    const handleAuthAction = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setNotification('');
        if (isLogin) {
            try {
                await signInWithEmailAndPassword(auth, email, password);
            } catch (error) {
                setNotification(getFriendlyErrorMessage(error.code));
            }
        } else {
            if (!username) {
                setNotification("Please enter a username.");
                setIsLoading(false);
                return;
            }
            try {
                const { user: createdUser } = await createUserWithEmailAndPassword(auth, email, password);
                await createUserDocument(createdUser, { username });
            } catch (error) {
                setNotification(getFriendlyErrorMessage(error.code));
            }
        }
        setIsLoading(false);
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setNotification('');
        try {
            const { user: googleUser } = await signInWithPopup(auth, googleProvider);
            await createUserDocument(googleUser, { username: googleUser.displayName });
        } catch (error) {
            setNotification(getFriendlyErrorMessage(error.code));
        }
        setIsLoading(false);
    };

    const handleSignOut = async () => {
        await signOut(auth);
    };

    const getFriendlyErrorMessage = (code) => {
        switch (code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                return 'Invalid email or password. Please try again.';
            case 'auth/email-already-in-use':
                return 'This email is already registered. Please log in.';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters long.';
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            default:
                return 'An unexpected error occurred. Please try again.';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex justify-center items-center">
                <p className="text-xl text-gray-600">Loading...</p>
            </div>
        );
    }

    if (user) {
        return <BillingPage user={user} onSignOut={handleSignOut} />;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4 font-sans">
            <Modal message={notification} onClose={() => setNotification('')} />
            <div className="max-w-md w-full mx-auto">
                 <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Smart Shopping</h1>
                    <p className="text-gray-500">{isLogin ? 'Welcome back! Please log in.' : 'Create an account.'}</p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <form onSubmit={handleAuthAction}>
                        {!isLogin && (
                             <div className="mb-4">
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required={!isLogin} />
                            </div>
                        )}
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                        </div>
                        <div className="mb-6">
                             <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
                            {isLoading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
                        </button>
                    </form>
                    <div className="mt-6 relative">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
                        <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or</span></div>
                    </div>
                    <div className="mt-6">
                         <button onClick={handleGoogleSignIn} disabled={isLoading} className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100">
                            Sign in with Google
                        </button>
                    </div>
                </div>
                 <div className="mt-6 text-center">
                    <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-indigo-600 hover:text-indigo-500">
                        {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Log In'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

    GoogleAuthProvider,
    signOut,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// =================================================================================
// PASTE YOUR FIREBASE CONFIGURATION HERE
// =================================================================================
const firebaseConfig = {
   apiKey: "AIzaSyDXWtUOAGubvW30oMtJ3TU6-cLXAgrRoaw",
  authDomain: "smart-billing-e6aaa.firebaseapp.com",
  projectId: "smart-billing-e6aaa",
  storageBucket: "smart-billing-e6aaa.firebasestorage.app",
  messagingSenderId: "931796749105",
  appId: "1:931796749105:web:ee78202f14fe65d9bb7e10",
  measurementId: "G-MK2QQB0Y6J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Custom Modal Component for Notifications
const Modal = ({ message, onClose }) => {
    if (!message) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm w-full">
                <p className="mb-4 text-gray-700">{message}</p>
                <button
                    onClick={onClose}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setUser({ uid: currentUser.uid, ...userDoc.data() });
                } else {
                    setUser({ uid: currentUser.uid, email: currentUser.email });
                }
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const createUserDocument = async (userAuth, additionalData) => {
        if (!userAuth) return;
        const userDocRef = doc(db, "users", userAuth.uid);
        const snapshot = await getDoc(userDocRef);
        if (!snapshot.exists()) {
            const { email } = userAuth;
            const createdAt = new Date();
            try {
                await setDoc(userDocRef, { email, createdAt, ...additionalData });
            } catch (error) {
                setNotification(`Error creating user document: ${error.message}`);
            }
        }
    };

    const handleAuthAction = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setNotification('');
        if (isLogin) {
            try {
                await signInWithEmailAndPassword(auth, email, password);
            } catch (error) {
                setNotification(getFriendlyErrorMessage(error.code));
            }
        } else {
            if (!username) {
                setNotification("Please enter a username.");
                setIsLoading(false);
                return;
            }
            try {
                const { user: createdUser } = await createUserWithEmailAndPassword(auth, email, password);
                await createUserDocument(createdUser, { username });
            } catch (error) {
                setNotification(getFriendlyErrorMessage(error.code));
            }
        }
        setIsLoading(false);
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setNotification('');
        try {
            const { user: googleUser } = await signInWithPopup(auth, googleProvider);
            await createUserDocument(googleUser, { username: googleUser.displayName });
        } catch (error) {
            setNotification(getFriendlyErrorMessage(error.code));
        }
        setIsLoading(false);
    };

    const handleSignOut = async () => {
        await signOut(auth);
    };

    const getFriendlyErrorMessage = (code) => {
        switch (code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                return 'Invalid email or password. Please try again.';
            case 'auth/email-already-in-use':
                return 'This email is already registered. Please log in.';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters long.';
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            default:
                return 'An unexpected error occurred. Please try again.';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex justify-center items-center">
                <p className="text-xl text-gray-600">Loading...</p>
            </div>
        );
    }

    if (user) {
        return <BillingPage user={user} onSignOut={handleSignOut} />;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4 font-sans">
            <Modal message={notification} onClose={() => setNotification('')} />
            <div className="max-w-md w-full mx-auto">
                 <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Smart Shopping</h1>
                    <p className="text-gray-500">{isLogin ? 'Welcome back! Please log in.' : 'Create an account.'}</p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <form onSubmit={handleAuthAction}>
                        {!isLogin && (
                             <div className="mb-4">
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required={!isLogin} />
                            </div>
                        )}
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray
