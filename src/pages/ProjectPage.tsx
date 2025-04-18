import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getProject } from '../services/projects';
import { Project } from '../services/projects';
import { auth } from '../services/firebase';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import iconLogo from '/assets/arct-logo.svg';

export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      getProject(id).then(async (proj) => {
        setProject(proj);
        const isOwnerInTeam = proj?.team?.some((member) => member.userId === proj?.userId);
        const combinedTeam = isOwnerInTeam ? proj?.team : [{ userId: proj?.userId || '', role: 'Owner' }, ...(proj?.team || [])];

        if (proj?.team) {
          const members = await Promise.all(
            combinedTeam?.map(async (member) => {
              const snap = await getDoc(doc(db, 'users', member.userId));
              return snap.exists()
                ? { id: member.userId, ...snap.data(), teamRole: member.role }
                : null;
            }) || []
          );
          setTeamMembers(members.filter(Boolean));
        }
      });
    }
  }, [id]);

  if (!project) return <div className="p-4">Loading...</div>;

  const lastDesign = project.designs?.[project.designs.length - 1];

  return (
    <div className="px-6 pt-6 pb-28 max-w-screen-md mx-auto min-h-[100dvh]">
      {lastDesign && (
        <img
          src={lastDesign.url}
          alt={project.title}
          className="rounded-xl w-full h-auto mb-4"
        />
      )}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold">{project.title}</h1>
        {auth.currentUser?.uid === project.userId && (
          <button
            onClick={() => navigate(`/projects/${id}/submit-quote`)}
            className="px-3 py-1 rounded-full bg-gray-100 text-sm font-medium text-gray-800 border border-gray-300"
          >
            submit for quote
          </button>
        )}
      </div>
      <p className="text-gray-700 text-base mb-6 leading-snug">
        {project.description || 'No description provided.'}
      </p>

      <h2 className="text-lg font-semibold mb-2">Designs</h2>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {project.designs?.map((design, index) => (
          <img
            key={index}
            src={design.url}
            alt={`Design ${index + 1}`}
            className="rounded-lg aspect-square object-cover w-full"
          />
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-1">📝 Updates</h2>
      <ul className="text-sm text-gray-600 mb-6">
        {project.updates?.map((update, index) => (
          <li key={index} className="mb-1">
            {new Date(update.timestamp).toLocaleString()} - {update.message}
          </li>
        ))}
      </ul>

      <h2 className="text-lg font-semibold mb-2">Project Team</h2>
      <div className="flex items-center gap-4 overflow-x-auto pb-4">
        {teamMembers.map((user) => (
          <div key={user.id} className="flex flex-col items-center text-center shrink-0">
            <img
              src={user.avatar || 'https://randomuser.me/api/portraits/men/32.jpg'}
              alt={user.name || user.id}
              className="w-14 h-14 rounded-full mb-1"
            />
            <span className="text-sm font-medium">
              {user.id === auth.currentUser?.uid ? 'You' : user.name || user.id}
            </span>
            <span className="text-xs text-gray-500">{user.teamRole || user.role || 'Collaborator'}</span>
          </div>
        ))}
        <div className="flex flex-col items-center text-center shrink-0">
          <img
            src={iconLogo}
            alt="Arct AI"
            className="w-14 h-14 rounded-full mb-1"
          />
          <span className="text-sm font-medium">Arct</span>
          <span className="text-xs text-gray-500">AI</span>
        </div>
      </div>
    </div>
  );
}
