import React, { useState, useEffect } from 'react';
import BillingPage from './BillingPage';
// Firebase imports...
// (Keep your firebaseConfig and initializations same as before)

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const [darkMode, setDarkMode] = useState(() =>
    localStorage.getItem('theme') === 'dark'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        setUser(userDoc.exists()
          ? { uid: currentUser.uid, ...userDoc.data() }
          : { uid: currentUser.uid, email: currentUser.email });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleTheme = () => setDarkMode(!darkMode);

  const Modal = ({ message, onClose }) => {
    if (!message) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
          <p className="mb-4 text-gray-700 dark:text-gray-200">{message}</p>
          <button
            onClick={onClose}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  const getFriendlyErrorMessage = (code) => {
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password.';
      case 'auth/email-already-in-use':
        return 'This email is already registered.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email.';
      default:
        return 'An unexpected error occurred.';
    }
  };

  const handleAuthAction = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setNotification('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (!username) {
          setNotification("Please enter a username.");
          setIsLoading(false);
          return;
        }
        const { user: createdUser } = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", createdUser.uid), {
          email,
          username,
          createdAt: new Date()
        });
      }
    } catch (error) {
      setNotification(getFriendlyErrorMessage(error.code));
    }
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setNotification('');
    try {
      const { user: googleUser } = await signInWithPopup(auth, new GoogleAuthProvider());
      await setDoc(doc(db, "users", googleUser.uid), {
        email: googleUser.email,
        username: googleUser.displayName,
        createdAt: new Date()
      });
    } catch (error) {
      setNotification(getFriendlyErrorMessage(error.code));
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200">
        <span>Loading...</span>
      </div>
    );
  }

  if (user) return <BillingPage user={user} onSignOut={() => signOut(auth)} />;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition duration-300 flex items-center justify-center px-4">
      <Modal message={notification} onClose={() => setNotification('')} />
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="text-xl p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          title="Toggle Dark Mode"
        >
          {darkMode ? '🌙' : '🌞'}
        </button>
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">Smart Shopping</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isLogin ? "Log in to your account" : "Create a new account"}
          </p>
        </div>
        <form onSubmit={handleAuthAction} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center my-4 text-sm text-gray-500 dark:text-gray-400">or</div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition"
        >
          Sign in with Google
        </button>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-600 hover:underline dark:text-indigo-400"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
