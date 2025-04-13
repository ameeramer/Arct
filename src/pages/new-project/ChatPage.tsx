import { useEffect, useRef, useState } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import logo from '/assets/arct-logo.svg';

const mockAIPath = '/src/assets/mock-ai-image.jpeg';
const mockAI2Path = '/src/assets/mock-ai-image-2.jpeg';
const mockUserUploadPath = '/src/assets/mock-user-upload.jpeg';

import { createProject, updateProject, getProject } from '../../services/projects';
import { auth } from '../../services/firebase';

type Message = {
  id: number;
  sender: 'assistant' | 'user';
  text: string;
  image?: string; // Added image property
  saved?: boolean; // Added saved property
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [savedAI1, setSavedAI1] = useState(false);
  const [savedAI2, setSavedAI2] = useState(false);
  const hasCreatedProject = useRef(false);

  useEffect(() => {
    const createInitialProject = async () => {
      if (hasCreatedProject.current) return;
      hasCreatedProject.current = true;
  
      console.log('createInitialProject (once)');
      const project = {
        title: 'Tropical Garden',
        updates: [],
        designs: [],
        userId: auth.currentUser?.uid || 'guest',
      };
      const id = await createProject(project);
      setProjectId(id);
    };
  
    createInitialProject();
  }, []);

  useEffect(() => {
    setMessages([
      {
        id: 1,
        sender: 'assistant',
        text: 'Hi! I’m Arct, your personal design assistant.',
      },
      {
        id: 2,
        sender: 'assistant',
        text: 'Let’s get started — I’ll ask a few quick questions to understand your vision.',
      },
      {
        id: 3,
        sender: 'assistant',
        text: 'Please describe your general idea.',
      },
    ]);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    const newUserMsg: Message = {
      id: messages.length + 1,
      sender: 'user',
      text: input,
    };
    const updatedMessages = [...messages, newUserMsg];

    if (step === null) {
      if (/add|change/i.test(input)) {
        const aiFollowup: Message = {
          id: updatedMessages.length + 1,
          sender: 'assistant',
          text: 'Sure, what do you think about this?',
        };
        const secondMockImage: Message = {
          id: updatedMessages.length + 2,
          sender: 'assistant',
          image: mockAI2Path,
          text: '[updated-design]',
        };
        updatedMessages.push(aiFollowup, secondMockImage);
      } else {
        updatedMessages.push({
          id: updatedMessages.length + 1,
          sender: 'assistant',
          text: 'Thanks for sharing your idea! To help bring it to life, could you upload a photo of the area you’d like to design?',
        });
        setStep('awaitingUpload');
      }
    }

    setMessages(updatedMessages);
    setInput('');
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <div className="flex items-start">
          <img src={logo} alt="AI" className="w-8 h-8 rounded-full mr-3" />
          <div className="max-w-xs px-4 py-2 rounded-2xl text-sm bg-gray-100 text-gray-800">
            Hi! I’m Arct, your personal design assistant.
          </div>
        </div>

        <div className="flex items-start">
          <img src={logo} alt="AI" className="w-8 h-8 rounded-full mr-3" />
          <div className="max-w-xs px-4 py-2 rounded-2xl text-sm bg-gray-100 text-gray-800">
            Let’s get started — I’ll ask a few quick questions to understand your vision.
          </div>
        </div>

        <div className="flex items-start">
          <img src={logo} alt="AI" className="w-8 h-8 rounded-full mr-3" />
          <div className="max-w-xs px-4 py-2 rounded-2xl text-sm bg-gray-100 text-gray-800">
            Please describe your general idea.
          </div>
        </div>

        <div className="flex justify-end items-start">
          <div className="max-w-xs px-4 py-2 rounded-2xl text-sm bg-black text-white">
            I’m imagining a lush tropical garden with tall palm trees, free-flowing paths, and a natural pool surrounded by stones and aquatic plants.
          </div>
          <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" className="w-8 h-8 rounded-full ml-3" />
        </div>

        <div className="flex items-start">
          <img src={logo} alt="AI" className="w-8 h-8 rounded-full mr-3" />
          <div className="max-w-xs px-4 py-2 rounded-2xl text-sm bg-gray-100 text-gray-800">
            Thanks for sharing your idea! To help bring it to life, could you upload a photo of the area you’d like to design?
          </div>
        </div>

        <div className="flex justify-end items-start">
          <div className="flex flex-col items-end">
            <img src={mockUserUploadPath} alt="User upload" className="rounded-xl max-w-xs" />
          </div>
          <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" className="w-8 h-8 rounded-full ml-3" />
        </div>

        <div className="flex items-start">
          <img src={logo} alt="AI" className="w-8 h-8 rounded-full mr-3" />
          <div className="max-w-xs px-4 py-2 rounded-2xl text-sm bg-gray-100 text-gray-800">
            Here is a design suggestion based on your idea:
          </div>
        </div>

        <div className="flex items-start">
          <img src={logo} alt="AI" className="w-8 h-8 rounded-full mr-3" />
          <div className="flex flex-col items-start">
            <img src={mockAIPath} alt="Design suggestion" className="rounded-xl max-w-xs" />
            <button
              onClick={async () => {
                if (!projectId) return;
                const existing = await getProject(projectId);
                if (!existing) return;
                const isSaved = savedAI1;
                const updatedDesigns = isSaved
                  ? existing.designs.filter((d) => d !== mockAIPath)
                  : [...existing.designs, mockAIPath];
                await updateProject({ ...existing, designs: updatedDesigns });
                setSavedAI1(!isSaved);
              }}
              className={`mt-2 flex items-center text-sm ${
                savedAI1 ? 'font-bold' : ''
              } text-black rounded-full border border-gray-300 px-3 py-1 hover:bg-gray-100 transition`}
            >
              <svg
                className={`w-4 h-4 mr-1 ${
                  savedAI1 ? 'fill-black' : 'fill-none stroke-black'
                }`}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 3a2 2 0 00-2 2v16l9-4 9 4V5a2 2 0 00-2-2H5z" />
              </svg>
              {savedAI1 ? 'Saved' : 'Save to project'}
            </button>
          </div>
        </div>

        <div className="flex justify-end items-start">
          <div className="max-w-xs px-4 py-2 rounded-2xl text-sm bg-black text-white">
            Add a cozy seating area with lounge chairs on the left side of the path, and place low garden lights along the path for ambiance.
          </div>
          <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" className="w-8 h-8 rounded-full ml-3" />
        </div>

        <div className="flex items-start">
          <img src={logo} alt="AI" className="w-8 h-8 rounded-full mr-3" />
          <div className="max-w-xs px-4 py-2 rounded-2xl text-sm bg-gray-100 text-gray-800">
            Sure, what do you think about this?
          </div>
        </div>

        <div className="flex items-start">
          <img src={logo} alt="AI" className="w-8 h-8 rounded-full mr-3" />
          <div className="flex flex-col items-start">
            <img src={mockAI2Path} alt="Design suggestion 2" className="rounded-xl max-w-xs" />
            <button
              onClick={async () => {
                if (!projectId) return;
                const existing = await getProject(projectId);
                if (!existing) return;
                const isSaved = savedAI2;
                const updatedDesigns = isSaved
                  ? existing.designs.filter((d) => d !== mockAI2Path)
                  : [...existing.designs, mockAI2Path];
                await updateProject({ ...existing, designs: updatedDesigns });
                setSavedAI2(!isSaved);
              }}
              className={`mt-2 flex items-center text-sm ${
                savedAI2 ? 'font-bold' : ''
              } text-black rounded-full border border-gray-300 px-3 py-1 hover:bg-gray-100 transition`}
            >
              <svg
                className={`w-4 h-4 mr-1 ${
                  savedAI2 ? 'fill-black' : 'fill-none stroke-black'
                }`}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 3a2 2 0 00-2 2v16l9-4 9 4V5a2 2 0 00-2-2H5z" />
              </svg>
              {savedAI2 ? 'Saved' : 'Save to project'}
            </button>
          </div>
        </div>
      </div>

      <div className="border-t p-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none"
          />
          <button onClick={handleSend} className="p-2 bg-black text-white rounded-full">
            <PaperAirplaneIcon className="h-5 w-5 rotate-45" />
          </button>
        </div>
      </div>
    </div>
  );
}
