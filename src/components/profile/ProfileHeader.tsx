import { useState, useRef } from 'react';
import { UserProfile } from '../../services/users';
import { uploadImage } from '../../services/storage';
import { updateUserProfile } from '../../services/users';
import { processProfileImage } from '../../utils/imageProcessing';

interface ProfileHeaderProps {
  profile: UserProfile;
  language: 'he' | 'ar' | 'en';
  t: any;
  onEdit: () => void;
  onLogout: () => void;
  onProfileUpdate: (updatedProfile: UserProfile) => void;
}

// Translation data for avatar options
const avatarTranslations = {
  he: {
    viewAvatar: "צפה בתמונת פרופיל",
    editAvatar: "ערוך תמונת פרופיל",
    uploadAvatar: "העלה תמונה חדשה",
    cancel: "ביטול",
    uploading: "מעלה...",
  },
  ar: {
    viewAvatar: "عرض صورة الملف الشخصي",
    editAvatar: "تعديل صورة الملف الشخصي",
    uploadAvatar: "تحميل صورة جديدة",
    cancel: "إلغاء",
    uploading: "جاري التحميل...",
  },
  en: {
    viewAvatar: "View Profile Picture",
    editAvatar: "Edit Profile Picture",
    uploadAvatar: "Upload New Picture",
    cancel: "Cancel",
    uploading: "Uploading...",
  }
};

export default function ProfileHeader({ profile, language, t, onEdit, onLogout, onProfileUpdate }: ProfileHeaderProps) {
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);
  const [showFullAvatar, setShowFullAvatar] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get avatar translations
  const avatarT = avatarTranslations[language];
  
  const handleAvatarClick = () => {
    setShowAvatarOptions(!showAvatarOptions);
  };
  
  const handleViewAvatar = () => {
    setShowAvatarOptions(false);
    setShowFullAvatar(true);
  };
  
  const handleEditAvatar = () => {
    setShowAvatarOptions(false);
    fileInputRef.current?.click();
  };
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      
      // עיבוד התמונה לפני העלאה
      const processedFile = await processProfileImage(file);
      
      // העלאת התמונה המעובדת
      const imageUrl = await uploadImage(processedFile, `avatars/${profile.id}`);
      
      // עדכון הפרופיל עם כתובת התמונה החדשה
      const updatedProfile = {
        ...profile,
        avatar: imageUrl
      };
      
      // עדכון במסד הנתונים
      await updateUserProfile(updatedProfile);
      
      // עדכון ברכיב האב
      onProfileUpdate(updatedProfile);
    } catch (err) {
      console.error('Error uploading avatar:', err);
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="relative">
      {/* Cover background */}
      <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
      
      <div className="px-6 pb-6">
        <div className="flex flex-col sm:flex-row items-center">
          {/* Avatar with options */}
          <div className="relative -mt-16 mb-4 sm:mb-0 sm:mr-6">
            <div 
              className="relative cursor-pointer group"
              onClick={handleAvatarClick}
            >
              <img 
                src={profile.avatar || 'https://via.placeholder.com/150'}
                alt={profile.name}
                className="w-32 h-32 rounded-full border-4 border-white object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full transition-opacity flex items-center justify-center">
                <svg className="h-8 w-8 text-white opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            
            {/* Avatar options dropdown */}
            {showAvatarOptions && (
              <div className="absolute top-full mt-2 left-0 w-48 bg-white rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button 
                    onClick={handleViewAvatar}
                    className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {avatarT.viewAvatar}
                  </button>
                  <button 
                    onClick={handleEditAvatar}
                    className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {avatarT.editAvatar}
                  </button>
                </div>
              </div>
            )}
            
            {/* Hidden file input for avatar upload */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
            />
            
            {/* Loading overlay */}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          
          {/* User info */}
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
            <div className="mt-1 flex flex-wrap justify-center sm:justify-start gap-2">
              {profile.roles && profile.roles.slice(0, 3).map((role, index) => (
                <span 
                  key={index} 
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                >
                  {role}
                </span>
              ))}
              {profile.roles && profile.roles.length > 3 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  +{profile.roles.length - 3}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {t.experience}: {profile.yearsOfExperience} {language === 'en' ? 'years' : language === 'he' ? 'שנים' : 'سنوات'}
            </p>
          </div>
          
          {/* Action buttons */}
          <div className="mt-4 sm:mt-0">
            <button
              onClick={onEdit}
              hidden={true}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              {t.editProfile}
            </button>
            <button
              onClick={onLogout}
              hidden={true}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              {t.logout}
            </button>
          </div>
        </div>
      </div>
      
      {/* Full avatar modal */}
      {showFullAvatar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setShowFullAvatar(false)}
        >
          <div className="relative max-w-2xl max-h-[90vh]">
            <img 
              src={profile.avatar || 'https://via.placeholder.com/150'} 
              alt={profile.name} 
              className="max-h-[90vh] max-w-full object-contain rounded-lg"
            />
            <button 
              className="absolute top-0 right-0 -translate-y-12 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 focus:outline-none"
              onClick={() => setShowFullAvatar(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 