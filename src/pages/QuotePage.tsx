import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import JoinRequestModal from '../components/modals/JoinRequestModal';
import { sendJoinRequest, getJoinRequestsByUserForProject } from '../services/requests';
import { QuoteWithId } from '../services/quotes';
import { Project } from '../services/projects';
import iconLogo from '/assets/arct-logo.svg';

export default function QuotePage() {
  const { id } = useParams();
  const [quote, setQuote] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [currentUserData, setCurrentUserData] = useState<any>(null);

  useEffect(() => {
    const fetchQuoteAndProject = async () => {
      if (!id) return;
      const quoteSnap = await getDoc(doc(db, 'quotes', id));
      if (!quoteSnap.exists()) return;
      const quoteData = { id: quoteSnap.id, ...quoteSnap.data() } as QuoteWithId;
      setQuote(quoteData);

      const projectSnap = await getDoc(doc(db, 'projects', quoteData.projectId));
      if (!projectSnap.exists()) return;
      const projectData = { id: projectSnap.id, ...projectSnap.data() } as Project;
      setProject(projectData);

      if (auth.currentUser) {
        const currentUserSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (currentUserSnap.exists()) {
          setCurrentUserData(currentUserSnap.data());
        }

        const requests = await getJoinRequestsByUserForProject(auth.currentUser.uid, projectData.id);
        if (requests.length > 0) setHasRequested(true);
      }

      const members = await Promise.all(
        (projectData.team || []).map(async (member: any) => {
          const userSnap = await getDoc(doc(db, 'users', member.userId));
          return userSnap.exists()
            ? { id: member.userId, role: member.role, ...userSnap.data() }
            : null;
        })
      );
      const validMembers = members.filter(Boolean);
      const ownerSnap = await getDoc(doc(db, 'users', projectData.userId));
      const owner = ownerSnap.exists()
        ? { id: projectData.userId, role: 'Owner', ...ownerSnap.data() }
        : null;

      const arct = {
        id: 'arct-bot',
        name: 'Arct',
        role: 'AI',
        avatar: iconLogo,
      };

      setTeamMembers([...(owner ? [owner] : []), arct, ...validMembers]);
    };

    fetchQuoteAndProject();
  }, [id]);

  const handleSendRequest = async (message: string) => {
    const fromUser = auth.currentUser;
    if (!fromUser || !project || !quote) return;
    await sendJoinRequest(fromUser.uid, project.userId, project.id, quote.id, message);
    setHasRequested(true);
  };

  if (!quote || !project) return <div className="p-4">Loading...</div>;

  const userId = auth.currentUser?.uid;
  const isInTeam = project.team?.some((m: any) => m.userId === userId);

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
      <img
        src={project.designs?.[project.designs.length - 1]?.url || '/placeholder.jpg'}
        alt="project"
        className="w-full h-64 object-cover rounded-xl mb-6"
      />

      <h1 className="text-2xl font-semibold mb-2">{project.title}</h1>
      <p className="text-gray-700 mb-4">{project.description}</p>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Designs</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {project.designs?.map((design: any, index: number) => (
            <img
              key={index}
              src={design.url}
              alt={`Design ${index + 1}`}
              className="rounded-lg aspect-square object-cover w-full"
            />
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-600">Looking for a</span>
          <span className={`text-sm px-3 py-1 rounded-full ${getTagColor(quote.tag)}`}>
            {quote.tag}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Price range:</span>
          <span className={`text-sm px-3 py-1 rounded-full ${getTagColor(quote.tag)}`}>
            {quote.priceRange}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Project Team</h2>
        <div className="flex items-center gap-4">
          {teamMembers.map((user) => (
            <div key={user.id} className="flex flex-col items-center">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-12 h-12 rounded-full mb-1"
              />
              <span className="text-xs">{user.name}</span>
              <span className="text-[10px] text-gray-500">{user.role}</span>
            </div>
          ))}
          {!isInTeam && userId && !hasRequested && (
            <div
              className="flex flex-col items-center opacity-50 cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              <img
                src={currentUserData?.avatar || '/placeholder.jpg'}
                alt="you"
                className="w-12 h-12 rounded-full mb-1"
              />
              <span className="text-xs">You</span>
              <span className="text-xs italic text-gray-500">Request Join</span>
            </div>
          )}
          {!isInTeam && userId && hasRequested && (
            <div className="flex flex-col items-center opacity-60">
              <img
                src={currentUserData?.avatar || '/placeholder.jpg'}
                alt="you"
                className="w-12 h-12 rounded-full mb-1"
              />
              <span className="text-xs">You</span>
              <span className="text-xs italic text-gray-500">Request Sent</span>
            </div>
          )}
        </div>
      </div>

      <JoinRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSendRequest}
      />
    </div>
  );
}
