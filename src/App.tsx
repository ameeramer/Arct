import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from './services/firebase';
import { getDoc, doc } from 'firebase/firestore';
import { db } from './services/firebase';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import NewProjectPage from './pages/new-project/StartPage';
import NewProjectGreeting from './pages/new-project/GreetingPage';
import NewProjectChat from './pages/new-project/ChatPage';
import ProjectPage from './pages/ProjectPage';
import { PlusIcon } from '@heroicons/react/24/solid';
import CompleteSignupPage from './pages/CompleteSignupPage';
import SubmitQuotePage from './pages/SubmitQuotePage';
import ExploreProjectsPage from './pages/ExploreProjectsPage';
import QuotePage from './pages/QuotePage';
import MessageIcon from './components/navbar/MessageIcon';
import MessagesPage from './pages/MessagesPage';
import ChatPage from './pages/ChatPage';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const ref = doc(db, 'users', user.uid);
      getDoc(ref).then((snap) => {
        if (snap.exists()) {
          setAvatarUrl(snap.data().avatar);
        }
      });
    }
  }, [user]);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <Router>
      <div className="px-4 py-3 sm:px-6 sm:py-4 flex justify-between items-center bg-gray-100">
        {user && (
          <div className="text-sm sm:text-base text-gray-700">
            Signed in as <strong>{user.email}</strong>
            <button
              onClick={() => signOut(auth)}
              className="ml-4 px-3 py-1 sm:px-4 sm:py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm sm:text-base"
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
        <Route path="/project/:id" element={<ProjectPage />} />
        <Route path="/projects/:projectId/submit-quote" element={<SubmitQuotePage />} />
        <Route path="/complete-signup" element={<CompleteSignupPage />} />
        <Route path="/explore" element={<ExploreProjectsPage />} />
        <Route path="/quote/:id" element={<QuotePage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/chat/:chatId" element={<ChatPage />} />
      </Routes>
      <div className="fixed bottom-0 left-0 w-full border-t border-gray-200 bg-white flex justify-around py-3 sm:py-4 z-50">
        {user && (
          <>            
            <button className="text-gray-700">
              <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link to="/new-project" className="bg-gray-100 p-2 rounded-full shadow-md">
              <PlusIcon className="h-6 w-6 sm:h-7 sm:w-7 text-black" />
            </Link>
            <MessageIcon />
            <button className="text-gray-700">
              <img
                src={avatarUrl || 'https://randomuser.me/api/portraits/women/44.jpg'}
                alt="Profile"
                className="h-6 w-6 sm:h-7 sm:w-7 rounded-full object-cover"
              />
            </button>
          </>
        )}
      </div>
    </Router>
  );
}