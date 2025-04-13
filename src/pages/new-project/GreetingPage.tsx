import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import logo from '/assets/arct-logo.svg';


export default function GreetingPage() {
  const navigate = useNavigate();

  return (
    <div className="pb-60 sm:pb-40 flex flex-col items-center justify-center h-screen px-4 sm:px-6 text-center relative">
      <button
        className="absolute left-4 top-4 p-2"
        onClick={() => navigate(-1)}
        aria-label="Go back"
      >
        <ArrowLeftIcon className="h-6 w-6 sm:h-7 sm:w-7 text-gray-700" />
      </button>
      <img
        src={logo}
        alt="Arct logo"
        className="h-24 w-24 mb-6"
      />
      <h1 className="text-2xl sm:text-3xl font-semibold mb-4">Hi! I’m Arct, your personal design assistant.</h1>
      <p className="text-base sm:text-lg text-gray-600 max-w-md">
        Let’s get started — I’ll ask a few quick questions to understand your vision.
      </p>
      <div className="absolute bottom-6 left-0 w-full px-6">
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
