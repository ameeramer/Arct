import { useEffect, useState } from 'react';
import { getRelevantQuotesWithProjects } from '../services/explore';
import { auth } from '../services/firebase';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

export default function ExploreProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [allRoles, setAllRoles] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [projectOwners, setProjectOwners] = useState<{ [key: string]: any }>({});
  const navigate = useNavigate();

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  useEffect(() => {
    const fetchRelevantProjects = async () => {
      if (selectedRoles.length > 0) {
        const data = await getRelevantQuotesWithProjects(selectedRoles);
        setProjects(data);
        console.log(data);
        setLoading(false);
      }
    };

    fetchRelevantProjects();
  }, [selectedRoles]);

  useEffect(() => {
    const initializeSelectedRoles = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userSnap = await getDoc(doc(db, 'users', user.uid));
      if (userSnap.exists()) {
        const roles = userSnap.data().roles || [];
        setAllRoles(roles);
        setSelectedRoles(roles); // רק בעת טעינה ראשונית
      }
    };

    initializeSelectedRoles();
  }, []);

  useEffect(() => {
    const fetchOwners = async () => {
      const ownersMap: { [key: string]: any } = {};
      await Promise.all(
        projects.map(async (item) => {
          const ownerId = item.project.userId;
          if (!ownersMap[ownerId]) {
            const snap = await getDoc(doc(db, 'users', ownerId));
            if (snap.exists()) {
              ownersMap[ownerId] = snap.data();
            }
          }
        })
      );
      setProjectOwners(ownersMap);
    };

    if (projects.length > 0) fetchOwners();
  }, [projects]);

  if (loading) return <div className="p-4">Loading...</div>;

  const tagColors: { [key: string]: string } = {
    Gardener: 'bg-green-100 text-green-800',
    Agronomist: 'bg-purple-100 text-purple-800',
    Surveyor: 'bg-yellow-100 text-yellow-800',
    Architect: 'bg-blue-100 text-blue-800',
    'Landscape Architect': 'bg-blue-100 text-blue-800',
    'Irrigation Designer': 'bg-cyan-100 text-cyan-800',
    default: 'bg-green-700 text-white',
  };

  const getTagColor = (tag: string) => tagColors[tag] || tagColors.default;

  return (
    <div className="px-6 pt-6 pb-28">
      <h1 className="text-xl font-semibold mb-4">Explore Projects that need your profession/s</h1>

      <div className="flex flex-wrap gap-2 mb-2">
        {allRoles.map((role) => (
          <button
            key={role}
            onClick={() => toggleRole(role)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedRoles.includes(role)
                ? getTagColor(role)
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {role}
          </button>
        ))}
      </div>
      <p className="text-sm text-gray-500 mb-4">*Choose one or more of your professions</p>

      {projects.length > 0 && (
        <div onClick={() => navigate(`/quote/${projects[0].quote.id}`)} className="grid gap-4 grid-cols-1 sm:grid-cols-2 bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="relative">
            <img
              src={projects[0].project.designs?.[projects[0].project.designs.length - 1]?.url || '/placeholder.jpg'}
              alt={projects[0].project.title}
              className="w-full h-48 object-cover"
            />
            <span className="absolute top-2 left-2 bg-white text-xs px-2 py-1 rounded-full font-medium shadow">New</span>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <img
                src={projectOwners[projects[0].project.userId]?.avatar || '/placeholder.jpg'}
                alt="Owner"
                className="w-6 h-6 rounded-full"
              />
              <h2 className="font-semibold text-md">{projects[0].project.title}</h2>
              <span className="text-sm text-gray-500 ml-auto">📍 {projects[0].project.location || 'Unknown'}</span>
            </div>
            <div className="text-sm text-gray-800 mb-1 flex items-center gap-1">
              <span>Looking for a</span>
              <span className={`text-sm px-2 py-1 rounded-full ${getTagColor(projects[0].quote?.tag)}`}>{projects[0].quote?.tag}</span>
            </div>
            <div className="text-sm text-gray-800 mb-4 flex items-center gap-1">
              <span>Price range:</span>
              <span className={`text-sm px-2 py-1 rounded-full ${getTagColor(projects[0].quote?.tag)}`}>{projects[0].quote?.priceRange}</span>
            </div>
          </div>
        </div>
      )}
    
      <div className="mt-6 mb-4 overflow-x-auto flex gap-4">
        {projects.slice(1).map((item) => (
          <div key={item.project.id} onClick={() => navigate(`/quote/${item.quote.id}`)} className="min-w-[300px] max-w-[300px] bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="relative">
              <img
                src={item.project.designs?.[item.project.designs.length - 1]?.url || '/placeholder.jpg'}
                alt={item.project.title}
                className="w-full h-48 object-cover"
              />
              <span className="absolute top-2 left-2 bg-white text-xs px-2 py-1 rounded-full font-medium shadow">New</span>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <img
                  src={projectOwners[item.project.userId]?.avatar || '/placeholder.jpg'}
                  alt="Owner"
                  className="w-6 h-6 rounded-full"
                />
                <h2 className="font-semibold text-md">{item.project.title}</h2>
                <span className="text-sm text-gray-500 ml-auto">📍 {item.project.location || 'Unknown'}</span>
              </div>
              <div className="text-sm text-gray-800 mb-1 flex items-center gap-1">
                <span>Looking for a</span>
                <span className={`text-sm px-2 py-1 rounded-full ${getTagColor(item.quote?.tag)}`}>{item.quote?.tag}</span>
              </div>
              <div className="text-sm text-gray-800 mb-4 flex items-center gap-1">
                <span>Price range:</span>
                <span className={`text-sm px-2 py-1 rounded-full ${getTagColor(item.quote?.tag)}`}>{item.quote?.priceRange}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold mt-8 mb-2">Near You – Tel Aviv</h2>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {projects.map((item) => (
          <div key={item.project.id} onClick={() => navigate(`/quote/${item.quote.id}`)} className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="relative">
              <img
                src={item.project.designs?.[item.project.designs.length - 1]?.url || '/placeholder.jpg'}
                alt={item.project.title}
                className="w-full h-48 object-cover"
              />
              <span className="absolute top-2 left-2 bg-white text-xs px-2 py-1 rounded-full font-medium shadow">New</span>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <img
                  src={projectOwners[item.project.userId]?.avatar || '/placeholder.jpg'}
                  alt="Owner"
                  className="w-6 h-6 rounded-full"
                />
                <h2 className="font-semibold text-md">{item.project.title}</h2>
                <span className="text-sm text-gray-500 ml-auto">📍 {item.project.location || 'Unknown'}</span>
              </div>
              <div className="text-sm text-gray-800 mb-1 flex items-center gap-1">
                <span>Looking for a</span>
                <span className={`text-sm px-2 py-1 rounded-full ${getTagColor(item.quote?.tag)}`}>{item.quote?.tag}</span>
              </div>
              <div className="text-sm text-gray-800 mb-4 flex items-center gap-1">
                <span>Price range:</span>
                <span className={`text-sm px-2 py-1 rounded-full ${getTagColor(item.quote?.tag)}`}>{item.quote?.priceRange}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
