import { PlusIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { getUserProjects, Project } from '../services/projects';

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const user = auth.currentUser;
      if (user) {
        const data = await getUserProjects(user.uid);
        setProjects(data);
      }
      setLoading(false);
    };
    fetchProjects();
  }, []);
  
  return (
    <div className="pb-[130px] min-h-screen bg-[#f9f9f9] flex flex-col justify-between">
      <div className="p-4">
        <h2 className="text-2xl font-semibold mb-4">Projects</h2>
        
        <div className="grid gap-4 grid-cols-2 ">
          {loading ? (
            <p className="text-gray-500">Loading projects...</p>
          ) : (
            projects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm"
              >
                <img
                  src={project.designs?.[project.designs.length - 1]?.url || '/placeholder.jpg'}
                  alt={project.title}
                  className="w-full object-cover"
                />
                <div className="p-3">
                  <div className="font-semibold text-2xl">{project.title}</div>
                  {project.updates?.length > 0 && (
                    <div className="text-sm text-gray-500">{project.updates.length} new update{project.updates.length > 1 ? 's' : ''}</div>
                  )}
                </div>
              </Link>
            ))
          )}
          <Link
            to="/new-project"
            className="bg-white rounded-xl flex flex-col justify-center items-center text-gray-500 border border-dashed border-gray-300"
          >
            <PlusIcon className="h-8 w-8" />
            <div className="mt-2">New Project</div>
          </Link>
        </div>
      </div>


    </div>
  );
}