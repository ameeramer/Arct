import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { auth } from '../services/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup 
} from 'firebase/auth';
import logo from '/assets/arct-logo.svg';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

// Translation data
const translations = {
  he: {
    registerProfessional: "הירשם כבעל מקצוע",
    login: "התחברות",
    email: "אימייל",
    password: "סיסמה",
    signUp: "הירשם",
    signIn: "התחבר",
    or: "או",
    registerWithGoogle: "הירשם עם Google",
    loginWithGoogle: "התחבר עם Google",
    alreadyHaveAccount: "כבר יש לך חשבון? התחבר",
    dontHaveAccount: "אין לך חשבון? הירשם",
    back: "חזרה",
  },
  ar: {
    registerProfessional: "سجل كمحترف",
    login: "تسجيل الدخول",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    signUp: "التسجيل",
    signIn: "تسجيل الدخول",
    or: "أو",
    registerWithGoogle: "التسجيل باستخدام Google",
    loginWithGoogle: "تسجيل الدخول باستخدام Google",
    alreadyHaveAccount: "لديك حساب بالفعل؟ تسجيل الدخول",
    dontHaveAccount: "ليس لديك حساب؟ التسجيل",
    back: "رجوع",
  },
  en: {
    registerProfessional: "Register as a Professional",
    login: "Login",
    email: "Email",
    password: "Password",
    signUp: "Sign Up",
    signIn: "Sign In",
    or: "OR",
    registerWithGoogle: "Register with Google",
    loginWithGoogle: "Sign in with Google",
    alreadyHaveAccount: "Already have an account? Log in",
    dontHaveAccount: "Don't have an account? Register",
    back: "Back",
  }
};

export default function LoginPage() {
  const { userType } = useParams<{ userType?: string }>();
  const [language, setLanguage] = useState<'he' | 'ar' | 'en'>('he');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(userType === 'professional');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Get translations based on selected language
  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
        navigate('/complete-signup');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      if (isRegister) {
        navigate('/complete-signup');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex flex-col items-center justify-center px-4 py-12"
      dir={language === 'en' ? 'ltr' : 'rtl'}
    >
      {/* Language selector */}
      <div className="absolute top-4 right-4 flex space-x-2">
        <button 
          onClick={() => setLanguage('he')} 
          className={`px-3 py-1 rounded-md ${language === 'he' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
        >
          עברית
        </button>
        <button 
          onClick={() => setLanguage('ar')} 
          className={`px-3 py-1 rounded-md ${language === 'ar' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
        >
          العربية
        </button>
        <button 
          onClick={() => setLanguage('en')} 
          className={`px-3 py-1 rounded-md ${language === 'en' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
        >
          English
        </button>
      </div>

      {/* Back button */}
      <div className="absolute top-4 left-4">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          {t.back}
        </button>
      </div>
      
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Arct Logo" className="h-16" />
          </div>
          
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
            {isRegister ? t.registerProfessional : t.login}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t.email}
              </label>
              <input
                id="email"
                type="email"
                placeholder={t.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t.password}
              </label>
              <input
                id="password"
                type="password"
                placeholder={t.password}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
            >
              {isRegister ? t.signUp : t.signIn}
            </button>
            
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </form>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">{t.or}</span>
            </div>
          </div>
          
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
              </g>
            </svg>
            {isRegister ? t.registerWithGoogle : t.loginWithGoogle}
          </button>
          
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="mt-4 text-sm text-gray-600 underline w-full text-center"
          >
            {isRegister ? t.alreadyHaveAccount : t.dontHaveAccount}
          </button>
        </div>
      </div>
    </div>
  );
}