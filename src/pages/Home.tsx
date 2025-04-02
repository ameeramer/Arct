import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleFormClick = () => {
    navigate("/form");
  };

  const handleProjectsClick = () => {
    navigate("/projects");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 space-y-4">
      <button
        onClick={handleFormClick}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg text-xl"
      >
        לתחילת תכנון הגינה שלך
      </button>
      <button
        onClick={handleProjectsClick}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg text-xl"
      >
        הפרויקטים שלי
      </button>
    </div>
  );
};

export default HomePage;