import { useState } from 'react';
import { UserProfile } from '../../services/users';
import { updateUserProfile } from '../../services/users';

interface ProfileEditModalProps {
  profile: UserProfile;
  section: string;
  language: 'he' | 'ar' | 'en';
  onClose: () => void;
  onUpdate: (updatedProfile: UserProfile) => void;
}

// Translation data
const translations = {
  he: {
    editProfile: "ערוך פרופיל",
    personalInfo: "פרטים אישיים",
    fullName: "שם מלא",
    phoneNumber: "מספר טלפון",
    phoneFormat: "פורמט: 05X ולאחריו 7 ספרות",
    save: "שמור שינויים",
    cancel: "ביטול",
    processing: "מעבד...",
    error: "אירעה שגיאה. אנא נסה שוב."
  },
  ar: {
    editProfile: "تعديل الملف الشخصي",
    personalInfo: "معلومات شخصية",
    fullName: "الاسم الكامل",
    phoneNumber: "رقم الهاتف",
    phoneFormat: "التنسيق: 05X متبوعًا بـ 7 أرقام",
    save: "حفظ التغييرات",
    cancel: "إلغاء",
    processing: "جاري المعالجة...",
    error: "حدث خطأ. يرجى المحاولة مرة أخرى."
  },
  en: {
    editProfile: "Edit Profile",
    personalInfo: "Personal Information",
    fullName: "Full Name",
    phoneNumber: "Phone Number",
    phoneFormat: "Format: 05X followed by 7 digits",
    save: "Save Changes",
    cancel: "Cancel",
    processing: "Processing...",
    error: "An error occurred. Please try again."
  }
};

export default function ProfileEditModal({ profile, section, language, onClose, onUpdate }: ProfileEditModalProps) {
  const [name, setName] = useState(profile.name || '');
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Get translations based on selected language
  const t = translations[language];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      setIsLoading(true);
      
      // Create updated profile object
      const updatedProfile = {
        ...profile,
        name,
        phoneNumber
      };
      
      // Update profile in database
      await updateUserProfile(updatedProfile);
      
      // Notify parent component
      onUpdate(updatedProfile);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(t.error);
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        dir={language === 'en' ? 'ltr' : 'rtl'}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {t.editProfile} - {t.personalInfo}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  {t.fullName}
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  {t.phoneNumber}
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  required
                  pattern="05[0-9]{8}"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {t.phoneFormat}
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                disabled={isLoading}
              >
                {isLoading ? t.processing : t.save}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 