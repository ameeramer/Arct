import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { getAllUserProfiles, UserProfile } from '../services/users';
import ProfileEditModal from '../components/profile/ProfileEditModal';

// Translation data
const translations = {
  he: {
    title: "ניהול משתמשים",
    loading: "טוען נתונים...",
    error: "שגיאה בטעינת הנתונים. אנא נסה שוב.",
    notAdmin: "אין לך הרשאות מנהל מערכת.",
    search: "חיפוש משתמשים...",
    noResults: "לא נמצאו משתמשים התואמים את החיפוש.",
    name: "שם",
    phone: "טלפון",
    roles: "תפקידים",
    experience: "ניסיון",
    actions: "פעולות",
    edit: "ערוך",
    view: "צפה",
    years: "שנים",
    editProfile: "עריכת פרופיל",
    editRoles: "עריכת תפקידים",
    editRegions: "ערוך אזורי עבודה",
    logout: "התנתק",
    personal: "פרטים אישיים",
    aboutMe: "על עצמי",
    regions: "אזורי עבודה"
  },
  ar: {
    title: "إدارة المستخدمين",
    loading: "جاري التحميل...",
    error: "خطأ في تحميل البيانات. يرجى المحاولة مرة أخرى.",
    notAdmin: "ليس لديك صلاحيات المسؤول.",
    search: "البحث عن المستخدمين...",
    noResults: "لم يتم العثور على مستخدمين مطابقين للبحث.",
    name: "الاسم",
    phone: "الهاتف",
    roles: "الأدوار",
    experience: "الخبرة",
    actions: "الإجراءات",
    edit: "تعديل",
    view: "عرض",
    years: "سنوات",
    editProfile: "تعديل الملف الشخصي",
    editRoles: "تعديل الأدوار",
    editRegions: "تعديل مناطق العمل",
    logout: "تسجيل الخروج",
    personal: "معلومات شخصية",
    aboutMe: "عني",
    regions: "مناطق العمل"
  },
  en: {
    title: "User Management",
    loading: "Loading data...",
    error: "Error loading data. Please try again.",
    notAdmin: "You don't have admin permissions.",
    search: "Search users...",
    noResults: "No users found matching your search.",
    name: "Name",
    phone: "Phone",
    roles: "Roles",
    experience: "Experience",
    actions: "Actions",
    edit: "Edit",
    view: "View",
    years: "years",
    editProfile: "Edit Profile",
    editRoles: "Edit Roles",
    editRegions: "Edit Regions",
    logout: "Logout",
    personal: "Personal Info",
    aboutMe: "About Me",
    regions: "Work Regions"
  }
};

// List of admin UIDs - should be moved to a secure location in production
// move to env variables
const ADMIN_UIDS = import.meta.env.VITE_ADMIN_UIDS?.split(',') || [];

export default function AdminDashboardPage() {
  const [language, setLanguage] = useState<'he' | 'ar' | 'en'>('he');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSection, setEditSection] = useState<string>('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  
  // Get translations based on selected language
  const t = translations[language];

  // Check if current user is admin and fetch all users
  useEffect(() => {
    const checkAdminAndFetchUsers = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        // Check if user is logged in
        if (!auth.currentUser) {
          setError(t.notAdmin);
          setIsLoading(false);
          setIsAdmin(false);
          return;
        }
        
        // Check if user is admin
        const currentUid = auth.currentUser.uid;
        if (!ADMIN_UIDS.includes(currentUid)) {
          setError(t.notAdmin);
          setIsLoading(false);
          setIsAdmin(false);
          return;
        }
        
        setIsAdmin(true);
        
        // Fetch all user profiles
        const allUsers = await getAllUserProfiles();
        setUsers(allUsers);
        setFilteredUsers(allUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(t.error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminAndFetchUsers();
  }, [language, t.error, t.notAdmin]);

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const lowerCaseSearch = searchTerm.toLowerCase();
    const filtered = users.filter(user => 
      (user.name && user.name.toLowerCase().includes(lowerCaseSearch)) ||
      (user.phoneNumber && user.phoneNumber.toLowerCase().includes(lowerCaseSearch)) ||
      (user.roles && user.roles.some(role => role.toLowerCase().includes(lowerCaseSearch)))
    );
    
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

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
  const openEditModal = (user: UserProfile, section: string) => {
    setSelectedUser(user);
    setEditSection(section);
    setShowEditModal(true);
  };

  // Handle profile update
  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    // Update the user in the users array
    const updatedUsers = users.map(user => 
      user.id === updatedProfile.id ? updatedProfile : user
    );
    
    setUsers(updatedUsers);
    setFilteredUsers(
      filteredUsers.map(user => 
        user.id === updatedProfile.id ? updatedProfile : user
      )
    );
    
    setShowEditModal(false);
    setSelectedUser(null);
  };

  // Navigate to user profile
  const navigateToProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  // סגירת התפריט הנפתח בלחיצה מחוץ לתפריט
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // פונקציה לטיפול בפתיחה/סגירה של התפריט הנפתח
  const toggleDropdown = (userId: string) => {
    setActiveDropdown(activeDropdown === userId ? null : userId);
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

  if (!isAdmin) {
    return (
      <div 
        className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center"
        dir={language === 'en' ? 'ltr' : 'rtl'}
      >
        <div className="text-center text-red-600">
          <p>{error || t.notAdmin}</p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            Login
          </button>
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
      
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{t.title}</h1>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            {t.logout}
          </button>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {/* Search bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        {/* Users table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.name}
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.phone}
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.roles}
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.experience}
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img 
                              className="h-10 w-10 rounded-full object-cover" 
                              src={user.avatar || 'https://via.placeholder.com/150'} 
                              alt={user.name} 
                            />
                          </div>
                          <div className="mr-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user.id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.phoneNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.roles && user.roles.slice(0, 2).map((role, index) => (
                            <span 
                              key={index} 
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                            >
                              {role}
                            </span>
                          ))}
                          {user.roles && user.roles.length > 2 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{user.roles.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.yearsOfExperience} {t.years}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {/* תצוגת מובייל - תפריט נפתח */}
                        <div className="sm:hidden relative" ref={dropdownRef}>
                          <button
                            onClick={() => toggleDropdown(user.id)}
                            className="px-3 py-1 bg-indigo-600 text-white rounded-md"
                          >
                            {t.actions}
                          </button>
                          
                          {activeDropdown === user.id && (
                            <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    openEditModal(user, 'personal');
                                    setActiveDropdown(null);
                                  }}
                                  className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  {t.edit}
                                </button>
                                <button
                                  onClick={() => {
                                    openEditModal(user, 'roles');
                                    setActiveDropdown(null);
                                  }}
                                  className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  {t.editRoles}
                                </button>
                                <button
                                  onClick={() => {
                                    openEditModal(user, 'regions');
                                    setActiveDropdown(null);
                                  }}
                                  className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  {t.editRegions}
                                </button>
                                <button
                                  onClick={() => {
                                    navigateToProfile(user.id);
                                    setActiveDropdown(null);
                                  }}
                                  className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  {t.view}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* תצוגת דסקטופ - כפתורים */}
                        <div className="hidden sm:flex space-x-2">
                          <button
                            onClick={() => openEditModal(user, 'personal')}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            {t.edit}
                          </button>
                          <button
                            onClick={() => openEditModal(user, 'roles')}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {t.editRoles}
                          </button>
                          <button
                            onClick={() => openEditModal(user, 'regions')}
                            className="text-green-600 hover:text-green-900"
                          >
                            {t.editRegions}
                          </button>
                          <button
                            onClick={() => navigateToProfile(user.id)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            {t.view}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      {t.noResults}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <ProfileEditModal
          profile={selectedUser}
          section={editSection}
          language={language}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
}