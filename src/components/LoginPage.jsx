import React, { useState, useEffect } from 'react';
import BillingPage from './BillingPage';
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
import { FcGoogle } from 'react-icons/fc';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';

// =================================================================================
// FIREBASE CONFIG
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// =================================================================================
// Modal
// =================================================================================
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

// =================================================================================
// Login Page
// =================================================================================
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
                setUser(userDoc.exists()
                    ? { uid: currentUser.uid, ...userDoc.data() }
                    : { uid: currentUser.uid, email: currentUser.email });
            } else setUser(null);
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
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-xl text-gray-600">Loading...</p>
            </div>
        );
    }

    if (user) return <BillingPage user={user} onSignOut={handleSignOut} />;

    return (
        <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gradient-to-br from-indigo-100 to-white p-6">
            <Modal message={notification} onClose={() => setNotification('')} />

            {/* Side Graphic */}
            <div className="md:w-1/2 mb-10 md:mb-0 flex justify-center">
                <img
                    src="https://cdn-icons-png.flaticon.com/512/3712/3712105.png"
                    alt="shopping"
                    className="w-72 drop-shadow-xl animate-bounce-slow"
                />
            </div>

            {/* Auth Form */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-indigo-700">Smart Shopping</h1>
                    <p className="text-sm text-gray-500">
                        {isLogin ? 'Welcome back! Please log in.' : 'Create your smart shopping account.'}
                    </p>
                </div>
                <form onSubmit={handleAuthAction}>
                    {!isLogin && (
                        <div className="mb-4 relative">
                            <FaUser className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            />
                        </div>
                    )}
                    <div className="mb-4 relative">
                        <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div className="mb-6 relative">
                        <FaLock className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        {isLoading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
                    </button>
                </form>

                {/* Or divider */}
                <div className="mt-6 flex items-center justify-between">
                    <div className="w-full border-t border-gray-300" />
                    <span className="mx-2 text-gray-400 text-sm">or</span>
                    <div className="w-full border-t border-gray-300" />
                </div>

                <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-gray-700"
                >
                    <FcGoogle size={20} />
                    Sign in with Google
                </button>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-indigo-600 hover:text-indigo-500 font-medium"
                    >
                        {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Log In'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
