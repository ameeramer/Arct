import { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../../services/users';
import { updateUserProfile } from '../../services/users';
import { allRoles } from '../../pages/CompleteSignupPage';

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
      error: "אירעה שגיאה. אנא נסה שוב.",
      invalidPrefix: "מספר טלפון לא תקין. אנא נסה מספר טלפון חדש.",
      invalidNumber: "מספר טלפון לא תקין. אנא נסה מספר טלפון חדש.",
      yearsOfExperience: "שנות ניסיון",
      aboutMe: "על עצמי",
      roles: "תפקידים",
      searchRoles: "חפש תפקידים או הוסף חדשים...",
      customRole: "הוסף תפקיד מותאם אישית: {term}",
      rolesHelp: "בחר תפקידים מהרשימה או הוסף תפקידים מותאמים אישית",
      workRegions: "אזורי עבודה",
      searchRegions: "חפש אזורים...",
      customLocation: "הוסף מיקום מותאם אישית: {term}",
      regionsHelp: "בחר אזורים מהרשימה או הוסף אזורים מותאמים אישית",
      loadingRegions: "טוען אזורים..."
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
      error: "حدث خطأ. يرجى المحاولة مرة أخرى.",
      invalidPrefix: "رقم الهاتف غير صحيح. يرجى إدخال رقم هاتف جديد.",
      invalidNumber: "رقم الهاتف غير صحيح. يرجى إدخال رقم هاتف جديد.",
      yearsOfExperience: "سنوات الخبرة",
      aboutMe: "عن نفسي",
      roles: "الأدوار",
      searchRoles: "ابحث عن أدوار أو أضف جديدة...",
      customRole: "إضافة دور مخصص: {term}",
      rolesHelp: "اختر الأدوار من القائمة أو أضف أدوارًا مخصصة",
      workRegions: "مناطق العمل",
      searchRegions: "البحث عن المناطق...",
      customLocation: "إضافة موقع مخصص: {term}",
      regionsHelp: "اختر المناطق من القائمة أو أضف مناطق مخصصة",
      loadingRegions: "جاري تحميل المناطق..."
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
      error: "An error occurred. Please try again.",
      invalidPrefix: "Invalid phone prefix. Please enter a new phone number.",
      invalidNumber: "Invalid phone number. Please enter a new phone number.",
      yearsOfExperience: "Years of Experience",
      aboutMe: "About Me",
      roles: "Roles",
      searchRoles: "Search roles or add new ones...",
      customRole: "Add custom role: {term}",
      rolesHelp: "Select roles from the list or add custom roles",
      workRegions: "Work Regions",
      searchRegions: "Search regions...",
      customLocation: "Add custom location: {term}",
      regionsHelp: "Select regions from the list or add custom regions",
      loadingRegions: "Loading regions..."
    }
  };

export default function ProfileEditModal({ profile, section, language, onClose, onUpdate }: ProfileEditModalProps) {
  const [name, setName] = useState(profile.name || '');
  
  // Split phone number into prefix and number parts
  const [phonePrefix, setPhonePrefix] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Add state for years of experience
  const [yearsOfExperience, setYearsOfExperience] = useState(profile.yearsOfExperience || 0);
  
  // Add state for about me
  const [aboutMe, setAboutMe] = useState(profile.aboutMe || '');
  
  // Add state for roles
  const [roles, setRoles] = useState<string[]>(profile.roles || []);
  const [roleInput, setRoleInput] = useState('');
  
  // Add state for work regions
  const [workRegions, setWorkRegions] = useState<string[]>(profile.workRegions || []);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [regionSearchTerm, setRegionSearchTerm] = useState('');
  const [israelRegionsData, setIsraelRegionsData] = useState<{[key: string]: string[]}>({});
  const [isLoadingRegions, setIsLoadingRegions] = useState(true);
  const regionDropdownRef = useRef<HTMLDivElement>(null);
  
  // Initialize phone fields when component mounts
  useEffect(() => {
    if (profile.phoneNumber) {
      const parts = profile.phoneNumber.split('-');
      if (parts.length === 2) {
        setPhonePrefix(parts[0]);
        setPhoneNumber(parts[1]);
      }
    }
  }, [profile.phoneNumber]);
  
  // Fetch regions from data.gov.il API
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setIsLoadingRegions(true);
        const response = await fetch('https://data.gov.il/api/action/datastore_search?resource_id=1bf27e56-364c-4b61-8b6b-efa9933da677', {
          method: 'GET'
        });

        const data = await response.json();
        if (data.success && data.result.records) {
          // Group cities by region (MACHOZ)
          const regions: {[key: string]: string[]} = {};
          
          data.result.records.forEach((record: any) => {
            const region = record.MACHOZ;
            const city = record.HEBREW_NAME;
            
            if (region && city) {
              if (!regions[region]) {
                regions[region] = [];
              }
              
              // Only add the city if it's not already in the array
              if (!regions[region].includes(city)) {
                regions[region].push(city);
              }
            }
          });
          
          // Sort cities alphabetically within each region
          Object.keys(regions).forEach(region => {
            regions[region].sort();
          });
          
          setIsraelRegionsData(regions);
        }
      } catch (error) {
        console.error('Error fetching regions:', error);
      } finally {
        setIsLoadingRegions(false);
      }
    };
    
    fetchRegions();
  }, []);
  
  // Add click outside handler to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (regionDropdownRef.current && !regionDropdownRef.current.contains(event.target as Node)) {
        setShowRegionDropdown(false);
      }
    }
    
    // Add event listener when dropdown is shown
    if (showRegionDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Cleanup event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRegionDropdown]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Get translations based on selected language
  const t = translations[language];
  
  // Function to filter regions and cities based on search term
  const getFilteredRegions = () => {
    if (!regionSearchTerm.trim()) {
      return israelRegionsData;
    }
    
    const searchLower = regionSearchTerm.toLowerCase();
    const filteredRegions: Record<string, string[]> = {};
    
    Object.entries(israelRegionsData).forEach(([region, cities]) => {
      // Check if region name matches
      const regionMatches = region.toLowerCase().includes(searchLower);
      
      // Filter cities that match search term
      const matchingCities = cities.filter(city => 
        city.toLowerCase().includes(searchLower)
      );
      
      // Include region if either the region name matches or it has matching cities
      if (regionMatches || matchingCities.length > 0) {
        filteredRegions[region] = regionMatches ? cities : matchingCities;
      }
    });
    
    return filteredRegions;
  };
  
  const addWorkRegion = (region: string) => {
    if (!workRegions.includes(region)) {
      setWorkRegions([...workRegions, region]);
    }
    setShowRegionDropdown(false);
  };
  
  const removeWorkRegion = (region: string) => {
    setWorkRegions(workRegions.filter(r => r !== region));
  };
  
  const addCustomRegion = () => {
    if (regionSearchTerm.trim() && !workRegions.includes(regionSearchTerm.trim())) {
      setWorkRegions([...workRegions, regionSearchTerm.trim()]);
      setRegionSearchTerm('');
      setShowRegionDropdown(false);
    }
  };
  
  // Get section title based on the section being edited
  const getSectionTitle = () => {
    switch(section) {
      case 'personal':
        return t.personalInfo;
      case 'roles':
        return t.roles;
      case 'regions':
        return t.workRegions;
      default:
        return t.personalInfo; // Default to personal info for now
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      setIsLoading(true);
      
      // Check if profile has an ID
      if (!profile.id) {
        throw new Error('Profile ID is missing. Cannot update profile.');
      }
      
      // Validate phone number
      const prefixRegex = /^05\d$|^07\d$/;
      const numberRegex = /^\d{7}$/;
      
      if (!prefixRegex.test(phonePrefix)) {
        setError(t.invalidPrefix || 'Invalid phone prefix');
        setIsLoading(false);
        return;
      }
      
      if (!numberRegex.test(phoneNumber)) {
        setError(t.invalidNumber || 'Invalid phone number');
        setIsLoading(false);
        return;
      }
      
      // Combine prefix and number with a dash
      const fullPhoneNumber = `${phonePrefix}-${phoneNumber}`;
      
      // Create updated profile object
      const updatedProfile = {
        ...profile,
        name,
        phoneNumber: fullPhoneNumber,
        yearsOfExperience: Number(yearsOfExperience),
        aboutMe,
        roles,
        workRegions
      };
      
      console.log('Updating profile with ID:', updatedProfile.id);
      
      // Update profile in database
      await updateUserProfile(updatedProfile);
      
      // Notify parent component
      onUpdate(updatedProfile);
      onClose(); // Close the modal after successful update
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(t.error);
      setIsLoading(false);
    }
  };
  
  // Render different form content based on section
  const renderFormContent = () => {
    switch(section) {
      case 'regions':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.workRegions}
              </label>
              <div className="w-full border border-gray-300 px-4 py-3 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition">
                <div className="flex flex-wrap gap-2 mb-2">
                  {workRegions.map((region, idx) => (
                    <span
                      key={idx}
                      className="bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full flex items-center gap-2 transition hover:bg-indigo-200"
                    >
                      {region}
                      <button
                        onClick={() => removeWorkRegion(region)}
                        className="text-indigo-500 hover:text-indigo-700 font-bold transition"
                        title="Remove region"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="relative" ref={regionDropdownRef}>
                  <div className="w-full py-1 flex items-center justify-between">
                    <input
                      type="text"
                      className="w-full focus:outline-none"
                      placeholder={t.searchRegions}
                      value={regionSearchTerm}
                      onChange={(e) => {
                        setRegionSearchTerm(e.target.value);
                        setShowRegionDropdown(true);
                      }}
                      onClick={() => setShowRegionDropdown(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomRegion();
                        }
                      }}
                      dir={language === 'en' ? 'ltr' : 'rtl'}
                    />
                    {regionSearchTerm && (
                      <button
                        onClick={() => setRegionSearchTerm('')}
                        className="text-gray-400 hover:text-gray-600 transition"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {showRegionDropdown && (
                    <div className="pb-40 absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                      {isLoadingRegions ? (
                        <div className="py-2 px-3 text-gray-500">
                          {t.loadingRegions}
                        </div>
                      ) : Object.keys(getFilteredRegions()).length === 0 ? (
                        <div 
                          className="cursor-pointer select-none relative py-2 pl-3 pr-9 text-gray-900 hover:bg-indigo-50"
                          onClick={addCustomRegion}
                        >
                          {t.customLocation.replace('{term}', regionSearchTerm)}
                        </div>
                      ) : (
                        Object.entries(getFilteredRegions()).map(([region, cities]) => (
                          <div key={region}>
                            <div 
                              className="cursor-pointer select-none relative py-2 pl-3 pr-9 font-medium text-gray-900 hover:bg-indigo-50"
                              onClick={() => {
                                addWorkRegion(region);
                                setRegionSearchTerm('');
                              }}
                            >
                              {region}
                            </div>
                            {cities.map((city, idx) => (
                              <div 
                                key={idx}
                                className="cursor-pointer select-none relative py-2 pl-8 pr-9 text-gray-700 hover:bg-indigo-50"
                                onClick={() => {
                                  addWorkRegion(`${region} - ${city}`);
                                  setRegionSearchTerm('');
                                }}
                              >
                                {city}
                              </div>
                            ))}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {t.regionsHelp}
              </div>
            </div>
          </div>
        );
      case 'roles':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.roles}
              </label>
              <div className="mt-2 border border-gray-300 rounded-md px-3 py-2 focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                <div className="flex flex-wrap gap-2 mb-2">
                  {roles.map((r, idx) => (
                    <span
                      key={idx}
                      className="bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full flex items-center gap-2 transition hover:bg-indigo-200"
                    >
                      {r}
                      <button
                        onClick={() => setRoles(roles.filter(role => role !== r))}
                        className="text-indigo-500 hover:text-indigo-700 font-bold transition"
                        title="Remove role"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full focus:outline-none"
                    placeholder={t.searchRoles}
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && roleInput.trim()) {
                        e.preventDefault();
                        const matched = allRoles.find(role =>
                          role.toLowerCase() === roleInput.trim().toLowerCase()
                        );
                        const roleToAdd = matched || roleInput.trim();
                        if (!roles.includes(roleToAdd)) {
                          setRoles([...roles, roleToAdd]);
                        }
                        setRoleInput('');
                      }
                    }}
                    dir={language === 'en' ? 'ltr' : 'rtl'}
                  />
                  
                  {roleInput.trim() !== '' && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                      {allRoles
                        .filter(role => 
                          role.toLowerCase().includes(roleInput.toLowerCase())
                        )
                        .map((role, idx) => (
                          <div
                            key={idx}
                            className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50 ${
                              roles.includes(role) ? 'text-gray-400' : 'text-gray-900'
                            }`}
                            onClick={() => {
                              if (!roles.includes(role)) {
                                setRoles([...roles, role]);
                                setRoleInput('');
                              }
                            }}
                          >
                            <span className="block truncate">
                              {role}
                            </span>
                            {roles.includes(role) && (
                              <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </span>
                            )}
                          </div>
                        ))}
                      {allRoles.filter(role => 
                        role.toLowerCase().includes(roleInput.toLowerCase())
                      ).length === 0 && (
                        <div className="cursor-pointer select-none relative py-2 pl-3 pr-9 text-gray-900 hover:bg-indigo-50"
                          onClick={() => {
                            if (!roles.includes(roleInput.trim()) && roleInput.trim() !== '') {
                              setRoles([...roles, roleInput.trim()]);
                              setRoleInput('');
                            }
                          }}
                        >
                          <span className="block truncate font-medium">
                            {t.customRole.replace('{term}', roleInput)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-3 text-sm text-gray-500">
                {t.rolesHelp}
              </div>
            </div>
          </div>
        );
      case 'personal':
      default:
        return (
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
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                {t.phoneNumber}
              </label>
              <div className="flex space-x-2" style={{ direction: 'ltr' }}>
                <div className="w-1/3">
                  <input
                    id="phone-prefix"
                    type="text"
                    value={phonePrefix}
                    onChange={(e) => {
                      // Allow only numbers and limit to 3 characters
                      const value = e.target.value.replace(/[^\d]/g, '').slice(0, 3);
                      setPhonePrefix(value);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="050"
                    required
                    dir="ltr"
                  />
                </div>
                <div className="w-2/3">
                  <input
                    id="phone-number"
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => {
                      // Allow only numbers and limit to 7 characters
                      const value = e.target.value.replace(/[^\d]/g, '').slice(0, 7);
                      setPhoneNumber(value);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="0000000"
                    required
                    dir="ltr"
                  />
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {t.phoneFormat}
              </p>
            </div>
            
            <div>
              <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700 mb-1">
                {t.yearsOfExperience}
              </label>
              <input
                type="number"
                id="yearsOfExperience"
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                min="0"
                max="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                required
              />
            </div>
            
            <div>
              <label htmlFor="aboutMe" className="block text-sm font-medium text-gray-700 mb-1">
                {t.aboutMe}
              </label>
              <textarea
                id="aboutMe"
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
          </div>
        );
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
              {t.editProfile} - {getSectionTitle()}
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
            {renderFormContent()}
            
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