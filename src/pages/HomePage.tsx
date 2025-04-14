import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { getUserProjects, Project } from '../services/projects';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function HomePage() {
  const [createdProjects, setCreatedProjects] = useState<Project[]>([]);
  const [referencedProjects, setReferencedProjects] = useState<Project[]>([]);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      const user = auth.currentUser;
      if (user) {
        const createdProjects = await getUserProjects(user.uid);
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        let referencedProjects: Project[] = [];

        if (snap.exists()) {
          const projectIds: string[] = snap.data().projects || [];
          setUserRoles(snap.data().roles || []);
          const projectDocs = await Promise.all(
            projectIds.map(async (id: string) => {
              const pSnap = await getDoc(doc(db, 'projects', id));
              return pSnap.exists() ? { id: pSnap.id, ...pSnap.data() } as Project : null;
            })
          );
          referencedProjects = projectDocs.filter(Boolean) as Project[];
        }

        setCreatedProjects(createdProjects);
        setReferencedProjects(referencedProjects);
      }
    };
    fetchProjects();
  }, []);
  
  useEffect(() => {
    const checkUserProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          navigate('/complete-signup');
        }
      }
    };
    checkUserProfile();
  }, []);
  
  return (
    <div className="pb-60 sm:pb-40 min-h-screen bg-[#f9f9f9] flex flex-col justify-between">
      <div className="px-4 py-3 sm:px-6 sm:py-4">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">Projects I Created</h2>
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 mb-6">
          {createdProjects.map((project) => (
            <Link
              key={project.id}
              to={`/project/${project.id}`}
              className="bg-white rounded-xl overflow-hidden shadow-sm"
            >
              <img
                src={project.designs?.[project.designs.length - 1]?.url || '/placeholder.jpg'}
                alt={project.title}
                className="w-full object-cover"
              />
              <div className="p-3">
                <div className="font-semibold text-lg sm:text-xl">{project.title}</div>
                {project.updates?.length > 0 && (
                  <div className="text-sm text-gray-500">
                    {project.updates.length} new update{project.updates.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </Link>
          ))}
          <Link
            to="/new-project"
            className="aspect-square bg-white rounded-xl flex flex-col justify-center items-center text-gray-500 border border-dashed border-gray-300"
          >
            <PlusIcon className="h-8 w-8" />
            <div className="mt-2">New Project</div>
          </Link>
        </div>

        {userRoles.some((r) => r !== 'Client') && (
          <>
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Projects Utilizing My Profession</h2>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 mb-6">
              {referencedProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/project/${project.id}`}
                  className="bg-white rounded-xl overflow-hidden shadow-sm"
                >
                  <img
                    src={project.designs?.[project.designs.length - 1]?.url || '/placeholder.jpg'}
                    alt={project.title}
                    className="w-full object-cover"
                  />
                  <div className="p-3">
                    <div className="font-semibold text-lg sm:text-xl">{project.title}</div>
                    {project.updates?.length > 0 && (
                      <div className="text-sm text-gray-500">
                        {project.updates.length} new update{project.updates.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
              <Link
                to="/explore"
                className="aspect-square bg-white rounded-xl flex flex-col justify-center items-center text-gray-500 border border-dashed border-gray-300"
              >
                <MagnifyingGlassIcon className="h-8 w-8" />
                <div className="mt-2">Explore Projects</div>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}