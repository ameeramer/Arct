import { UserProfile } from '../../services/users';

interface ProfileHeaderProps {
  profile: UserProfile;
  language: 'he' | 'ar' | 'en';
  t: any;
  onEdit: () => void;
  onLogout: () => void;
}

export default function ProfileHeader({ profile, language, t, onEdit, onLogout }: ProfileHeaderProps) {
  return (
    <div className="relative">
      {/* Cover background */}
      <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
      
      <div className="px-6 pb-6">
        <div className="flex flex-col sm:flex-row items-center">
          {/* Avatar */}
          <div className="relative -mt-16 mb-4 sm:mb-0 sm:mr-6">
            <img 
              src={profile.avatar || 'https://via.placeholder.com/150'}
              alt={profile.name}
              className="w-32 h-32 rounded-full border-4 border-white object-cover"
            />
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
    </div>
  );
} 