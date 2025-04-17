import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '/assets/arct-logo.svg';

// Translation data
const translations = {
  he: {
    title: "ברוכים הבאים ל-Arct",
    subtitle: "בחר את סוג החשבון שלך",
    professional: "הירשם כבעל מקצוע",
    client: "הירשם כלקוח",
    existingAccount: "יש לי כבר חשבון",
    clientDisabled: "בקרוב...",
  },
  ar: {
    title: "مرحبًا بك في Arct",
    subtitle: "اختر نوع حسابك",
    professional: "سجل كمحترف",
    client: "سجل كعميل",
    existingAccount: "لدي حساب بالفعل",
    clientDisabled: "قريبًا...",
  },
  en: {
    title: "Welcome to Arct",
    subtitle: "Choose your account type",
    professional: "Register as a Professional",
    client: "Register as a Client",
    existingAccount: "I already have an account",
    clientDisabled: "Coming soon...",
  }
};

export default function UserTypeSelectionPage() {
  const [language, setLanguage] = useState<'he' | 'ar' | 'en'>('he');
  const navigate = useNavigate();
  
  // Get translations based on selected language
  const t = translations[language];
  
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
      
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Arct Logo" className="h-16" />
          </div>
          
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            {t.title}
          </h1>
          <p className="text-center text-gray-600 mb-8">
            {t.subtitle}
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => navigate('/register/professional')}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition duration-200"
            >
              {t.professional}
            </button>
            
            <button
              disabled
              className="w-full bg-gray-200 text-gray-500 py-3 px-4 rounded-lg font-medium cursor-not-allowed flex justify-center items-center"
            >
              {t.client}
              <span className="ml-2 text-xs bg-gray-300 text-gray-600 px-2 py-1 rounded-full">
                {t.clientDisabled}
              </span>
            </button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {language === 'en' ? 'OR' : language === 'he' ? 'או' : 'أو'}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition duration-200"
            >
              {t.existingAccount}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 