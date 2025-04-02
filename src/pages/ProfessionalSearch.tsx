import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ProfessionalProfileModal from "../components/ProfessionalProfileModal";

const professionals = [
  {
    id: "1",
    name: "דניאל כהן",
    expertise: "אדריכל נוף",
    profileImage: "/public/avatars/daniel.jpg",
    shortBio: "מומחה בתכנון חצרות וגינות עירוניות.",
    bio: "אני אדריכל נוף עם מעל 10 שנות ניסיון בתכנון גינות עירוניות ופרטיות. אני אוהב לשלב אלמנטים טבעיים עם עיצוב מודרני.",
    posts: [
      { image: "/public/projects/p1.jpg", caption: "הקמה של גינה בתל אביב" },
      { image: "/public/projects/p2.jpg", caption: "עיצוב מרפסת ללקוח פרטי" },
    ],
    projects: ["/public/projects/p1.jpg", "/public/projects/p2.jpg"],
  },
  {
    id: "2",
    name: "שירה לוי",
    expertise: "אדריכל נוף",
    profileImage: "/public/avatars/shira.jpg",
    shortBio: "אוהבת עיצוב עם צבעים טבעיים וצמחים מקומיים.",
    bio: "מאז 2012 אני עוסקת באדריכלות נוף עם דגש על קיימות וצמחייה מקומית. אני נהנית ליצור גינות אישיות ומרגשות.",
    posts: [
      { image: "/public/projects/p3.jpg", caption: "הקמה של גינה בתל אביב" },
    ],
    projects: ["/public/projects/p3.jpg"],
  },
  {
    id: "3",
    name: "איתן בר",
    expertise: "אדריכל נוף",
    profileImage: "/public/avatars/eitan.jpg",
    shortBio: "מתמחה בפרויקטים כפריים עם ניחוח אישי.",
    bio: "אני מתמחה בתכנון חצרות כפריות עם אופי אישי. עבדתי עם לקוחות במושבים ובבתי נופש כדי ליצור מרחבים חמימים ונעימים.",
    posts: [
    ],
    projects: [],
  },
];

const ProfessionalSearch: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPro, setSelectedPro] = useState<any | null>(null);

  const role = searchParams.get("role");

  return (
    <div className="max-w-3xl mx-auto p-6 text-right">
      <h1 className="text-2xl font-bold mb-4">
        בחר {role || "בעל מקצוע"} לפרויקט שלך
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {professionals.map((pro) => (
          <div
            key={pro.id}
            onClick={() => {
              setSelectedPro(pro);
              setModalOpen(true);
            }}
            className="cursor-pointer border rounded-lg overflow-hidden bg-white shadow hover:shadow-lg transition"
          >
            <div className="flex items-center p-4">
              <img
                src={pro.profileImage}
                alt={pro.name}
                className="w-16 h-16 rounded-full object-cover ml-4"
              />
              <div className="text-right">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-lg">{pro.name}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/chat/${pro.id}`);
                    }}
                    className="text-green-600 hover:text-green-800 text-xl ml-2"
                    title="צור קשר"
                  >
                    💬
                  </button>
                </div>
                <p className="text-sm text-gray-500">{pro.expertise}</p>
              </div>
            </div>
            <div className="px-4 text-right text-sm text-gray-600">{pro.shortBio}</div>
            {pro.projects.length > 0 && (
              <div className="flex gap-2 p-4 pt-2">
                {pro.projects.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`פרויקט ${i + 1}`}
                    className="w-16 h-16 object-cover rounded"
                  />
                ))}
              </div>
            )}
            <div className="px-4 pb-4 mt-2 text-left">
              {/* Removed duplicate 💬 button */}
            </div>
          </div>
        ))}
      </div>
      <ProfessionalProfileModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        professional={selectedPro}
      />
    </div>
  );
};

export default ProfessionalSearch;
