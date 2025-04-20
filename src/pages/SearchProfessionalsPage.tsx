import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import GooglePlacesSearch from '../components/common/GooglePlacesSearch';
import { allRoles } from './CompleteSignupPage';

// Translation data
const translations = {
  he: {
    title: "חיפוש בעלי מקצוע",
    subtitle: "מצא את בעל המקצוע המתאים לפרויקט שלך",
    searchByRole: "חיפוש לפי תפקיד",
    searchByRegion: "חיפוש לפי אזור",
    searchPlaceholder: "הקלד לחיפוש תפקיד...",
    regionPlaceholder: "חפש אזור...",
    yearsExperience: "שנות ניסיון",
    contactProfessional: "צור קשר",
    viewProfile: "צפה בפרופיל",
    noResults: "לא נמצאו תוצאות",
    clearFilters: "נקה סינון",
    searchResults: "תוצאות חיפוש",
    filterResults: "סנן תוצאות",
    selectedRoles: "תפקידים שנבחרו",
    selectedRegions: "אזורים שנבחרו",
    removeFilter: "הסר",
  },
  ar: {
    title: "البحث عن المهنيين",
    subtitle: "ابحث عن المهني المناسب لمشروعك",
    searchByRole: "البحث حسب الدور",
    searchByRegion: "البحث حسب المنطقة",
    searchPlaceholder: "اكتب للبحث عن دور...",
    regionPlaceholder: "ابحث عن منطقة...",
    yearsExperience: "سنوات الخبرة",
    contactProfessional: "اتصل",
    viewProfile: "عرض الملف الشخصي",
    noResults: "لم يتم العثور على نتائج",
    clearFilters: "مسح التصفية",
    searchResults: "نتائج البحث",
    filterResults: "تصفية النتائج",
    selectedRoles: "الأدوار المحددة",
    selectedRegions: "المناطق المحددة",
    removeFilter: "إزالة",
  },
  en: {
    title: "Search Professionals",
    subtitle: "Find the right professional for your project",
    searchByRole: "Search by Role",
    searchByRegion: "Search by Region",
    searchPlaceholder: "Type to search for a role...",
    regionPlaceholder: "Search for a region...",
    yearsExperience: "Years of Experience",
    contactProfessional: "Contact",
    viewProfile: "View Profile",
    noResults: "No results found",
    clearFilters: "Clear Filters",
    searchResults: "Search Results",
    filterResults: "Filter Results",
    selectedRoles: "Selected Roles",
    selectedRegions: "Selected Regions",
    removeFilter: "Remove",
  }
};

interface Professional {
  id: string;
  name: string;
  avatar: string;
  roles: string[];
  phoneNumber: string;
  yearsOfExperience: number;
  workRegions: Array<{ name: string; place_id?: string }>;
  aboutMe?: string;
  galleryUrls?: string[];
}

export default function SearchProfessionalsPage() {
  const [language, setLanguage] = useState<'he' | 'ar' | 'en'>('he');
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleSearch, setRoleSearch] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<{ name: string; place_id?: string }[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<string[]>([]);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Get translations based on selected language
  const t = translations[language];

  // Fetch all professionals on component mount
  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        setLoading(true);
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('name'));
        const querySnapshot = await getDocs(q);
        
        const professionalsData: Professional[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Professional;
          professionalsData.push({
            ...data,
            // Ensure workRegions is always an array of objects
            workRegions: Array.isArray(data.workRegions) 
              ? data.workRegions.map(region => 
                  typeof region === 'string' ? { name: region } : region
                )
              : []
          });
        });
        
        setProfessionals(professionalsData);
        setFilteredProfessionals(professionalsData);
      } catch (error) {
        console.error('Error fetching professionals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessionals();
  }, []);

  // Filter roles based on search input
  useEffect(() => {
    if (roleSearch.trim() === '') {
      setFilteredRoles([]);
      return;
    }
    
    const filtered = allRoles.filter(role => 
      role.toLowerCase().includes(roleSearch.toLowerCase())
    );
    setFilteredRoles(filtered.slice(0, 10)); // Limit to 10 results
  }, [roleSearch]);

  // Apply filters when selected roles or regions change
  useEffect(() => {
    let filtered = [...professionals];
    
    // Filter by selected roles
    if (selectedRoles.length > 0) {
      filtered = filtered.filter(professional => 
        professional.roles.some(role => selectedRoles.includes(role))
      );
    }
    
    // Filter by selected regions
    if (selectedRegions.length > 0) {
      filtered = filtered.filter(professional => 
        professional.workRegions.some(region => 
          selectedRegions.some(selectedRegion => selectedRegion.name === region.name)
        )
      );
    }
    
    setFilteredProfessionals(filtered);
  }, [selectedRoles, selectedRegions, professionals]);

  // Handle click outside role dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setShowRoleDropdown(false);
      }
    }
    
    if (showRoleDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRoleDropdown]);

  // Handle role selection
  const handleRoleSelect = (role: string) => {
    if (!selectedRoles.includes(role)) {
      setSelectedRoles([...selectedRoles, role]);
    }
    setRoleSearch('');
    setShowRoleDropdown(false);
  };

  // Handle region selection
  const handleRegionSelect = (location: {
    name: string;
    coordinates: { longitude: number; latitude: number };
    region?: string;
    place?: string;
    place_id?: string;
  }) => {
    const regionName = location.place || location.name;
    
    if (!selectedRegions.some(r => r.name === regionName)) {
      setSelectedRegions([...selectedRegions, { 
        name: regionName,
        place_id: location.place_id
      }]);
    }
  };

  // Remove role filter
  const removeRoleFilter = (role: string) => {
    setSelectedRoles(selectedRoles.filter(r => r !== role));
  };

  // Remove region filter
  const removeRegionFilter = (regionName: string) => {
    setSelectedRegions(selectedRegions.filter(r => r.name !== regionName));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedRoles([]);
    setSelectedRegions([]);
    setRoleSearch('');
  };

  // Navigate to professional profile
  const navigateToProfile = (professionalId: string) => {
    navigate(`/profile/${professionalId}`);
  };

  // Get tag color based on role (reusing function from other components)
  const getTagColor = (role: string) => {
    if (role.includes('Architect') || role.includes('אדריכל')) {
      return 'bg-blue-100 text-blue-800';
    } else if (role.includes('Designer') || role.includes('מעצב')) {
      return 'bg-purple-100 text-purple-800';
    } else if (role.includes('Engineer') || role.includes('מהנדס')) {
      return 'bg-green-100 text-green-800';
    } else if (role.includes('Contractor') || role.includes('קבלן')) {
      return 'bg-orange-100 text-orange-800';
    } else if (role.includes('Consultant') || role.includes('יועץ')) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="px-6 pt-6 pb-28 min-h-screen bg-neutral-50">
        {/* Language selector and Logout button */}
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
      <h1 className="text-2xl font-bold mb-2 mt-10" dir={language === 'en' ? 'ltr' : 'rtl'}>
        {t.title}
      </h1>
      <p className="text-gray-600 mb-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        {t.subtitle}
      </p>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4" dir={language === 'en' ? 'ltr' : 'rtl'}>
          {t.filterResults}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Role Search */}
          <div className="relative" ref={roleDropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1" dir={language === 'en' ? 'ltr' : 'rtl'}>
              {t.searchByRole}
            </label>
            <input
              type="text"
              value={roleSearch}
              onChange={(e) => {
                setRoleSearch(e.target.value);
                setShowRoleDropdown(true);
              }}
              onFocus={() => setShowRoleDropdown(true)}
              placeholder={t.searchPlaceholder}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              dir={language === 'en' ? 'ltr' : 'rtl'}
            />
            
            {showRoleDropdown && filteredRoles.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredRoles.map((role, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleRoleSelect(role)}
                    dir={language === 'en' ? 'ltr' : 'rtl'}
                  >
                    {role}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Region Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" dir={language === 'en' ? 'ltr' : 'rtl'}>
              {t.searchByRegion}
            </label>
            <GooglePlacesSearch
              language={language}
              onSelectLocation={handleRegionSelect}
              placeholder={t.regionPlaceholder}
            />
          </div>
        </div>

        {/* Selected Filters */}
        <div className="mt-4">
          {(selectedRoles.length > 0 || selectedRegions.length > 0) && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700" dir={language === 'en' ? 'ltr' : 'rtl'}>
                {selectedRoles.length > 0 && `${t.selectedRoles}: ${selectedRoles.length}`}
                {selectedRoles.length > 0 && selectedRegions.length > 0 && ' | '}
                {selectedRegions.length > 0 && `${t.selectedRegions}: ${selectedRegions.length}`}
              </span>
              <button
                onClick={clearAllFilters}
                className="text-sm text-red-600 hover:text-red-800"
                dir={language === 'en' ? 'ltr' : 'rtl'}
              >
                {t.clearFilters}
              </button>
            </div>
          )}

          {/* Selected Roles Tags */}
          {selectedRoles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedRoles.map((role, idx) => (
                <span
                  key={idx}
                  className={`${getTagColor(role)} text-sm px-3 py-1 rounded-full flex items-center gap-2 transition`}
                  dir={language === 'en' ? 'ltr' : 'rtl'}
                >
                  {role}
                  <button
                    onClick={() => removeRoleFilter(role)}
                    className="text-gray-500 hover:text-gray-700 font-bold transition"
                    title={t.removeFilter}
                  >
                    ×
                  </button>
                  </span>
              ))}
            </div>
          )}

          {/* Selected Regions Tags */}
          {selectedRegions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedRegions.map((region, idx) => (
                <span
                  key={idx}
                  className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full flex items-center gap-2 transition"
                  dir={language === 'en' ? 'ltr' : 'rtl'}
                >
                  {region.name}
                  <button
                    onClick={() => removeRegionFilter(region.name)}
                    className="text-gray-500 hover:text-gray-700 font-bold transition"
                    title={t.removeFilter}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <h2 className="text-lg font-semibold mb-4" dir={language === 'en' ? 'ltr' : 'rtl'}>
          {t.searchResults} ({filteredProfessionals.length})
        </h2>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredProfessionals.length === 0 ? (
          <div className="text-center py-10 text-gray-500" dir={language === 'en' ? 'ltr' : 'rtl'}>
            {t.noResults}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProfessionals.map((professional) => (
              <div 
                key={professional.id} 
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
              >
                <div className="p-4">
                  <div className="flex items-center mb-3">
                    <img 
                      src={professional.avatar || '/default-avatar.png'} 
                      alt={professional.name}
                      className="w-12 h-12 rounded-full object-cover mr-3"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">{professional.name}</h3>
                      <p className="text-sm text-gray-600">
                        {t.yearsExperience}: {professional.yearsOfExperience}
                      </p>
                    </div>
                  </div>
                  
                  {/* Professional Roles */}
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {professional.roles.slice(0, 3).map((role, idx) => (
                        <span 
                          key={idx} 
                          className={`${getTagColor(role)} text-xs px-2 py-0.5 rounded-full`}
                        >
                          {role}
                        </span>
                      ))}
                      {professional.roles.length > 3 && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full">
                          +{professional.roles.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Work Regions */}
                  {professional.workRegions.length > 0 && (
                    <div className="mb-3 text-sm text-gray-600">
                      <span className="font-medium">
                        {language === 'en' ? 'Regions: ' : language === 'he' ? 'אזורים: ' : 'المناطق: '}
                      </span>
                      {professional.workRegions.slice(0, 2).map((region, idx) => (
                        <span key={idx}>
                          {region.name}
                          {idx < Math.min(professional.workRegions.length, 2) - 1 && ', '}
                        </span>
                      ))}
                      {professional.workRegions.length > 2 && (
                        <span> +{professional.workRegions.length - 2}</span>
                      )}
                    </div>
                  )}
                  
                  {/* About Me (truncated) */}
                  {professional.aboutMe && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {professional.aboutMe}
                      </p>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => navigateToProfile(professional.id)}
                      className="flex-1 bg-indigo-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-indigo-700 transition"
                    >
                      {t.viewProfile}
                    </button>
                    <a
                      href={`tel:${professional.phoneNumber}`}
                      className="flex-1 bg-white border border-indigo-600 text-indigo-600 py-2 px-3 rounded-md text-sm font-medium hover:bg-indigo-50 transition text-center"
                    >
                      {t.contactProfessional}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}