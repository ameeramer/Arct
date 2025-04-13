import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import logo from '/assets/arct-logo.svg';


export default function GreetingPage() {
  const navigate = useNavigate();

  return (
    <div className="pb-60 sm:pb-40 min-h-screen bg-white flex flex-col justify-between">
      <div className="px-4 py-3 sm:px-6 sm:py-4">
        <button onClick={() => navigate(-1)} className="text-xl sm:text-2xl">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="flex flex-col items-center justify-center px-6 text-center">
        <img src={logo} alt="Arct Logo" className="w-28 mb-8" />
        <h1 className="text-2xl sm:text-3xl font-semibold mb-4">Hi! I’m Arct, your personal design assistant.</h1>
      <p className="text-base sm:text-lg text-gray-600 max-w-md">
        Let’s get started — I’ll ask a few quick questions to understand your vision.
      </p>
      </div>

      <div className="px-4 py-3 sm:px-6 sm:py-4">
        <button
          onClick={() => navigate('/new-project/chat')}
          className="w-full bg-black text-white py-3 rounded-xl text-base sm:text-lg"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
