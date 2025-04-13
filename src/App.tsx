import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from './services/firebase';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import NewProjectPage from './pages/new-project/StartPage';
import NewProjectGreeting from './pages/new-project/GreetingPage';
import NewProjectChat from './pages/new-project/ChatPage';
import { PlusIcon } from '@heroicons/react/24/solid';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <Router>
      <div className="p-4 flex justify-between items-center bg-gray-100">
        {user && (
          <div className="text-sm text-gray-700">
            Signed in as <strong>{user.email}</strong>
            <button
              onClick={() => signOut(auth)}
              className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        )}
      </div>
      <Routes>
        <Route
          path="/"
          element={user ? <HomePage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/login"
          element={!user ? <LoginPage /> : <Navigate to="/" replace />}
        />
        <Route path="/new-project" element={<NewProjectPage />} />
        <Route path="/new-project/greeting" element={<NewProjectGreeting />} />
        <Route path="/new-project/chat" element={<NewProjectChat />} />
      </Routes>
      <div className="fixed bottom-0 left-0 w-full border-t border-gray-200 bg-white flex justify-around py-3 z-50">
        <button className="text-gray-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link to="/new-project" className="bg-gray-100 p-2 rounded-full shadow-md">
          <PlusIcon className="h-6 w-6 text-black" />
        </Link>
        <button className="text-gray-700">
          <img
            src="https://randomuser.me/api/portraits/women/44.jpg"
            alt="Profile"
            className="h-6 w-6 rounded-full object-cover"
          />
        </button>
      </div>
    </Router>
  );
}