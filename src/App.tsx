import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './services/firebase';
import { getDoc, doc } from 'firebase/firestore';
import { db } from './services/firebase';
// import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import UserTypeSelectionPage from './pages/UserTypeSelectionPage';
// import NewProjectPage from './pages/new-project/StartPage';
// import NewProjectGreeting from './pages/new-project/GreetingPage';
// import NewProjectChat from './pages/new-project/ChatPage';
// import ProjectPage from './pages/ProjectPage';
// import { PlusIcon } from '@heroicons/react/24/solid';
import CompleteSignupPage from './pages/CompleteSignupPage';
// import SubmitQuotePage from './pages/SubmitQuotePage';
// import ExploreProjectsPage from './pages/ExploreProjectsPage';
// import QuotePage from './pages/QuotePage';
// import MessageIcon from './components/navbar/MessageIcon';
// import MessagesPage from './pages/MessagesPage';
// import ChatPage from './pages/ChatPage';
import ProfileDashboardPage from './pages/ProfileDashboardPage';
import SearchProfessionalsPage from './pages/SearchProfessionalsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import DesignGeneratorPage from './pages/DesignGeneratorPage';
import ImagePlaygroundPage from './pages/ImagePlaygroundPage';
import AIChatPage from './pages/AIChatPage';

// Create a wrapper component that uses useLocation
function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const location = useLocation(); // Now this is safe to use

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

  useEffect(() => {
    // טעינה דינמית של Google Maps API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      // ניקוי בעת unmount
      document.head.removeChild(script);
    };
  }, []);

  // Check if we should hide the navbar
  const hideNavbar = location.pathname === '/complete-signup';

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <UserTypeSelectionPage />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/register/:userType" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route
          path="/complete-signup"
          element={user ? <CompleteSignupPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/dashboard"
          element={user ? <ProfileDashboardPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/search-professionals"
          element={user ? <SearchProfessionalsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin"
          element={user ? <AdminDashboardPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/design-generator"
          element={user ? <DesignGeneratorPage /> : <Navigate to="/login" />}
        />
        <Route path="/image-playground" element={<ImagePlaygroundPage />} />
        <Route path="/ai-chat" element={user ? <AIChatPage /> : <Navigate to="/login" />} />
      </Routes>
      
      {/* Only show navbar if not on complete-signup page */}
      {!hideNavbar && user && (
        <div className="fixed bottom-0 left-0 w-full border-t border-gray-200 bg-white flex justify-around py-3 sm:py-4 z-50">
          <button className="text-gray-700">
            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {/* <Link to="/new-project" className="bg-gray-100 p-2 rounded-full shadow-md">
            <PlusIcon className="h-6 w-6 sm:h-7 sm:w-7 text-black" />
          </Link>
          <MessageIcon /> */}
          <button className="text-gray-700">
            <Link to="/dashboard">
              <img
                src={avatarUrl || 'https://randomuser.me/api/portraits/women/44.jpg'}
                alt="Profile"
                className="h-6 w-6 sm:h-7 sm:w-7 rounded-full object-cover"
              />
            </Link>
          </button>
        </div>
      )}
    </>
  );
}

// Main App component that provides the Router context
export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}