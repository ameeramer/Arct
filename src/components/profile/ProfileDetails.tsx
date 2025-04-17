import { UserProfile } from '../../services/users';

interface ProfileDetailsProps {
  profile: UserProfile;
  language: 'he' | 'ar' | 'en';
  t: any;
  onEdit: (section: string) => void;
}

export default function ProfileDetails({ profile, language, t, onEdit }: ProfileDetailsProps) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">{t.overview}</h2>
      </div>
      
      {/* Personal Information */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium text-gray-700">{t.personalInfo}</h3>
          <button 
            onClick={() => onEdit('personal')}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            {t.editProfile}
          </button>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">{t.phone}</p>
              <p className="font-medium">{profile.phoneNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t.experience}</p>
              <p className="font-medium">{profile.yearsOfExperience} {language === 'en' ? 'years' : language === 'he' ? 'שנים' : 'سنوات'}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Roles */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium text-gray-700">{t.roles}</h3>
          <button 
            onClick={() => onEdit('roles')}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            {t.editProfile}
          </button>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex flex-wrap gap-2">
            {profile.roles && profile.roles.map((role, index) => (
              <span 
                key={index} 
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
              >
                {role}
              </span>
            ))}
            {(!profile.roles || profile.roles.length === 0) && (
              <p className="text-gray-500 text-sm">{t.noAboutMe}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Work Regions */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium text-gray-700">{t.regions}</h3>
          <button 
            onClick={() => onEdit('regions')}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            {t.editProfile}
          </button>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex flex-wrap gap-2">
            {profile.workRegions && profile.workRegions.map((region, index) => (
              <span 
                key={index} 
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
              >
                {region}
              </span>
            ))}
            {(!profile.workRegions || profile.workRegions.length === 0) && (
              <p className="text-gray-500 text-sm">{t.noAboutMe}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* About Me */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium text-gray-700">{t.aboutMe}</h3>
          <button 
            onClick={() => onEdit('aboutMe')}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            {t.editProfile}
          </button>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          {profile.aboutMe ? (
            <p className="text-gray-700 whitespace-pre-line">{profile.aboutMe}</p>
          ) : (
            <p className="text-gray-500 text-sm">{t.noAboutMe}</p>
          )}
        </div>
      </div>
    </div>
  );
} 