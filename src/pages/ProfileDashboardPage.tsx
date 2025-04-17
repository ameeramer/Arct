import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { getUserProfile, UserProfile } from '../services/users';
import { getProject, Project } from '../services/projects';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileDetails from '../components/profile/ProfileDetails';
import ProfileGallery from '../components/profile/ProfileGallery';
import ProfileEditModal from '../components/profile/ProfileEditModal';
import ProfileGalleryManager from '../components/profile/ProfileGalleryManager';

// Define a new type that includes project details
type UserProfileWithProjects = UserProfile & {
  projectDetails?: Array<{ title: string; description: string }>;
};

// Translation data
const translations = {
  he: {
    title: "האזור האישי שלי",
    loading: "טוען את הפרופיל שלך...",
    error: "שגיאה בטעינת הפרופיל. אנא נסה שוב.",
    notLoggedIn: "אינך מחובר. אנא התחבר כדי לצפות באזור האישי.",
    editProfile: "ערוך פרופיל",
    editRoles: "ערוך תפקידים",
    editRegions: "ערוך אזורי עבודה",
    overview: "סקירה כללית",
    personalInfo: "פרטים אישיים",
    roles: "תפקידים",
    regions: "אזורי עבודה",
    experience: "שנות ניסיון",
    gallery: "גלריית עבודות",
    aboutMe: "על עצמי",
    noGallery: "אין תמונות בגלריה",
    noAboutMe: "אין מידע",
    projects: "פרויקטים",
    noProjects: "אין פרויקטים להצגה",
    contactInfo: "פרטי התקשרות",
    phone: "טלפון",
    viewPublicProfile: "צפה בפרופיל הציבורי",
    logout: "התנתק",
    viewGallery: "צפה בגלריה",
    manageGallery: "נהל גלריה",
  },
  ar: {
    title: "منطقتي الشخصية",
    loading: "جاري تحميل ملفك الشخصي...",
    error: "خطأ في تحميل الملف الشخصي. يرجى المحاولة مرة أخرى.",
    notLoggedIn: "أنت غير مسجل الدخول. يرجى تسجيل الدخول لعرض منطقتك الشخصية.",
    editProfile: "تعديل الملف الشخصي",
    editRoles: "تعديل الأدوار",
    editRegions: "تعديل المناطق",
    overview: "نظرة عامة",
    personalInfo: "معلومات شخصية",
    roles: "الأدوار",
    regions: "مناطق العمل",
    experience: "سنوات الخبرة",
    gallery: "معرض الأعمال",
    aboutMe: "عني",
    noGallery: "لا توجد صور في المعرض",
    noAboutMe: "لا توجد معلومات",
    projects: "المشاريع",
    noProjects: "لا توجد مشاريع للعرض",
    contactInfo: "معلومات الاتصال",
    phone: "الهاتف",
    viewPublicProfile: "عرض الملف الشخصي العام",
    logout: "تسجيل الخروج",
    viewGallery: "عرض المعرض",
    manageGallery: "إدارة المعرض",
  },
  en: {
    title: "My Dashboard",
    loading: "Loading your profile...",
    error: "Error loading profile. Please try again.",
    notLoggedIn: "You are not logged in. Please log in to view your dashboard.",
    editProfile: "Edit Profile",
    overview: "Overview",
    editRoles: "Edit Roles",
    editRegions: "Edit Regions",
    personalInfo: "Personal Information",
    roles: "Roles",
    regions: "Work Regions",
    experience: "Years of Experience",
    gallery: "Work Gallery",
    aboutMe: "About Me",
    noGallery: "No images in gallery",
    noAboutMe: "No information",
    projects: "Projects",
    noProjects: "No projects to display",
    contactInfo: "Contact Information",
    phone: "Phone",
    viewPublicProfile: "View Public Profile",
    logout: "Logout",
    viewGallery: "View Gallery",
    manageGallery: "Manage Gallery",
  }
};

export default function ProfileDashboardPage() {
  // State for language, profile data, loading state, and edit modal
  const [language, setLanguage] = useState<'he' | 'ar' | 'en'>('he');
  const [profile, setProfile] = useState<UserProfileWithProjects | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSection, setEditSection] = useState<string>('');
  const [showGalleryManager, setShowGalleryManager] = useState(false);
  
  const navigate = useNavigate();
  
  // Get translations based on selected language
  const t = translations[language];
  
  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        // Check if user is logged in
        if (!auth.currentUser) {
          setError(t.notLoggedIn);
          setIsLoading(false);
          return;
        }
        
        const userProfile = await getUserProfile(auth.currentUser.uid);
        
        if (!userProfile) {
          setError(t.error);
          setIsLoading(false);
          return;
        }
        
        // Initialize profile with empty projectDetails array
        const profileWithProjects: UserProfileWithProjects = {
          ...userProfile,
          projectDetails: []
        };
        
        // If profile has projects, fetch project details
        if (userProfile.projects && Array.isArray(userProfile.projects) && userProfile.projects.length > 0) {
          try {
            const projectPromises = userProfile.projects.map(projectId => 
              getProject(projectId).catch(err => {
                console.error(`Error fetching project ${projectId}:`, err);
                return null;
              })
            );
            
            const projectDetails = await Promise.all(projectPromises);
            
            // Filter out null values and update profile with project details
            profileWithProjects.projectDetails = projectDetails.filter(Boolean) as Project[];
          } catch (projectErr) {
            console.error('Error fetching projects:', projectErr);
            // Continue with profile without projects
          }
        }
        
        setProfile(profileWithProjects);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(t.error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [language, t.error, t.notLoggedIn]);
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };
  
  // Open edit modal with specific section
  const openEditModal = (section: string) => {
    setEditSection(section);
    setShowEditModal(true);
  };
  
  // Handle profile update
  const handleProfileUpdate = (updatedProfile: UserProfileWithProjects) => {
    setProfile(updatedProfile);
    setShowEditModal(false);
  };
  
  // Handle gallery update
  const handleGalleryUpdate = (updatedGallery: string[]) => {
    if (profile) {
      setProfile({
        ...profile,
        galleryUrls: updatedGallery
      });
    }
  };
  
  if (isLoading) {
    return (
      <div 
        className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center"
        dir={language === 'en' ? 'ltr' : 'rtl'}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-indigo-800">{t.loading}</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div 
        className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center"
        dir={language === 'en' ? 'ltr' : 'rtl'}
      >
        <div className="text-center text-red-600">
          <p>{error}</p>
          {error === t.notLoggedIn && (
            <button 
              onClick={() => navigate('/login')}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              Login
            </button>
          )}
        </div>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div 
        className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center"
        dir={language === 'en' ? 'ltr' : 'rtl'}
      >
        <div className="text-center text-red-600">
          <p>{t.error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-20 px-4 sm:px-6 lg:px-8"
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
      
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">{t.title}</h1>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <ProfileHeader 
            profile={profile} 
            language={language} 
            t={t} 
            onEdit={() => openEditModal('personal')}
            onLogout={handleLogout}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <ProfileDetails 
              profile={profile} 
              language={language} 
              t={t} 
              onEdit={openEditModal}
            />
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden mt-8 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">{t.gallery}</h2>
                <button 
                  onClick={() => setShowGalleryManager(!showGalleryManager)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  {showGalleryManager ? t.viewGallery || "View Gallery" : t.manageGallery || "Manage Gallery"}
                </button>
              </div>
              
              {showGalleryManager ? (
                <ProfileGalleryManager 
                  userId={profile.id}
                  galleryUrls={profile.galleryUrls || []}
                  language={language}
                  onUpdate={handleGalleryUpdate}
                />
              ) : (
                <ProfileGallery 
                  galleryUrls={profile.galleryUrls || []} 
                  t={t} 
                />
              )}
            </div>
          </div>
          
          <div className="md:col-span-1">
            {/* <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">{t.contactInfo}</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">{t.phone}</p>
                  <p className="font-medium">{profile.phoneNumber}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 mt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">{t.projects}</h2>
              {profile.projectDetails && profile.projectDetails.length > 0 ? (
                <div className="space-y-4">
                  {profile.projectDetails.map((project, index) => (
                    <div key={index} className="border-b pb-3 last:border-b-0">
                      <h3 className="font-medium">{project.title}</h3>
                      <p className="text-sm text-gray-600">{project.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">{t.noProjects}</p>
              )}
            </div> */}
            
            <div className="mt-8 flex flex-col space-y-3">
              {/* <button 
                onClick={() => navigate(`/profile/${profile.id}`)}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
              >
                {t.viewPublicProfile}
              </button> */}
              <button 
                onClick={handleLogout}
                className="w-full px-4 py-2 bg-white border border-red-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
              >
                {t.logout} X
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Modal */}
      {showEditModal && (
        <ProfileEditModal
          profile={profile}
          section={editSection}
          language={language}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
} 