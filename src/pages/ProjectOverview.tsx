import React, { useState } from "react";
import { useProject } from "../context/ProjectContext";
import { useNavigate } from "react-router-dom";
import RoleSelectorModal from "../components/RoleSelectorModal";

const ProjectOverview: React.FC = () => {
  const { data, setData } = useProject();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const selected = data.designOptions.find(
    (d) => d.id === data.selectedDesignId
  );

  if (!selected) {
    return (
      <div className="text-center mt-20 text-gray-500">
        לא נבחר עיצוב עדיין.
        <br />
        <button
          onClick={() => navigate("/preview")}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
        >
          חזור לבחור עיצוב
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 text-right space-y-6">
      <h1 className="text-3xl font-bold text-green-700">פרויקט הגינה שלך</h1>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">העיצוב שנבחר:</h2>
        <div className="rounded shadow border">
          <img src={selected.image2d} alt="תצוגת דו-מימד" className="w-full" />
        </div>
        <div className="rounded shadow border">
          <img src={selected.image3d} alt="תצוגת תלת-מימד" className="w-full" />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded border">
        <h2 className="text-xl font-semibold mb-2">פרטי הפרויקט:</h2>
        <p><strong>גודל השטח:</strong> {data.size} מ״ר</p>
        <p><strong>מיקום:</strong> {data.location}</p>
        <p><strong>שימוש מיועד:</strong> {data.purpose}</p>
        <p><strong>תיאור:</strong> {data.description}</p>
      </div>

      <div className="bg-white p-4 rounded border shadow">
        <h2 className="text-xl font-semibold mb-2">סיכום מהבינה:</h2>
        <p>
          העיצוב שנבחר משלב את הרצונות שלך ל־{data.purpose}, בשטח של {data.size} מ״ר
          באזור {data.location}. הבינה זיהתה צורך בשילוב של אלמנטים טבעיים ונוחות –
          והוסיפה עצים אדומים לפי בקשתך.
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded border">
        <h2 className="text-xl font-semibold mb-4">הצוות של הפרויקט:</h2>
        <div className="flex gap-6 flex-wrap justify-start items-center">
          {/* "+" button */}
          <div
            onClick={() => setShowModal(true)}
            className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-600 cursor-pointer border-2 border-dashed hover:bg-gray-300 transition"
            title="הוסף תפקיד"
          >
            +
          </div>

          {/* Roles */}
          {(data.team || []).map((member, index) => (
            <div className="flex flex-col items-center space-y-1" key={index}>
              <div
                onClick={() =>
                  !member.assigned && navigate(`/search?role=${encodeURIComponent(member.role)}`)
                }
                className="w-20 h-20 rounded-full bg-white border flex items-center justify-center cursor-pointer hover:shadow-md transition relative overflow-hidden"
                title={member.role}
              >
                {!member.assigned ? (
                  <img
                    src="/avatar-placeholder-gray.png"
                    alt="אנונימי"
                    className="absolute inset-0 w-full h-full object-cover opacity-50 rounded-full"
                  />
                ) : (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setData({
                      ...data,
                      team: data.team.filter((_, i) => i !== index),
                    });
                  }}
                  className="absolute top-0 right-0 text-red-500 text-sm bg-white rounded-full w-5 h-5 flex items-center justify-center shadow hover:bg-red-100"
                  title="הסר תפקיד"
                >
                  ×
                </button>
              </div>
              <div className="text-sm font-medium">{member.role}</div>
            </div>
          ))}
        </div>
      </div>
      <RoleSelectorModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSelect={(role) => {
            setShowModal(false);
            setTimeout(() => {
              setData({
                ...data,
                team: [...(data.team || []), { role, assigned: false }],
            });
          }, 0);
        }}
      />
    </div>
  );
};

export default ProjectOverview;
