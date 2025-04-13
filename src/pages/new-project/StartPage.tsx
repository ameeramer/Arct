import { useNavigate } from 'react-router-dom';
import logo from '/assets/arct-logo.svg'; // ודא שקובץ הלוגו במיקום הזה או שנה בהתאם

export default function NewProjectIntro() {
  const navigate = useNavigate();

  return (
    <div className="pb-60 sm:pb-40 min-h-screen bg-white flex flex-col justify-between">
      <div className="px-4 py-3 sm:px-6 sm:py-4">
        <button onClick={() => navigate(-1)} className="text-xl sm:text-2xl">←</button>
      </div>

      <div className="flex flex-col items-center justify-center px-6 text-center">
        <img src={logo} alt="Arct Logo" className="w-28 mb-8" />
        <h1 className="text-2xl sm:text-3xl font-semibold leading-snug">
          Let’s bring<br />your<br />idea to life
        </h1>
      </div>

      <div className="px-4 py-3 sm:px-6 sm:py-4">
        <button
          onClick={() => navigate('/new-project/greeting')}
          className="w-full bg-black text-white py-3 rounded-xl text-base sm:text-lg"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
