import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadImage } from '../services/storage';
import { createUserProfile } from '../services/users';
import { auth } from '../services/firebase';

const allRoles = [
  // אדריכלות ועיצוב
  'Architect | אדריכל',
  'Landscape Architect | אדריכל נוף',
  'Interior Designer | מעצב פנים',
  'Urban Planner | מתכנן ערים',
  'Architectural Drafter | שרטט אדריכלי',

  // תכנון ונוף
  'Gardener | גנן',
  'Irrigation Designer | מתכנן השקיה',
  'Agronomist | אגרונום',
  'Arborist | מומחה עצים',
  'Ornamental Gardener | גנן נוי',

  // בנייה ושיפוץ
  'Renovation Contractor | קבלן שיפוצים',
  'Structural Engineer | מהנדס בניין',
  'Construction Supervisor | מפקח בניה',
  'Tiler | רצף',
  'Plasterer | טייח',
  'Plumber | אינסטלטור',
  'Electrician | חשמלאי',
  'Carpenters | נגרים',

  // מדידה וייעוץ
  'Certified Surveyor | מודד מוסמך',
  'Accessibility Consultant | יועץ נגישות',
  'Property Appraiser | שמאי מקרקעין',
  'Lighting Consultant | יועץ תאורה',
  'Drainage & Soil Consultant | יועץ קרקע וניקוז',

  // מערכות ותשתיות
  'Water Systems Consultant | יועץ מערכות מים',
  'HVAC Consultant | יועץ מיזוג אוויר',
  'Deck & Pergola Installer | מתקין דקים ופרגולות',
  'Synthetic Grass Installer | מתקין דשא סינטטי',
  'Smart Home Installer | מתקין מערכות חכמות',

  // ניהול וליווי
  'Project Manager | מנהל פרויקט',
  'Ecological Consultant | יועץ אקולוגי',
  'Environmental Artist | אומן סביבתי',
  'Customer Experience Specialist | מומחה שירות לקוחות'
];

export default function CompleteSignupPage() {
  const [name, setName] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [roleInput, setRoleInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    // Create preview URL for selected image
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  const handleSubmit = async () => {
    if (!name || !file || roles.length === 0 || !auth.currentUser) {
      setError('Please fill all fields and upload a profile image.');
      return;
    }

    try {
      setIsLoading(true);
      const imageUrl = await uploadImage(file, `avatars/${auth.currentUser.uid}`);
      await createUserProfile({
        id: auth.currentUser.uid,
        name,
        avatar: imageUrl,
        roles,
        projects: []
      });

      navigate('/');
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating your profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const nextStep = () => {
    if (step === 1 && !name) {
      setError('Please enter your name');
      return;
    }
    if (step === 2 && roles.length === 0) {
      setError('Please select at least one role');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-600 text-white font-bold">
              {step}
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-800">Complete Your Profile</h1>
              <p className="text-gray-500">השלם את הפרופיל שלך</p>
            </div>
          </div>

          <div className="mb-8 w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name / שם</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Roles / תפקידים</label>
                <div className="w-full border border-gray-300 px-4 py-3 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition">
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
                      placeholder="Search or type a role... / חפש או הקלד תפקיד"
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
                              Add "{roleInput}" as a custom role
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-3 text-sm text-gray-500">
                  Search for roles, click on suggestions, or add your own custom role
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image / תמונת פרופיל</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-500 transition cursor-pointer" onClick={() => document.getElementById('file-upload')?.click()}>
                  <div className="space-y-1 text-center">
                    {previewUrl ? (
                      <div className="flex flex-col items-center">
                        <img src={previewUrl} alt="Preview" className="h-32 w-32 object-cover rounded-full mb-3" />
                        <p className="text-sm text-indigo-600">Click to change image</p>
                      </div>
                    ) : (
                      <>
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                            <span>Upload a file</span>
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </>
                    )}
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleFileSelect}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mt-8 flex justify-between">
            {step > 1 ? (
              <button
                onClick={prevStep}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
              >
                Back / חזור
              </button>
            ) : (
              <div></div>
            )}
            
            {step < 3 ? (
              <button
                onClick={nextStep}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
              >
                Next / הבא
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Complete / סיים'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
