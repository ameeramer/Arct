import { useEffect, useState } from 'react';
import { getRelevantQuotesWithProjects } from '../services/explore';
import { auth } from '../services/firebase';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function ExploreProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [allRoles, setAllRoles] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [projectOwners, setProjectOwners] = useState<{ [key: string]: any }>({});

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

  return (
    <div className="p-4 pb-24">
      <h1 className="text-xl font-semibold mb-4">Explore Projects that need your profession/s</h1>

      <div className="flex flex-wrap gap-2 mb-2">
        {allRoles.map((role) => (
          <button
            key={role}
            onClick={() => toggleRole(role)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedRoles.includes(role)
                ? 'bg-green-700 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {role}
          </button>
        ))}
      </div>
      <p className="text-sm text-gray-500 mb-4">*Choose one or more of your professions</p>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {projects.map((item) => (
          <div key={item.project.id} className="bg-white rounded-lg shadow p-4">
            <img
              src={
                item.project.designs?.[item.project.designs.length - 1]?.url ||
                '/placeholder.jpg'
              }
              alt={item.project.title}
              className="w-full rounded mb-3"
            />
            <div className="flex items-center gap-2 mb-1">
              <img
                src={projectOwners[item.project.userId]?.avatar || '/placeholder.jpg'}
                alt="Owner"
                className="w-6 h-6 rounded-full"
              />
              <h2 className="font-bold text-lg">{item.project.title}</h2>
              <span className="text-sm text-gray-500 ml-auto">
                📍 {item.project.location || 'Unknown'}
              </span>
            </div>
            <div className="text-sm text-gray-600 mb-1">
              Looking for:{' '}
              <span className="inline-block mr-2 px-2 py-1 bg-gray-100 rounded-full">
                {item.quote?.tag}
              </span>
            </div>
            <div className="text-sm text-gray-600 mb-2">
              Price range:{' '}
              <span className="inline-block mr-2 px-2 py-1 bg-green-100 text-green-900 rounded-full">
                {item.quote?.priceRange}
              </span>
            </div>
            <button className="text-sm bg-black text-white px-4 py-2 rounded">
              View Project
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
