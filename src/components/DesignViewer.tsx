import React, { useState } from "react";
import { useProject } from "../context/ProjectContext";
import { useNavigate } from "react-router-dom";

const DesignViewer: React.FC = () => {
  const { data, setData } = useProject();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentDesign = data.designOptions[currentIndex];

  const handleSelect = () => {
    setData({ ...data, selectedDesignId: currentDesign?.id || null });
    navigate("/project");
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev < data.designOptions.length - 1 ? prev + 1 : prev
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 text-right space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">עיצוב ראשוני</h2>

      <div className="bg-gray-50 p-4 rounded-md border">
        <h3 className="text-lg font-semibold mb-2">פרטי הפרויקט שלך:</h3>
        <p><strong>גודל השטח:</strong> {data.size} מ״ר</p>
        <p><strong>מיקום:</strong> {data.location}</p>
        <p><strong>שימוש מיועד:</strong> {data.purpose}</p>
        <p><strong>תיאור:</strong> {data.description}</p>
        {data.photo && (
          <div className="mt-4">
            <p className="font-semibold mb-1">תמונה שהועלתה:</p>
            <img
              src={URL.createObjectURL(data.photo)}
              alt="תמונה שהמשתמש העלה"
              className="w-full max-h-64 object-contain border rounded-md"
            />
          </div>
        )}
      </div>

      {currentDesign && (
        <>
          <div>
            <h3 className="text-lg font-semibold mb-2">תצוגת דו-מימד</h3>
            <div className="border rounded-md overflow-hidden shadow-md">
              <img
                src={currentDesign.image2d}
                alt="תוכנית דו-מימדית"
                className="w-full h-auto"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">תצוגת תלת-מימד</h3>
            <div className="border rounded-md overflow-hidden shadow-md">
              <img
                src={currentDesign.image3d}
                alt="הדמיה תלת-מימדית"
                className="w-full h-auto"
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
            >
              ◀ הקודם
            </button>

            <button
              onClick={handleSelect}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded"
            >
              בחר עיצוב זה
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === data.designOptions.length - 1}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
            >
              הבא ▶
            </button>
          </div>
        </>
      )}

      {!currentDesign && (
        <p className="text-gray-500 text-center mt-10">
          עדיין לא נוספו עיצובים.
        </p>
      )}
    </div>
  );
};

export default DesignViewer;
